# 📋 Reporte de Alimentos Faltantes en FIVE Mascotas
> **Auditoría de Cobertura de Datos:** Cruce entre el inventario activo de FIVE Mascotas y los datasets de `Imagenes_Alimentos/`.

---

## 📊 1. Resumen de Cobertura

- **Total de productos en FIVE Mascotas:** 490
- **Total de alimentos para mascotas:** 285 productos
- **Fórmulas nutricionales únicas en FIVE:** 222 fórmulas
- **Fórmulas con datos 100% completos (Imagen + Ingredientes + Nutrientes):** **156 fórmulas (70.3%)**
- **Fórmulas con algún dato pendiente:** **66 fórmulas (29.7%)**
  - *Sin Imagen Oficial:* 24 fórmulas
  - *Sin Lista de Ingredientes:* 55 fórmulas
  - *Sin Tabla de Análisis Garantizado:* 44 fórmulas

---

## 🎯 2. Marcas Prioritarias Solicitadas

| Marca | Producto en FIVE | Formatos | ¿Tiene Imagen? | ¿Tiene Ingredientes? | ¿Tiene Tabla Nutrientes? | Diagnóstico / Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Pedigree** | Pedigree Adulto | 21 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Pedigree** | Pedigree Senior | 21 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Pedigree** | Pedigree Razas Pequeñas | 21 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Pedigree** | Pedigree Cachorro | 21 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Whiskas** | Whiskas Adulto Pescado | 10 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Whiskas** | Whiskas Adulto Carne | 10 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Whiskas** | Whiskas Gatito | 10 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Top One** | Top One Adulto | 9 kg, 18 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Top One** | Top One Raza Pequeña | 9 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Top One** | Top One Cachorro | 9 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Top One** | Top One Gato | 9 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Sabrokan** | Sabrokan Perro | 25 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Sabrocat** | Sabrocat Gato | 8 kg, 20 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Canito** | Canito Perro Adulto | 25 kg | ✅ Sí (Allendes) | ✅ Sí | ❌ **Falta** | Falta Proteína %, Grasa %, Fibra, Humedad |
| **Guau Forte** | Guau Forte Perro | 25 kg | ✅ Sí (Allendes) | ❌ **Falta** | ❌ **Falta** | Solo se obtuvo packshot oficial |
| **Juvenia** | Suplemento Nutricional | — | ❌ **Falta** | ❌ **Falta** | ❌ **Falta** | Es suplemento/nutracéutico (no alimento seco) |

---

## 🏭 3. Marcas de Gepsa (Tienen Nutrientes, pero Falta Texto de Ingredientes)

En Gepsa **todos los productos tienen la tabla nutricional completa** (Proteína, Grasa, Fibra, Humedad), pero el fabricante no publicó la lista de ingredientes textual en su web:

| Marca | Producto en FIVE | Formatos | ¿Tiene Imagen? | ¿Tiene Tabla Nutrientes? | ¿Tiene Ingredientes? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Amici** | Amici Adulto Mix | 22 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Amici** | Amici Adulto Carne | 20 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Amici** | Amici Cachorro | 22 kg | ✅ Sí | ✅ Sí (22% Prot) | ❌ **Falta texto** |
| **Amici** | Amici Gato Mix | 10 kg, 15 kg | ✅ Sí | ✅ Sí (26% Prot) | ❌ **Falta texto** |
| **Amici** | Amici Gato Pescado | 10 kg, 15 kg | ❌ **Falta** | ❌ **Falta** | ❌ **Falta** |
| **Compinche** | Compinches Perro Adulto | 25 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Compinche** | Compinches Gato Adulto | 20 kg | ✅ Sí | ✅ Sí (26% Prot) | ❌ **Falta texto** |
| **Ganacan** | Ganacan Cachorro | 22 kg | ✅ Sí | ✅ Sí (22% Prot) | ❌ **Falta texto** |
| **Ganacan** | Ganacan Adulto Carne | 22 kg | ✅ Sí | ❌ **Falta** | ❌ **Falta texto** |
| **Ganacan** | Ganacan Adulto Mix | 25 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Ganacat** | Ganacat Pescado | 10 kg | ✅ Sí | ✅ Sí (26% Prot) | ❌ **Falta texto** |
| **Ganacat** | Ganacat Mix | 10 kg | ✅ Sí | ✅ Sí (26% Prot) | ❌ **Falta texto** |
| **Magnífico** | Magnifico Perro | 10 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Odwalla** | Odwalla Adulto | 15 kg, 25 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |
| **Odwalla** | Odwalla Cachorro | 15 kg, 25 kg | ✅ Sí | ✅ Sí (22% Prot) | ❌ **Falta texto** |
| **Zimpi** | Zimpi Perro Adulto | 25 kg | ✅ Sí | ✅ Sí (18% Prot) | ❌ **Falta texto** |

