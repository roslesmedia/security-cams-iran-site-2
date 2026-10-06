# Codex system in this repository

This repo is configured so the operating rules do not depend on an old chat.

## Always-on layer
`AGENTS.md` is the master coordinator. Codex CLI/app automatically reads repository AGENTS instructions. It tells Codex how to select and apply the local skills, how to run the website-team review loop, and how to preserve the existing deployment workflow.

## Skill layer
`skills/` contains the reusable website skill library. The 50 animated/3D skills originally stored in the YGA repository are mirrored here in Codex-friendly paths. `plugin.json` packages the folder as a portable Agent Plugin for runtimes that support plugin discovery.

The system deliberately lazy-loads relevant skills rather than injecting all skill instructions into every task.

## Team layer
`docs/AGENT-TEAM.md` defines five roles:
Creative/Visual, 3D/Motion, Frontend/Systems, Performance/Accessibility, and Visual QA/Release.

If real subagents are supported in the active Codex runtime, tasks can be delegated. If they are not, Codex performs the same roles as sequential review passes.

## Verification prompt
A useful first instruction in Codex is:

"Read AGENTS.md, skills/README.md, skills/award-site-architecture/SKILL.md and skills/website-agent-orchestration/SKILL.md. Report the relevant skills you would use for this task, then proceed."

You should not need to repeat the whole design system again.
