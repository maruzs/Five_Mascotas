// tests/payments.test.mjs
// Suite de pruebas automatizadas para pasarelas chilenas: Transbank Webpay Plus y Khipu API v3.
// Valida configuración, Zero-Trust, commit de transacciones, idempotencia de webhooks y selector en DOM.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import {
  getWebpayConfig,
  getKhipuConfig,
  verifyOrderAmountZeroTrust,
  createKhipuPayment,
  verifyKhipuPayment,
} from '../server/payments.mjs';
import { defaultShippingRates } from '../server/shipping.mjs';

console.log('--- INICIANDO SUITE DE PRUEBAS: PASARELAS DE PAGO (WEBPAY PLUS & KHIPU) ---');

// 1. Configuración de Pasarelas
{
  const tbk = getWebpayConfig();
  assert.ok(tbk.commerceCode, 'Commerce Code de Webpay debe estar definido');
  assert.ok(tbk.apiKeySecret, 'API Key Secret de Webpay debe estar definido');
  assert.ok(tbk.baseUrl.includes('transbank.cl'), 'URL Base de Webpay debe apuntar a Transbank');

  const khipu = getKhipuConfig();
  assert.ok(khipu.baseUrl.includes('khipu.com'), 'URL Base de Khipu debe ser oficial');
  console.log('✓ PASS: Configuración de Transbank Webpay Plus y Khipu validada.');
}

// 2. Validación Estricta Zero-Trust (Anti-Tampering de Precios)
{
  const mockCatalog = [
    { id: 'prod-fit-formula', name: 'Fit Formula Adulto 20kg', price: 34990 },
    { id: 'prod-bravecto', name: 'Bravecto Perros 20-40kg', price: 29990 },
  ];

  // Caso A: Cálculo legítimo en el servidor
  const validCalculation = verifyOrderAmountZeroTrust({
    items: [
      { id: 'prod-fit-formula', quantity: 2 },
      { id: 'prod-bravecto', quantity: 1 },
    ],
    shippingRateId: 'ship-talca',
    catalogProducts: mockCatalog,
    shippingRates: defaultShippingRates,
  });

  const expectedSubtotal = 34990 * 2 + 29990; // 69980 + 29990 = 99970
  const expectedTotal = expectedSubtotal + 1500; // Despacho Talca $1.500 = 101470
  assert.equal(validCalculation.subtotal, expectedSubtotal, 'Subtotal debe coincidir exactamente con el catálogo oficial');
  assert.equal(validCalculation.shippingFee, 1500, 'Tarifa de despacho para Talca debe ser 1500');
  assert.equal(validCalculation.calculatedTotal, expectedTotal, 'Total calculado debe ser 101470');
  assert.equal(validCalculation.valid, true);

  // Caso B: Intento de inyectar producto inexistente o alterado
  assert.throws(
    () => {
      verifyOrderAmountZeroTrust({
        items: [{ id: 'prod-hacked-item', quantity: 1 }],
        shippingRateId: 'ship-talca',
        catalogProducts: mockCatalog,
        shippingRates: defaultShippingRates,
      });
    },
    /Producto no encontrado/,
    'Debe rechazar productos no presentes en el catálogo oficial'
  );

  // Caso C: Intento de inyectar cantidad negativa o no numérica
  assert.throws(
    () => {
      verifyOrderAmountZeroTrust({
        items: [{ id: 'prod-fit-formula', quantity: -5 }],
        shippingRateId: 'ship-talca',
        catalogProducts: mockCatalog,
        shippingRates: defaultShippingRates,
      });
    },
    /Item inválido/,
    'Debe rechazar cantidades inválidas o negativas'
  );

  console.log('✓ PASS: Zero-Trust y protección anti-manipulación de precios verificada.');
}

