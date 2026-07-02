# App registry

One JSON file per app you want to launch or promote. DogSafe is included as a **live example** — not the only app this platform serves.

## Add a new app

1. Copy `dogsafe.json` → `your-app-slug.json`
2. Fill in fields per `schema/app.schema.json`
3. Set `repoPath` to the app’s source repo (sibling folder or absolute path)
4. Set `status`: `planning` | `development` | `live` | `sunset`

## Live apps

If `status` is `live`, see [docs/BOUNDARIES.md](../docs/BOUNDARIES.md). App Launcher must not modify that app’s codebase or paid-user experience unless you explicitly work in that repo and request changes.

## DogSafe

`dogsafe.json` points at `../DogSafe` for **marketing reference only** (store IDs, listing copy path). DogSafe is already on iOS; do not change its app from App Launcher work.
