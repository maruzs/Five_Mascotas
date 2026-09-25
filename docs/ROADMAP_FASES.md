# 🗺️ Hoja de Ruta y Plan de Fases — FIVE Mascotas

Este documento define las etapas maestras del desarrollo del e-commerce oficial **FIVE Mascotas**, estableciendo el alcance funcional, la arquitectura técnica y el estado de cada fase acordada en el diseño del producto.

---

## 📌 Resumen de Arquitectura y Decisiones Clave
1. **Frontend / Storefront:** Astro + TypeScript + CSS nativo optimizado (Zero-scaffold, sin dependencias pesadas innecesarias).
2. **Backend & Persistencia:** Backend integrado con endpoints seguros (SSR/Node) y almacenamiento persistente para pedidos, cuentas y configuraciones.
3. **Pagos y Cobro:** Dual pricing transparente (*Transferencia/Efectivo* con código QR en pantalla vs *Tarjeta Débito (+5%)*). Confirmación y comprobantes vía WhatsApp interactivo.
4. **Despacho:** Tarifa plana configurable por comuna/ciudad de Chile con horario límite de corte.
5. **Ecosistema B2B:** Sincronización de pedidos y stock con **Nexo** actuando como ERP central de operaciones y catálogo maestro.

---

## 🚀 Fases del Proyecto

### 🟢 FASE 1: Experiencia de Compra, Comparador y Checkout QR (En curso)
> **Objetivo:** Brindar a los clientes una experiencia de compra asistida de alto valor, checkout guiado con código QR para transferencias bancarias y rastreo de envíos.

* [ ] **1.1 Comparador Nutricional y de Ingredientes (`/comparador`):**
  * Vista interactiva lado a lado para comparar hasta 3 alimentos.
  * Análisis de los primeros 5 ingredientes (detección de carnes nobles vs subproductos/harinas).
  * Comparación de proteína %, grasa %, presencia de granos (*Grain-Free*) y relación calidad/precio.
  * Arquitectura preparada para importar automáticamente la base de datos de ingredientes vía CSV cuando esté lista.
* [ ] **1.2 Flujo de Checkout Modal en Tienda (Paso a Paso):**
  * **Paso 1:** Datos de entrega y comuna seleccionada con cálculo de tarifa plana.
  * **Paso 2:** Selección de medio de pago (*Transferencia/Efectivo* vs *Débito*).
  * **Paso 3:** Pantalla de pago con **Código QR** escaneable para transferir (muestra y copia datos de la cuenta en el celular) + Datos bancarios en texto con botón de copia en un clic.
  * **Paso 4:** Generación de código único de seguimiento (ej: `FIVE-TRK-7842`) y enlace directo para enviar comprobante por WhatsApp.
* [ ] **1.3 Configuración de Cuenta Bancaria en Panel Admin:**
  * Vista en `/admin/despacho` o `/admin/pagos` para definir Banco, Tipo de Cuenta, Número, RUT, Titular y Correo del QR.
* [ ] **1.4 Sistema de Rastreo de Pedidos (`/rastreo`):**
  * Buscador por código de seguimiento o RUT.
  * Línea de tiempo visual de 4 estados: *Recibido (Pendiente de pago) -> Pago Confirmado -> En Preparación / Reparto -> Entregado*.

---

### 🟡 FASE 2: Cuentas de Usuario y Seguridad (Autenticación y Portal de Clientes)
> **Objetivo:** Proteger el panel administrativo con contraseñas seguras y otorgar a los clientes un área privada para consultar su historial de pedidos.

* [ ] **2.1 Autenticación Unificada (Admin y Clientes):**
  * Botón unificado en la cabecera de la tienda: *"Iniciar Sesión / Mi Cuenta"*.
  * Hashing criptográfico con **Argon2id** o **bcrypt** (coste >= 12).
  * Manejo de sesión mediante Cookies HTTP `HttpOnly`, `Secure` y `SameSite=Lax` (cero tokens en `localStorage`).
* [ ] **2.2 Portal de Clientes (`/mi-cuenta`):**
  * Visualización de pedidos anteriores y estado del pedido activo.
  * Direcciones de despacho guardadas para agilizar futuras compras.
* [ ] **2.3 Protección del Panel de Administración (`/admin`):**
  * Middleware de autenticación obligatorio para rutas administrativas con rol `admin`.
  * Bloqueo contra ataques de fuerza bruta y limitación de tasa de peticiones (*rate-limiting*).

---

### 🟠 FASE 3: Ecosistema Nexo, App PWA y Notificaciones en Tiempo Real
> **Objetivo:** Conectar la tienda con Nexo como ERP central y facilitar la operación diaria del personal con notificaciones instantáneas de nuevos pedidos.

* [ ] **3.1 Sincronización Bidireccional con Nexo:**
  * Envío automático de nuevos pedidos creados en FIVE Mascotas hacia la API de Nexo.
  * Actualización de estados de pago y despacho desde Nexo hacia FIVE Mascotas vía Webhooks.
* [ ] **3.2 PWA Administrativa para Despacho:**
  * Aplicación Web Progresiva instalable en smartphones con soporte de notificaciones push de pedidos entrantes.
  * Cambio rápido de estado de pedido (*"Pago Verificado"*, *"En Reparto"*).

---

### 🔵 FASE 4: Despliegue en Servidor Proxmox y Producción
> **Objetivo:** Puesta en marcha definitiva en el clúster Proxmox local con alta disponibilidad y seguridad perimetral.

* [ ] **4.1 Contenedor LXC `apps-core` (`192.168.1.60`):**
  * Empaquetado en Docker con servidor Nginx optimizado y volumen persistente.
* [ ] **4.2 Ingress y Red en `network-master` (`192.168.1.51`):**
  * Proxy host en Nginx Proxy Manager con cabeceras de proxy inverso y subdominio `*.epistia.cl`.
* [ ] **4.3 Túnel Cloudflare (Zero Port-Forwarding):**
  * Tráfico cifrado de punta a punta con SSL Full/Strict.
* [ ] **4.4 Auditoría Pre-Release:**
  * Verificación de cumplimiento legal (Ley 21.719 APDP Chile / GDPR) y suite de pruebas E2E en Playwright.
