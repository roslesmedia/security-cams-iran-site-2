# Project delivery workflow

The user wants routine Git and deployment steps handled automatically, without
having to request each step separately.

- Use this existing checkout; do not create a worktree unless requested.
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
