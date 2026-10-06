---
name: spline-3d-embeds
description: Embed and control Spline (spline.design) 3D scenes — @splinetool/react-spline and vanilla runtime, Next.js SSR placeholder, findObjectByName for GSAP/scroll control, emitEvent for interactions, performance and lazy loading. Use when designers build 3D in Spline and it must ship on the site.
---

# Spline 3D scenes

Source: https://github.com/splinetool/react-spline (MIT), `@splinetool/runtime`.

```bash
npm i @splinetool/react-spline @splinetool/runtime
```

## React
```tsx
import Spline from '@splinetool/react-spline'
export default function Hero() {
  return <Spline scene="https://prod.spline.design/XXXX/scene.splinecode" />
}
```
Next.js with auto-generated blurred SSR placeholder:
```tsx
import Spline from '@splinetool/react-spline/next'
```

## Control objects (from the react-spline README)
```tsx
import { useRef } from 'react'
import Spline from '@splinetool/react-spline'
import type { Application, SPEObject } from '@splinetool/runtime'
import gsap from 'gsap'

export function Product() {
  const cube = useRef<SPEObject>()
  const app = useRef<Application>()
  function onLoad(spline: Application) {
    app.current = spline
    cube.current = spline.findObjectByName('Cube')
    // scroll-driven rotation
    gsap.to(cube.current!.rotation, { y: Math.PI * 2, ease: 'none', scrollTrigger: { trigger: '#product', start: 'top top', end: 'bottom bottom', scrub: true } })
  }
  return (
    <>
      <Spline scene="https://prod.spline.design/XXXX/scene.splinecode" onLoad={onLoad} onSplineMouseDown={(e) => console.log(e.target.name)} />
      <button onClick={() => app.current?.emitEvent('mouseHover', 'Cube')}>Trigger animation</button>
    </>
  )
}
```
Events you can listen to: `onSplineMouseDown`, `onSplineMouseUp`, `onSplineMouseHover`, `onSplineKeyDown`, `onSplineKeyUp`, `onSplineStart`, `onSplineLookAt`, `onSplineFollow`, `onSplineScroll`. Variables: `spline.setVariable('progress', 0.5)` to drive Spline-side states from scroll.

## Vanilla
```js
import { Application } from '@splinetool/runtime'
const app = new Application(document.getElementById('canvas3d'))
await app.load('https://prod.spline.design/XXXX/scene.splinecode')
const obj = app.findObjectByName('Logo'); obj.position.y += 20
```

## Performance (Spline scenes are heavy — be strict)
- Lazy-load: render a poster image, mount `<Spline>` when in view (`IntersectionObserver` / `next/dynamic`).
- In Spline: reduce geometry, bake/limit lights, disable shadows, compress textures, turn off "Page Scroll/Zoom" if Lenis handles scrolling.
- Export → self-host the `.splinecode` file for reliability.
- Hide the Spline logo requires a paid plan.
- One Spline canvas per page; for complex sites convert to glTF (Spline export) and use three.js/R3F for control and smaller payloads.
