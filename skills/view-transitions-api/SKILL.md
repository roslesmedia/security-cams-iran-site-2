---
name: view-transitions-api
description: Native View Transitions API (same-document and cross-document @view-transition) for morphing shared elements and page transitions, including Next.js/Astro integration. Use for zero-library page transitions and shared-element morphs.
---

# View Transitions API

Spec: https://drafts.csswg.org/css-view-transitions-2/ — same-document: Chrome 111+, Safari 18+, Firefox 144+. Cross-document (MPA): Chrome 126+, Safari 18.2+.

## Cross-document (multi-page site, zero JS)
```css
@view-transition { navigation: auto; }   /* in BOTH pages */
.project-hero img { view-transition-name: hero-img; }        /* same name on both pages */
::view-transition-old(root) { animation: 0.5s cubic-bezier(.7,0,.3,1) both slide-out; }
::view-transition-new(root) { animation: 0.5s cubic-bezier(.7,0,.3,1) both slide-in; }
@keyframes slide-out { to { opacity: 0; transform: translateY(-40px); } }
@keyframes slide-in { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
::view-transition-group(hero-img) { animation-duration: .8s; animation-timing-function: cubic-bezier(.16,1,.3,1); }
```
Give list thumbnails unique names dynamically: `style="view-transition-name: project-{{id}}"` and match on the detail page.

## Same-document (SPA / state change)
```js
function update(mutator) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return mutator()
  const vt = document.startViewTransition(() => mutator())
  vt.ready.then(() => {
    // Circular reveal from click point
    document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${Math.hypot(innerWidth, innerHeight)}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.7,0,.3,1)', pseudoElement: '::view-transition-new(root)' })
  })
}
```
(Dark-mode toggle with circular reveal is a popular use.)

## Next.js App Router
React (canary/experimental channel) ships `<ViewTransition>` (`import { unstable_ViewTransition as ViewTransition } from 'react'`) and Next exposes `experimental.viewTransition: true`. Library option: `next-view-transitions` (MIT) — `import { Link } from 'next-view-transitions'` and wrap layout in `<ViewTransitions>`.

## Astro
`import { ClientRouter } from 'astro:transitions'` in head; `transition:name="hero"` / `transition:animate="slide"` on elements; `transition:persist` keeps a WebGL canvas alive.

## Gotchas
- Names must be unique on the page at capture time.
- Snapshots are images: no live video/WebGL inside the morph (persist the canvas outside instead).
- Keep it < 1s; navigation is blocked during the transition.
