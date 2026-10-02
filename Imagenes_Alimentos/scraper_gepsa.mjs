import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_OUTPUT = path.join(__dirname, "Gepsa");

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

async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return true;
  try {
    const res = await fetchWithRetry(url);
    if (!res) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    console.warn(`Error al descargar imagen ${url}:`, err.message);
    return false;
  }
}

function extractTable(htmlSnippet) {
  const analysis = {};
  const analTable = htmlSnippet.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (analTable) {
    const rows = [...analTable[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const r of rows) {
      const cells = [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
        c[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
      );
      if (cells.length >= 2) {
        const key = cells[0];
        const val = cells.slice(1).filter(Boolean).join(" ");
        if (key && !key.toLowerCase().includes("nutriente") && !key.toLowerCase().includes("categoría")) {
          analysis[key] = val;
        }
      }
    }
  }
  return analysis;
}

function extractFormats(text) {
  const matches = [...text.matchAll(/(\d+(?:[.,]\d+)?\s*(?:kg|g|gr))\b/gi)].map((m) => m[1]);
  return [...new Set(matches)];
}

function cleanIngredients(raw) {
  if (!raw) return "";
  let cleaned = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  cleaned = cleaned.replace(/^N[óo]mina de ingredientes\s*[:\s]*/i, "");
  cleaned = cleaned.replace(/^INGREDIENTES\s*[:\s]*/i, "");
  cleaned = cleaned.replace(/^Ingredientes\s*[:\s]*/i, "");
  return cleaned.trim();
}

// Submarca metadata: canal y marca oficial
const BRANDS_CONFIG = [
  // 1. Veterinarias y Pet Shops
  {
    slug: "topnutrition",
    name: "Top Nutrition",
    canal: "Veterinaria y Pet Shop",
    url: "https://gepsapetfoods.com/topnutrition/",
    type: "portfolio-detail",
  },
  {
    slug: "ken-l",
    name: "Ken-L Ration",
    canal: "Veterinaria y Pet Shop",
    url: "https://gepsapetfoods.com/ken-l/",
    type: "portfolio-detail",
  },
  {
    slug: "exact",
    name: "Exact",
    canal: "Veterinaria y Pet Shop",
    url: "https://gepsapetfoods.com/exact/",
    type: "portfolio-detail",
  },
  // 2. Canal Tradicional
  {
    slug: "odwalla",
    name: "Odwalla",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/odwalla/",
    type: "portfolio-detail",
  },
  {
    slug: "9-lives",
    name: "9-Lives",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/9-lives/",
    type: "portfolio-detail",
  },
  {
    slug: "cari-amici",
    name: "Cari Amici",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/cari-amici/",
    type: "portfolio-detail",
  },
  {
    slug: "ganacan-ganacat",
    name: "Ganacan / Ganacat",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/ganacan-ganacat/",
    type: "portfolio-detail",
  },
  {
    slug: "compinches",
    name: "Compinches",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/compinches/",
    type: "custom-compinches",
  },
  {
    slug: "fishy",
    name: "Fishy",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/fishy/",
    type: "custom-single",
    defaultTitle: "Fishy Gatos Adultos Sabor Pescado",
    especie: "gato",
    etapa: "adulto",
  },
  {
    slug: "zimpi",
    name: "Zimpi",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/zimpi/",
    type: "custom-zimpi",
  },
  {
    slug: "magnificos",
    name: "Magníficos",
    canal: "Canal Tradicional",
    url: "https://gepsapetfoods.com/magnificos/",
    type: "custom-magnificos",
  },
];

async function parseBrand(cfg) {
  console.log(`\n--> Procesando ${cfg.name} (${cfg.canal})...`);
  const res = await fetchWithRetry(cfg.url);
  if (!res) return [];
  const html = await res.text();
  const products = [];

  if (cfg.type === "portfolio-detail") {
    const sections = [...html.matchAll(/<section[^>]*class="portfolio-detail"[\s\S]*?<\/section>/gi)];
    for (const secMatch of sections) {
      const secHtml = secMatch[0];

      // Título
      const titleMatch = secHtml.match(/<h2[^>]*class="[^"]*main-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i);
      if (!titleMatch) continue;
      const title = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

      // Imagen
      const imgMatch = secHtml.match(/<img[^>]+class="[^"]*main-image[^"]*"[^>]+src="([^">]+)"/i);
      const imageUrl = imgMatch ? imgMatch[1] : "";

      // Especie y Etapa
      const lowerTitle = title.toLowerCase();
      let especie = "perro";
      if (lowerTitle.includes("gato") || lowerTitle.includes("gatito") || lowerTitle.includes("felino") || lowerTitle.includes("9-lives") || lowerTitle.includes("9 lives") || lowerTitle.includes("urinario")) {
        if (!lowerTitle.includes("perro")) especie = "gato";
      }
      let etapa = "adulto";
      if (lowerTitle.includes("cachorro") || lowerTitle.includes("puppy") || lowerTitle.includes("gatito") || lowerTitle.includes("kitten")) {
        etapa = "cachorro";
      } else if (lowerTitle.includes("senior") || lowerTitle.includes("anti age") || lowerTitle.includes("madura")) {
        etapa = "senior";
      }

      // Descripción
      let description = "";
      const descMatch = secHtml.match(/<p class="mb-4">([\s\S]*?)<\/p>/i)
        || secHtml.match(/<div class="col-12 col-lg-6[^"]*">\s*<p>([\s\S]*?)<\/p>/i);
      if (descMatch) description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      // Ingredientes
      let ingredientes = "";
      const ingSection = secHtml.match(/N[óo]mina de ingredientes[\s\S]*?<\/p>/i)
        || secHtml.match(/Ingredientes[\s\S]*?<\/p>/i);
      if (ingSection) {
        ingredientes = cleanIngredients(ingSection[0]);
      }

      // Análisis garantizado
      const analysis = extractTable(secHtml);

      // Formatos / Presentaciones
      let formatos = [];
      const presSection = secHtml.match(/Presentaciones[\s\S]*?<\/div>\s*<\/div>/i);
      if (presSection) {
        formatos = extractFormats(presSection[0]);
      }
      if (formatos.length === 0) {
        formatos = extractFormats(secHtml);
      }

      products.push({
        submarca: cfg.name,
        canal: cfg.canal,
        especie,
        etapa_vida: etapa,
        nombre: title,
        formatos,
        descripcion: description,
        ingredientes,
        analisis_garantizado: analysis,
        url_imagen_original: imageUrl,
        url_origen: cfg.url,
      });
    }
  } else if (cfg.type === "custom-compinches") {
    const sections = [...html.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi)];
    const compDefs = [
      {
        idx: 2,
        nombre: "Compinches Alimento Balanceado Completo para Perros Adultos",
        especie: "perro",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/compinche_perro_carne01.png",
      },
      {
        idx: 3,
        nombre: "Compinches Alimento Balanceado Completo para Perros Cachorros y Adultos (Gestante/Lactante)",
        especie: "perro",
        etapa: "cachorro",
        img: "https://gepsapetfoods.com/wp-content/uploads/2026/08/compinche_perro_cach02.png",
      },
      {
        idx: 4,
        nombre: "Compinches Nutrición Completa y Balanceada para Gato Adulto",
        especie: "gato",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/compinche_gato_pescado01.png",
      },
    ];

    for (const def of compDefs) {
      if (sections[def.idx]) {
        const sec = sections[def.idx][1];
        const ingMatch = sec.match(/INGREDIENTES[\s\S]*?<\/p>/i);
        const ingredientes = ingMatch ? cleanIngredients(ingMatch[0]) : "";
        const analysis = extractTable(sec);
        const formatos = extractFormats(sec);
        products.push({
          submarca: cfg.name,
          canal: cfg.canal,
          especie: def.especie,
          etapa_vida: def.etapa,
          nombre: def.nombre,
          formatos,
          descripcion: "Nutrición completa y balanceada para tu mascota con proteínas de origen animal.",
          ingredientes,
          analisis_garantizado: analysis,
          url_imagen_original: def.img,
          url_origen: cfg.url,
        });
      }
    }
  } else if (cfg.type === "custom-single") {
    // Fishy
    const ingMatch = html.match(/INGREDIENTES[\s\S]*?<\/p>/i);
    const ingredientes = ingMatch ? cleanIngredients(ingMatch[0]) : "";
    const analysis = extractTable(html);
    const formatos = extractFormats(html);
    products.push({
      submarca: cfg.name,
      canal: cfg.canal,
      especie: cfg.especie,
      etapa_vida: cfg.etapa,
      nombre: cfg.defaultTitle,
      formatos,
      descripcion: "Alimento completo y balanceado con exquisito sabor a pescado y taurina.",
      ingredientes,
      analisis_garantizado: analysis,
      url_imagen_original: "https://gepsapetfoods.com/wp-content/uploads/2021/07/fishy_product_01.png",
      url_origen: cfg.url,
    });
  } else if (cfg.type === "custom-zimpi") {
    const sections = [...html.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi)];
    const zDefs = [
      {
        idx: 2,
        nombre: "Zimpi Alimento Balanceado Completo para Perros Sabor Carne",
        especie: "perro",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/zimpi_perro_01.png",
      },
      {
        idx: 3,
        nombre: "Zimpi Alimento Balanceado Completo para Gatos Sabor Pescado",
        especie: "gato",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/zimpi_gato_01.png",
      },
    ];
    for (const def of zDefs) {
      if (sections[def.idx]) {
        const sec = sections[def.idx][1];
        const ingMatch = sec.match(/INGREDIENTES[\s\S]*?<\/p>/i);
        const ingredientes = ingMatch ? cleanIngredients(ingMatch[0]) : "";
        const analysis = extractTable(sec);
        const formatos = extractFormats(sec);
        products.push({
          submarca: cfg.name,
          canal: cfg.canal,
          especie: def.especie,
          etapa_vida: def.etapa,
          nombre: def.nombre,
          formatos,
          descripcion: `Alimento balanceado completo para ${def.especie}s.`,
          ingredientes,
          analisis_garantizado: analysis,
          url_imagen_original: def.img,
          url_origen: cfg.url,
        });
      }
    }
  } else if (cfg.type === "custom-magnificos") {
    const sections = [...html.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi)];
    const mDefs = [
      {
        idx: 2,
        nombre: "Magníficos Nutrición Completa y Balanceada para Perros Adultos Fantásticos",
        especie: "perro",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/magnifico_perros_ch01.png",
      },
      {
        idx: 3,
        nombre: "Magníficos Nutrición Completa y Balanceada para Gatos Adultos Fantásticos",
        especie: "gato",
        etapa: "adulto",
        img: "https://gepsapetfoods.com/wp-content/uploads/2021/07/magnifico_gatos_ch01.png",
      },
    ];
    for (const def of mDefs) {
      if (sections[def.idx]) {
        const sec = sections[def.idx][1];
        const ingMatch = sec.match(/INGREDIENTES[\s\S]*?<\/p>/i);
        const ingredientes = ingMatch ? cleanIngredients(ingMatch[0]) : "";
        const analysis = extractTable(sec);
        const formatos = extractFormats(sec);
        products.push({
          submarca: cfg.name,
          canal: cfg.canal,
          especie: def.especie,
          etapa_vida: def.etapa,
          nombre: def.nombre,
          formatos,
          descripcion: `Alimento balanceado completo para ${def.especie}s adultos con ingredientes nobles.`,
          ingredientes,
          analisis_garantizado: analysis,
          url_imagen_original: def.img,
          url_origen: cfg.url,
        });
      }
    }
  }

  return products;
}

