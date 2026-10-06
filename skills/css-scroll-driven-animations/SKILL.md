---
name: css-scroll-driven-animations
description: Native CSS scroll-driven animations (animation-timeline scroll()/view(), view-timeline, animation-range) for zero-JS parallax, reveals, progress bars and sticky effects. Use for lightweight scroll animation that runs off the main thread, with JS fallback for unsupported browsers.
---

# CSS scroll-driven animations

Spec: https://drafts.csswg.org/scroll-animations-1/ — supported in Chromium 115+, Safari 26+; Firefox behind flag. Always wrap in `@supports`. Polyfill: https://github.com/flackr/scroll-timeline (Apache-2.0).

## Reading progress bar
```css
.progress { position: fixed; inset: 0 0 auto; height: 3px; background: currentColor; transform-origin: 0 50%;
  animation: grow linear both; animation-timeline: scroll(root block); }
@keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
```

## Reveal on enter (view timeline)
```css
@supports (animation-timeline: view()) {
  .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
}
@keyframes reveal { from { opacity: 0; transform: translateY(60px) scale(.96); filter: blur(8px) } to { opacity: 1; transform: none; filter: none } }
```
`animation-range` keywords: `cover`, `contain`, `entry`, `exit`, `entry-crossing`, `exit-crossing` + percentages/lengths.

## Parallax image inside a frame
```css
.frame { overflow: hidden; }
.frame img { scale: 1.3; animation: parallax linear both; animation-timeline: view(); }
@keyframes parallax { from { translate: 0 -12% } to { translate: 0 12% } }
```

## Named timeline driving another element (sticky scrollytelling)
```css
.story { view-timeline: --story block; height: 400vh; }
.story .sticky { position: sticky; top: 0; height: 100vh; }
.story .layer { animation: zoom linear both; animation-timeline: --story; animation-range: contain 0% contain 100%; }
@keyframes zoom { to { scale: 3; opacity: 0 } }
/* ancestor scope needed if the animated element isn't a descendant: */
body { timeline-scope: --story; }
```

## Horizontal scroll with pure CSS
```css
.h-section { height: 300vh; view-timeline: --h block; }
.h-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.h-track { display: flex; width: max-content; animation: slide linear both; animation-timeline: --h; animation-range: contain; }
@keyframes slide { to { transform: translateX(calc(-100% + 100vw)) } }
```

## Scroll-state & snapping companions
`scroll-snap-type: y mandatory` + `scroll-snap-align: start` for section snapping; `container-type: scroll-state` + `@container scroll-state(stuck: top)` (Chromium 133+) for "header when stuck" styles.

## Rules
- Use `linear` easing on the animation; shape motion via keyframe offsets.
- Animate compositor-friendly props (transform, opacity, filter, clip-path).
- Guard: `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`.
- Lenis is compatible (native scroll). GSAP-scrubbed transforms on the same element will fight — pick one.
