# App Launcher

An **App Growth Platform** for indie developers. Add any app, answer a few questions, and get AI-generated marketing assets, launch checklists, and (eventually) campaign analytics. DogSafe is the first app in the system.

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
   DogSafe      Future App #2         Future App #3
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Workflow

1. Finish a new app.
2. Add it to the dashboard (or `apps/` registry for now).
3. AI asks: problem solved, audience, what's new.
4. Generates: social posts, blog drafts, press releases, store copy, email content.
5. You review and approve.
6. Track which channels drive installs.

## Docs

| Doc | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and API surface |
| [ROADMAP.md](docs/ROADMAP.md) | Four-phase build plan |
| [PLATFORM-LIMITS.md](docs/PLATFORM-LIMITS.md) | What can/cannot be automated on social |
| [DOGSAFE-REVIEW.md](docs/DOGSAFE-REVIEW.md) | First-app listing and marketing review |

## Apps

| App | Status | Repo |
|---|---|---|
| DogSafe | Live (£2.99) | [../DogSafe](../DogSafe) |

## Status

**Phase 0** — Planning and app registry. No API or dashboard yet.

Build tools from DogSafe marketing work in parallel with chasing first sales.
