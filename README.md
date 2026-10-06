# دیدبان / DIDBAN

A rebuilt Persian RTL storefront with an articulated, scroll-driven camera story.
React 19, TypeScript, Vite, Three.js and GSAP ScrollTrigger; local Estedad typography.

## Development

Use Node.js 22.12+ or Node 24. Each cloud task already has an isolated checkout;
use it directly rather than creating a worktree.

```sh
npm ci --cache /tmp/didban-npm-cache
npm run dev -- --port 5173 --strictPort
```

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Vercel configuration declares Vite, `npm ci`, `npm run build`, `dist`, and the
SPA rewrite for direct `/products` requests. No backend or credentials are required
for this local development workflow.

## Experience

The shared story progresses through an ivory hero, optical macro, seven articulated
mesh groups, exact reassembly, ceiling mounting, a day/dusk wipe, a sample entrance
event and phone notification, and an ivory transition into the shop. Native scroll
controls the scene in both directions; it does not autoplay or force scroll snapping.
Desktop and phone tracks are 700svh and 480svh. Reduced motion presents all seven
chapters in normal flow with composed still illustrations.

The store has six featured camera forms and an equipment index, 50 directory brands,
100 populated demo camera concepts, 12-card progressive homepage browsing and a
24-per-page `/products` catalog. Search normalizes Persian/Arabic letters and digits.
Filters, sort and pagination are shareable in the catalog URL and restore on Back.
Details have two corresponding geometry views, related concepts and a keyboard/touch
3D viewer. Comparison supports up to three concepts. The inquiry basket supports
quantity, removal and local persistence. The selection guide considers space, light,
network and power constraints. Eight FAQs and a full contact/footer close the page.

The story renders on demand and pauses when hidden, offscreen or during product-viewer
interaction. Camera DPR is capped at 1.5 desktop and 1.25 phone. The catalog uses
local stills, never a renderer per card. WebGL failure/context loss retains a poster.

## Editable data and truthful limitations

`src/data.ts` owns product, brand and business configuration. All 100 records are
explicitly **unbranded DEMO installation concepts**, not verified manufacturer SKUs,
stock or technical specifications. Ten generic geometry archetypes have distinct
finish/pose illustrations; multiple concepts can share an archetype. The directory
is separate from inventory: selecting a directory brand correctly produces an empty
state rather than fabricated products. Unknown prices remain inquiry-only.

Contact fields are labeled placeholders until real business facts are supplied in
`businessConfig`. The form validates inputs, prepares a local summary and offers a
text download. It does not send a message, charge payment or claim an order succeeded.
No live camera, app, payment, monitoring or notification service is connected.

The supplied image guided layout; it is not embedded as the webpage. No reference
motion recordings were attached, so timing follows the written brief. Installation
imagery is illustrative, not a customer photograph. See [asset provenance](docs/ASSETS.md).

## Implementation map

- `StoryStage.tsx`, `StoryTimeline.ts`: shared scene, DOM chapters and reversible progress.
- `CameraModel.ts`: articulated demonstrator housing, optics, infrared ring, sensor and mount.
- `CatalogModel.ts`, `Product3DViewer.tsx`: corresponding generic category geometry and viewer.
- `ProductCard.tsx`, `FAQ.tsx`: catalog cards and accessible disclosures.
- `main.tsx`: routes, filters, drawers, basket, selection guide and contact flow.
- `style.css`, `story.css`: warm reference palette, responsive RTL layout and motion fallbacks.

## Validation performed

Production TypeScript/Vite build passes. Chromium checks passed for 50 unique brands,
100 unique records, 12 initial homepage cards, catalog pages 24/24/24/24/4, search for
record 100, combined filters/back navigation, drawer focus/Escape, basket quantity and
persistence/removal, three-product comparison, local inquiry validation, reduced-motion
semantics and forced WebGL/context-loss fallbacks. Tested widths: 360, 390, 430, 768
and 1440px, without horizontal overflow or runtime errors in those flows.

Story screenshots were reviewed at 0%, 15%, 32%, 50%, 68%, 88% and 100% on desktop
and phone-size Chromium. Software-rendered Chromium is not a real-device GPU benchmark.
Safari, Firefox and real-phone frame rates remain untested. A local build does not
establish a successful public deployment.
