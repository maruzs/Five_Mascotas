#!/usr/bin/env python3
"""
Scraper y extractor para HRaz (https://hraz.cl/cl/).
Catálogos:
- Nutrición Canina: https://hraz.cl/cl/nutricion-canina/
- Nutrición Felina: https://hraz.cl/cl/nutricion-felina/
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

BASE_DIR = "/home/maruzs/Desktop/Five_Mascotas/Imagenes_Alimentos/HRaz"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

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

def parse_hraz_page(url, especie):
    session = requests.Session()
    session.headers.update(HEADERS)
    r = session.get(url, timeout=25)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    # Target all h3s that define products
    h3s = [h for h in soup.find_all('h3') if any(k in h.get_text().upper() for k in ['FROST', 'ASTRO', 'ATACAMA']) and 'LÍNEA' not in h.get_text().upper()]
    
    products = []
    seen_ids = set()

    for h in h3s:
        raw_name = clean_text(h.get_text())
        row = h.find_parent('div', class_=re.compile(r'elementor-row|e-con-inner|elementor-container'))
        if not row:
            continue
            
        # Images inside this elementor block
        imgs = [img['src'] for img in row.find_all('img') if img.get('src') and not any(k in img['src'].lower() for k in ['logo', 'icon', 'arrow', 'whatsapp'])]
        img_url = imgs[0] if imgs else ""

        full_text = row.get_text('\n', strip=True)
        lines = [clean_text(l) for l in full_text.split('\n') if clean_text(l)]
        
        # Determine Submarca
        upper = raw_name.upper()
        if "FROST" in upper:
            submarca = "Frost"
        elif "ASTRO" in upper:
            submarca = "Astro"
        elif "ATACAMA" in upper:
            submarca = "Atacama"
        else:
            submarca = "HRaz"

        # Determine Etapa de Vida
        if any(k in upper for k in ["PUPPY", "JUNIOR", "KITTEN"]):
            etapa_vida = "cachorro"
        elif "SENIOR" in upper:
            etapa_vida = "senior"
        else:
            etapa_vida = "adulto"

        # ID
        slug_id = re.sub(r'[^a-z0-9]+', '-', f"{submarca}-{raw_name}".lower()).strip('-')
        if slug_id in seen_ids:
            continue
        seen_ids.add(slug_id)

        # Formatos
        formatos = []
        for i, l in enumerate(lines):
            if "formatos de presentación" in l.lower() or "formato de presentación" in l.lower():
                if i + 1 < len(lines):
                    fmt_text = lines[i+1]
                    fmts = re.findall(r'(\d+(?:\.\d+)?\s*(?:kg|g))', fmt_text, re.IGNORECASE)
                    if fmts:
                        formatos = list(dict.fromkeys([f.strip() for f in fmts]))
                    else:
                        formatos = [fmt_text]
                break
        if not formatos:
            # search in full text
            all_w = re.findall(r'(\d+(?:\.\d+)?\s*kg)', full_text, re.IGNORECASE)
            if all_w:
                formatos = list(dict.fromkeys([w.strip() for w in all_w]))[:2]
            else:
                formatos = ["Presentación estándar"]

        # Descripcion
        desc_lines = []
        desc_active = False
        for l in lines:
            if "ficha técnica" in l.lower():
                desc_active = True
                continue
            if desc_active:
                if any(k in l.lower() for k in ["ingredientes", "niveles de garantía", "enriquecimiento"]):
                    break
                desc_lines.append(l)
        descripcion = clean_text(" ".join(desc_lines))
        if not descripcion:
            # Fallback to general paragraph
            for l in lines:
                if len(l) > 60 and not any(k in l.lower() for k in ["ingredientes", "garantía", "enriquecimiento", "harina"]):
                    descripcion = l
                    break

        # Ingredientes
        ing_lines = []
        ing_active = False
        for l in lines:
            if "ingredientes" in l.lower() and len(l) < 30:
                ing_active = True
                continue
            if ing_active:
                if any(k in l.lower() for k in ["niveles de garantía", "enriquecimiento", "cantidades diarias", "energía metabolizable"]):
                    break
                ing_lines.append(l)
        ingredientes = clean_text(" ".join(ing_lines))

        # Analisis Garantizado
        gar_lines = []
        gar_active = False
        for l in lines:
            if "niveles de garantía" in l.lower() or "análisis garantizado" in l.lower():
                gar_active = True
                continue
            if gar_active:
                if any(k in l.lower() for k in ["enriquecimiento", "cantidades diarias", "energía metabolizable"]):
                    break
                gar_lines.append(l)
        gar_text = " ".join(gar_lines)
        
        analisis_garantizado = {}
        # Parse items like "Humedad (máx) 100 g/kg (10%)" or "Proteína Cruda (mín) 260 g/kg (26%)"
        matches = re.findall(r'([A-Za-zÀ-ÿ0-9\s\+\-\(\)]+?)\s*\((?:mín|máx|min|max)\)\s*([0-9\.,]+(?:\s*g\/kg|\s*mg\/kg|\s*mcg\/kg|\s*UI\/kg|\s*%)?(?:\s*\([0-9\.,]+%\))?)', gar_text, re.IGNORECASE)
        for k, v in matches:
            clean_k = clean_text(k)
            if len(clean_k) < 35 and not any(ign in clean_k.lower() for ign in ["peso", "taza", "baja actividad"]):
                analisis_garantizado[clean_k] = clean_text(v)

        # Image Paths
        especie_dir = "perros" if especie == "perro" else "gatos"
        submarca_dir = re.sub(r'[^a-zA-Z0-9_-]', '_', submarca)
        ext = os.path.splitext(img_url.split('?')[0])[1] or '.png'
        img_filename = f"{slug_id}{ext}"
        rel_img_path = f"{especie_dir}/{submarca_dir}/{img_filename}"
        abs_img_path = os.path.join(BASE_DIR, rel_img_path)

        products.append({
            "id": slug_id,
            "marca_madre": "HRaz",
            "submarca": submarca,
            "especie": especie,
            "etapa_vida": etapa_vida,
            "nombre": raw_name,
            "formatos": formatos,
            "descripcion": descripcion,
            "ingredientes": ingredientes,
            "analisis_garantizado": analisis_garantizado,
            "imagen_local": rel_img_path,
            "url_imagen_original": img_url,
            "url_origen": url,
            "_abs_img_path": abs_img_path
        })
        
    return products

def main():
    print("=== INICIANDO EXTRACCIÓN DE HRAZ ===")
    os.makedirs(BASE_DIR, exist_ok=True)
    
    canine_prods = parse_hraz_page("https://hraz.cl/cl/nutricion-canina/", "perro")
    feline_prods = parse_hraz_page("https://hraz.cl/cl/nutricion-felina/", "gato")
    all_products = canine_prods + feline_prods

    print(f"Productos extraídos: {len(all_products)} (Perros: {len(canine_prods)}, Gatos: {len(feline_prods)})")

    # Descarga concurrente de imágenes
    print("Descargando imágenes...")
    download_tasks = [(p["url_imagen_original"], p["_abs_img_path"]) for p in all_products if p["url_imagen_original"]]

    def dl_task(t):
        url, path = t
        return download_file(url, path)

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(dl_task, download_tasks))

    print(f"Imágenes descargadas exitosamente: {sum(results)} / {len(results)}")

    # Limpiar campos temporales
    for p in all_products:
        p.pop("_abs_img_path", None)

    # Guardar dataset.json
    json_path = os.path.join(BASE_DIR, "dataset.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
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
        for p in all_products:
            row = dict(p)
            row["formatos"] = json.dumps(row["formatos"], ensure_ascii=False)
            row["analisis_garantizado"] = json.dumps(row["analisis_garantizado"], ensure_ascii=False)
            writer.writerow(row)
    print(f"Guardado: {csv_path}")

if __name__ == "__main__":
    main()
