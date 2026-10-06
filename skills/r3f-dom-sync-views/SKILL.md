---
name: r3f-dom-sync-views
description: Sync WebGL with normal DOM layout in multi-section sites — one shared canvas rendering 3D into many HTML placeholders (drei View / tunnel-rat / r3f-scroll-rig), WebGL images tracking <img> positions under Lenis scroll. Use when 3D/WebGL must appear inside regular page sections instead of a single fullscreen scene.
---

# One canvas, many DOM-synced 3D sections

Sources: drei `View` (MIT), https://github.com/14islands/r3f-scroll-rig (MIT), https://github.com/pmndrs/tunnel-rat (MIT).

Why: browsers limit WebGL contexts (~16) and each Canvas is expensive. Premium sites use ONE fixed canvas and render scenes into rectangles that follow DOM elements.

## drei View (built-in)
```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { View, PerspectiveCamera, Environment, OrbitControls } from '@react-three/drei'

export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
      <Canvas eventSource={document.body} className="!fixed inset-0 pointer-events-none" style={{ position: 'fixed' }}>
        <View.Port />
      </Canvas>
    </>
  )
}

// inside any section — a div that reserves layout space; its 3D renders there
export function ProductSection() {
  return (
    <section className="grid grid-cols-2 gap-8">
      <div><h2>Feature</h2><p>Copy…</p></div>
      <View className="h-[60vh] w-full">
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
        <Environment preset="studio" />
        <Model />
      </View>
    </section>
  )
}
```
Views use scissor testing; each can have its own camera/controls/environment. Combine with ScrollTrigger by animating refs inside the View.

## r3f-scroll-rig (by 14islands — Lenis-based, battle-tested)
```tsx
import { GlobalCanvas, SmoothScrollbar, UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
<GlobalCanvas /><SmoothScrollbar />
function WebGLImage({ src }) {
  const el = useRef(null)
  return (<>
    <img ref={el} src={src} className="opacity-0" />  {/* DOM keeps layout/SEO/a11y */}
    <UseCanvas>
      <ScrollScene track={el}>{(props) => <DistortedImage src={src} {...props} />}</ScrollScene>
    </UseCanvas>
  </>)
}
```
`ScrollScene` passes `scale`, `scrollState` (`progress`, `visibility`, `viewport`) so shaders can react to element-relative scroll.

## Vanilla three.js version (manual)
```js
const items = [...document.querySelectorAll('[data-webgl]')].map((el) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 32, 32), makeMaterial(el.dataset.src))
  scene.add(mesh); return { el, mesh, rect: null }
})
function measure() { items.forEach((it) => { const r = it.el.getBoundingClientRect(); it.rect = { top: r.top + lenis.scroll, left: r.left, w: r.width, h: r.height } }) }
addEventListener('resize', measure); measure()
// ortho camera in pixel units: new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, -1000, 1000)
onUpdate(() => items.forEach(({ mesh, rect }) => {
  mesh.scale.set(rect.w, rect.h, 1)
  mesh.position.set(rect.left + rect.w / 2 - innerWidth / 2, -(rect.top - lenis.scroll) - rect.h / 2 + innerHeight / 2, 0)
  mesh.material.uniforms.uVelocity.value = lenis.velocity
}))
```
Hide the real `<img>` (opacity 0) only after WebGL texture loaded; keep it as fallback otherwise.

## tunnel-rat
Lets components anywhere in the React tree inject children into the Canvas: `const t = tunnel(); <t.In><mesh/></t.In>` in a section, `<t.Out />` inside Canvas.
