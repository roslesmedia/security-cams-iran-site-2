---
name: noise-grain-overlay
description: Film grain, noise texture and dithering overlays (SVG feTurbulence, animated CSS grain, shader grain) plus gradient banding fixes. Use to add the tactile, editorial "premium" texture almost every award-winning site has over gradients, photos and WebGL.
---

# Grain / noise overlays

## 1. SVG turbulence grain (no image file)
```html
<svg class="grain" aria-hidden="true">
  <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="100%" height="100%" filter="url(#noise)"/>
</svg>
```
```css
.grain { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; opacity: .08; mix-blend-mode: overlay; }
```

## 2. Animated grain (cheap, GPU-friendly)
Generate a 256×256 noise PNG once (or data URI from canvas) and jitter it:
```js
const c = document.createElement('canvas'); c.width = c.height = 256
const ctx = c.getContext('2d'), img = ctx.createImageData(256, 256)
for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data.set([v, v, v, 28], i) }
ctx.putImageData(img, 0, 0)
document.documentElement.style.setProperty('--grain', `url(${c.toDataURL()})`)
```
```css
body::after { content: ''; position: fixed; inset: -200%; width: 400%; height: 400%; pointer-events: none; z-index: 9999;
  background-image: var(--grain); animation: grain 1s steps(6) infinite; opacity: .5; }
@keyframes grain { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-5%,-10%)} 40%{transform:translate(-15%,5%)} 60%{transform:translate(7%,-25%)} 80%{transform:translate(-5%,25%)} }
@media (prefers-reduced-motion: reduce) { body::after { animation: none } }
```
Huge oversized element + `transform` only = no repaint cost.

## 3. In shaders
```glsl
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
col += (hash12(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.05;   // animated grain, also kills banding
```
Or pmndrs `NoiseEffect` / R3F `<Noise opacity={0.05} premultiply />`.

## 4. Fix gradient banding
Large dark CSS/WebGL gradients band on 8-bit displays. Add 1–2% noise (any method above), or in CSS layer the grain over the gradient. In WebGL, dither before output: `col += (hash12(gl_FragCoord.xy) - .5) / 255.;`.

## Taste
Opacity 4–10% for subtlety; `mix-blend-mode: overlay` or `soft-light` keeps colors rich; on light themes use `multiply` with lower opacity.
