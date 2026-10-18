# Protocolo de Entrega Continua, Testing y Mantención Mensual

Este documento define tu flujo operativo real: despliegue temprano en Proxmox, pruebas continuas con el cliente, límites claros de cambios y activación de la mantención mensual.

---

## 1. El Ciclo de Desarrollo y Testing Continuo

1. **Staging Temprano en Proxmox (Día 1):**
   - El sistema se despliega en tu servidor Proxmox con acceso seguro (Cloudflare Tunnel) desde las primeras etapas.
   - El cliente y sus operarios tienen acceso anticipado para interactuar y enviar feedback directo por WhatsApp.
   - **Beneficio para ti:** El cliente encuentra bugs y casos borde durante la marcha, reduciendo drásticamente tus horas de testing manual solitario.

2. **Hito de Cierre: 1 Semana de Testing Formal y Capacitación:**
   - Una vez integrados los módulos acordados, se abre una semana dedicada exclusivamente a:
     - Resolver bugs reportados por el equipo.
     - Ajustes de textos, etiquetas y usabilidad.
     - Capacitación breve a los usuarios clave.

3. **Pago del Último Hito:**
   - Se realiza **al finalizar la semana de testing y capacitación**, con el sistema operando de forma estable.

4. **Inicio de la Mantención Mensual:**
   - Comienza **un mes después del pago completo del software**.
   - El primer mes posterior al pago final queda cubierto como periodo de garantía y estabilización operativa incluido en el valor del proyecto.
   - A partir del día 31 posterior al pago final, se activa el cobro recurrente del plan de mantención seleccionado para asegurar hosting de alta disponibilidad (Proxmox NVMe + Backups R2) y soporte continuo por WhatsApp.

---

## 2. Límites de Cambios: El "Criterio de Impacto de Flujo"

Para proteger tu tiempo sin caer en burocracia rígida, se aplica una regla simple:

### ✅ Cambios Libres (100% incluidos en testing y soporte regular):
* Ajustes de textos, colores, tipografías y orden de elementos.
* Corrección de errores (bugs), validaciones de formularios y mensajes de error.
* Ajustes menores en columnas de reportes o filtros de búsqueda existentes.
* Optimización de flujos de trabajo que resulten incómodos para los operarios.

### ⚠️ Requerimientos Fuera de Alcance (Addendum / Cotización Aparte):
* Creación de nuevas entidades o tablas en la base de datos no contempladas en el levantamiento.
* Creación de roles de usuario totalmente nuevos con permisos y vistas diferenciadas.
* Conexión con nuevas APIs externas (ej. si ahora quieren integrar MercadoPago, SII o GPS de vehículos).
* Módulos completos adicionales (ej. pasar de gestión interna a módulo de logística o facturación).

---

## 3. Planes de Mantención Mensual en UF

* **Plan Base (Hosting NVMe + Backups R2 + Monitoreo):** **2 a 2.5 UF/mes (~$76.000 – $95.000 CLP)**.
* **Plan Operativo Recomendado (Hosting + Soporte WhatsApp + Ajustes menores de flujo):** **3.5 a 5 UF/mes (~$133.000 – $190.000 CLP)**.
* **Plan Partner Evolutivo (Hosting + Soporte prioritario + Horas de nuevos desarrollos menores):** **7 a 12 UF/mes (~$266.000 – $456.000 CLP)**.
