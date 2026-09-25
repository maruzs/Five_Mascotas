---
name: legal-compliance
description: >-
  Expert legal and regulatory compliance engineering workflow for digital products, SaaS platforms, and mobile applications.
  Specialized for solo-founders, bootstrapped startups, and small dev teams operating under Chilean Law N° 21.719 (APDP),
  EU GDPR, EU AI Act (Reg. 2024/1689), US CCPA/CPRA, FTC AI Transparency guidelines, and Mobile App Store policies (Apple Guideline 5.1 & Google Play Data Safety).
  Activates proactively ONLY when personal data is collected, stored, processed, or transferred (auth/login, account deletion flows,
  payment gateways, database schemas with PII, analytics/tracking, third-party sub-processors, AI/LLM integrations, email delivery/RFC 8058),
  while maintaining strict operational silence during pure algorithmic, CSS, styling, or development tooling tasks.
---

# Legal & Privacy Compliance Engineering Skill
### Estándar Global Unificado: Chile (Ley N° 21.719), Unión Europea (GDPR & EU AI Act), EE.UU. (CCPA/CPRA & FTC) y Mobile App Stores (Apple & Google Play)

Esta skill capacita al agente para desempeñarse como **Principal Legal Engineer, DPO (Data Protection Officer) corporativo y Auditor de Cumplimiento Regulatorio Internacional**, diseñado específicamente para emprendedores unipersonales (*solo-founders*), desarrolladores independientes y pequeños equipos de software.

**Objetivo Fundamental:** Blindar al producto y al fundador al 100% —tanto a nivel contractual/documental como en la arquitectura de código y base de datos— eliminando riesgos de multas millonarias, bloqueos de pasarelas de pago, listas negras de correo electrónico y rechazos en las tiendas de aplicaciones (Apple App Store y Google Play), sin requerir costosos bufetes de abogados externos ni burocracia corporativa inútil.

---

## 1. Guardrails de Comportamiento: Activación Inteligente y Silencio Operativo

El agente debe operar con criterio quirúrgico: **máxima proactividad cuando hay riesgo sobre datos personales o sanciones regulatorias, cero fricción cuando se programa lógica pura.**

```text
                               ┌────────────────────────────────┐
                               │ ¿El código actual toca datos   │
                               │ personales de usuarios (PII) o │
                               │ flujos normativos sensibles?   │
                               └───────────────┬────────────────┘
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
                    [ SÍ ]                                            [ NO ]
         ┌─────────────────────────┐                       ┌─────────────────────────┐
         │ ¿Qué componente es?     │                       │ SILENCIO OPERATIVO      │
         ├─────────────────────────┤                       │ Continuar con la tarea  │
         │ • Auth / Registro       │                       │ técnica sin alertas ni  │
         │ • Esquema DB / PII      │                       │ disrupciones legales.   │
         │ • Pagos / Facturación   │                       └─────────────────────────┘
         │ • Borrado de cuenta     │
         │ • APIs de IA / LLMs     │
         │ • Tracking / Cookies    │
         │ • Envíos de Email       │
         │ • Permisos Móviles      │
         └────────────┬────────────┘
                      │
                      ▼
         ┌─────────────────────────────────────────────────────────────┐
         │ ACTIVACIÓN PROACTIVA BREVE                                  │
         │ 1. Sugerir/generar documento legal o cláusula requerida.   │
         │ 2. Aplicar salvaguarda técnica en DB, Backend o Frontend.   │
         │ 3. Notificar impacto en RAT (Registro de Tratamiento).      │
         └─────────────────────────────────────────────────────────────┘
```

### Triggers de Activación Proactiva (Intervención Obligatoria)
El agente debe activarse proactivamente e indicar los requisitos legales aplicables siempre que el desarrollador cree, modifique, audite o refactorice:
1. **Formularios de Captura & Onboarding:** Formularios de registro, captura de RUT/DNI/SSN, teléfonos, direcciones, fecha de nacimiento o perfiles de usuario.
2. **Autenticación y Sesiones:** Flujos de login, registro con redes sociales (Google, Apple, GitHub SSO), recuperación de contraseñas, almacenamiento de tokens o cookies de sesión.
3. **Flujos de Eliminación de Cuenta:** Rutas, pantallas o botones de "Eliminar cuenta" o "Dar de baja" (cumplimiento perentorio Apple 5.1.1(v) y Google Play).
4. **Pasarelas de Pago & Facturación:** Integraciones con Stripe, Mercado Pago, Transbank (Webpay), Fintoc, Paddle o Lemon Squeezy (datos de facturación, retención contable, subencargados).
5. **Modelos y Esquemas de Base de Datos:** Migraciones o modelos (Prisma, Drizzle, TypeORM, SQL DDL) que introduzcan tablas como `users`, `profiles`, `audit_logs`, `payments`, `devices` o campos identificadores.
6. **Llamadas a Modelos de IA / LLMs:** Endpoints que envíen prompts, contexto de usuario, transcripciones o documentos a APIs de terceros (OpenAI, Anthropic, Gemini, Groq, Mistral).
7. **Analítica y Cookies:** Instalación de SDKs o scripts de tracking (Google Analytics 4, Meta Pixel, PostHog, Mixpanel, Hotjar, Sentry con PII).
8. **Envíos de Correo Electrónico Masivo:** Newsletters, alertas o marketing por email (verificación de cabeceras RFC 8058 One-Click Unsubscribe y ley anti-spam).
9. **Permisos Móviles Sensibles:** Declaración de permisos en `Info.plist` (iOS) o `AndroidManifest.xml` (geolocalización, cámara, contactos, IDFA/ATT, notificaciones push).

