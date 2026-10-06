---
name: website-agent-orchestration
description: Coordinate a premium website build through Creative/Visual, 3D/Motion, Frontend/Systems, Performance/Accessibility, and Visual QA roles. Use for substantial website builds, redesigns, 3D interactions, animation-heavy pages, major responsive changes, or release preparation.
---

# Website agent orchestration

Use this skill for substantial website work.

## Step 1 — Inspect
Read the existing implementation before proposing architecture changes.
Identify:
- framework and build system;
- current motion/3D libraries;
- routing and deployment constraints;
- existing visual language;
- responsive and accessibility behavior.

## Step 2 — Select relevant skills
Read `../README.md` and `../award-site-architecture/SKILL.md`, then open only the specialist skills needed for the task.

## Step 3 — Creative / Visual pass
Define:
- visual hierarchy;
- typography/spacing direction;
- section rhythm;
- signature visual moment;
- which areas stay restrained;
- mobile composition.

## Step 4 — 3D / Motion pass
Define:
- scroll mapping;
- camera/object/material choreography;
- GSAP/ScrollTrigger structure;
- interaction states;
- mobile and reduced-motion behavior;
- resource cleanup.

## Step 5 — Frontend implementation
Implement the smallest clean architecture that supports the intent.
Preserve existing stack and working behavior unless change is justified.

## Step 6 — Performance / accessibility pass
Check:
- heavy assets;
- render loops;
- DPR;
- post-processing;
- unnecessary re-renders;
- layout thrashing;
- lazy loading;
- reduced motion;
- keyboard behavior;
- semantic fallbacks;
- contrast.

## Step 7 — Visual QA
Review desktop and mobile.
Test forward/reverse/rapid scroll, resize, touch, keyboard, drawers/dialogs, overflow, asset loading and route changes.

## Step 8 — Fix and validate
Fix meaningful defects found by the review passes.
Run the project build and appropriate functional checks.

If true subagents are available, delegate independent passes. If not, execute them sequentially.
Do not claim subagents were used when they were not.
