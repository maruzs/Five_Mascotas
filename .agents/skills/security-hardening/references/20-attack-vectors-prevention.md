# Los 25 Vectores de Ataque Más Críticos y su Prevención Técnica

Este documento analiza en detalle las 25 vulnerabilidades y vectores de ataque más comunes que provocan hackeos, fugas de datos y brechas de seguridad en aplicaciones web, móviles y APIs modernas, con ejemplos de código vulnerable y su solución segura y resiliente.

---

### 1. Archivo `.env` commiteado en Git
- **Riesgo:** Exposición inmediata de claves privadas de AWS, Stripe, bases de datos o secretos JWT a rastreadores automatizados que escanean repositorios públicos y privados en milisegundos.
- **Vulnerable:** `.env` rastreado en Git.
- **Solución:**
  - Agregar `.env`, `.env.local`, `.env.production` en `.gitignore` antes del primer commit.
  - Usar `.env.example` con valores vacíos para documentación.
  - Si ya se filtró, purgar con `git-filter-repo` y rotar las claves inmediatamente en el proveedor.

### 2. Claves API Privadas en el Frontend
- **Riesgo:** Colocar tokens secretos en variables prefijadas con `NEXT_PUBLIC_` o `VITE_` que se compilan en el bundle público de JavaScript accesible desde las herramientas de desarrollo del navegador.
- **Vulnerable:** `const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);`
- **Solución:** Las llamadas que requieren secretos deben ejecutarse exclusivamente en el backend (API Routes, Server Actions, microservicios) y exponer solo endpoints propios al cliente.

### 3. Tablas de Base de Datos sin Row-Level Security (RLS)
- **Riesgo:** En Supabase o PostgreSQL, si RLS está desactivado o mal configurado, cualquier usuario anónimo puede consultar o modificar datos de otros clientes con una simple llamada `supabase.from('users').select('*')`.
- **Solución:**
  ```sql
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can only access their own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```

### 4. Permisos de Administrador Verificados Solo en el Frontend
- **Riesgo:** Ocultar el botón de borrar solo con `if (user.isAdmin)` en React/Vue. El atacante simplemente envía una petición POST/DELETE directa con `curl` o Postman y ejecuta la acción administrativa sin restricción.
- **Solución:** El backend debe validar la sesión y el rol antes de procesar cualquier mutación:
  ```typescript
  if (session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acceso no autorizado' }), { status: 403 });
  }
  ```

### 5. Ausencia de Rate Limiting
- **Riesgo:** Ataques de fuerza bruta a contraseñas, inundación de SMS/emails OTP y denegación de servicio (DoS) a endpoints computacionalmente pesados.
- **Solución:** Limitar peticiones a nivel de proxy inverso (Nginx) o con Upstash Redis / Cloudflare WAF (ej. máximo 5 intentos por minuto en `/api/auth/login`).

### 6. Inyección SQL por Concatenación de Texto
- **Vulnerable:** `db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'")`
- **Solución:** Consultas preparadas o parametrizadas siempre:
  ```typescript
  db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);
  ```

### 7. Ausencia de Validación de Entradas de Usuario
- **Riesgo:** Payloads maliciosos, campos con longitudes infinitas que desbordan la memoria del proceso o inyección de caracteres de control.
- **Solución:** Esquemas tipados con **Zod** o **Valibot** que validen tipos, formatos y longitudes máximas en cada endpoint.

