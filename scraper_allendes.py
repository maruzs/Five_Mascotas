import os
import sys
import json
import csv
import re
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
import requests
import unicodedata

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

BASE_DIR = 'Imagenes_Alimentos/AllendesHnos'
os.makedirs(f'{BASE_DIR}/perros', exist_ok=True)
os.makedirs(f'{BASE_DIR}/gatos', exist_ok=True)

with open('allendes_raw.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from allendes_raw.json")

def process_product(p):
    name = p.get('name', '').strip()
    name_lower = name.lower()
    cats = [c['name'] for c in p.get('categories', [])]
    cats_str = ' '.join(cats).lower()
    slugs = [c['slug'] for c in p.get('categories', [])]
    slugs_str = ' '.join(slugs).lower()
    desc_html = (p.get('description', '') or '') + ' ' + (p.get('short_description', '') or '')
    desc_text = BeautifulSoup(desc_html, 'html.parser').get_text(' ', strip=True)
    
    # 1. Non-food checks
    if any(k in cats_str or k in slugs_str for k in ['arena', 'higiene', 'farmacia', 'antiparasitarios']):
        return None
    if any(k in name_lower for k in ['arena', 'suerox', 'pipeta', 'shampoo', 'sabanilla', 'adiestramiento', 'litera', 'collar', 'correa', 'comedero', 'bebedero', 'juguete', 'rascador']):
        return None
    if any(k in name_lower for k in ['conejo', 'canarios', 'catas', 'alpiste', 'roedores']):
        return None
        
    # 2. Species determination
    especie = None
    if 'gatos' in cats_str or 'gato' in cats_str or 'cat' in slugs_str or 'gato' in slugs_str:
        especie = 'gato'
    elif 'perros' in cats_str or 'perro' in cats_str or 'dog' in slugs_str or 'perro' in slugs_str:
        especie = 'perro'
        
    if not especie:
        if any(k in name_lower for k in ['cat', 'gato', 'felin', 'kitten', 'sabrocat', 'felinnes', 'maxicat', 'mastercat', 'champion cat', 'charly']):
            especie = 'gato'
        elif any(k in name_lower for k in ['dog', 'perro', 'canin', 'puppy', 'cachupin', 'sabrokan', 'cannes', 'masterdog', 'champion dog', 'canito', 'guau']):
            especie = 'perro'
            
    if not especie:
        if 'gato' in desc_text.lower() or 'felin' in desc_text.lower():
            especie = 'gato'
        elif 'perro' in desc_text.lower() or 'canin' in desc_text.lower():
            especie = 'perro'
            
    if not especie:
        return None
        
    # 3. Life stage determination
    etapa = 'adulto'
    if any(k in name_lower or k in cats_str for k in ['cachorro', 'puppy', 'kitten', 'starter', 'baby', 'criadores cachorro']):
        etapa = 'cachorro'
    elif any(k in name_lower or k in cats_str for k in ['senior', 'mature', 'ageing', 'geriatric', 'edad avanzada', '7+', '8+', '12+']):
        etapa = 'senior'
    elif any(k in name_lower or k in cats_str for k in ['adult', 'adulto']):
        etapa = 'adulto'
        
    # 4. Brand / Submarca
    attrs = {a['name']: [t['name'] for t in a['terms']] for a in p.get('attributes', [])}
    marca_attr = attrs.get('Marcas', [])
    marca = marca_attr[0].strip() if marca_attr else ''
    
    if not marca:
        for known_brand in [
            'Royal Canin', 'Pedigree', 'Whiskas', 'MasterDog', 'MasterCat', 'Cannes',
            'Champion Dog', 'Champion Cat', 'Stay Happy', 'Can', 'Raza', 'Animal Planet Nutribalance',
            'Felinnes', 'Cat Chow', 'Dog Chow', 'Juvenia', 'Top One', 'Cachupin', 'Dog Buffet',
            'Biomaster', 'Nómade', 'BlackDog', 'Best Balance', 'Pro Plan', 'Sabrokan', 'Cat Buffet',
            'Charly', 'Canito', 'Full Cat', 'Full Dog', 'Voller', 'Sabrocat', 'Tyson', 'Guau Forte',
            'Don Cucho', 'Doko', 'Gati', 'Masko Can', 'Masko Cat', 'Masko Cachorro', 'Masko',
            'Dog Selection Criadores', 'Dog Selection'
        ]:
            if known_brand.lower() in name_lower:
                marca = known_brand
                break
    if not marca:
        marca = name.split()[0]
        
    # 5. Formats
    formatos = attrs.get('Formato', [])
    if not formatos:
        matches = re.findall(r'(\d+(?:[.,]\d+)?\s*(?:kg|kilos?|k|gr|g|und|sticks?|un))\b', name, re.IGNORECASE)
        if matches:
            formatos = [m.strip() for m in matches]
        else:
            formatos = ['Estándar']
            
    # 6. Description, Ingredients, Guaranteed Analysis
    ingredientes = ''
    analisis = {}
    
    ing_match = re.search(r'(?:ingredientes|composición)[\s:]+(.*?)(?:análisis|analisis|guía|modo de empleo|beneficios|$)', desc_text, re.IGNORECASE | re.DOTALL)
    if ing_match:
        ing_clean = ing_match.group(1).strip()
        if len(ing_clean) > 10:
            ingredientes = ing_clean[:1000]
            
    prot_match = re.search(r'prote[íi]na[s]?\s*(?:cruda|m[íi]nima|total)?[\s:]+(\d+(?:[.,]\d+)?\s*%)', desc_text, re.IGNORECASE)
    if prot_match:
        analisis['Proteína'] = prot_match.group(1)
    grasa_match = re.search(r'(?:grasa|materia grasa|l[íi]pidos)\s*(?:cruda|m[íi]nima|total)?[\s:]+(\d+(?:[.,]\d+)?\s*%)', desc_text, re.IGNORECASE)
    if grasa_match:
        analisis['Grasa'] = grasa_match.group(1)
    fibra_match = re.search(r'fibra\s*(?:cruda|m[áa]xima)?[\s:]+(\d+(?:[.,]\d+)?\s*%)', desc_text, re.IGNORECASE)
    if fibra_match:
        analisis['Fibra'] = fibra_match.group(1)
    hum_match = re.search(r'humedad\s*(?:m[áa]xima)?[\s:]+(\d+(?:[.,]\d+)?\s*%)', desc_text, re.IGNORECASE)
    if hum_match:
        analisis['Humedad'] = hum_match.group(1)
        
    # 7. Images
    images = p.get('images', [])
    img_url = images[0]['src'] if images else ''
    
    # Clean description
    clean_desc = desc_text if desc_text else f'Alimento completo y balanceado {name} distribuido por Allendes Hermanos.'
    
    # Build slug / id
    brand_slug = slugify(marca)
    name_slug = slugify(name)
    item_id = f'{brand_slug}-{name_slug}'
    
    return {
        'id': item_id,
        'marca_madre': 'Allendes Hnos',
        'submarca': marca,
        'submarca_folder': brand_slug,
        'especie': especie,
        'etapa_vida': etapa,
        'nombre': name,
        'formatos': formatos,
        'descripcion': clean_desc,
        'ingredientes': ingredientes,
        'analisis_garantizado': analisis,
        'url_imagen_original': img_url,
        'url_origen': p.get('permalink', ''), 'product_id': p.get('id', '')
    }

records = []
for p in products:
    rec = process_product(p)
    if rec:
        records.append(rec)

print(f"Total eligible food products: {len(records)}")

# Make directories and download images concurrently
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20, max_retries=3)
session.mount('https://', adapter)
session.mount('http://', adapter)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def download_item(item):
    especie_dir = 'perros' if item['especie'] == 'perro' else 'gatos'
    sub_dir = f"{BASE_DIR}/{especie_dir}/{item['submarca_folder']}"
    os.makedirs(sub_dir, exist_ok=True)
    
    img_url = item['url_imagen_original']
    if not img_url:
        item['imagen_local'] = ''
        return item
        
    ext = os.path.splitext(urlparse(img_url).path)[1]
    if not ext or len(ext) > 5:
        ext = '.webp'
    img_filename = f"{item['id'][:55]}-{item.get('product_id', '')}{ext}"
    local_path = f"{sub_dir}/{img_filename}"
    
    if not os.path.exists(local_path) or os.path.getsize(local_path) == 0:
        try:
            r = session.get(img_url, headers=headers, timeout=20)
            if r.status_code == 200:
                with open(local_path, 'wb') as f:
                    f.write(r.content)
            else:
                print(f"Failed image {img_url}: status {r.status_code}")
        except Exception as e:
            print(f"Error downloading {img_url}: {e}")
            
    item['imagen_local'] = local_path
    return item

