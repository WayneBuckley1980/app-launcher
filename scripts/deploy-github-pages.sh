#!/usr/bin/env bash
# Push App Launcher to GitHub and enable Pages on docs/
#
# Before first run: create a public repo at https://github.com/new named "app-launcher"
#
# Usage:
#   GITHUB_USERNAME=WayneBuckley1980 bash scripts/deploy-github-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

USER="${GITHUB_USERNAME:-WayneBuckley1980}"
REPO="${GITHUB_REPO:-app-launcher}"
REMOTE="https://github.com/${USER}/${REPO}.git"

echo "App Launcher — deploy to GitHub Pages"
echo "Remote: $REMOTE"
echo ""

echo "→ Regenerating DogSafe landing page..."
node scripts/generate-landing.mjs --app dogsafe

echo ""
echo "→ Staging changes..."
git add -A
git status

if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "Deploy landing pages and marketing tooling"
elif [ -z "$(git status -s)" ]; then
  echo "Nothing to commit."
else
  git commit -m "Deploy landing pages and marketing tooling" || true
fi

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo ""
echo "→ Pushing to GitHub (sign in if prompted)..."
git push -u origin main

echo ""
echo "════════════════════════════════════════════════════════"
echo "  GitHub Pages — one-time setup (if not done yet)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  1. Open: https://github.com/${USER}/${REPO}/settings/pages"
echo "  2. Source: Deploy from branch"
echo "  3. Branch: main  ·  Folder: /docs"
echo "  4. Save — wait ~2 minutes"
echo ""
echo "  DogSafe landing page:"
echo "  https://${USER}.github.io/${REPO}/dogsafe/"
echo ""
echo "  Then market:"
echo "  npm run market -- --app dogsafe"
echo "════════════════════════════════════════════════════════"
