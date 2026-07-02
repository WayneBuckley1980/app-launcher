# DogSafe — first app review

DogSafe is app #1 in App Launcher. Repo: `../DogSafe`

## Listing — strong

Differentiators in current copy:

- Pay once, no subscription (vs monthly pet apps)
- Multi-dog households
- Walk windows, not just current safety
- Pavement + UV + winter hazards

**Gap:** No marketing landing page with UTM-tracked store links. Privacy policy URL is legal-only.

## Target audience

**Primary:** UK dog owners who walk daily and worry about heat, pavement, or breed-specific risk.

**Test first:**

- Flat-faced breed owners (Bulldog, Pug, Frenchie)
- Multi-dog households
- Summer walkers (seasonal urgency)

**Avoid for cold start:** Generic "all dog owners" without a hook.

## Monetization

- **Model:** £2.99 one-time paid app
- **Pros:** Simple, aligns with messaging, no subscription fatigue
- **Cons:** Store listing is the only conversion surface; no trial or freemium funnel
- **After Apple cut:** ~£2.10 per sale; 10 sales ≈ £21 (validation milestone)

## Drop-off — not visible yet

No in-app analytics. Minimum tracking before marketing spend:

1. Landing page with `?utm_source=` on store links
2. App Store Connect → Analytics → Sources
3. Play Console → User acquisition

## Next actions for App Launcher

1. **Option A** — DogSafe landing page + UTM tracking (fastest learnings)
2. **Option B** — App schema + content generator (seeds Marketing API)
3. **Option C** — Full Phase 1 scaffold (larger investment)

Recommended: **A then B**.

## Store metadata source of truth

Until migrated, DogSafe listing data lives at:

- `../DogSafe/store/listing-metadata.json`
- `../DogSafe/store/LISTING_COPY_IOS.txt`
- `../DogSafe/store/LISTING_COPY_ANDROID.txt`

App Launcher registry: `apps/dogsafe.json`