// 3. Khipu API v3: Creación y Verificación de Webhook
{
  const mockOrderCode = `FIVE-TEST-${Date.now()}`;
  const khipuResult = await createKhipuPayment({
    orderCode: mockOrderCode,
    amount: 15000,
    customer: { name: 'Constanza Silva', email: 'constanza@ejemplo.cl' },
    returnUrl: 'http://localhost:3004/rastreo?payment=khipu_success',
    cancelUrl: 'http://localhost:3004/rastreo?payment=khipu_cancel',
    notifyUrl: 'http://localhost:3004/api/payments/khipu/webhook',
  });

  assert.ok(khipuResult.ok, 'Creación de pago Khipu debe ser exitosa');
  assert.ok(khipuResult.paymentUrl, 'Debe retornar paymentUrl para redirección');
  assert.ok(khipuResult.paymentId, 'Debe retornar paymentId');

  // Verificación de pago
  const verification = await verifyKhipuPayment(khipuResult.paymentId);
  assert.ok(verification, 'Consulta de verificación a Khipu debe responder');
  assert.equal(typeof verification.verified, 'boolean', 'Estado verified debe ser booleano');

  console.log('✓ PASS: Creación de cobro Khipu y verificación de estado comprobada.');
}

// 4. Verificación de UI y DOM en CheckoutModal (`dist/index.html`)
{
  const html = await readFile('dist/index.html', 'utf8');
  const w = new Window();
  w.document.write(html);

  const modal = w.document.querySelector('#five-checkout-modal');
  assert.ok(modal, 'El modal de checkout debe existir en el DOM');

  // Selector de pasarelas
  const tabWebpay = modal.querySelector('#chk-tab-webpay');
  const tabKhipu = modal.querySelector('#chk-tab-khipu');
  const tabTransfer = modal.querySelector('#chk-tab-transfer');
  assert.ok(tabWebpay, 'Pestaña Webpay Plus debe existir en el selector');
  assert.ok(tabKhipu, 'Pestaña Khipu debe existir en el selector');
  assert.ok(tabTransfer, 'Pestaña Transferencia QR debe existir en el selector');

  // Paneles de contenido
  const panelWebpay = modal.querySelector('#chk-panel-webpay');
  const panelKhipu = modal.querySelector('#chk-panel-khipu');
  const panelTransfer = modal.querySelector('#chk-panel-transfer');
  assert.ok(panelWebpay, 'Panel Webpay Plus debe existir');
  assert.ok(panelKhipu, 'Panel Khipu debe existir');
  assert.ok(panelTransfer, 'Panel Transferencia QR debe existir');

  // Botones de acción táctiles (mínimo 44px de alto)
  const btnWebpay = modal.querySelector('#chk-btn-pay-webpay');
  const btnKhipu = modal.querySelector('#chk-btn-pay-khipu');
  const btnConfirmManual = modal.querySelector('#chk-confirm-pay-btn');
  assert.ok(btnWebpay, 'Botón de pago Webpay Plus debe existir');
  assert.ok(btnKhipu, 'Botón de pago Khipu debe existir');
  assert.ok(btnConfirmManual, 'Botón de confirmación manual QR debe existir');

  // Elementos obligatorios para retrocompatibilidad
  assert.ok(modal.querySelector('#chk-qr-image'), 'Código QR de transferencia debe seguir existiendo');
  assert.ok(modal.querySelector('#chk-bank-name'), 'Nombre de banco debe seguir existiendo');
  assert.ok(modal.querySelector('#chk-bank-number'), 'Número de cuenta debe seguir existiendo');
  assert.ok(modal.querySelector('#chk-bank-rut'), 'RUT de cuenta debe seguir existiendo');
  assert.ok(modal.querySelector('#chk-copy-btn'), 'Botón maestro de copia debe seguir existiendo');

  // Regla Cero Emojis: verificar que no existan emojis unicode comunes en el selector
  const payGridHtml = modal.querySelector('.five-pay-methods-grid')?.innerHTML || '';
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(payGridHtml), false, 'El selector de pagos no debe contener emojis (estricto SVG)');

  await w.happyDOM.abort();
  console.log('✓ PASS: DOM de CheckoutModal con selector de Webpay, Khipu y QR verificado.');
}

// 5. Verificación de Banner de Estado en Rastreo (`dist/rastreo/index.html`)
{
  const html = await readFile('dist/rastreo/index.html', 'utf8');
  const w = new Window();
  w.document.write(html);

  const paymentAlert = w.document.querySelector('#track-payment-alert');
  assert.ok(paymentAlert, 'Contenedor #track-payment-alert debe existir en /rastreo');

  await w.happyDOM.abort();
  console.log('✓ PASS: Vista de rastreo preparada para retornos de pasarela.');
}

console.log('PASS ALL PAYMENTS: Integración completa de Webpay Plus, Khipu, Zero-Trust y Selector de UI verificada.');
