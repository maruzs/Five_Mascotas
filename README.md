# FIVE Mascotas

Proyecto independiente para la tienda web de FIVE Mascotas, extraído de la demostración original de Ágora. La copia de Ágora se conserva sin cambios como parte de su biblioteca de ejemplos.

## Estado actual

La interfaz incluye portada, categorías, búsqueda, filtros, comparador y carrito. La integración local con Nexo permite consultar catálogo/stock publicados y crear pedidos o cotizaciones con PDF cuando se configura el servidor. Sin esa configuración sigue usando los productos ilustrativos. No procesa pagos automáticamente ni emite documentos SII.

Consulta [el plan actualizado](PLAN_INTEGRACION_NEXO.md) y [la guía de prueba en Nexo](../Nexo/GUIA_PRUEBA_CAMARA_FIVE.md). Activa credenciales solo en el servidor, sincroniza el catálogo con `npm run nexo:sync` y reconstruye. El historial del portal antiguo todavía no consulta Nexo; el despacho contable y la expiración automática de reservas están pendientes.

Los productos, precios, cobertura, textos legales y datos comerciales deben confirmarse con FIVE antes de publicar. Mientras siga siendo una demostración, la página mantiene `noindex,nofollow`.

## Desarrollo

Requiere Node.js 22.19 o superior.

```bash
npm ci
npm run dev
```

Verificación completa:

```bash
npm test
```

## Estructura

- `src/pages/index.astro`: tienda en la ruta `/`.
- `src/styles/five-mascotas.css`: sistema visual responsive.
- `src/scripts/five-mascotas.ts`: búsqueda, filtros y carrito demostrativo.
- `public/five-mascotas/`: logo y productos ilustrativos.
- `public/demos/miga/`: recursos visuales reutilizados por la propuesta original.
- `identidad/`: archivos de identidad originales.
- `docs/identity/`: copia documental de los archivos de identidad.

## Evolución hacia e-commerce

Este repositorio será el canal de venta de FIVE. Nexo permanecerá como sistema transaccional y fuente de verdad para catálogo, precios, stock, reservas y pedidos. La integración se realizará mediante una API pública segura; el navegador nunca accederá directamente a la base de datos de Nexo.
