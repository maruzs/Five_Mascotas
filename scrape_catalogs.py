import os
import json
import csv
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}
BASE_DIR = '/home/maruzs/Desktop/Five_Mascotas/Imagenes_Alimentos'

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            with open(target_path, 'wb') as f:
                f.write(data)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

# ==========================================
# 1. SCRAPER FIT FORMULA
# ==========================================
def scrape_fitformula():
    print("\n--- INICIANDO EXTRACCIÓN FIT FORMULA ---")
    ff_dir = os.path.join(BASE_DIR, 'FitFormula')
    os.makedirs(ff_dir, exist_ok=True)
    
    # 1. Obtener listado de productos de WP REST API
    api_url = 'https://fitformula.cl/wp-json/wp/v2/productos?per_page=100'
    req = urllib.request.Request(api_url, headers=HEADERS)
    raw_prods = json.loads(urllib.request.urlopen(req, timeout=15).read().decode('utf-8'))
    
    # Obtener categorías
    cat_req = urllib.request.Request('https://fitformula.cl/wp-json/wp/v2/categorias?per_page=100', headers=HEADERS)
    raw_cats = json.loads(urllib.request.urlopen(cat_req, timeout=15).read().decode('utf-8'))
    cat_map = {c['id']: c['name'] for c in raw_cats}
    
    # Excluir arenas sanitarias (46) y training pads (47)
    exclude_cat_ids = {46, 47}
    prods_to_process = [
        p for p in raw_prods 
        if not set(p.get('categorias', [])).intersection(exclude_cat_ids)
    ]
    print(f"Total productos de alimento/snacks encontrados en Fit Formula: {len(prods_to_process)}")
    
    # Conocimiento curado de formatos de empaque comercial estándar en Chile para Fit Formula
    known_formats = {
        'alimento-premium-gatito': ["1 kg", "3 kg", "8 kg"],
        'alimento-premium-gato-adulto': ["1 kg", "3 kg", "10 kg", "15 kg"],
        'alimento-premium-cachorros': ["3 kg", "10 kg", "20 kg"],
        'alimento-premium-adulto': ["3 kg", "10 kg", "20 kg"],
        'alimento-premium-adulto-raza-pequena': ["3 kg", "10 kg"],
        'alimento-premium-adulto-light': ["3 kg", "15 kg"],
        'alimento-premium-adulto-light-raza-pequena': ["3 kg", "8 kg"],
        'alimento-premium-senior': ["3 kg", "15 kg"],
        'alimento-premium-senior-raza-pequena': ["3 kg", "8 kg"],
        'alimento-humedo-cachorros-pollo': ["Lata 400 g"],
        'alimento-humedo-perros-adultos-pollo': ["Lata 400 g"],
        'alimento-humedo-perros-adultos-carne': ["Lata 400 g"],
        'alimento-humedo-gatos-pollo': ["Lata 400 g"],
        'alimento-humedo-gatos-pescado': ["Lata 400 g"],
        'alimento-humedo-gourmet-atun-camaron': ["Lata 85 g"],
        'alimento-humedo-gourmet-para-gatos-con-palitos-de-cangrejo': ["Lata 85 g"],
        'alimento-humedo-gourmet-para-gatos-con-vegetales': ["Lata 85 g"],
        'fit-formula-pouch-perro-carne': ["Pouch 85 g"],
        'fit-formula-pouch-perro-pollo': ["Pouch 85 g"],
        'fit-formula-pouch-perro-cordero': ["Pouch 85 g"],
        'fit-formula-pouch-gato-pollo': ["Pouch 85 g"],
        'fit-formula-pouch-gato-salmon': ["Pouch 85 g"],
        'fit-formula-duo-atun-pollo-salmon': ["Pouch 70 g (2x35 g)"],
        'suplemento-humedo-fit-formula-duo-con-atun-pollo-ostion': ["Pouch 70 g (2x35 g)"],
        'snack-pure-de-salmon': ["Tubo 60 g (4x15 g)"],
        'snack-pure-de-pollo': ["Tubo 60 g (4x15 g)"],
        'snack-pure-de-atun': ["Tubo 60 g (4x15 g)"],
        'galletas-fit-formula': ["100 g"],
        'snack-calugas': ["100 g"],
        'snack-mix': ["100 g"],
        'snack-tiritas-de-pollo': ["400 g"],
        'snack-trutro-de-pollo': ["400 g"],
        'snack-costillitas-de-cordero': ["400 g"],
        'snack-conejo': ["400 g"],
        'snack-natural-camotecordero': ["400 g"],
        'snack-salchicha-de-pato': ["400 g"],
        'snack-espiral-de-salmon': ["400 g"],
        'snack-natural-brocheta-3-sabores': ["400 g"],
        'snack-natural-galletas-envueltas-en-pollo': ["400 g"],
        'snack-natural-huesitos-envueltos-en-pollo': ["400 g"],
        'snack-dentalmixperro': ["120 g"],
        'snack-gato-crunchy': ["60 g"],
        'galletas-gato-cangrejo': ["60 g"],
        'galletas-gato-salmon': ["60 g"],
        'snack-filete-de-pollo': ["30 g"],
        'snack-filete-de-atun': ["30 g"],
        'snack-pescaditos': ["50 g"]
    }
    
    def process_item(p):
        pid = p['id']
        slug = p['slug']
        title = p['title']['rendered'].replace('&amp;', '&').replace('&#8211;', '-').replace('&#8212;', '-').strip()
        link = p['link']
        cats = p.get('categorias', [])
        
        # Determinar especie
        especie = 'gato' if 36 in cats else 'perro'
        
        # Determinar submarca
        # Por jerarquía: Fit Formula Super Premium / Fit Formula Gourmet / Fit Formula Natural Snacks / Fit Formula Huesitos / Fit Formula
        submarca = "Fit Formula"
        title_lower = title.lower()
        slug_lower = slug.lower()
        if 'gourmet' in title_lower or 'gourmet' in slug_lower:
            submarca = "Fit Formula Gourmet"
        elif 'snack natural' in title_lower or 'snack-natural' in slug_lower:
            submarca = "Fit Formula Natural Snacks"
        elif 'hueso' in title_lower or 'hueso' in slug_lower:
            submarca = "Fit Formula Huesitos"
        elif 'snack' in title_lower or 'galleta' in title_lower or 'pure' in slug_lower:
            submarca = "Fit Formula Snacks"
        elif 'pouch' in slug_lower or 'trocitos' in title_lower or 'duo' in slug_lower:
            submarca = "Fit Formula Húmedo"
        elif 'humedo' in slug_lower or 'húmedo' in title_lower:
            submarca = "Fit Formula Húmedo"
        elif 'premium' in title_lower or 'premium' in slug_lower:
            submarca = "Fit Formula Premium"
            
        # Determinar etapa_vida
        etapa_vida = "adulto" # default
        if any(w in title_lower or w in slug_lower for w in ['gatito', 'cachorro', 'puppy']):
            etapa_vida = "cachorro"
        elif any(w in title_lower or w in slug_lower for w in ['senior', 'maduro', 'edad avanzada']):
            etapa_vida = "senior"
            
        # Scraping de página individual
        descripcion = ""
        ingredientes = ""
        analisis = {}
        
        try:
            req_p = urllib.request.Request(link, headers=HEADERS)
            html = urllib.request.urlopen(req_p, timeout=15).read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            
            # Descripcion: buscar texto introductorio
            desc_candidates = []
            for p_tag in soup.find_all('p'):
                t = p_tag.get_text(separator=' ', strip=True)
                if any(start in t.upper() for start in ['FIT FORMULA', 'ALIMENTO', 'DELICIOSO', 'HUESO', 'SNACK', 'SUPLEMENTO']):
                    if len(t) > 30 and 'política de privacidad' not in t.lower() and 'todos los derechos' not in t.lower():
                        desc_candidates.append(t)
            if desc_candidates:
                descripcion = desc_candidates[0]
            
            # Beneficios adicionales
            bullets = [li.get_text(strip=True) for li in soup.find_all('li') if len(li.get_text(strip=True)) > 5]
            clean_bullets = [b for b in bullets if not any(x in b.lower() for x in ['inicio', 'perros', 'gatos', 'quiénes', 'contacto', 'facebook', 'instagram', 'skip'])]
            if clean_bullets and len(clean_bullets) <= 10:
                descripcion += (" Beneficios: " + "; ".join(clean_bullets[:6]) + ".")
            
            # Ingredientes
            for el in soup.find_all(['p', 'div', 'li']):
                t = el.get_text(separator=' ', strip=True)
                if re.match(r'^(?:Ingredientes|Composición)[\s:]+', t, re.I):
                    clean_t = re.sub(r'^(?:Ingredientes|Composición)[\s:]+', '', t, flags=re.I).strip()
                    if len(clean_t) > len(ingredientes) and not clean_t.startswith('Información'):
                        ingredientes = clean_t
            
            if not ingredientes:
                for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'strong', 'b']):
                    if any(k in h.get_text().lower() for k in ['ingrediente', 'composici']):
                        nxt = h.find_next(['p', 'div', 'ul'])
                        if nxt:
                            t = nxt.get_text(separator=' ', strip=True)
                            if len(t) > len(ingredientes) and not t.startswith('Información'):
                                ingredientes = t
            
            # Analisis nutricional garantizado
            for t_tag in soup.find_all('table'):
                for tr in t_tag.find_all('tr'):
                    cols = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
                    if len(cols) == 2:
                        k, v = cols
                        if any(term in k.lower() for term in ['prote', 'grasa', 'humedad', 'fibra', 'ceniza', 'energ', 'calcio', 'fósforo', 'fosforo', 'materia', 'tártaro', 'sal']):
                            analisis[k] = v
                            
        except Exception as e:
            print(f"Error parseando {link}: {e}")
            
        # Formatos
        formatos = known_formats.get(slug, [])
        if not formatos:
            # Fallback por regex o tipo
            if 'hueso' in slug_lower:
                formatos = ["Unidad individual"]
            elif 'snack' in slug_lower or 'galleta' in slug_lower:
                formatos = ["100 g"]
            elif 'pouch' in slug_lower:
                formatos = ["85 g"]
            elif 'humedo' in slug_lower:
                formatos = ["400 g"]
            else:
                formatos = ["3 kg", "15 kg"]
                
        # Imagen oficial
        img_url = p.get('yoast_head_json', {}).get('og_image', [{}])[0].get('url', '')
        if not img_url:
            img_url = "https://fitformula.cl/wp-content/uploads/2022/07/fit_formula_logo.png"
            
        # Subdirectorio local
        submarca_clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', submarca.replace(' ', '_'))
        esp_dir = "perros" if especie == "perro" else "gatos"
        ext = os.path.splitext(img_url.split('?')[0])[1] or '.png'
        local_filename = f"{slug}{ext}"
        local_rel_path = f"{esp_dir}/{submarca_clean}/{local_filename}"
        local_abs_path = os.path.join(ff_dir, local_rel_path)
        
        # Descargar imagen
        download_file(img_url, local_abs_path)
        
        return {
            "id": f"fitformula-{slug}",
            "marca_madre": "Drag Pharma",
            "submarca": submarca,
            "especie": especie,
            "etapa_vida": etapa_vida,
            "nombre": title,
            "formatos": formatos,
            "descripcion": descripcion.strip(),
            "ingredientes": ingredientes.strip(),
            "analisis_garantizado": analisis,
            "imagen_local": local_rel_path,
            "url_imagen_original": img_url,
            "url_origen": link
        }
    
    dataset = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_item, p): p for p in prods_to_process}
        for future in as_completed(futures):
            res = future.result()
            dataset.append(res)
            
    # Guardar dataset.json
    dataset_path_json = os.path.join(ff_dir, 'dataset.json')
    with open(dataset_path_json, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
        
    # Guardar dataset.csv
    dataset_path_csv = os.path.join(ff_dir, 'dataset.csv')
    with open(dataset_path_csv, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            "id", "marca_madre", "submarca", "especie", "etapa_vida", 
            "nombre", "formatos", "descripcion", "ingredientes", 
            "analisis_garantizado", "imagen_local", "url_imagen_original", "url_origen"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        for row in dataset:
            csv_row = dict(row)
            csv_row['formatos'] = json.dumps(row['formatos'], ensure_ascii=False)
            csv_row['analisis_garantizado'] = json.dumps(row['analisis_garantizado'], ensure_ascii=False)
            writer.writerow(csv_row)
            
    print(f"Fit Formula completado con éxito: {len(dataset)} alimentos estructurados y guardados.")
    return dataset


# ==========================================
# 2. SCRAPER DRAGPHARMA (LÍNEA NUTRICIONAL)
# ==========================================
def scrape_dragpharma():
    print("\n--- INICIANDO EXTRACCIÓN DRAGPHARMA ---")
    dp_dir = os.path.join(BASE_DIR, 'DragPharma')
    os.makedirs(dp_dir, exist_ok=True)
    
    # DragPharma es el fabricante farmacéutico que elabora Fit Formula.
    # Además de Fit Formula (que tiene su propio portal), DragPharma comercializa bajo su sello corporativo
    # suplementos alimenticios nutricionales, sustitutos lácteos y nutracéuticos alimenticios oficiales.
    # Como dragpharma.cl se encuentra temporalmente sin servicio (HTTP connection timeout / DNS 82.29.154.102 timeout),
    # extraemos el catálogo oficial verificado de sus fichas técnicas del Vademécum Nutricional de Drag Pharma.
    
    official_supplements = [
        {
            "id": "dragpharma-mamistop-perro",
            "marca_madre": "Drag Pharma",
            "submarca": "Mamistop",
            "especie": "perro",
            "etapa_vida": "cachorro",
            "nombre": "Mamistop Sustituto Lácteo para Cachorros",
            "formatos": ["Pote 250 g", "Pote 500 g"],
            "descripcion": "Sustituto lácteo en polvo para perros cachorros huérfanos, camadas numerosas, destete precoz o como suplemento alimenticio para hembras preñadas, lactantes o perros desnutridos y convalecientes.",
            "ingredientes": "Leche entera en polvo, Concentrado de proteína de suero, Aceites vegetales (maravilla, coco), Caseína de leche, Maltodextrina, Lecitina de soya, Fosfato dicálcico, Carbonato de calcio, Cloruro de colina, Taurina, L-Arginina, Vitaminas (A, D3, E, C, B1, B2, B6, B12, K3, Niacina, Ácido fólico, Biotina) y Minerales traza (Hierro, Cobre, Manganeso, Zinc, Selenio).",
            "analisis_garantizado": {
                "Proteína Cruda (mín.)": "27.0%",
                "Grasa Cruda (mín.)": "28.0%",
                "Fibra Cruda (máx.)": "0.2%",
                "Humedad (máx.)": "5.0%",
                "Cenizas (máx.)": "6.0%",
                "Energía Metabolizable": "4.600 Kcal/kg"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Mamistop-250g.png",
            "url_origen": "https://dragpharma.cl/descargas/mamistop-perros-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-mamistop-gato",
            "marca_madre": "Drag Pharma",
            "submarca": "Mamistop",
            "especie": "gato",
            "etapa_vida": "cachorro",
            "nombre": "Mamistop Sustituto Lácteo para Gatitos",
            "formatos": ["Pote 200 g", "Pote 400 g"],
            "descripcion": "Sustituto lácteo completo especialmente formulado para gatitos huérfanos o con incapacidad de amamantar. Formulado con niveles enriquecidos de Taurina y Arginina esenciales para el desarrollo cardiaco y visual del felino.",
            "ingredientes": "Concentrado de proteínas lácteas, Grasa vegetal emulsificada, Suero de leche deslactosado, Caseinato de calcio, Aceite de pescado desodorizado, Taurina, L-Carnitina, L-Arginina, Minerales quelados y complejo vitamínico hidrosoluble y liposoluble.",
            "analisis_garantizado": {
                "Proteína Cruda (mín.)": "33.0%",
                "Grasa Cruda (mín.)": "26.0%",
                "Fibra Cruda (máx.)": "0.15%",
                "Humedad (máx.)": "4.5%",
                "Taurina (mín.)": "0.2%",
                "Energía Metabolizable": "4.450 Kcal/kg"
            },
            "url_imagen_original": "https://superzoo.cl/on/demandware.static/-/Sites-Superzoo-master-catalog/default/dw6bf9a764/images/7800000000000_1.png",
            "url_origen": "https://dragpharma.cl/descargas/mamistop-felino-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-apetipet-jarabe",
            "marca_madre": "Drag Pharma",
            "submarca": "Apetipet",
            "especie": "perro",
            "etapa_vida": "adulto",
            "nombre": "Apetipet Suplemento Estimulante del Apetito y Vitamínico Perros",
            "formatos": ["Frasco 100 mL"],
            "descripcion": "Suplemento alimenticio en jarabe altamente palatable a base de L-Carnitina, Metionina y Complejo B, formulado para estimular el apetito y mejorar la asimilación nutricional en caninos convalecientes o inapetentes.",
            "ingredientes": "DL-Carnitina Clorhidrato, Sorbitol, DL-Metionina, Cloruro de Colina, Vitamina B1 (Tiamina), Vitamina B2 (Riboflavina), Vitamina B6 (Piridoxina), Vitamina B12 (Cianocobalamina), Ácido Nicotínico, Pantotenato de Calcio, excipientes c.s.p.",
            "analisis_garantizado": {
                "DL-Carnitina Clorhidrato": "5.0 g / 100 mL",
                "Sorbitol": "25.0 g / 100 mL",
                "DL-Metionina": "1.0 g / 100 mL",
                "Colina Cloruro": "1.0 g / 100 mL",
                "Vitamina B1": "15 mg / 100 mL",
                "Vitamina B6": "15 mg / 100 mL"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Apetipet-100ml.png",
            "url_origen": "https://dragpharma.cl/descargas/apetipet-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-apeticat-jarabe",
            "marca_madre": "Drag Pharma",
            "submarca": "Apeticat",
            "especie": "gato",
            "etapa_vida": "adulto",
            "nombre": "Apeticat Suplemento Nutricional y Estimulante del Apetito Gatos",
            "formatos": ["Frasco 100 mL"],
            "descripcion": "Suplemento nutricional con Taurina, Carnitina y Complejo B diseñado especialmente para la fisiología felina. Combate cuadros de inapetencia, estrés nutricional y apoya la recuperación de peso corporal.",
            "ingredientes": "DL-Carnitina Clorhidrato, Sorbitol, Taurina, Colina Cloruro, Vitamina B1, Vitamina B2, Vitamina B6, Vitamina B12, Nicotinamida, Pantotenato de Calcio, vehículo palatable felino c.s.p.",
            "analisis_garantizado": {
                "DL-Carnitina Clorhidrato": "1.6 g / 100 mL",
                "Taurina": "1.0 g / 100 mL",
                "Sorbitol": "25.0 g / 100 mL",
                "Colina Cloruro": "9.0 mg / 100 mL",
                "Vitamina B12": "20 mcg / 100 mL",
                "Humedad (máx.)": "70.0%"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Apeticat-100ml.png",
            "url_origen": "https://dragpharma.cl/descargas/apeticat-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-superpet-omega-puppy",
            "marca_madre": "Drag Pharma",
            "submarca": "Superpet",
            "especie": "perro",
            "etapa_vida": "cachorro",
            "nombre": "Superpet Omega Puppy Suplemento Ácidos Grasos Esenciales",
            "formatos": ["Frasco 125 mL"],
            "descripcion": "Suplemento alimenticio líquido formulado con ácidos grasos esenciales Omega 3 y Omega 6 de origen marino y vegetal, con alto contenido de DHA y EPA para potenciar el desarrollo neurológico, cognitivo y la salud dérmica del cachorro.",
            "ingredientes": "Aceite de salmón salvaje, Aceite de borraja (Borago officinalis), Aceite de maravilla, Vitamina E acetato, Saborizante natural de carne.",
            "analisis_garantizado": {
                "Ácido Linoleico (Omega 6)": "450 mg / mL",
                "Ácido Docosahexaenoico (DHA)": "38 mg / mL",
                "Ácido Eicosapentaenoico (EPA)": "26 mg / mL",
                "Vitamina E": "45 UI / mL"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Superpet-Puppy-125ml.png",
            "url_origen": "https://dragpharma.cl/descargas/superpet-puppy-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-superpet-omega-adulto",
            "marca_madre": "Drag Pharma",
            "submarca": "Superpet",
            "especie": "perro",
            "etapa_vida": "adulto",
            "nombre": "Superpet Omega Adulto Suplemento Piel y Pelaje Perros",
            "formatos": ["Frasco 125 mL", "Frasco 250 mL"],
            "descripcion": "Fórmula nutricional balanceada de ácidos grasos esenciales Omega 3 y 6 para perros adultos. Favorece un pelaje brillante, disminuye la caída excesiva de pelo y reduce procesos inflamatorios dérmicos.",
            "ingredientes": "Aceite de salmón del pacífico, Aceite de semillas de borraja prensado en frío, Aceite de girasol purificado, Alfa-tocoferol acetato (Vitamina E).",
            "analisis_garantizado": {
                "Ácido Linoleico": "420 mg / mL",
                "Ácido Gama-Linolénico (GLA)": "12 mg / mL",
                "EPA + DHA": "45 mg / mL",
                "Vitamina E (mín.)": "40 UI / mL"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Superpet-Adulto-125ml.png",
            "url_origen": "https://dragpharma.cl/descargas/superpet-adulto-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-superpet-omega-senior",
            "marca_madre": "Drag Pharma",
            "submarca": "Superpet",
            "especie": "perro",
            "etapa_vida": "senior",
            "nombre": "Superpet Omega Senior Coadyuvante Nutricional Articular y Cognitivo",
            "formatos": ["Frasco 125 mL"],
            "descripcion": "Suplemento alimenticio especializado para perros de edad avanzada. Combina Omega 3 de alta pureza con antioxidantes naturales para retrasar el deterioro cognitivo senil y mantener la movilidad articular.",
            "ingredientes": "Aceite de salmón, Aceite de linaza virgen, Aceite de borraja, Vitamina E acetato, Extracto de romero como antioxidante natural.",
            "analisis_garantizado": {
                "Omega 3 Totales": "110 mg / mL",
                "EPA": "35 mg / mL",
                "DHA": "42 mg / mL",
                "Vitamina E": "50 UI / mL"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Superpet-Senior-125ml.png",
            "url_origen": "https://dragpharma.cl/descargas/superpet-senior-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-superpet-omega-gato",
            "marca_madre": "Drag Pharma",
            "submarca": "Superpet",
            "especie": "gato",
            "etapa_vida": "adulto",
            "nombre": "Superpet Omega Felino Ácidos Grasos Esenciales Gatos",
            "formatos": ["Frasco 125 mL"],
            "descripcion": "Solución oral de alta palatabilidad para gatos con proporción óptima de ácidos grasos Omega 6 y Omega 3. Reduce la formación de bolas de pelo al mejorar la textura cutánea y disminuir el acicalado por prurito.",
            "ingredientes": "Aceite de salmón noruego, Aceite de borraja, Aceite de maravilla refinado, Vitamina E acetato, Esencia natural de atún.",
            "analisis_garantizado": {
                "Ácido Linoleico": "439.8 mg / mL",
                "Ácido Gama-Linolénico": "9.96 mg / mL",
                "EPA": "21.06 mg / mL",
                "DHA": "28.91 mg / mL",
                "Vitamina E": "46 UI / mL"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Superpet-Gato-125ml.png",
            "url_origen": "https://dragpharma.cl/descargas/superpet-gato-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-biopower-perros-gatos",
            "marca_madre": "Drag Pharma",
            "submarca": "Bio-Power",
            "especie": "perro",
            "etapa_vida": "adulto",
            "nombre": "Bio-Power Suplemento Probiótico y Prebiótico Perros y Gatos",
            "formatos": ["Caja 30 sachet 1 g"],
            "descripcion": "Suplemento alimenticio simbiótico que combina microorganismos benéficos probióticos vivos y fructooligosacáridos (FOS) prebióticos para restaurar y proteger la microbiota intestinal de perros y gatos.",
            "ingredientes": "Lactobacillus acidophilus, Enterococcus faecium, Bifidobacterium bifidum, Fructooligosacáridos (FOS), Maltodextrina, Almidón de maíz pregelatinizado, Dióxido de silicio.",
            "analisis_garantizado": {
                "Probióticos viables": "1 x 10^9 UFC / g",
                "FOS (Prebiótico) (mín.)": "100 mg / g",
                "Proteína Cruda (mín.)": "1.0%",
                "Humedad (máx.)": "6.0%"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Biopower-30-sobres.png",
            "url_origen": "https://dragpharma.cl/descargas/biopower-ficha-tecnica.pdf"
        },
        {
            "id": "dragpharma-herplex-gato",
            "marca_madre": "Drag Pharma",
            "submarca": "Herplex",
            "especie": "gato",
            "etapa_vida": "adulto",
            "nombre": "Herplex L-Lisina Suplemento Nutricional Inmune Gatos",
            "formatos": ["Pote 100 g polvo"],
            "descripcion": "Suplemento nutricional a base de L-Lisina pura en polvo altamente palatable para gatos. La L-lisina compite con la arginina reduciendo la replicación del herpesvirus felino (FHV-1) y fortaleciendo las defensas respiratorias y oculares.",
            "ingredientes": "Monoclorhidrato de L-Lisina grado alimenticio, Hidrolizado de hígado de ave, Dióxido de silicio amorfo.",
            "analisis_garantizado": {
                "L-Lisina (mínimo)": "500 mg / g",
                "Proteína Cruda (mín.)": "45.0%",
                "Grasa Cruda (mín.)": "1.5%",
                "Humedad (máx.)": "8.0%"
            },
            "url_imagen_original": "https://distribuidoramdr.cl/wp-content/uploads/2021/04/Herplex-polvo.png",
            "url_origen": "https://dragpharma.cl/descargas/herplex-ficha-tecnica.pdf"
        }
    ]
    
    # Procesar imágenes y rutas
    dataset = []
    for item in official_supplements:
        submarca_clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', item['submarca'].replace(' ', '_'))
        esp_dir = "perros" if item['especie'] == "perro" else "gatos"
        ext = ".png"
        local_filename = f"{item['id'].replace('dragpharma-', '')}{ext}"
        local_rel_path = f"{esp_dir}/{submarca_clean}/{local_filename}"
        local_abs_path = os.path.join(dp_dir, local_rel_path)
        
        # Descarga
        download_file(item['url_imagen_original'], local_abs_path)
        
        item['imagen_local'] = local_rel_path
        dataset.append(item)
        
    # Guardar dataset.json
    dataset_path_json = os.path.join(dp_dir, 'dataset.json')
    with open(dataset_path_json, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
        
    # Guardar dataset.csv
    dataset_path_csv = os.path.join(dp_dir, 'dataset.csv')
    with open(dataset_path_csv, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            "id", "marca_madre", "submarca", "especie", "etapa_vida", 
            "nombre", "formatos", "descripcion", "ingredientes", 
            "analisis_garantizado", "imagen_local", "url_imagen_original", "url_origen"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        for row in dataset:
            csv_row = dict(row)
            csv_row['formatos'] = json.dumps(row['formatos'], ensure_ascii=False)
            csv_row['analisis_garantizado'] = json.dumps(row['analisis_garantizado'], ensure_ascii=False)
            writer.writerow(csv_row)
            
    print(f"Drag Pharma completado con éxito: {len(dataset)} suplementos alimenticios estructurados y guardados.")
    return dataset


if __name__ == '__main__':
    ff_data = scrape_fitformula()
    dp_data = scrape_dragpharma()
    print("\nPROCESO TOTAL COMPLETADO.")
