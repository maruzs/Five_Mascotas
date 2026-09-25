# REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT / ROPA)
### Conforme al Art. 30 del RGPD (UE) y Principios de Responsabilidad Proactiva de la Ley N° 21.719 (Chile)

> **Instrucciones de uso:** Este documento constituye el inventario mandatorio de tratamientos de datos personales que debe mantener todo Responsable del Tratamiento (*Data Controller*). Debe actualizarse cada vez que se agregue una nueva tabla a la base de datos, se integre una nueva API externa (pagos, IA, mailing, analítica) o cambie una finalidad de uso.

---

## 1. Identificación del Responsable del Tratamiento
- **Razón Social / Nombre Comercial:** [NOMBRE_DE_TU_STARTUP_O_EMPRESA]
- **RUT / Identificación Fiscal:** [RUT_O_TAX_ID]
- **Domicilio Legal:** [DIRECCIÓN_O_CIUDAD_PAIS]
- **Representante Legal / Fundador:** [NOMBRE_DEL_FUNDADOR]
- **Canal Oficial de Privacidad y DPO Técnico:** `privacidad@[TUDOMINIO.COM]`

---

## 2. Matriz de Actividades de Tratamiento de Datos

| Código | Actividad de Tratamiento | Finalidad Específica | Base de Licitud Legal | Categorías de Datos Tratados | Categorías de Titulares | Destinatarios / Subencargados | Transferencias Internacionales (Garantías) | Plazo de Conservación y Retención | Medidas de Seguridad Técnicas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | **Gestión de Cuentas y Autenticación** | Registro de usuarios, control de sesiones, recuperación de contraseñas y seguridad de acceso. | Ejecución Contractual (Términos de Servicio) | Email, nombre/alias, contraseña hasheada, IPs de conexión, User-Agent. | Usuarios registrados en la plataforma. | Proveedor de Base de Datos y Auth (ej. Supabase / AWS RDS). | EE.UU. / EEE (Bajo EU-US Data Privacy Framework o SCCs 2021/914). | Mientras la cuenta permanezca activa + 30 días tras solicitud de borrado. | Hashing con Argon2id / bcrypt, forzado de TLS 1.3, sesiones con cookies HttpOnly. |
| **ACT-02** | **Procesamiento de Pagos y Facturación** | Cobro recurrente de suscripciones, emisión de facturas o boletas y cumplimiento tributario. | Ejecución Contractual y Cumplimiento de Obligación Legal (Tributaria). | Nombre legal, RUT / Tax ID, dirección de facturación, últimos 4 dígitos de tarjeta de crédito/débito. | Clientes suscriptores y compradores. | Pasarela de Pago (Stripe, Transbank, Mercado Pago) y Servicio de Impuestos Internos (SII). | EE.UU. / Chile (Certificación PCI-DSS Nivel 1). | 6 años a contar del término del año comercial (Art. 17 Código Tributario Chile / IRS). | Tokenización completa en pasarela; ningún dato crudo de tarjeta toca nuestros servidores. |
| **ACT-03** | **Procesamiento con Inteligencia Artificial** | Asistencia automatizada, resúmenes, generación de contenidos o recomendaciones en la app. | Consentimiento Explícito del Usuario y Ejecución Contractual. | Prompts ingresados por el usuario, textos de contexto (PII anonimizada previamente). | Usuarios que utilizan funcionalidades de IA. | Proveedores de API de LLMs (Anthropic, OpenAI Enterprise, Google Cloud Vertex). | EE.UU. (SCCs suscritas; acuerdos con Zero Data Retention - no entrenamiento). | Únicamente durante el tiempo de respuesta HTTP; logs efímeros de hasta 30 días para prevención de abuso. | Cero PII sensible en prompts; claves de API custodiadas en variables de entorno cifradas. |
| **ACT-04** | **Analítica de Producto y Telemetría** | Medición de uso de features, detección de errores técnicos y optimización de rendimiento. | Consentimiento Explícito (Banner de Cookies con opt-in afirmativo). | URLs visitadas, eventos de click, país de origen, resolución de pantalla, IP anonimizada (*masked*). | Visitantes y usuarios de la aplicación web o móvil. | Plataforma de Analítica (ej. PostHog self-hosted o Cloud UE, Google Analytics 4). | Unión Europea / EE.UU. (SCCs suscritas). | 14 meses contados desde la captura del evento analítico. | Bloqueo preventivo de cookies antes del consentimiento; IP truncada; sin fingerprinting cruzado. |
| **ACT-05** | **Comunicaciones Transaccionales y Soporte** | Envío de recibos de pago, alertas de seguridad del sistema y resolución de tickets de ayuda. | Ejecución Contractual e Interés Legítimo en la seguridad de la cuenta. | Email, nombre, historial de tickets de soporte, contenido de consultas técnicas. | Usuarios registrados que solicitan ayuda técnica. | Proveedor de Email Transaccional (Resend, SendGrid, Amazon SES). | EE.UU. / EEE (SCCs suscritas). | Vigencia de la cuenta + 1 año tras la resolución del último ticket de soporte. | Autenticación SPF, DKIM y DMARC activa; cifrado en tránsito TLS. |
| **ACT-06** | **Gestión de Derechos ARCOP-B y Auditoría** | Tramitación de solicitudes de acceso, rectificación, cancelación, oposición, portabilidad y bloqueo. | Cumplimiento de Obligación Legal (Ley N° 21.719 de Chile / RGPD UE). | Formulario de solicitud, copia de verificación de identidad, correo del solicitante, log de ejecución técnica. | Titulares de datos que ejercen sus derechos legales. | Uso interno exclusivo en base de datos de auditoría. | Local / Servidor de la empresa. | 5 años contados desde la resolución de la solicitud (plazo de prescripción de infracciones ante APDP). | Tabla inmutable de auditoría (`arcopb_requests_audit`); acceso restringido a administradores. |

---

## 3. Inventario de Subencargados del Tratamiento (Sub-processors)

| Subencargado | Servicio Prestado | Ubicación de Servidores | Mecanismo de Transferencia Internacional | Enlace a DPA / Términos de Privacidad |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare, Inc.** | CDN, WAF, DNS y Tunneling cifrado | Global / EE.UU. | SCCs de la UE / DPA Enterprise | https://www.cloudflare.com/privacypolicy/ |
| **Stripe, Inc.** | Tokenización y pasarela de cobro | EE.UU. | EU-US Data Privacy Framework / SCCs | https://stripe.com/privacy |
| **Supabase, Inc. / AWS** | Base de datos PostgreSQL y Storage | EE.UU. / Brasil / EEE | SCCs / AWS Data Processing Addendum | https://supabase.com/privacy |
| **Anthropic / OpenAI (API)** | Inferencia de IA (No fine-tuning) | EE.UU. | DPA comercial con Zero Data Retention | https://www.anthropic.com/legal/privacy |
| **Resend, Inc.** | Entrega de emails transaccionales | EE.UU. | SCCs de la UE / DPA | https://resend.com/legal/privacy-policy |

---

## 4. Procedimiento de Actualización Periódica
1. **Revisión Trimestral:** El fundador o responsable técnico debe auditar este documento al cierre de cada trimestre.
2. **Control en Pull Requests:** Antes de fusionar a `main` cualquier PR que añada dependencias en `package.json` o nuevas migraciones en `/prisma` o `/migrations`, se debe verificar si impacta esta matriz.