async function run() {
  const startTime = Date.now();
  console.log("=== INICIANDO EXTRACCIÓN DE GEPSA PET FOODS ===");
  ensureDir(BASE_OUTPUT);

  const allProducts = [];

  for (const cfg of BRANDS_CONFIG) {
    try {
      const prods = await parseBrand(cfg);
      console.log(`   -> ${cfg.name}: ${prods.length} productos extraídos`);
      allProducts.push(...prods);
    } catch (e) {
      console.warn(`Error en ${cfg.name}:`, e.message);
    }
  }

  console.log(`\n--> Total de productos recopilados: ${allProducts.length}`);
  console.log(`--> Descargando imágenes y organizando directorios por canal, especie y submarca...`);

  const dataset = [];

  for (const prod of allProducts) {
    const canalFolder = prod.canal === "Veterinaria y Pet Shop" ? "veterinaria_y_petshop" : "canal_tradicional";
    const especieFolder = `${prod.especie}s`;
    const brandFolder = slugify(prod.submarca);
    const prodSlug = slugify(prod.nombre);

    const targetDir = path.join(BASE_OUTPUT, canalFolder, especieFolder, brandFolder);
    ensureDir(targetDir);

    let ext = ".png";
    if (prod.url_imagen_original.endsWith(".jpg") || prod.url_imagen_original.endsWith(".jpeg")) ext = ".jpg";
    else if (prod.url_imagen_original.endsWith(".webp")) ext = ".webp";

    const filename = `${prodSlug}${ext}`;
    const destPath = path.join(targetDir, filename);

    let downloaded = false;
    if (prod.url_imagen_original) {
      downloaded = await downloadImage(prod.url_imagen_original, destPath);
    }

    const relativePath = path.relative(path.join(__dirname, ".."), destPath);

    dataset.push({
      id: `${brandFolder}-${prodSlug}`,
      marca_madre: "GEPSA Pet Foods",
      submarca: prod.submarca,
      canal: prod.canal,
      especie: prod.especie,
      etapa_vida: prod.etapa_vida,
      nombre: prod.nombre,
      formatos: prod.formatos,
      descripcion: prod.descripcion,
      ingredientes: prod.ingredientes,
      analisis_garantizado: prod.analisis_garantizado,
      imagen_local: downloaded || fs.existsSync(destPath) ? relativePath : null,
      url_imagen_original: prod.url_imagen_original,
      url_origen: prod.url_origen,
    });
  }

  console.log(`\n--> Guardando dataset.json y dataset.csv en Gepsa/...`);
  const jsonPath = path.join(BASE_OUTPUT, "dataset.json");
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), "utf-8");

  const csvHeaders = [
    "id",
    "marca_madre",
    "submarca",
    "canal",
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
        `"${p.canal}"`,
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
  console.log(`✅ ¡Proceso GEPSA completado en ${duration}s!`);
  console.log(`Productos guardados: ${dataset.length}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
}

run().catch(console.error);
