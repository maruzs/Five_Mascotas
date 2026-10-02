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
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            with open(target_path, 'wb') as f:
                f.write(r.content)
            return target_path
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def write_datasets(provider_dir, items):
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
            
    print(f"Saved {len(items)} items to {json_path} and {csv_path}")

print("Helper script ready.")
