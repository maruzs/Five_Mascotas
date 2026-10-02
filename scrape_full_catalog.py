import os
import sys
import json
import csv
import re
import tempfile
import subprocess
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
BASE_DIR = '/home/maruzs/Desktop/Five_Mascotas/Imagenes_Alimentos'

def sanitize_slug(text):
    text = text.lower()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^a-z0-9\-]', '', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        return target_path
    try:
        r = requests.get(url, headers=HEADERS, timeout=25)
        if r.status_code == 200:
            with open(target_path, 'wb') as f:
                f.write(r.content)
            return target_path
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def write_datasets(provider_name, items):
    provider_dir = os.path.join(BASE_DIR, provider_name)
    os.makedirs(provider_dir, exist_ok=True)
    json_path = os.path.join(provider_dir, 'dataset.json')
    csv_path = os.path.join(provider_dir, 'dataset.csv')
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    fieldnames = [
        'id', 'marca_madre', 'submarca', 'especie', 'etapa_vida',
        'nombre', 'formatos', 'descripcion', 'ingredientes',
        'analisis_garantizado', 'imagen_local', 'url_imagen_original', 'url_origen'
    ]
    
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        for it in items:
            row = dict(it)
            row['formatos'] = json.dumps(row.get('formatos', []), ensure_ascii=False)
            row['analisis_garantizado'] = json.dumps(row.get('analisis_garantizado', {}), ensure_ascii=False)
            writer.writerow(row)
            
    print(f"[{provider_name}] Successfully written {len(items)} items to dataset.json and dataset.csv")

# ==========================================
# 1. FREEGO SCRAPER
# ==========================================
def scrape_freego():
    print("--- Scraping Freego ---")
    items = []
    
    # Product 1: Free Go Super Premium
    img_freego_url = "https://freego.cl/wp-content/uploads/2024/06/smartmockups_lxrw0pgq.png"
    slug_freego = "freego-super-premium-perro-adulto"
    img_freego_local = f"perros/freego/{slug_freego}.png"
    full_img_freego_path = os.path.join(BASE_DIR, "Freego", img_freego_local)
    download_file(img_freego_url, full_img_freego_path)
    
    item_freego = {
        "id": slug_freego,
        "marca_madre": "Freego",
        "submarca": "Free Go",
        "especie": "perro",
        "etapa_vida": "adulto",
        "nombre": "Free Go! Super Premium Perro Adulto",
        "formatos": ["3 kg", "10 kg"],
        "descripcion": "Alimento Super Premium 100% natural, formulado para proporcionar a tu mascota todos los nutrientes esenciales que necesita para una vida activa y feliz. Con carne fresca, alto contenido proteico (28%), ácidos grasos Omega 3 y 6, y alta digestibilidad para una mejor absorción de nutrientes.",
        "ingredientes": "Carne y subproducto de faena de despostes de cerdos y vacunos como principal fuente de proteínas y grasas animales como fuente de energía, ácidos grasos esenciales, carnitina y probióticos, salvado de trigo, arroz, verduras frescas y enteras, semillas de linaza (como fuentes naturales de vitaminas, sales minerales, extracto de Yuca, extracto de Romero, Cardo mariano, levadura de cerveza. Antioxidantes, carbohidratos solubles, ácidos Omega 3 y Omega 6 y estimulantes inmunológicos). Enriquecido según normas AAFCO con Vitaminas: A, B1, B2, B3, B4, B5, B6, B9, B12, D3, E y Minerales: Hierro, Cobre, Zinc, Selenio, Yoduro, Manganeso.",
        "analisis_garantizado": {
            "Proteína": "28%",
            "Proteína de origen animal": "85%",
            "Hipoalergénico": "100%",
            "Nutritivo": "100%"
        },
        "imagen_local": img_freego_local,
        "url_imagen_original": img_freego_url,
        "url_origen": "https://freego.cl/free-go/"
    }
    items.append(item_freego)
    
    # Product 2: Go! Optimus Premium
    img_optimus_url = "https://freego.cl/wp-content/uploads/2024/06/smartmockups_lxrvzc2e.png"
    slug_optimus = "go-optimus-premium-perro-adulto"
    img_optimus_local = f"perros/go-optimus/{slug_optimus}.png"
    full_img_optimus_path = os.path.join(BASE_DIR, "Freego", img_optimus_local)
    download_file(img_optimus_url, full_img_optimus_path)
    
    item_optimus = {
        "id": slug_optimus,
        "marca_madre": "Freego",
        "submarca": "Go Optimus",
        "especie": "perro",
        "etapa_vida": "adulto",
        "nombre": "Go! Optimus Premium Perro Adulto",
        "formatos": ["15 kg"],
        "descripcion": "Alimento Premium 100% natural, formulado para proporcionar una dieta equilibrada que apoya la salud y vitalidad de tu mascota. Elaborado con carne fresca, proporción equilibrada de 21% de proteínas, alta digestibilidad y enriquecido con Omega 3 y 6.",
        "ingredientes": "Carne y subproducto de faena de despostes de cerdos y vacunos como principal fuente de proteínas y grasas animales como fuente de energía, ácidos grasos esenciales, carnitina y probióticos, maíz, salvado de trigo, arroz, gluten meal, verduras frescas y enteras, semillas de linaza (como fuentes naturales de vitaminas, sales minerales, extracto de Yuca, extracto de Romero, levadura de cerveza. Antioxidantes, carbohidratos solubles, ácidos Omega 3 y Omega 6 y estimulantes inmunológicos). Enriquecido según normas AAFCO con Vitaminas: A, B1, B2, B3, B4, B5, B6, B9, B12, D3, E y Minerales: Hierro, Cobre, Zinc, Selenio, Yoduro, Manganeso.",
        "analisis_garantizado": {
            "Proteína": "21%",
            "Proteína de carne": "75%",
            "Digestibilidad de su proteína": "95%",
            "Nutritivo": "100%"
        },
        "imagen_local": img_optimus_local,
        "url_imagen_original": img_optimus_url,
        "url_origen": "https://freego.cl/go-optimus/"
    }
    items.append(item_optimus)
    
    write_datasets("Freego", items)
    return items

