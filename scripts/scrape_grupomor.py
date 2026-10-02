#!/usr/bin/env python3
"""
Scraper y extractor para GRUPO MOR (https://grupomor.cl/).
Extrae el catálogo completo de alimentos secos, húmedos, snacks/premios y suplementos
para perros y gatos usando WooCommerce Store API.
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

BASE_DIR = "/home/maruzs/Desktop/Five_Mascotas/Imagenes_Alimentos/GrupoMOR"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

FOOD_CATEGORIES = [
    'alimentacion-y-premios', 'alimentos', 'alimento-cachorros', 'alimento-perro-humedos',
    'alimento-perros-adultos', 'alimento-perros-especiales', 'alimento-seco', 'adult', 'puppy',
    'snack', 'galletas-perro', 'huesos-perro', 'huesos-perros', 'treats-perro',
    'alimentacion-y-premios-gato', 'alimentos-gato', 'alimento-gato-adulto-alimentos-gato',
    'alimento-gato-especiales', 'alimento-gato-humedo', 'alimento-gato-humedos', 'alimento-kitten',
    'snack-alimentacion-y-premios-gato', 'snack-gato'
]

EXCLUDED_TERMS = [
    'comedero', 'bebedero', 'juguete', 'bano', 'baño', 'grooming', 'paseo', 'arnes', 'arnés',
    'collar', 'correa', 'transporte', 'casa', 'puerta', 'manchas', 'orina', 'sabanilla',
    'panal', 'pañal', 'arena', 'arenas', 'clinica', 'medicamento', 'cepillo', 'peine', 'toallas', 'bolso'
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

def fetch_all_mor_products():
    print("Obteniendo productos vía WooCommerce Store API...")
    def fetch_page(page):
        try:
            r = requests.get(f"https://grupomor.cl/wp-json/wc/store/v1/products?per_page=100&page={page}", headers=HEADERS, timeout=30)
            if r.status_code == 200:
                return r.json()
        except Exception as e:
            print(f"[ERROR] Fetching page {page}: {e}")
        return []

    with ThreadPoolExecutor(max_workers=5) as ex:
        pages = list(ex.map(fetch_page, range(1, 11)))

    all_items = [item for p in pages for item in p]
    print(f"Total productos en catálogo de Grupo MOR: {len(all_items)}")

    # Filtrar solo alimentos/snacks/suplementos para perro y gato
    filtered = []
    for p in all_items:
        cat_slugs = [c['slug'].lower() for c in p.get('categories', [])]
        cat_names = [c['name'].lower() for c in p.get('categories', [])]
        all_cats = cat_slugs + cat_names
        p_name = p.get('name', '').lower()

        # Determinar especie
        is_perro = any('perro' in c for c in all_cats) or any(k in p_name for k in ['perro', 'dog', 'puppy'])
        is_gato = any('gato' in c for c in all_cats) or any(k in p_name for k in ['gato', 'cat', 'kitten', 'meowee'])

        if not (is_perro or is_gato):
            continue

        has_food_cat = any(fc in cat_slugs for fc in FOOD_CATEGORIES)
        has_excluded = any(any(et in s for et in EXCLUDED_TERMS) for s in all_cats)

        # Excluir accesorios explicitamente por nombre
        if any(bad in p_name for bad in ['comedero', 'bebedero', 'plato', 'dispensador', 'juguete', 'shampoo', 'arena']):
            continue

        if has_food_cat and not has_excluded:
            filtered.append((p, is_perro, is_gato))

    print(f"Alimentos/snacks identificados: {len(filtered)}")
    return filtered

def parse_mor_product(item_data):
    p, is_perro, is_gato = item_data
    raw_name = clean_text(p.get('name', ''))
    
    # 1. Especie
    if is_perro and not is_gato:
        especie = "perro"
    elif is_gato and not is_perro:
        especie = "gato"
    else:
        # Check title
        n_low = raw_name.lower()
        if any(k in n_low for k in ['cat', 'gato', 'kitten', 'meowee', 'felin']):
            especie = "gato"
        else:
            especie = "perro"

    # 2. Submarca / Línea comercial
    brands = p.get('brands', [])
    if brands:
        submarca = clean_text(brands[0].get('name'))
    else:
        # Infer from name
        upper_name = raw_name.upper()
        if "BRAVERY" in upper_name:
            submarca = "Bravery"
        elif "AMITY" in upper_name:
            submarca = "Amity"
        elif "PLAISIR" in upper_name:
            submarca = "Plaisir"
        elif "DINGO" in upper_name:
            submarca = "Dingo"
        elif "PLENTY" in upper_name:
            submarca = "Plenty"
        elif "DREAMBONE" in upper_name or "DREAM BONE" in upper_name:
            submarca = "DreamBone"
        elif "APPLAWS" in upper_name:
            submarca = "Applaws"
        elif "MEOWEE" in upper_name:
            submarca = "Meowee!"
        elif any(k in upper_name for k in ["NT ", "NATURALISTIC", "BISCUITS", "SALMON CHIPS", "MEAT DUCK", "MEATMIX", "MEATBALLS", "TASTY BEEF"]):
            submarca = "Naturalistic"
        else:
            submarca = raw_name.split()[0].capitalize()

    # 3. Etapa de vida
    n_up = raw_name.upper()
    if any(k in n_up for k in ["PUPPY", "KITTEN", "JUNIOR", "CACHORRO"]):
        etapa_vida = "cachorro"
    elif any(k in n_up for k in ["SENIOR", "GERIATRICO", "+7"]):
        etapa_vida = "senior"
    else:
        etapa_vida = "adulto"

    # 4. Formatos
    formatos = []
    # Check weight field
    weight = p.get('weight')
    if weight and float(weight) > 0:
        w_val = float(weight)
        if w_val >= 1:
            formatos.append(f"{w_val:g} kg")
        else:
            formatos.append(f"{int(w_val * 1000)} g")
    # Check weight mentioned in product title (e.g., "120 GR", "7 KG", "290 GR", "5 UN")
    title_weights = re.findall(r'(\d+(?:\.\d+)?\s*(?:kg|gr|g|un|sachet))', raw_name, re.IGNORECASE)
    for tw in title_weights:
        tw_clean = clean_text(tw).lower()
        if tw_clean not in [f.lower() for f in formatos]:
            formatos.append(tw_clean)
    if not formatos:
        formatos = ["Presentación única"]

    # 5. Descripcion, Ingredientes, Analisis Garantizado de HTML
    desc_html = p.get('description', '')
    soup = BeautifulSoup(desc_html, 'html.parser')
    full_text = soup.get_text('\n', strip=True)
    lines = [clean_text(l) for l in full_text.split('\n') if clean_text(l)]

    # Split between benefits/description, ingredients, analysis
    desc_lines = []
    ing_lines = []
    gar_lines = []
    state = "desc"

    for l in lines:
        l_low = l.lower()
        if any(k in l_low for k in ["ingredientes", "composición"]):
            state = "ing"
            continue
        elif any(k in l_low for k in ["componentes analíticos", "análisis garantizado", "constituyentes analíticos", "niveles de garantía"]):
            state = "gar"
            continue
        
        if state == "desc":
            desc_lines.append(l)
        elif state == "ing":
            ing_lines.append(l)
        elif state == "gar":
            gar_lines.append(l)

    descripcion = clean_text(" ".join(desc_lines))
    if not descripcion:
        short_soup = BeautifulSoup(p.get('short_description', ''), 'html.parser')
        descripcion = clean_text(short_soup.get_text(' ', strip=True))
    if not descripcion:
        descripcion = f"Alimento y nutrición balanceada de la línea {submarca} para {especie}s."

    ingredientes = clean_text(" ".join(ing_lines))

    # Analisis garantizado dict
    analisis_garantizado = {}
    gar_text = " ".join(gar_lines)
    gar_matches = re.findall(r'([A-Za-zÀ-ÿ0-9\s\+\-\(\)]+?)(?::|\s)\s*([0-9\.,]+%|[0-9\.,]+\s*g\/kg|[0-9\.,]+\s*mg\/kg|[0-9\.,]+\s*kcal\/kg)', gar_text)
    for k, v in gar_matches:
        clean_k = clean_text(k).strip('•- ')
        if len(clean_k) < 35 and clean_k:
            analisis_garantizado[clean_k] = clean_text(v)

    # 6. Imagen
    images = p.get('images', [])
    url_imagen_original = images[0].get('src', '') if images else ""

    # ID Slug
    slug = p.get('slug') or re.sub(r'[^a-z0-9]+', '-', f"{submarca}-{raw_name}".lower()).strip('-')
    prod_id = f"{submarca.lower()}-{slug}".lower()
    prod_id = re.sub(r'-+', '-', prod_id).strip('-')

    # Path local
    especie_dir = "perros" if especie == "perro" else "gatos"
    submarca_dir = re.sub(r'[^a-zA-Z0-9_-]', '_', submarca)
    ext = os.path.splitext(url_imagen_original.split('?')[0])[1] or '.png'
    img_filename = f"{prod_id}{ext}"
    rel_img_path = f"{especie_dir}/{submarca_dir}/{img_filename}"
    abs_img_path = os.path.join(BASE_DIR, rel_img_path)

    return {
        "id": prod_id,
        "marca_madre": "Grupo MOR",
        "submarca": submarca,
        "especie": especie,
        "etapa_vida": etapa_vida,
        "nombre": raw_name,
        "formatos": formatos,
        "descripcion": descripcion,
        "ingredientes": ingredientes,
        "analisis_garantizado": analisis_garantizado,
        "imagen_local": rel_img_path,
        "url_imagen_original": url_imagen_original,
        "url_origen": p.get('permalink', 'https://grupomor.cl/'),
        "_abs_img_path": abs_img_path
    }

def main():
    print("=== INICIANDO EXTRACCIÓN DE GRUPO MOR ===")
    os.makedirs(BASE_DIR, exist_ok=True)
    raw_products = fetch_all_mor_products()
    
    products = [parse_mor_product(item) for item in raw_products]
    print(f"Productos procesados: {len(products)}")

    # Descarga concurrente de imágenes
    print("Descargando imágenes oficiales...")
    download_tasks = [(p["url_imagen_original"], p["_abs_img_path"]) for p in products if p["url_imagen_original"]]

    def dl_task(t):
        url, path = t
        return download_file(url, path)

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(dl_task, download_tasks))

    print(f"Imágenes descargadas exitosamente: {sum(results)} / {len(results)}")

    # Limpiar campos temporales
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
