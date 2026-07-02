# Architecture

## Overview

App Launcher is an AI-first App Growth Platform. It is **not** tied to a single app — DogSafe is the first consumer.

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
- "Promote DogSafe to first-time dog owners in the UK."
- "Create a week's worth of LinkedIn posts about my business app."
- "Rewrite this announcement for Instagram."
- "Suggest five communities where this app would be relevant."

## Cross-promotion (Phase 4)

As the portfolio grows, apps can recommend related apps:

- DogSafe → future hiking app (dog walkers)
- Productivity app → another productivity tool
- Unrelated audiences → no automatic cross-promo

## Account strategy

Support both:

- **Developer brand account** — one account promoting the full portfolio
- **Dedicated app accounts** — when an app justifies its own audience

## Data model (v0)

See `schema/app.schema.json` and `apps/dogsafe.json`.

Future: Postgres + Marketing API. Start with JSON files and scripts.

## Relationship to app repos

Each app (e.g. DogSafe) keeps its own codebase. App Launcher holds:

- Marketing metadata and campaigns
- Generated content drafts
- Analytics and attribution
- Launch tooling shared across apps

DogSafe's `store/listing-metadata.json` is the prototype for the `Apps` schema.
