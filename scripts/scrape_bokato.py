#!/usr/bin/env python3
"""
Scraper y extractor para BOKATO (https://www.bokato.cl/home).
"""
import os
import re
import csv
import json
import html
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = "/home/maruzs/Desktop/Five_Mascotas/Imagenes_Alimentos/Bokato"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

PRODUCT_URLS = [
    ("bokato-cachorro", "https://www.bokato.cl/bokato-cachorro-super-premium-alimento-mascota-naturales", "perro", "cachorro", "Super Premium"),
    ("bokato-petit", "https://www.bokato.cl/bokato-petit-super-premium-alimento-mascota-naturales", "perro", "adulto", "Super Premium Petit"),
    ("bokato-gold", "https://www.bokato.cl/bokato-gold-super-premium-alimento-mascota-naturales", "perro", "adulto", "Super Premium Gold"),
    ("bokato-tradicion", "https://www.bokato.cl/bokato-tradicion-super-premium-alimento-mascota-naturales", "perro", "adulto", "Super Premium Tradición"),
    ("bokato-lady", "https://www.bokato.cl/bokato-lady-premium-alimento-mascota-naturales", "perro", "adulto", "Premium Lady"),
    ("bokato-veloz", "https://www.bokato.cl/bokato-veloz-alimento-mascota-naturales", "perro", "adulto", "Veloz High Energy"),
    ("bokato-senior", "https://www.bokato.cl/bokato-senior-super-premium-alimento-mascota-naturales", "perro", "senior", "Super Premium Senior"),
    ("bokato-taste-it", "https://www.bokato.cl/bokato-taste-it-cuidado-dental", "perro", "adulto", "Taste It Dental"),
    ("bokato-gatos", "https://www.bokato.cl/bokato-gatos-alimento-mascotas-naturales", "gato", "adulto", "Gatos Esterilizados"),
]

