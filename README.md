# دیدبان / DIDBAN
Persian RTL camera storefront built with React, TypeScript, Vite, Three.js and GSAP ScrollTrigger.

## Develop
Node.js 22.12+ or 24. Run `npm ci --cache /tmp/didban-npm-cache`, then `npm run dev`. Build with `npm run build`; production output is `dist/`. Vercel uses the included SPA rewrite for `/products`.

## Included
Procedural articulated camera geometry, scroll-controlled rotation/macro/explosion/reassembly, architectural installation scene, interactive day/night illustration, categories, expandable 50-brand directory, 100 demo camera records, Persian-normalized search, combined filters, 12-card progressive homepage catalog, 24-card paginated route, product details, comparison (up to three), persistent inquiry basket, selection guide, FAQs and local request preparation.

## Editable data and limitations
`src/data.ts` contains product data and `businessConfig`. All 100 records are unbranded conceptual merchandising examples, not verified manufacturer SKUs or inventory. Category imagery is a generic geometric archetype, not exact product photography. Brand directory names do not imply representation or stock. No live payment, contact delivery, camera stream or notification service is connected. Contact fields are labeled placeholders; form success states only report local preparation. BusinessConfig is reserved for supplied real contact information.

The story uses one WebGL renderer; catalog stills are generated from its camera. The installation photograph is generated illustrative artwork, not a real customer location. Reduced motion keeps the hero still. The full reference video motion and real-device GPU performance have not been validated; no videos were supplied.

## Assets
Local Persian font: Vazirmatn by Saber Rastikerdar, SIL Open Font License; license in `public/assets/FONT-LICENSE.txt`. Camera geometry is authored in `src/Camera.tsx`. Installation image generated for this project. No external hotlinks are needed at runtime.

## Verified
Production TypeScript/Vite build. Headless Chromium: 12 initial cards, final catalog page of 4 records, product detail and basket addition, basket persistence after reload, desktop/mobile rendering, no horizontal overflow at 390px and no browser runtime errors in the tested flows.
