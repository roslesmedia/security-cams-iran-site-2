---
name: gsap-core-timelines
description: GSAP core animation patterns — tweens, timelines, eases, stagger, quickTo/quickSetter, matchMedia, React useGSAP cleanup. Use for any choreographed intro, hero sequence, hover animation or as the base for ScrollTrigger work.
---

# GSAP core & timelines

Source: https://github.com/greensock/GSAP — since GSAP 3.13 the entire library *including all former Club plugins* (SplitText, MorphSVG, ScrollSmoother, DrawSVG, Inertia…) is free for commercial use under GreenSock's standard no-charge license (not MIT — you may not use it in a tool that competes with Webflow).

```bash
npm i gsap @gsap/react
```

## Fundamentals
```js
import gsap from 'gsap'

gsap.to('.box', { x: 200, rotate: 90, duration: 1, ease: 'power3.out' })
gsap.from('.card', { y: 60, autoAlpha: 0, stagger: 0.08, ease: 'expo.out', duration: 1.2 })
gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' })
gsap.set('.hidden', { autoAlpha: 0 }) // autoAlpha = opacity + visibility
```

## Timeline choreography (hero intro)
```js
const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } })
tl.from('.nav', { y: -40, autoAlpha: 0 })
  .from('.hero-line span', { yPercent: 110, stagger: 0.06 }, '<0.1') // '<' = start of previous
  .from('.hero-media', { scale: 1.3, clipPath: 'inset(20% 20% 20% 20%)' }, '-=0.9')
  .addLabel('ctas')
  .from('.cta', { y: 20, autoAlpha: 0, stagger: 0.1 }, 'ctas')
// control: tl.pause(), tl.reverse(), tl.progress(0.5), tl.timeScale(2)
```
Position parameter cheatsheet: `'+=0.2'` gap, `'-=0.5'` overlap, `'<'` with previous start, `'>'` previous end, `'label+=0.3'`.

## Premium eases
`expo.out`, `power4.out` (snappy reveals), `expo.inOut` (masks/curtains), `back.out(1.7)` (playful pop), `elastic.out(1, 0.4)`. CustomEase: `CustomEase.create('hop', 'M0,0 C0.3,0 0.1,1 1,1')`.

## High-frequency updates (cursor, mouse parallax) — never create tweens per mousemove
```js
const xTo = gsap.quickTo('.cursor', 'x', { duration: 0.4, ease: 'power3' })
const yTo = gsap.quickTo('.cursor', 'y', { duration: 0.4, ease: 'power3' })
window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY) })
```
`gsap.quickSetter(el, 'css')` for raw per-frame setting without easing.

## Utilities you'll use constantly
`gsap.utils.mapRange(0, innerWidth, -1, 1, x)`, `clamp`, `interpolate`, `wrap` (infinite carousels), `toArray`, `random(-10, 10, 1)`, `gsap.ticker.add(fn)` (shared rAF).

## Responsive + reduced motion
```js
const mm = gsap.matchMedia()
mm.add({ isDesktop: '(min-width: 800px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
  const { isDesktop, reduce } = ctx.conditions
  gsap.from('.hero', { y: reduce ? 0 : isDesktop ? 120 : 40, autoAlpha: 0 })
  return () => {} // auto-reverted when the query stops matching
})
```

## React (always use useGSAP — it scopes selectors and auto-reverts on unmount)
```tsx
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(useGSAP)
function Hero() {
  const root = useRef(null)
  useGSAP(() => {
    gsap.from('.word', { yPercent: 100, stagger: 0.05 })
  }, { scope: root })
  const { contextSafe } = useGSAP({ scope: root })
  const onEnter = contextSafe(() => gsap.to('.btn', { scale: 1.05 }))
  return <section ref={root}>...</section>
}
```

## Perf rules
Animate `transform`/`opacity`/`clip-path` only; use `xPercent`/`yPercent` for responsive moves; `will-change: transform` sparingly; prevent FOUC with `.js .reveal { visibility: hidden }` + `autoAlpha`.
