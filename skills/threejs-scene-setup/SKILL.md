---
name: threejs-scene-setup
description: Production three.js boilerplate — renderer config (color management, tone mapping, DPR cap), resize, render loop, scroll-synced fixed canvas behind DOM, disposal, WebGPU renderer option. Use as the starting point for any vanilla three.js hero, background or 3D section.
---

# three.js production scene setup

Source: https://github.com/mrdoob/three.js (MIT). Import addons from `three/addons/...`.

```bash
npm i three
```

## Boilerplate (fixed fullscreen canvas behind HTML)
```js
import * as THREE from 'three'

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))          // never uncapped
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping              // or AgXToneMapping / NeutralToneMapping
  renderer.toneMappingExposure = 1

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100)
  camera.position.set(0, 0, 6)

  const clock = new THREE.Clock()
  const updaters = new Set()

  function resize() {
    const w = innerWidth, h = innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize); resize()

  renderer.setAnimationLoop(() => {           // pauses automatically in XR; use gsap.ticker if syncing with Lenis
    const dt = clock.getDelta(), t = clock.elapsedTime
    updaters.forEach((fn) => fn(t, dt))
    renderer.render(scene, camera)
  })

  return { renderer, scene, camera, onUpdate: (fn) => (updaters.add(fn), () => updaters.delete(fn)) }
}
```
```css
canvas.webgl { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
```

## Sync loop with GSAP/Lenis (one rAF for everything)
```js
renderer.setAnimationLoop(null)
gsap.ticker.add((time, deltaMs) => { lenis.raf(time * 1000); updaters.forEach((fn) => fn(time, deltaMs / 1000)); renderer.render(scene, camera) })
```

## Pixel-perfect DOM ↔ WebGL mapping
To place a plane exactly over an `<img>`: compute visible height at depth z: `const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; const px2world = vh / innerHeight`. Then each frame: `mesh.position.y = -(rect.top + rect.height / 2 - innerHeight / 2) * px2world` (use Lenis scroll, not getBoundingClientRect, per frame). Or use an orthographic camera sized to pixels: `new OrthographicCamera(-w/2, w/2, h/2, -h/2, -1000, 1000)`.

## Pause when hidden / offscreen
```js
document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : loop))
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas.parentElement)
```

## Disposal (SPA routes!)
```js
scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { Object.values(m).forEach((v) => v?.isTexture && v.dispose()); m.dispose() }) })
renderer.dispose(); renderer.forceContextLoss()
```

## WebGPU renderer (r171+, falls back to WebGL2 automatically)
```js
import * as THREE from 'three/webgpu'
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true })
await renderer.init()
```
Uses TSL node materials (see `threejs-tsl-webgpu`) instead of raw GLSL ShaderMaterial.

## Debug
`lil-gui` (bundled: `three/addons/libs/lil-gui.module.min.js`), `stats-gl`, `renderer.info` (draw calls, triangles), Spector.js extension.
