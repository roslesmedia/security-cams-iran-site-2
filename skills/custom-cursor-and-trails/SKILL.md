---
name: custom-cursor-and-trails
description: Custom cursors (dot + lagging ring, blend-mode difference, contextual labels like "View"/"Drag"), magnetic buttons, image trails following the mouse, and canvas/WebGL cursor trails. Use for the interactive micro-layer that makes agency sites feel alive.
---

# Custom cursor, magnetic elements & mouse trails

All patterns use GSAP `quickTo` (see `gsap-core-timelines`). Gate everything behind fine pointers:
```js
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
if (!fine || reduce) return
```

## Dot + lagging ring with contextual states
```html
<div class="cursor"><div class="cursor__dot"></div><div class="cursor__ring"><span class="cursor__label"></span></div></div>
```
```css
.cursor > * { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 10000; translate: -50% -50%; border-radius: 50%; }
.cursor__dot { width: 6px; height: 6px; background: #fff; mix-blend-mode: difference; }
.cursor__ring { width: 40px; height: 40px; border: 1px solid rgba(255,255,255,.6); display: grid; place-items: center; mix-blend-mode: difference;
  transition: width .4s cubic-bezier(.16,1,.3,1), height .4s cubic-bezier(.16,1,.3,1), background .3s; }
.cursor.is-hover .cursor__ring { width: 80px; height: 80px; background: #fff; }
.cursor.has-label .cursor__ring { width: 96px; height: 96px; background: #fff; mix-blend-mode: normal; }
.cursor__label { font: 500 12px/1 var(--font); color: #000; opacity: 0; }
.cursor.has-label .cursor__label { opacity: 1; }
html.has-custom-cursor, html.has-custom-cursor * { cursor: none !important; }
```
```js
document.documentElement.classList.add('has-custom-cursor')
const root = document.querySelector('.cursor'), label = root.querySelector('.cursor__label')
const dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.1 }), dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.1 })
const rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.5, ease: 'power3' })
addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) })
document.addEventListener('pointerover', (e) => {
  const t = e.target.closest('a, button, [data-cursor]')
  root.classList.toggle('is-hover', !!t && !t.dataset.cursor)
  root.classList.toggle('has-label', !!t?.dataset.cursor)
  label.textContent = t?.dataset.cursor || ''          // <a data-cursor="View">
})
```

## Magnetic buttons
```js
document.querySelectorAll('[data-magnetic]').forEach((el) => {
  const strength = +el.dataset.magnetic || 0.4
  const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' }), y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  const inner = el.querySelector('span')
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    const mx = e.clientX - (r.left + r.width / 2), my = e.clientY - (r.top + r.height / 2)
    x(mx * strength); y(my * strength)
    inner && gsap.to(inner, { x: mx * strength * 0.5, y: my * strength * 0.5, duration: 0.6 })  // text moves more = depth
  })
  el.addEventListener('pointerleave', () => { x(0); y(0); inner && gsap.to(inner, { x: 0, y: 0, duration: 0.6 }) })
})
```

## Image trail (images spawn along the mouse path)
```js
const imgs = [...document.querySelectorAll('.trail img')]   // absolutely positioned, opacity 0
let idx = 0, last = { x: 0, y: 0 }
addEventListener('pointermove', (e) => {
  if (Math.hypot(e.clientX - last.x, e.clientY - last.y) < 80) return   // spawn distance
  last = { x: e.clientX, y: e.clientY }
  const img = imgs[idx++ % imgs.length]
  gsap.killTweensOf(img)
  gsap.timeline()
    .set(img, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50, autoAlpha: 1, scale: 0.6, zIndex: idx, rotate: gsap.utils.random(-12, 12) })
    .to(img, { scale: 1, duration: 0.4, ease: 'power3.out' })
    .to(img, { autoAlpha: 0, scale: 0.8, y: '+=60', duration: 0.8, ease: 'power3.in' }, 0.5)
})
```

## Smooth ribbon trail (canvas 2D)
```js
const pts = Array.from({ length: 24 }, () => ({ x: innerWidth / 2, y: innerHeight / 2 }))
const ctx = trailCanvas.getContext('2d'); let mouse = { x: innerWidth / 2, y: innerHeight / 2 }
addEventListener('pointermove', (e) => (mouse = { x: e.clientX, y: e.clientY }))
gsap.ticker.add(() => {
  ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
  pts[0].x += (mouse.x - pts[0].x) * 0.4; pts[0].y += (mouse.y - pts[0].y) * 0.4
  for (let i = 1; i < pts.length; i++) { pts[i].x += (pts[i - 1].x - pts[i].x) * 0.45; pts[i].y += (pts[i - 1].y - pts[i].y) * 0.45 }
  for (let i = 1; i < pts.length; i++) {
    ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y)
    ctx.strokeStyle = `rgba(124, 92, 255, ${1 - i / pts.length})`; ctx.lineWidth = 12 * (1 - i / pts.length); ctx.lineCap = 'round'; ctx.stroke()
  }
})
```
For a glowing liquid trail use `webgl-fluid-simulation` or the OGL flowmap (`ogl-lightweight-webgl`). In R3F: drei `<Trail>`.

## A11y
Never hide the native cursor on touch devices or for keyboard users; keep `:focus-visible` outlines; labels in `data-cursor` must duplicate visible text/aria.
