---
name: threejs-gpgpu-particles
description: GPGPU particle systems in three.js using GPUComputationRenderer (position/velocity ping-pong textures) — 100k–1M particles with curl-noise flow, mouse repulsion, and attraction to model surfaces. Use for flowing particle heroes, swarms, and "particles forming a logo/model" effects.
---

# GPGPU particles (GPUComputationRenderer)

Source: three.js `examples/jsm/misc/GPUComputationRenderer.js` and `webgl_gpgpu_birds.html` (MIT). Needs float textures (WebGL2: fine everywhere modern).

## Setup
```js
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import noise3D from '../glsl-noise-library/resources/noise3D.glsl?raw'

const SIZE = 256                       // 256² = 65,536 particles
const gpu = new GPUComputationRenderer(SIZE, SIZE, renderer)

// Seed positions from a model surface (or random sphere)
const posTex = gpu.createTexture()
const sampler = new MeshSurfaceSampler(targetMesh).build()
const p = new THREE.Vector3(), arr = posTex.image.data
for (let i = 0; i < SIZE * SIZE; i++) { sampler.sample(p); arr.set([p.x, p.y, p.z, Math.random()], i * 4) } // w = life/random
const originTex = posTex.clone()

const posVar = gpu.addVariable('texturePosition', /* glsl */ `
  ${noise3D}
  uniform float uTime, uDelta, uFlow; uniform sampler2D uOrigin; uniform vec3 uMouse;
  vec3 snoiseVec3(vec3 x){ return vec3(snoise(x), snoise(x+vec3(-19.1,33.4,47.2)), snoise(x+vec3(74.2,-124.5,99.4))); }
  vec3 curl(vec3 p){ const float e=.1; vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
    vec3 x0=snoiseVec3(p-dx),x1=snoiseVec3(p+dx),y0=snoiseVec3(p-dy),y1=snoiseVec3(p+dy),z0=snoiseVec3(p-dz),z1=snoiseVec3(p+dz);
    return normalize(vec3(y1.z-y0.z-z1.y+z0.y, z1.x-z0.x-x1.z+x0.z, x1.y-x0.y-y1.x+y0.x)/(2.*e)); }
  void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec3 origin = texture2D(uOrigin, uv).xyz;
    float life = pos.w - uDelta * 0.25;
    if (life <= 0.0) { pos.xyz = origin; life = 1.0; }               // respawn on surface
    pos.xyz += curl(pos.xyz * 0.6 + uTime * 0.1) * uDelta * uFlow;   // drift
    vec3 toMouse = pos.xyz - uMouse; float d = length(toMouse);
    pos.xyz += normalize(toMouse) * smoothstep(0.6, 0.0, d) * uDelta * 3.0; // repel
    gl_FragColor = vec4(pos.xyz, life);
  }`, posTex)
gpu.setVariableDependencies(posVar, [posVar])
Object.assign(posVar.material.uniforms, { uTime: { value: 0 }, uDelta: { value: 0 }, uFlow: { value: 0.5 }, uOrigin: { value: originTex }, uMouse: { value: new THREE.Vector3(99, 99, 99) } })
const err = gpu.init(); if (err) console.error(err)
```

## Render the particles
```js
const geo = new THREE.BufferGeometry()
const refs = new Float32Array(SIZE * SIZE * 2)
for (let i = 0; i < SIZE * SIZE; i++) { refs[i * 2] = (i % SIZE + 0.5) / SIZE; refs[i * 2 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE }
geo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2))
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SIZE * SIZE * 3), 3)) // required, unused
const mat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uPos: { value: null }, uSize: { value: 6 * renderer.getPixelRatio() }, uColor: { value: new THREE.Color('#8fd3ff') } },
  vertexShader: `uniform sampler2D uPos; uniform float uSize; attribute vec2 aRef; varying float vLife;
    void main(){ vec4 p = texture2D(uPos, aRef); vLife = p.w; vec4 mv = modelViewMatrix * vec4(p.xyz,1.); gl_PointSize = uSize * (1.0 / -mv.z) * smoothstep(0.,.1,p.w); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uColor; varying float vLife;
    void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(uColor, smoothstep(.5, 0., d) * vLife); }`,
})
const points = new THREE.Points(geo, mat); points.frustumCulled = false; scene.add(points)

onUpdate((t, dt) => {
  const u = posVar.material.uniforms
  u.uTime.value = t; u.uDelta.value = Math.min(dt, 1 / 30)
  gpu.compute()
  mat.uniforms.uPos.value = gpu.getCurrentRenderTarget(posVar).texture
})
```

## Mouse in 3D
Raycast against an invisible plane at z=0 each pointermove; write hit point to `uMouse`.

## Morph between shapes
Keep two origin textures (logo, sphere) and blend `origin = mix(o1, o2, uMorph)` — scrub `uMorph` with ScrollTrigger.

## Scale tips
- 512² = 262k particles is fine on desktop; use 128² on mobile.
- Add a velocity variable (second `addVariable`, dependencies [pos, vel]) for inertia/springy behavior as in the birds example.
- WebGPU alternative: compute shaders via TSL `instancedArray` + `Fn().compute()` (see `threejs-tsl-webgpu`), ~1M particles.
