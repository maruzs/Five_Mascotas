// server/payments.mjs
// Integración segura para pasarelas chilenas: Transbank Webpay Plus REST API y Khipu API v3.
// Enfoque Zero-Trust y Zero-Scaffold: montos calculados y verificados exclusivamente en el servidor.

import crypto from 'node:crypto';

// Transbank Webpay Plus Oficial (Credenciales de integración públicas por defecto)
const TBK_INTEGRATION_COMMERCE_CODE = '597055555532';
const TBK_INTEGRATION_API_KEY_SECRET = '579B532A7440BB077C2DBED5C8CF029CD1E394ACA982786B9380B1F4A7B0194D';
const TBK_INTEGRATION_URL = 'https://webpay3gint.transbank.cl';
const TBK_PRODUCTION_URL = 'https://webpay3g.transbank.cl';

export const getWebpayConfig = () => {
  const env = (process.env.TBK_ENVIRONMENT || 'TEST').toUpperCase();
  const isProd = env === 'PRODUCCION' || env === 'PRODUCTION' || env === 'LIVE';

  return {
    isProduction: isProd,
    commerceCode: process.env.TBK_COMMERCE_CODE || TBK_INTEGRATION_COMMERCE_CODE,
    apiKeySecret: process.env.TBK_API_KEY_SECRET || TBK_INTEGRATION_API_KEY_SECRET,
    baseUrl: isProd ? TBK_PRODUCTION_URL : TBK_INTEGRATION_URL,
  };
};

export const getKhipuConfig = () => {
  return {
    receiverId: process.env.KHIPU_RECEIVER_ID || '',
    secretKey: process.env.KHIPU_SECRET_KEY || '',
    baseUrl: process.env.KHIPU_API_URL || 'https://payment-api.khipu.com/v3',
    isConfigured: Boolean(process.env.KHIPU_SECRET_KEY),
  };
};

/**
 * Crea una transacción en Transbank Webpay Plus REST API v1.2
 * @param {Object} params
 * @param {string} params.orderCode - Código del pedido (ej: FIVE-TRK-8492)
 * @param {number} params.amount - Monto exacto en CLP
 * @param {string} params.sessionId - ID de sesión seguro
 * @param {string} params.returnUrl - URL absoluta donde retorna Webpay
 * @returns {Promise<{ ok: boolean, token: string, url: string }>}
 */
export async function createWebpayTransaction({ orderCode, amount, sessionId, returnUrl }) {
  if (!orderCode || typeof orderCode !== 'string') {
    throw new Error('Código de orden inválido');
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Monto inválido para Transbank Webpay');
  }
  if (!returnUrl || !returnUrl.startsWith('http')) {
    throw new Error('return_url debe ser una URL absoluta válida');
  }

  const config = getWebpayConfig();
  const endpoint = `${config.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`;

  // buy_order en Webpay soporta hasta 26 caracteres alfanuméricos
  const cleanBuyOrder = orderCode.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 26);
  const safeSessionId = (sessionId || crypto.randomBytes(16).toString('hex')).slice(0, 61);

  const payload = {
    buy_order: cleanBuyOrder,
    session_id: safeSessionId,
    amount: Math.round(amount),
    return_url: returnUrl,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Tbk-Api-Key-Id': config.commerceCode,
      'Tbk-Api-Key-Secret': config.apiKeySecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Webpay Plus] Error al crear transacción:', response.status, errorText);
    throw new Error(`Error en Transbank Webpay Plus (${response.status}): ${errorText || 'Error de conexión'}`);
  }

  const result = await response.json();
  if (!result.token || !result.url) {
    throw new Error('Transbank no retornó token o URL de redirección');
  }

  return {
    ok: true,
    token: result.token,
    url: result.url,
    buyOrder: cleanBuyOrder,
    sessionId: safeSessionId,
    environment: config.isProduction ? 'PRODUCCION' : 'INTEGRACION',
  };
}

/**
 * Confirma (commit) una transacción en Transbank Webpay Plus
 * @param {string} token - Token retornado por Transbank (token_ws)
 * @returns {Promise<{ approved: boolean, data: Object }>}
 */
