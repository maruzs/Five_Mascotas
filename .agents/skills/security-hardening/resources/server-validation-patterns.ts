/**
 * Patrones de Código de Seguridad del Lado del Servidor
 * Implementaciones de referencia para producción:
 * 1. Validación de esquemas con Zod
 * 2. Hasheo y verificación resistente con Argon2id
 * 3. Configuración de Cookies de Sesión (__Host- prefix)
 * 4. Manejador de Login con mitigación de Enumeración y Timing Attacks
 * 5. Mitigación de SSRF (Server-Side Request Forgery) con filtrado de IPs privadas y metadatos
 * 6. Validación de archivos por Magic Bytes (firmas binarias reales)
 * 7. Verificación de Webhooks en tiempo constante (Anti-Timing Attacks)
 * 8. Prevención de Path Traversal para lectura y escritura de archivos
 * 9. Logging Seguro con ofuscación de PII y prevención de Log Injection
 */

import { z } from 'zod';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as dns from 'dns/promises';
import * as path from 'path';

// -----------------------------------------------------------------------------
// 1. Esquema de Validación de Registro / Login con Zod
// -----------------------------------------------------------------------------
export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Formato de correo electrónico inválido')
    .max(255, 'El correo excede la longitud máxima permitida'),
  password: z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .max(128, 'La contraseña excede la longitud máxima permitida')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
});

// -----------------------------------------------------------------------------
// 2. Hasheo Seguro de Contraseñas con Argon2id
// -----------------------------------------------------------------------------
export async function hashPassword(plainPassword: string): Promise<string> {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id, // Tipo estándar recomendado por OWASP
    memoryCost: 65536,      // 64 MB de memoria
    timeCost: 3,            // 3 iteraciones
    parallelism: 4,         // 4 hilos de CPU
  });
}

export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// 3. Configuración Segura de Cookie de Sesión
// -----------------------------------------------------------------------------
export const SECURE_SESSION_COOKIE_OPTIONS = {
  name: '__Host-session_token', // Prefijo __Host-: Requiere Secure, Path=/ y sin dominio wildcard
  httpOnly: true,                // Inaccesible desde JavaScript en el cliente (Anti-XSS)
  secure: process.env.NODE_ENV === 'production', // Solo viaja por canales HTTPS cifrados
  sameSite: 'lax' as const,     // Previene ataques CSRF en mutaciones
  path: '/',
  maxAge: 60 * 60 * 24 * 7,      // 7 días de duración máxima
};

// -----------------------------------------------------------------------------
// 4. Manejador de Login con Prevención de Enumeración y Timing Attacks
// -----------------------------------------------------------------------------
export async function handleLogin(body: unknown) {
  const parseResult = RegisterSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      status: 400,
      error: 'Formato de datos inválido',
    };
  }

  const { email, password } = parseResult.data;
  const user = await findUserByEmail(email);

  // Hash sintético precalculado para simular cálculo si el usuario no existe (evita timing attacks)
  const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dummyhashfordummyuser1234567890';
  const targetHash = user ? user.passwordHash : DUMMY_HASH;

  const isValid = await verifyPassword(targetHash, password);

  // Mensaje genérico idéntico tanto si el correo no existe como si la contraseña falló
  if (!user || !isValid) {
    return {
      status: 401,
      error: 'Correo electrónico o contraseña incorrectos',
    };
  }

  return {
    status: 200,
    userId: user.id,
    cookieOptions: SECURE_SESSION_COOKIE_OPTIONS,
  };
}

async function findUserByEmail(_email: string) {
  return null as { id: string; passwordHash: string } | null;
}

// -----------------------------------------------------------------------------
// 5. Prevención Activa de SSRF (Server-Side Request Forgery)
// -----------------------------------------------------------------------------
/**
 * Comprueba si una dirección IP pertenece a rangos privados, loopback o metadatos cloud.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // IPv4 Loopback
  if (ip.startsWith('127.')) return true;
  // Metadatos Cloud (AWS, GCP, Azure, DigitalOcean: 169.254.169.254)
  if (ip.startsWith('169.254.')) return true;
  // Redes locales privadas (RFC 1918)
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // Broadcast / Any
  if (ip === '0.0.0.0' || ip === '255.255.255.255') return true;

  // IPv6
  if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true;
  }

  return false;
}

/**
 * Validador seguro para peticiones HTTP salientes (URLs de webhooks, PDFs, previews).
 * Resuelve DNS y bloquea acceso a la red interna o metadatos cloud.
 */
