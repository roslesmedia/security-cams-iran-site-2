---
name: lenis-smooth-scroll
description: Set up Lenis smooth scrolling (darkroomengineering/lenis) and sync it with GSAP ScrollTrigger, R3F/three.js render loops, modals, anchors and page transitions. Use whenever a site needs buttery inertial scroll, scroll-synced WebGL, or "awwwards-style" scroll feel.
---

# Lenis smooth scroll

Source: https://github.com/darkroomengineering/lenis (MIT). Lenis wraps *native* scroll, so `position: sticky`, anchors, find-in-page and a11y keep working — this is why it replaced Locomotive/ScrollSmoother-style transform hijacking on most premium sites.

## Install
```bash
npm i lenis
```
```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css' // required: sets html.lenis height/overflow rules
```

## Canonical setup with GSAP ScrollTrigger (use this by default)
From the Lenis README:
```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  lerp: 0.1,            // 0.05–0.1 = floaty premium feel; ignore `duration` when lerp set
  wheelMultiplier: 1,
  smoothWheel: true,
  anchors: true,        // smooth anchor links
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000)) // seconds -> ms
gsap.ticker.lagSmoothing(0)
```
Never run both `autoRaf: true` AND the gsap ticker — you'll double-step.

## React / Next.js
```tsx
'use client'
import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  useEffect(() => {
    const update = (t) => lenisRef.current?.lenis?.raf(t * 1000)
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])
  return <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenisRef}>{children}</ReactLenis>
}

// anywhere below:
useLenis(({ scroll, velocity, progress }) => { /* drive shaders, skew, etc. */ })
```

## Driving WebGL from scroll
```js
lenis.on('scroll', ({ scroll, velocity, progress, direction }) => {
  material.uniforms.uScroll.value = scroll
  material.uniforms.uVelocity.value = velocity   // great for skew / RGB-shift / wave intensity
})
```
For R3F: read `lenis.scroll` inside `useFrame` rather than setting React state (no re-renders).

## Common recipes
- Lock scroll (modal/menu/preloader): `lenis.stop()` / `lenis.start()`.
- Programmatic: `lenis.scrollTo('#work', { offset: -80, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) })`, `lenis.scrollTo(0, { immediate: true })` on route change.
- Nested scroll areas (modals, code blocks): add `data-lenis-prevent` to the element.
- Horizontal site: `new Lenis({ orientation: 'horizontal', gestureOrientation: 'both' })`.
- Infinite loop page: `infinite: true` (+ `syncTouch: true` for touch).
- Velocity skew: `gsap.quickSetter(el, 'skewY', 'deg')(gsap.utils.clamp(-8, 8, velocity * 0.3))`.

## Gotchas
- `prefers-reduced-motion` is respected by default (`respectReducedMotion: true`) — keep it.
- Don't put `scroll-behavior: smooth` in CSS alongside Lenis.
- If page height changes after images/fonts load and `autoResize` misses it, call `lenis.resize()` then `ScrollTrigger.refresh()`.
- Touch devices default to native scroll (good). Only enable `syncTouch` if you truly need synced touch inertia; it can be janky on old iOS.
- Destroy on unmount/route change: `lenis.destroy()`.
