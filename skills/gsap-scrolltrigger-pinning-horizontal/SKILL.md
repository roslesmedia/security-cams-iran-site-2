---
name: gsap-scrolltrigger-pinning-horizontal
description: Pinned sections, horizontal scroll galleries, stacking cards, sticky storytelling and containerAnimation nested triggers with GSAP ScrollTrigger. Use for horizontal scroll sections, card stacks, "scrollytelling" and pinned product reveals.
---

# Pinning, horizontal scroll & stacked cards

Builds on `gsap-scrolltrigger`. Source: GSAP ScrollTrigger docs/demos (greensock/GSAP).

## Horizontal scroll section
```html
<section class="h-wrap"><div class="h-track"><article class="panel">…</article>…</div></section>
```
```css
.h-wrap { overflow: hidden; }
.h-track { display: flex; width: max-content; }
.panel { width: 100vw; height: 100vh; flex-shrink: 0; }
```
```js
const track = document.querySelector('.h-track')
const getDist = () => track.scrollWidth - window.innerWidth
const hScroll = gsap.to(track, {
  x: () => -getDist(), ease: 'none',
  scrollTrigger: {
    trigger: '.h-wrap', start: 'top top', end: () => '+=' + getDist(),
    pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
  },
})
// Nested triggers inside the horizontal movement:
gsap.utils.toArray('.panel h2').forEach((h) => gsap.from(h, {
  yPercent: 100, autoAlpha: 0,
  scrollTrigger: { trigger: h, containerAnimation: hScroll, start: 'left 70%', toggleActions: 'play none none reverse' },
}))
```
`containerAnimation` triggers must use `ease: 'none'` on the container tween and cannot themselves `pin`.

## Stacking cards (each card pins, next slides over, previous scales down)
```js
const cards = gsap.utils.toArray('.stack-card')
cards.forEach((card, i) => {
  ScrollTrigger.create({ trigger: card, start: 'top top', pin: true, pinSpacing: false, end: 'max' })
  if (i < cards.length - 1) gsap.to(card, {
    scale: 0.9, filter: 'brightness(0.5)', ease: 'none',
    scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top', scrub: true },
  })
})
```
CSS-only alternative: `.stack-card { position: sticky; top: calc(var(--i) * 20px) }`.

## Pinned scrollytelling (text steps change while media stays)
```js
const steps = gsap.utils.toArray('.step')
const tl = gsap.timeline({ scrollTrigger: { trigger: '.story', pin: '.story-media', start: 'top top', end: () => '+=' + steps.length * innerHeight, scrub: true } })
steps.forEach((s, i) => tl.to('.story-media img', { autoAlpha: (j) => (j === i ? 1 : 0) }, i))
```

## Zoom-through hero (scale text until it becomes a window)
```js
gsap.timeline({ scrollTrigger: { trigger: '.zoom', pin: true, start: 'top top', end: '+=150%', scrub: true } })
  .to('.zoom h1', { scale: 40, transformOrigin: '50% 50%', ease: 'power2.in' })
  .to('.zoom .reveal-bg', { autoAlpha: 1 }, '<0.3')
```

## Gotchas
- Pinning inside a transformed parent breaks (`transform` creates containing block); use `pinReparent: true` or restructure.
- With Lenis, never use `pinType: 'transform'` unless using a custom scroller; default `fixed` is right for window scroll.
- Always `invalidateOnRefresh` when distances depend on viewport.
- Mobile: horizontal pinned sections are often better as native `overflow-x: auto` + `scroll-snap` — gate with `gsap.matchMedia()`.
