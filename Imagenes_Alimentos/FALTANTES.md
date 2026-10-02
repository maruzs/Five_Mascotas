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
