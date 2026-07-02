# DogSafe marketing via App Launcher

**Platform:** App Launcher (this repo) · **App:** DogSafe (live iOS, £2.99)  
**Rule:** We market DogSafe here. We do **not** change the DogSafe app or anything paying customers already have.

## Before you post anything

1. **Deploy the landing page** — [docs/DEPLOY.md](../../docs/DEPLOY.md) or `npm run deploy`
2. **Generate all tracked links:**
   ```bash
   npm run market -- --app dogsafe
   ```
3. **Pick one draft** from `content/`, personalise it, review, then post.
4. **Use the landing page URL** from `links/` — not the raw App Store link.

---

## This week (start small)

| Day | Action |
|---|---|
| **1** | Deploy `sites/dogsafe/` to GitHub Pages |
| **2** | Post draft #1 (flat-faced breeds) in one subreddit — see `content/reddit-flat-faced-breeds.md` |
| **4** | Post in one UK Facebook dog group — see `content/facebook-group.md` |
| **7** | Check App Store Connect → Analytics → Sources. Note what moved. |

One good post beats five spammy ones.

---

## Where to post (prioritised)

### High intent — try first

| Place | Why | Draft |
|---|---|---|
| r/pugs, r/bulldogs, r/Frenchbulldogs | Flat-faced owners worry about heat | `content/reddit-flat-faced-breeds.md` |
| UK Facebook dog groups | Local, daily walkers | `content/facebook-group.md` |
| r/sideproject | Indie dev story — softer sell | `content/reddit-indie-dev.md` |

### Medium intent — after first results

| Place | Notes |
|---|---|
| r/dogs, r/Dogtraining | Strict self-promo rules — lead with value, mention app lightly |
| Dog forums / breed clubs | Email or forum post with landing link |

### Skip for now

- Paid ads (wait until you know which message converts)
- Generic "check out my app" posts with no hook
- Subreddits that ban self-promotion without reading rules first

Full list: `content/communities-to-try.md`

---

## Links (regenerate anytime)

```bash
npm run market -- --app dogsafe
```

Files land in `links/` — one file per channel with UTM tracking.

**Primary link to share:**
```
https://waynebuckley1980.github.io/app-launcher/dogsafe/?utm_source=reddit&utm_medium=social&utm_campaign=launch
```
(Use the channel-specific URL from `links/` for each post.)

---

## Measuring success

| Signal | Where |
|---|---|
| Page views / sources | App Store Connect → Analytics → Sources |
| Installs by source | Same + compare week over week |
| Android referrers | Play Console → User acquisition |
| Which copy worked | Note post + link file name in checklist |

**Milestones:** first sale → 10 sales → £100. Each teaches something.

---

## Content drafts (review before posting)

All in `content/` — edit to sound like you, not a advert.

- `reddit-flat-faced-breeds.md` — heat + brachycephalic angle
- `reddit-multi-dog.md` — household with multiple dogs
- `reddit-indie-dev.md` — builder story for r/sideproject
- `facebook-group.md` — short, friendly, UK tone
- `communities-to-try.md` — subreddits and groups to research

---

## When app #2 launches

Same folder pattern: `campaigns/your-app/`. DogSafe stays here as reference. Run:

```bash
npm run add-app
npm run launch -- --app your-app
npm run market -- --app your-app
```
