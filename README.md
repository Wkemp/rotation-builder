# Rotation Builder

Installable PWA for volleyball coaches: build a roster, set your starting
lineup and libero rules, and flip through all six rotations with an animated
court diagram. Includes a printable cheat sheet. Works fully offline once
installed — no login, no server, all data stays on the device in
localStorage.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Hot-reloads as you edit.

## Before you deploy: set your repo name

`vite.config.js` has a `REPO_NAME` constant at the top:

```js
const REPO_NAME = 'rotation-builder'
```

This has to exactly match your GitHub repo name, because GitHub Pages serves
project sites from `https://<username>.github.io/<repo-name>/` — that path
becomes the app's `base`, and the PWA manifest's `start_url`/`scope` are
derived from it. If it's wrong, the service worker will register at the
wrong scope and the app won't install correctly. If you ever move to a
custom domain (serving from the root), change `base` to `'/'` and update
`start_url`/`scope` to `'/'` too.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds and deploys automatically on every push to `main`.

One-time setup on GitHub:
1. Push this project to a new repo named to match `REPO_NAME` above.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` — the workflow builds and deploys. Your app will be live
   at `https://<username>.github.io/<repo-name>/` a minute or two later.

No manual `npm run build` or `gh-pages` branch needed after that; every push
to `main` redeploys.

## Testing the installed/offline experience

`npm run build && npm run preview` serves the production build (with the
real service worker) locally so you can test installability before pushing.
On a phone, visit the deployed URL in Chrome or Safari and use "Add to Home
Screen" — installed PWAs get their own icon and open without browser chrome.

## Data & privacy

Roster, lineup, and settings persist in the browser's localStorage on that
specific device. There's no account and nothing is sent to a server —
which also means data doesn't sync between a coach's phone and tablet, and
clearing browser data wipes it. If multi-device sync ever becomes a real
need, that's a deliberate future addition (e.g. an optional cloud sync), not
something silently missing.

## Extending this

The project is structured so the next features slot in cleanly:
- `src/lib/rotation.js` — all rotation/libero math, framework-agnostic
- `src/components/` — one file per UI piece
- A drills/warmups library or a plays library (both discussed as
  natural next additions) would each be a new top-level `view` alongside
  `court` and `cheatsheet` in `App.jsx`, with their own localStorage key.
