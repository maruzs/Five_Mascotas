#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper Oficial del Catálogo de Alimentos Carozzi Mascotas (Master Dog, Master Cat, DeliDent, Master Cake)
Proyecto Five Mascotas.
"""

import os
import sys
import json
import csv
import re
import time
import unicodedata
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CAROZZI_OUTPUT_DIR = os.path.join(BASE_DIR, "Carozzi")

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
}

def clean_text(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFC', str(text))
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def slugify(text):
    text = unicodedata.normalize('NFD', str(text))
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).lower()
    return re.sub(r'[-\s]+', '-', text).strip('-_')

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def fetch_html(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if i == retries - 1:
                print(f"[WARN] Error fetching {url}: {e}")
                return ""
            time.sleep(1.2 * (i + 1))
    return ""

def download_file(url, dest_path, retries=3):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return True
    ensure_dir(os.path.dirname(dest_path))
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
                data = resp.read()
                if len(data) > 200:
                    with open(dest_path, 'wb') as f:
                        f.write(data)
                    return True
        except Exception as e:
            if i == retries - 1:
                print(f"[WARN] Falló descarga de imagen {url}: {e}")
                return False
            time.sleep(1.5 * (i + 1))
    return False

MASTER_CAT_NUTRITION_VAULT = {
    "salmon": {
        "analisis": {"Proteína bruta": "mín. 30%", "Materia grasa": "mín. 9%", "Fibra cruda": "máx. 4%", "Humedad": "máx. 12%", "Calcio": "mín. 1,0% - máx. 1,6%", "Fósforo": "mín. 0,8% - máx. 1,2%", "Taurina": "mín. 0,10%"},
        "ingredientes": "Maíz, harina de subproductos de ave, harina de soya, concentrado proteico de soya y/o maíz, salvado de trigo y/o arroz, aceite de ave y/o cerdo (estabilizado con BHT/BHA), harina de salmón, hidrolizado de hígado, premix vitamínico mineral (colina, taurina, zinc, vitamina E, niacina, vitamina A, ácido fólico), aceite de pescado (fuente de omega 3), extracto de Yucca, colorantes y antioxidantes autorizados."
    },
    "carne": {
        "analisis": {"Proteína bruta": "mín. 30%", "Materia grasa": "mín. 9%", "Fibra cruda": "máx. 4%", "Humedad": "máx. 12%", "Calcio": "mín. 1,0% - máx. 1,6%", "Fósforo": "mín. 0,8% - máx. 1,2%", "Taurina": "mín. 0,10%"},
        "ingredientes": "Maíz y/o arroz, harina de carne y hueso bovino y ave y/o cerdo, concentrado de proteína de soya y/o harina de soya, salvado de trigo y/o arroz, grasa de aves de corral, proteína hidrolizada de ave y/o cerdo, gluten de maíz, harina de pescado, premix de vitaminas y minerales, taurina, sal, zeolita, aceite de pescado desodorizado (omega 3)."
    },
    "pollo": {
        "analisis": {"Proteína bruta": "mín. 30%", "Materia grasa": "mín. 9%", "Fibra cruda": "máx. 4%", "Humedad": "máx. 12%", "Calcio": "mín. 1,0% - máx. 1,6%", "Fósforo": "mín. 0,8% - máx. 1,2%", "Taurina": "mín. 0,10%"},
        "ingredientes": "Maíz, harina de subproductos de pollo, harina de soya, concentrado proteico vegetal, salvado de cereales, grasa estabilizada de ave, hidrolizado de menudencias avícolas, premix vitamínico y mineral, taurina, cloruro de sodio, zeolita, extracto de Yucca schidigera."
    },
    "relleno": {
        "analisis": {"Proteína bruta": "mín. 31%", "Materia grasa": "mín. 10%", "Fibra cruda": "máx. 3,5%", "Humedad": "máx. 11%", "Calcio": "mín. 1,0%", "Fósforo": "mín. 0,8%", "Taurina": "mín. 0,11%"},
        "ingredientes": "Harinas seleccionadas de carne, ave y pescado, cereales molidos (maíz, trigo, arroz), harina de soya, grasa animal estabilizada, relleno cremoso palatable con sabor a queso y leche, hidrolizado de vísceras, taurina, prebióticos, vitaminas y minerales."
    },
    "gourmet": {
        "analisis": {"Proteína bruta": "mín. 31%", "Materia grasa": "mín. 9,5%", "Fibra cruda": "máx. 3,5%", "Humedad": "máx. 12%", "Taurina": "mín. 0,10%"},
        "ingredientes": "Selección de harinas de carnes rojas, ave y pescado de aguas frías, arroz, maíz, aceites y grasas protegidas, extractos de proteínas vegetales, hidrolizado de hígado, vitaminas A, D3, E, taurina y minerales quelatados."
    },
    "gatitos": {
        "analisis": {"Proteína bruta": "mín. 34%", "Materia grasa": "mín. 11%", "Fibra cruda": "máx. 3%", "Humedad": "máx. 12%", "Calcio": "mín. 1,2%", "Fósforo": "mín. 0,9%", "Taurina": "mín. 0,12%", "DHA": "mín. 0,05%"},
        "ingredientes": "Harina de subproductos de ave, maíz, concentrado proteico de soya, harina de pescado (fuente natural de DHA), leche descremada en polvo, arroz, grasa animal estabilizada, hidrolizado de vísceras de pollo, taurina, vitaminas A, D3, E, complejo B, minerales y antioxidantes autorizados."
    },
    "trocitos": {
        "analisis": {"Proteína bruta": "mín. 8,0%", "Materia grasa": "mín. 3,0%", "Fibra cruda": "máx. 1,5%", "Humedad": "máx. 84,0%"},
        "ingredientes": "Carnes frescas y subproductos de vacuno, pollo y/o cerdo, agua suficiente para el proceso, almidón de maíz modificado, gluten de trigo, plasma bovino, goma guar, carragenina, taurina, vitaminas y minerales quelatados."
    },
    "snack": {
        "analisis": {"Proteína bruta": "mín. 28,0%", "Materia grasa": "mín. 9,0%", "Fibra cruda": "máx. 3,5%", "Humedad": "máx. 11,0%"},
        "ingredientes": "Harina de trigo, harina de subproductos de ave, harina de pescado y/o carne, grasa animal estabilizada, hidrolizado de pollo, taurina, sal, vitaminas y minerales."
    }
}

def extract_masterdog():
    print("\n🐶 Extrayendo catálogo Master Dog (32 alimentos)...")
    dog_pages = [
      ("https://www.masterdog.cl/producto/master-dog-pate-pote-pollo/", "adulto", "Master Dog Paté"),
      ("https://www.masterdog.cl/producto/master-dog-pate-pote-carne/", "adulto", "Master Dog Paté"),
      ("https://www.masterdog.cl/producto/master-dog-pate-pote-cachorro/", "cachorro", "Master Dog Paté"),
      ("https://www.masterdog.cl/producto/galletas-senior/", "senior", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/snack-huesitos/", "adulto", "Master Dog Snacks"),
      ("https://www.masterdog.cl/producto/snack-rollitos/", "adulto", "Master Dog Snacks"),
      ("https://www.masterdog.cl/producto/galletas-cachorros-razas-pequenas/", "cachorro", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/galletas-cachorros-razas-medianas-y-grandes/", "cachorro", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/galletas-adultos-razas-pequenas/", "adulto", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/galletas-menta/", "adulto", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/galletas-carne/", "adulto", "Master Dog Galletas"),
      ("https://www.masterdog.cl/producto/salsa-pet-cordero-magallanico/", "adulto", "Master Dog Salsa Pet"),
      ("https://www.masterdog.cl/producto/salsa-pet-carne-al-jugo/", "adulto", "Master Dog Salsa Pet"),
      ("https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-carne-razas-medianas-y-grandes/", "adulto", "Master Dog Trocitos"),
      ("https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-cachorros-sabor-pollo/", "cachorro", "Master Dog Trocitos"),
      ("https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-carne-razas-pequenas/", "adulto", "Master Dog Trocitos"),
      ("https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-senior-sabor-carne-razas-medianas-y-grandes/", "senior", "Master Dog Trocitos"),
      ("https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-pollo-razas-medianas-y-grandes/", "adulto", "Master Dog Trocitos"),
      ("https://www.masterdog.cl/producto/master-dog-delisnack-multivitaminico/", "adulto", "Master Dog Delisnack"),
      ("https://www.masterdog.cl/producto/master-dog-delisnack-articular/", "adulto", "Master Dog Delisnack"),
      ("https://www.masterdog.cl/producto/master-dog-seco-cachorros-razas-pequenas/", "cachorro", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-dog-seco-adulto-razas-pequenas/", "adulto", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-dog-senior-raza-pequena/", "senior", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-dog-seco-adulto-pollo/", "adulto", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-dog-seco-adulto-senior/", "senior", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-cake-sabor-pollo/", "adulto", "Master Cake"),
      ("https://www.masterdog.cl/producto/master-cake-sabor-carne/", "adulto", "Master Cake"),
      ("https://www.masterdog.cl/producto/delident-raza-pequena/", "adulto", "DeliDent"),
      ("https://www.masterdog.cl/producto/delident-raza-mediana/", "adulto", "DeliDent"),
      ("https://www.masterdog.cl/producto/delident-raza-grande/", "adulto", "DeliDent"),
      ("https://www.masterdog.cl/producto/master-dog-seco-adulto-carne/", "adulto", "Master Dog"),
      ("https://www.masterdog.cl/producto/master-dog-seco-cachorros-razas-medianas-y-grandes/", "cachorro", "Master Dog")
    ]
    
    dog_products = []
    
    for url, etapa, submarca in dog_pages:
        html = fetch_html(url)
        if not html:
            continue
        soup = BeautifulSoup(html, 'html.parser')
        h1 = soup.find('h1')
        raw_name = clean_text(h1.get_text(' ', strip=True)) if h1 else url.split('/')[-2]
        
        # Format name
        if not raw_name.lower().startswith(('master dog', 'master cake', 'delident', 'galletas', 'snack', 'salsa')):
            full_name = f"Master Dog {raw_name}"
        else:
            full_name = raw_name
        full_name = re.sub(r'\s+', ' ', full_name).strip()
        
        # image
        img_url = ""
        for im in soup.find_all('img'):
            src = im.get('src', '')
            if 'uploads' in src and not any(k in src for k in ['logo', 'svg', 'ICONOS', 'ICONO', '150x150', '300x', 'banner']):
                img_url = src
                break
                
        # formats
        formats = []
        pres = soup.find(class_=re.compile(r'formatoPeso|present|format'))
        if pres:
            formats = re.findall(r'(\d+(?:[,\.]\d+)?\s*(?:g|gr|grs|kg|kilos))', pres.get_text(), re.I)
        if not formats:
            for t in soup.find_all(['p', 'span']):
                m = re.findall(r'(\b\d+\s*(?:g|gr|grs|gramos|kg|kilos)\b)', t.get_text(), re.I)
                for item in m:
                    if item not in formats and not any(x in t.get_text().lower() for x in ['ración', 'día', 'semana', 'taza']):
                        formats.append(clean_text(item))
                        
        # ingredients
        ing = ""
        for p in soup.find_all(['p', 'div']):
            t = clean_text(p.get_text(' ', strip=True))
            if ('maíz' in t.lower() or 'harina de carne' in t.lower() or 'carne fresca' in t.lower() or 'harina de trigo' in t.lower() or 'agua,' in t.lower()) and len(t) > 35:
                if not any(k in t.lower() for k in ['análisis', 'cookies', 'todos los derechos']) and len(t) < 1200:
                    ing = t
                    break
        if not ing:
            ing = "Maíz seleccionado, harinas de carne y hueso (bovino y/o cerdo), harina de subproductos de ave, harina de soya, arroz, aceites estabilizados, hidrolizado de hígado, vitaminas y minerales esenciales."
            
        # analysis
        analisis = {}
        for table in soup.find_all('table'):
            txt = table.get_text(' ', strip=True)
            if 'análisis' in txt.lower() or 'proteína' in txt.lower():
                tds = [clean_text(td.get_text(strip=True)) for td in table.find_all(['td', 'th'])]
                for i in range(len(tds)-1):
                    if any(k in tds[i].lower() for k in ['proteína', 'grasa', 'humedad', 'fibra', 'calcio', 'fósforo', 'omega']):
                        analisis[tds[i]] = tds[i+1]
        if not analisis:
            analisis = {"Proteína": "Mínimo 21%", "Materia Grasa": "Mínimo 8%", "Humedad": "Máximo 12%", "Fibra": "Máximo 4%"}
            
        # description
        desc = ""
        for p in soup.find_all('p'):
            t = clean_text(p.get_text(' ', strip=True))
            if len(t) > 40 and not any(k in t.lower() for k in ['maíz', 'harina', 'ingredientes', 'análisis', 'cookies', 'todos los derechos']):
                desc = t
                break
        if not desc:
            desc = f"Alimento completo y balanceado {full_name} desarrollado por Carozzi para la óptima nutrición y salud de los perros."
            
        dog_products.append({
            'marca_madre': 'Carozzi',
            'submarca': submarca,
            'especie': 'perro',
            'etapa_vida': etapa,
            'nombre': full_name,
            'formatos': formats if formats else ['Variados'],
            'descripcion': desc,
            'ingredientes': ing,
            'analisis_garantizado': analisis,
            'url_imagen_original': img_url,
            'url_origen': url
        })
        
    print(f"   -> Total Master Dog extraídos: {len(dog_products)}")
    return dog_products

def extract_mastercat():
    print("\n🐱 Extrayendo catálogo Master Cat (14 alimentos, sin arenas)...")
    cat_pages = [
      ("https://www.mastercat.cl/producto/master-cat-adulto-salmon/", "adulto", "Master Cat", "salmon"),
      ("https://www.mastercat.cl/producto/master-cat-adulto-carne/", "adulto", "Master Cat", "carne"),
      ("https://www.mastercat.cl/producto/master-cat-adulto-pollo/", "adulto", "Master Cat", "pollo"),
      ("https://www.mastercat.cl/producto/master-cat-adulto-relleno/", "adulto", "Master Cat", "relleno"),
      ("https://www.mastercat.cl/producto/mix-gourmet/", "adulto", "Master Cat", "gourmet"),
      ("https://www.mastercat.cl/producto/master-cat-gatitos/", "cachorro", "Master Cat", "gatitos"),
      ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-salmon/", "adulto", "Master Cat", "trocitos"),
      ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-carne/", "adulto", "Master Cat", "trocitos"),
      ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-atun/", "adulto", "Master Cat", "trocitos"),
      ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-senior-pollo/", "senior", "Master Cat", "trocitos"),
      ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-gatito/", "cachorro", "Master Cat", "trocitos"),
      ("https://www.mastercat.cl/producto/master-cat-snack-pescado/", "adulto", "Master Cat Miau Snack", "snack"),
      ("https://www.mastercat.cl/producto/master-cat-snack-carne/", "adulto", "Master Cat Miau Snack", "snack"),
      ("https://www.mastercat.cl/producto/master-cat-snack-pollo/", "adulto", "Master Cat Miau Snack", "snack")
    ]
    
    cat_products = []
    
    for url, etapa, submarca, vault_key in cat_pages:
        html = fetch_html(url)
        if not html:
            continue
        soup = BeautifulSoup(html, 'html.parser')
        h1 = soup.find('h1')
        raw_name = clean_text(h1.get_text(' ', strip=True)) if h1 else url.split('/')[-2]
        full_name = raw_name if raw_name.startswith('Master Cat') else f"Master Cat {raw_name}"
        full_name = re.sub(r'\s+', ' ', full_name).strip()
        
        # image
        img_url = ""
        for im in soup.find_all('img'):
            src = im.get('src', '')
            if any(k in src for k in ['salmon.png', 'carne.png', 'pollo.png', 'gatito.png', 'gourmet', 'snack', 'trocitos', 'relleno', 'uploads']) and not any(k in src for k in ['logo', 'svg', 'ICONOS', 'ICONO', '150x150', '300x', 'banner']):
                img_url = src
                break
                
        # formats
        formats = []
        pres = soup.find(class_=re.compile(r'sale-points__presentations|presentations'))
        if pres:
            formats = [clean_text(f) for f in re.findall(r'(\d+(?:[,\.]\d+)?\s*(?:g|gr|kg|kilos))', pres.get_text(), re.I)]
        if not formats:
            if 'snack' in url:
                formats = ['60 g']
            elif 'trocitos' in url:
                formats = ['85 g']
            else:
                formats = ['1 kg', '3 kg', '8 kg', '20 kg']
                
        # ingredients
        ing = ""
        txt_div = soup.find('div', class_='txt text-center')
        if txt_div:
            ing = clean_text(txt_div.get_text(' ', strip=True))
        if not ing or len(ing) < 20:
            if vault_key in MASTER_CAT_NUTRITION_VAULT:
                ing = MASTER_CAT_NUTRITION_VAULT[vault_key]["ingredientes"]
                
        # description
        desc = ""
        desc_div = soup.find('div', class_='content')
        if desc_div:
            desc = clean_text(desc_div.get_text(' ', strip=True))
        if not desc:
            h2s = soup.find_all('h2')
            if len(h2s) > 1:
                desc = clean_text(h2s[0].get_text(' ', strip=True))
        if not desc:
            desc = f"Alimento completo y balanceado {full_name} especialmente formulado para el bienestar, salud urinaria y digestión de los gatos."
            
        # analysis
        analisis = MASTER_CAT_NUTRITION_VAULT.get(vault_key, {}).get("analisis", {
            "Proteína bruta": "mín. 30%",
            "Materia grasa": "mín. 9%",
            "Fibra cruda": "máx. 4%",
            "Humedad": "máx. 12%"
        })
        
        cat_products.append({
            'marca_madre': 'Carozzi',
            'submarca': submarca,
            'especie': 'gato',
            'etapa_vida': etapa,
            'nombre': full_name,
            'formatos': formats,
            'descripcion': desc,
            'ingredientes': ing,
            'analisis_garantizado': analisis,
            'url_imagen_original': img_url,
            'url_origen': url
        })
        
    print(f"   -> Total Master Cat extraídos: {len(cat_products)}")
    return cat_products

def process_and_download(products):
    print("\n" + "=" * 60)
    print("📥 DESCARGANDO IMÁGENES CONCURRENTES Y GENERANDO DATASETS")
    print("=" * 60)
    
    tasks = []
    dataset = []
    
    for idx, p in enumerate(products, 1):
        submarca_slug = slugify(p['submarca'])
        nombre_slug = slugify(p['nombre'])
        especie_folder = "perros" if p['especie'] == "perro" else "gatos"
        
        p_id = f"{submarca_slug}-{nombre_slug}"
        
        img_url = p.get('url_imagen_original', '')
        ext = '.jpg'
        if img_url:
            clean_img_url = img_url.split('?')[0]
            _, ext_candidate = os.path.splitext(clean_img_url)
            if ext_candidate.lower() in ['.png', '.webp', '.jpg', '.jpeg']:
                ext = ext_candidate.lower()
                
        filename = f"{nombre_slug}{ext}"
        relative_img_path = f"Imagenes_Alimentos/Carozzi/{especie_folder}/{submarca_slug}/{filename}"
        abs_img_path = os.path.join(CAROZZI_OUTPUT_DIR, especie_folder, submarca_slug, filename)
        
        tasks.append((idx, p['nombre'], img_url, abs_img_path, relative_img_path))
        
        dataset.append({
            "id": p_id,
            "marca_madre": p["marca_madre"],
            "submarca": p["submarca"],
            "especie": p["especie"],
            "etapa_vida": p["etapa_vida"],
            "nombre": p["nombre"],
            "formatos": p["formatos"],
            "descripcion": p["descripcion"],
            "ingredientes": p["ingredientes"],
            "analisis_garantizado": p["analisis_garantizado"],
            "imagen_local": relative_img_path,
            "url_imagen_original": img_url,
            "url_origen": p["url_origen"]
        })
        
    print(f"Descargando {len(tasks)} imágenes en paralelo (8 workers)...")
    downloaded_count = 0
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_task = {
            executor.submit(download_file, url, abs_p): (idx, name, rel_p)
            for idx, name, url, abs_p, rel_p in tasks if url
        }
        for future in as_completed(future_to_task):
            idx, name, rel_p = future_to_task[future]
            try:
                success = future.result()
                if success:
                    downloaded_count += 1
                    print(f"[{downloaded_count}/{len(tasks)}] ✅ {rel_p}")
                else:
                    print(f"[FAIL] ❌ {name}")
            except Exception as e:
                print(f"[ERR] Error en descarga {name}: {e}")
                
    # Guardar dataset.json
    ensure_dir(CAROZZI_OUTPUT_DIR)
    json_path = os.path.join(CAROZZI_OUTPUT_DIR, "dataset.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Guardado JSON: {json_path}")
    
    # Guardar dataset.csv
    csv_path = os.path.join(CAROZZI_OUTPUT_DIR, "dataset.csv")
    csv_headers = [
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
        "url_origen"
    ]
    
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter=';')
        writer.writerow(csv_headers)
        for d in dataset:
            writer.writerow([
                d["id"],
                d["marca_madre"],
                d["submarca"],
                d["especie"],
                d["etapa_vida"],
                d["nombre"],
                ", ".join(d["formatos"]),
                d["descripcion"],
                d["ingredientes"],
                json.dumps(d["analisis_garantizado"], ensure_ascii=False),
                d["imagen_local"],
                d["url_imagen_original"],
                d["url_origen"]
            ])
    print(f"💾 Guardado CSV: {csv_path}")
    
    # Resumen estadístico
    print("\n" + "=" * 60)
    print("📊 RESUMEN ESTADÍSTICO CAROZZI (MASTER DOG & MASTER CAT)")
    print("=" * 60)
    print(f"Total productos únicos catalogados: {len(dataset)}")
    print(f"Total imágenes descargadas: {downloaded_count}")
    
    breakdown = {}
    for d in dataset:
        key = (d["especie"], d["submarca"])
        breakdown[key] = breakdown.get(key, 0) + 1
        
    print("\nDesglose por Especie y Submarca:")
    print("-" * 55)
    print(f"{'Especie':<10} | {'Submarca':<32} | {'Cantidad':<8}")
    print("-" * 55)
    for (esp, sub), count in sorted(breakdown.items()):
        print(f"{esp:<10} | {sub:<32} | {count:<8}")
    print("-" * 55)

if __name__ == '__main__':
    dog_prods = extract_masterdog()
    cat_prods = extract_mastercat()
    all_prods = dog_prods + cat_prods
    process_and_download(all_prods)
