---
name: threejs-postprocessing
description: Post-processing for three.js — bloom (UnrealBloomPass / pmndrs postprocessing), chromatic aberration, film grain, vignette, depth of field, custom fullscreen ShaderPass (RGB shift on scroll velocity, pixelation, glitch). Use to give WebGL scenes the cinematic "expensive" finish.
---

# three.js post-processing

Sources: three.js `examples/jsm/postprocessing` (MIT; pattern from `webgl_postprocessing_unreal_bloom.html`), https://github.com/pmndrs/postprocessing (Zlib) — faster, merges effects into one pass.

## Option A — built-in three.js passes (from the official bloom example)
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.5, 0.4, 0.85) // strength, radius, threshold
composer.addPass(bloom)
composer.addPass(new ShaderPass(RGBShiftVelocityShader))  // custom, below
composer.addPass(new OutputPass())                        // tone mapping + sRGB — always last
// resize: composer.setSize(w, h); composer.setPixelRatio(dpr)
// loop: composer.render() instead of renderer.render()
```

### Custom pass: scroll-velocity RGB shift + grain + vignette
```js
const RGBShiftVelocityShader = {
  uniforms: { tDiffuse: { value: null }, uVelocity: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uVelocity, uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 dir = vUv - 0.5;
      float amt = uVelocity * 0.004 * length(dir);
      vec4 c;
      c.r = texture2D(tDiffuse, vUv + dir * amt).r;
      c.g = texture2D(tDiffuse, vUv).g;
      c.b = texture2D(tDiffuse, vUv - dir * amt).b;
      c.a = 1.0;
      c.rgb += (hash(vUv * 1000.0 + uTime) - 0.5) * 0.06;            // grain
      c.rgb *= smoothstep(0.85, 0.25, length(dir));                    // vignette
      gl_FragColor = c;
    }`,
}
lenis.on('scroll', ({ velocity }) => (rgbPass.uniforms.uVelocity.value = velocity))
```

### Selective bloom
Simplest: keep threshold high (0.85+) and push emissive/HDR colors > 1 on objects you want glowing (`material.emissiveIntensity = 4`, or `color.multiplyScalar(4)` with `toneMapped: false`). Layer-based selective bloom is in the three.js example `webgl_postprocessing_unreal_bloom_selective`.

## Option B — pmndrs/postprocessing (recommended for multiple effects)
```js
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ChromaticAberrationEffect, NoiseEffect, VignetteEffect, BlendFunction, DepthOfFieldEffect } from 'postprocessing'
const renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance', antialias: false, stencil: false, depth: false })
const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType })
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new EffectPass(camera,
  new BloomEffect({ intensity: 1.2, luminanceThreshold: 0.6, mipmapBlur: true }),
  new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.001, 0.001) }),
  new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true }),
  new VignetteEffect({ darkness: 0.5 }),
))
// loop: composer.render(dt)
```
Turn off renderer antialias when using a composer; add `SMAAEffect` or render at DPR 1.5–2 instead.

## Budget
Each fullscreen pass costs fill-rate: on mobile drop to bloom + one merged pass, or disable post entirely below a GPU tier (`detect-gpu`).
