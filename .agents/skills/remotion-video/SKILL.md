---
name: remotion-video
description: Programmatic video creation with React, TypeScript, and Remotion. Use when asked to create promotional videos, product demo reels, teaser trailers, animated social media announcements, or motion graphics from code without third-party video editors.
---

# Remotion Video Creator (Programmatic Video with React)

Use this skill to create production-ready MP4 videos, product advertisements, and animated reels programmatically using React, Tailwind CSS, and Remotion.

## When to Use This Skill

- "Create a promotional video for my product/feature"
- "Generate an animated video announcement for Twitter/LinkedIn"
- "Create a product demo video highlighting key metrics or screens"
- "Program an animated explainer or teaser trailer"
- "Turn screenshots and app UI into an animated marketing reel"

## Why Programmatic Video (Code-to-Video)?

1. **Deterministic & High-Quality:** Renders pixel-perfect 1080p / 4K videos at 60 FPS using standard React components (`spring`, `interpolate`, flexbox, Tailwind).
2. **Dynamic Data:** Can take dynamic prices, app screenshots, metrics, and customer testimonials directly from your codebase.
3. **Reproducible:** Modifying a typo or updating a screen only takes re-running a build command without reopening manual video editing software.

## Project Structure & Quick Setup

When generating a video project inside a repository or standalone folder:

```bash
# Iniciar plantilla limpia de Remotion
npx create-video --template=blank video-promo
cd video-promo
npm install
```

O integrarlo directamente en un proyecto web existente:
```bash
npm install --save-dev remotion @remotion/cli @remotion/tailwind
```

## Core Building Blocks

### 1. Composition Root (`src/Root.tsx`)
```tsx
import { Composition } from "remotion";
import { PromoMain } from "./PromoMain";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductPromo"
      component={PromoMain}
      durationInFrames={180} // 6 segundos a 30fps (o 360 a 60fps)
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "Nuevo Release: Solo-Founder HQ",
        primaryColor: "#4f46e5",
      }}
    />
  );
};
```

### 2. Animations & Sequences (`src/PromoMain.tsx`)
```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";

export const PromoMain: React.FC<{ title: string; primaryColor: string }> = ({ title, primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación física suave (Spring)
  const scale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="bg-slate-950 flex items-center justify-center text-white">
      {/* Escena 1: Intro (Frames 0 a 90) */}
      <Sequence from={0} durationInFrames={90}>
        <div style={{ transform: `scale(${scale})`, opacity }} className="text-center">
          <span className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">Presentando</span>
          <h1 className="text-6xl font-extrabold mt-3 tracking-tight">{title}</h1>
        </div>
      </Sequence>

      {/* Escena 2: Features / Pantallas (Frames 90 a 180) */}
      <Sequence from={90} durationInFrames={90}>
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold">100% Código. 0% Fricción.</h2>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Rendering Commands

```bash
# Vista previa en vivo en el navegador (hot-reload)
npx remotion preview

# Compilar a video final MP4
npx remotion render src/index.ts ProductPromo out/promo.mp4 --codec=h264

# Exportar como imagen fija o thumbnail para redes sociales
npx remotion still src/index.ts ProductPromo out/thumbnail.png --frame=45
```

## Best Practices for Marketing Videos

1. **Aspect Ratios:**
   - **Horizontal (16:9 / 1920x1080):** Landing pages, YouTube, pitch decks.
   - **Vertical (9:16 / 1080x1920):** TikTok, Instagram Reels, YouTube Shorts.
   - **Cuadrado (1:1 / 1080x1080):** Twitter/X feeds, LinkedIn feeds.
2. **Pacing:** Mantén las transiciones ágiles (entre 2 y 4 segundos por escena).
3. **Soundtrack:** Puedes añadir pistas de audio usando `<Audio src={staticFile("music.mp3")} volume={0.8} />`.
