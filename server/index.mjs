import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

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

const getDefaultOrders = () => ({ orders: [] });

// In-memory session store (sessionId -> { userId, email, role, name, expiresAt })
const sessionStore = new Map();

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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

// Parse JSON body
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
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('Invalid JSON format'));
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

  // CORS headers for local dev convenience
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
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

  // API ROUTE: /api/pim
  if (pathname === '/api/pim') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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
    if (ext === '.html') {
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