---

## 📦 4. Otras Marcas del Catálogo de FIVE con Faltantes

| Marca | Producto en FIVE | Formatos | Falta Detectada | Causa / Detalle |
| :--- | :--- | :---: | :---: | :--- |
| **Cachupín** | Cachupín Adulto | 25 kg | Ingredientes, Nutrientes | En PROA figura como *Biomaster* o *Cachupín Carne* |
| **Cachupín** | Cachupín Cachorro | 25 kg | Imagen, Ingredientes, Nutrientes | Requiere mapeo con la ficha de PROA Cachupín Cachorro |
| **Mastín** | Mastín Senior | 20 kg | Imagen, Ingredientes, Nutrientes | Línea económica no presente en web oficial |
| **Mastín** | Mastín Signature | 15 kg | Imagen, Ingredientes, Nutrientes | Línea Signature no presente en web oficial |
| **Mastín** | Mastín Raza Pequeña | 10 kg | Imagen, Ingredientes, Nutrientes | Línea Raza Pequeña no presente en web oficial |
| **Pionero** | Pionero Perro Adulto | 18 kg | Imagen, Ingredientes, Nutrientes | Alimento económico local |
| **Askat** | Askat Adulto | 20 kg | Imagen, Ingredientes, Nutrientes | Alimento económico local |
| **Gallina** | Ponedora / Broiler (4 tipos) | 25 kg | Imagen, Ingredientes, Nutrientes | Alimento de granja (no incluido en scrapers de mascotas) |
| **Kongo** | Kongo Gato Pescado | 1 kg, 8 kg, 15 kg | Imagen, Ingredientes, Nutrientes | En GrupoMOR está Kongo Perro, falta la ficha de Kongo Gato |
| **Voraz** | Voraz Cachorro | 10 kg | Imagen, Ingredientes, Nutrientes | En GrupoMOR está Voraz Adulto, falta la ficha de Voraz Cachorro |
| **Josera** | Josera Dailycat Adulto | 2 kg, 10 kg | Imagen, Ingredientes, Nutrientes | Falta la ficha de la variedad Dailycat (las demás de Josera están 100%) |
| **Josera** | Josera Miniwell | 10 kg | Imagen, Ingredientes, Nutrientes | Falta la variedad Miniwell |
| **Superpet** | Superpet Cachorro | 18 kg | Imagen, Ingredientes, Nutrientes | En Cooprinsem está Superpet Adulto, falta Cachorro |
| **Appetit** | Appetit Perro Adulto Premium | 20 kg | Imagen, Ingredientes, Nutrientes | En Appetit está la línea estándar, falta la variante Premium |
| **Felinnes** | Felinnes Adulto / Gatito | 20 kg | Tabla Nutrientes | Tiene imagen e ingredientes en Allendes, falta Proteína % |
| **Bokato** | Bokato Adulto Tradicional | 20 kg | Imagen, Ingredientes, Nutrientes | En Bokato está la línea Gold; falta la línea Tradicional |
| **Bokato** | Bokato Pettit | 10 kg | Imagen, Ingredientes, Nutrientes | Falta la línea Pettit |
| **Bokato** | Bokato Lady | 10 kg | Ingredientes | Tiene imagen y tabla (27% Prot), falta texto de ingredientes |
| **N&D** | Espirulina Gato Tilapia | 1,5 kg, 7 kg | Imagen, Ingredientes, Nutrientes | Variedad funcional nueva de Farmina |
| **N&D** | N&D Gato Jabalí y Manzana Lata | 0,42 kg | Imagen, Ingredientes, Nutrientes | Formato húmedo en lata (en Farmina se priorizó alimento seco) |
| **Purina** | Cat Chow Adulto Carne | Varios | Ingredientes | En el scraper Purina capturó "Guía de alimentación" en vez de ingredientes |
| **Purina** | Pro Plan Cat Adult / LiveClear | 3 kg | Ingredientes | En el scraper Purina capturó beneficios en vez de lista de ingredientes |
| **Purina** | PPVD Canine EN / Critical (2 latas)| 0,16 - 0,38 kg | Imagen, Ingredientes, Nutrientes | Latas clínicas veterinarias húmedas |

