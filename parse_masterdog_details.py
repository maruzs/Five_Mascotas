import urllib.request, ssl, re
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9',
}

urls = [
  "https://www.masterdog.cl/producto/master-dog-pate-pote-pollo/",
  "https://www.masterdog.cl/producto/master-dog-pate-pote-carne/",
  "https://www.masterdog.cl/producto/master-dog-pate-pote-cachorro/",
  "https://www.masterdog.cl/producto/galletas-senior/",
  "https://www.masterdog.cl/producto/snack-huesitos/",
  "https://www.masterdog.cl/producto/snack-rollitos/",
  "https://www.masterdog.cl/producto/galletas-cachorros-razas-pequenas/",
  "https://www.masterdog.cl/producto/galletas-cachorros-razas-medianas-y-grandes/",
  "https://www.masterdog.cl/producto/galletas-adultos-razas-pequenas/",
  "https://www.masterdog.cl/producto/galletas-menta/",
  "https://www.masterdog.cl/producto/galletas-carne/",
  "https://www.masterdog.cl/producto/salsa-pet-cordero-magallanico/",
  "https://www.masterdog.cl/producto/salsa-pet-carne-al-jugo/",
  "https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-carne-razas-medianas-y-grandes/",
  "https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-cachorros-sabor-pollo/",
  "https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-carne-razas-pequenas/",
  "https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-senior-sabor-carne-razas-medianas-y-grandes/",
  "https://www.masterdog.cl/producto/nuevos-trocitos-jugosos-adultos-sabor-pollo-razas-medianas-y-grandes/",
  "https://www.masterdog.cl/producto/master-dog-delisnack-multivitaminico/",
  "https://www.masterdog.cl/producto/master-dog-delisnack-articular/",
  "https://www.masterdog.cl/producto/master-dog-seco-cachorros-razas-pequenas/",
  "https://www.masterdog.cl/producto/master-dog-seco-adulto-razas-pequenas/",
  "https://www.masterdog.cl/producto/master-dog-senior-raza-pequena/",
  "https://www.masterdog.cl/producto/master-dog-seco-adulto-pollo/",
  "https://www.masterdog.cl/producto/master-dog-seco-adulto-senior/",
  "https://www.masterdog.cl/producto/master-cake-sabor-pollo/",
  "https://www.masterdog.cl/producto/master-cake-sabor-carne/",
  "https://www.masterdog.cl/producto/delident-raza-pequena/",
  "https://www.masterdog.cl/producto/delident-raza-mediana/",
  "https://www.masterdog.cl/producto/delident-raza-grande/",
  "https://www.masterdog.cl/producto/master-dog-seco-adulto-carne/",
  "https://www.masterdog.cl/producto/master-dog-seco-cachorros-razas-medianas-y-grandes/"
]

for u in urls:
    html = urllib.request.urlopen(urllib.request.Request(u, headers=headers), context=ctx).read().decode('utf-8', errors='ignore')
    soup = BeautifulSoup(html, 'html.parser')
    h1 = soup.find('h1')
    name = h1.get_text(' ', strip=True) if h1 else u
    
    # image
    img = None
    for im in soup.find_all('img'):
        src = im.get('src', '')
        if 'uploads' in src and not any(k in src for k in ['logo', 'svg', 'ICONOS', 'ICONO', '150x150', '300x', 'banner']):
            img = src
            break
            
    # formats
    formats = []
    pres = soup.find(class_=re.compile(r'formatoPeso|present|format'))
    if pres:
        formats = re.findall(r'(\d+(?:[,\.]\d+)?\s*(?:g|gr|grs|kg|kilos))', pres.get_text(), re.I)
        
    # ingredients
    ing = ""
    for p in soup.find_all(['p', 'div']):
        t = p.get_text(strip=True)
        if ('maíz' in t.lower() or 'harina de carne' in t.lower() or 'carne fresca' in t.lower() or 'harina de trigo' in t.lower() or 'agua,' in t.lower()) and len(t) > 35:
            if not 'análisis' in t.lower() and not 'cookies' in t.lower() and len(t) < 1200:
                ing = t
                break
                
    # analysis
    analisis = {}
    for table in soup.find_all('table'):
        txt = table.get_text(' ', strip=True)
        if 'análisis' in txt.lower() or 'proteína' in txt.lower():
            # parse rows or cells
            tds = [td.get_text(strip=True) for td in table.find_all(['td', 'th'])]
            for i in range(len(tds)-1):
                if any(k in tds[i].lower() for k in ['proteína', 'grasa', 'humedad', 'fibra', 'calcio', 'fósforo', 'omega']):
                    analisis[tds[i]] = tds[i+1]
                    
    # description
    desc = ""
    for p in soup.find_all('p'):
        t = p.get_text(' ', strip=True)
        if len(t) > 40 and not any(k in t.lower() for k in ['maíz', 'harina', 'ingredientes', 'análisis', 'cookies', 'todos los derechos']):
            desc = t
            break
            
    print(f"{name} | Formatos: {formats} | Img: {img.split('/')[-1] if img else 'None'} | Ing: {bool(ing)} | Ana: {len(analisis)} | Desc: {bool(desc)}")
