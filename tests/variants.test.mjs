import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

console.log('--- INICIANDO TEST: SISTEMA DE KILAJES, VARIANTES Y STOCK ---');

// Compilar catalog.ts con esbuild
const catalogBuild = await build({
  entryPoints: ['src/data/pim/catalog.ts'],
  bundle: true,
  write: false,
  format: 'esm'
});
const catalogMod = await import('data:text/javascript;base64,' + Buffer.from(catalogBuild.outputFiles[0].text).toString('base64'));
const { products, getProductById } = catalogMod;

// 1. Validar consolidación de productos en catálogo
const multiFormatProds = products.filter(p => p.hasMultipleFormats);
assert.ok(multiFormatProds.length > 0, 'Debe haber productos consolidados con múltiples formatos');
console.log(`✓ Consolidación: ${multiFormatProds.length} productos con múltiples formatos detectados.`);

// Caso de prueba: 9 Lives Adulto Pescado
const nineLives = products.find(p => p.name.includes('9 Lives Adulto Pescado'));
assert.ok(nineLives, 'Debe existir 9 Lives Adulto Pescado');
assert.equal(nineLives.hasMultipleFormats, true, '9 Lives debe tener múltiples formatos');
assert.equal(nineLives.variants?.length, 2, 'Debe tener 2 variantes (8 kg y 15 kg)');
assert.equal(nineLives.priceMin, 17000, 'Precio mínimo debe ser $17.000');
assert.equal(nineLives.priceMax, 27000, 'Precio máximo debe ser $27.000');
assert.equal(nineLives.variants[0].format, '8 kg');
assert.equal(nineLives.variants[0].pricePerKg, 2125, 'Precio por kg de 8 kg debe ser 2.125');
assert.equal(nineLives.variants[1].format, '15 kg');
assert.equal(nineLives.variants[1].pricePerKg, 1800, 'Precio por kg de 15 kg debe ser 1.800');
console.log('✓ Caso 9 Lives: Variantes 8 kg ($17.000 / $2.125 x KG) y 15 kg ($27.000 / $1.800 x KG) verificadas.');

// 2. getProductById debe encontrar tanto por ID padre como por ID de variante
const foundByParent = getProductById(nineLives.id);
assert.ok(foundByParent, 'Debe encontrar por ID de producto padre');
const foundByChildVariant = getProductById(nineLives.variants[1].id);
assert.ok(foundByChildVariant, 'Debe encontrar por ID de variante hija');
assert.equal(foundByChildVariant.id, nineLives.id, 'Ambos deben resolver al mismo producto consolidado');
console.log('✓ Resolución de IDs: Enrutamiento para ID padre y variante sin 404s verificado.');

// 3. Validar HTML estático generado de PLP (alimentos)
const alimentosHtml = await readFile('dist/alimentos/index.html', 'utf8');
const w = new Window();
w.document.write(alimentosHtml);

// Verificar presencia de tarjetas de producto con rango y botón comprar
const cards = [...w.document.querySelectorAll('.five-product-card')];
assert.ok(cards.length > 0, 'Debe haber tarjetas de producto en /alimentos');

const multiCard = cards.find(c => c.getAttribute('data-has-variants') === 'true');
assert.ok(multiCard, 'Debe existir una tarjeta con data-has-variants="true" en /alimentos');

const priceHero = multiCard.querySelector('.five-price-hero');
assert.ok(priceHero, 'Debe tener elemento de precio principal');
assert.match(priceHero.textContent, /\$/, 'Debe mostrar símbolo de moneda');
assert.match(priceHero.textContent, /-/, 'Debe mostrar rango con guion');

const openVariantsBtn = multiCard.querySelector('[data-open-variants]');
assert.ok(openVariantsBtn, 'Tarjeta multi-formato debe tener botón [data-open-variants]');
assert.match(openVariantsBtn.textContent, /Comprar/i, 'Texto de botón debe ser "Comprar"');

const stockBadge = multiCard.querySelector('.five-stock-badge');
assert.ok(stockBadge, 'Debe tener badge de stock');
console.log('✓ PLP / Tarjeta de producto: Rango de precio, stock y botón "Comprar" verificados en HTML generado.');

// 4. Validar HTML de PDP (página de producto 9 Lives)
const pdpHtml = await readFile(`dist/producto/${nineLives.id}/index.html`, 'utf8');
const pdpWindow = new Window();
pdpWindow.document.write(pdpHtml);

const pdpVariantRows = pdpWindow.document.querySelectorAll('.five-pdp-variant-row');
assert.equal(pdpVariantRows.length, 2, 'PDP de 9 Lives debe tener 2 filas de variantes seleccionables');

const pdpKgLabels = pdpWindow.document.querySelectorAll('.five-pdp-kg-label');
assert.ok(pdpKgLabels.length >= 2, 'Debe mostrar el desglose de precio por kilo ($ x KG)');

const pdpStepper = pdpWindow.document.querySelector('.five-pdp-qty-control');
assert.ok(pdpStepper, 'PDP debe incluir control de cantidad (stepper [-] 1 [+])');

const pdpAddToCart = pdpWindow.document.querySelector('#pdp-add-to-cart-btn');
assert.ok(pdpAddToCart, 'PDP debe incluir botón de compra directa');
console.log('✓ PDP / Ficha de producto: Selector de kilajes por radio, $/KG y stepper verificados.');

// 5. Validar presencia de modal QuickSelect en el layout base
const modalDialog = w.document.querySelector('#five-variant-modal');
assert.ok(modalDialog, 'El modal de variantes debe estar presente en el BaseLayout');
const modalOptionsList = modalDialog.querySelector('#vm-options-list');
assert.ok(modalOptionsList, 'El modal de variantes debe tener contenedor #vm-options-list');
const modalStepper = modalDialog.querySelector('.five-qty-stepper');
assert.ok(modalStepper, 'El modal de variantes debe tener stepper de cantidad');
const modalBuyBtn = modalDialog.querySelector('#vm-add-cart-btn');
assert.ok(modalBuyBtn, 'El modal de variantes debe tener botón de agregar al carro');
console.log('✓ Modal QuickSelect: Diálogo accesible #five-variant-modal montado en layout base.');

console.log('--- TEST VARIANTES, KILAJES Y STOCK COMPLETADO CON ÉXITO ---');
