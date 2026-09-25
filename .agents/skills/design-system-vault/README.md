# 🎨 Solo-Founder Premium Design System & Component Library

Bienvenido a tu librería centralizada de diseño, componentes, animaciones y tokens visuales.
Esta arquitectura está estructurada para permitirte copiar, adaptar y ensamblar interfaces de nivel Awwwards, Stripe y Linear en minutos, ya sea manualmente o asistiéndote de agentes de IA.

---

## 📂 Estructura de la Librería

```text
design-library/
├── 01-components-ui/           # Componentes atómicos y moleculares listos para copiar/pegar
│   ├── buttons/                # Botones interactivos (shimmer-button, magnetic-button)
│   ├── cards/                  # Bento grids asimétricos y 3D tilt cards
│   ├── hero-sections/          # Heroes con cuadrícula reactiva al cursor
│   ├── navigation/             # Floating navbars con blur y Command Menu Cmd+K
│   ├── dashboards-and-tables/  # KPI metric cards con sparkline y tablas de datos densas
│   ├── ecommerce/              # Product cards con variantes y Slide-over cart drawer
│   ├── flutter/                # Componentes nativos Flutter/Dart (bento cards, metric tiles)
│   └── utils.ts                # Helper cn(...) para combinación segura de clases Tailwind
│
├── 02-animations-motion/       # Presets de animación, Motion (Framer Motion) y Tailwind
│   ├── transitions.ts          # Springs, easings cinemáticos e interpolaciones fluidas
│   ├── text-effects/           # Text rotators dinámicos y kinetic typography
│   └── background-particles/   # Fondos OLED con halos de luz radiales interactivos
│
├── 03-design-tokens-palettes/  # Paletas por industria y variables CSS/Tailwind
│   ├── dark-tech-linear.css    # Paleta dark OLED, bordes hairlines y sombras profundas
│   ├── saas-b2b-trusted.css    # Azules/grises corporativos orientados a conversión B2B
│   └── tailwind-preset.js      # Preset de Tailwind con elevaciones, hairlines y keyframes
│
├── 04-svgs-icons-shapes/       # Colección de geometría, formas abstractas e iconos
│   ├── icon-system.md          # Pautas de uso de Iconoir / Phosphor Light
│   └── shapes-and-blobs/       # Geometrías abstractas y mallas SVG
│
└── 05-inspiration-recipes/     # Recetas completas de pantallas reales (Refero/SaaSPO)
    ├── auth-and-onboarding.md  # Patrones de autenticación seguros y fluidos
    ├── pricing-matrix.md       # Tablas de precios de alta conversión
    └── app-settings-layout.md  # Paneles de configuración modernos
```

---

## 🚀 Cómo utilizar esta librería con tus Agentes de IA

1. **Copiar y Pegar Directo**: Cada componente incluye su código en TypeScript (`.tsx`) y clases de Tailwind CSS sin dependencias raras (estilo shadcn/ui).
2. **Contexto para Agentes**: Cuando le pidas a un agente en Codex, Antigravity u OpenCode:
   > *"Diseña la landing page usando el componente de hero `01-components-ui/hero-sections/interactive-grid-hero.tsx` y la paleta `03-design-tokens-palettes/dark-tech-linear.css`"*
   El agente usará este código probado en lugar de alucinar componentes genéricos.
