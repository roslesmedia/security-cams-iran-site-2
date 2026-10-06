---
name: drei-scroll-controls
description: drei ScrollControls/useScroll for scroll-driven R3F scenes — virtual scroll pages, scroll-synced HTML overlays, range/curve/visible helpers, camera and model choreography, horizontal and infinite modes. Use for one-canvas scroll-story sites built fully in React Three Fiber.
---

# drei ScrollControls

Source: https://github.com/pmndrs/drei (MIT). ScrollControls creates its own scroll container overlaying the canvas (it does NOT use window scroll — choose this OR Lenis+ScrollTrigger, not both, for a given section).

```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { easing } from 'maath'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
      <ScrollControls pages={5} damping={0.2} distance={1}>   {/* pages = scroll height in viewports */}
        <Story />                                             {/* 3D content reading useScroll() */}
        <Scroll>                                              {/* 3D content that moves with scroll */}
          <mesh position={[0, -8, 0]}><boxGeometry /></mesh>
        </Scroll>
        <Scroll html style={{ width: '100%' }}>               {/* DOM overlay that scrolls */}
          <h1 style={{ position: 'absolute', top: '10vh', left: '8vw' }}>Act one</h1>
          <h1 style={{ position: 'absolute', top: '210vh', right: '8vw' }}>Act two</h1>
        </Scroll>
      </ScrollControls>
    </Canvas>
  )
}

function Story() {
  const data = useScroll()
  const model = useRef<THREE.Group>(null!)
  useFrame((state, delta) => {
    const a = data.range(0, 1 / 5)        // 0→1 during first page
    const b = data.curve(1 / 5, 2 / 5)    // 0→1→0 across pages 2–3 (bell curve)
    const c = data.visible(3 / 5, 1 / 5)  // boolean while in range
    model.current.rotation.y = data.offset * Math.PI * 2       // offset: 0..1 overall (damped)
    easing.damp3(state.camera.position, [Math.sin(data.offset * Math.PI) * 4, 1 + b, 8 - a * 3], 0.3, delta)
    state.camera.lookAt(0, 0, 0)
    model.current.visible = !c
  })
  return <group ref={model}>{/* <Model /> */}</group>
}
```

## Props
`pages`, `damping` (seconds-ish smoothing), `distance` (scroll factor), `horizontal`, `infinite`, `enabled`, `eps`, `maxSpeed`, `style`. `useScroll()` → `{ offset, delta, range(from, distance, margin), curve(from, distance, margin), visible(from, distance, margin), el, fill, fixed }`.

## Scrub GLTF animation with scroll
```tsx
const { animations, scene } = useGLTF('/robot.glb')
const { actions } = useAnimations(animations, scene)
useEffect(() => { actions.Walk!.play().paused = true }, [actions])
useFrame(() => { const a = actions.Walk!; a.time = a.getClip().duration * data.offset })
```

## Image gallery that scrolls with distortion (drei Image)
```tsx
<Scroll><Image url="/1.jpg" scale={[4, 3]} position={[0, 0, 0]} /><Image url="/2.jpg" scale={[4, 3]} position={[1, -4, 0]} /></Scroll>
// inside useFrame: ref.current.material.zoom = 1 + data.range(0, 1/3) / 3; ref.current.material.grayscale = 1 - data.range(...)
```

## Tips
- Keep total `pages` matching the HTML overlay height to avoid dead space.
- For a normal multi-section website where only some sections have 3D, prefer window scroll (Lenis + ScrollTrigger) and the `r3f-dom-sync-views` approach instead.
- Mobile: ScrollControls uses native touch scroll inside its container — test iOS rubber-banding.
