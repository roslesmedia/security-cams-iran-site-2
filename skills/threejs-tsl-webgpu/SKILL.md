---
name: threejs-tsl-webgpu
description: three.js WebGPU renderer with TSL (Three Shading Language) node materials and compute shaders — write shaders in JS that compile to WGSL/GLSL, million-particle compute simulations, and automatic WebGL2 fallback. Use for cutting-edge particle/compute heroes and future-proof shader work.
---

# three.js WebGPU + TSL

Source: three.js (MIT) — `three/webgpu`, `three/tsl`, examples `webgpu_compute_particles`, `webgpu_tsl_*`. Stable enough for production since ~r171; falls back to WebGL2 backend automatically.

## Setup
```js
import * as THREE from 'three/webgpu'
import { Fn, uniform, time, positionLocal, normalLocal, uv, vec3, vec4, color, mix, sin, mx_noise_float, instancedArray, instanceIndex, hash } from 'three/tsl'

const renderer = new THREE.WebGPURenderer({ canvas, antialias: true })
await renderer.init()
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setAnimationLoop(() => renderer.render(scene, camera))
```

## Node material: displaced noise blob (no GLSL strings)
```js
const uAmp = uniform(0.3)
const mat = new THREE.MeshStandardNodeMaterial({ roughness: 0.3, metalness: 0.1 })
const n = mx_noise_float(normalLocal.mul(1.5).add(time.mul(0.3)))
mat.positionNode = positionLocal.add(normalLocal.mul(n.mul(uAmp)))
mat.colorNode = mix(color('#5b2bff'), color('#ff6ad5'), n.mul(0.5).add(0.5))
scene.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 128), mat))
// animate from JS: uAmp.value = 0.5 (GSAP-tweenable: gsap.to(uAmp, { value: 0.6 }))
```

## Compute particles (≈1M on desktop)
```js
const COUNT = 500_000
const positions = instancedArray(COUNT, 'vec3')
const velocities = instancedArray(COUNT, 'vec3')

const init = Fn(() => {
  const p = positions.element(instanceIndex)
  p.assign(vec3(hash(instanceIndex), hash(instanceIndex.add(1)), hash(instanceIndex.add(2))).sub(0.5).mul(6))
})().compute(COUNT)
await renderer.computeAsync(init)

const uMouse = uniform(new THREE.Vector3())
const update = Fn(() => {
  const p = positions.element(instanceIndex), v = velocities.element(instanceIndex)
  const toMouse = uMouse.sub(p)
  v.addAssign(toMouse.normalize().mul(0.0005))                // attract
  v.addAssign(vec3(mx_noise_float(p.add(time)), mx_noise_float(p.add(10)), mx_noise_float(p.sub(10))).mul(0.0003))
  v.mulAssign(0.98)                                           // damping
  p.addAssign(v)
})().compute(COUNT)

const spriteMat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
spriteMat.positionNode = positions.toAttribute()
spriteMat.scaleNode = uniform(0.02)
spriteMat.colorNode = vec4(0.5, 0.8, 1.0, 0.8)
const particles = new THREE.Sprite(spriteMat); particles.count = COUNT; scene.add(particles)

renderer.setAnimationLoop(() => { renderer.compute(update); renderer.render(scene, camera) })
```

## Post-processing in TSL
```js
import { pass } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
const post = new THREE.PostProcessing(renderer)
const scenePass = pass(scene, camera)
post.outputNode = scenePass.add(bloom(scenePass, 1.2, 0.4, 0.8))
renderer.setAnimationLoop(() => post.render())
```

## Notes
- API still evolves between releases — pin the three version and check examples for that release.
- R3F v9 supports WebGPU: `<Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r }}>`.
- Raw `ShaderMaterial` GLSL does NOT work in WebGPURenderer — port to TSL.
