# 🤖 Project Constitution & Agent Directives (`AGENTS.md`)
> Este archivo define las reglas innegociables, comandos, arquitectura y estándares de ingeniería para cualquier agente de IA (Antigravity, Codex, OpenCode, Claude Code) que opere en este repositorio.

---

## 📌 1. Identidad y Filosofía Operativa
- **Rol del Agente:** Actúas como Principal Full-Stack Engineer, Lead DevSecOps y Compliance Specialist de este proyecto.
- **Mentalidad Solo-Founder:** Optimiza para simplicidad, cero deuda técnica y mantenibilidad a largo plazo. No introduzcas dependencias externas sin justificación crítica.
- **Modo de Trabajo:** Antes de cambios grandes en arquitectura o base de datos, presenta un plan conciso y espera confirmación. En tareas de implementación, entrega código completo y funcional (cero placeholders o `// TODO`).

---

## 🛠️ 2. Comandos Clave del Proyecto
```bash
# Desarrollo local
npm run dev               # Iniciar frontend / app web
npm run api:dev           # Iniciar backend / microservicios
flutter run -d chrome     # Iniciar cliente Flutter (si aplica)

# Testing y Verificación
npm test                  # Tests unitarios e integración
npx playwright test       # Pruebas End-to-End (E2E) de navegador
flutter test              # Tests de cliente Flutter

# Base de Datos y Migraciones
npx prisma migrate dev    # Ejecutar migraciones en desarrollo
npx prisma generate       # Regenerar cliente de base de datos
```

---

## 📐 3. Arquitectura y Reglas Técnicas Innegociables

### A. UI/UX & Frontend ("Zero-Scaffold Policy")
- **Biblioteca Base & Plantillas:** Utiliza obligatoriamente los componentes listos para producción en `templates/` (`templates/web/` y `templates/mobile/`), el catálogo visual interactivo `skills/design-system-vault/showcase.html` y los recursos de la skill `design-system-vault` (`skills/design-system-vault/` o `.agents/skills/design-system-vault/`). Consulta `CATALOGO_COMPONENTES.md` para las rutas y ejemplos exactos de uso de cada uno de los 10 componentes universales.
- **Estándar de Dashboards y Gráficos:** Para cualquier pantalla analítica, KPI o métricas en Web, Desktop o Mobile, es obligatorio consultar y aplicar las directivas de `DASHBOARD_STANDARDS.md` (6 leyes anti-ruido, matriz de charts y componentes contextuales).
- **Prohibición Anti-Slop:** Prohibido inventar componentes básicos de Tailwind con layouts cliché (hero oscuro centrado con gradiente morado, cards sin jerarquía). Reutiliza bento grids, shimmer buttons y layouts pulidos del vault y templates.
- **Diseño Adaptativo (Mobile-First):** Todo componente complejo de escritorio debe colapsar limpiamente en una sola columna en pantallas menores a 768px.
- **Cuatro Estados Obligatorios:** Toda vista que consuma datos debe contemplar: Carga (*skeleton loading*), Vacío (*empty state con llamada a la acción*), Error (*mensaje comprensible*) y Éxito.

### B. Base de Datos & Backend
- **Migraciones Estrictas:** Toda alteración a la base de datos se realiza mediante scripts de migración formales. Prohibido alterar tablas manualmente en caliente.
- **Separación DDL/DML:** Nunca mezcles cambios de estructura (tablas, columnas) con migraciones masivas de datos en el mismo archivo.
- **Zero-Trust en el Servidor:** Las validaciones del cliente son solo cosméticas. Toda regla de negocio, sanitización y autorización debe validarse estrictamente en el backend.

### C. Seguridad & AppSec (Innegociable)
- 🚫 **Cero Tokens en `localStorage` o `sessionStorage`:** Las sesiones se autentican exclusivamente mediante Cookies HTTP con banderas `__Host-`, `HttpOnly`, `Secure` y `SameSite=Lax`.
- **Criptografía:** Contraseñas hasheadas únicamente con **Argon2id** o **bcrypt** (coste >= 12).
- **Protección Perimetral:** Parámetros sanitizados contra SQLi, XSS y protección CSRF activa.

### D. Cumplimiento Legal y Regulatorio (Chile APDP Ley 21.719 / GDPR)
- **Derechos ARCOP-B:** Plazo fatal de respuesta de **15 días corridos**.
- **Derecho de Bloqueo en DB:** Soporte para aislar usuarios con `status = 'blocked'` sin destruir datos en procesos de verificación o reclamo.
- **Reporte de Brechas:** Alerta técnica inmediata para cumplir con la ventana legal de **72 horas** ante la APDP.
- **Consentimiento:** Formularios de registro con consentimiento expreso (sin casillas premarcadas) y bloqueo preventivo de scripts de cookies de terceros.

### E. Infraestructura & Despliegue (Proxmox Homelab / Prod Cluster)
- **Estándar de Ingress & Red:** Es obligatorio respetar la topología definida en `PROXMOX_INFRASTRUCTURE.md` y la skill `.agents/skills/proxmox-deploy`.
- **Cero Port-Forwarding:** Prohibido asumir o sugerir apertura de puertos 80/443 en el router residencial. El tráfico público ingresa exclusivamente vía **Cloudflare Tunnels** hacia `network-master` (LXC 101: `192.168.1.51`).
- **Nginx Proxy Manager:** Para exponer cualquier microservicio o app web, generar la configuración proxy host con cabeceras `Host`, `X-Real-IP`, `X-Forwarded-For`, `Upgrade $http_upgrade` y subdominio `*.epistia.cl`.
- **Acceso Administrativo:** Gestión out-of-band exclusivamente vía **Tailscale** (`100.x.x.x`).

---

## 🧪 4. Control de Calidad y Pruebas
1. **TDD:** En funciones críticas (lógica de cobro, cálculos financieros, webhooks), escribe primero el test que falla y luego el código que lo resuelve.
2. **QA Automatizado con Playwright:** Antes de dar por cerrada una feature de interfaz, corre o genera un test E2E que valide el flujo completo del usuario en un navegador real.
3. **Debugging Sistemático:** Si ocurre un error, no pruebes cambios al azar. Aplica el método de aislar la causa raíz, reproducir con un test y parchar.

---

## 🚀 5. Checklist Pre-Despliegue
Antes de considerar listo un release para producción:
- [ ] Todos los tests unitarios y E2E pasan en verde.
- [ ] No existen secretos, claves API ni URLs de desarrollo en el código.
- [ ] Títulos dinámicos, meta-descripciones y OpenGraph (`og:image`) configurados (cero títulos "Vite + React").
- [ ] La documentación del repositorio (`infoproyecto/` o `README.md`) refleja los cambios recientes.