def clean_text(text):
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        if r.status_code == 200:
            with open(target_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            return True
        else:
            print(f"[WARN] Failed to download {url}: Status {r.status_code}")
    except Exception as e:
        print(f"[ERROR] Downloading {url}: {e}")
    return False

def scrape_bokato_product(item):
    slug_id, url, especie, etapa_vida, submarca = item
    session = requests.Session()
    session.headers.update(HEADERS)
    
    r = session.get(url, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    main = soup.find('main') or soup.find('div', id='wrap') or soup
    lines = [clean_text(l) for l in main.stripped_strings if clean_text(l)]
    
    # 1. Product Name
    nombre = ""
    for l in lines:
        if any(l.lower().startswith(k) for k in ["bokato", "taste it"]):
            nombre = l
            break
    if not nombre:
        title = soup.title.string if soup.title else ""
        nombre = title.split("|")[0].strip() or slug_id
    if nombre.lower() == "taste it!":
        nombre = "Bokato Taste It! Cuidado Dental"

    # 2. Formatos
    formatos = []
    full_text = " ".join(lines)
    disp_match = re.search(r'disponible\s+en(?:\s+sacos\s+de)?\s+([^\.]+)', full_text, re.IGNORECASE)
    if disp_match:
        disp_text = disp_match.group(1)
        found_weights = re.findall(r'(\d+(?:\.\d+)?\s*(?:kg|g))', disp_text, re.IGNORECASE)
        if found_weights:
            formatos = [w.strip() for w in found_weights]
        else:
            formatos = [clean_text(disp_text)]
    if not formatos:
        # Default or text search
        all_weights = re.findall(r'(\d+(?:\.\d+)?\s*kg)', full_text, re.IGNORECASE)
        if all_weights:
            # deduplicate preserving order
            formatos = list(dict.fromkeys([w.lower() for w in all_weights]))
        else:
            formatos = ["Presentación única"]

    # 3. Descripcion
    # Collect bullet points / benefits before ingredients
    desc_lines = []
    for l in lines:
        if l in [nombre, "DESCARGAR FICHA TÉCNICA", "INGREDIENTES"]:
            continue
        if "ingredientes" in l.lower() and len(l) < 30:
            break
        if "carne" in l.lower() or "proteína de ave" in l.lower() or "almidón" in l.lower():
            break
        if not l.startswith("http"):
            desc_lines.append(l)
    descripcion = " ".join(desc_lines)
    if not descripcion:
        descripcion = f"Alimento natural {submarca} para {especie}s formulado para nutrición balanceada y bienestar integral."

    # 4. Ingredientes
    ingredientes = ""
    ing_idx = -1
    for i, l in enumerate(lines):
        if "ingredientes" in l.lower() and len(l) < 30:
            ing_idx = i
            break
    if ing_idx != -1 and ing_idx + 1 < len(lines):
        # usually next line or two is the ingredients list
        candidate = lines[ing_idx + 1]
        if candidate == "INGREDIENTES" and ing_idx + 2 < len(lines):
            candidate = lines[ing_idx + 2]
        ingredientes = candidate
    else:
        # search for line containing meat or protein percentages
        for l in lines:
            if any(k in l.lower() for k in ["carne ave", "carne y ave", "carne de ave", "proteína de ave", "almidón de maíz"]):
                ingredientes = l
                break

    # 5. Analisis Garantizado
    analisis_garantizado = {}
    matches = re.findall(r'([A-Za-zÀ-ÿ\s\(\)]+?):\s*([0-9\.,]+%|[0-9\.,]+\s*g\/kg|[0-9\.,]+\s*mg\/kg)', full_text)
    for k, v in matches:
        clean_k = clean_text(k)
        if len(clean_k) < 30 and not any(ign in clean_k.lower() for ign in ["lunes", "horario", "teléfono", "saco", "contacto"]):
            analisis_garantizado[clean_k] = v.strip()

    # Fallback to key percentages mentioned in highlights
    if not analisis_garantizado:
        prot_match = re.search(r'(\d+%\s*de\s*proteínas?)', full_text, re.IGNORECASE)
        if prot_match:
            analisis_garantizado["Proteína Cruda"] = prot_match.group(1)
        grasa_match = re.search(r'(\d+%\s*de\s*(?:grasa|extracto etéreo))', full_text, re.IGNORECASE)
        if grasa_match:
            analisis_garantizado["Grasa"] = grasa_match.group(1)

    # 6. Imagen
    url_imagen_original = ""
    for img in soup.find_all('img'):
        src = img.get('src') or ''
        src_up = src.upper()
        if 'FRONT' in src_up or any(k in src.lower() for k in ['gold', 'cachorro', 'gato', 'petit', 'senior', 'tradicion', 'veloz', 'lady', 'taste']):
            if not any(ign in src.lower() for ign in ['logo', 'icon', 'map', 'calculadora', 'etiqueta', 'boton']):
                url_imagen_original = urljoin(url, src)
                break

    # Local filename
    submarca_dir = re.sub(r'[^a-zA-Z0-9_-]', '_', submarca)
    especie_dir = "perros" if especie == "perro" else "gatos"
    ext = os.path.splitext(url_imagen_original.split('?')[0])[1] or '.webp'
    img_filename = f"{slug_id}{ext}"
    rel_img_path = f"{especie_dir}/{submarca_dir}/{img_filename}"
    abs_img_path = os.path.join(BASE_DIR, rel_img_path)

    return {
        "id": slug_id,
        "marca_madre": "Bokato",
        "submarca": submarca,
        "especie": especie,
        "etapa_vida": etapa_vida,
        "nombre": nombre,
        "formatos": formatos,
        "descripcion": descripcion,
        "ingredientes": ingredientes,
        "analisis_garantizado": analisis_garantizado,
        "imagen_local": rel_img_path,
        "url_imagen_original": url_imagen_original,
        "url_origen": url,
        "_abs_img_path": abs_img_path
    }

def main():
    print("=== INICIANDO EXTRACCIÓN DE BOKATO ===")
    os.makedirs(BASE_DIR, exist_ok=True)
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        products = list(executor.map(scrape_bokato_product, PRODUCT_URLS))

    print(f"Productos extraídos: {len(products)}")

    # Descarga concurrente de imágenes
    print("Descargando imágenes originales...")
    download_tasks = []
    for p in products:
        if p["url_imagen_original"]:
            download_tasks.append((p["url_imagen_original"], p["_abs_img_path"]))

    def dl_task(t):
        url, path = t
        return download_file(url, path)

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(dl_task, download_tasks))

    print(f"Imágenes descargadas exitosamente: {sum(results)} / {len(results)}")

    # Limpiar campos internos antes de guardar
    for p in products:
        p.pop("_abs_img_path", None)

    # Guardar dataset.json
    json_path = os.path.join(BASE_DIR, "dataset.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Guardado: {json_path}")

    # Guardar dataset.csv
    csv_path = os.path.join(BASE_DIR, "dataset.csv")
    fieldnames = [
        "id", "marca_madre", "submarca", "especie", "etapa_vida",
        "nombre", "formatos", "descripcion", "ingredientes",
        "analisis_garantizado", "imagen_local", "url_imagen_original", "url_origen"
    ]
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        for p in products:
            row = dict(p)
            row["formatos"] = json.dumps(row["formatos"], ensure_ascii=False)
            row["analisis_garantizado"] = json.dumps(row["analisis_garantizado"], ensure_ascii=False)
            writer.writerow(row)
    print(f"Guardado: {csv_path}")

if __name__ == "__main__":
    main()
