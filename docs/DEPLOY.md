# Deploy landing pages (GitHub Pages)

Landing pages live in `docs/{app-slug}/index.html`. GitHub Pages only serves from **`/docs`** or repo root.

## One-time GitHub setup

1. Create a **public** repo: https://github.com/new → name **`app-launcher`**
2. Do **not** add README (this project already has one)

## Deploy from your Mac

```bash
cd ~/Projects/AppLauncher
npm run deploy
```

Or: `bash scripts/deploy-github-pages.sh`

## Enable Pages (one time)

https://github.com/WayneBuckley1980/app-launcher/settings/pages

- Branch: **main**
- Folder: **/docs**
- Save — wait ~2 minutes

**DogSafe:** https://waynebuckley1980.github.io/app-launcher/dogsafe/

**Dashboard (market apps in the browser):** https://waynebuckley1980.github.io/app-launcher/app-launcher/

## Local dashboard

```bash
npm run dev
```

Open http://localhost:3456/dashboard/

## After deploy

```bash
npm run market -- --app dogsafe
```

Share links from `campaigns/dogsafe/links/`.
