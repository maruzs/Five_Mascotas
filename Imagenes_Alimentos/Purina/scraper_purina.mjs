import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_OUTPUT = path.join(__dirname, "Purina");

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });
      if (res.ok) return res;
      if (res.status === 404) return null;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1500 * (i + 1));
    }
  }
  return null;
}

// 1. Gather all useful target URLs
async function collectAllProductUrls() {
  console.log("--> Paso 1: Recolectando URLs de productos desde sitemaps y catálogo...");
  const finalUrls = new Set();

  // A. Brand sitemaps
  const sitemaps = [
    "bonelo_purina_latam_com",
    "felix_purina_latam_com",
    "purina_one_purina_latam_com",
    "proplan_purina_latam_com",
    "gati_purina_latam_com_gati",
    "fancy_feast_purina_latam_com",
    "catchow_purina_latam_com",
    "excellent_purina_latam_com",
    "doko_purina_latam_com",
    "dogchow_purina_latam_com",
    "dentalife_purina_latam_com",
  ];

  const nonProductRegex =
    /(?:politica|terminos|contacto|por-el-planeta|beneficio|registrate|alimento-seco$|alimento-humedo$|productos$|perros$|gatos$)/i;

  for (const sm of sitemaps) {
    try {
      const res = await fetchWithRetry(`https://purina.cl/sitemaps/${sm}/sitemap.xml`);
      if (!res) continue;
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      for (const u of locs) {
        const clean = u.trim();
        // filter out brand root or general info pages
        const parts = clean.replace("https://purina.cl/", "").split("/").filter(Boolean);
        if (parts.length >= 2 && !nonProductRegex.test(clean)) {
          finalUrls.add(clean);
        }
      }
    } catch (err) {
      console.warn(`Error en sitemap ${sm}:`, err.message);
    }
  }
  console.log(`   URLs de sitemaps de marca encontradas: ${finalUrls.size}`);

  // B. Paginación de purina/productos (para no perder ningún producto o novedad)
  let page = 0;
  while (page <= 20) {
    try {
      const res = await fetchWithRetry(`https://purina.cl/purina/productos?page=${page}`);
      if (!res) break;
      const html = await res.text();

      // Encontrar enlaces a productos intermedios
      const rawMatches = [...html.matchAll(/href="(\/purina\/[a-zA-Z0-9\-_/]+)"/g)].map((m) => m[1]);
      const valid = rawMatches.filter(
        (u) =>
          !u.includes("conoce-purina") &&
          !u.includes("purina-sociedad") &&
          !u.includes("mi-mascota") &&
          !u.includes("nuestras-marcas") &&
          !u.includes("ingredientes") &&
          !u.includes("adopta") &&
          !u.includes("registrate") &&
          !u.includes("politica") &&
          !u.includes("terminos") &&
          !u.includes("huellas") &&
          !u.includes("juntos") &&
          !u.includes("purina-cares") &&
          !u.includes("purina-por-el-planeta") &&
          u !== "/purina/productos"
      );

      for (const rel of valid) {
        const interUrl = `https://purina.cl${rel}`;
        // Visitar intermedio para resolver el botón "Ver más"
        try {
          const interRes = await fetchWithRetry(interUrl);
          if (interRes) {
            const interHtml = await interRes.text();
            // Buscar enlace de Ver más
            const verMasMatch = interHtml.match(
              /<a\s+[^>]*href="([^"]+)"[^>]*>(?:[\s\S]*?Ver\s*m[aá]s[\s\S]*?)<\/a>/i
            );
            if (verMasMatch && verMasMatch[1]) {
              let target = verMasMatch[1];
              if (target.startsWith("/")) target = `https://purina.cl${target}`;
              finalUrls.add(target);
            }
          }
        } catch (e) {}
      }

      if (!html.includes(`page=${page + 1}`)) break;
      page++;
    } catch (e) {
      console.warn(`Error en listado página ${page}:`, e.message);
      break;
    }
  }

  console.log(`--> Total de productos únicos a procesar: ${finalUrls.size}\n`);
  return Array.from(finalUrls);
}

