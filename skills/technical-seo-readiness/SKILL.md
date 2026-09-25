---
name: technical-seo-readiness
description: >-
  Expert technical SEO, metadata engineering, web performance, and production launch readiness workflow.
  Eliminates vibecoded website giveaways (empty view-source in SPAs, default "Vite + React" titles, missing meta descriptions,
  missing og:image/Twitter cards, canonical tags, multiple/missing H1s, broken 404 pages, exposed source maps, console errors),
  configures AI search engine standards (llms.txt, robots.txt, dynamic sitemap.xml, Schema.org JSON-LD),
  and enforces Core Web Vitals optimizations (LCP, CLS, code splitting).
  Use whenever preparing a web app for production launch, auditing SEO/OpenGraph tags, configuring crawlers/bots,
  or optimizing web performance and discoverability.
---

# Technical SEO, Metadata & Production Readiness Skill

Esta skill dota al agente de capacidades de **Principal Technical SEO Specialist, Frontend Performance Engineer y Release Engineer**. Su objetivo es auditar, estructurar e implementar todos los requerimientos técnicos de indexabilidad, visibilidad en buscadores tradicionales (Google, Bing) y motores de Inteligencia Artificial (ChatGPT, Claude, Perplexity), garantizando que el sitio web o aplicación web tenga un nivel de preparación de grado producción impecable antes de su lanzamiento comercial.

---

## 1. Erradicación de "Vibecoded Website Giveaways" (Fallos Técnicos Frecuentes)

Los proyectos generados apresuradamente por IA suelen cometer errores técnicos básicos que delatan un prototipo descuidado. Consulta la [Guía de Auditoría de Producción](./references/production-giveaways-audit.md) para más detalles:

1. **PROHIBIDO código fuente inicial vacío (`view-source` en blanco):**
   - En aplicaciones SPA cliente (Vite/React/Vue), configura pre-renderizado estático (SSG), Server-Side Rendering (SSR con Next.js/Nuxt) o inyecta metadatos y contenido estático esencial en el `index.html` para que los crawlers no encuentren un simple `<div id="root"></div>`.
2. **PROHIBIDO títulos de pestaña genéricos o estáticos:**
   - Erradicar títulos por defecto como *"Vite + React"*, *"Create Next App"* o *"Document"*.
   - Toda página debe contar con un título dinámico y único siguiendo el patrón: `[Nombre de Página] – [Propuesta de Valor o Marca]`.
3. **PROHIBIDO páginas sin Meta Description:**
   - Meta descripción única y persuasiva de entre 140 y 160 caracteres por página, orientada a la intención de búsqueda.
4. **PROHIBIDO ausencia de Open Graph y Twitter Cards:**
   - Configuración obligatoria de `og:title`, `og:description`, `og:url`, `og:type` y la imagen `og:image` (1200x630 píxeles, peso < 300 KB) con `twitter:card: summary_large_image`.
5. **PROHIBIDO URLs sin etiqueta canónica (`rel="canonical"`):**
   - URL canónica absoluta en cada página para evitar penalizaciones por contenido duplicado (parámetros UTM, `www` vs `no-www`).
6. **PROHIBIDO jerarquía semántica defectuosa de encabezados:**
   - Debe existir **exactamente un único `<h1>`** por página. La jerarquía debe descender ordenadamente (`<h1>` -> `<h2>` -> `<h3>`) sin saltarse niveles.
7. **PROHIBIDO imágenes sin texto alternativo (`alt`):**
   - Atributo `alt` descriptivo en todas las imágenes informativas. Imágenes decorativas deben llevar `alt=""` y `aria-hidden="true"`.
8. **PROHIBIDO favicons incompletos o por defecto:**
   - Implementar suite completa: `favicon.ico`, `apple-touch-icon.png` (180x180), iconos de 192px/512px y `site.webmanifest`.
9. **PROHIBIDO ausencia de página 404 personalizada:**
   - Crear una página 404 integrada con la identidad visual del sitio, con enlaces de retorno y respuesta HTTP 404 real. Consulta [404-component-template.tsx](./resources/404-component-template.tsx).
10. **PROHIBIDO exponer Source Maps en producción:**
    - Desactivar `sourcemap: false` en `vite.config.ts`, `next.config.js` o `webpack.config.js` para evitar fuga de código fuente original.
