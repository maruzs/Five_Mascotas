# Checklist de Cumplimiento: Ley N° 21.719 para Startups y Desarrolladores Independientes (Solo-Founders)

Este checklist práctico permite a un programador o fundador independiente en Chile verificar el blindaje legal y técnico bajo la **Ley N° 21.719 de Protección de Datos Personales** sin costos legales externos innecesarios.

---

## 0. Triggers Técnicos para Crear o Actualizar Políticas de Privacidad y Términos

Cada vez que en el código fuente se implemente o modifique alguno de los siguientes componentes, se debe verificar y actualizar `privacy_policy.md` y `terms_of_service.md`:

- [ ] **Captura de Nuevos Datos:** Adición de campos en formularios de registro, onboarding o checkout (ej. RUT, teléfono, dirección, datos biométricos, fecha de nacimiento).
- [ ] **Nuevas Pasarelas de Pago:** Integración de SDKs de Transbank (Webpay), Stripe, Mercado Pago, Fintoc (declarar subencargados de procesamiento financiero).
- [ ] **Nuevos Subencargados Cloud o APIs:** Incorporación de servicios de analítica, mailing (Resend, SendGrid), bases de datos (Supabase, Firebase) o almacenamiento (Cloudflare R2, AWS S3).
- [ ] **Módulos de Inteligencia Artificial:** Funcionalidades que envíen datos de usuarios o prompts a proveedores de LLM (OpenAI, Anthropic, Google Gemini), requiriendo consentimiento específico y cláusulas de transparencia algorítmica.
- [ ] **Sistemas de Scoring o Decisiones Automatizadas:** Módulos que aprueben, rechacen, clasifiquen o restrinjan accesos a usuarios de forma automatizada.

---

## 1. Para tus Productos Propios (SaaS / Apps) — Rol: Responsable del Tratamiento

- [ ] **1. Términos de Servicio (`terms_of_service.md`) Públicos y Actualizados:**
  - Límite de responsabilidad patrimonial directa (tope máximo de 6 a 12 meses de pagos de suscripción).
  - Cláusula de domicilio, legislación aplicable y competencia en tribunales de Santiago de Chile.
  - Notificación expresa si la plataforma utiliza IA para generar contenidos, diagnósticos o recomendaciones.
- [ ] **2. Política de Privacidad (`privacy_policy.md`) Exhaustiva:**
  - Identificación clara del Responsable (nombre/razón social, RUT y canal oficial de privacidad: `privacidad@tudominio.cl`).
  - Mención explícita a la **Ley N° 21.719 de Chile** y estándares internacionales (GDPR/CCPA si opera globalmente).
  - Lista transparente de proveedores de infraestructura y subencargados externos.
  - Finalidades del tratamiento explícitas y bases de licitud asociadas.
- [ ] **3. Consentimiento Válido y Libre:**
  - Ninguna casilla de verificación premarcada (*opt-in* explícito).
  - Leyenda clara en el registro: *"Al crear tu cuenta, aceptas nuestros Términos de Servicio y confirmas haber leído nuestra Política de Privacidad"*.
- [ ] **4. Cookies y Rastreadores (Privacidad por Diseño):**
  - Bloqueo preventivo de scripts de rastreo analítico y publicitario (Google Analytics, Meta Pixel) antes del consentimiento afirmativo del usuario en el banner de cookies.
- [ ] **5. Canal y Procedimiento para Derechos ARCOP-B (Art. 11):**
  - Reconocimiento de derechos: **Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Bloqueo**.
  - **Plazo Fatal Legal:** Responder obligatoriamente en un plazo máximo de **15 días corridos** desde la recepción de la solicitud del titular (prohibido estipular "10 a 15 días" o días hábiles).
  - Procedimiento formal y gratuito mediante correo o endpoint de autoservicio.
