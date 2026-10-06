---
name: threejs-custom-shaders
description: Writing GLSL ShaderMaterial / RawShaderMaterial in three.js — uniforms, varyings, vertex displacement, fresnel, UV distortions, onBeforeCompile to extend standard materials, and three-custom-shader-material. Use for any custom visual effect (blobs, waves, holographic, dissolve, distortion).
---

# Custom shaders in three.js

Source: three.js docs/examples (MIT); https://github.com/FarazzShaikh/THREE-CustomShaderMaterial (MIT).

## Animated displaced blob (the classic hero orb)
```js
import * as THREE from 'three'
import noise from '../glsl-noise-library/resources/noise3D.glsl?raw'   // Vite ?raw import

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }, uAmp: { value: 0.35 }, uFreq: { value: 1.4 },
    uColorA: { value: new THREE.Color('#5b2bff') }, uColorB: { value: new THREE.Color('#ff6ad5') },
    uMouse: { value: new THREE.Vector2() },
  },
  vertexShader: /* glsl */ `
    ${noise}
    uniform float uTime, uAmp, uFreq;
    varying vec3 vNormal; varying vec3 vViewDir; varying float vDisp;
    void main() {
      float d = snoise(normal * uFreq + uTime * 0.3) * uAmp;
      vDisp = d;
      vec3 pos = position + normal * d;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA, uColorB;
    varying vec3 vNormal; varying vec3 vViewDir; varying float vDisp;
    void main() {
      float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
      vec3 col = mix(uColorA, uColorB, smoothstep(-0.3, 0.3, vDisp));
      col += fres * 0.8;
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
})
const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 128), material)
onUpdate((t) => (material.uniforms.uTime.value = t))
```
Normals aren't recomputed after displacement; for lit results recompute via neighbor sampling (see "Recomputing normals" in CSM) or use CSM below.

## Extend a PBR material (keep lights, shadows, envmap)
```js
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
const mat = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader: `${noise} uniform float uTime; void main(){ csm_Position = position + normal * snoise(position + uTime) * 0.2; }`,
  fragmentShader: `void main(){ csm_DiffuseColor = vec4(vec3(0.9,0.3,0.6), 1.0); }`,
  uniforms: { uTime: { value: 0 } },
  roughness: 0.2, metalness: 0.1, transmission: 0.0,
})
```

## onBeforeCompile (no dependency)
```js
mat.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = uniforms.uTime
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uTime;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += sin(position.x * 3.0 + uTime) * 0.1;')
}
```

## Fragment snippets you'll reuse
```glsl
// Dissolve with noisy edge glow (uProgress 0..1)
float n = snoise(vec3(vUv * 4.0, 0.0)) * 0.5 + 0.5;
if (n < uProgress) discard;
float edge = smoothstep(uProgress, uProgress + 0.05, n);
col = mix(vec3(1.0, 0.5, 0.1) * 4.0, col, edge);

// Holographic stripes
float stripes = pow(mod((vWorldPos.y - uTime * 0.02) * 20.0, 1.0), 3.0);
alpha = stripes * fres + fres * 1.25;

// Cosine palette (Inigo Quilez) — endless gradient colors
vec3 palette(float t){ vec3 a=vec3(.5),b=vec3(.5),c=vec3(1.),d=vec3(.0,.33,.67); return a+b*cos(6.28318*(c*t+d)); }
```

## Workflow
- Vite: `vite-plugin-glsl` lets you `import frag from './frag.glsl'` with `#include` support.
- Debug a value by outputting it as color: `gl_FragColor = vec4(vec3(value), 1.0);`.
- Use `mediump` carefully on mobile (noise artifacts) — keep `highp` for position/time math.
- Wrap time: `mod(uTime, 1000.0)` to avoid float precision drift after long sessions.