### Principio de Silencio Operativo (Cero Interrupciones en Código Puro)
El agente **TIENE PROHIBIDO** emitir advertencias legales o sugerir políticas cuando la tarea del desarrollador consista en:
- Algoritmos matemáticos, estructuras de datos, manipulación de matrices o procesamiento numérico.
- Maquetación y estilizado puro (CSS, Tailwind, animaciones framer-motion, SVG, temas claro/oscuro).
- Web scraping o consumo de APIs de fuentes públicas abiertas que **no** recopilen datos personales ni perfiles individuales.
- Optimización de performance (Core Web Vitals, índices de DB ajenos a PII, compresión de bundles, tree-shaking).
- Configuración de tooling de desarrollo local (Dockerfiles base, linters, configuraciones de TypeScript, scripts de test unitario para funciones puras).

---

## 2. Matriz de Marcos Normativos Globales Obligatorios

| Jurisdicción / Plataforma | Norma / Marco | Obligación Legal Principal | Requisito Técnico Concreto en Código |
| :--- | :--- | :--- | :--- |
| **Chile** | **Ley N° 21.719 (APDP)** | Derechos ARCOP-B (Acceso, Rectificación, Cancelación, Oposición, Portabilidad, **Bloqueo**). Plazo fatal: **15 días corridos**. | Campo `status = 'blocked'` en DB. Notificación de brechas en **72h** a APDP / **24h** encargado a responsable. Intervención humana en IA (Art. 8 bis). |
| **Unión Europea** | **GDPR (RGPD)** | Licitud del tratamiento (Art. 6), consentimiento expreso (Art. 7), derecho al olvido (Art. 17), transferencias internacionales vía SCCs. | Registro de Tratamiento (RAT Art. 30). Cookies con opt-in previo. DPA formal con subencargados cloud. Notificación en **72h** (Art. 33). |
| **Unión Europea** | **EU AI Act (Reg. 2024/1689)** | Categorización de riesgos de IA, prohibición de prácticas oscuras/manipulación y **transparencia de contenido sintético** (Art. 50). | Marcado legible por máquinas de contenido generado por IA (*watermarking* / metadatos), disclosure explícito al usuario, no biometría sin base. |
| **Estados Unidos** | **CCPA / CPRA** (California) | Transparencia en recolección, derecho a "Do Not Sell/Share My Info", limitación de datos sensibles (SPI). | Link visible en footer o endpoint opt-out. Respeto al header `Sec-GPC` (Global Privacy Control). |
| **Estados Unidos** | **COPPA** (Menores) | Protección estricta a menores de 13 años. Consentimiento parental verificable. | Age-gating obligatorio si el producto no es apto para menores o recolecta datos de niños. |
| **Estados Unidos** | **FTC AI Guidelines** | Veracidad algorítmica y prohibición de uso de PII para reentrenamiento de IA sin consentimiento afirmativo. | Enrutamiento a endpoints Enterprise/API con Zero Data Retention (ZDR). Términos claros sobre IA. |
| **Email Global** | **RFC 8058 (Google/Yahoo)** | Desuscripción instantánea obligatoria en 1 solo click para evitar listas negras y multas de spam. | Cabeceras HTTP/SMTP `List-Unsubscribe` y `List-Unsubscribe-Post: List-Unsubscribe=One-Click` en mailing. |
| **Apple iOS** | **App Store Guideline 5.1** | Privacidad por diseño, App Tracking Transparency (ATT), Privacy Nutrition Labels y **Borrado de cuenta in-app**. | Botón de borrado directo dentro de la app (5.1.1(v)), revocación de Apple Sign-In token, `PrivacyInfo.xcprivacy`. |
| **Google Android** | **Google Play Policy** | Data Safety Section, política de permisos sensibles y borrado de cuenta in-app y web. | URL pública web de solicitud de borrado de cuenta para usuarios que desinstalaron la app. |

