---
name: locomotive-scroll
description: Locomotive Scroll v5 (built on Lenis) data-attribute driven parallax, in-view classes and scroll-speed effects. Use when a project wants declarative data-scroll attributes instead of writing GSAP for every element, or when maintaining an older Locomotive v4 site.
---

# Locomotive Scroll

Source: https://github.com/locomotivemtl/locomotive-scroll (MIT). v5 is a thin layer over Lenis + IntersectionObserver; v4 (transform-based) is legacy — don't start new projects on it.

```bash
npm i locomotive-scroll
```
```js
import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/dist/locomotive-scroll.css'

const scroll = new LocomotiveScroll({
  lenisOptions: { lerp: 0.1, smoothWheel: true },
  scrollCallback: ({ scroll, limit, velocity, direction, progress }) => {},
})
```

## Declarative attributes
```html
<section>
  <h1 data-scroll data-scroll-speed="0.3">Parallax heading</h1>
  <img data-scroll data-scroll-speed="-0.15" src="…">               <!-- negative = opposite -->
  <div data-scroll data-scroll-class="is-inview" data-scroll-repeat>Toggles class</div>
  <div data-scroll data-scroll-offset="20%,0" data-scroll-call="reveal">Fires event</div>
  <div data-scroll data-scroll-css-progress>Exposes --progress CSS var</div>
</section>
```
```css
.fade { opacity: 0; transform: translateY(40px); transition: 1s cubic-bezier(.16,1,.3,1); }
.fade.is-inview { opacity: 1; transform: none; }
.bar { transform: scaleX(var(--progress)); }   /* from data-scroll-css-progress */
```
```js
window.addEventListener('reveal', (e) => { const { target, way } = e.detail })
```

Parallax (`data-scroll-speed`) is auto-disabled on touch devices. Full docs: https://scroll.locomotive.ca/docs

## Methods
`scroll.scrollTo('#contact', { offset: -50, duration: 1.2 })`, `scroll.start()`, `scroll.stop()`, `scroll.destroy()`.

## When to choose it
Fast to build CMS/Webflow-ish sites where designers sprinkle attributes. For complex choreography combine with GSAP ScrollTrigger (sync via the Lenis instance it exposes) or just use Lenis + GSAP directly.
