# App Launcher

AI-first App Growth Platform for indie developers. Promote any app you build — DogSafe is app #1.

## Principles

1. **Market while you build** — Extract reusable tools from real launch work; don't build imagined features.
2. **Human review before publish** — AI generates drafts; you approve everything.
3. **Platform policy compliance** — No automated account creation on social platforms. Act as a launch assistant.
4. **Start small** — First sale → first 10 sales → first £100 → first £1,000.

## Project structure

```
AppLauncher/
├── apps/              # App registry (one JSON per app)
├── schema/            # Shared JSON schemas
├── docs/              # Architecture, roadmap, guides
└── templates/         # Store copy, social posts, checklists
```

## DogSafe (first app)

- **Repo:** `../DogSafe`
- **Registry:** `apps/dogsafe.json`
- Store listing metadata lives in DogSafe's `store/` folder until migrated here.

## When working on App Launcher

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

Do not scope-creep into Phase 2+ (AI image gen, scheduling) until Phase 1 serves DogSafe's first sales.