---

## 3. Desglose Normativo Detallado

### 3.1. Chile: Ley N° 21.719 (APDP)
1. **Derechos ARCOP-B (Art. 11):**
   - **Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Bloqueo**.
   - **Plazo Fatal:** **15 días corridos** contados desde la recepción de la solicitud. Es ilegal estipular días hábiles o ventanas difusas (como "10 a 15 días").
   - **Gratuidad:** El ejercicio es 100% gratuito para el titular.
2. **Derecho de Bloqueo en Base de Datos:**
   - Cuando el titular solicita rectificación, cancelación u oposición, o cuando los datos no se deban usar pero deban conservarse para fines legales, el sistema **no debe destruir físicamente el registro**.
   - Se debe congelar mediante el estado `status = 'blocked'`.
   - **Efecto Operativo:** El registro queda excluido de envíos de email, campañas de marketing, procesamiento algorítmico y consultas operativas activas, pero preservado de forma inmutable para auditoría o litigios.
3. **Notificación de Brechas de Seguridad (Art. 34):**
   - El Responsable debe reportar a la **Agencia de Protección de Datos Personales (APDP)** y a los titulares afectados en un plazo máximo de **72 horas** desde la confirmación del incidente.
   - El Encargado (desarrollador o proveedor SaaS) debe notificar al Responsable a más tardar en **24 horas**.
4. **Decisiones Automatizadas e IA (Art. 8 bis):**
   - Todo titular tiene derecho a no ser objeto de decisiones basadas únicamente en procesamiento automatizado o perfilamiento (*profiling*) que generen efectos jurídicos o lo afecten de forma relevante.
   - **Garantías en Software:** Derecho a solicitar intervención humana, derecho a conocer los criterios lógicos generales aplicados y canal directo de impugnación.

### 3.2. Unión Europea: GDPR (RGPD) y EU AI Act
1. **GDPR (Reglamento UE 2016/679):**
   - Bases de licitud (Art. 6): Consentimiento (Art. 7), Ejecución contractual, Interés legítimo ponderado, Cumplimiento de obligación legal.
   - Transferencias Internacionales (Art. 44-49): Exigencia de Cláusulas Contractuales Tipo (SCCs / UE 2021/914) con proveedores de EE.UU. o terceros países.
   - Registro de Actividades de Tratamiento (RAT / ROPA - Art. 30).
2. **EU AI Act (Reglamento UE 2024/1689):**
   - **Clasificación del Sistema:**
     * *Riesgo Inaceptable (Prohibido):* Puntuación social, manipulación subliminal, categorización biométrica por opiniones políticas/religiosas.
     * *Alto Riesgo (High Risk):* Selección de personal (screening de CVs), scoring crediticio, acceso a servicios esenciales de salud/educación (requiere gestión de riesgos documentada y supervisión humana estricta).
     * *Riesgo Limitado / GPAI:* Asistentes y herramientas SaaS basadas en LLMs (OpenAI, Anthropic).
   - **Marcado de Contenido Sintético (Art. 50):** Los generadores de texto, audio, imagen o video mediante IA deben marcar el contenido de forma legible por máquinas (*machine-readable watermarking*) e informar claramente al usuario que interactúa con un sistema de IA o visualiza contenido artificial.

### 3.3. Estados Unidos: CCPA/CPRA, COPPA y FTC AI Guidelines
1. **CCPA/CPRA (California):**
   - Enlace visible: *"Do Not Sell or Share My Personal Information"* y *"Limit the Use of My Sensitive Personal Information"*.
   - Respeto a señales automáticas de preferencia del navegador (`Sec-GPC = 1`).
   - Cero discriminación: No degradar el servicio a usuarios que ejercen sus derechos.
2. **COPPA (Menores de 13 años):**
   - Si la plataforma no está dirigida a menores, declarar expresamente en los Términos que el servicio es exclusivo para mayores de 13/18 años y bloquear registros no aptos (*age gate*).
   - Si recopila datos de niños, mecanismo de Consentimiento Parental Verificable (VPC).
3. **FTC AI Guidelines & Enforcements:**
   - Prohibición de reclamos falsos sobre capacidades de IA y prohibición expresa de usar PII para reentrenar modelos sin consentimiento previo afirmativo.

### 3.4. Requisitos Perentorios de Tiendas Móviles (Apple & Google)
1. **Apple App Store Review Guidelines (Sección 5.1 Privacidad):**
   - **Guideline 5.1.1(v) - Borrado de Cuenta In-App:** Si la app permite crear cuenta, **DEBE** permitir borrarla in-app (no redirecciones a web ni emails). Borrado o anonimización total y revocación de *Sign in with Apple* vía `https://appleid.apple.com/auth/revoke`.
   - **App Tracking Transparency (ATT):** Diálogo `requestTrackingAuthorization` antes de leer el IDFA o rastrear.
   - **Privacy Manifest (`PrivacyInfo.xcprivacy`):** Declaración de Required Reason APIs (`UserDefaults`, `FileTimestamp`, etc.).
