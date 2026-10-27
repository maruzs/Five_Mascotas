# 📋 Documento de Traspaso Técnico y Operativo (Handoff)
## Proyecto: FIVE Mascotas (Storefront & Backend Híbrido)

> **Fecha:** 27 de Octubre de 2026  
> **Estado:** 100% Operativo en Producción  
> **Dominio en Vivo:** [https://five.epistia.cl](https://five.epistia.cl)  
> **Repositorio:** `github.com:maruzs/Five_Mascotas.git` (Rama `main`)  
> **ERP Conectado:** Nexo (`github.com:maruzs/Nexo.git`, Rama `master`)  

---

## 📌 1. Resumen Ejecutivo
Este documento contiene toda la información técnica, comandos y arquitectura necesaria para continuar el desarrollo local en tu laptop sin fricciones, con especial énfasis en el funcionamiento de la **conexión con el ERP Nexo**.

El proyecto consiste en una tienda de nutrición y bienestar animal para Talca y la Región del Maule, construida con arquitectura **SSG (Static Site Generation) + SSR liviano**:
* **Frontend:** Astro 5 + TypeScript + Vanilla CSS optimizado (cero frameworks pesados, 511 páginas estáticas pre-renderizadas).
* **Backend:** Servidor Node.js 22 (`server/index.mjs`) que actúa como API gateway para pasarelas de pago (Webpay Plus, Khipu), cálculo dinámico de despachos y puente seguro hacia Nexo.
* **Infraestructura:** Proxmox VE (LXC 110 `apps-core` en `192.168.1.60`, puerto `3004`), expuesto mediante Nginx Proxy Manager (LXC 101 `network-master`) y Cloudflare Tunnels hacia `five.epistia.cl`.

---

## 🔗 2. Deep-Dive: Conexión e Integración con Nexo ERP

### 2.1. Filosofía Arquitectónica: Zero-Trust
La integración con Nexo fue diseñada bajo el principio de **Zero-Trust**:
1. **Cero exposición de credenciales:** Las claves de API y tokens de integración (`NEXO_INTEGRATION_TOKEN`) **jamás** se empaquetan en el cliente del navegador ni en los bundles de Astro. Viven exclusivamente en el proceso Node.js del servidor (`server/nexo.mjs`).
2. **Cero confianza en datos del cliente:** Al momento del checkout, el navegador **no envía precios, totales ni descuentos**. Únicamente envía `{ id, quantity }`. El servidor de Five valida contra Nexo el stock y precio real en caliente.

### 2.2. Diagrama de Interacción
```
[ Navegador del Usuario ]
       │
       │  1. Consulta /api/nexo/status y catálogo en runtime
       ▼
[ Servidor Five (Node.js - Puerto 3004) ]
       │
       │  2. HTTPS + Header: X-Nexo-Integration-Token + Idempotency-Key
       ▼
[ API Privada de Nexo ERP (LXC / Docker) ]
       │
       │  3. Devuelve: { products, shippingRates, stock, bankDetails }
       ▼
[ Validación & Creación de Pedido / Cotización ]
```

### 2.3. Variables de Entorno de Nexo
En el archivo `.env` del servidor o de tu laptop:
```env
# URL base de la API de Nexo (En producción sobre HTTPS; en local puede ser localhost o IP de red)
NEXO_API_URL=https://nexo.epistia.cl/api
# Identificador de la tienda en el multi-tenant de Nexo
NEXO_STORE=five-mascotas
# Token secreto de integración con permisos de lectura de catálogo y creación de órdenes
NEXO_INTEGRATION_TOKEN=nexo_sec_...
```
*Si estas variables no están configuradas, el sistema entra en modo "Fallback Autónomo" (utiliza el catálogo estático local `src/data/pim/catalog.ts` y transferencias bancarias manuales sin arrojar errores).*

### 2.4. Flujo de Sincronización de Catálogo e Inventario
Existen dos niveles de sincronización:

#### A. Sincronización Estática (Build-Time / Snapshot)
* **Script:** [`scripts/sync-nexo-catalog.mjs`](file:///c:/Users/maria/Desktop/Software/Five_Mascotas/scripts/sync-nexo-catalog.mjs)
* **Comando:** `node scripts/sync-nexo-catalog.mjs && npm run build`
* **Mecánica:**
  1. Invoca `nexoCatalogData()` en [`server/nexo.mjs`](file:///c:/Users/maria/Desktop/Software/Five_Mascotas/server/nexo.mjs), paginando de a 100 productos en `public/catalog?store=...`.
  2. Ejecuta `mapCatalog()`: extrae variantes de kilaje (`weightKg`), calcula precios (`priceGross`), extrae stock real (`available`), imágenes y macronutrientes (proteína, grasa, fibra, humedad).
  3. Escribe atómicamente el archivo [`src/data/pim/nexo-catalog.json`](file:///c:/Users/maria/Desktop/Software/Five_Mascotas/src/data/pim/nexo-catalog.json).
  4. Astro lee este JSON y genera todas las fichas estáticas (`/producto/prod-X`).

#### B. Sincronización en Caliente (Runtime en el Navegador)
* **Archivo:** [`src/scripts/store.ts`](file:///c:/Users/maria/Desktop/Software/Five_Mascotas/src/scripts/store.ts)
* **Mecánica:**
  1. Al iniciar la página, se hace un `GET /api/nexo/status`.
  2. Si está habilitado, la tienda consulta `/api/pim` y refresca en memoria los precios reales, disponibilidad de stock (`is-in`, `is-low`, `is-out`) y tarifas de despacho por comuna.
  3. Si un producto se queda sin stock en Nexo, el botón de compra se deshabilita instantáneamente en el storefront sin necesidad de re-compilar la página.

### 2.5. Flujo de Checkout en Nexo
* **Ruta Backend:** `POST /api/nexo/checkout` en [`server/index.mjs`](file:///c:/Users/maria/Desktop/Software/Five_Mascotas/server/index.mjs).
* **Payload que envía el frontend:**
  ```json
  {
    "kind": "sale",
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+56912345678",
      "address": "1 Oriente 123",
      "city": "Talca",
      "rut": "12.345.678-9"
    },
    "shippingRateId": "talca-centro",
    "notes": "Dejar en conserjería",
    "items": [
      { "id": "prod-0", "quantity": 1 }
    ]
  }
  ```
* **Comportamiento ante quiebre de stock:** Si el inventario cambió mientras el usuario navegaba, Nexo responde con código `409 Conflict`. El frontend captura este error e informa amablemente: *"El pedido cambió o no hay stock suficiente. Revisa el carrito."*
* **Generación de Cotización en PDF:** Tras crearse el pedido, Nexo genera un PDF con validez legal/comercial disponible en `/api/nexo/quotations/:id/pdf`.

---

## 💻 3. Puesta en Marcha en tu Laptop

### 3.1. Prerrequisitos
* **Node.js:** Versión 22.x LTS instalada (`node -v`).
* **Git:** Configurado con tu llave SSH de GitHub.

### 3.2. Paso a Paso para Clonar y Ejecutar
1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:maruzs/Five_Mascotas.git
   cd Five_Mascotas
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Configurar el entorno local (`.env`):**
   ```bash
   cp .env.example .env
   ```
   *(Las credenciales de Transbank Webpay Plus ya vienen configuradas con los valores oficiales de prueba).*
4. **Iniciar en modo desarrollo:**
   * Modo Frontend solo (Astro Vite Dev Server):
     ```bash
     npm run dev
     # Acceso en: http://localhost:4321
     ```
   * Modo Completo con Backend Híbrido (Node.js + Checkout + Pasarelas):
     ```bash
     npm run build
     npm run api:dev
     # Acceso en: http://localhost:3004
     ```

### 3.3. Comandos Clave de Verificación
```bash
# Comprobación de tipos y sintaxis Astro (0 errores garantizados)
npx astro check

# Compilación estática de producción (511 páginas)
npm run build

# Suite de pruebas automatizadas (5 suites completas)
npm test
```

---

## 💳 4. Pasarelas de Pago Integradas

| Pasarela | Estado | Modo | Credenciales / Configuración |
| :--- | :--- | :--- | :--- |
| **Webpay Plus (Transbank)** | ✅ Operativa | Integración Oficial | `TBK_COMMERCE_CODE=597055555532`<br>`TBK_API_KEY_SECRET=579B...B1C` |
| **Khipu** | ✅ Operativa | API v3 | Requiere `KHIPU_RECEIVER_ID` y `KHIPU_SECRET_KEY` en producción |
| **Transferencia Bancaria** | ✅ Operativa | Directa | Cuenta BancoEstado Cristian / Five, con copia en 1 clic y QR dinámico |

---

## 🚀 5. Despliegue en Proxmox Homelab (Producción)

Toda la infraestructura está dockerizada dentro del contenedor LXC 110 (`apps-core`).

### 5.1. Topología de Red
* **Dominio:** `five.epistia.cl`
* **Cloudflare Tunnel:** Enruta el tráfico público hacia `network-master` (LXC 101: `192.168.1.51`).
* **Nginx Proxy Manager:** Redirige `five.epistia.cl` al backend en `192.168.1.60:3004`.
* **Zero Port-Forwarding:** No hay puertos 80/443 abiertos en el router residencial.
* **Gestión Out-of-band:** Vía SSH sobre red local o Tailscale (`100.x.x.x`).

### 5.2. Cómo desplegar cambios desde tu Laptop
Una vez que hagas cambios y los subas a Git (`git push origin main`), ejecuta desde tu terminal:
```bash
ssh root@192.168.1.50 "pct exec 110 -- bash -c 'cd /opt/stacks/servicios/Five_Mascotas && git pull origin main && docker compose build && docker compose up -d'"
```
El contenedor reconstruirá las 511 páginas y reiniciará el servicio en ~15 segundos con cero tiempo de inactividad visible.

---

## 🎨 6. Resumen de Mejoras Visuales Recientes (Sprint Actual)
1. **Selector de Formato / Kilajes:** Rango de precios `$MIN - $MAX`, modal QuickSelect en tarjetas y selector por botón de radio en PDP con cálculo dinámico de $/KG.
2. **Buscador Global:** Corregido con página dedicada en `/catalogo` y filtros aislados por especie (perros / gatos).
3. **Ficha Nutricional Grado Veterinario:** Bento grid de 4 cuadrantes (Proteína, Grasa, Fibra, Humedad) con barras de porcentaje y píldoras dinámicas de ingredientes nobles.
4. **Calculador de Despacho y Dropdowns:** Tarjeta blanca estilizada con icono morado, pill de despacho Same-Day y dropdowns universales con chevron SVG corporativo (`#7025a8`).
5. **WhatsApp Mayoristas Ergonómico:** Botón flotante achicado a píldora compacta que no obstruye el contenido al navegar.
6. **Cumplimiento y Despersonalización:** Removido badge de "Compra Segura SSL" y neutralizadas todas las referencias técnicas internas (Gemini / PIM) en favor de textos veterinarios oficiales.
