---
name: tsparticles-backgrounds
description: tsParticles configurable particle backgrounds — constellations/links, snow, confetti, fireworks, bubbles, interactive repulse/grab/connect on hover, React/Vue/vanilla setup with slim bundles. Use for quick interactive 2D particle backgrounds and celebration effects.
---

# tsParticles

Source: https://github.com/tsparticles/tsparticles (MIT). Successor to particles.js.

```bash
npm i @tsparticles/react @tsparticles/slim     # slim = most features, smaller bundle
# or vanilla: npm i @tsparticles/engine @tsparticles/slim
```

## React
```tsx
'use client'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useEffect, useMemo, useState } from 'react'

export function ParticlesBg() {
  const [ready, setReady] = useState(false)
  useEffect(() => { initParticlesEngine(async (engine) => { await loadSlim(engine) }).then(() => setReady(true)) }, [])
  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: 'transparent' },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 80, density: { enable: true } },
      color: { value: ['#7c5cff', '#ff6ad5', '#2de2e6'] },
      links: { enable: true, distance: 140, color: '#ffffff', opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.6, outModes: { default: 'out' } },
      opacity: { value: { min: 0.3, max: 0.8 } },
      size: { value: { min: 1, max: 3 } },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: ['grab', 'bubble'] }, onClick: { enable: true, mode: 'push' } },
      modes: { grab: { distance: 180, links: { opacity: 0.5 } }, bubble: { distance: 200, size: 5, duration: 2 }, push: { quantity: 4 } },
    },
  }), [])
  return ready ? <Particles id="tsparticles" options={options} /> : null
}
```

## Vanilla
```js
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
await loadSlim(tsParticles)
await tsParticles.load({ id: 'bg', options: { /* same options */ } })
```

## Presets & effects
- `@tsparticles/preset-snow`, `-stars`, `-fireworks`, `-confetti`, `-links`, `-bubbles` → `preset: 'snow'`.
- One-shot confetti on CTA success: `npm i @tsparticles/confetti` → `confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } })`.
- Polygon mask (particles forming a logo SVG): `@tsparticles/plugin-polygon-mask`.

## Perf
Canvas 2D — fine up to ~150 linked particles; links are O(n²). Reduce `number.value` on mobile via `responsive: [{ maxWidth: 768, options: { particles: { number: { value: 30 } } } }]`. For thousands of particles use WebGL (`threejs-gpgpu-particles`).
