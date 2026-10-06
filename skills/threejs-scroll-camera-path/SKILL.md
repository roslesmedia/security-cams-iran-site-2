---
name: threejs-scroll-camera-path
description: Scroll-driven 3D storytelling — camera flying along a CatmullRom spline, keyframed camera/target positions per section, model rotations and material changes tied to ScrollTrigger progress. Use for "scroll through a 3D world" sites and product scrollytelling.
---

# Scroll-driven 3D camera & scene choreography

## A. Camera along a spline (fly-through)
```js
import * as THREE from 'three'
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1, 10), new THREE.Vector3(3, 2, 4), new THREE.Vector3(-2, 1, -2),
  new THREE.Vector3(0, 0.5, -8), new THREE.Vector3(4, 3, -14),
], false, 'catmullrom', 0.5)

const scroll = { target: 0, current: 0 }
ScrollTrigger.create({ trigger: '#journey', start: 'top top', end: 'bottom bottom', onUpdate: (s) => (scroll.target = s.progress) })

const lookAt = new THREE.Vector3()
onUpdate(() => {
  scroll.current += (scroll.target - scroll.current) * 0.06       // extra damping = cinematic
  const p = Math.min(scroll.current, 0.9999)
  curve.getPointAt(p, camera.position)
  curve.getPointAt(Math.min(p + 0.01, 1), lookAt)
  camera.lookAt(lookAt)
})
```
Visualize while building: `scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(200)), new THREE.LineBasicMaterial()))`. Author the path in Blender as a curve, export point list, or use Theatre.js (`theatre-js-sequencing`).

## B. Keyframed sections (camera + target per section) — most common for product sites
```js
const shots = [
  { pos: [0, 0, 6], target: [0, 0, 0] },
  { pos: [3, 1, 3], target: [0, 0.5, 0] },
  { pos: [-2, 3, 2], target: [0, 0, 0] },
  { pos: [0, 0.2, 2.2], target: [0, 0.2, 0] },
]
const target = new THREE.Vector3()
const tl = gsap.timeline({ scrollTrigger: { trigger: '#product', start: 'top top', end: 'bottom bottom', scrub: 1.2 } })
shots.slice(1).forEach((s, i) => {
  tl.to(camera.position, { x: s.pos[0], y: s.pos[1], z: s.pos[2], ease: 'power2.inOut' }, i)
    .to(target, { x: s.target[0], y: s.target[1], z: s.target[2], ease: 'power2.inOut' }, i)
})
onUpdate(() => camera.lookAt(target))
```
Each DOM section (100vh, with copy) lines up with one segment: total timeline duration = sections - 1.

## C. Model transforms & material swaps
```js
tl.to(model.rotation, { y: Math.PI * 2, ease: 'none' }, 0)
  .to(material.color, { r: 0.9, g: 0.2, b: 0.3 }, 1)              // color change in section 2
  .to(material, { roughness: 0.1, metalness: 1 }, 2)
  .to(explodedParts.map((m) => m.position), { y: (i) => i * 0.4, stagger: 0.02 }, 2) // exploded view
```

## D. Mouse sway on top of scroll (adds life)
```js
const mouse = new THREE.Vector2(), sway = new THREE.Vector2()
addEventListener('pointermove', (e) => mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5))
onUpdate(() => { sway.lerp(mouse, 0.05); cameraRig.rotation.set(-sway.y * 0.15, -sway.x * 0.25, 0) })
```
Put the camera inside a `cameraRig` Group so scroll moves the camera and the mouse rotates the rig — no conflicts.

## R3F equivalent
Use drei `ScrollControls` + `useScroll()` (see `drei-scroll-controls`), or read a GSAP-scrubbed proxy object in `useFrame`. Use `maath/easing` `damp3(camera.position, target, 0.25, delta)` for frame-rate-independent smoothing.

## Tips
- Damping must be delta-time based for 120Hz screens: `x += (t - x) * (1 - Math.exp(-k * dt))`.
- Keep FOV narrow (25–40°) for a premium product-photography look.
- Add depth of field / bloom at key moments via postprocessing uniforms on the same timeline.