### 8. Contenido de Usuario Inyectado como HTML Crudo (Stored XSS)
- **Vulnerable:** `<div dangerouslySetInnerHTML={{ __html: userComment }} />`
- **Solución:** Renderizar texto plano siempre que sea posible. Si se requiere Markdown enriquecido, sanitizar con **DOMPurify**:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify';
  const cleanHtml = DOMPurify.sanitize(userContent);
  ```

### 9. Contraseñas en Texto Claro o Hashes Obsoletos
- **Vulnerable:** Guardar texto plano, `md5(password)` o `sha256(password)`.
- **Solución:** Usar funciones con coste de memoria, tiempo y salting automático: **Argon2id** o **bcrypt** (coste >= 12).

### 10. Tokens de Sesión en `localStorage`
- **Riesgo:** Si ocurre una inyección XSS menor mediante una librería de terceros comprometida, un script atacante puede leer `localStorage.getItem('token')` y secuestrar la cuenta completa.
- **Solución:** Usar exclusivamente **Cookies HTTP con `HttpOnly; Secure; SameSite=Lax`**.

### 11. Paneles de Administración Expuestos sin Protección Fuerte
- **Riesgo:** Paneles en `/admin` accesibles a cualquiera que adivine o fuerce una clave simple.
- **Solución:** Proteger con Autenticación Multifactor (MFA/2FA) obligatoria, IP Whitelist o Cloudflare Zero Trust Access.

### 12. CORS Abierto con Comodín (`*`) y Credenciales
- **Vulnerable:** `Access-Control-Allow-Origin: *` combinado con `Access-Control-Allow-Credentials: true`.
- **Solución:** Whitelist estricta de dominios permitidos (ej. `https://miapp.com`).

### 13. Cuentas Creadas sin Verificación de Correo Electrónico
- **Riesgo:** Registro masivo por bots con direcciones ajenas para abusar de planes gratuitos, saturar la base de datos o realizar phishing.
- **Solución:** Flujo de confirmación con enlaces firmados temporalmente antes de otorgar acceso operativo.

### 14. Identificadores Secuenciales Predecibles (Enumeration / IDOR)
- **Vulnerable:** `/api/invoices/104`, `/api/invoices/105`.
- **Solución:** Utilizar identificadores no secuenciales y criptográficamente aleatorios: **UUIDv4**, **UUIDv7** o **ULID**, combinados siempre con la verificación `WHERE id = :id AND user_id = :authUserId`.

### 15. Asignación Masiva (Mass Assignment / Parameter Tampering)
- **Vulnerable:** `User.update(req.body, { where: { id } })` (el atacante envía `{ "isAdmin": true, "balance": 999999 }`).
- **Solución:** DTOs con lista blanca estricta de campos editables por el usuario usando Zod.

### 16. Webhooks de Pago sin Validación de Firma Criptográfica
- **Riesgo:** Un atacante envía un POST simulado a `/api/webhooks/stripe` con `{ "type": "payment_intent.succeeded" }` y activa servicios gratis.
- **Solución:** Validar siempre el encabezado `Stripe-Signature` con la clave secreta del webhook (`endpoint_secret`) antes de procesar el evento usando comparación en tiempo constante (`crypto.timingSafeEqual`).

### 17. Trazas de Error (*Stack Traces*) en Producción
- **Riesgo:** Exponer rutas internas del servidor (`/home/user/...`), versiones de Node/Python o esquemas de base de datos en respuestas de error 500.
- **Solución:** En producción, capturar excepciones globalmente y devolver mensajes genéricos: `{"error": "Ha ocurrido un error interno. Código de referencia: #XYZ"}` registrando el detalle en logs privados.

### 18. Dependencias Desactualizadas con Vulnerabilidades Conocidas (CVEs)
- **Solución:** Automatizar escaneos con `npm audit`, `pnpm audit` o `Dependabot` y mantener parches de seguridad al día.

### 19. Políticas de Contraseña Nulas o Triviales
- **Solución:** Exigir mínimo 10 a 12 caracteres, diversidad de caracteres y verificar contra listas de contraseñas filtradas comunes.

### 20. Subida de Archivos Validada Solo por Extensión
- **Vulnerable:** Confiar en `file.name.endsWith('.jpg')` (el atacante sube `exploit.php.jpg` o un ejecutable binario).
- **Solución:**
  - Validar los primeros bytes binarios (*magic bytes*) en el backend (ver `server-validation-patterns.ts`).
  - Renombrar a un UUID aleatorio en el servidor.
  - Guardar en un bucket privado protegido (Cloudflare R2 o S3 privado) sin permisos de ejecución directa.

