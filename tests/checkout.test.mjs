import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const html = await readFile('dist/index.html', 'utf8');
const w = new Window();
w.document.write(html);

// 1. Validar existencia del modal de Checkout
const modal = w.document.querySelector('#five-checkout-modal');
assert.ok(modal, 'El modal #five-checkout-modal debe existir en el DOM');

// 2. Validar los 3 pasos en el modal
const step1 = modal.querySelector('#chk-step-1');
const step2 = modal.querySelector('#chk-step-2');
const step3 = modal.querySelector('#chk-step-3');
assert.ok(step1, 'Paso 1 (Despacho) debe existir');
assert.ok(step2, 'Paso 2 (Pago & QR) debe existir');
assert.ok(step3, 'Paso 3 (Confirmación) debe existir');

// 3. Validar campos requeridos en el Paso 1
assert.ok(step1.querySelector('#chk-name'), 'Campo nombre debe existir');
assert.ok(step1.querySelector('#chk-phone'), 'Campo teléfono WhatsApp debe existir');
assert.ok(step1.querySelector('#chk-city'), 'Selector de comuna/ciudad debe existir');
assert.ok(step1.querySelector('#chk-address'), 'Campo dirección debe existir');

// 4. Validar datos bancarios y micro-botones de copia en el Paso 2
assert.ok(step2.querySelector('#chk-qr-image'), 'Imagen de código QR debe existir');
assert.ok(step2.querySelector('#chk-bank-name'), 'Nombre de banco debe existir');
assert.ok(step2.querySelector('#chk-bank-number'), 'Número de cuenta debe existir');
assert.ok(step2.querySelector('#chk-bank-rut'), 'RUT de titular debe existir');
assert.ok(step2.querySelector('#chk-bank-amount'), 'Monto exacto debe existir');
assert.ok(step2.querySelector('#chk-copy-btn'), 'Botón maestro de copia de datos debe existir');

const copyButtons = step2.querySelectorAll('.five-mini-copy-btn');
assert.ok(copyButtons.length >= 6, `Debe haber al menos 6 micro-botones de copia (encontrados: ${copyButtons.length})`);

// 5. Validar elementos de Paso 3 (Confirmación y Rastreo)
assert.ok(step3.querySelector('#chk-tracking-code'), 'Código de rastreo hero debe existir');
assert.ok(step3.querySelector('#chk-copy-track-code'), 'Botón para copiar código de rastreo debe existir');
assert.ok(step3.querySelector('#chk-whatsapp-proof-btn'), 'Botón de envío de comprobante por WhatsApp debe existir');
assert.ok(step3.querySelector('#chk-go-track-btn'), 'Botón de navegación a /rastreo debe existir');

console.log('PASS CHECKOUT: Modal, steps 1-2-3, QR container, per-field copy buttons, tracking code hero, and WhatsApp proof integration verified.');
await w.happyDOM.abort();
