---
name: webgl-image-hover-distortion
description: WebGL image effects for portfolios — hover displacement/liquid distortion, RGB split, image-to-image transition sliders with displacement maps, cursor-following image reveals, scroll-velocity wave on images. Use for project grids, case-study lists and hero sliders that need tactile image interaction.
---

# WebGL image hover & transition effects

Patterns popularized by Codrops demos (many MIT) and libraries hover-effect (MIT, robin-dela/hover-effect), curtains.js (MIT, martinlaxenaire/curtainsjs).

## Shader core: displacement transition between two textures
```glsl
// fragment
uniform sampler2D uTex1, uTex2, uDisp; uniform float uProgress, uIntensity; uniform vec2 uRes, uImgRes; varying vec2 vUv;
vec2 coverUv(vec2 uv, vec2 res, vec2 img){ vec2 s = res / img; float sc = max(s.x, s.y); vec2 n = img * sc; return (uv * res - (res - n) * .5) / n; } // object-fit: cover
void main(){
  vec2 uv = coverUv(vUv, uRes, uImgRes);
  float d = texture2D(uDisp, vUv).r;
  vec2 uv1 = uv + vec2(d * uProgress * uIntensity, 0.);
  vec2 uv2 = uv - vec2(d * (1. - uProgress) * uIntensity, 0.);
  gl_FragColor = mix(texture2D(uTex1, uv1), texture2D(uTex2, uv2), uProgress);
}
```
Animate `uProgress` 0→1 with GSAP (`expo.inOut`, 1.2s) on hover/slide change. Displacement maps: grayscale noise/stripes/fluid PNGs — the map's character defines the transition.

## Hover liquid distortion on a single image (mouse-centred ripple)
```glsl
uniform sampler2D uTex; uniform vec2 uMouse; uniform float uHover, uTime; varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  float dist = distance(uv, uMouse);
  float ripple = sin(dist * 30. - uTime * 4.) * 0.012 * smoothstep(0.35, 0., dist) * uHover;
  uv += normalize(uv - uMouse + 1e-4) * ripple;
  float shift = 0.01 * uHover * smoothstep(0.4, 0., dist);
  gl_FragColor = vec4(texture2D(uTex, uv + shift).r, texture2D(uTex, uv).g, texture2D(uTex, uv - shift).b, 1.);
}
```
JS: on `pointerenter` → `gsap.to(u.uHover, { value: 1 })`; on move → map pointer to element-local UV (0..1, y flipped) and lerp `uMouse`.

## Scroll-velocity bend (images curve while scrolling)
```glsl
// vertex
uniform float uVelocity; varying vec2 vUv;
void main(){ vUv = uv; vec3 p = position; p.y += sin(uv.x * 3.14159) * uVelocity * 0.0015 * 100.; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }
```
(Use a segmented plane, e.g. `PlaneGeometry(1, 1, 32, 32)`, and pixel-mapped meshes from `r3f-dom-sync-views`.)

## Cursor-follow image reveal on a text list (no WebGL required)
```js
const preview = document.querySelector('.preview'), img = preview.querySelector('img')
const x = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' }), y = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' })
const rot = gsap.quickTo(preview, 'rotate', { duration: 0.8 })
let lastX = 0
document.querySelectorAll('.project-row').forEach((row) => {
  row.addEventListener('pointerenter', () => { img.src = row.dataset.img; gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.4 }) })
  row.addEventListener('pointerleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.8, duration: 0.4 }))
})
addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); rot(gsap.utils.clamp(-15, 15, (e.clientX - lastX) * 0.6)); lastX = e.clientX })
```
Upgrade: render the preview as a WebGL plane and feed pointer velocity into the RGB-split shader above.

## Libraries
- curtains.js — turns `<img>` in planes that follow DOM automatically: `new Curtains({ container: 'canvas' })`, `new Plane(curtains, el, { vertexShader, fragmentShader, uniforms })`.
- hover-effect — `new hoverEffect({ parent, intensity: 0.3, image1, image2, displacementImage })` for one-liners.
