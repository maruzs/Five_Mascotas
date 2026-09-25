# Checklist de Seguridad OWASP & Pre-Lanzamiento a Producción

Este checklist sintetiza las 25 comprobaciones críticas e innegociables antes de lanzar cualquier aplicación, API o sistema móvil a producción, alineadas rigurosamente con el **OWASP Top 10**, **OWASP API Security Top 10** y **OWASP Mobile Security Top 10**.

---

## Matriz de Auditoría Pre-Lanzamiento (25 Medidas Maestras)

| # | Dominio de Seguridad | Requisito a Verificar | Referencia / Mitigación | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Secretos & Credenciales | Cero API Keys privadas en bundles frontend, código público o repositorios. | Variables en backend exclusivo | [ ] |
| **02** | Historial de Git | Repositorio escaneado con `gitleaks` / `trufflehog`; cero `.env` o credenciales en commits. | `.gitignore` + purga con `git-filter-repo` | [ ] |
| **03** | Base de Datos | Clave `service_role` restringida solo a backend; cliente solo usa `anon_key`. | Backend proxy / Server actions | [ ] |
| **04** | Row-Level Security | RLS habilitado en el 100% de las tablas con políticas restrictivas (`USING` / `WITH CHECK`). | Políticas `auth.uid() = user_id` | [ ] |
| **05** | Cifrado | TLS 1.3 forzado en tránsito; datos altamente sensibles cifrados con AES-256-GCM en reposo. | Configuración SSL + crypto helper | [ ] |
| **06** | Autorización Server-Side | Verificación estricta de roles (RBAC) y pertenencia en backend en cada mutación. | Nunca confiar en `if (user.isAdmin)` en UI | [ ] |
| **07** | Control de Acceso (IDOR) | Consultas filtradas siempre por `user_id` o `tenant_id` de la sesión activa autenticada. | `WHERE id = :id AND user_id = :authUserId` | [ ] |
| **08** | Asignación Masiva | DTOs con whitelist estricta; terminantemente prohibido pasar `req.body` directo al ORM. | Esquemas tipados con Zod / Valibot | [ ] |
| **09** | Sesiones & Cookies | Cookies con banderas `HttpOnly; Secure; SameSite=Lax` y prefijo `__Host-`; cero JWT en localStorage. | Ver `server-validation-patterns.ts` | [ ] |
| **10** | Hasheo de Contraseñas | Contraseñas protegidas exclusivamente con Argon2id o bcrypt (coste >= 12 rondas). | OWASP Password Storage standard | [ ] |
| **11** | Rate Limiting | Límites de peticiones activos en login, registro, APIs públicas, recuperación y uploads. | Nginx `limit_req` o Upstash Redis | [ ] |
| **12** | Protección Anti-Bot | Cloudflare Turnstile o reCAPTCHA v3 en formularios públicos de alta exposición. | Verificación de token en backend | [ ] |
| **13** | Inyección SQL | 100% de consultas SQL parametrizadas o mediante ORM con sentencias preparadas. | Prohibida concatenación de strings | [ ] |
| **14** | Validación de Entradas | Esquemas fuertemente tipados (Zod) validando tipo, formato y longitud máxima permitida. | Fail-fast en middleware de entrada | [ ] |
| **15** | Prevención de XSS | Contenido de usuario escapado por defecto; DOMPurify obligatorio en HTML enriquecido. | Prohibido `dangerouslySetInnerHTML` crudo | [ ] |
| **16** | Subida de Archivos | Validación de *magic bytes* binarios, tamaño tope, renombrado a UUID y bucket privado. | Ver función `validateFileMagicBytes` | [ ] |
| **17** | Fuga de Datos en APIs | Respuestas JSON sanitizadas; sin hashes, tokens internos, stack traces ni PII innecesaria. | Manejador global de excepciones | [ ] |
| **18** | Cabeceras HTTP | HSTS (preload), CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, COOP y CORP. | Ver `security-headers-npm.conf` | [ ] |
| **19** | Forzado HTTPS | Redirección permanente 301 de HTTP hacia HTTPS sin excepciones en todo el dominio. | Configuración de proxy / Cloudflare | [ ] |
| **20** | Auditoría de Dependencias | `npm audit` / `snyk` / `pnpm audit` ejecutado en CI/CD con cero vulnerabilidades críticas. | Parches de seguridad al día | [ ] |
| **21** | Mitigación de SSRF | En URLs externas recibidas: resolución DNS previa y bloqueo de IPs privadas y metadatos cloud. | Ver función `assertSafeExternalUrl` | [ ] |
| **22** | Path Traversal & Comandos | Rutas de archivos resueltas dentro de base permitida; subprocesos con `execFile` sin shell. | Ver función `resolveSafePath` | [ ] |
| **23** | Control de Recursos & ReDoS | Límites de tamaño de body (`100kb`), timeouts de conexión, paginación forzada y regex seguras. | `client_max_body_size` + timeouts | [ ] |
| **24** | Seguridad Móvil | Tokens y credenciales en iOS Keychain o Android KeyStore; pantalla sensible con `FLAG_SECURE`. | Prohibido `AsyncStorage` en plano | [ ] |
| **25** | Logging Seguro | Auditoría de eventos críticos sin registrar passwords, tokens ni tarjetas; neutralizar `\r\n`. | Ver función `logSecurityEvent` | [ ] |
