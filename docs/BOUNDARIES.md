# Boundaries — live apps vs App Launcher

App Launcher is a **marketing and launch platform**. It is **not** part of any shipped app binary.

## What App Launcher is for

- Launching **new apps** you build in the future
- Managing marketing metadata, campaigns, and content drafts
- Generating store copy, social posts, and launch checklists
- Tracking which channels drive installs (landing pages, UTM links, store analytics)

## What App Launcher must never do to live apps

For any app already on the App Store or Play Store — including **DogSafe (live on iOS, £2.99 paid)** — do **not** change the app repo from App Launcher work unless the user explicitly opens that repo and requests a change.

**Never change without explicit, separate approval in the app repo:**

- Pricing or monetization (paid → subscription, new IAP, paywalls)
- Features promised at purchase (removing or paywalling existing functionality)
- Bundle ID, app identity, or store product configuration
- Breaking changes to core behaviour existing users rely on
- Forced updates that degrade the experience paid users bought

**Safe changes in a live app repo** (only when explicitly requested there):

- Bug fixes
- Store listing copy (App Store Connect / Play Console — no app binary change)
- New optional features that do not remove or restrict what was already paid for
- Privacy policy or support URL updates

## Separation of repos

| Repo | Purpose | App Launcher may… |
|---|---|---|
| **AppLauncher** | Marketing platform, registry, campaigns | Build freely here |
| **DogSafe** | Shipped product (£2.99, live iOS) | **Read** listing metadata for marketing reference only |
| **Future app repos** | Each new app’s codebase | Register in `apps/`; marketing via App Launcher |

App Launcher **reads** paths like `../DogSafe/store/listing-metadata.json` for reference. It does **not** migrate, overwrite, or sync changes back into DogSafe automatically.

## DogSafe’s role

DogSafe is **one registry entry** (`apps/dogsafe.json`) — a worked example and optional marketing target. It is **not** the product being built in this repo.

Building App Launcher does not require changing DogSafe’s app code.

## Default agent behaviour

When working in **AppLauncher**:

1. All new code and features go in this repo.
2. Treat linked app repos as **read-only** unless the user switches workspace and asks for app changes.
3. Prefer generic templates (`templates/`, `schema/`) over DogSafe-specific logic.
4. New apps get `apps/{slug}.json` — same workflow as DogSafe, no special coupling.
