---
name: threejs-instancing
description: Render thousands of objects in one draw call with InstancedMesh / BatchedMesh — per-instance matrices, colors, custom attributes, scroll-wave grids, scatter on surfaces, mouse-reactive fields. Use for cube walls, floating object clouds, voxel heroes, and data-driven 3D grids.
---

# Instancing (InstancedMesh)

Source: three.js docs/examples (MIT) — `webgl_instancing_performance`, `webgl_instancing_scatter`.

## Grid of boxes reacting to mouse & time
```js
const COUNT_X = 60, COUNT_Y = 30, N = COUNT_X * COUNT_Y
const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18)
const mat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.2 })
const mesh = new THREE.InstancedMesh(geo, mat, N)
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
scene.add(mesh)

const dummy = new THREE.Object3D(), color = new THREE.Color()
const mouse = new THREE.Vector3(999, 999, 0)
for (let i = 0; i < N; i++) mesh.setColorAt(i, color.setHSL(0.6 + (i / N) * 0.2, 0.7, 0.55))

onUpdate((t) => {
  let i = 0
  for (let x = 0; x < COUNT_X; x++) for (let y = 0; y < COUNT_Y; y++, i++) {
    const px = (x - COUNT_X / 2) * 0.22, py = (y - COUNT_Y / 2) * 0.22
    const d = Math.hypot(px - mouse.x, py - mouse.y)
    const wave = Math.sin(px * 0.8 + t * 1.5) * Math.cos(py * 0.8 + t) * 0.3
    const push = Math.max(0, 1.2 - d) * 1.2
    dummy.position.set(px, py, wave + push)
    dummy.rotation.set(push * 2, push * 2, 0)
    dummy.scale.setScalar(1 + push * 0.8)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
})
```
For > ~20k instances move the animation into the vertex shader (onBeforeCompile / CSM) using `gl_InstanceID` or an `InstancedBufferAttribute` — CPU loops become the bottleneck.

## Custom per-instance attribute (GPU-animated)
```js
const offsets = new Float32Array(N).map(() => Math.random())
geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 1))
// vertex: attribute float aOffset; transformed.y += sin(uTime + aOffset * 6.28) * 0.5;
```

## Scatter on a surface
```js
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
const sampler = new MeshSurfaceSampler(surfaceMesh).build()
const p = new THREE.Vector3(), n = new THREE.Vector3()
for (let i = 0; i < N; i++) { sampler.sample(p, n); dummy.position.copy(p); dummy.lookAt(p.clone().add(n)); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix) }
```

## Raycasting instances
`raycaster.intersectObject(mesh)` returns `instanceId` → highlight with `setColorAt(id, ...)`; `mesh.instanceColor.needsUpdate = true`.

## BatchedMesh (different geometries, one draw call; r159+)
```js
const batched = new THREE.BatchedMesh(maxInstances, maxVerts, maxIndices, material)
const gA = batched.addGeometry(boxGeo), gB = batched.addGeometry(sphereGeo)
const id = batched.addInstance(gA); batched.setMatrixAt(id, matrix)
```

## R3F
drei `<Instances limit={1000}><boxGeometry/><meshStandardMaterial/>{items.map(i => <Instance key={i.id} position={i.p} color={i.c}/>)}</Instances>` for convenience, or raw `<instancedMesh args={[geo, mat, N]} ref={ref}/>` for performance.
