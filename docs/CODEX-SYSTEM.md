# Codex system in this repository

This repository is the master source for the **Kian Cinematic Web System**.

## What is automatic

### In this repository
- `AGENTS.md` supplies project-specific operating rules.
- `.agents/plugins/marketplace.json` exposes the plugin locally.
- `.codex/config.toml` enables the plugin for trusted Codex clients.
- `plugin.json` is the portable Agent Plugin manifest.
- `.codex-plugin/plugin.json` is the Codex compatibility manifest.
- `skills/` contains the reusable website skill library.

### Across every Codex project on one machine
Run `scripts/install-global-codex-system.sh` once on that machine. It:
1. adds/updates the Kian block in `~/.codex/AGENTS.md`;
2. adds this GitHub repo as a Codex plugin marketplace;
3. enables `kian-cinematic-web-system@kian-codex-web` in the user Codex config.

Codex automatically enumerates global `~/.codex/AGENTS.md` before repository-specific AGENTS instructions. The global rules are intentionally adaptive: website tasks use the cinematic web plugin and specialist workflow, while unrelated repositories do not get forced into website-specific behavior.

## New GitHub repository bootstrap

`bootstrap/` contains the lightweight files that can be copied into a newly created repository:
- `AGENTS.md`
- `.agents/plugins/marketplace.json` pointing back to this master repo
- `.codex/config.toml` enabling the plugin

This means new repos do not need their own duplicated copy of the 50+ skill folders.

## Website team

For substantial website tasks the system uses these review roles:
1. Creative / Visual Director
2. 3D & Motion Director
3. Frontend / Systems Engineer
4. Performance & Accessibility Engineer
5. Visual QA / Release Reviewer

When real subagents are supported they can be delegated independently. Otherwise Codex performs the same roles as sequential passes; it must not pretend subagents were used.

## Skill loading

The system deliberately does **not** inject every skill into every task. Skill descriptions are used to select the relevant workflows, and the full `SKILL.md` is loaded only when useful. Major animated-site work should start with:
- `skills/award-site-architecture/SKILL.md`
- `skills/website-agent-orchestration/SKILL.md`

then load the specialist Three.js, GSAP, WebGL, interaction, performance or responsive skills needed for the feature.

## Version

See `.kian-codex-system-version`.
