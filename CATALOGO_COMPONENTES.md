# 📚 Catálogo Maestro de Componentes Universales
> **Repositorio Base:** `~/Desktop/Software_Development`  
> **Filosofía:** Copiar, pegar y parametrizar en 2 minutos. Cero dependencias rígidas. 100% compatible con la regla 60-30-10 y tokens semánticos (Tailwind / Flutter).

---

## 🧭 1. Navegación (Tab Bars & Navbars)

### 🌊 Liquid Fluid Tab Bar (Animación CREST)
*Barra flotante estilo píldora con física de monte líquido inferior, proyección de gota hacia arriba y llenado SVG del icono.*

- **Vista previa / Inspiración:** `Docs/Inspiraciones/TabBars/tabbar1.jpg` y `TabBar1.mp4`
- **Código Fuente Web (React/Tailwind):** `templates/web/navigation/LiquidFluidTabBar.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/navigation/liquid_fluid_tab_bar.dart`

---

#### 💻 Cómo usarla en un proyecto Web (Next.js, Vite, React, Astro)

##### Paso 1: Copiar el archivo
Desde la terminal de tu nuevo proyecto:
```bash
# Ejemplo: si estás en la carpeta de tu nuevo proyecto
cp ~/Desktop/Software_Development/templates/web/navigation/LiquidFluidTabBar.tsx src/components/ui/
```

##### Paso 2: Importar y Usar
```tsx
import React from 'react';
import { LiquidFluidTabBar, TabItem } from '@/components/ui/LiquidFluidTabBar';

// Rutas e iconos de tu proyecto (SVG path d estándar)
const myTabs: TabItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    sublabel: 'Todo en un solo lugar',
    iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  },
  {
    id: 'orders',
    label: 'Pedidos',
    sublabel: 'Tus compras recientes',
    iconPath: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    sublabel: 'Configuración y seguridad',
    iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-24">
      <main>{children}</main>

      {/* Navbar fija o flotante en el fondo */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <LiquidFluidTabBar
            items={myTabs}
            defaultActiveId="home"
            onChange={(tab) => console.log('Navegando a:', tab.id)}
          />
        </div>
      </div>
    </div>
  );
}
```

##### Paso 3: ¿Cómo cambia de color con tu marca?
El componente usa las clases semánticas de Tailwind:
- Fondo de la barra: adapta el color de tu fondo o card (`bg-surface` o `#322a56`).
- Color del monte y la gotita: toma automáticamente tu color `--primary` configurado en tu `tailwind.config.js` o `globals.css`.

---

#### 📱 Cómo usarla en una App Móvil (Flutter)

##### Paso 1: Copiar el archivo
```bash
cp ~/Desktop/Software_Development/templates/mobile/navigation/liquid_fluid_tab_bar.dart lib/widgets/
```

##### Paso 2: Utilizarla en un `Scaffold`
```dart
import 'package:flutter/material.dart';
import 'package:mi_app/widgets/liquid_fluid_tab_bar.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tabIndex = 0;

  final List<LiquidTabItem> _tabs = const [
    LiquidTabItem(
      id: 'home',
      label: 'Inicio',
      sublabel: 'Resumen diario',
      iconOutline: Icons.home_outlined,
      iconFilled: Icons.home,
    ),
    LiquidTabItem(
      id: 'messages',
      label: 'Mensajes',
      sublabel: '3 mensajes nuevos',
      iconOutline: Icons.chat_bubble_outline,
      iconFilled: Icons.chat_bubble,
    ),
    LiquidTabItem(
      id: 'profile',
      label: 'Perfil',
      sublabel: 'Ajustes de cuenta',
      iconOutline: Icons.person_outline,
      iconFilled: Icons.person,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Pantalla actual: ${_tabs[_tabIndex].label}')),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.only(bottom: 24),
        child: LiquidFluidTabBar(
          items: _tabs,
          initialIndex: _tabIndex,
          onTabSelected: (index) => setState(() => _tabIndex = index),
        ),
      ),
    );
  }
}
```
*En Flutter, el monte y los iconos toman automáticamente tu `ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: ...))`, sin tocar una sola línea de código interno.*

---

## 🤖 Cómo pedirle a un Agente de IA que la use por ti

