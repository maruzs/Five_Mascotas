---
name: design-system-vault
description: >-
  Mandatory design system and production component vault for creating, building, or redesigning user interfaces.
  Covers B2B SaaS dashboards, dense data tables, KPI cards, high-converting marketing landing pages, e-commerce stores,
  modern desktop apps, and cross-platform native mobile apps (Flutter/Dart).
  Enforces a strict zero-scaffold policy by reusing battle-tested components, kinematic animations (Framer Motion),
  and design tokens packaged directly inside this skill's resources.
---

# Design System Vault (Autonomous Component & UI Engine)

This skill provides an enterprise-grade component vault and design system engine.
Whenever building, styling, or refactoring UI surfaces (web, desktop, or mobile), the agent must act as an elite Principal Design Engineer, strictly reusing and adapting the production-ready code packaged in this skill.

---

## 1. The Zero-Scaffold Directive (Anti-AI Slop)

When requested to build any UI component, page, or layout:
1. **NEVER** generate generic, default Tailwind skeletons or cookie-cutter AI components (such as centered dark heroes with purple gradients, standard 3-card Bootstrap grids, or unstyled tables).
2. **ALWAYS** inspect, extract, and adapt the battle-tested implementations provided in this skill's internal directory tree.

---

## 2. Vault Component Map & Path Resolution

All resources are bundled relative to this skill's directory (`<skill_dir>`):

### A. Web & SaaS Components (`<skill_dir>/01-components-ui/`)
* **Buttons (`buttons/`):**
  - `shimmer-button.tsx`: Shimmering animated light-beam border button with subtle click scaling.
  - `magnetic-button.tsx`: Physics-driven magnetic button tracking cursor proximity (Framer Motion).
* **Cards & Bento Layouts (`cards/`):**
  - `bento-grid.tsx`: Responsive asymmetric grid for SaaS feature showcases with mobile collapse.
  - `tilt-card.tsx`: 3D parallax tilt card rotating based on pointer interaction.
* **Hero Sections (`hero-sections/`):**
  - `interactive-grid-hero.tsx`: High-end hero featuring mouse-interactive grid cells, radial ambient glow, and crisp typography.
* **Navigation & Command Surfaces (`navigation/`):**
  - `floating-navbar.tsx`: Floating pill navbar with backdrop blur (`backdrop-blur-md`), hairline borders, and responsive drawer.
  - `command-menu.tsx`: Fast keyboard-driven Spotlight / Cmd+K dialog.
  - `liquid-fluid-tab-bar.tsx`: Floating tab bar with liquid wave spring physics and upward droplet projection.
  - `apple-dock-nav-bar.tsx`: macOS-inspired floating dock with smooth GPU-accelerated parabolic magnification and tooltips.
  - `section-anchor-dock.tsx`: Scroll-spy anchor dock pill tracking sections with vertical expanding popover menu.
* **Dashboards, Data & Analytics (`dashboards-and-tables/`):**
  - `kpi-metric-card.tsx`: Metric card with sparkline trend, dynamic percentage delta badge, and smooth counter.
  - `data-table.tsx`: Dense enterprise data table with sticky headers, column sorting, pagination, and skeleton loading states.
* **E-Commerce & Commerce Flows (`ecommerce/`):**
  - `product-card.tsx`: Clean product card with interactive swatch selection, badge states, and quick-add actions.
  - `slide-over-cart.tsx`: Smooth slide-over drawer cart with quantity adjustments and checkout summary.
  - `receipt-printer-modal.tsx`: Interactive POS receipt printer with LCD screen, spinning action, tear-off cut, and zoom-in view.
* **Cards & 3D Sliders (`cards/`):**
  - `spatial-cards-slider.tsx`: OSMO cylindrical 3D curved cards slider with touch/mouse drag interaction.
* **Typography & Headlines (`typography/`):**
  - `rotating-text-flipper.tsx`: 3D rolling word flip heading for high-converting landing page heroes.

### B. Mobile & Desktop (Flutter / Dart) (`<skill_dir>/01-components-ui/`)
* **Navigation (`navigation/flutter/`):**
  - `liquid_fluid_tab_bar.dart`: Theme-aware liquid fluid tab bar with spring animations.
  - `apple_dock_nav_bar.dart`: Mobile macOS-style dock with touch proximity magnification.
  - `section_anchor_dock.dart`: Floating section anchor dock with upward popover navigation.
* **E-Commerce (`ecommerce/flutter/`):**
  - `receipt_printer_modal.dart`: POS receipt printer with tear-off and zoom sequence.
* **Cards (`cards/flutter/`):**
  - `custom_bento_card.dart`: Production-ready Bento card widget with Cupertino/Material 3 haptics.
  - `interactive_metric_tile.dart`: Smooth touch-interactive metric tile with animated progress indicators.
  - `spatial_cards_slider.dart`: 3D perspective curved slider with touch gestures.
* **Typography (`typography/flutter/`):**
  - `rotating_text_flipper.dart`: 3D X-axis rolling word flipper for mobile headers.

### C. Motion & Animation Presets (`<skill_dir>/02-animations-motion/`)
* `transitions.ts`: Standardized cubic-bezier curves, kinematic spring presets (damping/stiffness), and micro-interaction timings.
* `text-effects/text-rotator.tsx`: Vertical kinetic typography word rotator.
* `background-particles/radial-glow-background.tsx`: Sub-surface animated ambient light halos for dark mode.

### D. Design Tokens & Palettes (`<skill_dir>/03-design-tokens-palettes/`)
* `dark-tech-linear.css`: Pure OLED charcoal bases, hairline hairlines (`border-white/10`), and deep ambient elevation.
* `saas-b2b-trusted.css`: High-trust enterprise blue/slate palette inspired by Stripe and Mercury.
* `tailwind-preset.js`: Extended Tailwind theme with custom shadows, radius scales, and animation keyframes.

---

## 3. Implementation Workflow

1. **Resolve Skill Location:** Identify the relative directory containing this `SKILL.md`.
2. **Ensure Prerequisite Utilities:** Ensure the target project has standard utility helpers (`clsx`, `tailwind-merge`) or copy the helper function from `01-components-ui/utils.ts`.
3. **Adapt & Inject:** Copy the required component directly into the target project's UI folder (e.g., `src/components/ui/` or `lib/ui/`), adapting import paths and props to match project conventions without introducing unnecessary npm packages.
