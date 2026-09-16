# FIVE Mascotas

Proyecto independiente para la tienda web de FIVE Mascotas, extraído de la demostración original de Ágora. La copia de Ágora se conserva sin cambios como parte de su biblioteca de ejemplos.

## Estado actual

La interfaz es una propuesta funcional de front-end: incluye portada, categorías, búsqueda, filtros combinados, productos ilustrativos y carrito temporal. Todavía no crea pedidos, no procesa pagos y no consulta existencias reales.

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
