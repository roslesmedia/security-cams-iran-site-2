---
name: lottie-rive-animations
description: Vector motion graphics with Lottie (lottie-web, dotLottie) and Rive (state machines, interactive) — scroll-scrubbed Lottie with ScrollTrigger, hover/click state machines, React integration, file optimization. Use for animated icons, illustrations, interactive characters and scroll-synced vector storytelling.
---

# Lottie & Rive

Sources: https://github.com/airbnb/lottie-web (MIT), https://github.com/LottieFiles/dotlottie-web (MIT), https://github.com/rive-app/rive-react (MIT).

## Lottie — scroll-scrubbed
```js
import lottie from 'lottie-web/build/player/lottie_light'   // light build: svg renderer, no expressions
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const anim = lottie.loadAnimation({ container: document.querySelector('#lottie'), renderer: 'svg', loop: false, autoplay: false, path: '/lottie/story.json' })
anim.addEventListener('DOMLoaded', () => {
  const playhead = { frame: 0 }
  gsap.to(playhead, {
    frame: anim.totalFrames - 1, ease: 'none',
    onUpdate: () => anim.goToAndStop(playhead.frame, true),
    scrollTrigger: { trigger: '#lottie-section', start: 'top top', end: '+=2000', pin: true, scrub: 1 },
  })
})
```
Hover play/reverse for icons: `el.onmouseenter = () => { anim.setDirection(1); anim.play() }; el.onmouseleave = () => { anim.setDirection(-1); anim.play() }`.

## dotLottie (smaller .lottie files, WASM renderer, canvas)
```tsx
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
<DotLottieReact src="/anim.lottie" loop autoplay />
// scroll control: dotLottieRefCallback={(d) => (ref.current = d)} then ref.current.setFrame(progress * ref.current.totalFrames)
```

## Rive — interactive state machines (better than Lottie for interactivity)
```tsx
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

export function Mascot() {
  const { rive, RiveComponent } = useRive({ src: '/rive/mascot.riv', stateMachines: 'State Machine 1', autoplay: true })
  const hover = useStateMachineInput(rive, 'State Machine 1', 'isHover')        // boolean input
  const progress = useStateMachineInput(rive, 'State Machine 1', 'scroll')      // number input
  // drive from Lenis: useLenis(({ progress: p }) => progress && (progress.value = p * 100))
  return <RiveComponent className="w-[400px] h-[400px]" onMouseEnter={() => hover && (hover.value = true)} onMouseLeave={() => hover && (hover.value = false)} />
}
```
Rive files are tiny (often < 50KB), render on canvas/WebGL2 at 60fps, and support pointer-following (listeners in the editor). Use `@rive-app/react-webgl2` for heavy scenes.

## Choosing
| Need | Pick |
|---|---|
| After Effects exports from designers | Lottie (Bodymovin) / dotLottie |
| Interactive states, cursor-following, game-like | Rive |
| Scroll-scrub illustrations | Either (Lottie simplest) |
| Huge illustration with many layers | dotLottie (canvas) or Rive — SVG Lottie gets slow |

## Optimize
LottieFiles optimizer or `lottie-compress`; avoid raster images inside JSON; precompose sparingly; `renderer: 'canvas'` for many simultaneous animations.
