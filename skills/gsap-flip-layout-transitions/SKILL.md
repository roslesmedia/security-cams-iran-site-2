---
name: gsap-flip-layout-transitions
description: GSAP Flip plugin for seamless layout transitions — grid-to-fullscreen image expansion, filter/sort animations, shared-element transitions between states or pages. Use when an element must morph between two DOM positions/sizes.
---

# GSAP Flip (First-Last-Invert-Play)

Source: greensock/GSAP `gsap/Flip`.

```js
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip)
```

## Core pattern
```js
const state = Flip.getState('.item')        // 1. record
container.classList.toggle('list-view')     // 2. change DOM/CSS however you like
Flip.from(state, {                          // 3. animate from old to new
  duration: 0.8, ease: 'power3.inOut', stagger: 0.03, absolute: true,
  onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }),
  onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.8 }),
})
```

## Thumbnail → fullscreen case-study expansion
```js
function open(thumb) {
  const img = thumb.querySelector('img')
  const state = Flip.getState(img)
  document.querySelector('.fullscreen').appendChild(img)   // reparent
  Flip.from(state, { duration: 1, ease: 'expo.inOut', scale: true, zIndex: 50,
    onComplete: () => gsap.from('.fullscreen .meta > *', { y: 30, autoAlpha: 0, stagger: 0.06 }) })
}
```

## Filtering a grid
```js
const state = Flip.getState(items)
items.forEach((el) => (el.style.display = matches(el) ? '' : 'none'))
Flip.from(state, { duration: 0.6, scale: true, absolute: true, ease: 'power2.inOut',
  onEnter: (e) => gsap.fromTo(e, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1 }),
  onLeave: (e) => gsap.to(e, { opacity: 0, scale: 0 }) })
```

## Cross-page shared element
Pair with `page-transitions-barba` or `view-transitions-api`: before leaving, `Flip.getState(el, { props: 'borderRadius' })`; on the new page put an element with the same `data-flip-id` and call `Flip.from(state, { targets: newEl })`.

## Tips
- `Flip.fit(a, b, { scale: true })` snaps one element onto another's box (great for hover previews).
- Use `props: 'backgroundColor,borderRadius'` to also tween CSS props.
- `nested: true` when parents and children both move.