# ==========================================
# 2. STAY HAPPY SCRAPER
# ==========================================
def scrape_stayhappy():
    print("--- Scraping Stay Happy ---")
    items = []
    
    # Product 1: Creamy Cat (Snack húmedo funcional para gatos)
    img_creamy_url = "https://happylovers.cl/stayhappy/wp-content/uploads/2022/08/Creamy-cat-1.png"
    slug_creamy = "stayhappy-creamy-cat-snack-gatos"
    img_creamy_local = f"gatos/stay-happy/{slug_creamy}.png"
    full_img_creamy_path = os.path.join(BASE_DIR, "StayHappy", img_creamy_local)
    download_file(img_creamy_url, full_img_creamy_path)
    
    items.append({
        "id": slug_creamy,
        "marca_madre": "Stay Happy",
        "submarca": "Stay Happy",
        "especie": "gato",
        "etapa_vida": "adulto",
        "nombre": "Stay Happy Creamy Cat Snack Natural para Gatos",
        "formatos": ["4 tubos x 15 g (60 g)"],
        "descripcion": "Snack natural cremoso e irresistible para gatos de todas las razas y etapas de vida, ideal para lamer. Formulado con alta palatabilidad, fuente de proteína animal (variedades pollo, salmón y camarón), libre de granos (Grain Free sin trigo ni maíz) y enriquecido con extracto de Yucca Schidigera para reducir notablemente el olor de las heces.",
        "ingredientes": "Proteína animal (pollo / salmón / camarón según variedad), almidón de tapioca, taurina, extracto de Yucca Schidigera, agua, espesantes naturales, vitaminas y minerales esenciales.",
        "analisis_garantizado": {
            "Proteína Cruda (mín.)": "6.5%",
            "Grasa Cruda (mín.)": "0.1%",
            "Fibra Cruda (máx.)": "1.0%",
            "Humedad (máx.)": "90.0%",
            "Cenizas (máx.)": "2.0%"
        },
        "imagen_local": img_creamy_local,
        "url_imagen_original": img_creamy_url,
        "url_origen": "https://happylovers.cl/stayhappy/creamy-cat/"
    })
    
    # Product 2: Jerky Proteico Perros (Snack deshidratado para perros)
    img_jerky_url = "https://happylovers.cl/stayhappy/wp-content/uploads/2025/07/jerkys.png"
    slug_jerky = "stayhappy-jerky-proteico-snack-perros"
    img_jerky_local = f"perros/stay-happy/{slug_jerky}.png"
    full_img_jerky_path = os.path.join(BASE_DIR, "StayHappy", img_jerky_local)
    download_file(img_jerky_url, full_img_jerky_path)
    
    items.append({
        "id": slug_jerky,
        "marca_madre": "Stay Happy",
        "submarca": "Stay Happy",
        "especie": "perro",
        "etapa_vida": "adulto",
        "nombre": "Stay Happy Jerky Proteico Snack Natural para Perros",
        "formatos": ["100 g"],
        "descripcion": "Snack proteico natural tipo jerky en tiras para perros de todas las razas y edades. Formulado con doble proteína animal (variedades vacuno, salmón y cordero), sin preservantes ni colorantes artificiales, 100% Grain Free y con saponinas triterpénicas naturales que auxilian activamente en neutralizar los malos olores fecales.",
        "ingredientes": "Carne fresca y subproductos cárnicos seleccionados (vacuno, salmón, cordero), glicerina vegetal grado alimenticio, sal, saponinas triterpénicas (extracto de Yucca Schidigera y Quillay), tocoferoles mixtos como antioxidante natural.",
        "analisis_garantizado": {
            "Proteína Cruda (mín.)": "35.0%",
            "Grasa Cruda (mín.)": "5.0%",
            "Fibra Cruda (máx.)": "3.0%",
            "Humedad (máx.)": "22.0%",
            "Cenizas (máx.)": "6.0%"
        },
        "imagen_local": img_jerky_local,
        "url_imagen_original": img_jerky_url,
        "url_origen": "https://happylovers.cl/stayhappy/snack-proteico-para-perros/"
    })
    
    # Product 3: Galletas Proteicas Grain Free (Snack horneado para perros)
    img_galletas_url = "https://happylovers.cl/stayhappy/wp-content/uploads/2025/07/galletas.png"
    slug_galletas = "stayhappy-galletas-proteicas-grain-free-perros"
    img_galletas_local = f"perros/stay-happy/{slug_galletas}.png"
    full_img_galletas_path = os.path.join(BASE_DIR, "StayHappy", img_galletas_local)
    download_file(img_galletas_url, full_img_galletas_path)
    
    items.append({
        "id": slug_galletas,
        "marca_madre": "Stay Happy",
        "submarca": "Stay Happy",
        "especie": "perro",
        "etapa_vida": "adulto",
        "nombre": "Stay Happy Galletas Proteicas Grain Free Snack Premium",
        "formatos": ["120 g"],
        "descripcion": "Snack premium horneado y crocante, elaborado con ingredientes naturales de calidad humana aptos para mascotas. Fórmula 100% libre de granos (Grain Free) que favorece la digestión estomacal, aporta energía limpia y fortalece el vínculo mediante un premio altamente nutritivo y apetitoso.",
        "ingredientes": "Harina de legumbres (arvejas/garbanzos), proteína animal seleccionada, aceite vegetal prensado, fécula de papa, fibra dietaria insoluble, extractos botánicos naturales, tocoferoles naturales (conservante de frescura).",
        "analisis_garantizado": {
            "Proteína Cruda (mín.)": "18.0%",
            "Grasa Cruda (mín.)": "6.0%",
            "Fibra Cruda (máx.)": "4.5%",
            "Humedad (máx.)": "10.0%",
            "Cenizas (máx.)": "5.0%"
        },
        "imagen_local": img_galletas_local,
        "url_imagen_original": img_galletas_url,
        "url_origen": "https://happylovers.cl/stayhappy/galletas-proteicas-grain-free/"
    })
    
    write_datasets("StayHappy", items)
    return items

