# Animated 3D site skills (50)

Claude Code skills for building premium animated / 3D / scroll-heavy marketing sites. Each folder has a `SKILL.md` that Claude loads automatically when the task matches. Start with **award-site-architecture**: it maps each page section to the skills below.

Code is drawn from the official repos and docs of each library (links and licenses are in each skill). Two skills include third-party source files verbatim:
- `glsl-noise-library/resources/`: Ashima Arts webgl-noise (MIT)
- `webgl-fluid-simulation/resources/`: PavelDoGreat/WebGL-Fluid-Simulation (MIT), plus an adapted website build

| Area | Skills |
|---|---|
| Plan | award-site-architecture |
| Smooth scroll | lenis-smooth-scroll, locomotive-scroll |
| GSAP | gsap-core-timelines, gsap-scrolltrigger, gsap-scrolltrigger-pinning-horizontal, gsap-splittext-text-reveals, gsap-flip-layout-transitions, gsap-observer-fullpage-slides |
| Other scroll animation | css-scroll-driven-animations, motion-react-scroll, image-sequence-scroll-scrub, parallax-depth-layers, infinite-marquee-velocity |
| Page flow | page-transitions-barba, view-transitions-api, preloader-intro-sequence |
| three.js | threejs-scene-setup, threejs-gltf-asset-pipeline, threejs-scroll-camera-path, threejs-custom-shaders, glsl-noise-library, threejs-postprocessing, threejs-gpgpu-particles, threejs-instancing, threejs-particle-morphing, threejs-lighting-environment, threejs-glass-transmission, threejs-performance-optimization, threejs-tsl-webgpu |
| React Three Fiber | r3f-fundamentals, drei-scroll-controls, drei-essentials, r3f-postprocessing, r3f-rapier-physics, r3f-dom-sync-views |
| Live backgrounds | webgl-fluid-simulation, animated-gradient-mesh, shader-backgrounds-raymarching, vanta-backgrounds, tsparticles-backgrounds, interactive-globe, noise-grain-overlay |
| Image / gallery WebGL | webgl-image-hover-distortion, webgl-infinite-gallery, ogl-lightweight-webgl |
| Interaction & tools | custom-cursor-and-trails, spline-3d-embeds, lottie-rive-animations, theatre-js-sequencing |

License notes: GSAP (all plugins, including SplitText) is free under GreenSock's standard license, not MIT. Theatre.js Studio is AGPL, so use it in development only. Shadertoy code defaults to CC BY-NC-SA and LYGIA needs a sponsorship for commercial use, so check both before copying.
