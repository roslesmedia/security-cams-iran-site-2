---
name: threejs-particle-morphing
description: Particles that morph between shapes (text, logo SVG, GLTF models, images) on scroll or click using attribute blending in a vertex shader, with noise-driven transitions. Use for "dust forms the logo", shape-shifting hero particles, and scroll-morphing point clouds.
---

# Particle morphing between shapes

Technique widely taught (three.js journey "particles morphing", Codrops). Core idea: every target shape is sampled to the SAME number of points; the vertex shader mixes `position` → `aTarget` with per-particle delay.

## 1. Sample shapes to N points
```js
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
const N = 20000
function sampleMesh(mesh) {
  const s = new MeshSurfaceSampler(mesh).build(), v = new THREE.Vector3(), out = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) { s.sample(v); out.set([v.x, v.y, v.z], i * 3) }
  return out
}
// Text → mesh via TextGeometry, or image → points by reading pixels:
function sampleImage(img, scale = 4) {
  const c = document.createElement('canvas'), ctx = c.getContext('2d')
  c.width = img.width; c.height = img.height; ctx.drawImage(img, 0, 0)
  const d = ctx.getImageData(0, 0, c.width, c.height).data, pts = []
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 128) pts.push((x / c.width - .5) * scale, -(y / c.height - .5) * scale * c.height / c.width, 0)
  const out = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) { const j = (Math.random() * pts.length / 3 | 0) * 3; out.set([pts[j], pts[j + 1], pts[j + 2]], i * 3) }
  return out
}
const shapes = [sampleMesh(sphere), sampleMesh(logoMesh), sampleImage(photo)]
```

## 2. Geometry + shader
```js
const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3))
geo.setAttribute('aTarget', new THREE.BufferAttribute(shapes[1].slice(), 3))
geo.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(N).map(Math.random), 1))

const mat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uSize: { value: 0.04 * innerHeight }, uColorA: { value: new THREE.Color('#ff7a59') }, uColorB: { value: new THREE.Color('#5b8cff') } },
  vertexShader: /* glsl */ `
    uniform float uProgress, uTime, uSize; attribute vec3 aTarget; attribute float aRand; varying vec3 vColorMix;
    void main(){
      float delay = aRand * 0.4;                              // staggered morph
      float p = smoothstep(delay, delay + 0.6, uProgress);
      vec3 pos = mix(position, aTarget, p);
      pos += sin(vec3(aRand * 40.0, aRand * 70.0, aRand * 90.0) + uTime) * 0.02;   // idle shimmer
      pos += normalize(pos + 0.001) * sin(p * 3.14159) * aRand * 0.6;               // burst mid-transition
      vColorMix = vec3(p);
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = uSize * (0.5 + aRand) / -mv.z;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA, uColorB; varying vec3 vColorMix;
    void main(){ float d = length(gl_PointCoord - .5); float a = .05 / d - .1; if (a <= 0.) discard; gl_FragColor = vec4(mix(uColorA, uColorB, vColorMix.x), a); }`,
})
scene.add(new THREE.Points(geo, mat))
```

## 3. Morph on scroll (chain multiple shapes)
```js
function setPair(a, b) { geo.attributes.position.array.set(shapes[a]); geo.attributes.aTarget.array.set(shapes[b]); geo.attributes.position.needsUpdate = geo.attributes.aTarget.needsUpdate = true }
ScrollTrigger.create({ trigger: '#morph', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => {
  const seg = s.progress * (shapes.length - 1), i = Math.min(Math.floor(seg), shapes.length - 2)
  if (i !== current) { setPair(i, i + 1); current = i }
  mat.uniforms.uProgress.value = seg - i
} })
let current = -1
```
For 100k+ points or physics-y behavior use the GPGPU version (`threejs-gpgpu-particles`) with two origin textures.