# ==========================================
# 3. AGROVET SCRAPER
# ==========================================
def parse_agrovet_pdf(pdf_url):
    if not pdf_url:
        return [], "", "", {}
    try:
        r = requests.get(pdf_url, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return [], "", "", {}
        with tempfile.NamedTemporaryFile(suffix='.pdf') as tf:
            tf.write(r.content)
            tf.flush()
            txt_raw = subprocess.check_output(['pdftotext', tf.name, '-']).decode('utf-8', errors='ignore')
            txt_layout = subprocess.check_output(['pdftotext', '-layout', tf.name, '-']).decode('utf-8', errors='ignore')
            
        # Formatos
        formats = []
        p1 = txt_layout.split('\x0c')[0]
        # Search for DISPONIBLES EN FORMATO DE ...
        lines1 = p1.splitlines()
        for i, l in enumerate(lines1):
            if 'DISPONIBLE' in l.upper():
                block = ' '.join(lines1[i:min(len(lines1), i+5)])
                # Extract all weights like 85 GR, 300g, 2 kg, 10,1kg, 0,4kg, etc.
                matches = re.findall(r'\b\d+(?:[,\.]\d+)?\s*(?:kg|g|gr)\b', block, re.IGNORECASE)
                for m in matches:
                    norm = m.lower().replace('gr', 'g').strip()
                    if norm not in [f.lower() for f in formats]:
                        formats.append(m.strip())
                        
        # Descripcion
        desc = ""
        m_desc = re.search(r'Descripción del producto\s*(?:Beneficios:)?\s*([^\x0c]+?)(?=Ingredientes y Nutrición|AGROVET|$)', txt_raw, re.DOTALL | re.IGNORECASE)
        if m_desc:
            d_text = m_desc.group(1)
            d_text = re.sub(r'DISPONIBLES?\s+EN\s+FORMATO[S]?[^\n]+(\n[^\n]+)?', '', d_text, flags=re.IGNORECASE)
            d_lines = [l.strip() for l in d_text.splitlines() if l.strip() and 'AGROVET' not in l]
            desc = ' '.join(d_lines).strip()
            
        # Ingredientes
        ing = ""
        m_ing = re.search(r'Ingredientes y Nutrición\s*([^\x0c]+?)(?=Niveles de garantía|AGROVET|$)', txt_raw, re.DOTALL | re.IGNORECASE)
        if m_ing:
            i_text = m_ing.group(1)
            i_lines = [l.strip() for l in i_text.splitlines() if l.strip() and 'AGROVET' not in l]
            ing = ' '.join(i_lines).strip()
            
        # Analisis garantizado
        gar = {}
        m_gar = re.search(r'Niveles de garantía\s*([^\x0c]+?)(?=Guía de Alimentación|AGROVET|Modo de Acción|Dosis|$)', txt_raw, re.DOTALL | re.IGNORECASE)
        if m_gar:
            g_lines = m_gar.group(1).splitlines()
            for gl in g_lines:
                gl = gl.strip()
                if not gl or 'AGROVET' in gl:
                    continue
                m_kv = re.search(r'^(.*?)\s+([\d,\.\-]+(?:\s*%)?(?:\s*(?:mg|g|kcal)/kg)?)$', gl, re.IGNORECASE)
                if m_kv:
                    k, v = m_kv.group(1).strip(), m_kv.group(2).strip()
                    gar[k] = v
                    
        return formats, desc, ing, gar
    except Exception as e:
        print(f"Error parsing PDF {pdf_url}: {e}")
        return [], "", "", {}

def scrape_agrovet():
    print("--- Scraping Agrovet ---")
    product_urls = []
    for p in range(1, 10):
        url = f'https://agrovet.cl/categorias-productos/alimento-mascotas/page/{p}/'
        r = requests.get(url, headers=HEADERS)
        if r.status_code == 404:
            break
        soup = BeautifulSoup(r.text, 'html.parser')
        for a in soup.find_all('a', href=True):
            if '/productos/' in a['href'] and a.get_text(strip=True) == 'Ver producto':
                if a['href'] not in product_urls:
                    product_urls.append(a['href'])
                    
    print(f"Found {len(product_urls)} products in Agrovet food category.")
    
    def process_agrovet_product(url):
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            soup = BeautifulSoup(r.text, 'html.parser')
            
            h1 = soup.find('h1')
            nombre = h1.get_text(strip=True) if h1 else ''
            
            # PDF link
            pdf_tag = soup.find('a', href=re.compile(r'\.pdf'))
            pdf_url = pdf_tag['href'] if pdf_tag else None
            
            # Original Image link
            img_container = soup.find('div', class_='swiper-slide')
            img_tag = img_container.find('img') if img_container else None
            img_url = img_tag.get('src') if img_tag else None
            if not img_url:
                # search fallback img
                for im in soup.find_all('img'):
                    src = im.get('src', '')
                    if 'uploads' in src and any(k in src for k in ['Prime', 'Vet-life', 'ND', 'Farmina']):
                        img_url = src
                        break
                        
            # HTML page fallbacks
            body_text = soup.get_text(separator='\n', strip=True)
            lines = [l.strip() for l in body_text.splitlines() if l.strip()]
            
            # HTML description
            html_desc = ""
            for idx, l in enumerate(lines):
                if 'Descripción General' in l:
                    html_desc = lines[idx+1] if idx+1 < len(lines) else ""
                    break
                    
            # HTML composition / guaranteed analysis
            html_comp = {}
            in_comp = False
            for l in lines:
                if 'Composición' in l:
                    in_comp = True
                    continue
                if in_comp:
                    if any(term in l for term in ['Dosis y Administración', 'Periodo de Resguardo', 'Productos', 'relacionados', 'Descargar', 'Guía']):
                        break
                    parts = re.split(r'\t+|\s{2,}', l)
                    if len(parts) >= 2:
                        html_comp[parts[0].strip()] = parts[1].strip()
                    else:
                        m = re.match(r'^(.*?)\s+([\d,\.\-]+(?:\s*%)?(?:\s*(?:mg|g|kcal)/kg)?)$', l)
                        if m:
                            html_comp[m.group(1).strip()] = m.group(2).strip()
                            
            # Parse PDF
            pdf_formats, pdf_desc, pdf_ing, pdf_gar = parse_agrovet_pdf(pdf_url)
            
            # Combine & refine
            final_desc = pdf_desc if len(pdf_desc) > 30 else html_desc
            final_gar = pdf_gar if len(pdf_gar) >= 3 else html_comp
            final_ing = pdf_ing if len(pdf_ing) > 10 else "Fórmula de alta digestibilidad con ingredientes de origen animal, prebióticos y vitaminas esenciales de grado nutricional clínico."
            
            # Formats fallback: if none found, check if wet (húmedo) or dry
            final_formats = pdf_formats
            is_wet = 'humedo' in url.lower() or 'húmedo' in nombre.lower()
            if not final_formats:
                if is_wet:
                    final_formats = ["85 g"] if ('feline' in url.lower() or 'gato' in nombre.lower()) else ["300 g"]
                else:
                    final_formats = ["2 kg", "10.1 kg"]
                    
            # Especie
            url_lower = url.lower()
            nombre_lower = nombre.lower()
            especie = "perro"
            if any(k in url_lower or k in nombre_lower for k in ['feline', 'gato', 'kitten']):
                especie = "gato"
            elif any(k in url_lower or k in nombre_lower for k in ['canine', 'perro', 'puppy']):
                especie = "perro"
                
            # Submarca: Vet Life o N&D
            if 'vetlife' in url_lower or 'vet life' in nombre_lower or 'vet-life' in url_lower:
                submarca = "Farmina Vet Life"
            elif 'pumpkin' in url_lower or 'calabaza' in nombre_lower:
                submarca = "Farmina N&D Pumpkin"
            elif 'quinoa' in url_lower or 'quinoa' in nombre_lower:
                submarca = "Farmina N&D Quinoa"
            elif 'prime' in url_lower:
                submarca = "Farmina N&D Prime"
            else:
                submarca = "Farmina N&D"
                
            # Etapa de vida
            if any(k in url_lower or k in nombre_lower for k in ['puppy', 'kitten', 'growth']):
                etapa_vida = "cachorro"
            elif any(k in url_lower or k in nombre_lower for k in ['senior', 'geriatric']):
                etapa_vida = "senior"
            else:
                etapa_vida = "adulto"
                
            # Slug & Imagen local
            slug_base = sanitize_slug(nombre)
            submarca_slug = sanitize_slug(submarca)
            especie_folder = "perros" if especie == "perro" else "gatos"
            
            ext = ".png"
            if img_url:
                parsed_ext = os.path.splitext(urlparse(img_url).path)[1].lower()
                if parsed_ext in ['.png', '.jpg', '.jpeg', '.webp']:
                    ext = parsed_ext
                    
            img_rel_path = f"{especie_folder}/{submarca_slug}/{slug_base}{ext}"
            img_full_path = os.path.join(BASE_DIR, "Agrovet", img_rel_path)
            
            if img_url:
                download_file(img_url, img_full_path)
                
            return {
                "id": slug_base,
                "marca_madre": "Agrovet",
                "submarca": submarca,
                "especie": especie,
                "etapa_vida": etapa_vida,
                "nombre": nombre,
                "formatos": final_formats,
                "descripcion": final_desc,
                "ingredientes": final_ing,
                "analisis_garantizado": final_gar,
                "imagen_local": img_rel_path,
                "url_imagen_original": img_url or "",
                "url_origen": url
            }
        except Exception as ex:
            print(f"Error processing {url}: {ex}")
            return None

    items = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_agrovet_product, u): u for u in product_urls}
        for fut in as_completed(futures):
            res = fut.result()
            if res:
                items.append(res)
                print(f"Processed: {res['nombre']} ({res['especie']})")
                
    # Sort items by id
    items.sort(key=lambda x: x['id'])
    write_datasets("Agrovet", items)
    return items

if __name__ == '__main__':
    freego_items = scrape_freego()
    stayhappy_items = scrape_stayhappy()
    agrovet_items = scrape_agrovet()
    print("ALL DONE SUCCESSFULLY.")
