---
name: motion-react-scroll
description: Motion (formerly Framer Motion) for React/vanilla — useScroll, useTransform, useSpring, whileInView, layout animations, AnimatePresence page transitions. Use in React/Next.js sites for scroll-linked parallax, sticky reveals and spring micro-interactions.
---

# Motion (Framer Motion) scroll animations

Source: https://github.com/motiondivision/motion (MIT). Package: `motion` (import from `motion/react`; legacy `framer-motion` still works).

```bash
npm i motion
```

## Reveal in view
```tsx
import { motion } from 'motion/react'
<motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
```

## Staggered children
```tsx
const parent = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const child = { hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } } }
<motion.h1 variants={parent} initial="hidden" whileInView="show" className="overflow-hidden">
  {words.map((w) => <span key={w} className="inline-block overflow-hidden"><motion.span className="inline-block" variants={child}>{w}&nbsp;</motion.span></span>)}
</motion.h1>
```

## Scroll-linked parallax for a section
```tsx
import { useScroll, useTransform, useSpring, motion } from 'motion/react'
function Parallax({ children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.2])
  return <section ref={ref} className="relative h-screen overflow-hidden"><motion.div style={{ y, scale }}>{children}</motion.div></section>
}
```

## Sticky "zoom into image" story
```tsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
const scale = useTransform(scrollYProgress, [0, 1], [1, 4])
const radius = useTransform(scrollYProgress, [0, 0.6], [32, 0])
return (
  <div ref={ref} className="h-[300vh]">
    <div className="sticky top-0 h-screen grid place-items-center overflow-hidden">
      <motion.img style={{ scale, borderRadius: radius }} src="/hero.jpg" />
    </div>
  </div>
)
```

## Smoothed progress + velocity
```tsx
const { scrollY } = useScroll()
const v = useVelocity(scrollY)
const smooth = useSpring(v, { damping: 50, stiffness: 400 })
const skew = useTransform(smooth, [-3000, 3000], [-8, 8], { clamp: true })
```

## Infinite velocity marquee
`useAnimationFrame((t, delta) => baseX.set(wrap(-20, -45, baseX.get() + dir * speed * delta / 1000)))` with `wrap` exported from `motion` (or your own `((v - min) % r + r) % r + min`).

## Layout & shared element
```tsx
<motion.div layout layoutId={`card-${id}`} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
<AnimatePresence mode="wait">{open && <motion.div key="modal" layoutId={`card-${id}`} exit={{ opacity: 0 }} />}</AnimatePresence>
```

## Vanilla JS
```js
import { animate, scroll, inView, stagger } from 'motion'
inView('.card', (el) => { animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8 }) })
scroll(animate('.bar', { scaleX: [0, 1] }))
```

## Notes
- Works with Lenis (native scroll positions).
- MotionValues don't re-render React — keep per-frame values in them, not useState.
- `useReducedMotion()` to tone down.
