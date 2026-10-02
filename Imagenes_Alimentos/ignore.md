Actúa como Lead Data Engineer y Scraper Specialist para el proyecto Five Mascotas.

Tu tarea es investigar, extraer, estructurar y descargar el catálogo oficial completo de alimentos para mascotas del proveedor:
- PROVEEDOR: NB
- URL DE PARTIDA: https://www.nb.cl/

### 🎯 OBJETIVO:
Generar dentro de la carpeta `Imagenes_Alimentos/NB/` una base de datos/dataset completo de todos los alimentos disponibles, organizados por especie (perros / gatos) y por sus submarcas/líneas.

### 📋 CAMPOS OBLIGATORIOS POR ALIMENTO:
1. `id`: Slug único descriptivo (ej: `submarca-nombre-producto`).
2. `marca_madre`: Nombre del fabricante/proveedor.
3. `submarca`: Línea comercial (ej: Master Dog, Champion Cat, etc.).
4. `especie`: `perro` o `gato`.
5. `etapa_vida`: `cachorro`, `adulto` o `senior`.
6. `nombre`: Nombre oficial completo del alimento.
7. `formatos`: Array con todas las presentaciones/pesos disponibles (ej: `["3 kg", "8 kg", "15 kg"]`).
8. `descripcion`: Descripción y beneficios nutricionales del producto.
9. `ingredientes`: Lista completa de ingredientes en texto limpio separado por comas (sin HTML ni saltos de línea raros).
10. `analisis_garantizado`: Diccionario/objeto con los porcentajes de la garantía nutricional (Proteína mín, Grasa mín, Fibra máx, Humedad máx, Calcio, Fósforo, etc.).
11. `imagen_local`: Ruta relativa de la imagen descargada en alta resolución (ej: `Imagenes_Alimentos/NB/perros/submarca/nombre-producto.png`).
12. `url_imagen_original`: URL oficial de donde se descargó la imagen.
13. `url_origen`: Enlace a la ficha oficial o página del producto.

### 📁 REGLAS DE ESTRUCTURA Y ARCHIVOS:
- TODO debe quedar contenido estrictamente dentro de `Imagenes_Alimentos/NB/` (no modifiques ni desordenes otras carpetas del repositorio).
- Estructura de carpetas:
  ```text
  Imagenes_Alimentos/NB/
  ├── dataset.json            <-- Base de datos completa en JSON
  ├── dataset.csv             <-- Archivo CSV delimitado por punto y coma (;)
  ├── perros/
  │   └── [submarca]/
  │       └── [nombre-descriptivo-del-alimento].[png|webp|jpg]
  └── gatos/
      └── [submarca]/
          └── [nombre-descriptivo-del-alimento].[png|webp|jpg]
- Nombres de imágenes: Siempre descriptivos y en `kebab-case` (cero `IMG_001.jpg` o nombres genéricos).
- Genera y ejecuta un script en Node.js o Python dentro de `Imagenes_Alimentos/` (ej: `scraper_[proveedor].mjs`) para realizar el rastreo, la descarga de imágenes y la generación de `dataset.json` y `dataset.csv`.
- Al finalizar, presenta un resumen estadístico con:
  - Total de productos únicos catalogados.
  - Total de imágenes descargadas.
  - Tabla de desglose por especie y submarca.
