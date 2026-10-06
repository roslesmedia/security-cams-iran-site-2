---
name: drei-essentials
description: The drei helpers premium R3F sites rely on — Environment/Lightformer, Float, Text/Text3D, MeshDistortMaterial/Wobble, ContactShadows/AccumulativeShadows, Sparkles/Stars/Cloud, PresentationControls, Center/Bounds, useTexture, Html, Trail, MeshReflectorMaterial. Use to assemble polished 3D scenes fast.
---

# drei essentials cookbook

Source: https://github.com/pmndrs/drei (MIT). Docs: https://drei.docs.pmnd.rs

## Studio-lit product hero
```tsx
import { Environment, Lightformer, ContactShadows, Float, PresentationControls, Center, useGLTF } from '@react-three/drei'

<PresentationControls global polar={[-0.2, 0.3]} azimuth={[-0.6, 0.6]} snap>   {/* drag to rotate, springs back */}
  <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
    <Center><Model /></Center>
  </Float>
</PresentationControls>
<ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
<Environment resolution={256}>
  {/* custom softbox studio, no HDR download */}
  <Lightformer form="rect" intensity={4} position={[0, 5, -5]} scale={[10, 2, 1]} />
  <Lightformer form="ring" color="#7c5cff" intensity={8} position={[-5, 1, 2]} scale={2} onUpdate={(s) => s.lookAt(0, 0, 0)} />
  <Lightformer form="rect" intensity={2} position={[5, 1, 1]} scale={[2, 5, 1]} />
</Environment>
```
Presets: `<Environment preset="city|studio|sunset|dawn|night|warehouse|forest|apartment|lobby|park" />` (fetched from CDN — self-host `files="/hdr/x.hdr"` for production).

## Living materials
```tsx
<MeshDistortMaterial color="#ff6ad5" distort={0.45} speed={2} roughness={0.1} />   // wobbly blob
<MeshWobbleMaterial factor={0.6} speed={1} />
<MeshReflectorMaterial blur={[300, 100]} resolution={1024} mixBlur={1} mixStrength={40} roughness={1} depthScale={1.2} color="#101010" metalness={0.5} mirror={0} /> // glossy floor
```

## Text
```tsx
<Text font="/fonts/Satoshi-Bold.woff" fontSize={1} letterSpacing={-0.04} anchorX="center">HELLO</Text>     // SDF, crisp, cheap
<Text3D font="/fonts/inter_bold.json" size={1} height={0.3} bevelEnabled bevelSize={0.02} curveSegments={8}>3D<meshNormalMaterial /></Text3D>
```
Convert fonts for Text3D with facetype.js (typeface JSON).

## Atmosphere / backgrounds
```tsx
<Stars radius={80} depth={50} count={4000} factor={4} fade speed={1} />
<Sparkles count={80} scale={6} size={3} speed={0.4} color="#fff" />
<Clouds material={THREE.MeshBasicMaterial}><Cloud segments={40} bounds={[10, 2, 2]} volume={10} color="#f0e6ff" /></Clouds>
<color attach="background" args={['#0b0b10']} /><fog attach="fog" args={['#0b0b10', 8, 20]} />
```

## DOM inside 3D
```tsx
<Html transform occlude distanceFactor={1.5} position={[0, 1, 0]}><div className="label">Feature</div></Html>
```

## Helpers
`useTexture(['/a.jpg', '/b.jpg'])`, `useVideoTexture('/loop.mp4')`, `<Bounds fit clip observe margin={1.2}>` auto-frame, `<Trail width={2} length={6} color="hotpink">` motion trails, `<Outlines thickness={0.02} />`, `useCursor`, `<Preload all />`, `<BakeShadows />`, `<AdaptiveDpr />`, `useProgress` for loaders, `<CameraControls />` for animated camera moves (`controls.setLookAt(..., true)`).
