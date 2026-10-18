#!/usr/bin/env python3
"""
compile_diagram.py
------------------
Compilador universal de diagramas .excalidraw hacia SVG vectorial y PNG de alta resolución.
Diseñado para la skill `excalidraw-diagram-generator` en el estándar .agents/skills.

Uso:
    python3 compile_diagram.py <archivo.excalidraw> [--output-dir DIR] [--export {svg,png,all}] [--scale SCALE]

Ejemplos:
    python3 compile_diagram.py architecture.excalidraw
    python3 compile_diagram.py system.excalidraw --output-dir ./figures --export all --scale 2
"""

import sys
import os
import json
import argparse
import subprocess
import html

def parse_excalidraw(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def build_standalone_svg(excalidraw_data):
    """
    Genera un archivo SVG estilizado y bien estructurado a partir de los elementos de Excalidraw,
    respetando formas, colores de trazo/relleno, textos y flechas.
    """
    elements = excalidraw_data.get("elements", [])
    if not elements:
        raise ValueError("El archivo .excalidraw no contiene elementos para renderizar.")

    # Calcular bounding box
    min_x, min_y = float('inf'), float('inf')
    max_x, max_y = float('-inf'), float('-inf')

    for el in elements:
        if el.get("isDeleted", False):
            continue
        x = el.get("x", 0)
        y = el.get("y", 0)
        w = el.get("width", 0)
        h = el.get("height", 0)
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x + w)
        max_y = max(max_y, y + h)

    padding = 40
    width = max(max_x - min_x + (padding * 2), 200)
    height = max(max_y - min_y + (padding * 2), 200)
    view_x = min_x - padding
    view_y = min_y - padding

    svg_parts = [
        f'<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_x} {view_y} {width} {height}" width="{width}" height="{height}" style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">',
        f'  <defs>',
        f'    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">',
        f'      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e1e1e" />',
        f'    </marker>',
        f'  </defs>'
    ]

    for el in elements:
        if el.get("isDeleted", False):
            continue
        
        el_type = el.get("type")
        x = el.get("x", 0)
        y = el.get("y", 0)
        w = el.get("width", 0)
        h = el.get("height", 0)
        stroke = el.get("strokeColor", "#1e1e1e")
        fill = el.get("backgroundColor", "transparent")
        if fill == "transparent":
            fill_attr = 'fill="none"'
        else:
            fill_attr = f'fill="{fill}"'
        stroke_width = el.get("strokeWidth", 2)
        stroke_dash = 'stroke-dasharray="6 6"' if el.get("strokeStyle") == "dashed" else ""

        if el_type == "rectangle":
            roundness = el.get("roundness")
            rx = 8 if roundness else 0
            svg_parts.append(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{rx}" stroke="{stroke}" stroke-width="{stroke_width}" {stroke_dash} {fill_attr} />')
            
        elif el_type == "ellipse":
            cx = x + w / 2
            cy = y + h / 2
            rx = w / 2
            ry = h / 2
            svg_parts.append(f'  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" stroke="{stroke}" stroke-width="{stroke_width}" {stroke_dash} {fill_attr} />')

        elif el_type == "diamond":
            p1 = f"{x + w / 2},{y}"
            p2 = f"{x + w},{y + h / 2}"
            p3 = f"{x + w / 2},{y + h}"
            p4 = f"{x},{y + h / 2}"
            svg_parts.append(f'  <polygon points="{p1} {p2} {p3} {p4}" stroke="{stroke}" stroke-width="{stroke_width}" {stroke_dash} {fill_attr} />')

        elif el_type == "line" or el_type == "arrow":
            points = el.get("points", [[0, 0], [w, h]])
            svg_pts = " ".join([f"{x + pt[0]},{y + pt[1]}" for pt in points])
            marker = 'marker-end="url(#arrow)"' if el_type == "arrow" else ""
            svg_parts.append(f'  <polyline points="{svg_pts}" stroke="{stroke}" stroke-width="{stroke_width}" fill="none" {stroke_dash} {marker} />')

        elif el_type == "text":
            raw_text = el.get("text", "")
            escaped_text = html.escape(raw_text)
            font_size = el.get("fontSize", 16)
            text_color = stroke
            lines = escaped_text.split("\n")
            line_height = font_size * 1.3
            svg_parts.append(f'  <text x="{x}" y="{y + font_size}" font-size="{font_size}" fill="{text_color}">')
            for i, line in enumerate(lines):
                dy = 0 if i == 0 else line_height
                svg_parts.append(f'    <tspan x="{x}" dy="{dy}">{line}</tspan>')
            svg_parts.append(f'  </text>')

    svg_parts.append('</svg>')
    return "\n".join(svg_parts)

def compile_to_formats(excalidraw_file, output_dir=None, export_mode="all", scale=2):
    if not os.path.exists(excalidraw_file):
        print(f"❌ Error: El archivo {excalidraw_file} no existe.")
        sys.exit(1)

    base_name = os.path.splitext(os.path.basename(excalidraw_file))[0]
    out_dir = output_dir if output_dir else os.path.dirname(excalidraw_file) or "."
    os.makedirs(out_dir, exist_ok=True)

    svg_path = os.path.join(out_dir, f"{base_name}.svg")
    png_path = os.path.join(out_dir, f"{base_name}.png")

    # 1. Intentar compilar vía CLI nativo (@excalidraw/excalidraw-to-svg o npx excalidraw-cli) si está en el sistema
    native_cli_success = False
    try:
        cli_res = subprocess.run(
            ["npx", "--yes", "@excalidraw/excalidraw-to-svg", excalidraw_file, "-o", svg_path],
            capture_output=True,
            timeout=15
        )
        if cli_res.returncode == 0 and os.path.exists(svg_path):
            native_cli_success = True
            print(f"✨ Compilado SVG nativo vía Excalidraw Engine: {svg_path}")
    except Exception:
        native_cli_success = False

    # 2. Si no hay CLI en línea, compilar vía parser integrado robusto
    if not native_cli_success:
        data = parse_excalidraw(excalidraw_file)
        svg_content = build_standalone_svg(data)
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"✅ SVG vectorial generado: {svg_path}")

    # 3. Generar PNG si se solicitó
    if export_mode in ["png", "all"]:
        # Intentar rsvg-convert (librería estándar en Arch/Debian para rasterizado SVG)
        png_done = False
        try:
            rsvg = subprocess.run(
                ["rsvg-convert", "-z", str(scale), "-f", "png", svg_path, "-o", png_path],
                capture_output=True
            )
            if rsvg.returncode == 0:
                png_done = True
                print(f"✅ PNG rasterizado en alta resolución ({scale}x): {png_path}")
        except FileNotFoundError:
            pass

        if not png_done:
            # Fallback a ImageMagick
            try:
                magick = subprocess.run(
                    ["magick", "-density", str(scale * 100), svg_path, png_path],
                    capture_output=True
                )
                if magick.returncode == 0:
                    png_done = True
                    print(f"✅ PNG rasterizado con ImageMagick: {png_path}")
            except FileNotFoundError:
                pass

        if not png_done:
            print(f"ℹ️ Sugerencia: Para rasterizar automáticamente PNG desde SVG instala 'librsvg' (`sudo pacman -S librsvg` o `apt install librsvg2-bin`).")

    print(f"\n🎉 Compilación terminada:")
    print(f"   - Vectorial SVG: {svg_path}")
    if os.path.exists(png_path):
        print(f"   - Imagen PNG:    {png_path}")
        print(f"\n📌 Snippet para Markdown clickeable:")
        print(f"   [![Diagrama (Clic para ver SVG)]({png_path})]({svg_path})")
        print(f"\n📌 Snippet para LaTeX clickeable:")
        print(f"   \\href{{{svg_path}}}{{\\includegraphics[width=0.9\\textwidth]{{{png_path}}}}}")

def main():
    parser = argparse.ArgumentParser(description="Compilador universal de diagramas .excalidraw a SVG y PNG.")
    parser.add_argument("file", help="Ruta al archivo .excalidraw")
    parser.add_argument("--output-dir", "-o", default=None, help="Directorio de destino para los archivos compilados")
    parser.add_argument("--export", "-e", choices=["svg", "png", "all"], default="all", help="Formato de exportación (default: all)")
    parser.add_argument("--scale", "-s", type=int, default=2, help="Escala para el PNG (default: 2)")

    args = parser.parse_args()
    compile_to_formats(args.file, args.output_dir, args.export, args.scale)

if __name__ == "__main__":
    main()