11. **PROHIBIDO consolas de producción con errores:**
    - Cero `console.log`, cero warnings de claves de React (`key prop warning`) y cero errores de hidratación no resueltos.

---

## 2. Infraestructura Moderna de Indexación y Soporte para IA

Asegura la visibilidad del proyecto tanto en motores tradicionales como en agentes de IA:

### A. Estándar `llms.txt` y `llms-full.txt` (AI Crawlers & Agents)
- Ubicar en la raíz pública `/llms.txt` para que herramientas como Cursor, ChatGPT Search, Perplexity y Claude lean la documentación, arquitectura y propósito del proyecto en Markdown estructurado.
- Utiliza la plantilla de referencia [llms.txt](./resources/llms.txt).

### B. Configuración Estratégica de `robots.txt`
- Ubicar `/robots.txt` en la raíz pública declarando la ruta del Sitemap y directivas claras para crawlers tradicionales y bots de IA (GPTBot, ClaudeBot, PerplexityBot).
- Utiliza la plantilla [robots.txt](./resources/robots.txt).

### C. Generación Dinámica de `sitemap.xml`
- Mapa del sitio XML actualizado con `<loc>`, `<lastmod>`, `<changefreq>` y `<priority>` de todas las rutas públicas indexables.

### D. Datos Estructurados Schema.org (JSON-LD)
- Inyectar bloques `<script type="application/ld+json">` adaptados al tipo de proyecto (`WebSite`, `Organization`, `SoftwareApplication`, `FAQPage`). Consulta la [Guía Schema JSON-LD](./references/schema-jsonld-guide.md).

---

## 3. Rendimiento y Core Web Vitals (Google Lighthouse > 90)

1. **Optimización de JavaScript:**
   - Code splitting y lazy loading con `React.lazy()` o `next/dynamic()`.
   - Mantener el bundle inicial de JavaScript comprimido por debajo de los 150-200 KB.
2. **Optimización de Recursos Multimedia:**
   - Imágenes en formato moderno (WebP o AVIF).
   - Atributos obligatorios `width` y `height` en etiquetas `<img>` para erradicar el salto de diseño acumulativo (Cumulative Layout Shift - CLS < 0.1).
   - `fetchpriority="high"` en la imagen principal del Hero para acelerar el Largest Contentful Paint (LCP < 2.5s).
3. **Fuentes Web:**
   - Auto-hospedar fuentes en formato `woff2` y usar `font-display: swap` para prevenir parpadeos invisibles de texto (FOIT).

---

## 4. Workflow de Ejecución Paso a Paso

```text
Paso 1: Auditoría de Metadatos y Estructura HTML
 └── Validar exactamente 1 H1 por página.
 └── Verificar <title> dinámico, meta description y canonical tag.
 └── Verificar tags Open Graph (og:image, twitter:card).

Paso 2: Generación de Archivos de Indexación
 └── Crear /public/robots.txt con enlace al sitemap.
 └── Crear /public/llms.txt estructurado para agentes de IA.
 └── Generar /public/sitemap.xml con todas las URLs indexables.
 └── Inyectar Schema.org JSON-LD (SoftwareApplication / Organization).

Paso 3: Componentes y Experiencia de Error
 └── Implementar página 404 personalizada con branding y navegación.
 └── Configurar suite completa de favicons y webmanifest.

Paso 4: Auditoría de Build de Producción
 └── Desactivar sourcemaps de producción (sourcemap: false).
 └── Eliminar console.logs y verificar bundle size / lazy loading.
```

---

## Recursos y Referencias Incluidos

- [production-giveaways-audit.md](./references/production-giveaways-audit.md): Lista de comprobación técnica detallada.
- [schema-jsonld-guide.md](./references/schema-jsonld-guide.md): Plantillas de datos estructurados para SaaS y apps.
- [robots.txt](./resources/robots.txt): Archivo de directivas para buscadores y bots de IA listo para producción.
- [llms.txt](./resources/llms.txt): Especificación estándar en Markdown para agentes y LLMs.
- [404-component-template.tsx](./resources/404-component-template.tsx): Componente 404 premium en React/Next.js.
