---
name: security-hardening
description: >-
  Expert application security (AppSec), DevSecOps, and pre-launch hardening workflow for web and mobile systems.
  Enforces server-side authentication defense (Argon2id/bcrypt, HttpOnly cookies, zero localStorage for session tokens,
  anti-enumeration), eliminates the 25 most critical attack vectors (RLS, SQLi, XSS, IDOR, SSRF, Path Traversal,
  Mass Assignment, Webhook verification), and applies the pre-launch checklist of 25 mandatory security measures.
  Use whenever writing authentication logic, designing databases/RLS, setting up API endpoints, handling file uploads,
  configuring reverse proxies (Nginx/NPM), hardening containers, or conducting a security audit before production deployment.
---

# Security & Hardening Skill (AppSec, DevSecOps & Pre-Launch Defense)

Esta skill dota al agente de capacidades de **Lead Application Security Engineer (AppSec) y Pentester Ético (DevSecOps)**. Su objetivo es garantizar que cada línea de código, endpoint de API, política de base de datos, componente móvil, contenedor y configuración de proxy sea completamente resiliente contra ataques maliciosos, erradicando los 25 vectores de ataque más críticos y aplicando un blindaje integral antes del despliegue en producción.

---

## 1. Filosofía de Seguridad: "Defensa en Profundidad" & "Zero Trust"

1. **Nunca confíes en el cliente (Zero Trust Client-Side):** Las validaciones en React, Vue, Svelte, Flutter o React Native son meras ayudas de usabilidad; toda regla de negocio, permiso, sanitización y autorización debe ejecutarse **estrictamente en el servidor**.
2. **Principio de Menor Privilegio (Least Privilege):** Cada servicio, contenedor (Docker / LXC en Proxmox), usuario de base de datos y token de API debe poseer únicamente los permisos mínimos indispensables para operar.
3. **Falla Segura (Fail-Safe Defaults):** El sistema debe denegar el acceso, bloquear la ejecución o cerrar la conexión por defecto ante cualquier parámetro inesperado, payload anómalo o error no controlado.
4. **Defensa Multi-Capa:** La seguridad no depende de una sola barrera. Si el WAF falla, responde el proxy; si el proxy falla, responde el middleware; si el middleware falla, responde el RLS de la base de datos.

---

## 2. Blindaje Innegociable de Autenticación, Sesiones y Criptografía

Consulta [server-validation-patterns.ts](./resources/server-validation-patterns.ts) para implementaciones listas para producción.

- **Almacenamiento de Contraseñas:** 
  - Prohibido texto plano o hashes simples (MD5, SHA-1, SHA-256).
  - Algoritmos estándar obligatorios: **Argon2id** (64 MB de memoria, 3 iteraciones, 4 hilos) o **bcrypt** (coste >= 12 rondas).
- **Gestión de Sesiones y Tokens:**
  - 🚫 **PROHIBIDO guardar tokens de sesión o JWTs en `localStorage` o `sessionStorage`** (vulnerables a robo inmediato por cualquier script XSS).
  - Usar exclusivamente **Cookies HTTP** con prefijo y banderas de seguridad:
    - Prefijo `__Host-`: Requiere `Secure`, ruta `/` y sin subdominios no autorizados.
    - `HttpOnly`: Impide lectura o robo mediante JavaScript en el navegador.
    - `Secure`: Solo viaja por conexiones cifradas HTTPS.
    - `SameSite=Lax` o `SameSite=Strict`: Previene ataques CSRF en peticiones de origen cruzado.
- **Prevención de Enumeración de Usuarios y Timing Attacks:**
  - Formularios de login y recuperación deben responder siempre con un mensaje idéntico: *"Correo electrónico o contraseña incorrectos"*.
  - En caso de usuario inexistente, ejecutar un cálculo sintético con hash ficticio para garantizar un tiempo de respuesta indistinguible (*constant-time response*).
- **Protección contra Fuerza Bruta y Automatización:**
  - Rate limiting agresivo por IP y por cuenta en `/api/auth/*`.
  - Bloqueo temporal exponencial tras 5 intentos fallidos consecutivos.
  - Integración de validación anti-bot invisible (**Cloudflare Turnstile** o reCAPTCHA v3).

---

## 3. Checklist de las 25 Medidas Obligatorias Pre-Lanzamiento

