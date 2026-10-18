# Matriz de Triaje: ¿Qué Cobrar Sí o Sí vs Qué Bonificar como Regalo?

Cuando el cliente te pasa un documento de requerimientos o surgen ideas durante las entrevistas con operarios, utiliza esta matriz para clasificar cada funcionalidad.

---

## 1. Módulos que DEBES Cobrar Sí o Sí (Innegociables)

Estos módulos conllevan responsabilidad legal, arquitectura compleja, riesgo de seguridad o alto valor financiero para el cliente. **Nunca los regales ni los bonifiques a \$0**:

| Tipo de Funcionalidad | Razón por la que se Cobra Siempre | Rango de Valorización (UF) |
| :--- | :--- | :--- |
| **Integraciones con APIs Externas** (SII, SERVIU, MercadoPago, Webhooks bancarios, GPS) | Implican lidiar con documentación ajena, fallos de red externos y cambios de contratos de API. | **25 a 65 UF** ($950k – $2.5M) |
| **Nuevas Entidades Core en la Base de Datos** (ej. inventario multi-bodega, sistema de cubicación, liquidaciones) | Afectan la arquitectura global, migraciones de datos y consistencia transaccional. | **20 a 50 UF** ($760k – $1.9M) |
| **Motor de Roles y Permisos Granulares** (Perfiles Admin, Supervisor, Auditor, Operario con vistas restringidas) | Aumenta exponencialmente la superficie de seguridad y testing de autorización. | **15 a 40 UF** ($570k – $1.5M) |
| **Aplicación Móvil Nativa / Multiplataforma** (Flutter con sincronización offline y despliegue en tiendas) | Requiere soporte de ciclo de vida móvil, almacenamiento local SQLite y certificados de tiendas. | **60 a 150 UF** ($2.3M – $5.7M) |
| **Generación de Reportes Financieros / Certificados Legales** (Cálculo de impuestos, balances, DTEs) | Si hay un error de cálculo, la responsabilidad financiera recae en el software. | **20 a 45 UF** ($760k – $1.7M) |

---

## 2. Candidatos Ideales a "Regalo Estratégico" (Anclaje de Cortesía)

Estas son funcionalidades que **con herramientas de IA puedes construir en horas**, pero que ante los ojos del cliente tienen un alto valor de percepción operativa. Se listan en la propuesta, se valorizan, y se marcan como **Bonificados $0**:

| Tipo de Funcionalidad | Esfuerzo Real con IA | Valor Percibido / Valorizado en Propuesta |
| :--- | :--- | :--- |
| **Exportadores Rápidos** (Botón "Descargar reporte en Excel / CSV / PDF estilizado") | 30 minutos a 2 horas | **8 a 15 UF** (~$300k – $570k) -> *Bonificado $0* |
| **Automatización de Notificaciones** (Alerta por correo o Telegram/WhatsApp webhook ante un evento) | 1 a 2 horas | **10 a 20 UF** (~$380k – $760k) -> *Bonificado $0* |
| **Filtros Avanzados y Búsqueda en Tablas** (Filtro por rango de fechas, estado, operario) | 1 hora | **6 a 12 UF** (~$230k – $450k) -> *Bonificado $0* |
| **Dashboard de Estadísticas Rápidas** (KPI cards con contadores y gráficos visuales resumen) | 2 a 4 horas | **15 a 30 UF** (~$570k – $1.1M) -> *Bonificado $0* |
| **Modo Oscuro / Personalización de Marca** (Paleta de colores corporativos del cliente) | 1 hora | **5 a 10 UF** (~$190k – $380k) -> *Bonificado $0* |

---

## 3. La Regla del 20% Máximo de Bonificación

* **Límite saludable:** El valor total de los módulos bonificados **nunca debe superar el 20% al 30% del valor total del contrato**.
* **Ejemplo sano:** Proyecto contratado por **130 UF**. Módulos de cortesía valorizados en **30 UF** (Bonificados $0). Total percibido: **160 UF** por **130 UF**.
* **Peligro:** Si el contrato es de 50 UF y regalas módulos valorizados en 100 UF, el cliente sospechará que los precios están totalmente inflados o inventados.
