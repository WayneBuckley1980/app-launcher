# App Launcher

An **App Growth Platform** for indie developers. Add **any** app, generate marketing posts, tracked links, and landing pages — **from a web dashboard**, no terminal required for day-to-day marketing.

**This repo is separate from your app codebases.** DogSafe is one registered example. App Launcher does not modify shipped apps.

See [docs/BOUNDARIES.md](docs/BOUNDARIES.md) for rules about live apps.

## Use the web dashboard (recommended)

**Online (after deploy):**  
https://waynebuckley1980.github.io/app-launcher/app-launcher/

**On your Mac:**
```bash
cd ~/Projects/AppLauncher
npm run dev
```
Open **http://localhost:3456/dashboard/**

### What you do in the browser

1. **Select an app** (e.g. DogSafe) or click **+ New app**
2. Fill in **App details** — problem, audience, features, store URLs
3. Click **Generate posts & links**
4. Open the **Posts** tab → pick Reddit, Instagram, Facebook… → **Copy post**
5. Paste into that platform and publish

Apps save in your browser automatically. Use **Download JSON** to back up or add to `apps/` in the repo.

## Architecture (vision)

```
Admin Dashboard (web)  →  App registry  →  Any app you build
                       →  Generated posts, links, landing pages
```

CLI tools remain for developers who want automation — the dashboard uses the same engine.

## Docs

| Doc | Description |
|---|---|
| [BOUNDARIES.md](docs/BOUNDARIES.md) | Live apps — do not harm paying users |
| [DEPLOY.md](docs/DEPLOY.md) | GitHub Pages deploy |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design |
| [ROADMAP.md](docs/ROADMAP.md) | Build plan |

## CLI (optional)

| Command | Description |
|---|---|
| `npm run dev` | Local web dashboard |
| `npm run deploy` | Push landing pages + dashboard to GitHub |
| `npm run add-app` | Register app via terminal |
| `npm run generate-content -- --app <slug>` | Export posts to files |

## App registry

| App | Status |
|---|---|
| DogSafe | Live (iOS) — [apps/dogsafe.json](apps/dogsafe.json) |

Add apps in the dashboard or `npm run add-app`.
