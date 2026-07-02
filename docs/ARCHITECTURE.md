# Architecture

## Overview

App Launcher is an AI-first App Growth Platform for **launching any new app**. Each app lives in its own repo; App Launcher holds marketing metadata, campaigns, and tooling shared across the portfolio.

DogSafe appears in the registry as a **live example** only. Building App Launcher must not require changes to DogSafe’s shipped app or paid-user experience. See [BOUNDARIES.md](BOUNDARIES.md).

## Components

### Admin Dashboard (Phase 1)

- Add new apps
- AI marketing prompts
- Analytics overview
- Campaign management

### Marketing API (Phase 1)

| Resource | Purpose |
|---|---|
| `Apps` | Registry: name, bundle IDs, store URLs, listing metadata |
| `Campaigns` | Launch or ongoing promotion runs |
| `Social content` | Draft posts per platform |
| `Referrals` | Tracked links, QR codes |
| `Downloads` | Attribution and conversion data |

## Launch workflow

1. Add app → onboarding Q&A (problem, audience, differentiator).
2. Generate branding suggestions, bios, first 30 posts, hashtags, content calendar, link page.
3. Launch checklist with manual steps for account setup.
4. Connect official platform APIs where available.
5. Generate content on demand via prompts; human approves before publish.
6. Track performance by channel.

## AI-first prompts (examples)

- "Launch my new budgeting app over the next 30 days."
- "Promote my fitness app to gym-goers in the UK."
- "Create a week's worth of LinkedIn posts about my business app."
- "Rewrite this announcement for Instagram."
- "Suggest five communities where this app would be relevant."

## Cross-promotion (Phase 4)

As the portfolio grows, apps can recommend **related** apps where audiences overlap. Unrelated apps do not cross-promote automatically.

## Account strategy

Support both:

- **Developer brand account** — one account promoting the full portfolio
- **Dedicated app accounts** — when an app justifies its own audience

## Data model (v0)

See `schema/app.schema.json` and entries in `apps/`.

Future: Postgres + Marketing API. Start with JSON files and scripts.

## Relationship to app repos

Each app keeps its **own codebase and store listing**. App Launcher holds:

- Marketing metadata and campaigns
- Generated content drafts
- Analytics and attribution
- Launch tooling shared across apps

**Read-only by default:** For live apps, App Launcher may reference paths like `listingMetadataPath` but must not write back to the app repo without explicit user action in that repo.

The `store/listing-metadata.json` pattern (used in DogSafe) is a convenient prototype for the `Apps` schema — not a requirement to merge or migrate live app data.
