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
  "https://www.mastercat.cl/producto/master-cat-adulto-salmon/",
  "https://www.mastercat.cl/producto/master-cat-adulto-carne/",
  "https://www.mastercat.cl/producto/master-cat-adulto-pollo/",
  "https://www.mastercat.cl/producto/master-cat-adulto-relleno/",
  "https://www.mastercat.cl/producto/mix-gourmet/",
  "https://www.mastercat.cl/producto/master-cat-gatitos/",
  "https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-salmon/",
  "https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-carne/",
  "https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-atun/",
  "https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-senior-pollo/",
  "https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-gatito/",
  "https://www.mastercat.cl/producto/master-cat-snack-pescado/",
  "https://www.mastercat.cl/producto/master-cat-snack-carne/",
  "https://www.mastercat.cl/producto/master-cat-snack-pollo/"
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
        if any(k in src for k in ['salmon.png', 'carne.png', 'pollo.png', 'gatitos.png', 'gourmet.png', 'snack', 'trocitos', 'relleno', 'uploads']) and not any(k in src for k in ['logo', 'svg', 'ICONOS', 'ICONO']):
            img = src
            break
            
    # formats
    formats = []
    pres = soup.find(class_=re.compile(r'sale-points__presentations|presentations'))
    if pres:
        formats = re.findall(r'(\d+(?:[,\.]\d+)?\s*(?:g|gr|kg|kilos))', pres.get_text(), re.I)
        
    # ingredients
    ing = ""
    txt_div = soup.find('div', class_='txt text-center')
    if txt_div:
        ing = txt_div.get_text(' ', strip=True)
    if not ing:
        for p in soup.find_all(['div', 'p']):
            t = p.get_text(strip=True)
            if 'maíz' in t.lower() or 'harina de' in t.lower() or 'carne fresca' in t.lower():
                if len(t) > 30 and len(t) < 800:
                    ing = t
                    break
                    
    # description
    desc = ""
    desc_div = soup.find('div', class_='content')
    if desc_div:
        desc = desc_div.get_text(' ', strip=True)
    if not desc:
        h2s = soup.find_all('h2')
        if len(h2s) > 1:
            desc = h2s[0].get_text(' ', strip=True)
            
    print(f"{name} | Formatos: {formats} | Img: {img.split('/')[-1] if img else 'None'} | Ing: {bool(ing)} | Desc: {bool(desc)}")