En cualquier proyecto futuro, no necesitas copiar código a mano si estás usando un agente (Antigravity, Codex, etc.). Solo dile:

> *"Integra la barra de navegación `LiquidFluidTabBar` de mi repositorio `~/Desktop/Software_Development/templates/web/navigation/LiquidFluidTabBar.tsx` en el layout móvil de este proyecto. Configura las rutas para Home, Carrito y Cuenta usando la paleta de este proyecto."*

El agente irá directamente al archivo, lo copiará y lo conectará con las rutas de tu proyecto automáticamente.

---

## 🛒 2. E-Commerce & Checkout (Feedback Interactivo)

### 🖨️ Thermal Receipt Printer Animation (Animación Impresora de Recibos)
*Terminal punto de venta (POS) retro con micro-pantalla LCD digital interactiva, botón físico con giro de procesamiento y deslizamiento fluido del recibo de papel con corte troquelado en zig-zag.*

- **Vista previa / Inspiración:** `Docs/Inspiraciones/Animaciones/Printing.jpg` y `Printing.mp4`
- **Código Fuente Web (React/Tailwind):** `templates/web/ecommerce/ReceiptPrinterModal.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/ecommerce/receipt_printer_modal.dart`

#### 💡 Cuándo y cómo usarlo:
- **Pantalla de Confirmación de Pedido / Pago Exitoso:** Sustituye el típico checkmark aburrido por la impresión interactiva de la boleta/recibo real del cliente.
- **Exportar Factura / Comprobante:** Ideal para que el usuario haga clic en "Imprimir comprobante" y vea su resumen animado antes de descargarlo en PDF.

#### Uso rápido en React / Next.js:
```tsx
import { ReceiptPrinterModal } from '@/components/ecommerce/ReceiptPrinterModal';

<ReceiptPrinterModal
  receipt={{
    shopName: 'Mi Tienda SaaS',
    address: 'Av. Providencia 123, Santiago',
    orderNo: '#ORD-9841',
    date: '2026-09-17 21:30',
    items: [
      { name: 'Suscripción Pro Mensual', qty: 1, price: 29.00 },
      { name: 'Dominio Personalizado', qty: 1, price: 12.00 }
    ],
    taxRate: 0.19, // IVA Chile 19%
    currencySymbol: '$',
    footerMessage: '¡Gracias por tu compra!'
  }}
  onPrintComplete={() => console.log('Impresión completada')}
/>
```

---

## 🃏 3. Carruseles & Sliders Espaciales (Showcase Premium)

### 🪐 OSMO Spatial 3D Curved Cards Slider (Carrusel Cilíndrico)
*Galería espacial 3D con curvatura cilíndrica real (`perspective` + `rotateY` tangencial + `translateZ`), desenfoque y atenuación de brillo en tarjetas periféricas y control de píldora flotante con indicadores dinámicos.*

- **Vista previa / Video de Referencia:** `Docs/Inspiraciones/osmo/osmo-spatial-cards-slider-gsap-1440x900.mp4`
- **Código Fuente Web (React/Tailwind):** `templates/web/cards/SpatialCardsSlider.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/cards/spatial_cards_slider.dart`

#### 💡 Cuándo y cómo usarlo:
- **Hero de Landing Pages:** Ideal para mostrar proyectos en un portafolio de diseño, productos destacados o testimonios con un impacto visual cinematográfico que no parece de plantilla.
- **Catálogo de Productos / Colecciones:** Permite explorar categorías (ropa, calzado, autos, membresías) con una sensación física de tambor rotatorio.

#### Uso rápido en React / Next.js:
```tsx
import { SpatialCardsSlider } from '@/components/cards/SpatialCardsSlider';

const gallery = [
  { id: '1', title: 'WOOD', imageUrl: '/images/wood.jpg' },
  { id: '2', title: 'GRÄSS', imageUrl: '/images/grass.jpg' },
  { id: '3', title: 'STÊPS', imageUrl: '/images/steps.jpg' },
  { id: '4', title: 'SKIN', imageUrl: '/images/skin.jpg' },
  { id: '5', title: 'CÂP', imageUrl: '/images/cap.jpg' },
];

export default function HeroSection() {
  return (
    <section className="py-20 bg-[#241c19]">
      <SpatialCardsSlider
        items={gallery}
        defaultIndex={2}
        onCardClick={(item) => console.log('Seleccionado:', item.title)}
      />
    </section>
  );
}
```

