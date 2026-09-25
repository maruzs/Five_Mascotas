---
name: technical-audit
description: >-
  Comprehensive, evidence-based technical, security, architecture, and operational audit workflow.
  Enforces a strict read-only execution mode (zero code modifications, zero commits/pushes, no destructive testing),
  systematically assesses 16 core dimensions (Git status, architecture, AppSec, containers/infrastructure,
  databases, workers/scrapers, frontend, mobile apps, dependencies, CI/CD, tests, backups/disaster recovery,
  privacy/legal compliance, commercial vs code coherence, performance, maintainability), and generates
  the structured AUDITORIA_COMPLETA.md report with rigorous line-by-line evidence.
  Use whenever requested to audit a repository, evaluate production readiness, verify technical claims against code,
  or perform a comprehensive pre-launch or due diligence assessment.
---

# Technical Audit Skill (Auditoría Integral Basada en Evidencia)

Esta skill permite al agente ejecutar una **Auditoría Técnica Integral, Profunda y Basada en Evidencia** de cualquier repositorio o sistema de software. Su objetivo es descubrir problemas concretos, riesgos latentes, promesas comerciales no implementadas en el código, configuraciones inseguras y deuda técnica, generando como único entregable el informe formal `AUDITORIA_COMPLETA.md`.

---

## 1. Reglas Innegociables: Modo Estricto de "Solo Lectura"

El agente auditor debe acatar rigurosamente estos límites operacionales:

1. **La auditoría es estrictamente de SOLO LECTURA:** Prohibido modificar código fuente, dependencias, configuraciones, migraciones, bases de datos o servicios.
2. **Prohibido realizar commits, push, rebase, reset o alterar el historial de Git:** No uses `git add`, `git commit` ni `git push`.
3. **No corrijas ningún problema durante la auditoría:** Aunque la solución parezca trivial, tu tarea es registrar y documentar con evidencia, nunca intervenir.
4. **Única escritura autorizada:** Crear al finalizar el archivo **`AUDITORIA_COMPLETA.md`** en la raíz del proyecto.
5. **Verificación de limpieza con Git:** Antes y después de auditar, ejecuta `git status --short`. El único archivo nuevo o modificado debe ser el informe de auditoría.
6. **Cero pruebas destructivas:** Prohibido realizar pentesting activo, ataques de denegación de servicio, inyecciones reales sobre bases de datos en producción o fuzzing masivo.
7. **Tratamiento seguro de secretos:** Si descubres claves API, contraseñas, tokens privados o cookies, **NUNCA copies su valor real en el informe**. Reporta únicamente el tipo de secreto, ruta, si está rastreado por Git, severidad y la medida de rotación recomendada.
8. **Distinción obligatoria de afirmaciones:** Toda aseveración debe etiquetarse como:
   - *Observado directamente en código*
   - *Confirmado mediante prueba segura*
   - *Inferido*
   - *Declarado por documentación*
   - *Pendiente de verificación*

---

## 2. Metodología de Auditoría en 16 Fases (A a P)

El agente debe recorrer metódicamente cada dimensión:

### Fase A: Estado del Repositorio y Git
- Ejecutar `git status --short` y registrar rama y commit actual.
- Revisar `.gitignore`, `.dockerignore` y buscar archivos sensibles rastreados o en el historial (`git log -n 50 --stat`).
- Detectar archivos grandes, binarios o dumps de bases de datos versionados.

### Fase B: Arquitectura y Límites de Confianza
- Construir inventario de componentes (Frontend, Backend, Workers, Base de datos, Storage, Proxies).
- Mapear flujos de datos y límites de confianza (*trust boundaries*).
- Identificar puntos únicos de fallo (SPOF) y detectar código muerto o duplicado.

### Fase C: Seguridad de Aplicación (AppSec & OWASP)
- Autenticación, revocación de sesiones y protección de endpoints administrativos.
- RLS en bases de datos, prevención de IDOR/BOLA, SQLi, SSRF, XSS, CSRF, CORS permisivo (`*`), CSP y cabeceras de seguridad.
- Manejo de excepciones: verificar que no existan filtraciones de *stack traces* a clientes.
- Subida de archivos (validación de *magic bytes*, tamaño y almacenamiento).

### Fase D: Infraestructura, Contenedores y Red
- Dockerfiles / Compose / Proxmox: usuarios root vs no-root, capacidades Linux, `no-new-privileges`.
- Puertos publicados (bind a `0.0.0.0` vs loopback), configuración de Nginx / Cloudflare Tunnel.
- Confianza en cabeceras proxy (`X-Forwarded-For`, `X-Real-IP`).