Antes de considerar listo cualquier despliegue a producción, verifica metódicamente cada punto (consulta [owasp-appsec-checklist.md](./references/owasp-appsec-checklist.md)):

1. [ ] **Ocultar Secretos y API Keys:** Cero claves privadas (`STRIPE_SECRET_KEY`, llaves de base de datos) expuestas en bundles frontend o código público.
2. [ ] **Historial de Git Limpio:** Escanear el repositorio con `gitleaks` / `trufflehog`. Cero `.env` rastreados en commits. Si hubo fugas, rotar y purgar con `git-filter-repo`.
3. [ ] **Separación de Claves de BD:** El frontend solo usa `anon_key` de lectura pública controlada; la clave maestra `service_role` vive exclusivamente en el backend protegido.
4. [ ] **Row-Level Security (RLS) al 100%:** Habilitar RLS en **todas** las tablas de PostgreSQL/Supabase con políticas restrictivas (`USING` / `WITH CHECK`).
5. [ ] **Cifrado Fuerte:** En tránsito (TLS 1.3 con HSTS) y en reposo (AES-256-GCM para documentos confidenciales o PII sensible).
6. [ ] **Autorización Estricta en Servidor (RBAC/ABAC):** Nunca validar roles solo en la interfaz gráfica (`if (user.isAdmin)` en React es cosmético; el backend debe verificar permisos).
7. [ ] **Prevención Universal de IDOR:** Cada consulta SQL o mutación debe filtrar por la identidad autenticada (`WHERE id = :id AND user_id = :authUserId`).
8. [ ] **Bloqueo de Asignación Masiva:** Prohibido `Model.update(req.body)`. Usar esquemas tipados con whitelist estricta (Zod/Valibot).
9. [ ] **Cookies de Sesión Blindadas:** Con banderas `HttpOnly; Secure; SameSite=Lax` y prefijo `__Host-`.
10. [ ] **Hashing Robusto de Contraseñas:** Argon2id (preferido) o bcrypt (>= 12).
11. [ ] **Rate Limiting Multi-Capa:** Límites de peticiones activos en proxy inverso (Nginx) y middleware (Upstash Redis).
12. [ ] **Protección Anti-Bot:** Turnstile / reCAPTCHA en formularios públicos de registro, contacto y autenticación.
13. [ ] **Consultas SQL Parametrizadas:** Cero concatenación de texto en queries para erradicar SQLi.
14. [ ] **Validación Universal de Inputs:** Comprobación estricta de tipo, formato y longitud máxima en cada endpoint.
15. [ ] **Prevención de XSS:** Escapado automático por defecto; uso obligatorio de DOMPurify si se procesa HTML enriquecido.
16. [ ] **Subida Segura de Archivos:** Validar *magic bytes* binarios (no la extensión), renombrar a UUIDv4 aleatorio, limitar tamaño y almacenar en buckets privados (Cloudflare R2 con URLs firmadas).
17. [ ] **Sanitización de Respuestas API:** Nunca devolver contraseñas, hashes, tokens internos, trazas de error (*stack traces*) ni datos confidenciales en respuestas JSON.
18. [ ] **Cabeceras HTTP Defensivas:** Configurar HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, COOP y CORP en Nginx/NPM.
19. [ ] **Forzado Permanente de HTTPS:** Redirección 301 de HTTP a HTTPS en todo el dominio.
20. [ ] **Auditoría Continua de Dependencias:** Ejecutar `npm audit` / `snyk` en CI/CD con cero vulnerabilidades críticas o altas.
21. [ ] **Mitigación Activa de SSRF:** En endpoints que consumen URLs externas (PDFs, avatars, previews), resolver DNS y bloquear rangos privados (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`) y metadatos cloud (`169.254.169.254`).
22. [ ] **Prevención de Path Traversal & Comandos:** Confinar rutas de lectura/escritura con `path.resolve` y utilizar exclusivamente `execFile` con argumentos parametrizados (cero shells concatenadas).
23. [ ] **Control de Recursos y Anti-ReDoS:** Limitar el tamaño del body (`client_max_body_size 10M;`, express `limit: '100kb'`), fijar timeouts de socket y evitar expresiones regulares con retroceso catastrófico.
24. [ ] **Blindaje de Aplicaciones Móviles:** Credenciales y tokens en iOS Keychain o Android KeyStore (prohibido `AsyncStorage` en plano); banderas `FLAG_SECURE` en vistas sensibles.
25. [ ] **Logging Defensivo y Auditoría:** Registro de eventos críticos sin guardar contraseñas, tokens ni tarjetas de crédito, neutralizando caracteres de control (`\r`, `\n`) contra Log Injection.

---

## 4. Auditoría de los 25 Vectores de Ataque Críticos

Consulta la [Guía de Vectores de Ataque](./references/20-attack-vectors-prevention.md) para ver ejemplos de código vulnerable y soluciones seguras contra:
1. `.env` rastreado en Git.
2. Claves API privadas en el Frontend.
3. Tablas de Base de Datos sin RLS.
4. Permisos de administrador solo en Frontend.
5. Ausencia de Rate Limiting.
6. Inyección SQL por concatenación de texto.
7. Ausencia de validación de entradas.
8. Contenido de usuario inyectado como HTML crudo (Stored XSS).
9. Contraseñas en texto claro o con hashes obsoletos.
10. Tokens de autenticación en `localStorage`.
11. Paneles de administración expuestos sin MFA ni control de acceso.
12. CORS permisivo con comodín (`*`) y credenciales.
13. Registro de cuentas sin verificación de correo.
14. Identificadores secuenciales predecibles (migrar a UUIDv4/v7 o ULID).
15. Asignación masiva (*Mass Assignment*) en mutaciones de modelos.
16. Webhooks de pago sin verificar la firma criptográfica en tiempo constante.
17. Trazas de error completas (*stack traces*) mostradas al cliente en producción.
18. Dependencias desactualizadas con vulnerabilidades críticas (CVEs).
19. Contraseñas débiles o sin requisitos mínimos de entropía.
20. Subida de archivos ejecutables disfrazados con extensiones falsas.
21. Server-Side Request Forgery (SSRF) en generadores de PDFs, avatars o webhooks.
22. Path Traversal en lectura o descarga de archivos locales (`../../etc/passwd`).
23. Inyección de comandos del sistema operativo (`child_process.exec`).
24. Agotamiento de recursos y ReDoS (payloads masivos sin límite y regex catastróficas).
25. Almacenamiento inseguro en aplicaciones móviles (`AsyncStorage` plano).

---

## 5. Seguridad en Aplicaciones Móviles (OWASP Mobile Top 10)

Cuando el proyecto incluya aplicaciones móviles (React Native, Expo, Flutter, Capacitor, Android/iOS nativo):
1. **Almacenamiento Criptográfico Seguro:**
   - Prohibido guardar tokens o credenciales en `AsyncStorage`, `SharedPreferences` sin cifrar o `localStorage`.
   - Utilizar **iOS Keychain** (vía `expo-secure-store` o `react-native-keychain`) y **Android EncryptedSharedPreferences / KeyStore**.
2. **Protección de Pantallas Sensibles (Anti-Screen Capture):**
   - En Android, activar `FLAG_SECURE` en vistas que presenten datos de pago, documentos o credenciales para impedir capturas del sistema y visualización en la multitarea.
3. **Validación de Deep Links y Universal Links:**
   - Tratar todo parámetro proveniente de un deep link (`myapp://reset-password?token=...`) como entrada externa no confiable; validar tipos y esquemas con Zod antes de ejecutar cualquier acción o navegación.
4. **Certificate Pinning & Network Security Config:**
   - Asegurar que la configuración de red móvil prohíba tráfico HTTP no cifrado (`cleartextTrafficPermitted="false"` en Android).

---

## 6. Hardening de Contenedores e Infraestructura (Docker, Proxmox LXC, Nginx)

1. **Ejecución como Usuario No Privilegiado:**
   - Prohibido ejecutar contenedores como `root`. En Dockerfiles: definir `USER node:node` o usuario dedicado sin privilegios de administración.
2. **Límites de Recursos:**
   - Definir cuotas de memoria (`mem_limit`) y CPU en Docker Compose o Proxmox LXC para impedir que una fuga de memoria o un ataque DoS afecte al host completo.
3. **Sistema de Archivos en Solo Lectura:**
   - Donde sea viable, arrancar contenedores con `--read-only`, montando únicamente volúmenes temporales o específicos (`/tmp`, `/uploads`) con permisos restringidos.
4. **Cabeceras y Proxy (NPM / Nginx):**
   - Aplicar el snippet de cabeceras de [security-headers-npm.conf](./resources/security-headers-npm.conf).
   - Fijar `client_max_body_size 10M;` y configurar timeouts defensivos contra ataques Slowloris.

---

## 7. Seguridad en Integraciones de Inteligencia Artificial (OWASP LLM Top 10)

Si la aplicación utiliza modelos de lenguaje (OpenAI, Anthropic, Gemini, Ollama):
1. **Defensa contra Prompt Injection:**
   - Separar estrictamente el *system prompt* inmutable de los datos no confiables del usuario.
   - Envolver el input de usuario en delimitadores XML/Markdown claros y advertir al modelo que ignore instrucciones de anulación contenidas dentro del texto de entrada.
2. **Sanitización de Respuestas de la IA:**
   - Prohibido ejecutar respuestas generadas por LLMs con `eval()`, ejecutarlas como comandos bash directos o insertarlas en SQL crudo sin parametrizar.
   - Si la respuesta del LLM se presenta en la interfaz, escaparla o filtrarla con DOMPurify.
3. **Protección de PII en Prompts:**
   - Enmascarar correos, nombres reales y datos sensibles antes de enviarlos a APIs de inferencia de terceros.

---

## 8. Workflow Operativo de Ejecución para el Agente (6 Fases)

```text
Fase 1: Auditoría de Superficie de Ataque y Secretos
 ├── Identificar qué datos entran y por dónde (APIs, formularios, uploads, webhooks, deep links).
 ├── Verificar con gitleaks / git status que ningún .env o credencial esté expuesto.

Fase 2: Blindaje de Autenticación, Sesiones y Criptografía
 ├── Garantizar almacenamiento de contraseñas con Argon2id (o bcrypt >= 12).
 ├── Configurar sesiones en Cookies HttpOnly con Secure, SameSite=Lax y prefijo __Host-.
 ├── Asegurar mitigación de enumeración y timing attacks en formularios de acceso.

Fase 3: Blindaje de Acceso a Datos y Base de Datos
 ├── Verificar que el 100% de las tablas en PostgreSQL/Supabase tengan RLS activo.
 ├── Auditar que no exista ninguna consulta SQL concatenada (100% parametrizadas).
 ├── Prevenir IDOR validando la pertenencia del recurso al usuario/tenant autenticado.

Fase 4: Blindaje de Validaciones, Archivos y Salidas
 ├── Aplicar esquemas Zod con whitelist en todos los endpoints (bloqueo de Mass Assignment).
 ├── Validar uploads por magic bytes binarios y almacenar en buckets privados.
 ├── Proteger peticiones salientes contra SSRF con filtrado estricto de IPs y metadatos.
 ├── Confinar rutas de lectura/escritura contra Path Traversal y verificar firmas de webhooks con tiempo constante.

Fase 5: Hardening de Infraestructura, Contenedores y Proxy
 ├── Desplegar cabeceras de seguridad (HSTS, CSP, COOP, CORP, X-Frame-Options) en Nginx/NPM.
 ├── Configurar límites de tamaño de petición y timeouts contra ataques DoS/Slowloris.
 ├── Asegurar que los contenedores corran con usuarios sin privilegios (non-root).

Fase 6: Verificación Pre-Lanzamiento
 ├── Ejecutar escaneo de dependencias (npm audit / snyk).
 ├── Comprobar checklist completo de 25 medidas en owasp-appsec-checklist.md.
```

---

## 9. Recursos y Referencias Incluidos

- [20-attack-vectors-prevention.md](./references/20-attack-vectors-prevention.md): Análisis detallado de las 25 vulnerabilidades críticas con ejemplos de código vulnerable y seguro.
- [owasp-appsec-checklist.md](./references/owasp-appsec-checklist.md): Matriz de auditoría de 25 medidas pre-lanzamiento para verificación rápida.
- [security-headers-npm.conf](./resources/security-headers-npm.conf): Configuración completa de cabeceras de seguridad y mitigación DoS para Nginx Proxy Manager.
- [server-validation-patterns.ts](./resources/server-validation-patterns.ts): Helpers tipados para Zod, Argon2id, Cookies __Host-, mitigación de SSRF, validación por Magic Bytes, verificación de Webhooks HMAC, prevención de Path Traversal y Logging Seguro.