---

## 🖥️ 4. Menús de Escritorio & Dock (macOS Style)

### 🍏 OSMO Apple macOS Dock Navigation Bar
*Barra de navegación interactiva inspirada en macOS con magnificación parabólica suave en los iconos adyacentes al pasar el cursor, tooltips superiores y cápsula glassmorphic.*

- **Fuente Original de Referencia:** [https://osmo-apple-dock-navigation-bar.webflow.io/](https://osmo-apple-dock-navigation-bar.webflow.io/)
- **Código Fuente Web (React/Tailwind):** `templates/web/navigation/AppleDockNavBar.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/navigation/apple_dock_nav_bar.dart`

#### Uso rápido en React / Next.js:
```tsx
import { AppleDockNavBar } from '@/components/navigation/AppleDockNavBar';

const dockApps = [
  { id: 'notion', label: 'Notion', iconUrl: '/icons/notion.png' },
  { id: 'slack', label: 'Slack', iconUrl: '/icons/slack.png' },
  { id: 'figma', label: 'Figma', iconUrl: '/icons/figma.png' },
  { id: 'spotify', label: 'Spotify', iconUrl: '/icons/spotify.png' },
];

export default function Layout() {
  return <AppleDockNavBar items={dockApps} />;
}
```

---

## ⚓ 5. Navegación por Secciones (Scroll Spy & Anchor Dock)

### 📌 OSMO Section Anchor Dock (Píldora Flotante con Menú Emergente)
*Dock flotante inferior que rastrea la sección activa en scroll (`IntersectionObserver` con fade suave de etiqueta: "01 Discovery", "02 Strategy", "03 Design") y al hacer clic despliega un menú numerado hacia arriba para salto instantáneo.*

- **Vista previa / Video de Referencia:** `Docs/Inspiraciones/osmo/osmo-section-anchor-dock-1440x900.mp4`
- **Código Fuente Web (React/Tailwind):** `templates/web/navigation/SectionAnchorDock.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/navigation/section_anchor_dock.dart`

#### Uso rápido en React / Next.js:
```tsx
import { SectionAnchorDock } from '@/components/navigation/SectionAnchorDock';

const sections = [
  { id: 'sec-01', num: '01', label: 'Discovery' },
  { id: 'sec-02', num: '02', label: 'Strategy' },
  { id: 'sec-03', num: '03', label: 'Design' },
  { id: 'sec-04', num: '04', label: 'Development' },
  { id: 'sec-05', num: '05', label: 'Launch' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Contenido con secciones cuyos IDs coincidan */}
      <SectionAnchorDock sections={sections} />
    </div>
  );
}
```

---

## ✍️ 6. Tipografía Cinematográfica (Hero Headings)

### 🌀 OSMO Rotating Text Flipper (Texto Rodante 3D)
*Efecto tipográfico de alta conversión para títulos principales de Landing Pages. Hace rotar en 3D (`rotateX`) sobre un eje cilíndrico una serie de palabras clave de impacto alternando con fluidez sin descolocar el resto de la frase.*

- **Vista previa / Video de Referencia:** `Docs/Inspiraciones/osmo/osmo-rotating-text-1440x900.mp4`
- **Código Fuente Web (React/Tailwind):** `templates/web/typography/RotatingTextFlipper.tsx`
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/typography/rotating_text_flipper.dart`

#### Uso rápido en React / Next.js:
```tsx
import { RotatingTextFlipper } from '@/components/typography/RotatingTextFlipper';

export default function HeroHeadline() {
  return (
    <RotatingTextFlipper
      prefix="Simple "
      words={['tools', 'systems', 'help', 'routines']}
      suffix=" that give growing and ambitious teams more clarity."
      intervalMs={2500}
      highlightColor="text-emerald-400"
    />
  );
}
```

---

## 📸 7. Carruseles en Arco & Estilo Polaroid (Editorial Showcase)

### 🎡 OSMO Polaroid Arch Wheel Carousel (Carrusel en Rueda)
*Carrusel cinematográfico con tarjetas estilo Polaroid vintage (marco blanco crema, foto superior y pie con tipografía bold condensada). La física distribuye las tarjetas a lo largo de un arco/rueda parabólica inferior (`rotateZ` tangencial en abanico + `translateY` en curva descendente).*

- **Código Fuente Web (React/Tailwind):** `templates/web/cards/PolaroidWheelSlider.tsx` (y en `skills/design-system-vault/01-components-ui/cards/polaroid-wheel-slider.tsx`)
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/cards/polaroid_wheel_slider.dart` (y en `skills/design-system-vault/01-components-ui/cards/flutter/`)

#### Uso rápido en React / Next.js:
```tsx
import { PolaroidWheelSlider } from '@/components/cards/PolaroidWheelSlider';

const photos = [
  { id: '1', title: 'YØGA', imageUrl: '/images/yoga.jpg' },
  { id: '2', title: 'RĀDIAL', imageUrl: '/images/radial.jpg' },
  { id: '3', title: 'TRØPICAL', imageUrl: '/images/tropical.jpg' },
  { id: '4', title: 'LEĀF', imageUrl: '/images/leaf.jpg' },
  { id: '5', title: 'DŪBAI', imageUrl: '/images/dubai.jpg' },
];

export default function GallerySection() {
  return (
    <section className="py-20 bg-[#242b26]">
      <PolaroidWheelSlider
        items={photos}
        defaultIndex={2}
        onSelect={(item) => console.log('Foto seleccionada:', item.title)}
      />
    </section>
  );
}
```

---

## 🎒 8. Showcases de Producto & Píldoras Expansibles (E-Commerce / Hardware)

### 🏷️ OSMO Expanding Feature Pills (Ficha de Producto Interactiva)
*Componente de presentación técnica de producto (Bento Grid de 2 columnas). En reposo muestra el producto aislado sobre una diana técnica y una lista de píldoras con botón "+". Al interactuar, la píldora se expande mostrando su explicación detallada, el botón "+" se transforma en "x" y la columna visual conmuta a la escena de acción o fotografía de detalle correspondiente con botón de retorno.*

- **Código Fuente Web (React/Tailwind):** `templates/web/features/ExpandingFeaturePills.tsx` (y en `skills/design-system-vault/01-components-ui/features/expanding-feature-pills.tsx`)
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/features/expanding_feature_pills.dart` (y en `skills/design-system-vault/01-components-ui/features/flutter/`)

#### Uso rápido en React / Next.js:
```tsx
import { ExpandingFeaturePills } from '@/components/features/ExpandingFeaturePills';

const features = [
  {
    id: 'movement',
    title: 'Effortless movement',
    description: 'Four-way stretch and a tuned cut move with you — so every stride and turn feels natural.',
    mediaUrl: '/images/lifestyle-run.jpg',
  },
  {
    id: 'waterproof',
    title: 'Storm-ready waterproofing',
    description: 'A sealed outer layer sheds rain on contact, with water beading off before it ever soaks in.',
    mediaUrl: '/images/rain-beading.jpg',
  },
];

export default function ProductDetail() {
  return (
    <ExpandingFeaturePills
      productImage="/images/tactical-backpack.png"
      productAlt="Tactical Backpack"
      features={features}
    />
  );
}
```

---

## 🗂️ 9. Pilas de Tarjetas con Desprendimiento por Gravedad (Dropping Cards Stack)

### 🃏 OSMO Dropping Cards Stack (Pila de Tarjetas con Ciclo Físico de Caída)
*Pila de tarjetas superpuestas en profundidad diagonal (desfase hacia abajo y a la derecha). Al avanzar, la tarjeta superior se desengancha y cae en rotación física simulando gravedad hacia la parte inferior de la pantalla mientras las tarjetas traseras avanzan al frente, reciclándose la tarjeta caída al final del mazo.*

- **Código Fuente Web (React/Tailwind):** `templates/web/cards/DroppingCardsStack.tsx` (y en `skills/design-system-vault/01-components-ui/cards/dropping-cards-stack.tsx`)
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/cards/dropping_cards_stack.dart` (y en `skills/design-system-vault/01-components-ui/cards/flutter/dropping_cards_stack.dart`)

#### 💡 Cuándo y cómo usarlo:
- **Portafolios de Servicios / Agencia:** Presentación de capacidades clave (`Branding & Identity`, `Marketing`, `UX Strategy`, `Web Development`) de forma táctil e interactiva.
- **Onboarding & Tour Guiado:** Explicación paso a paso de features en plataformas SaaS y aplicaciones móviles.

#### Uso rápido en React / Next.js:
```tsx
import { DroppingCardsStack } from '@/components/cards/DroppingCardsStack';

const services = [
  {
    id: "branding",
    title: "Branding & Identity.",
    tags: ["Brand Strategy", "Logo Design", "Visual Identity"],
    imageUrl: "/images/branding.jpg",
    bgColor: "#f3b755",
    textColor: "#111827",
  },
  {
    id: "marketing",
    title: "Marketing.",
    tags: ["Paid Ads", "SEO", "Growth Funnels"],
    imageUrl: "/images/marketing.jpg",
    bgColor: "#ffffff",
    textColor: "#111827",
  },
  {
    id: "ux",
    title: "UX Strategy.",
    tags: ["Design Systems", "Prototyping", "User Research"],
    imageUrl: "/images/ux.jpg",
    bgColor: "#7a52e0",
    textColor: "#ffffff",
  }
];

export default function ServicesSection() {
  return (
    <section className="py-24 bg-[#1e1e28]">
      <DroppingCardsStack items={services} />
    </section>
  );
}
```

---

## 🏔️ 10. Tarjetas Apilables en Perspectiva 3D (Scroll Sticky Stack)

### 🧱 OSMO Stacking Cards 3D (Efecto de Apilamiento en Profundidad con CSS / Motion)
*Sección de tarjetas pegajosas (`position: sticky`) que se apilan con scroll. A medida que una nueva tarjeta sube y cubre a la anterior, la tarjeta inferior se inclina hacia atrás en 3D (`perspective(60em) rotateX(25deg)`), se reduce sutilmente en escala (`scale(0.85)`) y se oscurece (`filter: brightness(0.45)`), simulando una profundidad física hiperrealista.*

- **Fuente Original de Referencia:** [https://osmo-stacking-cards-3d-css.webflow.io/](https://osmo-stacking-cards-3d-css.webflow.io/)
- **Código Fuente Web (React/Tailwind/Framer Motion):** `templates/web/cards/StackingCards3D.tsx` (y en `skills/design-system-vault/01-components-ui/cards/stacking-cards-3d.tsx`)
- **Código Fuente Mobile (Flutter/Dart):** `templates/mobile/cards/stacking_cards_3d.dart` (y en `skills/design-system-vault/01-components-ui/cards/flutter/stacking_cards_3d.dart`)

#### 💡 Cuándo y cómo usarlo:
- **Secciones de Propuesta de Valor y Features:** Presenta 3 a 5 beneficios o pilares clave sin obligar al usuario a cambiar de página, manteniendo el foco visual tarjeta a tarjeta.
- **Planes de Precios o Casos de Estudio:** Excelente para estructurar casos de éxito o comparativas en Landing Pages corporativas.

#### Uso rápido en React / Next.js:
```tsx
import { StackingCards3D } from '@/components/cards/StackingCards3D';

const cards = [
  {
    id: 'feature-1',
    title: 'Velocidad Absoluta',
    description: 'Arquitectura edge computing optimizada para latencias menores a 50ms en todo el mundo.',
    bgColor: '#e8c4b8',
    textColor: '#2b1a12',
  },
  {
    id: 'feature-2',
    title: 'Seguridad Militar',
    description: 'Cifrado de extremo a extremo y cumplimiento estricto con normativas GDPR y Ley 21.719.',
    bgColor: '#dde3c0',
    textColor: '#1d2212',
  },
  {
    id: 'feature-3',
    title: 'Autonomía Agéntica',
    description: 'Gobernanza y trazabilidad auditada para agentes autónomos sin fricción operativa.',
    bgColor: '#c9d6e8',
    textColor: '#121a24',
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-black">
      <StackingCards3D items={cards} />
    </main>
  );
}
```