### Fase E: Base de Datos y Persistencia
- Constraints, claves foráneas, índices, consultas N+1.
- Conexiones y pools, transacciones y condiciones de carrera (*race conditions*).
- Migraciones: idempotencia y viabilidad real de rollback.
- Estrategias de borrado en cascada y eliminación definitiva de cuentas (GDPR / Ley 21.719).

### Fase F: Schedulers, Workers y Colas
- Timeouts, reintentos, circuit breakers, bloqueos distribuidos.
- Fugas de memoria, acumulación de jobs atascados y recuperación tras reinicio del servidor.

### Fase G: Frontend Web
- Rutas públicas vs protegidas por autenticación.
- Verificación de si los permisos de usuario se validan en el servidor o solo en componentes UI.
- Bundle sizes, lazy loading, errores de consola, accesibilidad WCAG y contraste.

### Fase H: Aplicación Móvil (iOS / Android)
- Manejo seguro de credenciales (Keychain / Keystore).
- Flujo de onboarding antes de autenticación, comportamiento offline y sincronización.

### Fase I: Dependencias y Cadena de Suministro
- Ejecución de auditorías seguras no destructivas (`npm audit`, `pip check`, `cargo audit`).
- Identificar dependencias abandonadas, desactualizadas o con CVEs reportados.

### Fase J: CI/CD y Pipelines
- Workflows de GitHub Actions / GitLab CI: verificar si hay tests omitidos, flags `continue-on-error` o secretos expuestos.

### Fase K: Pruebas y Cobertura Real
- Inventario de tests unitarios, integración y E2E.
- Evaluar si las pruebas usan mocks excesivos que oculten fallos de servicios reales.

### Fase L: Operación, Backups y Disaster Recovery
- Estrategia real de respaldos: cifrado, destino externo inmutable, frecuencia y procedimientos de restauración probados.
- Logs: rotación, sanitización de datos confidenciales y monitoreo de alertas.

### Fase M: Privacidad, Cumplimiento y Legalidad
- Contrastar datos recolectados con la **Ley N° 21.719 de Chile**, **GDPR** y **CCPA**.
- Verificación de derechos ARCO-POL (Acceso, Rectificación, Cancelación, Portabilidad) y notificación de brechas.
- Subencargados cloud (Cloudflare, Firebase, etc.) y transferencias internacionales de datos.

### Fase N: Coherencia Funcional y Comercial (Promesas vs Código)
- Consulta la [Matriz de Coherencia Documental](./references/doc-vs-code-matrix.md).
- Comparar cada promesa de la Landing Page / README con la implementación real en backend y base de datos:
  - *Implementada* / *Parcialmente implementada* / *No implementada* / *Solo UI sin enforcement*.

### Fase O: Rendimiento y Escalabilidad
- Paginación no acotada, sobrecarga de consultas a BD, consumo de memoria de procesos asíncronos y Core Web Vitals.

### Fase P: Mantenibilidad y Calidad de Código
- Modularidad, acoplamiento, tipado estricto en TypeScript/Python y fuentes múltiples de verdad.

---

## 3. Criterios de Severidad

Clasifica cada hallazgo de acuerdo a [evidence-and-severity-rules.md](./references/evidence-and-severity-rules.md):
- 🔴 **CRÍTICA:** Riesgo inmediato de compromiso de datos, ejecución de código, pérdida masiva o interrupción total.
- 🟠 **ALTA:** Impacto severo o vulnerabilidad plausible que requiere atención antes de producción.
- 🟡 **MEDIA:** Riesgo relevante que debe planificarse en el backlog inmediato.
- 🔵 **BAJA:** Mejora defensiva, optimización o deuda técnica menor.
- ⚪ **INFORMATIVA:** Observación arquitectónica o buena práctica recomendada sin vulnerabilidad directa.

---

## 4. Entregables Obligatorios

### A. Archivo `AUDITORIA_COMPLETA.md`
Genera el informe íntegro en la raíz del proyecto utilizando la plantilla oficial [audit-report-template.md](./resources/audit-report-template.md) con sus 20 secciones completas y detalladas.

### B. Cierre en el Chat
Al finalizar la auditoría, responde en el chat con este esquema exacto:
1. **Conclusión directa:** Veredicto sobre el estado real del sistema y si es apto o no para producción.
2. **Resumen de hallazgos por severidad:** (N° Críticas, N° Altas, N° Medias, N° Bajas, N° Informativas).
3. **Los 5 riesgos principales:** Los problemas que deben solucionarse con urgencia crítica.
4. **Qué se verificó fehacientemente y qué quedó pendiente.**
5. **Acciones que requieren intervención manual del propietario.**
6. **Ruta del informe generado:** `AUDITORIA_COMPLETA.md`.
7. **Confirmación de no modificación:** Confirmar que `git status` demuestra que no se alteró código fuente.
