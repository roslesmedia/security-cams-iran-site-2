---
name: theatre-js-sequencing
description: Theatre.js visual timeline editor for keyframing three.js/R3F scenes and DOM — author camera moves and object animations visually, export state JSON, then scrub the sequence with scroll in production. Use for cinematic, hand-tuned 3D sequences that are painful to code by hand.
---

# Theatre.js — visual keyframing for web 3D

Source: https://github.com/theatre-js/theatre. License: `@theatre/core` Apache-2.0 (ship in production); `@theatre/studio` (editor UI) AGPL-3.0 — use it **only in development**, never bundle it into the production site.

```bash
npm i @theatre/core @theatre/studio @theatre/r3f
```

## R3F
```tsx
import { getProject, val } from '@theatre/core'
import { SheetProvider, editable as e, PerspectiveCamera } from '@theatre/r3f'
import projectState from './state.json'      // exported from Studio

if (process.env.NODE_ENV === 'development') {
  const studio = (await import('@theatre/studio')).default
  const extension = (await import('@theatre/r3f/dist/extension')).default
  studio.extend(extension); studio.initialize()
}

const sheet = getProject('Site', { state: projectState }).sheet('Hero')

export function Scene() {
  return (
    <SheetProvider sheet={sheet}>
      <PerspectiveCamera theatreKey="Camera" makeDefault position={[0, 0, 8]} fov={35} />
      <e.mesh theatreKey="Orb"><icosahedronGeometry args={[1, 32]} /><meshStandardMaterial color="#7c5cff" /></e.mesh>
      <e.pointLight theatreKey="Key" position={[3, 3, 3]} />
      <ScrollDriver />
    </SheetProvider>
  )
}

// Scrub the sequence with scroll (drei ScrollControls or Lenis)
function ScrollDriver() {
  const scroll = useScroll()
  useFrame(() => {
    const length = val(sheet.sequence.pointer.length)
    sheet.sequence.position = scroll.offset * length
  })
  return null
}
```

## Vanilla three.js / DOM
```js
import { getProject, types } from '@theatre/core'
const sheet = getProject('Site', { state }).sheet('Intro')
const obj = sheet.object('Box', { position: { x: 0, y: 0, z: 0 }, opacity: types.number(1, { range: [0, 1] }), color: types.rgba() })
obj.onValuesChange((v) => { mesh.position.set(v.position.x, v.position.y, v.position.z); el.style.opacity = v.opacity })
// play: sheet.sequence.play({ iterationCount: 1, range: [0, 3] })
// scroll: ScrollTrigger.create({ scrub: true, onUpdate: (s) => (sheet.sequence.position = s.progress * val(sheet.sequence.pointer.length)) })
```

## Workflow
1. Run dev with Studio, keyframe camera/objects in the timeline (Shift+drag for sequence editing).
2. Studio → Project → Export → `state.json`, commit it.
3. Production loads `getProject(name, { state })` with no Studio import.
4. Ease scroll: lerp a `current` value toward scroll progress before setting `sequence.position` for cinematic smoothness.
