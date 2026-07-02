# App Launcher

AI-first App Growth Platform for indie developers. **Launch and promote any new app** — store copy, campaigns, analytics, and checklists. DogSafe is one registered example; this repo is not the DogSafe product.

## Critical: do not harm live apps

**DogSafe is live on iOS** (£2.99 paid). People have already purchased it.

When working in **AppLauncher**:

- **Do not modify** `../DogSafe` or any live app repo unless the user explicitly opens that repo and requests a change.
- **Do not** change pricing, monetization, paid features, or behaviour that affects existing customers.
- **Do not** embed App Launcher code into shipped apps.
- App Launcher work stays **in this repo** — marketing metadata, drafts, landing pages, API, dashboard.

Read `docs/BOUNDARIES.md` before touching any linked app repo.

## Principles

1. **Platform-first** — Build generic launch tooling for every new app, not DogSafe-specific features.
2. **Market while you build** — Extract reusable tools from real launch work; don't build imagined features.
3. **Human review before publish** — AI generates drafts; you approve everything.
4. **Platform policy compliance** — No automated account creation on social platforms. Act as a launch assistant.
5. **Start small** — First sale → first 10 sales → first £100 → first £1,000.

## Project structure

```
AppLauncher/
├── apps/              # App registry (one JSON per app)
├── schema/            # Shared JSON schemas
├── docs/              # Architecture, roadmap, guides
└── templates/         # Store copy, social posts, checklists
```

## Registered apps

- **DogSafe** — live on iOS, `apps/dogsafe.json`, repo `../DogSafe` (read-only for marketing reference)
- **Future apps** — add `apps/{slug}.json` for each new app you launch

Listing metadata for live apps may stay in the app repo (e.g. DogSafe `store/`). App Launcher references paths; it does not overwrite them.

## When working on App Launcher

- Read `docs/BOUNDARIES.md` — live app rules (required).
- Read `docs/ARCHITECTURE.md` for system design.
- Read `docs/ROADMAP.md` for phase priorities.
- Read `docs/PLATFORM-LIMITS.md` before suggesting social automation.
- New apps get a file in `apps/` following `schema/app.schema.json`.

## Phase 1 focus (current)

- Marketing API design
- App database (JSON → DB later)
- Dashboard (later)
- Analytics (UTM + store console data)
- User authentication (later)

Build **generic** Phase 1 features that work for any app in the registry. Do not scope-creep into Phase 2+ until Phase 1 is usable for the next app launch.