2. **Google Play Store:**
   - **Data Safety Section:** Declarar de forma exhaustiva qué datos se recopilan y si se comparten.
   - **URL Pública de Solicitud de Borrado:** Google Play exige una web pública accesible para usuarios que desinstalaron la app.

---

## 4. Arquitectura de Base de Datos y Código de Soporte

### 4.1. Máquina de Estados de Usuario para Cumplimiento ARCOP-B
```text
                  ┌──────────────────────┐
                  │        ACTIVE        │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
    (Solicitud Bloqueo)               (Solicitud Borrado)
            │                                 │
            ▼                                 ▼
   ┌──────────────────┐             ┌────────────────────┐
   │     BLOCKED      │────────────▶│     ANONYMIZED     │
   │ (Congelado legal)│             │(Borrado seguro PII)│
   └────────┬─────────┘             └────────────────────┘
            │
    (Rechazo / Alzamiento)
            │
            ▼
   ┌──────────────────┐
   │      ACTIVE      │
   └──────────────────┘
```

### 4.2. DDL SQL para PostgreSQL / Supabase
```sql
-- 1. Tipo Enum para ciclo de vida de cumplimiento
CREATE TYPE user_compliance_status AS ENUM ('active', 'blocked', 'anonymized', 'deleted');

-- 2. Modificación de la tabla de usuarios
ALTER TABLE users ADD COLUMN compliance_status user_compliance_status DEFAULT 'active' NOT NULL;
ALTER TABLE users ADD COLUMN blocked_at TIMESTAMPTZ NULL;
ALTER TABLE users ADD COLUMN block_reason TEXT NULL;
ALTER TABLE users ADD COLUMN anonymized_at TIMESTAMPTZ NULL;
ALTER TABLE users ADD COLUMN deletion_requested_at TIMESTAMPTZ NULL;

-- 3. Tabla inmutable de auditoría de derechos ARCOP-B (Trazabilidad legal de 15 días corridos)
CREATE TABLE arcopb_requests_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('ACCESS', 'RECTIFICATION', 'CANCELLATION', 'OPPOSITION', 'PORTABILITY', 'BLOCKING')),
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deadline_at TIMESTAMPTZ NOT NULL, -- Exactamente requested_at + INTERVAL '15 days'
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'COMPLETED', 'REJECTED')),
    completed_at TIMESTAMPTZ NULL,
    resolution_notes TEXT NULL,
    requester_email VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(10) DEFAULT 'CL' -- 'CL', 'EU', 'US'
);

-- 4. Índice para alertar vencimiento de plazos de 15 días corridos
CREATE INDEX idx_arcopb_pending_deadlines ON arcopb_requests_audit (deadline_at) WHERE status = 'PENDING';
```

### 4.3. Estrategia de Borrado Seguro: Anonimización Criptográfica Irreversible
> [!IMPORTANT]
> **El dilema del Solo-Founder:** Ejecutar un `DELETE FROM users WHERE id = :id` en cascada destruye las tablas de transacciones financieras (`invoices`, `orders`, `subscriptions`), violando las normativas tributarias (SII en Chile exige conservar registros contables por 6 años; IRS en EE.UU. exige 7 años).
> **La Solución Técnica:** Reemplazar la PII por hashes irreversibles o valores truncados no identificables, preservando el `user_id` como clave foránea íntegra.

```sql
-- Procedimiento almacenado de Anonimización Criptográfica (Derecho al Olvido)
CREATE OR REPLACE FUNCTION anonymize_user_gdpr_arcop(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 1. Verificar si ya fue anonimizado
    IF EXISTS (SELECT 1 FROM users WHERE id = target_user_id AND compliance_status = 'anonymized') THEN
        RAISE EXCEPTION 'El usuario ya ha sido anonimizado.';
    END IF;

    -- 2. Sobrescribir PII en la tabla de usuarios de forma irreversible
    UPDATE users
    SET 
        email = 'anonymized_' || target_user_id || '@privacy-deleted.invalid',
        full_name = 'Usuario Anonimizado',
        phone = NULL,
        rut_tax_id = NULL,
        password_hash = 'DELETED_' || encode(gen_random_bytes(32), 'hex'),
        profile_picture_url = NULL,
        billing_address = NULL,
        metadata = '{}'::jsonb,
        compliance_status = 'anonymized',
        anonymized_at = NOW()
    WHERE id = target_user_id;

    -- 3. Eliminar sesiones activas, tokens de push y tokens OAuth vinculados
    DELETE FROM user_sessions WHERE user_id = target_user_id;
    DELETE FROM oauth_tokens WHERE user_id = target_user_id;
    DELETE FROM push_notification_tokens WHERE user_id = target_user_id;

    -- 4. Registrar en el log de auditoría
    INSERT INTO arcopb_requests_audit (
        user_id,
        request_type,
        requested_at,
        deadline_at,
        status,
        completed_at,
        resolution_notes,
        requester_email
    ) VALUES (
        target_user_id,
        'CANCELLATION',
        NOW(),
        NOW() + INTERVAL '15 days',
        'COMPLETED',
        NOW(),
        'Anonimización criptográfica ejecutada exitosamente preservando integridad referencial contable.',
        'anonymized_' || target_user_id || '@privacy-deleted.invalid'
    );
END;
$$ LANGUAGE plpgsql;
```

