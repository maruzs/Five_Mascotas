// server/rayo.mjs
// Motor IA & Asistente Nutricional "Rayo · Experto Nutricional" para FIVE Mascotas
// Integración con Google Gemini (gemini-2.0-flash), RAG sobre PIM, porciones, antiparasitarios y fallback determinista.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

// In-memory rate limiting store (IP -> { countMinute, lastMinuteTs, countHour, lastHourTs })
const rateLimitMap = new Map();

const RATE_LIMIT_MINUTE = 15; // max 15 requests per minute per IP
const RATE_LIMIT_HOUR = 50;   // max 50 requests per hour per IP

/**
 * Verifica el límite de tasa por IP.
 * Retorna { allowed: boolean, retryAfterSeconds: number }
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const cleanIp = ip || 'unknown-client';
  let record = rateLimitMap.get(cleanIp);

  if (!record) {
    record = {
      countMinute: 1,
      lastMinuteTs: now,
      countHour: 1,
      lastHourTs: now,
    };
    rateLimitMap.set(cleanIp, record);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Reset 1 minute window
  if (now - record.lastMinuteTs > 60 * 1000) {
    record.countMinute = 1;
    record.lastMinuteTs = now;
  } else {
    record.countMinute += 1;
  }

  // Reset 1 hour window
  if (now - record.lastHourTs > 60 * 60 * 1000) {
    record.countHour = 1;
    record.lastHourTs = now;
  } else {
    record.countHour += 1;
  }

  if (record.countMinute > RATE_LIMIT_MINUTE) {
    const retryAfter = Math.ceil((60 * 1000 - (now - record.lastMinuteTs)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  if (record.countHour > RATE_LIMIT_HOUR) {
    const retryAfter = Math.ceil((60 * 60 * 1000 - (now - record.lastHourTs)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Lee productos del PIM
 */
async function loadPimProducts(pimFilePath) {
  try {
    if (fs.existsSync(pimFilePath)) {
      const raw = await fsp.readFile(pimFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products)) return parsed.products;
    }
  } catch (err) {
    console.warn('[Rayo] Error al cargar PIM:', err.message);
  }
  return [];
}

/**
 * Extrae ficha técnica nutricional de un producto
 */
function extractProductNutrition(p) {
  const isCat = (p.pet || '').toLowerCase().includes('gato') || (p.name || '').toLowerCase().includes('gato') || (p.name || '').toLowerCase().includes('kitten');
  const pet = isCat ? 'Gatos' : 'Perros';
  const name = p.name || 'Alimento';
  const brand = p.brand || 'Marca';
  const format = p.format || '15 kg';
  const price = p.price || 0;
  const formatKg = parseFloat(format) || 10;
  const pricePerKg = formatKg > 0 ? Math.round(price / formatKg) : price;

  return {
    id: p.id,
    name,
    brand,
    pet,
    lifeStage: p.lifeStage || (name.toLowerCase().includes('cachorro') || name.toLowerCase().includes('kitten') ? 'Cachorro' : 'Adulto'),
    format,
    price,
    pricePerKg,
    proteinPct: p.proteinPct !== undefined ? p.proteinPct : (isCat ? 30 : 25),
    fatPct: p.fatPct !== undefined ? p.fatPct : (isCat ? 12 : 12),
    fiberPct: p.fiberPct !== undefined ? p.fiberPct : 4,
    moisturePct: p.moisturePct !== undefined ? p.moisturePct : 10,
    ingredients: p.ingredients || 'Información de ingredientes en proceso de homologación por el fabricante.',
    originUrl: p.originUrl || '',
  };
}

/**
 * Calcula requerimiento energético y porciones diarias según especie, peso y etapa de vida
 */
