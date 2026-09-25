# Reglas de Evidencia y Clasificación de Severidad para la Auditoría Técnica

Este documento define el estándar probatorio obligatorio que debe cumplir cada hallazgo reportado en `AUDITORIA_COMPLETA.md`.

---

## 1. Estándar de Evidencia Obligatorio

Para que un hallazgo sea considerado válido en la auditoría, debe satisfacer los siguientes requisitos:

1. **Trazabilidad Exacta:**
   - Debe indicar la ruta relativa del archivo y los números de línea exactos (ejemplo: `src/api/auth/route.ts:L45-L52`).
   - Si la evidencia proviene de un comando de terminal (ejemplo: `npm audit` o `git log`), debe incluirse el fragmento de salida relevante generado por la herramienta.
2. **Prohibición de Hipótesis Presentadas como Hechos:**
   - Si no has ejecutado o comprobado directamente una condición (por ejemplo, cómo está configurado el cortafuegos de un VPS al que no tienes acceso), debes registrarlo como *"Inferido"* o *"Pendiente de verificación en producción"*.
3. **Manejo Seguro de Secretos:**
   - **NUNCA pegues el valor real de un secreto** en el informe de auditoría. Si encuentras un token en un `.env` rastreado o en código, debes reportar:
     - Tipo de secreto (ejemplo: Clave Secreta de Stripe, Token de OpenAI, Contraseña de BD).
     - Archivo y línea donde se ubica.
     - Si está rastreado actualmente por Git y si figura en commits anteriores del historial.
     - Nivel de riesgo.
     - Instrucción de rotación y purga con `git-filter-repo`.
4. **No Confundir Intención con Implementación:**
   - Un comentario en el código que diga `// TODO: add rate limiting` o una política de privacidad que prometa *"cifrado de extremo a extremo"* no demuestra que la función exista. Si el código no lo aplica, el hallazgo debe reportarse como promesa no implementada.

---

## 2. Clasificación de Severidades

Cada hallazgo debe asignarse estrictamente a una de estas cinco categorías sin inflar ni minimizar riesgos:

| Severidad | Criterio de Impacto y Explotabilidad | Ejemplo Real |
| :---: | :--- | :--- |
| **CRÍTICA** | Riesgo inmediato de compromiso grave del sistema, ejecución remota de código (RCE), inyección SQL directa, pérdida masiva de datos, acceso total no autenticado o bypass de permisos administrativos. | Endpoint de mutación sin verificación de sesión; tablas de base de datos públicas sin RLS con claves service_role expuestas en cliente; SQL concatenado con inputs de usuario. |
| **ALTA** | Vulnerabilidad severa o fallo estructural con impacto importante que debe ser resuelto antes de cualquier despliegue en producción. | IDOR en rutas de consulta de clientes; almacenamiento de contraseñas con MD5/SHA-1 plano; tokens de sesión almacenados en `localStorage` con vulnerabilidad XSS presente; webhooks de pasarela de pago procesados sin validar firma criptográfica. |
| **MEDIA** | Riesgo relevante o debilidad arquitectónica que puede ser explotada bajo ciertas condiciones o que degrada la confiabilidad del sistema. | Ausencia de rate limiting en endpoints de autenticación; CORS configurado con comodín permisivo; consultas N+1 en listados principales que puedan saturar la base de datos; logs que registran correos o IPs sin rotación. |
| **BAJA** | Desviación de buenas prácticas defensivas, deuda técnica acumulada o configuraciones subóptimas con impacto limitado. | Falta de cabecera `Referrer-Policy`; dependencias con vulnerabilidades menores en entornos de desarrollo (`devDependencies`); componentes muertos o duplicados en frontend. |
| **INFORMATIVA** | Observación técnica, oportunidad de optimización de rendimiento o sugerencia arquitectónica que no representa una vulnerabilidad directa. | Sugerencia de migrar IDs enteros a UUIDv7 para mejorar inserciones indexadas; recomendación de implementar compresión Brotli en proxy inverso. |