---

## 💡 5. Recomendaciones para Completar

1. **Pedigree y Whiskas (Mars Petcare):**
   - Las imágenes oficiales y los ingredientes ya están en `Imagenes_Alimentos/AllendesHnos/`.
   - Solo hace falta consultar la web oficial de Pedigree Chile (`pedigree.cl`) y Whiskas Chile (`whiskas.cl`) para extraer la tabla de análisis garantizado (Proteína %, Grasa %, Calcio, Fósforo).
2. **Marcas Masivas de Gepsa (Amici, Ganacan, Compinches, Odwalla):**
   - Ya tienen packshot oficial y tabla de nutrientes al 100%. El texto de ingredientes se puede tomar del dorso de un saco físico en tienda si se requiere exactitud absoluta.
3. **Top One, Sabrokan y Canito:**
   - Pertenecen a proveedores locales chilenos. Se tiene la foto oficial; los porcentajes de proteína típicos son 18% para adulto y 22% para cachorro.

---

# 🔎 6. Hallazgos de Investigación (actualizado 2026-10)

> El deploy del editor PIM quedó en producción. Esta sección documenta los datos que **sí fue posible obtener** de fuentes oficiales y el estado real de las imágenes locales.

## 6.1 Análisis garantizado verificado (fuentes oficiales)

> ⚠️ Las fichas oficiales chilenas de Mars Petcare (Pedigree y Whiskas) **no declaran grasa cruda / extracto etéreo** en alimento seco; solo proteína, fibra, humedad, calcio, fósforo y energía. Ese dato solo puede confirmarse en la etiqueta física del envase.

### Pedigree — fuente: `pedigree.cl`

