---
name: vanta-backgrounds
description: Vanta.js one-line animated 3D backgrounds (waves, birds, fog, net, globe, clouds, cells, halo, topology, dots, rings) with three.js/p5, mouse & gyro interaction, React/Next.js cleanup. Use for fast live backgrounds when a custom shader is overkill.
---

# Vanta.js animated backgrounds

Source: https://github.com/tengbao/vanta (MIT). Gallery/configurator: https://www.vantajs.com

## Script tags (fastest)
```html
<div id="hero" style="height:100vh"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"></script>
<script>
  const effect = VANTA.WAVES({
    el: '#hero',
    mouseControls: true, touchControls: true, gyroControls: false,
    minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
    color: 0x14112b, shininess: 40, waveHeight: 18, waveSpeed: 0.7, zoom: 0.9,
  })
  // effect.setOptions({ color: 0xff6ad5 })  — update live (e.g. per section)
  // effect.resize(); effect.destroy()
</script>
```
Vanta's three.js effects target the legacy global build (r134 per the README). Effects: `WAVES, BIRDS, FOG, CLOUDS, CLOUDS2, GLOBE, NET, CELLS, TRUNK*, TOPOLOGY*, DOTS, RINGS, HALO` (*p5.js).

## npm + React
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import NET from 'vanta/dist/vanta.net.min'

export function VantaNet() {
  const el = useRef<HTMLDivElement>(null)
  const [fx, setFx] = useState<any>(null)
  useEffect(() => {
    if (!fx && el.current) setFx(NET({ el: el.current, THREE, color: 0x7c5cff, backgroundColor: 0x0b0b10, points: 12, maxDistance: 22, spacing: 18 }))
    return () => fx?.destroy()
  }, [fx])
  return <div ref={el} className="absolute inset-0 -z-10" />
}
```
Passing a modern `three` from npm usually works for most effects, but if one breaks pin `three@0.134.0` for Vanta or load it via the script tag.

## Good presets for agencies
- FOG: `highlightColor 0xff6ad5, midtoneColor 0x5b2bff, lowlightColor 0x0d0b1f, baseColor 0x000000, blurFactor 0.6, speed 1.2` — dreamy gradient smoke.
- NET: tech/SaaS constellation.
- HALO: `baseColor 0x1a0533, size 1.4, amplitudeFactor 1.5` — glowing ring hero.
- BIRDS: playful flocking.

## Notes
- Each effect is its own WebGL context — use at most one per page; destroy on route change.
- Disable under `prefers-reduced-motion` (render a static gradient instead).
- For brand-unique work, graduate to `animated-gradient-mesh` or `shader-backgrounds-raymarching`.