### 4.4. Aislamiento Técnico de Usuarios en Estado 'blocked'
```sql
-- Política RLS en Supabase/Postgres: usuarios bloqueados no pueden operar
CREATE POLICY "Permitir solo usuarios activos" ON users
FOR ALL
USING (compliance_status = 'active');
```

En endpoints de mailing o analítica:
```typescript
// Envíos de correo masivo o sincronización con CRM
const activeUsers = await prisma.user.findMany({
  where: {
    compliance_status: 'active', // Excluye 'blocked', 'anonymized' y 'deleted'
  },
});
```

### 4.5. Aislamiento Multi-Tenant para SaaS B2B (Tenant Data Leak Defense)
En aplicaciones multi-empresa, una fuga de datos entre inquilinos es una violación directa de los DPAs y el GDPR. Se debe forzar el aislamiento en base de datos mediante RLS:

```sql
-- Forzar Tenant ID a nivel de conexión en Postgres
ALTER TABLE tenant_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_policy" ON tenant_data
FOR ALL
USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
```

```typescript
// Middleware de backend para inyectar tenant_id en la transacción de Postgres
await prisma.$executeRawUnsafe(
  `SET LOCAL app.current_tenant_id = '${session.tenantId}'`
);
```

### 4.6. Purga Automatizada y Retención (Data Minimization & Auto-Pruning Cron)
El principio de limitación del plazo de conservación exige purgar datos que ya cumplieron su finalidad:

```sql
-- Procedimiento de mantenimiento periódico (ejecutable vía pg_cron o Cron Job de servidor)
CREATE OR REPLACE FUNCTION purge_expired_compliance_data()
RETURNS VOID AS $$
BEGIN
    -- 1. Purgar tokens de sesión y refresh tokens expirados (> 30 días)
    DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '30 days';

    -- 2. Purgar tokens de reseteo de contraseña vencidos (> 24 horas)
    DELETE FROM password_reset_tokens WHERE created_at < NOW() - INTERVAL '24 hours';

    -- 3. Truncar direcciones IP en logs de acceso antiguos (> 90 días) para anonimizarlos
    UPDATE http_access_logs 
    SET ip_address = '0.0.0.0', user_agent = 'ANONYMIZED'
    WHERE created_at < NOW() - INTERVAL '90 days' AND ip_address <> '0.0.0.0';

    -- 4. Purgar carritos de compra abandonados sin registrar compra (> 6 meses)
    DELETE FROM abandoned_carts WHERE updated_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
```

### 4.7. Mecanismo Técnico de Portabilidad de Datos (ARCOP-B Art. 11 / GDPR Art. 20)
La plataforma debe contar con un endpoint seguro de autoservicio que exporte la información en `JSON` empaquetado:

```typescript
// Handler del endpoint: GET /api/user/export-data
export async function handleDataExport(userId: string) {
  // 1. Recopilar datos personales en formato estructurado
  const userProfile = await db.users.findUnique({ where: { id: userId } });
  const userOrders = await db.orders.findMany({ where: { userId } });
  const userAuditLogs = await db.userLogs.findMany({ where: { userId } });

  const exportPayload = {
    metadata: {
      exported_at: new Date().toISOString(),
      format_version: "1.0",
      compliance_standard: "Ley 21.719 / GDPR Art. 20"
    },
    profile: userProfile,
    transactions: userOrders,
    activity_history: userAuditLogs
  };

  // 2. Comprimir o generar enlace firmado temporal (expira en 15 minutos)
  const presignedDownloadUrl = await storageService.generatePresignedDownloadUrl({
    key: `exports/${userId}-${Date.now()}.json`,
    data: JSON.stringify(exportPayload, null, 2),
    expiresInSeconds: 900 // 15 minutos
  });

  return { download_url: presignedDownloadUrl };
}
```

