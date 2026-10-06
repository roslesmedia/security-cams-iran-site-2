# Codex project operating system

This repository is a production Vite/React/TypeScript website with Three.js and GSAP.
Codex should treat this file as the always-on coordinator instructions for substantial work in this repo.

## Core objective

Build and maintain premium, production-ready web experiences that feel deliberately art-directed rather than generically AI-generated. Preserve correctness, accessibility, responsiveness, smooth motion, and Vercel deployability while improving visual quality.

For this project specifically:
- Preserve Persian RTL behavior unless the user explicitly asks to change language/direction.
- Preserve the current React + TypeScript + Vite architecture unless a requested feature materially justifies a change.
- Reuse the existing single-renderer 3D approach when practical.
- Keep `/products` SPA routing working on Vercel.
- Keep all user-facing claims grounded; do not invent inventory, partnerships, addresses, contact data, reviews, or verified product specifications.

## Skill system — mandatory discovery

This repo contains a local Codex skill library under `skills/`.
The portable plugin manifest at `plugin.json` exposes the same skill set in runtimes that support plugin discovery.

For any substantial frontend, motion, WebGL, 3D, interaction, performance, or deployment task:

1. Read `skills/README.md`.
2. Read `skills/award-site-architecture/SKILL.md`.
3. Read `skills/website-agent-orchestration/SKILL.md`.
4. Select the specific `skills/*/SKILL.md` files relevant to the requested feature.
5. Use those skills as implementation guidance.
6. Do not load every skill into context blindly; use the catalog to select only what is relevant.
7. Do not ignore a relevant skill just because the task could technically be completed without it.
8. When a skill conflicts with the actual project stack, browser support, user request, licensing, or a more specific instruction, adapt it rather than forcing it.

If plugin auto-discovery is unavailable, directly read the local `SKILL.md` files. The files are still authoritative project guidance.

## Website team

For substantial website work, use the workflow in `docs/AGENT-TEAM.md`.

Required roles:
- Creative / Visual Director
- 3D & Motion Director
- Frontend / Systems Engineer
- Performance & Accessibility Engineer
- Visual QA / Release Reviewer

If the current Codex runtime supports true subagents, delegate independent workstreams to them and synthesize the results.
If it does not, perform the same roles as explicit sequential review passes.
Never claim that a subagent was spawned unless the runtime actually did so.

## Standard delivery loop

For non-trivial visual or feature work:

1. Inspect the existing implementation before editing.
2. Identify the relevant skills and constraints.
3. Define the intended visual/motion behavior before coding.
4. Implement with the smallest architecture change that cleanly supports the request.
5. Run the build and appropriate functional checks.
6. Run a performance/accessibility review.
7. Run a visual QA pass on desktop and mobile behavior.
8. Fix issues found by review.
9. Only then treat the task as complete.

A first working implementation is not a finished implementation.

## Design rules

- Avoid generic "AI website" patterns: random gradients, excessive glass cards, meaningless badges, boilerplate copy, repetitive identical section layouts, decorative icons with no purpose, and stock-looking visual filler.
- Prefer strong typography, deliberate spacing, compositional variety, real hierarchy, purposeful imagery, and a small number of signature interactions.
- Animation must support story, hierarchy, or product understanding.
- Prefer transform/opacity and GPU-friendly animation paths.
- Use masks, clipping, parallax, spatial transitions, camera movement, lighting/material changes, or object decomposition only where they improve the experience.
- Do not add expensive effects simply to increase the amount of animation.

## 3D / motion rules

- Keep one coherent motion language across the page.
- Scroll-linked 3D should be reversible and stable when users scroll quickly backward/forward.
- Avoid multiple independent render loops when one loop can coordinate work.
- Keep expensive effects lazy-loaded and quality-scaled.
- Preserve useful mobile motion rather than deleting the experience entirely.
- Respect `prefers-reduced-motion`.
- Avoid pointer-only interactions without touch/keyboard equivalents.
- Clean up GSAP timelines, ScrollTriggers, observers, event listeners, WebGL resources, and route-specific state when they are no longer needed.

## Performance budget

Treat these as targets, not excuses to hide functionality:
- Keep the HTML/DOM hero meaningful before WebGL finishes loading.
- Lazy-load large 3D scenes and non-critical media.
- Minimize layout thrashing and avoid animating expensive layout properties.
- Cap device pixel ratio where appropriate.
- Reduce post-processing, particle counts, texture sizes, and geometry complexity on weaker devices.
- Prevent horizontal overflow and large CLS.
- Prefer compressed/optimized local assets over runtime hotlinks.

## Accessibility

- Keep semantic HTML under visual effects.
- Maintain visible keyboard focus.
- Ensure dialogs/drawers are keyboard-operable and restore focus.
- Keep readable contrast over animated imagery.
- Respect reduced motion.
- Do not make critical text available only inside canvas/WebGL.

## Project delivery workflow

The user wants routine Git and deployment steps handled automatically, without
having to request each step separately.

- Use the existing checkout; do not create a worktree unless requested.
- After implementing a requested change, run `npm run build` and appropriate
  functional checks. Keep dependencies locked and include required local assets.
- Inspect and preserve unrelated user changes. Commit the completed project
  changes and push them to the intended deployment branch; this project deploys
  from `main`. Check the current remote before pushing, and never force-push or
  overwrite unrelated remote work.
- Maintain explicit Vercel configuration: Vite, `npm ci`, `npm run build`, and
  `dist` output, with SPA routing for `/products`.
- Treat deployment as part of delivery: check the deployment of the pushed
  commit and verify the public homepage, assets, and `/products` route when
  hosting access is available. Do not call a local build or a successful push
  proof of a live deployment.
- If deployment access, credentials, or project permissions are unavailable,
  finish all independent steps and report the precise blocker. Never invent a
  deployment URL or success status, and never request secret values in chat.
- Provide the verified public URL when available, the delivered commit, and any
  concrete remaining blocker. Routine authorized steps do not need repeated
  confirmation.

Current intended production URL:
`https://security-cams-iran-site-2-ochre.vercel.app/`
Verify it before calling it live.

## Completion report

For substantial work, report:
- relevant skills used;
- major implementation decisions;
- validation performed;
- build/test result;
- deployment result or exact blocker.

Do not fabricate test, build, browser, or deployment success.
