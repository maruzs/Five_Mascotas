import urllib.request, ssl, re
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

all_products = {}

for p in [1, 2]:
    url = f'https://mercadocarozzi.cl/mascotas.html?p={p}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx) as resp:
        soup = BeautifulSoup(resp.read().decode('utf-8', errors='ignore'), 'html.parser')
    for item in soup.find_all(class_='product-item-info'):
        link = item.find('a', class_='product-item-link')
        img = item.find('img', class_='product-image-photo')
        if not link or not link.get('href'):
            continue
        href = link.get('href')
        name = link.get_text(strip=True)
        img_src = img.get('src') if img else ''
        if 'arena' in name.lower() or 'arena' in href.lower():
            continue
        all_products[href] = {
            'name': name,
            'url': href,
            'img': img_src
        }

print(f"Total Carozzi Pet Food Products: {len(all_products)}")
for u, d in all_products.items():
    print(f"  {d['name']} -> {u}")
