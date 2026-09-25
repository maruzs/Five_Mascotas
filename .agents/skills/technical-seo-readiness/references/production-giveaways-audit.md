# Auditoría Exhaustiva de "Vibecoded Website Giveaways"

Esta guía detalla los 20 errores técnicos más frecuentes en proyectos web desarrollados con IA que delatan un sitio apresurado y cómo solucionarlos para alcanzar un estándar de producción profesional.

---

### 1. Código Fuente Inicial Vacío (`view-source` en blanco)
- **Problema:** En SPAs puras montadas con Create React App o Vite CSR estándar, el navegador recibe solo un archivo HTML con `<div id="root"></div>`. Los motores de búsqueda y bots de redes sociales ven una página completamente en blanco sin texto ni contenido.
- **Solución:**
  - Migrar a Next.js / Nuxt / Astro con Server-Side Rendering (SSR) o Static Site Generation (SSG).
  - En Vite SPA puro, utilizar herramientas de prerenderizado (`vite-plugin-prerender` o SSG) o inyectar etiquetas semánticas y texto inicial estructurado dentro del HTML base antes del montaje del bundle.

### 2. Títulos por Defecto del Empaquetador
- **Problema:** Sitíos en producción con títulos de pestaña como *"Vite + React"*, *"Create Next App"* o *"React App"*.
- **Solución:** Modificar el `<title>` en el HTML base y configurar títulos dinámicos en cada ruta mediante Next Metadata API, React Helmet o hooks de navegación.

### 3. Títulos Idénticos en Toda la Aplicación
- **Problema:** Cada pantalla (inicio, precios, contacto, blog) tiene exactamente el mismo título *"Mi SaaS"*.
- **Solución:** Estructura consistente y descriptiva: `[Nombre de la Página] | [Nombre de la Marca o Propuesta de Valor]`. Ejemplo: *"Precios y Planes | CloudSuite"*.

### 4. Ausencia de Meta Description
- **Problema:** Sin etiqueta `<meta name="description">`, los buscadores generan extractos automáticos aleatorios de botones o menús.
- **Solución:** Redactar descripciones únicas de entre 140 y 160 caracteres con propuesta de valor y llamada a la acción.

### 5. Sin Etiquetas Open Graph ni Twitter Cards (`og:image`)
- **Problema:** Al compartir el enlace en WhatsApp, Slack, Twitter/X o LinkedIn, no aparece ninguna tarjeta visual o sale una imagen rota.
- **Solución:** Configurar siempre:
  ```html
  <meta property="og:title" content="Título Atractivo" />
  <meta property="og:description" content="Descripción breve" />
  <meta property="og:image" content="https://tudominio.cl/og-image.png" />
  <meta property="og:url" content="https://tudominio.cl" />
  <meta name="twitter:card" content="summary_large_image" />
  ```
  La imagen debe tener 1200x630 píxeles, formato PNG o JPG de alta calidad y pesar menos de 300 KB.

### 6. Ausencia de Etiqueta Canónica (`rel="canonical"`)
- **Problema:** Google penaliza el contenido duplicado si la web responde igual con `http`, `https`, `www`, `sin-www` o parámetros de seguimiento (`?utm_source=...`).
- **Solución:** Inyectar en cada página: `<link rel="canonical" href="https://tudominio.cl/ruta-actual" />`.

### 7. Jerarquía Semántica Incorrecta de Encabezados
- **Problema:** Páginas con cero `<h1>` o con tres `<h1>` distintos compitiendo entre sí, o saltos abruptos de `<h1>` a `<h4>`.
- **Solución:** Exactamente un único `<h1>` por página que sintetice el tema central. Estructura ordenada: `<h1>` -> secciones con `<h2>` -> subsecciones con `<h3>`.

### 8. Falta del Atributo `lang` en `<html>`
- **Problema:** Los motores de búsqueda y lectores de pantalla no saben en qué idioma está la página.
- **Solución:** Configurar `<html lang="es">` (o `"en"`).

### 9. Imágenes sin Texto Alternativo (`alt`)
- **Problema:** Daña el SEO en Google Imágenes y viola los estándares de accesibilidad WCAG.
- **Solución:** Agregar `alt="Descripción contextual concisa"` en cada imagen informativa. Imágenes decorativas deben llevar `alt="" aria-hidden="true"`.

### 10. Suite de Favicons Incompleta
- **Problema:** Dejar el favicon azul de Vite o el triángulo negro de Vercel.
- **Solución:** Generar paquete completo: `/favicon.ico` (16x16, 32x32), `/apple-touch-icon.png` (180x180), iconos de 192px/512px y `/site.webmanifest`.

### 11. Páginas de Error 404/500 Genéricas o Inexistentes
- **Problema:** Rutas inexistentes que devuelven una pantalla en blanco, la página por defecto de Nginx o un error 200 con texto plano.
- **Solución:** Componente 404 personalizado que mantenga la identidad visual y provea botones de retorno al inicio o buscador.

### 12. Exposición de Source Maps en Producción
- **Problema:** Archivos `.map` públicos en producción que permiten a cualquiera descargar tu código fuente original TypeScript y componentes desde las herramientas de desarrollador.
- **Solución:** Configurar `sourcemap: false` en tu archivo de empaquetado para compilaciones de producción.

### 13. Consola de Producción Llena de Errores y Logs
- **Problema:** La consola del navegador muestra decenas de `console.log("data:", ...)`, advertencias de claves duplicadas de React o errores de red.
- **Solución:** Purgar logs de depuración y configurar plugins de compilación (como `terser` o `esbuild drop: ['console']`) para limpiar la consola en producción.

### 14. Bundles Gigantescos de JavaScript
- **Problema:** Cargar 2 MB de JavaScript al entrar a la landing page debido a bibliotecas pesadas de gráficos o animaciones no modularizadas.
- **Solución:** Carga perezosa con `React.lazy()` / `next/dynamic()`, tree-shaking activo y compresión Brotli/Gzip.
