---
name: webgl-infinite-gallery
description: Infinite draggable/scrollable WebGL image galleries — curved carousel planes, circular/cylindrical layouts, velocity-based bend and RGB shift, wheel+drag+touch inertia, wrap-around looping. Use for portfolio work indexes and "explore our projects" experiences.
---

# Infinite WebGL gallery (curved, velocity-reactive)

Technique from Codrops/OGL "infinite circular gallery" demos. Works with three.js or OGL; shown in three.js.

## Input: unified wheel + drag + touch inertia
```js
const scroll = { current: 0, target: 0, last: 0, ease: 0.07 }
addEventListener('wheel', (e) => (scroll.target += (e.deltaY || e.deltaX) * 0.6), { passive: true })
let down = false, startX = 0, startTarget = 0
addEventListener('pointerdown', (e) => { down = true; startX = e.clientX; startTarget = scroll.target })
addEventListener('pointermove', (e) => { if (down) scroll.target = startTarget + (startX - e.clientX) * 2 })
addEventListener('pointerup', () => (down = false))
```

## Planes + wrap-around loop
```js
const urls = [...Array(12)].map((_, i) => `/work/${i + 1}.webp`)
const loader = new THREE.TextureLoader()
const GAP = 1.2, W = 2, H = 2.6
const total = urls.length * (W + GAP)
const geo = new THREE.PlaneGeometry(W, H, 32, 16)
const items = urls.map((url, i) => {
  const tex = loader.load(url, (t) => (mat.uniforms.uImgRes.value.set(t.image.width, t.image.height)))
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: tex }, uVelocity: { value: 0 }, uImgRes: { value: new THREE.Vector2(1, 1) }, uPlaneRes: { value: new THREE.Vector2(W, H) } },
    vertexShader: `uniform float uVelocity; varying vec2 vUv;
      void main(){ vUv = uv; vec3 p = position;
        vec4 world = modelMatrix * vec4(p, 1.);
        world.z -= pow(world.x, 2.) * 0.08;                         // curve the row like a cylinder
        world.y += sin(uv.x * 3.14159) * uVelocity * 0.02;          // bend while moving
        gl_Position = projectionMatrix * viewMatrix * world; }`,
    fragmentShader: `uniform sampler2D uTex; uniform vec2 uImgRes, uPlaneRes; uniform float uVelocity; varying vec2 vUv;
      void main(){
        vec2 r = vec2(min((uPlaneRes.x/uPlaneRes.y)/(uImgRes.x/uImgRes.y), 1.), min((uPlaneRes.y/uPlaneRes.x)/(uImgRes.y/uImgRes.x), 1.));
        vec2 uv = vec2(vUv.x * r.x + (1. - r.x) * .5, vUv.y * r.y + (1. - r.y) * .5);   // cover
        float s = uVelocity * 0.002;
        gl_FragColor = vec4(texture2D(uTex, uv + vec2(s,0.)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(s,0.)).b, 1.);
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh)
  return { mesh, mat, base: i * (W + GAP) }
})

onUpdate(() => {
  scroll.current += (scroll.target - scroll.current) * scroll.ease
  const velocity = scroll.current - scroll.last; scroll.last = scroll.current
  const offset = scroll.current * 0.01
  items.forEach(({ mesh, mat, base }) => {
    let x = ((base - offset) % total + total) % total - total / 2   // wrap into [-total/2, total/2)
    mesh.position.x = x
    mat.uniforms.uVelocity.value = velocity
  })
})
```

## Snap to nearest item
On `pointerup` / wheel idle (debounce 150ms): `scroll.target = Math.round(scroll.target / step) * step` where `step = (W + GAP) * 100`.

## Variants
- **Circular ring:** place items by angle `θ = (i / n) * 2π + offset` on `x = R sinθ, z = R cosθ`, rotate each to face center.
- **Vertical infinite grid:** wrap on y, columns moving at different speeds (parallax columns).
- **Click → fullscreen:** tween the selected plane's scale/position to fill the viewport and fade others; then route to the case study (`page-transitions-barba`).

## A11y
Mirror the gallery as a real list of links (visually hidden or as fallback), support arrow keys, and pause auto-drift under reduced motion.
