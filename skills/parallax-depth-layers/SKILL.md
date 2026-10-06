---
name: parallax-depth-layers
description: Multi-layer depth parallax — scroll parallax, mouse/gyro tilt parallax, 3D CSS perspective scenes and layered hero illustrations. Use for hero sections with foreground/background layers, floating elements, and cursor-reactive depth.
---

# Depth parallax (scroll + mouse + gyro)

## Scroll parallax via data attributes (GSAP)
```html
<div class="hero">
  <img data-depth="0.1" src="sky.webp"><img data-depth="0.3" src="mountains.webp"><h1 data-depth="0.5">Title</h1><img data-depth="0.8" src="trees.webp">
</div>
```
```js
gsap.utils.toArray('[data-depth]').forEach((el) => {
  gsap.to(el, { yPercent: () => -60 * el.dataset.depth, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
})
```

## Mouse parallax (smoothed with quickTo)
```js
const layers = gsap.utils.toArray('[data-depth]').map((el) => ({
  x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }),
  y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }),
  d: +el.dataset.depth,
}))
addEventListener('pointermove', (e) => {
  const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5
  layers.forEach((l) => { l.x(nx * 80 * l.d); l.y(ny * 80 * l.d) })
})
```

## Gyroscope on mobile (iOS needs permission from a tap)
```js
async function enableGyro() {
  if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
    if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return
  }
  addEventListener('deviceorientation', (e) => {
    const nx = gsap.utils.clamp(-1, 1, e.gamma / 30), ny = gsap.utils.clamp(-1, 1, (e.beta - 45) / 30)
    layers.forEach((l) => { l.x(nx * 40 * l.d); l.y(ny * 40 * l.d) })
  })
}
```

## 3D card tilt with glare
```js
card.addEventListener('pointermove', (e) => {
  const r = card.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
  gsap.to(card, { rotateY: (px - 0.5) * 20, rotateX: (0.5 - py) * 20, transformPerspective: 900, duration: 0.4 })
  card.style.setProperty('--gx', `${px * 100}%`); card.style.setProperty('--gy', `${py * 100}%`)
})
card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' }))
```
```css
.card { transform-style: preserve-3d; position: relative; }
.card::after { content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,.35), transparent 50%); mix-blend-mode: overlay; }
.card .pop { transform: translateZ(60px); }   /* inner layers pop out */
```

## Pure-CSS perspective parallax (no JS)
```css
.scroller { height: 100vh; overflow-y: auto; perspective: 1px; }
.layer-back { transform: translateZ(-2px) scale(3); }  /* scale = 1 + (-z / perspective) */
```
(Breaks Lenis/window scroll — use only on contained scrollers.)

## WebGL depth parallax from a single photo
Use a depth map (generate with Depth-Anything / MiDaS) and offset UVs in a shader: `uv += uMouse * (texture2D(uDepth, uv).r - 0.5) * 0.03;` — the "fake 3D photo" effect.