---

### 21. Server-Side Request Forgery (SSRF - OWASP A10 / API7)
- **Riesgo:** Endpoints que reciben una URL del usuario (ej. descargar imagen de avatar, generar PDF de una web, webhook de callback) permiten al atacante enviar URLs internas como `http://169.254.169.254/latest/meta-data/` para robar credenciales de AWS/GCP, o `http://127.0.0.1:6379` para interactuar con Redis o bases de datos internas de la VPC.
- **Vulnerable:** `const response = await fetch(req.body.imageUrl);`
- **Solución:**
  - Resolver el hostname mediante DNS antes de realizar la petición HTTP.
  - Comprobar que la IP resuelta no sea privada, loopback ni del rango de metadatos (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`, `::1`, `fc00::/7`).
  - Utilizar el helper `assertSafeExternalUrl` incluido en `server-validation-patterns.ts`.

### 22. Path Traversal / Salto de Directorio (CWE-22)
- **Riesgo:** Endpoints de descarga o lectura de plantillas que aceptan un nombre de archivo del cliente (ej. `/api/download?file=../../../../etc/passwd` o `..\..\windows\win.ini`).
- **Vulnerable:** `fs.readFileSync(path.join('/var/uploads', req.query.file));`
- **Solución:**
  - Utilizar `path.resolve` y verificar que la ruta resultante comience estrictamente con el directorio base permitido (`path.startsWith(BASE_DIR + path.sep)`).
  - Rechazar entradas que contengan caracteres nulos (`\0`) o secuencias de salto (`..`).

### 23. Inyección de Comandos del Sistema Operativo (Command Injection)
- **Riesgo:** Ejecutar utilidades del sistema (ffmpeg, imagemagick, git, curl) concatenando entradas del usuario directamente en una shell.
- **Vulnerable:** `exec(`convert ${req.body.filename} output.png`)` (un usuario envía `foto.jpg; rm -rf /`).
- **Solución:**
  - Prohibir terminantemente `child_process.exec` con cadenas de comandos concatenadas.
  - Utilizar exclusivamente `execFile` o `spawn` pasando los argumentos como un arreglo de strings independiente (`execFile('convert', [sanitizedPath, 'output.png'])`) y con `shell: false`.

### 24. Agotamiento de Recursos y Expresiones Regulares Catastróficas (ReDoS / DoS)
- **Riesgo:** 
  - Subida de payloads JSON gigantescos (ej. 50 MB) que saturan la memoria del proceso Node.js y bloquean el Event Loop.
  - Expresiones regulares con retroceso catastrófico (catastrophic backtracking) como `/(a+)+$/` evaluadas sobre inputs largos de usuario, consumiendo el 100% de la CPU.
- **Solución:**
  - Limitar el tamaño del body en el parser HTTP: `app.use(express.json({ limit: '100kb' }))`.
  - Configurar límites estrictos de timeout en peticiones.
  - Forzar paginación estricta en consultas a bases de datos (`LIMIT 50` como tope máximo inmutable).
  - Evitar regex anidadas repetitivas o usar validadores de expresiones regulares seguros.

### 25. Almacenamiento Inseguro y Manipulación en Aplicaciones Móviles
- **Riesgo:** Almacenar tokens JWT, contraseñas o datos biométricos en `AsyncStorage` (React Native), `localStorage` (Capacitor/Ionic) o `SharedPreferences` en texto claro en Android/iOS, permitiendo a cualquier atacante o malware con acceso al dispositivo extraer la sesión.
- **Solución:**
  - Usar almacenamiento cifrado nativo: **Keychain** en iOS y **EncryptedSharedPreferences / Android KeyStore** en Android.
  - Activar `FLAG_SECURE` en Android para evitar capturas de pantalla automáticas en pantallas de información sensible (tarjetas, contraseñas, documentos).
  - Validar rigurosamente los parámetros recibidos mediante Deep Links y Universal Links tratándolos como entradas no confiables idénticas a un endpoint público de API.
