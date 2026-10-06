---
name: r3f-postprocessing
description: @react-three/postprocessing effects stack for R3F — Bloom, DepthOfField, ChromaticAberration, Noise, Vignette, N8AO, ToneMapping, custom effects driven by scroll velocity. Use to add cinematic finishing to React Three Fiber scenes.
---

# @react-three/postprocessing

Source: https://github.com/pmndrs/react-postprocessing (MIT), wraps pmndrs/postprocessing.

```bash
npm i @react-three/postprocessing postprocessing
```

```tsx
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette, N8AO, ToneMapping, SMAA } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

<Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
  <Scene />
  <EffectComposer multisampling={0} enableNormalPass={false}>
    <N8AO aoRadius={0.5} intensity={2} />                                 {/* ambient occlusion */}
    <Bloom mipmapBlur luminanceThreshold={0.8} intensity={1.2} levels={8} />
    <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={4} />
    <ChromaticAberration ref={caRef} offset={[0.0008, 0.0008]} radialModulation modulationOffset={0.2} />
    <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.4} />
    <Vignette eskil={false} offset={0.2} darkness={0.7} />
    <ToneMapping mode={ToneMappingMode.AGX} />
    <SMAA />
  </EffectComposer>
</Canvas>
```
Glow only specific meshes: give them `toneMapped={false}` + emissive/color values > 1 (e.g. `color={[4, 1, 8]}`) and keep `luminanceThreshold` ~1.

## Drive effects from scroll velocity
```tsx
const caRef = useRef<any>(null!)
const lenis = useLenis()
useFrame(() => {
  const v = Math.min(Math.abs(lenis?.velocity ?? 0) * 0.0004, 0.01)
  caRef.current.offset.set(v, v)
})
```

## Custom effect
```tsx
import { Effect } from 'postprocessing'
import { forwardRef, useMemo } from 'react'
const frag = `uniform float uStrength; void mainUv(inout vec2 uv){ uv.y += sin(uv.x * 20.0 + time) * 0.005 * uStrength; }
              void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){ outputColor = inputColor; }`
class WaveImpl extends Effect { constructor({ strength = 1 } = {}) { super('Wave', frag, { uniforms: new Map([['uStrength', new THREE.Uniform(strength)]]) }) } }
export const Wave = forwardRef(({ strength }: { strength: number }, ref) => { const e = useMemo(() => new WaveImpl({ strength }), [strength]); return <primitive ref={ref} object={e} dispose={null} /> })
```
`time`, `resolution`, `inputBuffer` are provided automatically in effect shaders.

## Perf
Effects merge into one pass but each still costs fill-rate. On low-tier GPUs (`PerformanceMonitor` / `detect-gpu`) render `<EffectComposer enabled={false}>`.
