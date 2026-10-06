---
name: r3f-rapier-physics
description: Physics in R3F with @react-three/rapier — falling/colliding objects, pointer-attracted balls, draggable 3D logos, scroll-triggered physics piles. Use for playful interactive heroes (the "bouncing 3D shapes / balls follow cursor" effect).
---

# Physics with @react-three/rapier

Source: https://github.com/pmndrs/react-three-rapier (MIT), Rapier WASM engine.

```bash
npm i @react-three/rapier
```

## Pointer-attracted balls hero (popular agency effect)
```tsx
import { Physics, RigidBody, BallCollider, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vec = new THREE.Vector3()

function Ball({ r = THREE.MathUtils.randFloatSpread, ...props }) {
  const api = useRef<RapierRigidBody>(null!)
  useFrame((_, delta) => {
    delta = Math.min(0.1, delta)
    const p = api.current.translation()
    // pull every ball toward the origin → they clump in the center
    api.current.applyImpulse(vec.set(-p.x, -p.y, -p.z).multiplyScalar(0.2 * delta * 60), true)
  })
  return (
    <RigidBody ref={api} colliders={false} linearDamping={4} angularDamping={1} friction={0.1} position={[r(20), r(20) - 25, r(20) - 10]} {...props}>
      <BallCollider args={[1]} />
      <mesh castShadow><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="#7c5cff" roughness={0.2} /></mesh>
    </RigidBody>
  )
}

function Pointer() {
  const ref = useRef<RapierRigidBody>(null!)
  useFrame(({ pointer, viewport }) => {
    ref.current.setNextKinematicTranslation(vec.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0))
  })
  return <RigidBody type="kinematicPosition" colliders={false} ref={ref}><BallCollider args={[1.5]} /></RigidBody>
}

<Physics gravity={[0, 0, 0]} /* debug */>
  <Pointer />
  {Array.from({ length: 30 }, (_, i) => <Ball key={i} />)}
</Physics>
```

## Falling objects pile up on scroll
```tsx
<Physics gravity={[0, -9.81, 0]} paused={!inView}>
  <CuboidCollider position={[0, -3, 0]} args={[20, 0.5, 20]} />   {/* floor */}
  {letters.map((l, i) => <RigidBody key={i} colliders="hull" position={[i - 3, 6 + i, 0]} restitution={0.4}><Letter char={l} /></RigidBody>)}
</Physics>
```
Toggle `paused` from an IntersectionObserver / ScrollTrigger so physics starts when the section enters view.

## Instanced physics (hundreds of bodies)
`<InstancedRigidBodies instances={[{ key, position, rotation }]} colliders="ball"><instancedMesh args={[geo, mat, N]} /></InstancedRigidBodies>`

## Tips
- Use simple colliders (ball, cuboid, hull) — never `trimesh` for dynamic bodies.
- `colliders={false}` + explicit collider components for control.
- Keep timestep fixed (`timeStep="vary"` only if needed); cap delta to avoid explosions after tab switch.
- Mobile: halve body count; use device orientation as gravity for fun (`setGravity` from `useRapier().world`).