export function calculatePortion({ species = 'perro', weightKg = 10, lifeStage = 'adulto', activityLevel = 'normal', foodKcalKg = null }) {
  const w = Math.max(0.5, Math.min(100, Number(weightKg) || 10));
  const isCat = species.toLowerCase() === 'gato' || species.toLowerCase() === 'felino';
  const stage = (lifeStage || 'adulto').toLowerCase();
  const act = (activityLevel || 'normal').toLowerCase();

  // RER = 70 * (BW^0.75)
  const rer = Math.round(70 * Math.pow(w, 0.75));

  let factor = 1.6;
  let mealsPerDay = 2;

  if (isCat) {
    if (stage.includes('cachorro') || stage.includes('gatito') || stage.includes('kitten')) {
      factor = 2.5;
      mealsPerDay = 3;
    } else if (stage.includes('senior')) {
      factor = 1.2;
      mealsPerDay = 2;
    } else if (act.includes('baja') || act.includes('sedentario') || stage.includes('castrado') || stage.includes('esterilizado')) {
      factor = 1.2;
      mealsPerDay = 2;
    } else {
      factor = 1.4;
      mealsPerDay = 2;
    }
  } else {
    // Perro
    if (stage.includes('cachorro') || stage.includes('puppy')) {
      factor = w < 5 ? 2.5 : 2.0;
      mealsPerDay = 3;
    } else if (stage.includes('senior')) {
      factor = 1.3;
      mealsPerDay = 2;
    } else if (act.includes('alta') || act.includes('activo')) {
      factor = 2.2;
      mealsPerDay = 2;
    } else if (act.includes('baja') || stage.includes('esterilizado') || stage.includes('castrado')) {
      factor = 1.4;
      mealsPerDay = 2;
    } else {
      factor = 1.7;
      mealsPerDay = 2;
    }
  }

  const dailyCalories = Math.round(rer * factor);
  const kcalDensity = foodKcalKg ? Number(foodKcalKg) : (isCat ? 3900 : 3650);
  const totalDailyGrams = Math.round((dailyCalories / kcalDensity) * 1000);
  const gramsPerMeal = Math.round(totalDailyGrams / mealsPerDay);

  return {
    species: isCat ? 'Gato' : 'Perro',
    weightKg: w,
    rer,
    merFactor: factor,
    dailyCalories,
    kcalDensity,
    totalDailyGrams,
    mealsPerDay,
    gramsPerMeal,
  };
}

/**
 * Busca pastillas y soluciones antiparasitarias en el PIM basadas en especie y peso
 */
export function findAntiparasitics(products, { species = 'perro', weightKg = 10 }) {
  const isCat = species.toLowerCase().includes('gato') || species.toLowerCase().includes('felino');
  const targetPet = isCat ? 'Gatos' : 'Perros';
  const w = Number(weightKg) || 10;

  const farmaProducts = products.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const subcat = (p.subcategory || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const petMatch = isCat
      ? (p.pet === 'Gatos' || name.includes('gato') || name.includes('cat') || name.includes('combo gato'))
      : (p.pet === 'Perros' || name.includes('perro') || (!name.includes('gato') && !name.includes('combo gato')));

    const isFarma = cat.includes('farma') || subcat.includes('farma') ||
      name.includes('nexgard') || name.includes('simparica') || name.includes('bravecto') ||
      name.includes('credelio') || name.includes('revolution') || name.includes('frontline') ||
      name.includes('drontal') || name.includes('flovovermic') || name.includes('mevermic') ||
      name.includes('advocate') || name.includes('advantage') || name.includes('seresto');

    return isFarma && petMatch;
  });

  // Ranking y extracción de rangos de peso del nombre
  const parseRange = (name) => {
    const clean = name.toLowerCase().replace(/,/g, '.');
    const match = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|a|–)\s*(\d+(?:\.\d+)?)\s*kg/);
    if (match) {
      return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
    }
    const singleMatch = clean.match(/(\d+(?:\.\d+)?)\s*kg/);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1]);
      return { min: val * 0.7, max: val * 1.3 };
    }
    return null;
  };

  const matches = [];
  for (const p of farmaProducts) {
    const range = parseRange(p.name);
    let score = 0;
    let inRange = false;

    if (range) {
      if (w >= range.min && w <= range.max) {
        inRange = true;
        score = 100 - Math.abs(w - (range.min + range.max) / 2);
      } else {
        const diff = Math.min(Math.abs(w - range.min), Math.abs(w - range.max));
        score = Math.max(0, 50 - diff * 2);
      }
    } else {
      score = 20; // Producto general o spray
    }

    matches.push({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.image || '',
      weightRange: range ? `${range.min} a ${range.max} kg` : 'Dosis según prospecto',
      inRange,
      score,
    });
  }

  matches.sort((a, b) => b.score - a.score);

  // Seleccionar hasta las 5 mejores opciones exactas
  const topMatches = matches.filter((m) => m.inRange).slice(0, 5);
  return topMatches.length > 0 ? topMatches : matches.slice(0, 5);
}

/**
 * Fallback Algorítmico Determinista de Rayo (en caso de no tener API key o fallo de cuota)
 */
