import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_OUTPUT = path.join(__dirname, "Tresko");

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
    } catch (e) {
      if (i === retries - 1) throw e;
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

// Catálogo maestro verificado con el Catálogo Oficial Tresko 2024 y WooCommerce
const TRESKO_PRODUCTS = [
  // 1. Acomer Naturals
  {
    id: "acomer-naturals-perro-adulto",
    marca_madre: "Tresko",
    submarca: "Acomer Naturals",
    categoria_calidad: "Super Premium",
    especie: "perro",
    etapa_vida: "adulto",
    nombre: "Acomer Naturals Alimento para Perro Adulto",
    formatos: ["9 kg", "22 kg"],
    descripcion:
      "Alimento SUPER PREMIUM para perro adulto Acomer Naturals. Formulado bajo el concepto de alimentos biológicamente adecuados, sin colorantes artificiales, con 26% de proteínas, ácidos grasos Omega 3 y 6, y envase aluminizado con cierre de velcro re-sellable (Zipper block) y válvula de frescura.",
    ingredientes:
      "Harina de carne - hueso/ave, maíz, trigo, harina de soya, harinilla de trigo, harinilla de arroz, aceite de ave-cerdo, cloruro de sodio, hidrolizado de hígado y vacuno, bentonita/zeolita, vitaminas, cloruro de colina, minerales, glutamato monosódico, sorbato de potasio, antifúngicos y antioxidantes autorizados, Omega 3 y Omega 6.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "26%",
      "Lípidos / Materia grasa (Mínimo)": "10%",
      "Fibra (Máximo)": "4%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Acomer-Naturals-22kg.png",
    url_origen: "https://tresko.cl/producto/alimento-acomer-naturals-super-premium-perro-adulto-22-kg/",
  },

  // 2. Acomer Adulto
  {
    id: "acomer-perro-adulto",
    marca_madre: "Tresko",
    submarca: "Acomer",
    categoria_calidad: "Premium",
    especie: "perro",
    etapa_vida: "adulto",
    nombre: "Acomer Perro Adulto Sabor Carne y Cereales",
    formatos: ["10 kg", "18 kg", "25 kg"],
    descripcion:
      "Alimento PREMIUM para perro adulto formulado bajo el concepto de alimentos biológicamente adecuados, diseñados en función de su adaptación evolutiva a la carne fresca y rica en proteínas. Aporta Omega 3 y 6 para piel sana y pelaje brillante.",
    ingredientes:
      "Harinas de carne y ave, trigo, maíz, arroz y soya, aceite de aves y/o grasa estabilizada de cerdo - vacuno, premix vitamínico y premix mineral, antioxidantes, ácidos grasos Omega 3 y Omega 6.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "22%",
      "Lípidos (Mínimo)": "12%",
      "Fibra (Máximo)": "5%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2025/06/Acomer-Adulto-2025-25kg.jpg",
    url_origen: "https://tresko.cl/producto/acomer-adulto-25kg/",
  },

  // 3. Acomer Cachorro
  {
    id: "acomer-perro-cachorro",
    marca_madre: "Tresko",
    submarca: "Acomer",
    categoria_calidad: "Premium",
    especie: "perro",
    etapa_vida: "cachorro",
    nombre: "Acomer Perro Cachorro Sabor Carne y Cereales",
    formatos: ["10 kg"],
    descripcion:
      "Alimento PREMIUM para cachorros que proporciona un óptimo desarrollo musculoesquelético con alta concentración proteica, calcio, fósforo y ácidos grasos esenciales para el crecimiento saludable.",
    ingredientes:
      "Harinas de carne y ave, trigo, maíz, arroz y soya, aceite de aves y/o grasa estabilizada de cerdo - vacuno, premix vitamínico y mineral, antioxidantes, ácidos grasos Omega 3.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "24%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "4,5%",
      "Humedad (Máximo)": "10%",
      "Calcio (Mínimo)": "2,5%",
      "Fósforo (Mínimo)": "1%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Acomer-Cachorros-10kg.png",
    url_origen: "https://tresko.cl/producto/acomer-cachorro-10kg/",
  },

  // 4. Acomer Razas Pequeñas
  {
    id: "acomer-perro-razas-pequenas",
    marca_madre: "Tresko",
    submarca: "Acomer",
    categoria_calidad: "Premium",
    especie: "perro",
    etapa_vida: "adulto",
    nombre: "Acomer Razas Pequeñas Sabor Carne",
    formatos: ["10 kg"],
    descripcion:
      "Alimento PREMIUM especialmente formulado con croqueta de tamaño adaptado a mandíbulas pequeñas, alta palatabilidad, zeolita para heces firmes y aceite de origen marino desodorizado (Omega 3).",
    ingredientes:
      "Maíz, harinilla de cereales (trigo, arroz), trigo, harina de carne y hueso (bovino, porcino) y/o ave, subproductos de leguminosas, aceite de aves y/o grasa estabilizada cerdo - vacuno, hidrolizado de hígados de aves y/o cerdo y/o vacuno, cloruro de sodio, zeolita, cloruro de colina, sorbato de potasio, antifúngicos y colorantes autorizados, antioxidantes (BHA/BHT), realzante del sabor autorizado, aceite de origen marino estabilizado y desodorizado (Omega 3).",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "21%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "4%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Acomer-Razas-Pequenas-10kg.png",
    url_origen: "https://tresko.cl/producto/acomer-razas-pequenas-10kg/",
  },

  // 5. Acomer Gatos
  {
    id: "acomer-gatos",
    marca_madre: "Tresko",
    submarca: "Acomer",
    categoria_calidad: "Premium",
    especie: "gato",
    etapa_vida: "adulto",
    nombre: "Acomer Gatos Alimento Premium",
    formatos: ["10 kg"],
    descripcion:
      "Alimento PREMIUM para gatos adultos con 30% de proteína de alto valor biológico, taurina para salud cardíaca y visual, desodorizante natural y enriquecido con vitaminas y minerales esenciales.",
    ingredientes:
      "Harinas de carne - ave y/o pescado, trigo, maíz, arroz y soya, aceite de aves y/o grasa estabilizada de cerdo - vacuno, desodorizante natural, hidrolizados de hígado vacuno y/o pollo, cloruro de sodio, premix vitamínico y mineral, colorantes autorizados, antifúngico, antioxidantes y ácidos grasos Omega 3 y 6. Minerales: Calcio, Zinc, Cobre, Yodo, Cobalto, Selenio, Potasio. Vitaminas: Colina, Taurina, Vitamina C, Niacina, Biotina, B2, B6, K3, E, D3, A.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "30%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "2%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Acomer-Gatos-10kg.png",
    url_origen: "https://tresko.cl/producto/acomer-gatos/",
  },

  // 6. Guardián Perro Adulto
  {
    id: "guardian-perro-adulto",
    marca_madre: "Tresko",
    submarca: "Guardián",
    categoria_calidad: "Premium",
    especie: "perro",
    etapa_vida: "adulto",
    nombre: "Guardián Perro Adulto Sabor Carne",
    formatos: ["9 kg", "16 kg", "22 kg"],
    descripcion:
      "Alimento PREMIUM para perro adulto Guardián. Formulado bajo el concepto de alimentos biológicamente adecuados, multipartículas para todo tamaño de perro, salud bucal, piel sana, pelaje brillante, heces más firmes y aporte de Omega 3 y 6.",
    ingredientes:
      "Maíz, trigo, harina de carne-hueso vacuno/ave, harinilla de trigo, harinilla de arroz, aceite de cerdo-ave, harina de soya, hidrolizado de hígado y vacuno, cloruro de sodio, bentonita/zeolita, vitaminas, cloruro de colina, minerales, sorbato de potasio, antifúngicos y antioxidantes autorizados, Omega 3 y 6.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "20%",
      "Lípidos (Mínimo)": "14%",
      "Fibra (Máximo)": "4,5%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Guardian-Adulto-22kg.png",
    url_origen: "https://tresko.cl/producto/alimento-guardian-adulto-22kg/",
  },

  // 7. Guardián Perro Cachorro
  {
    id: "guardian-perro-cachorro",
    marca_madre: "Tresko",
    submarca: "Guardián",
    categoria_calidad: "Premium",
    especie: "perro",
    etapa_vida: "cachorro",
    nombre: "Guardián Perro Cachorro Sabor Carne",
    formatos: ["9 kg", "16 kg"],
    descripcion:
      "Alimento PREMIUM para cachorros Guardián con 24% de proteínas, fórmula completa y balanceada para el crecimiento óseo y muscular, defensas activas y digestión saludable.",
    ingredientes:
      "Maíz, trigo, harina de carne-hueso vacuno/ave, trigo, harinilla de arroz, harinilla de trigo, harina de soya, aceite de cerdo-ave, hidrolizado de hígado y vacuno, cloruro de sodio, bentonita/zeolita, vitaminas, cloruro de colina, minerales, sorbato de potasio, antifúngicos y antioxidantes autorizados, Omega 3 y 6.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "24%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "3,5%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Guardian-Cachorro-16kg.png",
    url_origen: "https://tresko.cl/producto/alimento-guardian-cachorro-16kg/",
  },

  // 8. Ekos Cat
  {
    id: "ekos-cat",
    marca_madre: "Tresko",
    submarca: "Ekos",
    categoria_calidad: "Standard / Premium",
    especie: "gato",
    etapa_vida: "adulto",
    nombre: "Ekos Cat Alimento para Gato Adulto Sabor Carne",
    formatos: ["9 kg", "10 kg", "16 kg"],
    descripcion:
      "Alimento para gato formulado especialmente para fortalecer la piel y el pelaje desde el interior, con proteínas de alto valor biológico (26%), ácidos grasos Omega 3 y 6, y probióticos para una buena función intestinal.",
    ingredientes:
      "Harina de carne, maíz, trigo, harinilla de arroz, harina de soya, harinilla de trigo, aceite de cerdo-ave, hidrolizado de hígado y vacuno, cloruro de sodio, bentonita/zeolita, vitaminas, cloruro de colina, minerales, taurina, sorbato de potasio, antifúngicos, antioxidantes y colorantes autorizados, Omega 3 y 6.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "26%",
      "Lípidos (Mínimo)": "12%",
      "Fibra (Máximo)": "4,5%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2026/06/1.png",
    url_origen: "https://tresko.cl/producto/alimento-ekos-cat-10kg/",
  },

  // 9. Trígono Gatos
  {
    id: "trigono-gatos",
    marca_madre: "Tresko",
    submarca: "Trígono",
    categoria_calidad: "Standard",
    especie: "gato",
    etapa_vida: "adulto",
    nombre: "Trígono Gatos Alimento Sabor Carne",
    formatos: ["10 kg"],
    descripcion:
      "Alimento completo y balanceado para gatos adultos, sabor carne, con 24% de proteína bruta, taurina, ácidos grasos Omega 3 y premix vitamínico-mineral completo.",
    ingredientes:
      "Harinas de carne y ave, trigo, maíz, arroz y soya, aceite de ave y/o grasa estabilizada de cerdo - vacuno, premix vitamínico y premix mineral, desodorizante natural, antioxidantes, colorantes autorizados, ácido graso Omega 3.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "24%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "4,5%",
      "Humedad (Máximo)": "10%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Trigono-Gatos-10kg.png",
    url_origen: "https://tresko.cl/producto/trigono-gatos-10kg/",
  },

  // 10. Trígono Cachorros
  {
    id: "trigono-cachorros",
    marca_madre: "Tresko",
    submarca: "Trígono",
    categoria_calidad: "Standard",
    especie: "perro",
    etapa_vida: "cachorro",
    nombre: "Trígono Cachorros Alimento Sabor Carne",
    formatos: ["10 kg"],
    descripcion:
      "Alimento completo para cachorros diseñado para satisfacer las demandas nutricionales y energéticas de la etapa temprana de crecimiento con 22% de proteínas y calcio/fósforo balanceado.",
    ingredientes:
      "Maíz, trigo, harinas de carne y ave, arroz y soya, aceites de ave y/o grasa estabilizada de cerdo-vacuno, premix vitamínico y mineral, antioxidante, ácido Omega 3.",
    analisis_garantizado: {
      "Proteínas (Mínimo)": "22%",
      "Lípidos (Mínimo)": "8%",
      "Fibra (Máximo)": "4,5%",
      "Humedad (Máximo)": "10%",
      "Calcio (Mínimo)": "2,5%",
      "Fósforo (Mínimo)": "1%",
    },
    url_imagen_original: "https://tresko.cl/wp-content/uploads/2024/09/Trigono-Cachorro-10kg.png",
    url_origen: "https://tresko.cl/producto/trigono-cachorro-10kg/",
  },
];

async function run() {
  console.log("=== PROCESANDO DATASET TRESKO CHILE ===");
  ensureDir(BASE_OUTPUT);

  const dataset = [];

  for (const prod of TRESKO_PRODUCTS) {
    const especieFolder = `${prod.especie}s`;
    const brandFolder = slugify(prod.submarca);
    const prodSlug = slugify(prod.nombre);

    const targetDir = path.join(BASE_OUTPUT, especieFolder, brandFolder);
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
      marca_madre: prod.marca_madre,
      submarca: prod.submarca,
      categoria_calidad: prod.categoria_calidad,
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
    console.log(`✓ ${prod.submarca} - ${prod.nombre} (${prod.formatos.join(", ")})`);
  }

  // Guardar JSON
  const jsonPath = path.join(BASE_OUTPUT, "dataset.json");
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), "utf-8");

  // Guardar CSV
  const csvHeaders = [
    "id",
    "marca_madre",
    "submarca",
    "categoria_calidad",
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
        `"${p.categoria_calidad}"`,
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

  console.log(`\n✅ ¡Dataset de Tresko completado exitosamente!`);
  console.log(`Total productos consolidados: ${dataset.length}`);
  console.log(`Archivo JSON: ${jsonPath}`);
  console.log(`Archivo CSV: ${csvPath}`);
}

run().catch(console.error);