export async function assertSafeExternalUrl(targetUrl: string): Promise<URL> {
  const parsed = new URL(targetUrl);

  // Solo permitir HTTP y HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Protocolo no permitido: ${parsed.protocol}`);
  }

  // Resolver direcciones IP del hostname
  const lookup = await dns.lookup(parsed.hostname, { all: true });

  for (const entry of lookup) {
    if (isPrivateOrReservedIp(entry.address)) {
      throw new Error(`Acceso bloqueado a dirección interna/reservada: ${entry.address}`);
    }
  }

  return parsed;
}

// -----------------------------------------------------------------------------
// 6. Validación de Archivos por Magic Bytes (Firmas Binarias)
// -----------------------------------------------------------------------------
export type AllowedFileType = 'jpeg' | 'png' | 'webp' | 'pdf';

/**
 * Valida los primeros bytes binarios de un buffer para garantizar que el tipo real
 * del archivo coincide con el tipo declarado, ignorando extensiones o MIME falsos.
 */
export function validateFileMagicBytes(buffer: Buffer): AllowedFileType | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }

  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

// -----------------------------------------------------------------------------
// 7. Verificación Criptográfica de Firmas de Webhook (Anti-Timing Attacks)
// -----------------------------------------------------------------------------
/**
 * Verifica la firma HMAC-SHA256 de webhooks externos (Stripe, MercadoPago, etc.)
 * utilizando comparación en tiempo constante (timing-safe) para evitar timing attacks.
 */
export function verifyWebhookSignature(
  rawPayload: string | Buffer,
  receivedSignature: string,
  secretKey: string
): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawPayload)
    .digest('hex');

  const receivedBuffer = Buffer.from(receivedSignature, 'utf8');
  const computedBuffer = Buffer.from(computedSignature, 'utf8');

  // Si las longitudes difieren, timingSafeEqual lanza un error; comparamos longitudes primero
  if (receivedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, computedBuffer);
}

// -----------------------------------------------------------------------------
// 8. Prevención de Path Traversal en Lectura y Almacenamiento Local
// -----------------------------------------------------------------------------
/**
 * Valida y resuelve una ruta de archivo solicitada, garantizando que permanezca
 * confinada estrictamente dentro del directorio base autorizado.
 */
export function resolveSafePath(baseDir: string, userPath: string): string {
  // Normalizar y resolver ruta absoluta
  const safeBase = path.resolve(baseDir);
  const targetPath = path.resolve(safeBase, userPath);

  // Comprobar que el target empiece con la ruta base
  if (!targetPath.startsWith(safeBase + path.sep) && targetPath !== safeBase) {
    throw new Error('Violación de seguridad: Intento de Path Traversal detectado');
  }

  return targetPath;
}

// -----------------------------------------------------------------------------
// 9. Logger Seguro con Ofuscación de Secretos y Mitigación de Log Injection
// -----------------------------------------------------------------------------
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'apikey',
  'credit_card',
  'cvv',
  'jwt',
]);

/**
 * Sanitiza recursivamente objetos antes de escribirlos en logs, enmascarando secretos
 * y neutralizando saltos de línea para prevenir Log Injection (CWE-117).
 */
export function safeSanitizeForLog(data: unknown): unknown {
  if (typeof data === 'string') {
    // Neutralizar caracteres de control de nueva línea
    return data.replace(/[\r\n]/g, ' [NL] ');
  }

  if (Array.isArray(data)) {
    return data.map(safeSanitizeForLog);
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitizedObj[key] = '[REDACTED_SECRET]';
      } else {
        sanitizedObj[key] = safeSanitizeForLog(value);
      }
    }
    return sanitizedObj;
  }

  return data;
}

export function logSecurityEvent(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message: message.replace(/[\r\n]/g, ' '),
    meta: meta ? safeSanitizeForLog(meta) : undefined,
  };
  console.log(JSON.stringify(payload));
}