// 2. Extraer datos del producto
async function parseProductPage(url) {
  const res = await fetchWithRetry(url);
  if (!res) return null;
  const html = await res.text();

  // Nombre
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) return null;
  const name = h1Match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!name || name.length < 3) return null;

  // Si la página es sólo de listado de categoría o corporativa, saltar
  if (name.toLowerCase().includes("términos") || name.toLowerCase().includes("política") || name.toLowerCase() === "purina") {
    return null;
  }

  // Submarca & Especie
  const lowerUrl = url.toLowerCase();
  const lowerName = name.toLowerCase();
  const lowerHtml = html.toLowerCase();

  let submarca = "Purina";
  if (lowerUrl.includes("/proplan") || lowerName.includes("pro plan")) submarca = "Pro Plan";
  else if (lowerUrl.includes("/dogchow") || lowerName.includes("dog chow")) submarca = "Dog Chow";
  else if (lowerUrl.includes("/doko") || lowerName.includes("doko")) submarca = "Doko";
  else if (lowerUrl.includes("/purina-one") || lowerName.includes("purina one")) submarca = "Purina One";
  else if (lowerUrl.includes("/excellent") || lowerName.includes("excellent")) submarca = "Excellent";
  else if (lowerUrl.includes("/felix") || lowerName.includes("felix")) submarca = "Felix";
  else if (lowerUrl.includes("/catchow") || lowerName.includes("cat chow")) submarca = "Cat Chow";
  else if (lowerUrl.includes("/fancy-feast") || lowerName.includes("fancy feast")) submarca = "Fancy Feast";
  else if (lowerUrl.includes("/gati") || lowerName.includes("gati")) submarca = "Gati";
  else if (lowerUrl.includes("/dentalife") || lowerName.includes("dentalife")) submarca = "Dentalife";
  else if (lowerUrl.includes("/bonelo") || lowerName.includes("bonelo")) submarca = "Bonelo";

  let especie = "perro";
  if (
    lowerUrl.includes("/gatos") ||
    lowerUrl.includes("/felix") ||
    lowerUrl.includes("/catchow") ||
    lowerUrl.includes("/fancy-feast") ||
    lowerUrl.includes("/gati") ||
    lowerName.includes("gato") ||
    lowerName.includes("gatito") ||
    lowerName.includes("felino")
  ) {
    especie = "gato";
  }

  // Etapa de vida
  let etapa = "adulto";
  if (lowerName.includes("cachorro") || lowerName.includes("puppy") || lowerName.includes("gatito") || lowerName.includes("kitten")) {
    etapa = "cachorro";
  } else if (lowerName.includes("senior") || lowerName.includes("7+") || lowerName.includes("longevidad") || lowerName.includes("edad madura")) {
    etapa = "senior";
  }

  // Formatos / Tamaños
  let formats = [];
  const formatsMatch = html.match(/Tamaños disponibles[\s\S]*?<\/div>\s*<\/div>/i);
  if (formatsMatch) {
    formats = [...new Set([...formatsMatch[0].matchAll(/(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|kg\.))\b/gi)].map((m) => m[1]))];
  }
  if (formats.length === 0) {
    // Buscar en el texto cercano al producto
    const sizeFallbacks = [...html.matchAll(/(?:Disponible en|Presentación|Contenido Neto)[^:<]*[:\s]+([\d\w\s,]+)/gi)];
    for (const fb of sizeFallbacks) {
      const found = [...fb[1].matchAll(/(\d+(?:[.,]\d+)?\s*(?:kg|g|gr))\b/gi)].map((m) => m[1]);
      formats.push(...found);
    }
  }

  // Descripción
  let description = "";
  const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (metaDesc && metaDesc[1]) {
    description = metaDesc[1].trim();
  } else {
    const leadMatch = html.match(/class="[^"]*lead[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div)>/i);
    if (leadMatch) description = leadMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  // Ingredientes
  let rawIngredients = "";
  const ingMatch =
    html.match(/Ingredientes<\/h\d>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
    html.match(/Ingredientes[\s\S]*?<div[^>]*class="[^"]*(?:field--name-field-ingredients|accordion|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/Ingredientes([\s\S]*?)(?:Análisis garantizado|Guía de alimentación|<\/section>)/i);

  if (ingMatch) {
    rawIngredients = ingMatch[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Lista limpia de ingredientes separados por comas
  let ingredientes = rawIngredients;
  if (ingredientes.startsWith(":")) ingredientes = ingredientes.substring(1).trim();

  // Análisis Garantizado
  let analysis = {};
  const analTable = html.match(/Análisis garantizado[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/i);
  if (analTable) {
    const rows = [...analTable[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const r of rows) {
      const cells = [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
        c[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
      );
      if (cells.length >= 2) {
        const key = cells[0];
        const val = cells.slice(1).filter(Boolean).join(" | ");
        if (key && !key.toLowerCase().includes("nutriente")) {
          analysis[key] = val;
        }
      }
    }
  }

  // Imagen principal
  const imgMatch =
    html.match(/<img[^>]+id="main_image"[^>]+src="([^">]+)"/i) ||
    html.match(/<img[^>]+class="[^"]*xzoom[^"]*"[^>]+src="([^">]+)"/i) ||
    html.match(/<img[^>]+src="([^">]+styles\/webp\/public\/[^">]+)"/i);

  let imageUrl = "";
  if (imgMatch) {
    imageUrl = imgMatch[1].startsWith("http") ? imgMatch[1] : `https://purina.cl${imgMatch[1]}`;
  }

  return {
    nombre: name,
    submarca,
    especie,
    etapa_vida: etapa,
    formatos: [...new Set(formats)],
    descripcion: description,
    ingredientes,
    analisis_garantizado: analysis,
    url_imagen_original: imageUrl,
    url_origen: url,
  };
}

// 3. Descargar imagen
async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return true;
  try {
    const res = await fetchWithRetry(url);
    if (!res) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.warn(`Error al descargar imagen ${url}:`, err.message);
    return false;
  }
}

// 4. Runner principal
async function run() {
  const startTime = Date.now();
  const urls = await collectAllProductUrls();

  const dataset = [];
  const total = urls.length;
  console.log(`--> Paso 2: Procesando y descargando ${total} fichas de productos...`);

  let count = 0;
  for (const url of urls) {
    count++;
    try {
      const prod = await parseProductPage(url);
      if (!prod) continue;

      // Generar slug y nombre de archivo para la imagen
      const subSlug = slugify(prod.submarca);
      const prodSlug = slugify(prod.nombre);
      const targetDir = path.join(BASE_OUTPUT, `${prod.especie}s`, subSlug);
      ensureDir(targetDir);

      let imageExt = ".webp";
      if (prod.url_imagen_original.includes(".png")) imageExt = ".png";
      else if (prod.url_imagen_original.includes(".jpg") || prod.url_imagen_original.includes(".jpeg")) imageExt = ".jpg";
      else if (prod.url_imagen_original.includes(".avif")) imageExt = ".avif";

      const filename = `${prodSlug}${imageExt}`;
      const destPath = path.join(targetDir, filename);

      let downloaded = false;
      if (prod.url_imagen_original) {
        downloaded = await downloadImage(prod.url_imagen_original, destPath);
      }

      const relativeImgPath = path.relative(path.join(__dirname, ".."), destPath);

      dataset.push({
        id: `${subSlug}-${prodSlug}`,
        marca_madre: "Purina",
        submarca: prod.submarca,
        especie: prod.especie,
        etapa_vida: prod.etapa_vida,
        nombre: prod.nombre,
        formatos: prod.formatos,
        descripcion: prod.descripcion,
        ingredientes: prod.ingredientes,
        analisis_garantizado: prod.analisis_garantizado,
        imagen_local: downloaded || fs.existsSync(destPath) ? relativeImgPath : null,
        url_imagen_original: prod.url_imagen_original,
        url_origen: prod.url_origen,
      });

      process.stdout.write(
        `\r[${count}/${total}] (${Math.round((count / total) * 100)}%) OK: ${prod.submarca} - ${prod.nombre.slice(0, 40)}...`
      );
    } catch (e) {
      console.warn(`\nError procesando ${url}:`, e.message);
    }
  }

  console.log(`\n\n--> Paso 3: Guardando dataset en JSON y CSV...`);

  // Guardar JSON
  const jsonPath = path.join(BASE_OUTPUT, "dataset.json");
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), "utf-8");

  // Guardar CSV
  const csvHeaders = [
    "id",
    "marca_madre",
    "submarca",
    "especie",
    "etapa_vida",
    "nombre",
    "formatos",
    "descripcion",
    "ingredientes",
    "analisis_garantizado",
    "imagen_local",
    "url_imagen_original",
    "url_origen",
  ];

  const csvRows = [
    csvHeaders.join(";"),
    ...dataset.map((p) =>
      [
        `"${p.id}"`,
        `"${p.marca_madre}"`,
        `"${p.submarca}"`,
        `"${p.especie}"`,
        `"${p.etapa_vida}"`,
        `"${p.nombre.replace(/"/g, '""')}"`,
        `"${(p.formatos || []).join(", ")}"`,
        `"${(p.descripcion || "").replace(/"/g, '""')}"`,
        `"${(p.ingredientes || "").replace(/"/g, '""')}"`,
        `"${JSON.stringify(p.analisis_garantizado).replace(/"/g, '""')}"`,
        `"${p.imagen_local || ""}"`,
        `"${p.url_imagen_original || ""}"`,
        `"${p.url_origen}"`,
      ].join(";")
    ),
  ];
  const csvPath = path.join(BASE_OUTPUT, "dataset.csv");
  fs.writeFileSync(csvPath, csvRows.join("\n"), "utf-8");

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`✅ ¡Finalizado con éxito en ${duration}s!`);
  console.log(`Total productos guardados: ${dataset.length}`);
  console.log(`Archivo JSON: ${jsonPath}`);
  console.log(`Archivo CSV: ${csvPath}`);
}

run().catch(console.error);