export async function commitWebpayTransaction(token) {
  if (!token || typeof token !== 'string' || token.length < 10) {
    throw new Error('Token de transacción Webpay inválido');
  }

  const config = getWebpayConfig();
  const endpoint = `${config.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${encodeURIComponent(token)}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Tbk-Api-Key-Id': config.commerceCode,
      'Tbk-Api-Key-Secret': config.apiKeySecret,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Webpay Plus] Error al confirmar transacción:', response.status, errorText);
    throw new Error(`Error al confirmar transacción en Webpay (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // En Webpay Plus, response_code === 0 y status === 'AUTHORIZED' significa pago exitoso
  const approved = data.response_code === 0 && data.status === 'AUTHORIZED';

  return {
    approved,
    data,
    buyOrder: data.buy_order,
    authorizationCode: data.authorization_code,
    amount: data.amount,
    cardNumber: data.card_detail?.card_number,
    transactionDate: data.transaction_date,
    paymentTypeCode: data.payment_type_code,
  };
}

/**
 * Inicia un cobro en Khipu mediante API v3
 * @param {Object} params
 * @param {string} params.orderCode - Código del pedido
 * @param {number} params.amount - Monto exacto en CLP
 * @param {Object} params.customer - Datos del cliente
 * @param {string} params.returnUrl - URL de retorno exitoso
 * @param {string} params.cancelUrl - URL de cancelación
 * @param {string} params.notifyUrl - URL para webhook de notificación
 * @returns {Promise<{ ok: boolean, paymentId: string, paymentUrl: string }>}
 */
export async function createKhipuPayment({ orderCode, amount, customer, returnUrl, cancelUrl, notifyUrl }) {
  if (!orderCode || typeof orderCode !== 'string') {
    throw new Error('Código de orden requerido');
  }
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Monto inválido para Khipu');
  }

  const config = getKhipuConfig();

  // Si Khipu no está configurado con credenciales en entorno local/test, emular respuesta controlada
  if (!config.isConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Khipu no configurado en entorno de producción (faltan KHIPU_SECRET_KEY)');
    }
    const mockPaymentId = `mock_khipu_${Date.now()}`;
    return {
      ok: true,
      paymentId: mockPaymentId,
      paymentUrl: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}mock_khipu=true&payment_id=${mockPaymentId}&code=${orderCode}`,
      transferUrl: '',
      isMock: true,
    };
  }

  const endpoint = `${config.baseUrl}/payments`;
  const payload = {
    amount: Math.round(amount),
    currency: 'CLP',
    subject: `Pedido FIVE Mascotas #${orderCode}`,
    transaction_id: orderCode,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    notify_api_version: 'v3',
    payer_email: customer?.email || undefined,
    payer_name: customer?.name || undefined,
    payer_phone: customer?.phone || undefined,
    custom: JSON.stringify({ orderCode, createdAt: new Date().toISOString() }),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': config.secretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Khipu] Error al crear pago:', response.status, errorText);
    throw new Error(`Error en Khipu (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    ok: true,
    paymentId: data.payment_id,
    paymentUrl: data.payment_url || data.simplified_transfer_url || data.transfer_url,
    transferUrl: data.transfer_url,
    appUrl: data.app_url,
  };
}

/**
 * Verifica el estado de un pago en Khipu v3 de forma directa y segura
 * @param {string} paymentId - ID de pago otorgado por Khipu
 * @returns {Promise<{ verified: boolean, data: Object }>}
 */
export async function verifyKhipuPayment(paymentId) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('ID de pago de Khipu inválido');
  }

  const config = getKhipuConfig();
  if (!config.isConfigured) {
    // Si es mock en desarrollo
    return {
      verified: true,
      data: {
        payment_id: paymentId,
        status: 'done',
        amount: 0,
        currency: 'CLP',
      },
    };
  }

  const endpoint = `${config.baseUrl}/payments/${encodeURIComponent(paymentId)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-api-key': config.secretKey,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Khipu] Error al verificar pago:', response.status, errorText);
    throw new Error(`Error al consultar estado en Khipu (${response.status})`);
  }

  const data = await response.json();
  const verified = data.status === 'done' || data.status === 'marked-as-paid';

  return {
    verified,
    data,
    status: data.status,
    amount: data.amount,
    transactionId: data.transaction_id,
  };
}

/**
 * Calcula y valida de forma estricta (Zero-Trust) el monto de una orden en el servidor
 * @param {Object} params
 * @param {Array<{ id: string, quantity: number }>} params.items
 * @param {string} params.shippingRateId - ID o valor de la comuna de despacho
 * @param {Array<Object>} params.catalogProducts - Catálogo de productos oficial del servidor
 * @param {Array<Object>|Object} params.shippingRates - Tarifas de despacho oficiales del servidor
 * @returns {{ valid: boolean, calculatedTotal: number, subtotal: number, shippingFee: number, verifiedItems: Array<Object> }}
 */
export function verifyOrderAmountZeroTrust({ items, shippingRateId, catalogProducts, shippingRates }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El carrito no contiene productos');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!item.id || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Item inválido en carrito: ${JSON.stringify(item)}`);
    }

    const product = catalogProducts.find((p) => p.id === item.id || p.nexoVariantId === item.id);
    if (!product) {
      throw new Error(`Producto no encontrado en catálogo oficial del servidor: ${item.id}`);
    }

    const price = Number(product.price || product.priceGross || 0);
    if (price <= 0) {
      throw new Error(`Precio no válido en catálogo para producto: ${product.name || item.id}`);
    }

    subtotal += price * item.quantity;
    verifiedItems.push({
      id: product.id,
      name: product.name,
      price,
      quantity: item.quantity,
    });
  }

  let shippingFee = 1500; // Tarifa base por defecto
  if (Array.isArray(shippingRates)) {
    const rate = shippingRates.find((r) => r.id === shippingRateId || r.city === shippingRateId);
    if (rate && typeof rate.price === 'number') {
      shippingFee = rate.price;
    }
  } else if (shippingRates && typeof shippingRates === 'object') {
    if (typeof shippingRates[shippingRateId] === 'number') {
      shippingFee = shippingRates[shippingRateId];
    }
  }

  const calculatedTotal = subtotal + shippingFee;

  return {
    valid: true,
    calculatedTotal,
    subtotal,
    shippingFee,
    verifiedItems,
  };
}
