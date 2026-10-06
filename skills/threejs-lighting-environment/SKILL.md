---
name: threejs-lighting-environment
description: Studio-quality lighting for web 3D — HDRI environment maps (RGBELoader/PMREM), RoomEnvironment, tone mapping choice, soft shadows, contact shadows, baked AO/lightmaps, rim lights. Use when models look flat/plastic or to achieve product-photography realism.
---

# Lighting & environment for premium-looking 3D

Source: three.js examples (MIT) — `webgl_loader_gltf`, `webgl_materials_physical_transmission`, `RoomEnvironment`.

## 1. Image-based lighting first (90% of realism)
```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// Option A: HDRI (Poly Haven, CC0): studio_small_09_1k.hdr is a great product default
const hdr = await new RGBELoader().loadAsync('/hdr/studio_small_09_1k.hdr')
hdr.mapping = THREE.EquirectangularReflectionMapping
scene.environment = hdr                       // lighting + reflections
scene.environmentIntensity = 1                // r163+
scene.environmentRotation.y = Math.PI / 3     // r162+ rotate highlights
// scene.background = hdr; scene.backgroundBlurriness = 0.6  // optional blurred bg

// Option B: zero-download procedural studio
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
```
Use 1k–2k HDRs; 4k only for visible backgrounds. Prefer `.hdr`/`.exr` or compressed UltraHDR (`UltraHDRLoader`, ~10x smaller).

## 2. Tone mapping
`ACESFilmic` = contrasty filmic; `AgX` = more natural highlights, less saturated; `Neutral` (Khronos PBR Neutral) = accurate product colors (best for e-commerce). Set `renderer.toneMappingExposure` 0.8–1.4.

## 3. Key / rim lights on top of env
```js
const key = new THREE.DirectionalLight('#ffffff', 2.5); key.position.set(4, 6, 3)
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0001; key.shadow.normalBias = 0.02
key.shadow.camera.left = key.shadow.camera.bottom = -3; key.shadow.camera.right = key.shadow.camera.top = 3
const rim = new THREE.SpotLight('#88aaff', 30, 20, 0.5, 1); rim.position.set(-4, 2, -4)  // colored backlight = premium silhouette
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
```

## 4. Cheap grounded shadows
- Contact shadow: render a blurred top-down depth to a plane (drei `<ContactShadows>` / `<AccumulativeShadows>` in R3F; three.js example `webgl_shadow_contact`).
- Or bake a shadow PNG in Blender and put it on a transparent plane under the model — free at runtime.

## 5. Bake it
For static scenes: bake lighting + AO in Blender (Cycles → Bake → Combined/Diffuse) to a lightmap, use `MeshBasicMaterial({ map: baked })`. Gives Pixar-like lighting at 60fps on phones (Bruno Simon / Lusion approach). Remember `baked.flipY = false; baked.colorSpace = THREE.SRGBColorSpace` for glTF UVs.

## 6. Material sanity
- Textures with color data → `SRGBColorSpace`; normal/roughness/metal maps stay linear.
- Metals need an environment or they render black.
- `MeshPhysicalMaterial` extras: `clearcoat` (car paint), `sheen` (fabric), `iridescence` (soap/holo), `transmission` (glass — see `threejs-glass-transmission`), `anisotropy` (brushed metal).
