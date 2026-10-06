---
name: award-site-architecture
description: Blueprint for building a premium "$20k" animated 3D marketing site end-to-end — stack choice, folder structure, one-rAF orchestration of Lenis + GSAP + WebGL, section patterns, accessibility/reduced-motion, mobile fallbacks, SEO, performance budget, and QA checklist. Use at the start of any high-end animated site build to plan and wire everything together; it routes to the other skills.
---

# Award-level animated site — architecture & playbook

## Recommended stacks
| Project | Stack |
|---|---|
| React/marketing site | Next.js (App Router) + Tailwind + Lenis + GSAP (useGSAP) + R3F/drei + Motion for UI micro-interactions |
| Multi-page, max control, small bundle | Astro or Vite vanilla + Lenis + GSAP + three.js/OGL + Barba/Swup or View Transitions |
| Designer-led, fast | Webflow/Framer + GSAP + Spline/Unicorn Studio embeds |

## Folder structure (Next.js)
```
app/
  layout.tsx            # <SmoothScroll> (Lenis) + <GlobalCanvas> (single fixed R3F canvas, View.Port) + <Cursor> + grain overlay
  page.tsx              # sections only
components/
  sections/             # Hero, Manifesto, Work, Services, Process, Testimonials, CTA, Footer
  webgl/                # scenes, materials, shaders/*.glsl
  motion/               # reusable hooks: useReveal, useSplitReveal, useParallax, useMagnetic
lib/
  gsap.ts               # registerPlugin once, defaults, matchMedia
  lenis.ts              # instance + gsap ticker bridge
  quality.ts            # detect-gpu tier, reduced-motion, saveData → global quality flags
public/models, public/textures, public/hdr, public/fonts
```

## One loop to rule them all
```ts
// lib/gsap.ts
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase)
gsap.defaults({ ease: 'expo.out', duration: 1.1 })
ScrollTrigger.config({ ignoreMobileResize: true })
// Lenis raf + ScrollTrigger.update on gsap.ticker (see lenis-smooth-scroll)
// R3F: <Canvas frameloop="never"> + gsap.ticker.add(() => advance(performance.now())) — or let R3F own its loop and only read lenis values
```

## Section recipe → skill map
| Section | Signature effect | Skills |
|---|---|---|
| Preloader | counter → curtain → hero intro | preloader-intro-sequence |
| Hero | live WebGL bg + split-line headline + magnetic CTA | animated-gradient-mesh / webgl-fluid-simulation / shader-backgrounds-raymarching, gsap-splittext-text-reveals, custom-cursor-and-trails |
| 3D product story | pinned scroll camera choreography | threejs-scroll-camera-path, drei-scroll-controls, theatre-js-sequencing, threejs-lighting-environment |
| Manifesto | scroll-scrubbed word highlight | gsap-splittext-text-reveals |
| Work index | hover image reveal / infinite WebGL gallery | webgl-image-hover-distortion, webgl-infinite-gallery |
| Services | stacked cards / horizontal scroll | gsap-scrolltrigger-pinning-horizontal |
| Logos/marquee | velocity marquee | infinite-marquee-velocity |
| Global reach | globe | interactive-globe |
| Transitions | curtain / shared element | page-transitions-barba, view-transitions-api, gsap-flip-layout-transitions |
| Finish | grain, post FX | noise-grain-overlay, threejs-postprocessing, r3f-postprocessing |

## Motion design rules that separate $20k sites
- One easing family (e.g. `expo.out` for reveals, `expo.inOut` for masks); consistent durations (0.8–1.4s); stagger 0.04–0.1.
- Everything enters via masks/clip-path, not just fades.
- Motion responds to input: scroll velocity → skew/RGB shift; pointer → parallax/sway; hover → magnetic.
- Typography-led: huge display type, tight tracking, split-line reveals.
- Restraint: 1 hero "wow" WebGL moment + many small consistent interactions > ten competing effects.

## Accessibility (non-negotiable)
- `prefers-reduced-motion`: Lenis respects by default; wrap GSAP in `gsap.matchMedia()`; replace scrubbed WebGL with static posters; stop autoplay loops.
- Real semantic HTML underneath every effect; WebGL text duplicated in DOM (visually-hidden if needed).
- Keyboard: focus-visible styles, no scroll-jacking traps; Observer slides have arrow-key support.
- Contrast over animated backgrounds (add scrims).

## Mobile strategy
- `gsap.matchMedia()` for separate desktop/mobile timelines; native scroll on touch (Lenis default).
- Quality tiers from `detect-gpu`: tier 0 → poster image/video; tier 1 → reduced DPR, no post, fewer particles.
- Replace pinned horizontal sections with swipeable `scroll-snap` rows.
- Disable cursor/hover effects on `(pointer: coarse)`.

## Performance budget
LCP < 2.5s (HTML headline, not canvas) • JS < 300KB gz initial (lazy-load three.js/scenes) • 3D assets < 5MB total • 60fps on M1 / 30+ on mid Android • CLS 0 (reserve canvas/sections space). See threejs-performance-optimization.

## QA checklist before launch
- [ ] Chrome, Safari (macOS + iOS), Firefox, Android Chrome
- [ ] Resize & orientation change: ScrollTrigger refresh, canvas resize, SplitText re-split
- [ ] Route changes: no leaked triggers/contexts (`ScrollTrigger.getAll().length`, `renderer.info.memory`)
- [ ] Reduced motion & keyboard-only pass
- [ ] Throttled CPU 4x + Slow 4G loading experience
- [ ] Lighthouse ≥ 90 perf on desktop, meta/OG tags, sitemap
- [ ] Licenses: GSAP standard license OK for client sites; check Shadertoy (CC BY-NC-SA) and LYGIA (commercial needs sponsorship) before copying shader code
