---
name: threejs-gltf-asset-pipeline
description: Optimize and load 3D models for the web — Blender export, gltf-transform (Draco/Meshopt compression, KTX2/WebP textures, resize, dedup), gltfjsx for React components, GLTFLoader + DRACOLoader + KTX2Loader setup. Use whenever a .glb/.gltf/.fbx model goes on a site.
---

# glTF asset pipeline

Sources: https://github.com/donmccurdy/glTF-Transform (MIT), https://github.com/pmndrs/gltfjsx (MIT), three.js loaders (MIT).

## 1. Export from Blender
File → Export → glTF 2.0 (.glb). Apply modifiers, +Y up, include only selected, bake complex procedural materials to textures, keep tris < ~200k for heroes. Name objects meaningfully — names become accessors.

## 2. Compress (typical 20MB → 1–2MB)
```bash
npx @gltf-transform/cli optimize in.glb out.glb \
  --compress meshopt \           # or draco
  --texture-compress webp \      # or ktx2 (--texture-compress ktx2 needs KTX-Software installed)
  --texture-size 2048 \
  --simplify true --simplify-ratio 0.75
npx @gltf-transform/cli inspect out.glb     # check sizes, draw calls
```
Or the gltfjsx shortcut (runs gltf-transform under the hood):
```bash
npx gltfjsx model.glb --transform --types --shadows   # outputs model-transformed.glb + Model.tsx
```
Flags: `--transform` (draco + webp + resize 1024 + dedupe), `--resolution 2048`, `--instance` (auto-instancing repeated meshes), `--keepnames`.

## 3. Load in vanilla three.js
```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
const ktx2 = new KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/basis/').detectSupport(renderer)
const loader = new GLTFLoader(manager).setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder)

const gltf = await loader.loadAsync('/models/hero.glb')
gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true } })
scene.add(gltf.scene)

// Animations
const mixer = new THREE.AnimationMixer(gltf.scene)
gltf.animations.forEach((clip) => mixer.clipAction(clip).play())
onUpdate((t, dt) => mixer.update(dt))
// Scroll-scrub an animation: action.paused = true; action.play(); then each scroll: mixer.setTime(progress * clip.duration)
```
Self-host decoders in production (copy `node_modules/three/examples/jsm/libs/draco` + `basis` to `/public`).

## 4. React Three Fiber
```tsx
import { useGLTF } from '@react-three/drei'
const { nodes, materials, animations } = useGLTF('/model-transformed.glb')   // draco/meshopt auto-handled
useGLTF.preload('/model-transformed.glb')
```

## Budgets for a smooth 60fps marketing site
- Total 3D payload < 3–5MB; hero model < 1.5MB.
- Textures: 2K max, 1K on mobile; prefer KTX2 (GPU-compressed, low VRAM).
- Draw calls < 100; merge static meshes, instance repeats.
- Bake lighting/AO into textures (Blender Cycles → bake) for "expensive-looking" results at zero runtime cost.
