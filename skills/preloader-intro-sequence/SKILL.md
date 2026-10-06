---
name: preloader-intro-sequence
description: Asset-aware preloaders with real progress (images, fonts, GLTF/three.js LoadingManager, video), counter animations, and the hand-off into a hero intro timeline. Use when a heavy 3D/WebGL site needs a polished loading screen and reveal.
---

# Preloader → intro sequence

## Track real progress
```js
// three.js assets
import { LoadingManager } from 'three'
const manager = new LoadingManager()
manager.onProgress = (url, loaded, total) => setProgress(loaded / total)
manager.onLoad = () => assetsReady.resolve()
// pass `manager` to GLTFLoader, TextureLoader, RGBELoader…

// DOM images + fonts
const imgs = [...document.images]
let done = 0
await Promise.all([
  document.fonts.ready,
  ...imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})).then(() => setProgress(++done / imgs.length))),
])
```
R3F: `const { progress, active } = useProgress()` from drei.

## Smooth counter (never jump; lerp toward real progress, min display time)
```js
const counter = { v: 0 }
let target = 0
function setProgress(p) { target = p }
gsap.ticker.add(() => {
  counter.v += (target - counter.v) * 0.08
  el.textContent = String(Math.round(counter.v * 100)).padStart(3, '0')
  bar.style.transform = `scaleX(${counter.v})`
})
await Promise.all([assetsReady, new Promise((r) => setTimeout(r, 1200))]) // min time so it doesn't flash
```

## Exit + hero intro choreography
```js
lenis.stop()
const tl = gsap.timeline({ onComplete: () => { lenis.start(); document.documentElement.classList.remove('is-loading') } })
tl.to('.loader__count', { yPercent: -100, duration: 0.6, ease: 'power3.in' })
  .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' })
  .add(() => heroScene.play(), '-=0.6')                 // e.g. tween camera z / uniforms in WebGL
  .from('.hero h1 .line', { yPercent: 110, stagger: 0.08, duration: 1.2, ease: 'expo.out' }, '-=0.5')
  .from('.nav > *', { y: -20, autoAlpha: 0, stagger: 0.05 }, '<0.3')
```

## Common loader styles
- Counter 000→100 in big mono type, bottom-left.
- Image stack: thumbnails flash in sequence then the last one Flip-expands into the hero (`gsap-flip-layout-transitions`).
- Logo SVG stroke draw: `DrawSVGPlugin` `drawSVG: '0%' → '100%'`.
- WebGL: noise-dissolve shader whose threshold = progress.

## Rules
- Only show on first visit/session (`sessionStorage.getItem('seen')`); subsequent navigations get a short transition.
- Keep under ~2.5s once loaded; let users skip (click/Esc).
- Render critical text in HTML (SEO/LCP); preloader overlays it, doesn't replace it.
