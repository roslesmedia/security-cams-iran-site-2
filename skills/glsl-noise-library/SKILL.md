---
name: glsl-noise-library
description: Drop-in GLSL noise functions (Ashima/stegu simplex 2D/3D and classic Perlin, copied verbatim, MIT) plus fBm, curl noise, domain warping and value/hash helpers. Use whenever a shader needs organic motion — blobs, flowing gradients, terrain, particles, smoke, grain.
---

# GLSL noise library

Verbatim sources from https://github.com/ashima/webgl-noise (MIT, Ashima Arts / Stefan Gustavson) live in `resources/`:
- `resources/noise2D.glsl` → `float snoise(vec2 v)` (range ≈ -1..1)
- `resources/noise3D.glsl` → `float snoise(vec3 v)`
- `resources/cnoise3D.glsl` → `float cnoise(vec3 P)` classic Perlin + `pnoise(vec3 P, vec3 rep)` periodic
- `resources/LICENSE-ashima-webgl-noise` — keep this license notice when shipping.

Note: noise2D and noise3D both define `mod289`/`permute` — include only one file per shader, or rename helpers when combining.

## Include
```js
import snoise3 from './resources/noise3D.glsl?raw'   // Vite
const frag = `${snoise3}\n...your shader...`
```

## fBm (fractal Brownian motion) — layered detail
```glsl
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * snoise(p); p *= 2.02; a *= 0.5; }
  return v;
}
```

## Domain warping (Inigo Quilez) — liquid marble / smoke gradients
```glsl
float pattern(vec2 p, float t) {
  vec2 q = vec2(fbm(vec3(p, t)), fbm(vec3(p + vec2(5.2, 1.3), t)));
  vec2 r = vec2(fbm(vec3(p + 4.0 * q + vec2(1.7, 9.2), t)), fbm(vec3(p + 4.0 * q + vec2(8.3, 2.8), t)));
  return fbm(vec3(p + 4.0 * r, t));
}
```

## Curl noise (divergence-free flow for particles)
```glsl
vec3 snoiseVec3(vec3 x) { return vec3(snoise(x), snoise(x + vec3(-19.1, 33.4, 47.2)), snoise(x + vec3(74.2, -124.5, 99.4))); }
vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e,0,0), dy = vec3(0,e,0), dz = vec3(0,0,e);
  vec3 px0 = snoiseVec3(p - dx), px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy), py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz), pz1 = snoiseVec3(p + dz);
  float x = py1.z - py0.z - pz1.y + pz0.y;
  float y = pz1.x - pz0.x - px1.z + px0.z;
  float z = px1.y - px0.y - py1.x + py0.x;
  return normalize(vec3(x, y, z) / (2.0 * e));
}
```

## Cheap hash / value noise / grain
```glsl
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); } // Dave Hoskins, MIT
float grain(vec2 uv, float t) { return hash12(uv * 1000.0 + fract(t) * 100.0) - 0.5; }
```

## Other libraries worth knowing
- LYGIA (https://github.com/patriciogonzalezvivo/lygia) — huge shader library; **Prosperity/Patron license: commercial use requires sponsorship**. Check before shipping client work.
- `glsl-noise` npm (stackgl) — same Ashima functions packaged for glslify.
