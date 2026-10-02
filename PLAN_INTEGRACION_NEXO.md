# Integración Nexo + FIVE Mascotas

Actualizado el 29 de septiembre de 2026. Los dos documentos originales eran idénticos. Esta versión describe la implementación local y sus límites; sustituye el diseño inicial en ambos repositorios. Guía operativa: `Nexo/GUIA_PRUEBA_CAMARA_FIVE.md`.

## Implementado para pruebas

1. **Lector con cámara** en el POS del teléfono y como lector enlazado a una caja por PIN. Lectura única, sonido, vibración, permiso de cámara y errores comprensibles. El sonido de la modalidad enlazada confirma reenvío del servidor, no cobro ni recepción final del carrito.
2. **Cotizaciones** multitenant: folio COT-YYYY-000001, vigencia, estados, snapshots comerciales, precios netos/descuentos/impuestos guardados y PDF comercial con tabla y QR cuando se configura PUBLIC_APP_URL. Interfaz en Nexo para crear, imprimir, marcar enviada, cancelar y convertir.
3. **Conversión transaccional** a pedido confirmado: verifica empresa, sede, cliente, productos activos y stock vendible; reserva exclusivamente al convertir y revierte todo si falla. No reserva stock al cotizar. Repetir la conversión devuelve el pedido existente.
4. **PIM centralizado**: atributos nutricionales y galería, publicación explícita por producto, catálogo público paginado y solo stock de la sede de despacho configurada. No expone costos, clientes ni existencias de otras bodegas.
5. **Checkout FIVE → Nexo** mediante servidor de FIVE con token de alcance por tienda almacenado como hash en Nexo y retornado una sola vez al configurar. Descarta importes, descuentos, tenant y pago enviados por el navegador. Idempotencia UUID evita pedidos duplicados en reintentos con la misma clave.
6. **Compra o cotización desde FIVE**: compra crea pedido confirmado con reserva y pago pendiente; cotización crea oferta enviada sin reserva con PDF descargable. Datos bancarios y QR provienen de configuración de la tienda. No se confirma un pago por mostrar el QR o subir un comprobante.
7. **Sincronización del catálogo para Astro**: `npm run nexo:sync` y reconstrucción generan páginas/comparador desde productos publicados. Precios y stock se consultan al cargar la web y se verifican de nuevo al enviar; no hay streaming continuo.
8. **Migración formal aditiva** `202609300001_quotations_storefront` e importador DML separado con simulación predeterminada. No se publican productos de demostración ni se inventan existencias.

## Corrección tributaria obligatoria

El diseño original proponía TpoDocRef 802 para cotizaciones y una referencia CodRef 1. **802 identifica una nota de pedido**, no una cotización. No corresponde usar ese XML como respaldo tributario de la consolidación propuesta. Se eliminó esa receta y el backend rechaza CONSOLIDATED_QUOTATION hasta definir y certificar una representación válida con el SII.

Las cotizaciones PDF son ofertas comerciales, no documentos tributarios. El modo ITEMIZED no equivale a una emisión real habilitada: el adaptador fiscal real sigue pendiente. No se añadió un switch de interfaz que prometa una modalidad fiscal inválida.

Referencia oficial: [formato SII](https://www.sii.cl/factura_electronica/factura_mercado/formato_boletas_elec_202412.pdf).

## API final

Todas las rutas siguientes tienen prefijo `/api/v1`:

| Ruta | Acceso y función |
|---|---|
| POST /quotations | Sesión, CSRF, orders:manage; crear oferta |
| GET /quotations | Sesión, orders:view; paginación y filtros |
| GET /quotations/:id | Sesión, orders:view; empresa y sede autorizadas |
| GET /quotations/:id/pdf | Sesión, orders:view; PDF desde snapshots |
| POST /quotations/:id/status | Sesión, CSRF, orders:manage; transición |
| POST /quotations/:id/convert-to-order | Sesión, CSRF, orders:manage; reserva transaccional |
| GET /public/quotations/:token/verify | Verificación limitada, sin receptor/precios |
| POST /storefront/initialize-five | Sesión, CSRF, catalog:manage; campos personalizados |
| GET /storefront | Sesión, catalog:manage; configuración sin token |
| PUT /storefront | Sesión, CSRF, roles:manage; configura y rota token |
| PUT /storefront/products/:id | Sesión, CSRF, catalog:manage; publica y actualiza atributos |
| GET /public/catalog?store=slug | Solo catálogo publicado y tarifas públicas |
| POST /integrations/storefront/:slug/checkout | Token servidor e Idempotency-Key UUID v4 |
| GET /integrations/storefront/:slug/quotations/:key/pdf | Token servidor y clave de solicitud |

El navegador de FIVE llama a su propio `/api/nexo/checkout`; nunca recibe el secreto ni accede al endpoint administrativo de pedidos. No se utiliza POST /orders desde el navegador para esta integración.

## Límites y siguiente fase

- Configurar datos reales, cargar stock, publicar productos y activar el servidor de FIVE. No se hizo despliegue ni migración de producción.
- Prueba física Android/iOS, cámara, conexión con caja y venta completa con turno abierto.
- Despacho: se informa y valida una tarifa separada del total de productos, todavía sin línea fiscal de venta. Piloto recomendado con retiro sin cargo; cerrar contabilidad del despacho antes de cobrarlo.
- Pedidos impagos: vencimiento registrado a 24 horas, sin cancelación automática. Cancelar manualmente para liberar reservas hasta implementar el worker.
- Portal/historial de clientes y seguimiento web de pedidos Nexo aún pendientes. El checkout evita enlazar al seguimiento local antiguo.
- Terminales bancarias y conciliación de pago no se implementaron en este cambio.
- SII: cada empresa debe ser emisora autorizada para sus documentos, con folios y firmante propios. Ser proveedor no habilita a sus clientes. Cambio de software y boletas requieren verificar sus respectivos procedimientos.
- Factura consolidada solo después de validar el fundamento y los formatos con SII. No usar 802 como cotización.

## Criterio de aceptación del piloto

Escanear añade una sola línea/cantidad correcta y emite sonido; desconocidos fallan sin añadir. La cotización conserva importes tras cambios del catálogo, no reserva inicialmente y convierte una sola vez con stock suficiente. El catálogo excluye costos y datos privados. Checkout rechaza token inválido, precios manipulados y stock insuficiente; mantiene pago pendiente. Revisar también desconexiones, permiso denegado y operación en teléfono real.

Se probaron cálculos, concurrencia y aislamiento en PostgreSQL aislado, compilación Android/Web y flujos Playwright con API/cámara de prueba. Esto no sustituye certificación SII ni validación de producción. Ver la guía para comandos, configuración, limitaciones y reversión sin borrar datos.
