# Roadmap

Build generic launch tooling in **App Launcher**. Use real launches (including optional marketing for already-live apps) to validate — without changing live app binaries or paid-user terms.

See [BOUNDARIES.md](BOUNDARIES.md) before any work that touches a shipped app repo.

## Phase 1 — Foundation

- [ ] Marketing API (design + v0 endpoints)
- [ ] App database (`apps/` → DB)
- [ ] Dashboard
- [ ] Analytics (UTM links, store console import)
- [ ] User authentication

**Phase 1 deliverables (any app):**

- Add app to registry → onboarding Q&A
- Generate listing copy templates
- Landing page + UTM link generator per app
- Reusable launch checklist

## Phase 2 — AI Marketing

- [ ] Content generation (social, blog, press, store)
- [ ] Image and banner generation
- [ ] Blog creation
- [ ] App Store description improvements
- [ ] Keyword suggestions

## Phase 3 — Campaign Management

- [ ] Social media scheduling (official APIs only)
- [ ] Referral links
- [ ] QR codes
- [ ] Email campaigns
- [ ] Push notification campaigns (for apps that opt in — configured per app, not hard-coded)

## Phase 4 — Intelligence

- [ ] Learn which posts perform best
- [ ] Recommend optimal posting times
- [ ] Suggest new audiences
- [ ] Track conversion rates by platform
- [ ] Compare campaign performance over time
- [ ] Cross-promotion recommendations between portfolio apps

## Milestones (per app, not platform)

Track separately for each app in the registry:

1. First sale
2. First 10 sales
3. First £100
4. First £1,000

The platform makes each **new** launch easier; it cannot create demand where none exists.

## Suggested build order

```
Week 1–2   Generic app onboarding + UTM landing page template
Week 3–4   Content generator CLI (Q&A → store copy + social drafts)
Month 2+   Marketing API v0 + apps CRUD + dashboard shell
```

Do not spend months on dashboard polish before one complete launch flow works for a **new** app end-to-end.
