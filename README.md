# App Launcher

An **App Growth Platform** for indie developers. Add **any** app, answer a few questions, and get AI-generated marketing assets, launch checklists, and (eventually) campaign analytics.

**This repo is separate from your app codebases.** DogSafe is registered as one example (`apps/dogsafe.json`). It is live on iOS — App Launcher does not modify what paying customers already have.

See [docs/BOUNDARIES.md](docs/BOUNDARIES.md) for rules about live apps.

## Architecture

```
                  App Growth Platform

        ┌─────────────────────────────────┐
        │ Admin Dashboard                 │
        │ • Add new apps                  │
        │ • AI marketing                  │
        │ • Analytics                     │
        │ • Campaigns                     │
        └─────────────────────────────────┘
                     │
        ┌─────────────────────────────────┐
        │ Marketing API                   │
        │ • Apps                          │
        │ • Campaigns                     │
        │ • Social content                │
        │ • Referrals                     │
        │ • Downloads                     │
        └─────────────────────────────────┘
                     │
      ┌──────────────┼──────────────────────┐
      │              │                      │
   App #1         App #2               App #3
 (e.g. DogSafe)   (your next app)     (future)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Workflow (any new app)

1. Finish a new app in its own repo.
2. Add it to the registry (`apps/your-app.json`) or dashboard.
3. AI asks: problem solved, audience, what's new.
4. Generates: social posts, blog drafts, press releases, store copy, email content.
5. You review and approve.
6. Track which channels drive installs.

## Docs

| Doc | Description |
|---|---|
| [BOUNDARIES.md](docs/BOUNDARIES.md) | **Live apps — do not harm paying users** |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and API surface |
| [ROADMAP.md](docs/ROADMAP.md) | Four-phase build plan |
| [PLATFORM-LIMITS.md](docs/PLATFORM-LIMITS.md) | What can/cannot be automated on social |

## App registry

| App | Status | Notes |
|---|---|---|
| DogSafe | Live (iOS) | Example only; marketing reference — [apps/dogsafe.json](apps/dogsafe.json) |

Add a row here for each new app. See [apps/README.md](apps/README.md).

## Status

**Phase 1 (in progress)** — CLI tools for onboarding, landing pages, and UTM links.

All implementation happens in **this repo**. App repos stay independent.

## Quick start

```bash
# Add a new app (interactive)
npm run add-app

# DogSafe — already registered; generate landing + links
npm run launch -- --app dogsafe --source reddit

# Preview landing page
open sites/dogsafe/index.html

# Channel-specific links
npm run generate-links -- --app dogsafe --source facebook --save
```

Deploy landing pages: [docs/DEPLOY.md](docs/DEPLOY.md) or `npm run deploy`

## CLI commands

| Command | Description |
|---|---|
| `npm run add-app` | Interactive onboarding → `apps/{slug}.json` + checklist |
| `npm run generate-landing -- --app <slug>` | Build `sites/{slug}/index.html` |
| `npm run generate-links -- --app <slug> --source <channel> [--save]` | UTM-tracked URLs |
| `npm run launch -- --app <slug> [--source reddit]` | Landing + links in one step |
| `npm run market -- --app <slug>` | All channel links + content folder |

**Marketing a registered app:** see `campaigns/{slug}/MARKETING.md` (DogSafe: `campaigns/dogsafe/MARKETING.md`).
