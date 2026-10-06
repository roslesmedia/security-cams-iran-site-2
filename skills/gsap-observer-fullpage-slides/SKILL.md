---
name: gsap-observer-fullpage-slides
description: Fullpage section-by-section slide experiences driven by wheel/touch/pointer intent using GSAP Observer (no real scroll). Use for "one section per scroll" hero slideshows, portfolio sliders and gesture-driven WebGL carousels.
---

# GSAP Observer — gesture-driven fullpage slides

Source: greensock/GSAP `gsap/Observer` (based on the official "animated continuous sections" demo pattern).

```js
import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(Observer, SplitText)

const sections = gsap.utils.toArray('section.slide')
const outer = gsap.utils.toArray('.slide .outer')
const inner = gsap.utils.toArray('.slide .inner')
const bgs = gsap.utils.toArray('.slide .bg')
const heads = sections.map((s) => SplitText.create(s.querySelector('h2'), { type: 'chars', mask: 'chars' }))
const wrap = gsap.utils.wrap(0, sections.length)
let current = -1, animating = false

gsap.set(outer, { yPercent: 100 }); gsap.set(inner, { yPercent: -100 })

function goTo(index, dir) {
  index = wrap(index); animating = true
  const f = dir === -1 ? -1 : 1
  const tl = gsap.timeline({ defaults: { duration: 1.25, ease: 'power1.inOut' }, onComplete: () => (animating = false) })
  if (current >= 0) {
    gsap.set(sections[current], { zIndex: 0 })
    tl.to(bgs[current], { yPercent: -15 * f }).set(sections[current], { autoAlpha: 0 })
  }
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 })
  tl.fromTo([outer[index], inner[index]], { yPercent: (i) => (i ? -100 * f : 100 * f) }, { yPercent: 0 }, 0)
    .fromTo(bgs[index], { yPercent: 15 * f }, { yPercent: 0 }, 0)
    .fromTo(heads[index].chars, { autoAlpha: 0, yPercent: 150 * f }, { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power2', stagger: { each: 0.02, from: 'random' } }, 0.2)
  current = index
}

Observer.create({
  type: 'wheel,touch,pointer', wheelSpeed: -1, tolerance: 10, preventDefault: true,
  onDown: () => !animating && goTo(current - 1, -1),
  onUp: () => !animating && goTo(current + 1, 1),
})
goTo(0, 1)
```
```css
.slide { position: fixed; inset: 0; visibility: hidden; }
.outer, .inner { width: 100%; height: 100%; overflow: hidden; }
.bg { position: absolute; inset: 0; background-size: cover; }
```

## Also great for
- Feeding WebGL slider transitions: in `goTo`, tween `material.uniforms.uProgress` 0→1 and swap `uTex1/uTex2`.
- Velocity-based effects without scroll: `onChange: (self) => skewTo(self.deltaY * 0.05)`.
- Use `ScrollTrigger.observe()` to get Observer bundled with ScrollTrigger.

## A11y
Provide keyboard (`keydown` ArrowUp/Down/PageUp/PageDown) and visible nav dots; disable Observer under `prefers-reduced-motion` and fall back to normal stacked sections.
