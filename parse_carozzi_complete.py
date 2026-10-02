import urllib.request, ssl, re, unicodedata, json
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9',
}

def clean_text(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFC', str(text))
    return re.sub(r'\s+', ' ', text).strip()

# Catálogo completo Master Dog (32 alimentos)
masterdog_urls = [
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

# Catálogo completo Master Cat (14 alimentos, sin arenas)
mastercat_urls = [
  ("https://www.mastercat.cl/producto/master-cat-adulto-salmon/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-adulto-carne/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-adulto-pollo/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-adulto-relleno/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/mix-gourmet/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-gatitos/", "cachorro", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-salmon/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-carne/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-atun/", "adulto", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-senior-pollo/", "senior", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-trocitos-jugosos-gatito/", "cachorro", "Master Cat"),
  ("https://www.mastercat.cl/producto/master-cat-snack-pescado/", "adulto", "Master Cat Miau Snack"),
  ("https://www.mastercat.cl/producto/master-cat-snack-carne/", "adulto", "Master Cat Miau Snack"),
  ("https://www.mastercat.cl/producto/master-cat-snack-pollo/", "adulto", "Master Cat Miau Snack")
]

print(f"Total Master Dog: {len(masterdog_urls)}")
print(f"Total Master Cat: {len(mastercat_urls)}")
print(f"TOTAL ALIMENTOS CAROZZI: {len(masterdog_urls) + len(mastercat_urls)}")
