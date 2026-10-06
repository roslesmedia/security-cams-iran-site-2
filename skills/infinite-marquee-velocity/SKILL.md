---
name: infinite-marquee-velocity
description: Infinite looping marquees/tickers and carousels that speed up, reverse and skew with scroll velocity (GSAP horizontalLoop helper, CSS-only fallback). Use for logo walls, giant scrolling headlines, and draggable infinite sliders.
---

# Infinite marquees & velocity-reactive loops

## CSS-only marquee (duplicate content once)
```html
<div class="marquee"><div class="marquee__track"><span>Brand • Strategy • Motion • </span><span aria-hidden="true">Brand • Strategy • Motion • </span></div></div>
```
```css
.marquee { overflow: hidden; white-space: nowrap; }
.marquee__track { display: inline-flex; animation: marquee 20s linear infinite; }
.marquee:hover .marquee__track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%) } }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none } }
```

## GSAP velocity marquee (speeds up & flips direction with scroll)
```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const track = document.querySelector('.marquee__track')
const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 20, repeat: -1 })
let dir = 1
ScrollTrigger.create({
  onUpdate(self) {
    if (self.direction !== dir) { dir = self.direction }
    const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6)
    gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true })
    gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: 'power2.out' }) // settle back
  },
})
// Skew with velocity
const skew = gsap.quickTo('.marquee', 'skewX', { duration: 0.4 })
ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-10, 10, s.getVelocity() / -200)) })
```
Negative timeScale on a repeat:-1 tween plays backwards seamlessly — no wrap math needed.

## GSAP horizontalLoop helper (variable-width items, draggable, snapping)
The official helper from GSAP docs ("Seamless loop" helper function). Usage:
```js
const loop = horizontalLoop('.slide', { repeat: -1, speed: 1, paddingRight: 32, draggable: true, center: true,
  onChange: (el, i) => { /* active slide */ } })
loop.next({ duration: 0.6, ease: 'power3' }); loop.toIndex(3)
```
Copy the helper from https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop (requires `Draggable` + `InertiaPlugin` for drag — both free now).

## Lenis-driven variant (no ScrollTrigger)
```js
let x = 0
lenis.on('scroll', ({ velocity }) => { v = velocity })
gsap.ticker.add((t, dt) => {
  x -= (1 + Math.abs(v) * 0.2) * dt * 0.05 * Math.sign(v || 1)
  gsap.set(track, { xPercent: gsap.utils.wrap(-50, 0, x) })
})
```

## Design notes
Giant outline type (`-webkit-text-stroke: 1px currentColor; color: transparent`) alternating with filled rows moving opposite directions is the classic agency look. Fill viewport width ×2 minimum so no gap appears on ultrawide screens.