function buildDeterministicResponse({ query, mode, productsToCompare, portionData, antiparasitics, petProfile }) {
  const greeting = `**Rayo · Experto Nutricional** (FIVE Mascotas)\n*Asesoría técnica y objetiva para perros y gatos*\n\n`;

  if (mode === 'comparison' && productsToCompare && productsToCompare.length >= 2) {
    let resp = greeting;
    resp += `### Veredicto Nutricional Técnico\n\n`;
    resp += `He analizado al detalle las fichas oficiales del catálogo PIM para:\n`;
    productsToCompare.forEach((p) => {
      resp += `- **${p.brand} ${p.name}** (${p.pet} · ${p.lifeStage} · ${p.proteinPct}% Prot. · $${p.pricePerKg.toLocaleString('es-CL')}/kg)\n`;
    });
    resp += `\n---\n\n`;

    // Comparativa de proteína
    const sortedProt = [...productsToCompare].sort((a, b) => b.proteinPct - a.proteinPct);
    const bestProt = sortedProt[0];

    // Comparativa de precio x kilo
    const sortedPrice = [...productsToCompare].sort((a, b) => a.pricePerKg - b.pricePerKg);
    const bestPrice = sortedPrice[0];

    resp += `#### 1. Calidad y Aporte Proteico\n`;
    resp += `- **Líder en proteína bruta:** **${bestProt.brand} ${bestProt.name}** con un **${bestProt.proteinPct}%**. `;
    if (bestProt.pet === 'Gatos') {
      resp += `En gatos (carnívoros estrictos), una mayor concentración de proteína animal garantiza taurina esencial y preservación muscular sin sobrecarga de carbohidratos.\n`;
    } else {
      resp += `Para perros, este nivel optimiza la masa magra y la digestibilidad celular.\n`;
    }

    resp += `\n#### 2. Análisis de Ingredientes y Cereales\n`;
    productsToCompare.forEach((p) => {
      const ing = (p.ingredients || '').toLowerCase();
      const firstIng = (p.ingredients || '').split(',')[0] || 'Ingredientes no especificados';
      const isGrainFree = !ing.includes('maíz') && !ing.includes('trigo') && !ing.includes('gluten de maíz');
      resp += `- **${p.brand}**: Primer ingrediente declarado: *${firstIng.trim()}*. `;
      if (isGrainFree) {
        resp += `**Fórmula sin cereales tradicionales**, ideal para digestión sensible o prevención de alergias.\n`;
      } else {
        resp += `Contiene cereales (maíz/trigo/arroz) como fuente de carbohidratos energéticos.\n`;
      }
    });

    resp += `\n#### 3. Rendimiento y Relación Precio / Calidad\n`;
    resp += `- **Opción más conveniente por kilo:** **${bestPrice.brand} ${bestPrice.name}** a **$${bestPrice.pricePerKg.toLocaleString('es-CL')}/kg**.\n`;
    resp += `- **Conclusión:** Si buscas el máximo rigor nutricional e ingredientes nobles, **${bestProt.brand}** toma la delantera. Si priorizas rendimiento económico diario con estándar balanceado, **${bestPrice.brand}** ofrece un costo por ración altamente competitivo.\n`;

    return resp;
  }

  if (mode === 'antiparasitic' || (antiparasitics && antiparasitics.length > 0 && !portionData && mode !== 'portion')) {
    let resp = greeting;
    const petLabel = petProfile?.species || 'Mascota';
    const weightLabel = petProfile?.weightKg ? `${petProfile.weightKg} kg` : 'peso indicado';
    resp += `### Antiparasitarios Indicados en FIVE para ${petLabel} (${weightLabel})\n\n`;
    resp += `Según el rango de peso oficial de nuestro catálogo de farmacia, las opciones indicadas son:\n\n`;
    if (antiparasitics && antiparasitics.length > 0) {
      antiparasitics.forEach((m) => {
        resp += `- **${m.name}** (${m.brand}) — **$${m.price.toLocaleString('es-CL')}**\n`;
        resp += `  *Rango indicado:* ${m.weightRange}\n`;
      });
    } else {
      resp += `Actualmente contamos con antiparasitarios como Nexgard, Simparica, Bravecto y Credelio para diversos rangos de peso en nuestro catálogo.\n`;
    }
    resp += `\n**Aviso Veterinario Obligatorio:**\n`;
    resp += `*Los antiparasitarios internos y externos deben administrarse según el peso corporal exacto y la edad mínima del prospecto (generalmente desde las 8 semanas). Si tu mascota tiene antecedentes médicos particulares o está en gestación, consulta previamente con tu médico veterinario.*`;
    return resp;
  }

  if (portionData) {
    const p = portionData;
    let resp = greeting;
    resp += `### Cálculo de Ración Diaria Recomendada\n\n`;
    resp += `Para un **${p.species}** de **${p.weightKg} kg**:\n\n`;
    resp += `- **Requerimiento Energético en Reposo (RER):** ${p.rer} kcal/día\n`;
    resp += `- **Energía Diaria Total (MER estimado):** **${p.dailyCalories} kcal/día**\n`;
    resp += `- **Porción Diaria Total Sugerida:** **${p.totalDailyGrams} gramos al día** (densidad aprox. ${p.kcalDensity} kcal/kg)\n`;
    resp += `- **Distribución:** **${p.gramsPerMeal} gramos** por ración, repartidos en **${p.mealsPerDay} tomas al día**.\n\n`;
    resp += `*Recomendación de precisión:* Pesa el alimento con balanza de cocina las primeras dos semanas para asegurar una dosificación exacta.`;
    return resp;
  }

  // Consulta general
  let resp = greeting;
  resp += `He recibido tu consulta sobre nutrición y bienestar para tu mascota.\n\n`;
  resp += `En **FIVE Mascotas**, evaluamos los alimentos bajo criterios técnicos rigurosos:\n`;
  resp += `1. **Primer ingrediente de origen animal:** Proteína real (pollo, salmón, cordero) por encima de subproductos o harinas de cereales.\n`;
  resp += `2. **Especie adecuada:** Los gatos son carnívoros estrictos que no sintetizan taurina por sí mismos; los perros son omnívoros adaptados con necesidades calóricas según peso y actividad.\n`;
  resp += `3. **Transparencia en etiqueta:** Declaración clara del porcentaje de proteína bruta, grasa y cenizas.\n`;
  resp += `4. **Costo por kilo real:** Comparar el saco según duración y rendimiento diario, no solo el precio facial.\n\n`;
  resp += `¿Deseas que comparemos dos fórmulas, calculemos la porción exacta de tu mascota o busquemos antiparasitarios para su peso?`;
  return resp;
}

