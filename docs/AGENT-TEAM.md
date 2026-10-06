# Codex website team

This file defines the standing review team for substantial website work.

## 1. Creative / Visual Director

Own:
- visual concept and hierarchy;
- composition and section rhythm;
- typography and spacing;
- avoidance of generic AI aesthetics;
- consistency of visual language;
- deciding which moments deserve signature motion.

Questions to answer before implementation:
- What is the single strongest visual idea?
- Which section is the primary "wow" moment?
- Which sections should stay quieter so the hero effect feels intentional?
- Does the mobile composition remain art-directed rather than merely stacked?

## 2. 3D & Motion Director

Own:
- Three.js/WebGL architecture;
- GSAP/ScrollTrigger choreography;
- scroll-linked product motion;
- camera/material/lighting transitions;
- parallax, masking, reveals, hover interactions;
- reversible timelines and fast-scroll stability;
- reduced-motion and mobile equivalents.

Prefer:
- one coordinated motion language;
- one renderer where practical;
- transform/opacity/compositor-friendly work;
- scroll progress mapped to deterministic scene state.

Avoid:
- decorative endless spinning;
- multiple fighting scroll systems;
- motion with no narrative purpose;
- desktop-only effects with no mobile adaptation.

## 3. Frontend / Systems Engineer

Own:
- React/TypeScript implementation;
- component and state architecture;
- routing;
- event lifecycle and cleanup;
- responsive behavior;
- keyboard interaction;
- data flow;
- maintainability;
- Vite/Vercel compatibility.

The engineer should preserve the existing stack unless a change is justified by the task.

## 4. Performance & Accessibility Engineer

Own:
- bundle and asset strategy;
- DPR/quality scaling;
- frame-time risks;
- texture/geometry/post-processing budgets;
- lazy loading;
- reduced motion;
- keyboard support;
- semantic fallback content;
- overflow/CLS risks.

The role can veto an effect if it materially harms usability and no reasonable fallback exists.

## 5. Visual QA / Release Reviewer

Review only after implementation.

Check:
- desktop composition;
- mobile composition;
- typography wrapping;
- RTL correctness;
- hover/touch/keyboard states;
- forward and reverse scroll;
- rapid scroll;
- resize/orientation changes;
- drawer/dialog focus behavior;
- reduced motion;
- horizontal overflow;
- broken assets;
- console/runtime errors;
- Vercel route behavior.

The reviewer should produce concrete defects, not vague aesthetic comments. Fix critical and high-impact defects before completion.

## Orchestration

When true subagents are available:
1. Main agent inspects the repo and task.
2. Creative Director and 3D/Motion Director can work in parallel on intent/specification.
3. Frontend Engineer implements.
4. Performance/Accessibility and Visual QA review independently.
5. Main agent integrates fixes and validates the final result.

When subagents are not available, execute the same five roles as sequential passes.

Never claim a role was executed if no meaningful review was actually performed.
