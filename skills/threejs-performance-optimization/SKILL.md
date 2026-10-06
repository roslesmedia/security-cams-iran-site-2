---
name: threejs-performance-optimization
description: Keep WebGL sites at 60fps on laptops and phones — DPR capping, adaptive quality (detect-gpu, PerformanceMonitor), draw-call reduction, texture budgets, on-demand rendering, offscreen pausing, memory disposal, mobile fallbacks, Lighthouse/LCP protection. Use before shipping any 3D/animated site or when it stutters.
---

# WebGL performance checklist

## Measure first
- `stats-gl` (FPS + GPU ms), `renderer.info.render.calls/triangles`, `renderer.info.memory`.
- Chrome Performance panel with CPU 4x throttle; test on a real mid-range Android and an iPhone.
- Spector.js to inspect every draw call.

## Biggest wins (in order)
1. **Pixel ratio:** `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; on low tier use 1–1.5. Fill-rate is usually the bottleneck for fullscreen shaders.
2. **Draw calls < 100:** merge static meshes (`BufferGeometryUtils.mergeGeometries`), instancing (`threejs-instancing`), texture atlases, share materials.
3. **Textures:** KTX2/Basis (GPU-compressed), ≤2K, power-of-two, mipmaps; dispose unused.
4. **Postprocessing:** fewer passes; pmndrs merges effects; render bloom at half res.
5. **Shaders:** avoid heavy loops/raymarching at full res — render to a half-res target and upscale; limit fBm octaves on mobile.
6. **Shadows:** one shadow-casting light, small map, `shadowMap.autoUpdate = false` + `needsUpdate = true` when static; or bake.
7. **Don't render when nothing changes:** pause offscreen (IntersectionObserver), on tab hidden, and R3F `frameloop="demand"` + `invalidate()` for static scenes.

## Adaptive quality
```js
import { getGPUTier } from 'detect-gpu'   // MIT, pmndrs/detect-gpu
const { tier, isMobile } = await getGPUTier()   // tier 0–3
const Q = { 0: 'fallback', 1: 'low', 2: 'mid', 3: 'high' }[tier]
// tier 0 → show static image/video instead of WebGL
```
R3F: `<PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)}>` and `<AdaptiveDpr pixelated />` from drei.

## Main-thread hygiene
- One rAF: drive Lenis, GSAP, three.js from `gsap.ticker`.
- Never `getBoundingClientRect()` per frame for many elements — cache rects on resize, offset by scroll value.
- Avoid allocating in loops (`new Vector3()` inside onUpdate → GC stutter); reuse temps.
- OffscreenCanvas + worker for heavy scenes (three.js supports it) when the main thread is busy with DOM animation.
- Lazy-load three.js and models after LCP: `const { initScene } = await import('./scene.js')` when the hero canvas enters view / after `requestIdleCallback`.

## Protect Lighthouse / SEO
- Real HTML headline + poster image is LCP; canvas fades in on top.
- `<link rel="preload" as="fetch" href="/model.glb" crossorigin>` only for the hero model.
- Code-split GSAP plugins per page.
- Fonts: `font-display: swap`, subset, preload one weight.

## Memory / SPA
Dispose geometries, materials, textures, render targets on route change; `renderer.dispose()`; watch `renderer.info.memory` returning to baseline.

## Mobile specifics
- iOS Safari: max texture 4096, WebGL context lost under memory pressure — handle `webglcontextlost`.
- Disable mouse-only effects (cursor, hover distortion) on touch: `matchMedia('(hover: hover) and (pointer: fine)')`.
- Reduce particle counts 4–8x; skip transmission/MeshTransmissionMaterial.
- Respect `prefers-reduced-motion` and `Save-Data` (`navigator.connection?.saveData`).
