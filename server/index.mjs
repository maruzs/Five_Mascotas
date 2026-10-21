import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import webpush from 'web-push';
import { nexoEnabled, nexoConfigured, nexoCatalogData, nexoCheckout, nexoRequest } from './nexo.mjs';
import { checkRateLimit, handleRayoNutritionalChat } from './rayo.mjs';
import {
  createWebpayTransaction,
  commitWebpayTransaction,
  createKhipuPayment,
  verifyKhipuPayment,
  verifyOrderAmountZeroTrust,
  getWebpayConfig,
  getKhipuConfig,
} from './payments.mjs';
import { defaultShippingRates } from './shipping.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data');
const PORT = Number(process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3004));

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const cmsFilePath = path.join(dataDir, 'cms.json');
const pimFilePath = path.join(dataDir, 'pim.json');
const usersFilePath = path.join(dataDir, 'users.json');
const ordersFilePath = path.join(dataDir, 'orders.json');
const pushSubsFilePath = path.join(dataDir, 'push-subscriptions.json');
const vapidKeysFilePath = path.join(dataDir, 'vapid-keys.json');

const getDefaultOrders = () => ({ orders: [] });

// In-memory session store (sessionId -> { userId, email, role, name, expiresAt })
const sessionStore = new Map();
const checkoutAttempts = new Map();

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

// Security headers (same as nginx.conf)
const setSecurityHeaders = (res) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
};

import { defaultTickers, defaultBanners, defaultHeroSlides, defaultProducts } from './seed-data.mjs';

// Default seed data
const getDefaultCms = () => ({
  tickers: [...defaultTickers],
  banners: [...defaultBanners],
  heroSlides: [...defaultHeroSlides],
});

const getDefaultPim = () => ({
  products: [...defaultProducts],
});

// Cryptographic Password Hashing using Scrypt (Argon2 / Scrypt standard)
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
};

const verifyPassword = (password, combined) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = (combined || '').split(':');
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(key, 'hex');
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
};

