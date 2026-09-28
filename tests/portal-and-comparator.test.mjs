import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Window } from 'happy-dom';

// 1. Validar Portal de Clientes en /mi-cuenta
{
  const html = await readFile('dist/mi-cuenta/index.html', 'utf8');
  const w = new Window();
  w.document.write(html);

  const kpisGrid = w.document.querySelector('.five-portal-kpis-grid');
  assert.ok(kpisGrid, 'La grilla de KPIs debe existir en /mi-cuenta');
  assert.ok(w.document.querySelector('#kpi-orders-count'), 'KPI contador total de pedidos debe existir');
  assert.ok(w.document.querySelector('#kpi-orders-active'), 'KPI pedidos en curso debe existir');
  assert.ok(w.document.querySelector('#kpi-orders-savings'), 'KPI ahorro acumulado debe existir');

  const linkCard = w.document.querySelector('.five-link-order-card');
  assert.ok(linkCard, 'Tarjeta para vincular compras como invitado debe existir');
  assert.ok(w.document.querySelector('#form-link-order'), 'Formulario #form-link-order debe existir');
  assert.ok(w.document.querySelector('#link-order-input'), 'Input para código FIVE-TRK-XXXX debe existir');

  const filterBar = w.document.querySelector('.five-orders-filter-bar');
  assert.ok(filterBar, 'Barra de pestañas de filtro debe existir');
  const pills = filterBar.querySelectorAll('.five-order-filter-pill');
  assert.ok(pills.length >= 3, 'Debe tener al menos 3 filtros (Todos, En Curso, Entregados)');

  assert.ok(w.document.querySelector('#portal-orders-list'), 'Contenedor dinámico de pedidos #portal-orders-list debe existir');
  await w.happyDOM.abort();
}

// 2. Validar Buscador de Seguimiento en /rastreo
{
  const html = await readFile('dist/rastreo/index.html', 'utf8');
  const w = new Window();
  w.document.write(html);

  const form = w.document.querySelector('#track-search-form');
  assert.ok(form, 'Formulario #track-search-form debe existir en /rastreo');
  assert.ok(w.document.querySelector('#track-input'), 'Campo de búsqueda #track-input debe existir');
  assert.ok(w.document.querySelector('#track-result-box'), 'Contenedor de resultados #track-result-box debe existir');
  assert.ok(w.document.querySelector('#track-empty-box'), 'Contenedor de estado vacío #track-empty-box debe existir');

  await w.happyDOM.abort();
}

// 3. Validar Comparador de Alimentos en /comparador
{
  const html = await readFile('dist/comparador/index.html', 'utf8');
  const w = new Window();
  w.document.write(html);

  assert.ok(w.document.querySelector('#picker-slot-1'), 'Selector de alimento 1 debe existir');
  assert.ok(w.document.querySelector('#picker-slot-2'), 'Selector de alimento 2 debe existir');
  assert.ok(w.document.querySelector('#picker-slot-3'), 'Selector de alimento 3 debe existir');
  assert.ok(w.document.querySelector('#comparison-table-container'), 'Contenedor de tabla comparativa debe existir');
  assert.ok(w.document.querySelector('.five-education-card'), 'Guía educativa sobre lectura de ingredientes debe existir');

  await w.happyDOM.abort();
}

// 4. Validar Packshots oficiales de Marcas
{
  const brandSvgs = [
    'public/five-mascotas/brands/farmina-nd.svg',
    'public/five-mascotas/brands/josera.svg',
    'public/five-mascotas/brands/purina-proplan.svg',
    'public/five-mascotas/brands/purina-catchow.svg',
    'public/five-mascotas/brands/fit-formula.svg',
    'public/five-mascotas/brands/nomade.svg',
    'public/five-mascotas/brands/bokato-gold.svg',
    'public/five-mascotas/brands/9lives.svg',
    'public/five-mascotas/brands/appetit.svg',
    'public/five-mascotas/brands/kongo-gold.svg',
    'public/five-mascotas/brands/champion.svg',
  ];

  for (const svgPath of brandSvgs) {
    assert.ok(existsSync(svgPath), `El packshot ${svgPath} debe existir en el sistema`);
  }
}

console.log('PASS PORTAL & COMPARATOR: Customer portal, live tracking, food comparator and brand packshots verified.');
