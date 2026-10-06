---
name: image-sequence-scroll-scrub
description: Apple-style scroll-scrubbed image sequences and videos on canvas (AirPods/iPhone product page effect) with preloading, devicePixelRatio handling and GSAP ScrollTrigger. Use when a 3D product render/turntable must play frame-by-frame as the user scrolls.
---

# Scroll-scrubbed image sequence (Apple product page effect)

Pattern popularised by apple.com and reproduced in GSAP's official demos.

## Asset prep
- Render/export 100–200 frames (Blender / C4D / video → `ffmpeg -i in.mp4 -vf "fps=30,scale=1920:-1" frames/%04d.webp`).
- WebP/AVIF at ~80 quality; serve a half-res set on mobile.
- Name sequentially: `0001.webp`…

## Implementation
```html
<section class="seq"><canvas id="seq"></canvas></section>
```
```css
.seq { height: 400vh; }
#seq { position: sticky; top: 0; width: 100vw; height: 100vh; display:block; }
```
```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const canvas = document.getElementById('seq')
const ctx = canvas.getContext('2d')
const FRAMES = 160
const src = (i) => `/frames/${String(i + 1).padStart(4, '0')}.webp`
const images = []
const seq = { frame: 0 }

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr
  render()
}
function render() {
  const img = images[seq.frame]
  if (!img?.complete) return
  // object-fit: cover
  const s = Math.max(canvas.width / img.width, canvas.height / img.height)
  const w = img.width * s, h = img.height * s
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
}

// Preload: first frame eagerly, rest in background; decode() avoids jank
for (let i = 0; i < FRAMES; i++) {
  const img = new Image(); img.src = src(i); images.push(img)
  if (i === 0) img.onload = resize
  else img.decode?.().catch(() => {})
}

gsap.to(seq, {
  frame: FRAMES - 1, snap: 'frame', ease: 'none',
  scrollTrigger: { trigger: '.seq', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
  onUpdate: render,
})
addEventListener('resize', resize)
```

## Overlay copy that fades in at specific frames
```js
const tl = gsap.timeline({ scrollTrigger: { trigger: '.seq', start: 'top top', end: 'bottom bottom', scrub: true } })
tl.to('.copy-1', { autoAlpha: 1 }, 0.1).to('.copy-1', { autoAlpha: 0 }, 0.3).to('.copy-2', { autoAlpha: 1 }, 0.4)
```

## Video alternative (smaller payload, needs all-keyframe encode)
```bash
ffmpeg -i in.mp4 -c:v libx264 -g 1 -crf 22 -movflags faststart -an scrub.mp4   # -g 1 = every frame a keyframe
```
```js
video.pause()
ScrollTrigger.create({ trigger: '.seq', start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: (s) => { if (video.duration) video.currentTime = s.progress * video.duration } })
```
Seeking is smooth on Chrome with all-keyframe files; Safari prefers the image approach.

## Performance
- Use `createImageBitmap` in a worker for very large sequences.
- Show a preloader with % from loaded frame count (see `preloader-intro-sequence`).
- Real 3D (`threejs-scroll-camera-path`) is often lighter than 200 4K frames — consider it.