const getDefaultUsers = async () => {
  // Pre-seed default admin user (fiveadmin / Five2026!Mascotas)
  const adminPasswordHash = await hashPassword('Five2026!Mascotas');
  return {
    users: [
      {
        id: 'usr-admin-01',
        email: 'admin@fivemascotas.cl',
        passwordHash: adminPasswordHash,
        name: 'Administrador FIVE',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ],
  };
};

// Read / Write helpers
const readJsonFile = async (filePath, defaultFn) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = await fsp.readFile(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[API] Error reading ${filePath}, falling back to defaults:`, err.message);
  }
  const fallback = await defaultFn();
  await writeJsonFile(filePath, fallback);
  return fallback;
};

const writeJsonFile = async (filePath, data) => {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fsp.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmpPath, filePath);
};

// Web Push VAPID configuration & persistence
let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@fivemascotas.cl';

const initVapidKeys = async () => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    try {
      if (fs.existsSync(vapidKeysFilePath)) {
        const raw = await fsp.readFile(vapidKeysFilePath, 'utf8');
        const saved = JSON.parse(raw);
        vapidPublicKey = saved.publicKey;
        vapidPrivateKey = saved.privateKey;
      }
    } catch (e) {
      console.warn('[VAPID] Advertencia al leer llaves guardadas:', e.message);
    }
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    const generated = webpush.generateVAPIDKeys();
    vapidPublicKey = generated.publicKey;
    vapidPrivateKey = generated.privateKey;
    try {
      await fsp.writeFile(vapidKeysFilePath, JSON.stringify({
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey,
        createdAt: new Date().toISOString(),
      }, null, 2), 'utf8');
      console.log('[VAPID] Llaves generadas y guardadas en data/vapid-keys.json');
    } catch (err) {
      console.error('[VAPID] Error al guardar llaves generadas:', err.message);
    }
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    console.log('[Web Push] VAPID configurado exitosamente.');
  } catch (err) {
    console.error('[Web Push] Error configurando VAPID:', err.message);
  }
};

await initVapidKeys();

const getDefaultPushSubscriptions = () => ({ subscriptions: [] });

const getPushSubscriptions = async () => {
  return readJsonFile(pushSubsFilePath, getDefaultPushSubscriptions);
};

const savePushSubscriptions = async (data) => {
  return writeJsonFile(pushSubsFilePath, data);
};

const sendPushNotificationToAdmins = async (payload) => {
  try {
    const data = await getPushSubscriptions();
    if (!data.subscriptions || data.subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const payloadStr = JSON.stringify(payload);
    let sent = 0;
    const deadEndpoints = [];

    await Promise.all(
      data.subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payloadStr);
          sent++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            deadEndpoints.push(sub.endpoint);
          } else {
            console.warn('[Web Push] Advertencia de entrega:', err.message);
          }
        }
      })
    );

    if (deadEndpoints.length > 0) {
      data.subscriptions = data.subscriptions.filter(s => !deadEndpoints.includes(s.endpoint));
      await savePushSubscriptions(data);
    }

    return { sent, failed: deadEndpoints.length };
  } catch (err) {
    console.error('[Web Push] Error en difusión Push:', err.message);
    return { sent: 0, failed: 0, error: err.message };
  }
};

// Parse JSON or URL-encoded body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!raw) return resolve({});
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(raw);
          const obj = {};
          for (const [key, val] of params.entries()) {
            obj[key] = val;
          }
          return resolve(obj);
        }
        resolve(JSON.parse(raw));
      } catch (e) {
        try {
          const params = new URLSearchParams(raw);
          const obj = {};
          for (const [key, val] of params.entries()) {
            obj[key] = val;
          }
          if (Object.keys(obj).length > 0) return resolve(obj);
        } catch {}
        reject(new Error('Invalid payload format'));
      }
    });
    req.on('error', reject);
  });
};

// Server instance
const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/nexo/status' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    if (nexoConfigured() && !nexoEnabled()) { res.writeHead(503); res.end(JSON.stringify({ error: 'Integración incompleta.' })); return; }
    res.end(JSON.stringify({ enabled: nexoEnabled() })); return;
  }
  const quotePdf = pathname.match(/^\/api\/nexo\/quotations\/([a-f0-9-]{36})\/pdf$/i);
  if (quotePdf && req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    // The random checkout key is a document access capability. It is not a public folio.
    if (!nexoEnabled()) { res.writeHead(503); res.end(); return; }
    try {
      const upstream = await nexoRequest(`integrations/storefront/${encodeURIComponent(process.env.NEXO_STORE)}/quotations/${quotePdf[1]}/pdf`);
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition',upstream.headers.get('content-disposition') || 'attachment; filename="cotizacion.pdf"');
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) { res.writeHead(error.status || 503); res.end('Documento no disponible.'); }
    return;
  }
  if (pathname === '/api/nexo/checkout') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    if (!nexoEnabled()) { res.writeHead(503); res.end(JSON.stringify({ error: 'Integración Nexo no configurada.' })); return; }
    if (req.method !== 'POST') { res.writeHead(405); res.end('{}'); return; }
    const origin = req.headers.origin;
    const allowedOrigin = process.env.PUBLIC_SITE_URL || (process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}` : '');
    if (!origin || origin !== allowedOrigin) { res.writeHead(403); res.end(JSON.stringify({ error: 'Origen no autorizado.' })); return; }
    if (!/^application\/json\b/.test(req.headers['content-type'] || '')) { res.writeHead(415); res.end('{}'); return; }
    const now = Date.now(), ip = req.socket.remoteAddress;
    for (const [address, attempt] of checkoutAttempts) if (attempt.until < now) checkoutAttempts.delete(address);
    const attempt = checkoutAttempts.get(ip) || { count: 0, until: now+300000 };
    attempt.count++; checkoutAttempts.set(ip, attempt);
    if (attempt.count > 60) { res.writeHead(429); res.end(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta en unos minutos.' })); return; }
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key)) { res.writeHead(400); res.end(JSON.stringify({ error: 'Clave de reintento inválida.' })); return; }
    try {
      const result = await nexoCheckout(await parseBody(req), key);
      res.writeHead(200); res.end(JSON.stringify(result));
    } catch (error) { res.writeHead(error.status || 503); res.end(JSON.stringify({ error: error.message })); }
    return;
  }

  // CORS headers for local dev convenience
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // =========================================================================
  // PASARELAS DE PAGO CHILENAS (TRANSBANK WEBPAY PLUS & KHIPU)
  // =========================================================================

  // GET /api/payments/config — Estado de configuración de pasarelas
  if (pathname === '/api/payments/config' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const webpay = getWebpayConfig();
    const khipu = getKhipuConfig();

    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      webpay: {
        enabled: true,
        environment: webpay.isProduction ? 'PRODUCCION' : 'INTEGRACION',
        commerceCode: webpay.commerceCode,
      },
      khipu: {
        enabled: true,
        configured: khipu.isConfigured,
      },
      manualTransfer: {
        enabled: true,
      },
    }));
    return;
  }

  // POST /api/payments/webpay/create — Inicia transacción Webpay Plus
  if (pathname === '/api/payments/webpay/create') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
      return;
    }

    try {
      const body = await parseBody(req);
      const { orderCode, items, shippingRateId, customer, amount } = body;

      if (!orderCode) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Código de pedido requerido' }));
        return;
      }

      // Zero-Trust: verificación del catálogo oficial en el servidor
      let catalogProducts = [];
      let shippingRatesMap = null;
      if (nexoConfigured() && nexoEnabled()) {
        try {
          const nexoData = await nexoCatalogData();
          catalogProducts = nexoData.products;
          shippingRatesMap = nexoData.shippingRates;
        } catch {
          const pim = await readJsonFile(pimFilePath, getDefaultPim);
          catalogProducts = pim.products || [];
        }
      } else {
        const pim = await readJsonFile(pimFilePath, getDefaultPim);
        catalogProducts = pim.products || [];
      }

      let verifiedOrder;
      if (Array.isArray(items) && items.length > 0) {
        verifiedOrder = verifyOrderAmountZeroTrust({
          items,
          shippingRateId,
          catalogProducts,
          shippingRates: shippingRatesMap || defaultShippingRates,
        });

        if (amount && Number(amount) !== verifiedOrder.calculatedTotal) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            ok: false,
            error: `El monto enviado (${amount}) no coincide con el cálculo del servidor (${verifiedOrder.calculatedTotal}).`,
          }));
          return;
        }
      } else {
        const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
        const existingOrder = ordersData.orders.find((o) => o.code === orderCode);
        if (!existingOrder) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Pedido no encontrado para calcular monto' }));
          return;
        }
        verifiedOrder = {
          calculatedTotal: Number(existingOrder.totalTransfer || existingOrder.total || existingOrder.totalDebit || 0),
          subtotal: Number(existingOrder.subtotal || 0),
          shippingFee: Number(existingOrder.shippingFee || 0),
          verifiedItems: existingOrder.items || [],
        };
      }

      const totalAmount = verifiedOrder.calculatedTotal;
      if (totalAmount <= 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Monto total inválido' }));
        return;
      }

      const siteUrl = process.env.PUBLIC_SITE_URL || `http://${req.headers.host || 'localhost:3004'}`;
      const returnUrl = `${siteUrl.replace(/\/$/, '')}/api/payments/webpay/commit`;
      const sessionId = crypto.randomBytes(16).toString('hex');

      const webpayResult = await createWebpayTransaction({
        orderCode,
        amount: totalAmount,
        sessionId,
        returnUrl,
      });

      // Persistir orden localmente con estado PENDING_WEBPAY
      const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
      const existingIdx = ordersData.orders.findIndex((o) => o.code === orderCode);
      const orderRecord = {
        code: orderCode,
        customerName: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        city: customer?.city || '',
        address: customer?.address || '',
        notes: customer?.notes || '',
        items: verifiedOrder.verifiedItems,
        subtotal: verifiedOrder.subtotal,
        shippingFee: verifiedOrder.shippingFee,
        totalTransfer: totalAmount,
        totalDebit: totalAmount,
        paymentMethod: 'Webpay Plus',
        paymentStatus: 'PENDING_WEBPAY',
        webpayToken: webpayResult.token,
        webpaySessionId: sessionId,
        status: 'Recibido',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        ordersData.orders[existingIdx] = { ...ordersData.orders[existingIdx], ...orderRecord };
      } else {
        ordersData.orders.unshift({ ...orderRecord, createdAt: new Date().toISOString() });
      }
      await writeJsonFile(ordersFilePath, ordersData);

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        token: webpayResult.token,
        url: webpayResult.url,
        orderCode,
        amount: totalAmount,
      }));
    } catch (err) {
      console.error('[Webpay Create Error]', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err.message || 'Error al iniciar Webpay Plus' }));
    }
    return;
  }

  // GET/POST /api/payments/webpay/commit — Retorno de Webpay Plus
  if (pathname === '/api/payments/webpay/commit') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    try {
      let tokenWs = null;
      let tbkToken = null;
      let tbkOrdenCompra = null;

      if (req.method === 'POST') {
        const body = await parseBody(req);
        tokenWs = body.token_ws || parsedUrl.searchParams.get('token_ws');
        tbkToken = body.TBK_TOKEN || parsedUrl.searchParams.get('TBK_TOKEN');
        tbkOrdenCompra = body.TBK_ORDEN_COMPRA || parsedUrl.searchParams.get('TBK_ORDEN_COMPRA');
      } else {
        tokenWs = parsedUrl.searchParams.get('token_ws');
        tbkToken = parsedUrl.searchParams.get('TBK_TOKEN');
        tbkOrdenCompra = parsedUrl.searchParams.get('TBK_ORDEN_COMPRA');
      }

      const siteUrl = process.env.PUBLIC_SITE_URL || `http://${req.headers.host || 'localhost:3004'}`;
      const cleanSiteUrl = siteUrl.replace(/\/$/, '');

      // Caso de cancelación / anulación por usuario en Transbank
      if (tbkToken && !tokenWs) {
        console.warn(`[Webpay Commit] Transacción anulada por el usuario (TBK_TOKEN: ${tbkToken}, orden: ${tbkOrdenCompra})`);

        if (tbkOrdenCompra) {
          const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
          const order = ordersData.orders.find((o) => o.code === tbkOrdenCompra || o.webpayToken === tbkToken);
          if (order) {
            order.paymentStatus = 'ABORTED';
            order.status = 'Pago Cancelado';
            order.updatedAt = new Date().toISOString();
            await writeJsonFile(ordersFilePath, ordersData);
          }
        }

        const redirectUrl = `${cleanSiteUrl}/rastreo?codigo=${encodeURIComponent(tbkOrdenCompra || '')}&payment=webpay_aborted`;
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      }

      if (!tokenWs) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<h3>Error: No se recibió token de transacción de Webpay.</h3><p><a href="/rastreo">Ir a Rastreo</a></p>');
        return;
      }

      // Confirmación oficial con Transbank Webpay
      const commitResult = await commitWebpayTransaction(tokenWs);
      const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
      const order = ordersData.orders.find(
        (o) => o.code === commitResult.buyOrder || o.webpayToken === tokenWs
      );

      if (commitResult.approved) {
        if (order) {
          order.status = 'Pago Confirmado';
          order.paymentStatus = 'PAID';
          order.paymentMethod = 'Webpay Plus';
          order.paymentDetails = {
            authorizationCode: commitResult.authorizationCode,
            amount: commitResult.amount,
            cardNumber: commitResult.cardNumber,
            transactionDate: commitResult.transactionDate,
            paymentTypeCode: commitResult.paymentTypeCode,
            responseCode: commitResult.data?.response_code ?? 0,
          };
          order.updatedAt = new Date().toISOString();
          await writeJsonFile(ordersFilePath, ordersData);

          // Notificación Push a administradores
          sendPushNotificationToAdmins({
            title: `Pago Aprobado Webpay #${order.code}`,
            body: `${order.customerName || 'Cliente'} pagó ${Number(commitResult.amount).toLocaleString('es-CL')} con Webpay Plus.`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `payment-${order.code}`,
            data: { url: `/rastreo?codigo=${order.code}`, code: order.code },
          }).catch((e) => console.warn('[Push Alert Error]', e.message));
        }

        const redirectUrl = `${cleanSiteUrl}/rastreo?codigo=${encodeURIComponent(commitResult.buyOrder)}&payment=webpay_approved`;
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      } else {
        if (order) {
          order.status = 'Pago Rechazado';
          order.paymentStatus = 'REJECTED';
          order.paymentDetails = {
            responseCode: commitResult.data?.response_code,
            transactionDate: commitResult.transactionDate,
          };
          order.updatedAt = new Date().toISOString();
          await writeJsonFile(ordersFilePath, ordersData);
        }

        const respCode = commitResult.data?.response_code ?? -1;
        const redirectUrl = `${cleanSiteUrl}/rastreo?codigo=${encodeURIComponent(commitResult.buyOrder)}&payment=webpay_rejected&code=${respCode}`;
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      }
    } catch (err) {
      console.error('[Webpay Commit Exception]', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<h3>Error al procesar retorno de Webpay: ${err.message}</h3><p><a href="/rastreo">Volver a la tienda</a></p>`);
    }
    return;
  }

  // POST /api/payments/khipu/create — Inicia cobro automatizado en Khipu v3
  if (pathname === '/api/payments/khipu/create') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
      return;
    }

    try {
      const body = await parseBody(req);
      const { orderCode, items, shippingRateId, customer, amount } = body;

      if (!orderCode) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Código de pedido requerido' }));
        return;
      }

      // Verificación Zero-Trust de montos en el servidor
      let catalogProducts = [];
      let shippingRatesMap = null;
      if (nexoConfigured() && nexoEnabled()) {
        try {
          const nexoData = await nexoCatalogData();
          catalogProducts = nexoData.products;
          shippingRatesMap = nexoData.shippingRates;
        } catch {
          const pim = await readJsonFile(pimFilePath, getDefaultPim);
          catalogProducts = pim.products || [];
        }
      } else {
        const pim = await readJsonFile(pimFilePath, getDefaultPim);
        catalogProducts = pim.products || [];
      }

      let verifiedOrder;
      if (Array.isArray(items) && items.length > 0) {
        verifiedOrder = verifyOrderAmountZeroTrust({
          items,
          shippingRateId,
          catalogProducts,
          shippingRates: shippingRatesMap || defaultShippingRates,
        });

        if (amount && Number(amount) !== verifiedOrder.calculatedTotal) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            ok: false,
            error: `El monto enviado (${amount}) no coincide con el cálculo del servidor (${verifiedOrder.calculatedTotal}).`,
          }));
          return;
        }
      } else {
        const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
        const existingOrder = ordersData.orders.find((o) => o.code === orderCode);
        if (!existingOrder) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Pedido no encontrado para calcular monto' }));
          return;
        }
        verifiedOrder = {
          calculatedTotal: Number(existingOrder.totalTransfer || existingOrder.total || existingOrder.totalDebit || 0),
          subtotal: Number(existingOrder.subtotal || 0),
          shippingFee: Number(existingOrder.shippingFee || 0),
          verifiedItems: existingOrder.items || [],
        };
      }

      const totalAmount = verifiedOrder.calculatedTotal;
      const siteUrl = process.env.PUBLIC_SITE_URL || `http://${req.headers.host || 'localhost:3004'}`;
      const cleanSiteUrl = siteUrl.replace(/\/$/, '');

      const returnUrl = `${cleanSiteUrl}/rastreo?codigo=${encodeURIComponent(orderCode)}&payment=khipu_success`;
      const cancelUrl = `${cleanSiteUrl}/rastreo?codigo=${encodeURIComponent(orderCode)}&payment=khipu_cancel`;
      const notifyUrl = `${cleanSiteUrl}/api/payments/khipu/webhook`;

      const khipuResult = await createKhipuPayment({
        orderCode,
        amount: totalAmount,
        customer,
        returnUrl,
        cancelUrl,
        notifyUrl,
      });

      // Persistir orden con estado PENDING_KHIPU
      const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
      const existingIdx = ordersData.orders.findIndex((o) => o.code === orderCode);
      const orderRecord = {
        code: orderCode,
        customerName: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        city: customer?.city || '',
        address: customer?.address || '',
        notes: customer?.notes || '',
        items: verifiedOrder.verifiedItems,
        subtotal: verifiedOrder.subtotal,
        shippingFee: verifiedOrder.shippingFee,
        totalTransfer: totalAmount,
        totalDebit: totalAmount,
        paymentMethod: 'Khipu',
        paymentStatus: 'PENDING_KHIPU',
        khipuPaymentId: khipuResult.paymentId,
        status: 'Recibido',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        ordersData.orders[existingIdx] = { ...ordersData.orders[existingIdx], ...orderRecord };
      } else {
        ordersData.orders.unshift({ ...orderRecord, createdAt: new Date().toISOString() });
      }
      await writeJsonFile(ordersFilePath, ordersData);

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        paymentId: khipuResult.paymentId,
        paymentUrl: khipuResult.paymentUrl,
        orderCode,
        amount: totalAmount,
      }));
    } catch (err) {
      console.error('[Khipu Create Error]', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err.message || 'Error al iniciar Khipu' }));
    }
    return;
  }

  // POST /api/payments/khipu/webhook — Webhook asíncrono con idempotencia
  if (pathname === '/api/payments/khipu/webhook') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
      return;
    }

    try {
      const body = await parseBody(req);
      const paymentId = body.payment_id || body.notification_token || parsedUrl.searchParams.get('payment_id');

      if (!paymentId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'payment_id requerido' }));
        return;
      }

      // Verificación directa e independiente contra la API de Khipu
      const verification = await verifyKhipuPayment(paymentId);
      if (!verification.verified) {
        console.warn(`[Khipu Webhook] Pago ${paymentId} no verificado o pendiente: ${verification.status}`);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, status: verification.status, verified: false }));
        return;
      }

      const ordersData = await readJsonFile(ordersFilePath, getDefaultOrders);
      const order = ordersData.orders.find(
        (o) => o.khipuPaymentId === paymentId || o.code === verification.transactionId
      );

      if (!order) {
        console.warn(`[Khipu Webhook] No se encontró orden para payment_id ${paymentId}`);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, warning: 'Orden no encontrada' }));
        return;
      }

      // Idempotencia: si ya está pagada, retornar 200 sin duplicar efectos
      if (order.status === 'Pago Confirmado' && order.paymentStatus === 'PAID') {
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, idempotency: true, message: 'Pago ya confirmado previamente' }));
        return;
      }

      order.status = 'Pago Confirmado';
      order.paymentStatus = 'PAID';
      order.paymentMethod = 'Khipu';
      order.paymentDetails = {
        khipuPaymentId: paymentId,
        amount: verification.amount,
        verifiedAt: new Date().toISOString(),
      };
      order.updatedAt = new Date().toISOString();
      await writeJsonFile(ordersFilePath, ordersData);

      // Notificación Push a administradores
      sendPushNotificationToAdmins({
        title: `Pago Confirmado Khipu #${order.code}`,
        body: `${order.customerName || 'Cliente'} transfirió ${Number(verification.amount || order.totalTransfer).toLocaleString('es-CL')} vía Khipu.`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `payment-${order.code}`,
        data: { url: `/rastreo?codigo=${order.code}`, code: order.code },
      }).catch((e) => console.warn('[Push Alert Error]', e.message));

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, message: 'Pago verificado y orden confirmada exitosamente' }));
    } catch (err) {
      console.error('[Khipu Webhook Exception]', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // API ROUTE: /api/cms
  if (pathname === '/api/cms') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'GET') {
      try {
        const data = await readJsonFile(cmsFilePath, getDefaultCms);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        const current = await readJsonFile(cmsFilePath, getDefaultCms);
        const updated = {
          tickers: Array.isArray(body.tickers) ? body.tickers : current.tickers,
          banners: Array.isArray(body.banners) ? body.banners : current.banners,
          heroSlides: Array.isArray(body.heroSlides) ? body.heroSlides : current.heroSlides,
          updatedAt: new Date().toISOString(),
        };
        await writeJsonFile(cmsFilePath, updated);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data: updated }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }
  // API ROUTE: /api/pim/images — list available packshots in public/products/
  if (pathname === '/api/pim/images') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (req.method === 'GET') {
      try {
        const productsDir = path.join(rootDir, 'public', 'products');
        const distProductsDir = path.join(distDir, 'products');
        // Read from both public and dist (prioritize public for dev, dist for prod)
        const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
        const readDir = async (dir) => {
          try {
            const files = await fsp.readdir(dir);
            return files.filter(f => ALLOWED_EXT.includes(path.extname(f).toLowerCase()));
          } catch { return []; }
        };
        const [publicFiles, distFiles] = await Promise.all([readDir(productsDir), readDir(distProductsDir)]);
        const allFiles = [...new Set([...publicFiles, ...distFiles])].sort();
        const images = allFiles.map(f => `/products/${f}`);
        // Also include uploaded images
        const uploadsDir = path.join(dataDir, 'uploads');
        let uploadedFiles = [];
        try {
          const uFiles = await fsp.readdir(uploadsDir);
          uploadedFiles = uFiles.filter(f => ALLOWED_EXT.includes(path.extname(f).toLowerCase())).map(f => `/five-mascotas/uploads/${f}`);
        } catch {}
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, images: [...images, ...uploadedFiles] }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // API ROUTE: /api/chat-nutricional (Rayo · Experto Nutricional de FIVE Mascotas)
  if (pathname === '/api/chat-nutricional') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'POST') {
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
      const rateStatus = checkRateLimit(clientIp);
      if (!rateStatus.allowed) {
        res.statusCode = 429;
        res.setHeader('Retry-After', String(rateStatus.retryAfterSeconds));
        res.end(JSON.stringify({
          ok: false,
          error: `Rayo está descansando sus patitas. Has alcanzado el límite momentáneo de consultas. Vuelve a intentar en ${rateStatus.retryAfterSeconds} segundos.`,
          retryAfter: rateStatus.retryAfterSeconds,
        }));
        return;
      }

      try {
        const body = await parseBody(req);
        const { query, mode, productIds, petProfile, history } = body;
        const result = await handleRayoNutritionalChat({
          query: typeof query === 'string' ? query.slice(0, 1000) : '',
          mode: mode || 'chat',
          productIds: Array.isArray(productIds) ? productIds.slice(0, 5) : [],
          petProfile: typeof petProfile === 'object' && petProfile !== null ? petProfile : null,
          history: Array.isArray(history) ? history.slice(-10) : [],
          dataDir,
        });

        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message || 'Error interno en asistente Rayo' }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // API ROUTE: /api/pim

  if (pathname === '/api/pim') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (nexoConfigured()) {
      if (!nexoEnabled()) { res.writeHead(503); res.end(JSON.stringify({ ok: false, error: 'Integración incompleta.' })); return; }
      if (req.method !== 'GET') { res.writeHead(409); res.end(JSON.stringify({ ok: false, error: 'El catálogo se administra en Nexo.' })); return; }
      try { res.end(JSON.stringify({ ok: true, data: await nexoCatalogData() })); }
      catch { res.writeHead(503); res.end(JSON.stringify({ ok: false, error: 'Catálogo Nexo temporalmente no disponible.' })); }
      return;
    }

    if (req.method === 'GET') {
      try {
        const data = await readJsonFile(pimFilePath, getDefaultPim);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await parseBody(req);
        if (!Array.isArray(body.products)) {
          throw new Error('products must be an array');
        }
        const updated = {
          products: body.products,
          updatedAt: new Date().toISOString(),
        };
        await writeJsonFile(pimFilePath, updated);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, data: updated }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // API ROUTE: /api/upload (Image upload handler for PIM / CMS)
  if (pathname === '/api/upload') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (!body.base64 || !body.filename) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Filename y base64 son requeridos' }));
          return;
        }
        const uploadsDataDir = path.join(dataDir, 'uploads');
        await fs.promises.mkdir(uploadsDataDir, { recursive: true });

        const rawExt = path.extname(body.filename || '').toLowerCase();
        const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
        if (!ALLOWED_EXTS.includes(rawExt)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Formato no permitido. Solo se aceptan imágenes PNG, JPG o WEBP' }));
          return;
        }

        const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Magic bytes check (defense-in-depth against malicious file disguise)
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
        const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isWebp = buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';

        if (!isPng && !isJpg && !isWebp) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'El archivo enviado no corresponde a una imagen válida' }));
          return;
        }

        const rawBase = path.basename(body.filename, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const safeFilename = `${rawBase || 'producto'}-${Date.now().toString(36)}${rawExt}`;
        await fs.promises.writeFile(path.join(uploadsDataDir, safeFilename), buffer);

        // Also mirror to public/five-mascotas/uploads and dist/five-mascotas/uploads if available
        try {
          const publicUploadsDir = path.join(rootDir, 'public', 'five-mascotas', 'uploads');
          await fs.promises.mkdir(publicUploadsDir, { recursive: true });
          await fs.promises.writeFile(path.join(publicUploadsDir, safeFilename), buffer);
        } catch {}

        try {
          const distUploadsDir = path.join(distDir, 'five-mascotas', 'uploads');
          await fs.promises.mkdir(distUploadsDir, { recursive: true });
          await fs.promises.writeFile(path.join(distUploadsDir, safeFilename), buffer);
        } catch {}

        const publicUrl = `/five-mascotas/uploads/${safeFilename}`;
        res.statusCode = 201;
        res.end(JSON.stringify({ ok: true, url: publicUrl, filename: safeFilename }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // Helper to parse cookies from request header
  const getCookies = (req) => {
    const header = req.headers.cookie || '';
    const cookies = {};
    header.split(';').forEach((pair) => {
      const parts = pair.split('=');
      const name = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (name) cookies[name] = decodeURIComponent(val);
    });
    return cookies;
  };

  // Helper to get session from cookie
  const getSessionFromReq = (req) => {
    const cookies = getCookies(req);
    const sid = cookies['five_session'];
    if (!sid) return null;
    const session = sessionStore.get(sid);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      sessionStore.delete(sid);
      return null;
    }
    return session;
  };

  // API ROUTE: /api/auth
  if (pathname.startsWith('/api/auth/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const authAction = pathname.replace('/api/auth/', '');

    // /api/auth/login
    if (authAction === 'login' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!email || !password) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Correo y contraseña son requeridos' }));
          return;
        }

        const data = await readJsonFile(usersFilePath, getDefaultUsers);
        const user = data.users.find((u) => u.email.toLowerCase() === email);

        if (!user) {
          res.statusCode = 401;
          res.end(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }));
          return;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          res.statusCode = 401;
          res.end(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }));
          return;
        }

        // Generate session
        const sessionId = crypto.randomBytes(32).toString('hex');
        const sessionData = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        sessionStore.set(sessionId, sessionData);

        // Set HttpOnly Cookie (In compliance with AppSec rules)
        const isProd = process.env.NODE_ENV === 'production';
        const cookieStr = `five_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`;
        res.setHeader('Set-Cookie', cookieStr);

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // /api/auth/register (Client registration)
    if (authAction === 'register' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();

        if (!email || !password || password.length < 6) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Ingresa un correo válido y contraseña de al menos 6 caracteres' }));
          return;
        }

        const data = await readJsonFile(usersFilePath, getDefaultUsers);
        if (data.users.some((u) => u.email.toLowerCase() === email)) {
          res.statusCode = 409;
          res.end(JSON.stringify({ ok: false, error: 'Este correo ya se encuentra registrado' }));
          return;
        }

        const passwordHash = await hashPassword(password);
        const newUser = {
          id: `usr-${Date.now()}`,
          email,
          passwordHash,
          name: name || email.split('@')[0],
          phone: phone || '',
          role: 'client',
          createdAt: new Date().toISOString(),
        };
        data.users.push(newUser);
        await writeJsonFile(usersFilePath, data);

        // Auto login session
        const sessionId = crypto.randomBytes(32).toString('hex');
        sessionStore.set(sessionId, {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        const isProd = process.env.NODE_ENV === 'production';
        res.setHeader('Set-Cookie', `five_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`);

        res.statusCode = 201;
        res.end(JSON.stringify({
          ok: true,
          user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // /api/auth/me (Check active session & get profile)
    if (authAction === 'me' && req.method === 'GET') {
      const session = getSessionFromReq(req);
      if (!session) {
        res.statusCode = 401;
        res.end(JSON.stringify({ ok: false, user: null }));
        return;
      }
      try {
        const data = await readJsonFile(usersFilePath, getDefaultUsers);
        const user = data.users.find((u) => u.id === session.userId);
        if (user) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            ok: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              phone: user.phone || '',
              address: user.address || '',
              city: user.city || 'Talca',
              notes: user.notes || '',
            },
          }));
          return;
        }
      } catch {}

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        user: { id: session.userId, email: session.email, name: session.name, role: session.role },
      }));
      return;
    }

    // /api/auth/profile (Update shipping address & contact info)
    if (authAction === 'profile' && (req.method === 'PUT' || req.method === 'POST')) {
      const session = getSessionFromReq(req);
      if (!session) {
        res.statusCode = 401;
        res.end(JSON.stringify({ ok: false, error: 'Debes iniciar sesión para actualizar tu perfil' }));
        return;
      }

      try {
        const body = await parseBody(req);
        const data = await readJsonFile(usersFilePath, getDefaultUsers);
        const user = data.users.find((u) => u.id === session.userId);

        if (!user) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Usuario no encontrado' }));
          return;
        }

        if (body.name !== undefined && String(body.name).trim()) {
          user.name = String(body.name).trim();
          session.name = user.name;
        }
        if (body.phone !== undefined) {
          user.phone = String(body.phone).trim();
        }
        if (body.address !== undefined) {
          user.address = String(body.address).trim();
        }
        if (body.city !== undefined) {
          user.city = String(body.city).trim();
        }
        if (body.notes !== undefined) {
          user.notes = String(body.notes).trim();
        }

        await writeJsonFile(usersFilePath, data);

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || 'Talca',
            notes: user.notes || '',
          },
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // /api/auth/logout
    if (authAction === 'logout' && (req.method === 'POST' || req.method === 'GET')) {
      const cookies = getCookies(req);
      const sid = cookies['five_session'];
      if (sid) sessionStore.delete(sid);

      res.setHeader('Set-Cookie', 'five_session=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: 'Auth action not found' }));
    return;
  }

  // API ROUTE: /api/orders (Orders tracking, user orders history, and sync)
  if (pathname === '/api/orders' || pathname.startsWith('/api/orders/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const subAction = pathname.replace('/api/orders', '').replace(/^\//, '');

    // GET /api/orders?code=... (Public order tracking by code or phone)
    if (req.method === 'GET') {
      try {
        const queryCode = parsedUrl.searchParams.get('code') || subAction;
        const data = await readJsonFile(ordersFilePath, getDefaultOrders);

        if (queryCode) {
          const cleanCode = queryCode.trim().toUpperCase();
          const order = data.orders.find((o) =>
            o.code?.toUpperCase() === cleanCode || (o.phone && o.phone.includes(cleanCode))
          );
          if (!order) {
            res.statusCode = 404;
            res.end(JSON.stringify({ ok: false, error: 'Pedido no encontrado' }));
            return;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, order }));
          return;
        }

        // Without query code -> Requires authenticated session
        const session = getSessionFromReq(req);
        if (!session) {
          res.statusCode = 401;
          res.end(JSON.stringify({ ok: false, error: 'Autenticación requerida para ver tus pedidos' }));
          return;
        }

        // Admin can see all orders, regular client only their own orders
        const userOrders = session.role === 'admin'
          ? data.orders
          : data.orders.filter((o) => o.email && o.email.toLowerCase() === session.email.toLowerCase());

        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, orders: userOrders }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // POST /api/orders (Create/Save new order)
    if (req.method === 'POST' && (!subAction || subAction === 'create')) {
      if (nexoConfigured()) {
        res.statusCode = 409;
        res.end(JSON.stringify({ ok: false, error: 'Los pedidos se crean mediante el checkout de Nexo.' }));
        return;
      }
      try {
        const body = await parseBody(req);
        if (!body.code || !body.items) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Datos de orden incompletos' }));
          return;
        }

        const data = await readJsonFile(ordersFilePath, getDefaultOrders);
        const idx = data.orders.findIndex((o) => o.code === body.code);
        if (idx >= 0) {
          data.orders[idx] = { ...data.orders[idx], ...body, updatedAt: new Date().toISOString() };
        } else {
          data.orders.unshift({
            ...body,
            createdAt: body.createdAt || new Date().toISOString(),
          });
        }
        await writeJsonFile(ordersFilePath, data);

        // Disparar Notificación Push a administradores
        const orderTotal = Number(body.total || 0).toLocaleString('es-CL');
        sendPushNotificationToAdmins({
          title: `Nuevo Pedido #${body.code || 'FIVE'}`,
          body: `${body.customerName || 'Cliente'} compro por $${orderTotal}. Toca para abrir.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `order-${body.code}`,
          data: { url: '/admin/pedidos', code: body.code },
        }).catch((e) => console.warn('[Push Alert Error]', e.message));

        res.statusCode = 201;
        res.end(JSON.stringify({ ok: true, order: body }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // POST /api/orders/link (Link guest order to authenticated user email)
    if (req.method === 'POST' && subAction === 'link') {
      try {
        const session = getSessionFromReq(req);
        if (!session) {
          res.statusCode = 401;
          res.end(JSON.stringify({ ok: false, error: 'Inicia sesión para vincular pedidos a tu cuenta' }));
          return;
        }

        const body = await parseBody(req);
        const code = (body.code || '').trim().toUpperCase();
        if (!code) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Ingresa un código de pedido válido' }));
          return;
        }

        const data = await readJsonFile(ordersFilePath, getDefaultOrders);
        const order = data.orders.find((o) => o.code?.toUpperCase() === code);
        if (!order) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'No se encontró un pedido con ese código' }));
          return;
        }

        order.email = session.email;
        order.linkedToUserId = session.userId;
        order.updatedAt = new Date().toISOString();
        await writeJsonFile(ordersFilePath, data);

        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, order }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // PUT /api/orders/status (Update order status - Admin only)
    if (req.method === 'PUT' && subAction === 'status') {
      try {
        const session = getSessionFromReq(req);
        if (!session || session.role !== 'admin') {
          res.statusCode = 403;
          res.end(JSON.stringify({ ok: false, error: 'Acceso restringido a administradores' }));
          return;
        }

        const body = await parseBody(req);
        const { code, status } = body;
        if (!code || !status) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'code y status son requeridos' }));
          return;
        }

        const data = await readJsonFile(ordersFilePath, getDefaultOrders);
        const order = data.orders.find((o) => o.code === code);
        if (!order) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Pedido no encontrado' }));
          return;
        }

        order.status = status;
        order.statusUpdatedAt = new Date().toISOString();
        await writeJsonFile(ordersFilePath, data);

        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, order }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  // API ROUTE: /api/admin/push-* (Web Push Subscriptions and Alerts)
  if (pathname.startsWith('/api/admin/push-')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const session = getSessionFromReq(req);
    if (!session || session.role !== 'admin') {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, error: 'Acceso restringido a administradores' }));
      return;
    }

    // GET /api/admin/push-vapid-key
    if (pathname === '/api/admin/push-vapid-key' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, publicKey: vapidPublicKey }));
      return;
    }

    // POST /api/admin/push-subscribe
    if (pathname === '/api/admin/push-subscribe' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const sub = body.subscription;
        if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Formato de suscripción Push inválido' }));
          return;
        }

        const data = await getPushSubscriptions();
        const existingIdx = data.subscriptions.findIndex((s) => s.endpoint === sub.endpoint);
        const enrichedSub = {
          ...sub,
          userId: session.userId,
          userEmail: session.email,
          userAgent: body.userAgent || req.headers['user-agent'] || 'Browser/PWA',
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          data.subscriptions[existingIdx] = enrichedSub;
        } else {
          data.subscriptions.push(enrichedSub);
        }
        await savePushSubscriptions(data);

        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, message: 'Dispositivo suscrito exitosamente' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // POST /api/admin/push-unsubscribe
    if (pathname === '/api/admin/push-unsubscribe' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const endpoint = body.endpoint;
        if (!endpoint) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Endpoint requerido' }));
          return;
        }
        const data = await getPushSubscriptions();
        data.subscriptions = data.subscriptions.filter((s) => s.endpoint !== endpoint);
        await savePushSubscriptions(data);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    // POST /api/admin/push-test
    if (pathname === '/api/admin/push-test' && req.method === 'POST') {
      try {
        const result = await sendPushNotificationToAdmins({
          title: 'FIVE Mascotas — Alerta de Prueba',
          body: `¡Hola ${session.name || 'Admin'}! Notificaciones Web Push activas y operativas en tu dispositivo.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'five-test-push',
          data: { url: '/admin' },
        });
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, result }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: 'Push endpoint not found' }));
    return;
  }

  // Static File Serving from dist/ or dataDir/uploads
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(distDir, pathname);

    // If requesting an uploaded image, check persistent dataDir/uploads first
    if (pathname.startsWith('/five-mascotas/uploads/')) {
      const uploadFilename = path.basename(pathname);
      const dataUploadPath = path.join(dataDir, 'uploads', uploadFilename);
      if (fs.existsSync(dataUploadPath)) {
        filePath = dataUploadPath;
      }
    }

    let stat;

    try {
      stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stat = fs.statSync(filePath);
      }
    } catch {
      const publicFilePath = path.join(rootDir, 'public', pathname);
      if (fs.existsSync(publicFilePath)) {
        filePath = publicFilePath;
        stat = fs.statSync(filePath);
      } else
      // Try adding .html
      if (fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
        stat = fs.statSync(filePath);
      } else {
        // Fallback to 404.html or index.html
        filePath = path.join(distDir, 'index.html');
        if (fs.existsSync(filePath)) {
          stat = fs.statSync(filePath);
        } else {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Cache control
    if (pathname === '/sw-admin.js') {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (pathname === '/admin-manifest.webmanifest') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(css|js|woff2?|webp|png|jpe?g|ico|svg)$/.test(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Stream with gzip if accepted
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && stat.size > 1024 && !ext.match(/\.(png|jpe?g|webp|woff2?)$/)) {
      res.setHeader('Content-Encoding', 'gzip');
      res.statusCode = 200;
      const raw = fs.createReadStream(filePath);
      const gzip = zlib.createGzip();
      raw.pipe(gzip).pipe(res);
    } else {
      res.setHeader('Content-Length', stat.size);
      res.statusCode = 200;
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[FIVE Server] Running on http://0.0.0.0:${PORT} (Data directory: ${dataDir})`);
});