/**
 * Función Principal: Atiende una consulta a Rayo usando Gemini 2.0 Flash o Fallback
 */
export async function handleRayoNutritionalChat({
  query = '',
  mode = 'chat', // 'chat' | 'comparison' | 'portion' | 'antiparasitic'
  productIds = [],
  petProfile = null, // { species, weightKg, lifeStage, activityLevel, breed }
  dataDir,
}) {
  const pimFilePath = path.join(dataDir, 'pim.json');
  const allProducts = await loadPimProducts(pimFilePath);

  // 1. Contexto de comparación si aplica
  let productsToCompare = [];
  if (Array.isArray(productIds) && productIds.length > 0) {
    productsToCompare = productIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map(extractProductNutrition);
  }

  // 2. Cálculo de porción si aplica
  let portionData = null;
  if (mode === 'portion' || (petProfile && petProfile.weightKg)) {
    portionData = calculatePortion({
      species: petProfile?.species || 'perro',
      weightKg: petProfile?.weightKg || 10,
      lifeStage: petProfile?.lifeStage || 'adulto',
      activityLevel: petProfile?.activityLevel || 'normal',
    });
  }

  // 3. Antiparasitarios si aplica
  let antiparasitics = [];
  if (mode === 'antiparasitic' || (query && (query.toLowerCase().includes('pastilla') || query.toLowerCase().includes('antiparasit') || query.toLowerCase().includes('pulga') || query.toLowerCase().includes('garrapata')))) {
    antiparasitics = findAntiparasitics(allProducts, {
      species: petProfile?.species || (query.toLowerCase().includes('gato') ? 'gato' : 'perro'),
      weightKg: petProfile?.weightKg || 10,
    });
  }

  // 4. Verificar API KEY de Gemini
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // Si no hay API Key disponible en el entorno, usar fallback determinista
  if (!apiKey) {
    const fallbackAnswer = buildDeterministicResponse({
      query,
      mode,
      productsToCompare,
      portionData,
      antiparasitics,
      petProfile,
    });
    return {
      ok: true,
      provider: 'rayo-deterministic-engine',
      answer: fallbackAnswer,
      portionData,
      antiparasitics,
    };
  }

  // 5. Preparar System Prompt y XML Context para Gemini
  const systemInstruction = `
Eres "Rayo · Experto Nutricional", la mascota oficial y asesor veterinario de FIVE Mascotas (un gato tuxedo distinguido, empático, directo y científicamente riguroso).
Tu misión es asesorar a tutores de mascotas con total objetividad y transparencia sobre nutrición y salud preventiva para PERROS y GATOS.

REGLAS INNEGOCIABLES DE SEGURIDAD, ESTILO Y ÉTICA:
1. ESTÁ TERMINANTEMENTE PROHIBIDO EL USO DE EMOJIS O ÍCONOS PICTOGRÁFICOS EN TODAS TUS RESPUESTAS. Mantén una redacción limpia, sobria, elegante y profesional.
2. NUNCA respondas temas ajenos a perros, gatos, nutrición animal o bienestar de mascotas (cero código, política o temas fuera de lugar).
3. NUNCA inventes descuentos, cupones, regalos ni modifiques los precios oficiales del catálogo de FIVE Mascotas.
4. Si hablas de antiparasitarios o medicamentos, incluye SIEMPRE el aviso veterinario obligatorio: el tutor debe pesar a su mascota antes de administrar y consultar al veterinario ante cualquier condición médica previa.
5. Basa tus veredictos en la ciencia nutricional veterinaria:
   - Gatos: Carnívoros estrictos. Requieren alta proteína de origen animal, taurina, grasas de calidad y control de cenizas/fósforo.
   - Perros: Carnívoros facultativos / omnívoros adaptados. Se evalúa primer ingrediente (carne/harina de carne sobre maíz/soja), fuentes de carbohidratos, balance de fibra y ácidos grasos Omega 3/6.
6. Formato: Escribe en Markdown pulido, con subtítulos concisos, viñetas limpias y un tono cálido de tutor experto a tutor responsable, SIN emojis.
`.trim();

  // Formatear contexto estructurado XML
  let xmlContext = '<pim_catalog_context>\n';

  if (productsToCompare.length > 0) {
    xmlContext += '  <products_to_compare>\n';
    productsToCompare.forEach((p) => {
      xmlContext += `    <product id="${p.id}" brand="${p.brand}" name="${p.name}" pet="${p.pet}" stage="${p.lifeStage}" price="${p.price}" price_per_kg="${p.pricePerKg}">
      <protein>${p.proteinPct}%</protein>
      <fat>${p.fatPct}%</fat>
      <fiber>${p.fiberPct}%</fiber>
      <moisture>${p.moisturePct}%</moisture>
      <ingredients>${p.ingredients}</ingredients>
    </product>\n`;
    });
    xmlContext += '  </products_to_compare>\n';
  }

  if (portionData) {
    xmlContext += `  <portion_calculation>
    <species>${portionData.species}</species>
    <weight_kg>${portionData.weightKg}</weight_kg>
    <rer_kcal>${portionData.rer}</rer_kcal>
    <daily_mer_kcal>${portionData.dailyCalories}</daily_mer_kcal>
    <daily_grams>${portionData.totalDailyGrams}</daily_grams>
    <meals_per_day>${portionData.mealsPerDay}</meals_per_day>
    <grams_per_meal>${portionData.gramsPerMeal}</grams_per_meal>
  </portion_calculation>\n`;
  }

  if (antiparasitics.length > 0) {
    xmlContext += '  <available_antiparasitics_in_store>\n';
    antiparasitics.forEach((a) => {
      xmlContext += `    <item id="${a.id}" name="${a.name}" brand="${a.brand}" price="${a.price}" indicated_range="${a.weightRange}" />\n`;
    });
    xmlContext += '  </available_antiparasitics_in_store>\n';
  }

  xmlContext += '</pim_catalog_context>';

  const userPrompt = `
${xmlContext}

<user_inquiry>
Modo: ${mode}
Consulta: ${query || 'Solicitud de veredicto o asesoría nutricional'}
${petProfile ? `Perfil Mascota: Especie=${petProfile.species || 'N/A'}, Peso=${petProfile.weightKg || 'N/A'}kg, Etapa=${petProfile.lifeStage || 'N/A'}, Actividad=${petProfile.activityLevel || 'N/A'}, Raza=${petProfile.breed || 'N/A'}` : ''}
</user_inquiry>

Responde como Rayo, analizando objetivamente los datos anteriores. Sé claro, profesional y estructurado.
`.trim();

  // 6. Invocar Gemini REST API con failover automático entre modelos
  const candidateModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 900,
        },
      };

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          return {
            ok: true,
            provider: model,
            answer: candidateText,
            portionData,
            antiparasitics,
          };
        }
      } else {
        const errText = await res.text();
        console.warn(`[Rayo] Modelo ${model} error (${res.status}), intentando siguiente:`, errText.slice(0, 150));
      }
    } catch (err) {
      console.warn(`[Rayo] Error de conexión con ${model}:`, err.message);
    }
  }

  // Fallback final determinista si todos los modelos de Gemini están saturados
  const fallbackAnswer = buildDeterministicResponse({
    query,
    mode,
    productsToCompare,
    portionData,
    antiparasitics,
    petProfile,
  });
  return {
    ok: true,
    provider: 'rayo-deterministic-engine-fallback',
    answer: fallbackAnswer,
    portionData,
    antiparasitics,
  };
}
