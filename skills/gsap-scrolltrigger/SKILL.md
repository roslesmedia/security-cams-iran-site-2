---
name: gsap-scrolltrigger
description: GSAP ScrollTrigger recipes — scrubbed timelines, reveals on enter, batch, progress-driven WebGL, snapping, refresh handling, Lenis sync. Use for any scroll-linked animation (the backbone of "tons of scroll animations" sites).
---

# GSAP ScrollTrigger

Source: https://github.com/greensock/GSAP (`gsap/ScrollTrigger`). Pair with the `lenis-smooth-scroll` skill.

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
```

## 1. Reveal on enter (play once)
```js
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, {
    y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
  })
})
```
`toggleActions`: onEnter onLeave onEnterBack onLeaveBack (`play pause resume reverse restart reset complete none`).

## 2. Batch (grids with many items — far cheaper)
```js
ScrollTrigger.batch('.grid-item', {
  start: 'top 90%',
  onEnter: (els) => gsap.from(els, { y: 60, autoAlpha: 0, stagger: 0.08, overwrite: true }),
})
```

## 3. Scrubbed timeline (animation tied to scroll position)
```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.story', start: 'top top', end: '+=3000',
    scrub: 1,          // true = locked; number = seconds of smoothing
    pin: true,         // see gsap-scrolltrigger-pinning-horizontal
    anticipatePin: 1,
    snap: { snapTo: 'labels', duration: 0.6, ease: 'power2.inOut' },
  },
})
tl.addLabel('a').to('.layer-1', { yPercent: -50 })
  .addLabel('b').to('.layer-2', { scale: 1.4, autoAlpha: 0 })
  .addLabel('c')
```

## 4. Progress → anything (WebGL uniforms, video, Lottie, canvas)
```js
ScrollTrigger.create({
  trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true,
  onUpdate: (self) => {
    material.uniforms.uProgress.value = self.progress // 0..1
    material.uniforms.uVelocity.value = self.getVelocity() / 1000
  },
})
// or tween a plain object:
const state = { p: 0 }
gsap.to(state, { p: 1, ease: 'none', scrollTrigger: { trigger: '#s', scrub: true }, onUpdate: () => mesh.rotation.y = state.p * Math.PI * 2 })
```

## 5. Parallax
```js
gsap.utils.toArray('[data-speed]').forEach((el) => {
  gsap.to(el, { yPercent: -100 * parseFloat(el.dataset.speed), ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
})
```

## 6. Image scale/clip reveal (signature agency move)
```js
gsap.fromTo('.media', { clipPath: 'inset(15% 15% 15% 15% round 24px)', scale: 1.2 },
  { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.media', start: 'top 80%', end: 'top 20%', scrub: true } })
```

## 7. Color/theme change per section
```js
gsap.utils.toArray('[data-bg]').forEach((s) => ScrollTrigger.create({
  trigger: s, start: 'top 50%', end: 'bottom 50%',
  onToggle: (self) => self.isActive && gsap.to('body', { backgroundColor: s.dataset.bg, color: s.dataset.fg, duration: 0.6 }),
}))
```

## Start/end syntax
`'top 80%'` = trigger's top hits 80% down the viewport. `end: '+=200%'` relative. Functions allowed: `end: () => '+=' + el.scrollWidth`. Use `markers: true` while developing.

## Refresh discipline (the #1 source of bugs)
- Create triggers top-to-bottom in page order (or set `refreshPriority`).
- After images/fonts/WebGL load: `ScrollTrigger.refresh()`.
- Function-based values + `invalidateOnRefresh: true` for responsive.
- React: create inside `useGSAP` (auto-kills). Next.js route change: `ScrollTrigger.getAll().forEach(t => t.kill())` if not scoped.
- Mobile address-bar resize: `ScrollTrigger.config({ ignoreMobileResize: true })` and `ScrollTrigger.normalizeScroll(true)` only if you see jumps.