print("Downloading images concurrently (15 workers)...")
with ThreadPoolExecutor(max_workers=15) as executor:
    final_records = list(executor.map(download_item, records))

print(f"Completed downloading images. Saving datasets...")

# Clean records for output (remove submarca_folder)
output_records = []
for r in final_records:
    out = {
        'id': r['id'],
        'marca_madre': r['marca_madre'],
        'submarca': r['submarca'],
        'especie': r['especie'],
        'etapa_vida': r['etapa_vida'],
        'nombre': r['nombre'],
        'formatos': r['formatos'],
        'descripcion': r['descripcion'],
        'ingredientes': r['ingredientes'],
        'analisis_garantizado': r['analisis_garantizado'],
        'imagen_local': r['imagen_local'],
        'url_imagen_original': r['url_imagen_original'],
        'url_origen': r['url_origen']
    }
    output_records.append(out)

# Save JSON
with open(f'{BASE_DIR}/dataset.json', 'w', encoding='utf-8') as f:
    json.dump(output_records, f, ensure_ascii=False, indent=2)

# Save CSV
csv_headers = ['id', 'marca_madre', 'submarca', 'especie', 'etapa_vida', 'nombre', 'formatos', 'descripcion', 'ingredientes', 'analisis_garantizado', 'imagen_local', 'url_imagen_original', 'url_origen']
with open(f'{BASE_DIR}/dataset.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    writer.writerow(csv_headers)
    for r in output_records:
        writer.writerow([
            r['id'],
            r['marca_madre'],
            r['submarca'],
            r['especie'],
            r['etapa_vida'],
            r['nombre'],
            json.dumps(r['formatos'], ensure_ascii=False),
            r['descripcion'],
            r['ingredientes'],
            json.dumps(r['analisis_garantizado'], ensure_ascii=False),
            r['imagen_local'],
            r['url_imagen_original'],
            r['url_origen']
        ])

print(f"Successfully generated {BASE_DIR}/dataset.json and {BASE_DIR}/dataset.csv")
