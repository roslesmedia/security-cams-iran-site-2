#!/usr/bin/env bash
set -euo pipefail

MARKETPLACE_REPO="roslesmedia/security-cams-iran-site-2"
MARKETPLACE_NAME="kian-codex-web"
PLUGIN_KEY="kian-cinematic-web-system@kian-codex-web"
CODEX_DIR="${HOME}/.codex"
AGENTS_FILE="${CODEX_DIR}/AGENTS.md"
CONFIG_FILE="${CODEX_DIR}/config.toml"

mkdir -p "${CODEX_DIR}"

python3 - "${AGENTS_FILE}" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
begin = "<!-- KIAN_CODEX_SYSTEM_BEGIN -->"
end = "<!-- KIAN_CODEX_SYSTEM_END -->"
block = r'''<!-- KIAN_CODEX_SYSTEM_BEGIN -->
# Kian global Codex operating system

These instructions apply to every Codex project on this machine. Repository-specific AGENTS.md files may add or override project details.

## General behavior

- Inspect the current repository before making structural changes.
- Preserve unrelated user work.
- Prefer production-ready implementation over mock behavior.
- Use installed skills when they materially improve the task.
- Do not load every skill indiscriminately; select relevant skills from their descriptions.
- Never claim a build, test, browser check, deployment, or subagent run happened unless it actually happened.
- When a repository contains more specific AGENTS.md instructions, follow those instructions for that repository.

## Website / frontend tasks

For website, frontend, UI, animation, 3D, WebGL, GSAP, responsive-design, performance, or visual-QA work, use the installed plugin **kian-cinematic-web-system** when available.

For substantial website work, apply these review roles:
1. Creative / Visual Director
2. 3D & Motion Director
3. Frontend / Systems Engineer
4. Performance & Accessibility Engineer
5. Visual QA / Release Reviewer

If the runtime supports real subagents, delegate independent passes where useful. Otherwise perform the roles as explicit sequential review passes. Never pretend subagents ran.

Use the plugin skills selectively. Start major animated-site work with the architecture and orchestration skills, then load only the specialist skills relevant to the feature.

## Non-website projects

Do not force cinematic website rules, Three.js, GSAP, Vercel, or visual-design conventions onto unrelated repositories. The global system should adapt to the project rather than make every project look like a website project.
<!-- KIAN_CODEX_SYSTEM_END -->'''

old = path.read_text() if path.exists() else ""
if begin in old and end in old:
    before = old.split(begin, 1)[0]
    after = old.split(end, 1)[1]
    new = before.rstrip() + ("\n\n" if before.strip() else "") + block + ("\n\n" + after.lstrip() if after.strip() else "\n")
else:
    new = old.rstrip() + ("\n\n" if old.strip() else "") + block + "\n"
path.write_text(new)
print(f"Updated {path}")
PY

if command -v codex >/dev/null 2>&1; then
  codex plugin marketplace add "${MARKETPLACE_REPO}" --ref main || true
  codex plugin marketplace upgrade "${MARKETPLACE_NAME}" || codex plugin marketplace upgrade || true
else
  echo "Codex CLI was not found in PATH; global AGENTS.md was installed, but the plugin marketplace still needs to be added from Codex."
fi

python3 - "${CONFIG_FILE}" "${PLUGIN_KEY}" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
key = sys.argv[2]
header = f'[plugins."{key}"]'
text = path.read_text() if path.exists() else ""
if header not in text:
    if text and not text.endswith("\n"):
        text += "\n"
    if text.strip():
        text += "\n"
    text += header + "\nenabled = true\n"
    path.write_text(text)
    print(f"Enabled {key} in {path}")
else:
    print(f"{key} already has a config section in {path}; leaving existing settings unchanged.")
PY

echo
echo "Kian Codex global system installed."
echo "Open a new Codex session. If you use the ChatGPT desktop app, restart it once so the local marketplace/plugin list refreshes."