| Producto FIVE | Proteína (mín) | Grasa | Fibra (máx) | Humedad (máx) | Calcio | Fósforo | Energía | Ficha oficial |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Pedigree Adulto 21 kg | 21,0% | No declarada | 4,0% | 12,0% | 1,0 – 2,2% | 0,9 – 1,4% | 3500 kcal/kg | [Croquetas Adulto Carne y Vegetales](https://www.pedigree.cl/nuestros-productos/alimento-seco/pedigree-croquetas-adulto-sabor-carne-y-vegetales) |
| Pedigree Senior 21 kg | 21,0% | No declarada | 4,0% | 12,0% | 1,0 – 2,2% | 0,9 – 1,4% | 3500 kcal/kg | [Croquetas Senior](https://www.pedigree.cl/nuestros-productos/alimento-seco/pedigree-croquetas-senior-sabor-carne-y-vegetales) |
| Pedigree Cachorro 21 kg | 25,0% | No declarada | 4,0% | 12,0% | 1,1 – 2,0% | 0,9 – 1,4% | 3600 kcal/kg | [Croquetas Cachorro](https://www.pedigree.cl/nuestros-productos/alimento-seco/pedigree-croquetas-cachorro-sabor-carne-y-pollo) |
| Pedigree Razas Pequeñas 21 kg | 21,0% | No declarada | 4,0% | 12,0% | 1,0 – 2,2% | 0,9 – 1,4% | 3550 kcal/kg | [Adulto Razas Pequeñas](https://www.pedigree.cl/nuestros-productos/alimento-seco/pedigree-adulto-razas-pequenas-sabor-carne-y-vegetales) |

### Whiskas — fuente: `whiskas.cl`

| Producto FIVE | Proteína | Fibra (máx) | Humedad (máx) | Calcio | Fósforo | Energía | Ficha oficial |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Whiskas Adulto Pescado 10 kg | 28,0% | 4,0% | 12,0% | 0,8 – 1,5% | 0,5 – 1,4% | 3700 kcal/kg | [Alimento seco adultos pescado](https://www.whiskas.cl/nuestros-productos/alimento-seco/whiskas-alimento-seco-para-gatos-adultos-pescado) |
| Whiskas Adulto Carne 10 kg | 28,0% | 4,0% | 12,0% | 0,8 – 1,5% | 0,5 – 1,4% | 3700 kcal/kg | [Alimento seco adultos carne](https://www.whiskas.cl/nuestros-productos/alimento-seco/whiskas-alimento-seco-para-gatos-adultos-carne) |
| Whiskas Gatito 10 kg | 30,0% | 4,0% | 12,0% | 1,0 – 2,0% | 0,8 – 1,5% | 3650 kcal/kg | [Alimento seco gatitos carne y leche](https://www.whiskas.cl/nuestros-productos/alimento-seco/whiskas-alimento-seco-para-gatitos-carne-y-leche) |

### 🐛 Bug crítico detectado: ingredientes de Whiskas son de producto húmedo

En `data/pim.json` los campos `ingredients` de los 3 Whiskas secos contienen texto de los **sobres húmedos sabor soufflé**, no del alimento seco:

| ID | Texto actual (erróneo) | Debe decir (oficial) |
| :--- | :--- | :--- |
| prod-250 | "…Cocidos al vapor Whiskas® sabor pescado soufflé… (húmedo)" | Lista seca oficial ↓ |
| prod-251 | "…Cocidos al vapor Whiskas® sabor carne soufflé… (húmedo)" | Lista seca oficial ↓ |
| prod-252 | "…Whiskas® gatitos sabor carne soufflé… (húmedo)" | Lista seca oficial ↓ |

**Whiskas Adulto Pescado (seco):** Maíz y/o trigo y/o arroz, harina de subproductos de pollo, gluten de maíz y/o harina de soja y/o salvado de maíz y/o salvado de trigo, grasa de pollo y/o sebo bovino, harina de carne y hueso bovino, hidrolizado de menudencias (pollo y/o cerdo y/o bovino), cloruro de sodio, harina de trigo, aminoácidos (taurina, arginina), vitaminas (E, niacina, ácido pantoténico, B1, A, B2, B6, ácido fólico, B12, D3), cloruro de potasio, harina de pescado, cloruro de colina, minerales (sulfato ferroso, óxido de zinc, sulfato de cobre, iodato de calcio, selenito de sodio), zanahoria deshidratada, espinaca deshidratada, prebióticos (mananooligosacáridos), antioxidante (BHT, BHA).

**Whiskas Adulto Carne (seco):** Maíz y/o trigo y/o arroz, harina de subproductos de pollo, gluten de maíz y/o harina de soja y/o salvado de maíz y/o salvado de trigo, grasa de pollo y/o sebo bovino, harina de carne y hueso bovino, hidrolizado de menudencias (pollo y/o cerdo y/o bovino), cloruro de sodio, harina de trigo, colorantes (caramelo, rojo ponceau, amarillo ocaso, tartrazina, índigo carmín), aminoácidos (taurina, arginina), vitaminas (E, niacina, ácido pantoténico, B1, A, B2, B6, ácido fólico, B12, D3), cloruro de potasio, cloruro de colina, minerales (sulfato ferroso, óxido de zinc, sulfato de cobre, iodato de calcio, selenito de sodio), zanahoria deshidratada, espinaca deshidratada, prebióticos (mananooligosacáridos), antioxidante (BHT/BHA).

**Whiskas Gatito (seco):** Maíz y/o trigo y/o arroz, harina de subproductos de pollo, gluten de maíz y/o harina de soja y/o salvado de maíz y/o salvado de trigo, grasa de pollo y/o sebo bovino, harina de carne y hueso bovino, hidrolizado de menudencias (pollo y/o cerdo y/o bovino), cloruro de sodio, aminoácidos (metionina, taurina, arginina), vitaminas (E, niacina, ácido pantoténico, B1, A, B2, B6, ácido fólico, B12, D3), cloruro de colina, cloruro de potasio, minerales (sulfato ferroso, óxido de zinc, sulfato de cobre, iodato de calcio, selenito de sodio), zanahoria deshidratada, espinaca deshidratada, aceite de pescado y/o harina de pescado (fuente de DHA), prebióticos (mananooligosacáridos), leche en polvo, antioxidante (BHT/BHA).

## 6.2 Imágenes locales disponibles sin integrar

> Las 28 fórmulas sin imagen del reporte original fueron cruzadas contra los archivos de `Imagenes_Alimentos/`. **22 tienen candidato local y 13 productos (12 archivos) ya fueron integrados** en `catalog.ts` + `data/pim.json` + `public/products/`.

### ✅ Integradas (match confirmado)

| ID FIVE | Producto | Imagen integrada |
| :--- | :--- | :--- |
| prod-9 / prod-11 | Amici Gato Pescado 10/15 kg | `cari-amici-premium-gatos-salmon-y-merluza-austral.png` (verificado: gato seco, salmón y merluza) |
| prod-237 | Appetit Perro Adulto Premium 20 kg | `appetit-adulto.webp` (verificado: "Appetit Alimento Premium Adulto 20 kg") |
| prod-88 | Kongo Gato Adulto Pescado 8 kg | `Gorchen/gatos/kongo/kongo-kongo-gatos-salmon-atun-8-kg.jpg` |
| prod-89 | Kongo Gato Adulto Pescado 1 kg | `Gorchen/gatos/kongo/kongo-kongo-gatos-salmon-atun-1-kg.jpg` |
| prod-100 | Voraz Cachorro 10 kg | `Gorchen/perros/voraz/voraz-voraz-junior-mix-carne-pollo-vegetales-10-kg.jpg` |
| prod-120 | Josera Dailycat Adulto 2 kg | `Cooprinsem/gatos/josera/josera-josera-daily-cat-2-kgs-gato-adulto-sensibilidad-digestiva.jpg` |
| prod-121 | Josera Dailycat Adulto 10 kg | `Cooprinsem/gatos/josera/josera-josera-daily-cat-10-kgs-gato-adulto-sensibilidad-digestiva.jpg` |
| prod-218 | Purina PPVD Canine EN 380 g (lata) | `Purina/perros/pro-plan/alimento-humedo-pro-plan-gastroenteric.jpg` |
| prod-219 | Purina PPVD Critical Nutrition 5,5 oz | `Purina/perros/pro-plan/pro-plan-cn-perros-convalescence-veterinary-diets.png` |
| prod-235 | Superpet Cachorro 18 kg | `DragPharma/perros/Superpet/superpet-omega-puppy.png` |
| prod-255 | Bokato Adulto Tradicional 20 kg | `Bokato/perros/Super_Premium_Tradici_n/bokato-tradicion.webp` |
| prod-258 | Bokato Pettit 10 kg | `Bokato/perros/Super_Premium_Petit/bokato-petit.webp` |

### ❌ Descartadas tras verificación visual

| ID FIVE | Producto | Candidato | Motivo |
| :--- | :--- | :--- | :--- |
| prod-136 | Josera Miniwell 10 kg | `Cooprinsem/.../josera-mini-adult-chicken-rice-10-kgs...jpg` | El archivo es un placeholder "Imagen no disponible" (0 valor). Además no se pudo confirmar equivalencia con Miniwell. |

### Sin imagen local ni fuente conocida

| ID FIVE | Producto | Situación |
| :--- | :--- | :--- |
| prod-35 | Cachupín Cachorro 25 kg | Solo hay packshots `cachupin-adulto` en Allendes. |
| prod-51/52/53 | Mastín Senior / Signature / Raza Pequeña | Nutritec solo tiene `mastin-adulto` y `mastin-madre-cachorro`. |
| prod-87 | Kongo Gato Pescado 15 kg | Existen packshots de 1 kg y 8 kg; falta el de 15 kg. |
| prod-266/267 | N&D Espirulina Gato Tilapia 1,5/7 kg | No está en Agrovet (solo N&D Prime/Quinoa/Pumpkin/Vet Life). |
| prod-278 | N&D Gato Jabalí y Manzana lata 0,42 kg | Farmina no tiene variedad jabalí en las carpetas locales. |
| prod-44 | Askat Adulto 20 kg | Sin carpeta de proveedor. |
| prod-54 | Pionero Perro Adulto 18 kg | Sin carpeta de proveedor. |
| prod-71/72/73/74 | Gallina Ponedora/Broiler 25 kg | Alimento de granja, fuera de scrapers de mascotas. |

## 6.3 Plan sugerido para completar el 100%

1. **Gepsa (16 fórmulas sin ingredientes):** re-ejecutar/ampliar `Imagenes_Alimentos/scraper_gepsa.mjs` (ya parsea tablas de análisis) para extraer también el texto de ingredientes de `gepsapetfoods.com`.
2. **Allendes (Top One, Sabrokan, Sabrocat, Canito, Guau Forte):** scrapear las fichas de producto de `allendeshnos.cl` (de donde ya salieron los packshots) para obtener análisis garantizado e ingredientes.
3. **Pedigree / Whiskas:** datos ya obtenidos en esta sección; pendiente solo grasa, que no publica Mars Chile.
4. **Juvenia:** verificar si es alimento o suplemento antes de mapear (el reporte lo marca como nutracéutico).
5. **Imágenes sin fuente:** buscar en Mercado Libre / tiendas oficiales o solicitar foto al proveedor; NO inventar ni reutilizar packshots de otro formato.
6. **Integración:** todo cambio debe aplicarse en `src/data/pim/catalog.ts` (storefront) **y** `data/pim.json` (runtime) para que no queden desincronizados.

---

# 🚀 7. Segunda Integración Masiva (2026-10)

## 7.1 Datos integrados — 71 productos

| Fuente | Productos | Qué se cargó |
| :--- | :---: | :--- |
| `gepsapetfoods.com/cari-amici` (web oficial) | 7 | Ingredientes completos + proteína/grasa/fibra/humedad de toda la línea Amici |
| Dataset Gepsa (Ganacan, Ganacat, Odwalla, Zimpi, Magnífico, Compinches) | 13 | Análisis garantizado (proteína, grasa, fibra, humedad) |
| Gorchen/Baires (Kongo, Kongo Gold, Voraz, Company, Natural Meat) | 28 | Ingredientes reales de ficha + % de proteína declarado |
| Dataset Purina (Cat Chow Gatito, Gati, Felix Megamix, Pro Plan, LiveClear, Excellent, PPVD CN) | 15 | Macros + ingredientes donde existen |
| PROA (Champion Dog) | 3 | Macros + ingredientes |
| Bokato / Appetit | 4 | Macros + ingredientes |
| DragPharma (Superpet Omega) | 4 | Imagen + composición real de suplementos |

## 7.2 Correcciones de integridad

- **37 ingredientes basura eliminados:** el scraping anterior había importado el texto *"Consulte el empaque o especificación técnica del fabricante."* como ingredientes en Josera, Josi y Bavaro.
- **Superpet (alimentos) corregido:** `prod-234/235/236` tenían imágenes de *fichas técnicas PDF de suplementos* e ingredientes de aceites. Ahora usan placeholder genérico y sin ingredientes falsos.
  - `prod-380/381/382/383` (suplementos Omega) ahora tienen su packshot real y composición correcta.
- **Kongo/Company/Natural Meat/Voraz:** reemplazados los placeholders "Consulte el empaque" por la nómina real de ingredientes de Gorchen.

## 7.3 Pendientes reales (91 productos)

| Marca | Nº | Falta | Fuente posible |
| :--- | :---: | :--- | :--- |
| Josera + Josi | 37 | Ingredientes y/o proteína | PDFs de ficha técnica en las fichas de Cooprinsem, o web oficial Josera |
| Gepsa (Compinches, Ganacan, Ganacat, Magnífico, Odwalla, Zimpi) | 12 | Nómina de ingredientes | El fabricante no la publica; solicitar a Gepsa |
| Allendes (Top One 5, Sabrokan, Sabrocat 2, Canito, Guau Forte, Cachupín 2, Felinnes 2) | 13 | Ingredientes y/o proteína | Sin datos en el sitio; requiere foto de etiqueta/dorso |
| N&D | 3 | Todo | Web oficial Farmina (Espirulina Tilapia / Jabalí) |
| Mastín | 3 | Todo | Líneas Senior/Signature/Raza Pequeña no publicadas por Nutritec |
| Bavaro | 3 | Proteína | PDFs Cooprinsem |
| Purina | 8 | Cat Chow Adulto Carne (dry), PPVD Canine EN 380 g | Ficha técnica Purina |
| Gallina (4), Pionero, Askat, Natural Meat | 7 | Todo | Marcas locales/farm; contacto con proveedor |

## 7.4 Imágenes pendientes (8)

Cachupín Cachorro, Mastín Senior/Signature/Raza Pequeña, Kongo Gato Pescado 15 kg, N&D Espirulina Tilapia (1,5/7 kg), N&D Jabalí lata, Askat, Pionero y Gallina x4.