---

## 5. Matriz RAT (Registro de Actividades de Tratamiento / ROPA)

En virtud del **Art. 30 del GDPR** y los principios de responsabilidad proactiva de la **Ley N° 21.719**, el agente debe mantener o generar en la raíz del proyecto un archivo `RAT.md`.

### Protocolo de Inspección Automática del Agente:
Cuando el agente evalúe la base de datos o dependencias, debe completar el RAT cruzando:
1. **Modelos de DB (`schema.prisma`, migraciones SQL, `models.py`):** Mapear columnas con PII (`email`, `phone`, `rut`, `ip_address`, `location`).
2. **Dependencias del proyecto (`package.json`, `requirements.txt`, `go.mod`):**
   - `@stripe/stripe-js`, `transbank-sdk`, `mercadopago` ➔ Finalidad: Cobro y Facturación.
   - `@supabase/supabase-js`, `firebase`, `pg` ➔ Finalidad: Almacenamiento y Autenticación.
   - `openai`, `@anthropic-ai/sdk`, `@google/genai` ➔ Finalidad: Procesamiento por IA.
   - `posthog-js`, `mixpanel`, `@segment/analytics` ➔ Finalidad: Analítica de Producto.
   - `resend`, `@sendgrid/mail` ➔ Finalidad: Comunicaciones Transaccionales.

*(Plantilla completa disponible en [`resources/rat-template.md`](./resources/rat-template.md))*

---

## 6. Frontend y Comunicaciones: Privacidad por Diseño y Anti-Spam

### 6.1. Formulario de Registro con Consentimiento Válido
- **Casillas desmarcadas por defecto (*unticked*):** Prohibido el pre-tildado.
- **Doble aceptación diferenciada:** La aceptación de los Términos/Privacidad va separada de las comunicaciones comerciales de marketing.

```html
<!-- Formulario de Registro con Consentimiento Conforme -->
<form id="register-form" action="/api/auth/register" method="POST">
  <input type="email" name="email" required placeholder="tu@email.com" />
  <input type="password" name="password" required minlength="8" />

  <!-- Consentimiento Contractual Obligatorio -->
  <label class="checkbox-container">
    <input type="checkbox" name="accept_terms" required />
    <span>Acepto los <a href="/terms" target="_blank">Términos de Servicio</a> y he leído la <a href="/privacy" target="_blank">Política de Privacidad</a>.</span>
  </label>

  <!-- Consentimiento de Marketing Opcional (Opt-in expreso) -->
  <label class="checkbox-container">
    <input type="checkbox" name="marketing_consent" />
    <span>Deseo recibir actualizaciones de producto y ofertas (opcional y revocable en cualquier momento).</span>
  </label>

  <button type="submit">Crear Cuenta</button>
</form>
```

### 6.2. Banner de Cookies con Bloqueo Preventivo Real (Vanilla JS)
> [!IMPORTANT]
> Los scripts analíticos y publicitarios deben tener `type="text/plain"` y activarse **únicamente** tras la pulsación de "Aceptar". Cargar Google Analytics antes del click es **100% ilegal**.

```html
<!-- Scripts de Terceros bloqueados preventivamente -->
<script type="text/plain" data-cookie-category="analytics" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script type="text/plain" data-cookie-category="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>

<!-- Banner de Consentimiento -->
<div id="cookie-banner" style="display: none; position: fixed; bottom: 0; width: 100%; background: #1a1a1a; color: #fff; padding: 16px; z-index: 9999;">
  <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
    <p style="margin: 0; font-size: 14px;">
      Utilizamos cookies técnicas para el funcionamiento y analíticas para optimizar tu experiencia. Puedes aceptarlas o mantener solo las necesarias. Consulta nuestra <a href="/cookies" style="color: #4dabf7;">Política de Cookies</a>.
    </p>
    <div style="display: flex; gap: 8px;">
      <button id="cookie-reject-btn" style="padding: 8px 16px; background: transparent; border: 1px solid #666; color: #fff; border-radius: 4px; cursor: pointer;">Solo Necesarias</button>
      <button id="cookie-accept-btn" style="padding: 8px 16px; background: #0070f3; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-weight: bold;">Aceptar Todas</button>
    </div>
  </div>
</div>

<script>
  (function() {
    const COOKIE_CONSENT_KEY = 'user_cookie_consent';
    const banner = document.getElementById('cookie-banner');
    const hasGpcSignal = navigator.globalPrivacyControl === true;

    function activateAnalyticsScripts() {
      document.querySelectorAll('script[data-cookie-category="analytics"]').forEach(script => {
        const activeScript = document.createElement('script');
        if (script.src) activeScript.src = script.src;
        else activeScript.textContent = script.textContent;
        document.head.appendChild(activeScript);
        script.remove();
      });
    }

    const currentConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (currentConsent === 'all' && !hasGpcSignal) {
      activateAnalyticsScripts();
    } else if (!currentConsent && !hasGpcSignal) {
      banner.style.display = 'block';
    }

    document.getElementById('cookie-accept-btn').addEventListener('click', function() {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
      banner.style.display = 'none';
      activateAnalyticsScripts();
    });

    document.getElementById('cookie-reject-btn').addEventListener('click', function() {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'necessary');
      banner.style.display = 'none';
    });
  })();
</script>
```

