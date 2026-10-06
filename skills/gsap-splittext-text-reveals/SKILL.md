---
name: gsap-splittext-text-reveals
description: Split text into lines/words/chars and animate them (masked line reveals, char staggers, scroll-scrubbed word highlighting, scramble) using GSAP SplitText (free since 3.13) or SplitType. Use for any kinetic typography / headline reveal.
---

# Text splitting & reveals

Sources: GSAP SplitText (greensock/GSAP, free license), SplitType https://github.com/lukePeavey/SplitType (MIT) as a no-GSAP alternative.

## GSAP SplitText (preferred; v3.13+ has masking, autoSplit, a11y)
```js
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(SplitText, ScrollTrigger)

document.fonts.ready.then(() => {
  SplitText.create('.headline', {
    type: 'lines, words',
    mask: 'lines',        // wraps each line in overflow:clip — the classic "slide up from mask"
    autoSplit: true,      // re-splits on resize/font load
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: self.elements[0], start: 'top 85%' },
      }) // returning the tween lets autoSplit revert/re-create it
    },
  })
})
```

## Char cascade with rotation
```js
const s = SplitText.create('.title', { type: 'chars' })
gsap.from(s.chars, { yPercent: 120, rotate: 12, autoAlpha: 0, stagger: { each: 0.025, from: 'start' }, ease: 'back.out(1.6)', duration: 0.9 })
```

## Scroll-scrubbed word highlight ("reading" paragraph)
```js
const s = SplitText.create('.manifesto', { type: 'words' })
gsap.fromTo(s.words, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: 'none',
  scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 40%', scrub: true } })
```

## Scramble/decode effect
```js
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
gsap.registerPlugin(ScrambleTextPlugin)
gsap.to('.code', { duration: 1.5, scrambleText: { text: 'YOUNG GROWTH', chars: '01!<>-_\\/[]{}—=+*^?#', speed: 0.4 } })
```

## Hover roll (duplicate text slides up)
```css
.roll { display:inline-block; overflow:hidden; line-height:1.1 }
.roll span { display:block; transition: transform .5s cubic-bezier(.7,0,.2,1) }
.roll span::after { content: attr(data-text); display:block }
.roll:hover span { transform: translateY(-100%) }
```

## SplitType alternative
```js
import SplitType from 'split-type'
const t = new SplitType('.headline', { types: 'lines,words,chars' })
gsap.from(t.chars, { y: '100%', stagger: 0.02 })
// re-split on resize: t.split()
```
Add `.line { overflow: hidden }` (or wrap lines) for masking.

## Gotchas
- Always split after `document.fonts.ready` or lines break wrong.
- Split text is noisy for screen readers; SplitText adds `aria-label` automatically (`aria: 'auto'`). Keep it.
- `revert()` on cleanup / in `useGSAP`.
- Don't split huge paragraphs into chars (thousands of nodes); use words.