- [ ] **6. Soporte Técnico para el Derecho de Bloqueo en Base de Datos:**
  - Capacidad de marcar registros de usuario con flag de bloqueo (`status = 'blocked'`, `is_blocked = true`, `blocked_at = NOW()`).
  - Durante el bloqueo, los datos no se eliminan físicamente (conservación probatoria o para litigios), pero se excluyen de procesamiento comercial, marketing, analítica y queries activas.
- [ ] **7. Gobernanza de Decisiones Automatizadas e IA (Art. 8 bis):**
  - Ningún usuario puede ser objeto exclusivo de decisiones automatizadas que generen efectos jurídicos o lo afecten de forma sustancial sin garantía de intervención humana.
  - Canales claros para solicitar explicaciones sobre la lógica del algoritmo e impugnar la decisión.
- [ ] **8. Protocolo de Notificación de Brechas a la APDP (Art. 34):**
  - Procedimiento interno para documentar y notificar a la **Agencia de Protección de Datos Personales (APDP)** y a los titulares afectados en un plazo fatal de **72 horas** contadas desde la toma de conocimiento confirmado del incidente.

---

## 2. Para Proyectos a Pedido de Clientes Terceros — Rol: Encargado del Tratamiento

- [ ] **1. Anexo DPA Firmado con Cada Cliente:**
  - Anexar el [Acuerdo de Encargo de Tratamiento de Datos (DPA)](../resources/dpa-template.md) formalizado a toda cotización o contrato de desarrollo.
- [ ] **2. Estipulación de Propiedad y Mandato Técnico:**
  - Cláusula que declare que los datos del cliente son 100% de su propiedad y tú actúas exclusivamente bajo sus instrucciones técnicas documentadas.
- [ ] **3. Plazo de Reporte de Incidentes al Cliente:**
  - Compromiso de informar al cliente a la brevedad posible (máximo 24 horas) tras confirmar una brecha de seguridad, para que el cliente pueda notificar formalmente a la APDP dentro de las **72 horas** legales.
- [ ] **4. Límite de Responsabilidad Indemnizatoria:**
  - Topar cualquier contingencia civil al valor de los honorarios facturados en los últimos 6 meses para blindar tu patrimonio personal.
- [ ] **5. Procedimiento Seguro al Cierre del Proyecto:**
  - Entrega de respaldo estructurado (SQL/JSON) al cliente y destrucción segura/certificada de copias de prueba en tus servidores locales o entornos de staging.

---

## 3. Seguridad de Infraestructura Técnica Propia (Proxmox + Cloudflare + NPM)

- [ ] **1. Cero Puertos Expuestos:** Conexión entrante 100% canalizada vía Cloudflare Tunnel (`cloudflared`). Router doméstico con NAT estricto y sin UPnP.
- [ ] **2. DNSSEC Habilitado:** En NIC.cl con registro DS sincronizado con Cloudflare para mitigar ataques de DNS spoofing.
- [ ] **3. Aislamiento Físico/Lógico en Proxmox:** Contenedores LXC sin privilegios (*Unprivileged*), firewalls de Proxmox VE activos y VLANs separadas entre proyectos propios y de clientes.
- [ ] **4. Cifrado en Reposo y Tránsito:** Discos con cifrado LUKS/ZFS en el servidor Proxmox; forzado de TLS 1.3 con certificados SSL automáticos en NPM.
- [ ] **5. Cabeceras HTTP de Seguridad (Security Headers):**
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] **6. Backups Cifrados Externos:** Respaldos automáticos diarios de bases de datos volcados a almacenamiento remoto (ej. Cloudflare R2 con cifrado del lado del cliente).
- [ ] **7. Enlaces de Acceso Temporal (URLs Prefirmadas):** Acceso a documentos privados mediante tokens firmados con caducidad no superior a 15 minutos.
- [ ] **8. Cero Filtración de Datos a IA Pública:** Estricta prohibición de cargar variables de entorno (`.env`), llaves privadas o bases de datos de clientes en chats o modelos de IA públicos.
