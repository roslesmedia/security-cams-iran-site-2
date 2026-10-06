---
name: threejs-glass-transmission
description: Realistic glass, liquid and refractive materials — MeshPhysicalMaterial transmission/thickness/IOR/dispersion, drei MeshTransmissionMaterial (chromatic aberration, distortion), refractive text and frosted glass UI-in-3D. Use for glassmorphism 3D heroes, crystal logos, and refractive blobs over text.
---

# Glass & transmission materials

Sources: three.js `MeshPhysicalMaterial` (MIT), drei `MeshTransmissionMaterial` (MIT, https://github.com/pmndrs/drei).

## Vanilla three.js physical glass
```js
const glass = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  metalness: 0, roughness: 0.05,
  transmission: 1,            // enable refraction (renders scene behind into a transmission buffer)
  thickness: 1.2,             // volume thickness for refraction strength
  ior: 1.5,                   // glass 1.5, water 1.33, diamond 2.4
  dispersion: 0.3,            // r163+: rainbow chromatic split
  attenuationColor: new THREE.Color('#c9e8ff'), attenuationDistance: 2, // tinted volume
  clearcoat: 1, clearcoatRoughness: 0,
  envMapIntensity: 1.5,
  specularIntensity: 1,
})
```
Requirements: `scene.environment` set (see `threejs-lighting-environment`) and something colorful *behind* the glass (text plane, gradient, objects) — glass over an empty background looks like nothing. Transmission only refracts other opaque objects in the scene, not DOM; to refract website text render it in WebGL (troika `Text` / drei `<Text>`).

## R3F: MeshTransmissionMaterial (best-looking, more control)
```tsx
import { MeshTransmissionMaterial, Text, Environment, Float } from '@react-three/drei'
<Environment preset="city" />
<Text fontSize={1.4} position={[0, 0, -2]} font="/fonts/Inter-Bold.woff">YOUNG GROWTH</Text>
<Float speed={2} rotationIntensity={1}>
  <mesh>
    <torusKnotGeometry args={[0.8, 0.3, 256, 64]} />
    <MeshTransmissionMaterial
      backside backsideThickness={0.3}
      thickness={0.6} roughness={0.02} ior={1.4}
      chromaticAberration={0.6} anisotropicBlur={0.2}
      distortion={0.4} distortionScale={0.4} temporalDistortion={0.15}
      samples={8} resolution={512} transmission={1}
    />
  </mesh>
</Float>
```
Perf: each MTM renders the scene again into an FBO. Use `resolution={256..512}`, `samples={4..8}`, and only 1–2 such meshes. Set `transmissionSampler` to share the default buffer when you have several.

## Frosted glass
`roughness: 0.3–0.6` with transmission gives blurry frosted panels (three.js blurs the transmission mip chain). Add a subtle normal map (`normalScale` 0.1) for etched texture.

## Refractive blob over gradient (popular hero)
Animated noise-displaced icosahedron (`threejs-custom-shaders` CSM with `baseMaterial: MeshPhysicalMaterial`, transmission 1) floating over an animated gradient plane (`animated-gradient-mesh`) — CSM keeps transmission working with custom vertex displacement.

## Fake/cheap glass for mobile
Fresnel rim + matcap + `envMap` reflection with `transparent: true, opacity: 0.3` — no transmission pass.
