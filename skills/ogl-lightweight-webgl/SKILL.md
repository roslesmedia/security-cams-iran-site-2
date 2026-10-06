---
name: ogl-lightweight-webgl
description: OGL — minimal (~13KB) WebGL library for performant effects when three.js is too heavy — fullscreen shaders, image planes, particles, flowmap mouse trails, infinite WebGL galleries. Use for lightweight live backgrounds and portfolio effects where bundle size matters.
---

# OGL (minimal WebGL)

Source: https://github.com/oframe/ogl (Unlicense / public domain). API mirrors three.js but you write the shaders.

```bash
npm i ogl
```

## Basic setup (from the OGL README)
```js
import { Renderer, Camera, Transform, Program, Mesh, Triangle, Vec2, Flowmap, Texture } from 'ogl'

const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true })
const gl = renderer.gl
document.body.appendChild(gl.canvas)
const camera = new Camera(gl); camera.position.z = 5
function resize() { renderer.setSize(innerWidth, innerHeight); camera.perspective({ aspect: gl.canvas.width / gl.canvas.height }) }
addEventListener('resize', resize); resize()
```

## Fullscreen shader with flowmap mouse trail (signature OGL effect)
```js
const flowmap = new Flowmap(gl, { falloff: 0.3, dissipation: 0.96, alpha: 0.5 })
const texture = new Texture(gl); const img = new Image(); img.onload = () => (texture.image = img); img.src = '/hero.jpg'
const program = new Program(gl, {
  vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
  fragment: `precision highp float; uniform sampler2D tWater, tFlow; uniform float uTime; varying vec2 vUv;
    void main(){
      vec3 flow = texture2D(tFlow, vUv).rgb;                      // xy = velocity, z = strength
      vec2 uv = vUv - flow.xy * (0.15 * flow.z);
      vec3 col = vec3(texture2D(tWater, uv + flow.xy * 0.01).r, texture2D(tWater, uv).g, texture2D(tWater, uv - flow.xy * 0.01).b);
      gl_FragColor = vec4(col, 1.);
    }`,
  uniforms: { uTime: { value: 0 }, tWater: { value: texture }, tFlow: flowmap.uniform },
})
const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

const mouse = new Vec2(-1), velocity = new Vec2(), last = new Vec2()
let lastTime
addEventListener('pointermove', (e) => {
  mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight)
  if (!lastTime) { lastTime = performance.now(); last.set(e.clientX, e.clientY) }
  const dt = Math.max(14, performance.now() - lastTime); lastTime = performance.now()
  velocity.set((e.clientX - last.x) / dt, (e.clientY - last.y) / dt); last.set(e.clientX, e.clientY)
  velocity.needsUpdate = true
})
requestAnimationFrame(function loop(t) {
  requestAnimationFrame(loop)
  if (!velocity.needsUpdate) { mouse.set(-1); velocity.set(0) } velocity.needsUpdate = false
  flowmap.aspect = innerWidth / innerHeight; flowmap.mouse.copy(mouse)
  flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1)
  flowmap.update()
  program.uniforms.uTime.value = t * 0.001
  renderer.render({ scene: mesh })
})
```
(Mirrors OGL's `examples/mouse-flowmap.html`.)

## Other built-ins worth knowing
`Plane`, `Sphere`, `Box`, `Cylinder`, `Torus` geometry; `Orbit` controls; `GLTFLoader`; `GPGPU` helper for particle sims; `Post` for post-processing; `Text` + `Font` for SDF text; `RenderTarget`; `Raycast`.

## When to choose OGL vs three.js
OGL: single effect, tight bundle, you're comfortable with GLSL (e.g. a portfolio image gallery). three.js: models, PBR lighting, ecosystem (loaders, post, R3F).
