---
name: webgl-fluid-simulation
description: Interactive WebGL fluid/smoke simulation background that reacts to the cursor (Pavel Dobryakov's WebGL-Fluid-Simulation, MIT, included verbatim + a website-ready adaptation). Use for live, mesmerizing hero backgrounds where ink/smoke follows the mouse.
---

# WebGL fluid simulation background

Source: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation (MIT © 2017 Pavel Dobryakov). Files in `resources/`:
- `script.original.js` — the original, verbatim.
- `fluid-background.js` — adapted for sites: no promo/analytics/dat.GUI, uses `<canvas id="fluid">`, splats on mouse *hover* over the whole window (canvas can be `pointer-events: none`), no keyboard shortcuts.
- `LDR_LLL1_0.png` — dithering texture used by the sunrays/bloom passes (serve next to the page or edit the path in `createTextureAsync('LDR_LLL1_0.png')`).
- `LICENSE-WebGL-Fluid-Simulation` — keep this notice.

## Drop-in usage
```html
<canvas id="fluid"></canvas>
<style>
  #fluid { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; }
</style>
<script src="/fluid-background.js" defer></script>
```
Copy `resources/fluid-background.js` and `resources/LDR_LLL1_0.png` into `public/`.

## Tuning (edit the `config` object at the top of the file)
| Key | Effect | Brand-friendly values |
|---|---|---|
| `DENSITY_DISSIPATION` | how fast ink fades | 2–4 for subtle trails, 0.5 for lingering smoke |
| `VELOCITY_DISSIPATION` | how fast motion stops | 0.2–1 |
| `CURL` | swirliness/vorticity | 0–10 calm, 30 default, 50 wild |
| `SPLAT_RADIUS` | brush size | 0.1–0.3 |
| `SPLAT_FORCE` | push strength | 3000–6000 |
| `COLORFUL` / `COLOR_UPDATE_SPEED` | rainbow cycling | false for brand palette |
| `BACK_COLOR`, `TRANSPARENT` | background | `TRANSPARENT: true` to layer over CSS gradients |
| `BLOOM`, `SUNRAYS` | glow passes | disable on mobile for perf |
| `SIM_RESOLUTION`, `DYE_RESOLUTION` | quality | 128 / 512 on mobile |

Brand colors: replace `generateColor()` body to return your palette, e.g.
```js
function generateColor () {
  const palette = [[0.48, 0.36, 1.0], [1.0, 0.42, 0.84], [0.3, 0.9, 0.8]];
  const c = palette[Math.floor(Math.random() * palette.length)];
  return { r: c[0] * 0.15, g: c[1] * 0.15, b: c[2] * 0.15 };   // keep low; bloom amplifies
}
```

## React / Next.js
Wrap as a client component that injects the script once, or port into a module: the file is plain script scope — easiest is `<Script src="/fluid-background.js" strategy="afterInteractive" />` with `<canvas id="fluid" />` in the layout.

## Ideas
- Put white headline text with `mix-blend-mode: difference` above the fluid.
- Fire `splatStack.push(5)` (random bursts) when sections enter view or on button click.
- Alternative libraries: `webgl-fluid` (npm wrapper, MIT), `smokey-fluid-cursor`.

## Perf
Runs ~3–6ms/frame on laptops. Pause by setting `config.PAUSED = true` when the hero is offscreen (IntersectionObserver) — the loop keeps running cheaply but skips simulation steps.
