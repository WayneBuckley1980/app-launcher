# Example: DogSafe marketing review

**Reference only.** DogSafe is a live paid app on iOS. This document is optional marketing notes — not App Launcher product scope. Do not use it as a reason to change DogSafe’s app code or paid-user experience.

Repo: `../DogSafe` · Registry: `apps/dogsafe.json`

## Listing — strong

Differentiators in current copy:

- Pay once, no subscription (vs monthly pet apps)
- Multi-dog households
- Walk windows, not just current safety
- Pavement + UV + winter hazards

**Gap:** No marketing landing page with UTM-tracked store links. Privacy policy URL is legal-only. A landing page can be hosted from **App Launcher** without changing the DogSafe app binary.

## Target audience

**Primary:** UK dog owners who walk daily and worry about heat, pavement, or breed-specific risk.

**Test first:**

- Flat-faced breed owners (Bulldog, Pug, Frenchie)
- Multi-dog households
- Summer walkers (seasonal urgency)

## Monetization (unchanged — live on store)

- **Model:** £2.99 one-time paid app — **do not change** without explicit product decision in DogSafe repo
- Store listing is the conversion surface; App Launcher can add external landing pages only

## Drop-off — not visible yet

No in-app analytics required for App Launcher. External tracking:

1. Landing page with `?utm_source=` on store links (App Launcher)
2. App Store Connect → Analytics → Sources
3. Play Console → User acquisition

## Store metadata (read-only reference)

DogSafe listing data lives in the DogSafe repo:

- `../DogSafe/store/listing-metadata.json`
- `../DogSafe/store/LISTING_COPY_IOS.txt`
- `../DogSafe/store/LISTING_COPY_ANDROID.txt`

App Launcher reads these paths; it does not sync or overwrite them automatically.
