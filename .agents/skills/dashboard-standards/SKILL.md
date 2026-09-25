---
name: dashboard-standards
description: >-
  Directiva y estándares obligatorios para la creación, rediseño y revisión de dashboards,
  paneles analíticos y visualización de datos en Web, Desktop y Mobile Apps. Aplica las 6 leyes
  anti-ruido, jerarquía visual hero, regla 60-30-10, matriz estricta de selección de gráficos y
  componentes interactivos contextuales (KPIs con anillos/sparklines, mapas de calor hexagonales, etc.).
---

# 📊 Skill: Dashboard Standards & Analytics UI Design

Esta skill establece las directivas innegociables para diseñar, implementar o refactorizar **dashboards**, vistas analíticas, KPI cards y gráficos en cualquier plataforma (React, Next.js, Flutter, Vue, Tailwind).

---

## 🏛️ 1. Las 6 Leyes Anti-Ruido (Innegociables)

1. **Insight Principal (Hero First):** 
   - Prohibido arrancar con una pantalla plana donde todo compite por atención.
   - El dashboard debe comenzar con una métrica reina o insight dominante que responde en 3 segundos: *"¿Cómo va el negocio/sistema hoy?"*. Las demás tarjetas son de soporte.
2. **Contaminación Cromática Cero (Regla 60-30-10):**
   - **60% Neutral (Base):** Superficies, fondos y contenedores (`surface`, `card`, `background`).
   - **30% Soporte:** Bordes, separadores y texto secundario (`border`, `muted-foreground`).
   - **10% Acento Semántico:** Reservado estrictamente para llamadas a la acción, estados críticos y tendencias (`primary`, verde éxito `+14.5%`, rojo alerta `-24.5%`). Prohibido pintar cada tarjeta de un color distinto.
3. **Primero la Pregunta, luego el Chart:**
   - Nunca pongas un gráfico por capricho visual o relleno. Todo gráfico debe responder una pregunta de negocio específica antes de ser dibujado.
4. **Cero Números Desnudos (Contexto Forzoso):**
   - Un número aislado (`$31K` o `2,471`) no dice nada. Debe incluir siempre su comparativa temporal o de meta (`vs mes anterior`, `vs target`) y, si es posible, un micro-gráfico de tendencia (*sparkline* o anillo de progreso).
5. **Diseño para Escaneo Rápido (Z/F Pattern):**
   - Lectura jerárquica: Métrica macro arriba a la izquierda $\rightarrow$ gráficos de tendencia $\rightarrow$ tablas o desglose de transacciones al final.
6. **Resumen y Filtros Progresivos (Anti-Obesidad de Datos):**
   - Si una métrica o columna no ayuda directamente a tomar una decisión operativa hoy, se elimina o se oculta detrás de un menú/drawer.

---

## 📈 2. Matriz de Decisión: ¿Qué Chart Usar en Cada Caso?

Consulta esta matriz antes de elegir cualquier tipo de gráfico:

| Pregunta de Negocio | Chart Obligatorio | Gráficos Prohibidos | Regla de Implementación |
|---|---|---|---|
| **¿Cómo ha cambiado algo en el tiempo?** | **Spline Line Chart / Area Chart** | Barras con más de 20 columnas apiñadas | Eje X cronológico. Máximo 3 líneas simultáneas. Usar área translúcida con gradiente suave debajo. |
| **¿Qué categoría o canal es mayor?** | **Bar Chart (Horizontal o Vertical)** | Pie charts con más de 4 rebanadas | Si las etiquetas son largas, usa barras horizontales. Ordena de mayor a menor. |
| **¿Cómo se reparte el 100% de un total?** | **Donut Chart con total en el centro** | Pie Charts 3D o con muchas porciones | Máximo 4-5 segmentos. El centro del anillo debe mostrar la cifra total consolidada (`$214K Total`). |
| **¿Dónde se concentra la densidad o volumen?** | **Hexagonal Binning (Colmena Honeycomb)** | Mapas saturados con cientos de pines gigantes | Agrupa datos por celdas hexagonales regulares cuya opacidad/color refleja la intensidad de la zona caliente. |
| **¿Cómo se comparan múltiples atributos?** | **Radar / Spider Chart Hexagonal** | Tablas de 10 columnas numéricas | Ideal para evaluar perfiles balanceados (Rendimiento, Velocidad, Seguridad, etc.). Escalas normalizadas 0-100%. |
| **¿Cómo avanzamos hacia la meta del mes?** | **Radial Progress / Bullet Bar** | Medidores tipo velocímetro de auto anticuados | Muestra: Valor actual, Meta/Target y porcentaje de cumplimiento. |

---

## 🎨 3. Patrones Visuales de Alta Gama Integrados

Al diseñar vistas analíticas, inspírate en los 3 patrones del repositorio (`Docs/Inspiraciones/Dashboards/`):

### A. Interactive KPI & Progress Donut Card (Light/Theme Aware)
- Valor principal en cuerpo dominante (`font-bold`, 32-40px).
- Micro-badge porcentual tonal (`↗ 14.5%`).
- Donut circular con gradiente continuo que encierra el total consolidado en su centro.
- Sub-píldoras inferiores con micro-anillos de progreso por categoría de asignación.

### B. Night Shift Hero Wave & Dual KPI (Mobile / Dark Mode)
- Fondo deep neutral (carbón oscuro, no negro puro `#000000`).
- Doble tarjeta de métricas con indicadores positivos/negativos contextualmente resaltados.
- Onda continua spline fluida (sin rejillas molestas).
- Selector de mes activo con píldora flotante y punto interactivo focal.

### C. Bento Analytics con Cluster Hexagonal & Categorical Bars (Desktop)
- Layout modular Bento Grid con radios de borde suaves (`rounded-2xl`).
- Ticker horizontal superior de métricas de 1 línea (`Earnings`, `Orders`, `Conversion`).
- Mapa de calor de densidad en colmena hexagonal (*Honeycomb*).
- Barras de ocupación con extremos redondeados (`rounded-t-lg`).

---

## 💻 4. Contratos de Datos Portátiles (DTOs)

Todo componente de dashboard debe implementarse desacoplado de marcas específicas:

```typescript
export interface KpiMetricProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange?: number; // ej: +14.5 o -24.5
  periodLabel: string;       // ej: "vs last month"
  sparklineData?: number[];
  progressRing?: {
    current: number;
    total: number;
    centerLabel?: string;
  };
}

export interface HexBinData {
  id: string;
  label: string;
  density: number; // 0.0 a 1.0 (determina saturación)
}
```

---

## ✅ 5. Checklist de Verificación Pre-Entrega
Antes de dar por cerrado un dashboard:
- [ ] ¿Existe una **métrica Hero** clara que responde la salud del negocio en 3 segundos?
- [ ] ¿Cada número cuenta con su contexto (`vs mes anterior` / `vs meta`)?
- [ ] ¿Se respeta la regla 60-30-10 sin colores de adorno innecesarios?
- [ ] ¿Cuenta con los 4 estados: Loading (Skeleton), Vacío, Error y Éxito?
- [ ] En móvil (<768px), ¿colapsa limpiamente en una columna sin scroll horizontal roto?