### 6.3. Cumplimiento Anti-Spam Técnico (RFC 8058 One-Click Unsubscribe)
Desde 2024, Google y Yahoo bloquean correos de remitentes masivos que no implementen el estándar RFC 8058. Todo email de newsletter, marketing o actualización debe incluir en sus cabeceras SMTP/HTTP:

```typescript
// Cabeceras obligatorias en envíos de mailing con Resend, SendGrid o nodemailer
const emailHeaders = {
  "List-Unsubscribe": `<mailto:unsubscribe@tudominio.com?subject=unsubscribe>, <https://tudominio.com/api/unsubscribe?token=${userUnsubscribeToken}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
};
```
El endpoint `POST /api/unsubscribe?token=...` debe procesar la baja de inmediato sin requerir login ni confirmaciones intermedias.

---

## 7. Inteligencia Artificial y LLMs Comerciales

### 7.1. Directriz Técnica: Cero PII en Reentrenamiento
1. **Consumo vía API Comercial (Enterprise/B2B):**
   - Asegurarse de utilizar las APIs oficiales de OpenAI, Anthropic o Google Vertex / Gemini en modo comercial. Estas APIs garantizan **Zero Data Retention** para entrenamiento de modelos base.
   - Queda prohibido usar interfaces web gratuitas de consumidor para tratar datos de usuarios.
2. **Sanitización Previa de Prompts:** Enmascarar RUTs, DNIs, números de tarjeta o emails con tokens sintéticos (`[USUARIO_ID]`, `[EMAIL_REDACTADO]`).

### 7.2. Marcado de Contenido Sintético (EU AI Act Art. 50)
Cuando el software genere imágenes, audio, video o textos extensos con IA, debe inyectar metadatos legibles por máquinas (*C2PA / watermarking*) e incluir la indicación visual: *"Generado por Inteligencia Artificial"*.

### 7.3. Cláusula de Transparencia e Impugnación (Chile Art. 8 bis & FTC)
> *"El usuario reconoce que los resultados de IA son probabilísticos. Si un proceso automatizado genera una decisión que afecte los derechos, estado de cuenta o acceso del usuario al servicio, este tiene derecho a solicitar intervención humana, conocer la lógica aplicada e impugnar la decisión escribiendo a nuestro canal de soporte."*

---

## 8. Cumplimiento Específico en Aplicaciones Móviles (iOS & Android)

### 8.1. Apple App Store: Guideline 5.1.1(v) y Revocación de Apple Sign-In
1. **Botón de Borrado In-App:** Visible en *Configuración ➔ Cuenta ➔ Eliminar Cuenta*.
2. **Revocación de Token en Servidor:**
   ```typescript
   async function revokeAppleToken(authorizationCodeOrRefreshToken: string) {
     const clientSecret = generateAppleClientSecret(); // Llave .p8
     const params = new URLSearchParams({
       client_id: process.env.APPLE_CLIENT_ID!,
       client_secret: clientSecret,
       token: authorizationCodeOrRefreshToken,
       token_type_hint: 'refresh_token'
     });

     await fetch('https://appleid.apple.com/auth/revoke', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: params.toString()
     });
   }
   ```

### 8.2. Google Play Store: Enlace Público de Borrado de Datos
- Registrar en Google Play Console la URL pública: `https://tudominio.com/delete-account`.
- Permite a usuarios que ya desinstalaron la app solicitar la eliminación de sus datos vía web.

---

## 9. Playbook de Notificación de Brechas de Seguridad en 72 Horas

Ante la confirmación de un incidente de seguridad que afecte datos personales:
1. **Horas 0 a 12:** Contención inmediata, aislamiento perimetral, rotación de credenciales y preservación de logs forenses.
2. **Horas 12 a 24:** Cuantificación de titulares y datos comprometidos. Si eres Encargado, notificar al Responsable antes de 24 horas.
3. **Horas 24 a 48:** Remediación de la vulnerabilidad y redacción del informe técnico.
4. **Horas 48 a 72:** Notificación formal ante la **APDP** (Chile) o Autoridad de Control europea y comunicación directa a titulares afectados si existe alto riesgo.

