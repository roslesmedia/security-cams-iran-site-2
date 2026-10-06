---
name: page-transitions-barba
description: Seamless SPA-style page transitions for multi-page sites using Barba.js (or Swup/Taxi) with GSAP curtains, shared-element moves, WebGL persistence, and proper re-init of Lenis/ScrollTrigger. Use when navigating between pages must animate instead of hard reloading.
---

# Page transitions (Barba.js + GSAP)

Source: https://github.com/barbajs/barba (MIT). Alternatives: Swup (MIT, https://github.com/swup/swup), Taxi.js (MIT, Unseen Studio). For Next.js use the `view-transitions-api` skill or a template-level AnimatePresence.

```bash
npm i @barba/core gsap
```
```html
<body data-barba="wrapper">
  <div class="curtain"></div>
  <main data-barba="container" data-barba-namespace="home">…</main>
</body>
```

## Curtain wipe transition
```js
import barba from '@barba/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

barba.init({
  preventRunning: true,
  transitions: [{
    name: 'curtain',
    async leave({ current }) {
      lenis.stop()
      await gsap.timeline()
        .set('.curtain', { transformOrigin: 'bottom', scaleY: 0 })
        .to('.curtain', { scaleY: 1, duration: 0.7, ease: 'expo.inOut' })
        .to(current.container, { autoAlpha: 0, duration: 0.1 })
    },
    enter({ next }) {
      window.scrollTo(0, 0); lenis.scrollTo(0, { immediate: true })
      return gsap.timeline()
        .set('.curtain', { transformOrigin: 'top' })
        .to('.curtain', { scaleY: 0, duration: 0.7, ease: 'expo.inOut' })
        .from(next.container.querySelectorAll('[data-intro]'), { y: 60, autoAlpha: 0, stagger: 0.06 }, '-=0.3')
    },
    after() { lenis.start() },
  }],
  views: [{ namespace: 'work', afterEnter() { initWorkPage() }, beforeLeave() { destroyWorkPage() } }],
})

barba.hooks.beforeLeave(() => ScrollTrigger.getAll().forEach((t) => t.kill()))
barba.hooks.afterEnter(({ next }) => { initPageAnimations(next.container); ScrollTrigger.refresh() })
```

## Persistent WebGL canvas across pages
Keep the `<canvas>` OUTSIDE `data-barba="container"`. On `leave`, tween shader uniforms (e.g. `uTransition` 0→1 dissolve); on `enter`, swap textures/meshes for the new namespace. This is how studios get "the 3D never reloads" feel.

## Shared element (thumb → hero)
In `leave` capture `Flip.getState(clickedImg)`, in `enter` find the hero image with the same `data-flip-id` and `Flip.from(state, { targets: hero, duration: 1, ease: 'expo.inOut' })` (see `gsap-flip-layout-transitions`).

## Checklist
- Update `<title>`, meta, analytics (`barba.hooks.after(() => gtag('config', ID, { page_path: location.pathname }))`).
- Re-run any third-party embeds.
- Prefetch: `@barba/prefetch` plugin.
- Honor reduced motion: short crossfade instead of curtains.
