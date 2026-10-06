---
name: r3f-fundamentals
description: React Three Fiber (R3F) core — Canvas config, useFrame/useThree, refs over state, Suspense loading, events, Next.js App Router integration, delta-based damping with maath. Use when building 3D in React/Next.js sites.
---

# React Three Fiber fundamentals

Source: https://github.com/pmndrs/react-three-fiber (MIT). v9 pairs with React 19; v8 with React 18.

```bash
npm i three @react-three/fiber @react-three/drei maath
```

## Canvas (fixed background behind the page)
```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 2]}                                     // capped DPR
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined} // receive pointer events through DOM
        eventPrefix="client"
      >
        <Suspense fallback={null}><World /></Suspense>
      </Canvas>
    </div>
  )
}
```
Next.js: dynamic import to skip SSR — `const Scene = dynamic(() => import('./Scene'), { ssr: false })`.

## Animate with useFrame + refs (never setState per frame)
```tsx
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'

function Orb() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.3
    // frame-rate independent smoothing toward the pointer (-1..1)
    easing.damp3(ref.current.position, [state.pointer.x * 0.5, state.pointer.y * 0.3, 0], 0.25, delta)
    easing.dampE(state.camera.rotation, [state.pointer.y * 0.05, -state.pointer.x * 0.08, 0], 0.4, delta)
  })
  return <mesh ref={ref}><icosahedronGeometry args={[1, 64]} /><meshStandardMaterial color="#7c5cff" roughness={0.2} /></mesh>
}
```

## Shader material as a component
```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
const WaveMaterial = shaderMaterial({ uTime: 0, uColor: new THREE.Color('#ff6ad5') }, vert, frag)
extend({ WaveMaterial })
// TS: declare module '@react-three/fiber' { interface ThreeElements { waveMaterial: ThreeElement<typeof WaveMaterial> } }
function Wave() {
  const mat = useRef<any>(null!)
  useFrame((_, d) => (mat.current.uTime += d))
  return <mesh><planeGeometry args={[4, 4, 128, 128]} /><waveMaterial ref={mat} /></mesh>
}
```

## Sync with GSAP / Lenis
- Read `lenis.scroll` / `lenis.velocity` inside `useFrame` (via `useLenis` stored in a ref).
- Tween three objects directly: `useGSAP(() => gsap.to(ref.current.position, { y: 2, scrollTrigger: {...} }), [])`.
- To drive R3F from GSAP's ticker: `<Canvas frameloop="never">` + `gsap.ticker.add(() => advance(performance.now()))` (`advance` from `@react-three/fiber`).

## Events
`<mesh onPointerOver={() => setHover(true)} onClick={(e) => (e.stopPropagation(), ...)}>`; cursor: drei `useCursor(hovered)`.

## Responsive
`const { viewport, size } = useThree()` — `viewport.width` in world units at z=0; scale/position objects by it for mobile. `useThree((s) => s.viewport)` selector avoids re-renders.

## Rules
- Load models with `useGLTF` + `useGLTF.preload`.
- Reuse geometries/materials via `useMemo`.
- Unmounting disposes automatically; `dispose={null}` to opt out for shared assets.
- Use `<Perf />` from `r3f-perf` during dev.