*(Plantillas oficiales de notificación y carta a usuarios en [`resources/breach-notification-template.md`](./resources/breach-notification-template.md))*

---

## 10. Catálogo de Artefactos Legales a Generar por el Agente

Cuando el agente se active en el proyecto, debe generar los siguientes artefactos en formato Markdown sin dejar placeholders ambiguos:

1. **`privacy_policy.md`:** Adaptada a Chile 21.719, GDPR, CCPA, tiendas móviles e IA. *(Plantilla en [`resources/privacy-policy-template.md`](./resources/privacy-policy-template.md))*.
2. **`terms_of_service.md`:** Límite de responsabilidad patrimonial a 6-12 meses, arbitraje, disclaimer de IA y reglas de pago. *(Plantilla en [`resources/terms-of-service-template.md`](./resources/terms-of-service-template.md))*.
3. **`dpa-template.md`:** Anexo de encargo con SCCs europeas, 72h APDP, 24h encargado y no reentrenamiento IA. *(Plantilla en [`resources/dpa-template.md`](./resources/dpa-template.md))*.
4. **`cookie_policy.md`:** Tabla exhaustiva de cookies técnicas/analíticas y revocación. *(Plantilla en [`resources/cookie-policy-template.md`](./resources/cookie-policy-template.md))*.
5. **`RAT.md`:** Matriz de Registro de Actividades de Tratamiento autogenerada tras auditar el código. *(Plantilla en [`resources/rat-template.md`](./resources/rat-template.md))*.
6. **`breach-notification-template.md`:** Formulario oficial de reporte de brechas ante la APDP y carta a usuarios. *(Plantilla en [`resources/breach-notification-template.md`](./resources/breach-notification-template.md))*.

---

## 11. Checklist Integral de Blindaje Técnico-Legal (Pre-Launch Audit - 25 Puntos)

### Documentación Legal & Transparencia
- [ ] 1. `privacy_policy.md` publicada y accesible en footer web y ficha de app stores.
- [ ] 2. `terms_of_service.md` con límite patrimonial (tope 6-12 meses) y disclaimer de IA.
- [ ] 3. Canal oficial de contacto configurado (`privacidad@tudominio.com`).
- [ ] 4. Matriz `RAT.md` generada reflejando DB y dependencias cloud.
- [ ] 5. Anexo `dpa-template.md` listo para contratos B2B o clientes a medida.
- [ ] 6. Playbook de brechas en 72 horas disponible para el equipo.

### Base de Datos & Derechos ARCOP-B
- [ ] 7. Enum `compliance_status` con soporte para `'active'`, `'blocked'`, `'anonymized'`.
- [ ] 8. Procedimiento técnico para congelar usuarios en estado `'blocked'` sin destruirlos.
- [ ] 9. Procedimiento de anonimización criptográfica para preservar integridad contable.
- [ ] 10. Log inmutable (`arcopb_requests_audit`) con alerta de plazo de **15 días corridos**.
- [ ] 11. Endpoint `/api/user/export-data` operativo con JSON estructurado para portabilidad.
- [ ] 12. Script o job programado de purga periódica de datos expirados (tokens, logs >90d).
- [ ] 13. Aislamiento Multi-Tenant con RLS forzado (`tenant_id`) en SaaS B2B.

### Frontend, Email & Consentimiento
- [ ] 14. Formularios de registro con casillas desmarcadas por defecto (*opt-in* explícito).
- [ ] 15. Checkbox de marketing opcional y separada de los Términos de Servicio.
- [ ] 16. Banner de cookies con bloqueo preventivo real de scripts analíticos.
- [ ] 17. Soporte y respeto al header `navigator.globalPrivacyControl` (GPC).
- [ ] 18. Cabeceras RFC 8058 One-Click Unsubscribe implementadas en emails de mailing.

### Tiendas Móviles (iOS & Android)
- [ ] 19. Botón in-app directo para "Eliminar Cuenta" accesible en ajustes (Apple 5.1.1(v)).
- [ ] 20. Revocación de Apple Sign-In token implementada contra `https://appleid.apple.com/auth/revoke`.
- [ ] 21. Enlace web público funcional para solicitud de borrado de cuenta (Google Play).
- [ ] 22. Declaración de `PrivacyInfo.xcprivacy` en iOS con Required Reason APIs justificadas.

### Gobernanza de IA & Seguridad
- [ ] 23. APIs de LLMs configuradas con Zero Data Retention y saneamiento de prompts.
- [ ] 24. Etiquetado/disclosure de contenido sintético generado por IA (EU AI Act Art. 50).
- [ ] 25. Protocolo de reporte de brechas de seguridad ante la APDP en **72 horas**.
