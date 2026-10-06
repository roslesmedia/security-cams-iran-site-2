---
name: interactive-globe
description: Interactive 3D globes — cobe (5KB WebGL dotted globe with markers/arcs), react-globe.gl/three-globe (data arcs, hex polygons, points), drag-to-rotate with spring physics, scroll-driven rotation. Use for "global presence", network, or SaaS hero globes.
---

# Interactive globes

Sources: https://github.com/shuding/cobe (MIT), https://github.com/vasturiano/react-globe.gl & three-globe (MIT).

## cobe — tiny, beautiful dotted globe (Vercel/Stripe look)
From the cobe README:
```js
import createGlobe from 'cobe'
let phi = 0
const globe = createGlobe(canvas, {
  devicePixelRatio: 2, width: 1000, height: 1000,
  phi: 0, theta: 0.25, dark: 1, diffuse: 1.2, scale: 1,
  mapSamples: 16000, mapBrightness: 6,
  baseColor: [0.3, 0.3, 0.3], markerColor: [1, 0.5, 1], glowColor: [1, 1, 1],
  markers: [
    { location: [37.7595, -122.4367], size: 0.03 },
    { location: [40.7128, -74.006], size: 0.1, color: [1, 0, 0] },
  ],
  arcs: [{ from: [37.7595, -122.4367], to: [40.7128, -74.006] }],
  arcColor: [1, 0.5, 1], arcWidth: 0.5, arcHeight: 0.3,
  onRender: (state) => { state.phi = phi; phi += 0.005 },
})
// globe.destroy()
```
Canvas CSS size should be half the `width/height` when `devicePixelRatio: 2`.

### Drag to rotate with spring (React)
```tsx
'use client'
import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'
import { useSpring } from 'motion/react'

export function Globe() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const pointer = useRef<number | null>(null)
  const r = useSpring(0, { stiffness: 280, damping: 40 })
  useEffect(() => {
    let phi = 0, width = canvas.current!.offsetWidth
    const onResize = () => (width = canvas.current!.offsetWidth)
    addEventListener('resize', onResize)
    const globe = createGlobe(canvas.current!, {
      devicePixelRatio: 2, width: width * 2, height: width * 2, phi: 0, theta: 0.3, dark: 1, diffuse: 3,
      mapSamples: 16000, mapBrightness: 1.2, baseColor: [1, 1, 1], markerColor: [251 / 255, 100 / 255, 21 / 255], glowColor: [1.2, 1.2, 1.2],
      markers: [],
      onRender: (s) => { if (pointer.current === null) phi += 0.005; s.phi = phi + r.get(); s.width = width * 2; s.height = width * 2 },
    })
    setTimeout(() => (canvas.current!.style.opacity = '1'))
    return () => { globe.destroy(); removeEventListener('resize', onResize) }
  }, [])
  return (
    <canvas ref={canvas} className="w-full aspect-square opacity-0 transition-opacity duration-1000 cursor-grab"
      onPointerDown={(e) => (pointer.current = e.clientX - r.get() * 200)}
      onPointerUp={() => (pointer.current = null)} onPointerOut={() => (pointer.current = null)}
      onPointerMove={(e) => pointer.current !== null && r.set((e.clientX - pointer.current) / 200)} />
  )
}
```
Scroll-driven: in `onRender`, `s.phi = scrollProgress * Math.PI * 2`.

## react-globe.gl — data-rich globes
```tsx
import Globe from 'react-globe.gl'   // dynamic(() => import('react-globe.gl'), { ssr: false }) in Next.js
<Globe
  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
  backgroundColor="rgba(0,0,0,0)"
  arcsData={routes} arcColor={() => ['#7c5cff', '#ff6ad5']} arcDashLength={0.4} arcDashGap={0.2} arcDashAnimateTime={2000} arcStroke={0.5}
  pointsData={cities} pointAltitude={0.02} pointColor={() => '#fff'}
  hexPolygonsData={countries.features} hexPolygonResolution={3} hexPolygonMargin={0.4} hexPolygonColor={() => 'rgba(255,255,255,0.3)'}
  atmosphereColor="#7c5cff" atmosphereAltitude={0.2}
/>
```
Access the three.js scene via ref (`globeRef.current.scene()`, `.controls().autoRotate = true`). Vanilla: `three-globe` as a three.js Object3D.

## Custom three.js dotted globe
Sample lat/lng on a Fibonacci sphere, test each against a land-mask image (white = land) and place instanced dots (`threejs-instancing`). Add fresnel atmosphere: a slightly larger back-side sphere with `pow(0.7 - dot(vNormal, vec3(0,0,1)), 2.0)` additive glow.
