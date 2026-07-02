#!/usr/bin/env node
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import {
  parseArgs,
  loadAppEnriched,
  loadLauncherConfig,
  saveApp,
  loadApp,
  docsPath,
  getRoot,
} from './lib/apps.mjs';

const DEFAULT_ACCENT = '#3b82f6';
const DEFAULT_ACCENT_SOFT = 'rgba(59, 130, 246, 0.15)';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractFeatures(app) {
  if (app.marketing?.featureBullets?.length) {
    return app.marketing.featureBullets;
  }

  const features = [];

  if (app.differentiator) {
    app.differentiator.split(/[.·]/).forEach((part) => {
      const t = part.trim();
      if (t.length > 10) features.push(t);
    });
  }

  if (app.listing?.promotionalText) {
    const promo = app.listing.promotionalText;
    const chunks = promo.split(/[,—]/).map((s) => s.trim()).filter((s) => s.length > 15);
    for (const c of chunks.slice(0, 4)) {
      if (!features.includes(c)) features.push(c);
    }
  }

  if (features.length === 0 && app.problem) {
    features.push(app.problem);
  }

  return features.slice(0, 6);
}

function buildPriceLine(app) {
  if (app.monetization === 'free') return 'Free download';
  if (app.monetization === 'subscription') return 'Subscription app';
  if (app.priceGBP != null) {
    const iosOnly = app.google?.liveOnStore !== true;
    const suffix = iosOnly ? ' · <span style="color:var(--muted)">iPhone only — Android coming soon</span>' : '';
    return `<strong>£${app.priceGBP.toFixed(2)}</strong> — one-time purchase, no subscription${suffix}`;
  }
  return '';
}

function buildStoreButtons(app) {
  const buttons = [];

  if (app.apple?.appStoreUrl) {
    buttons.push(
      `<a class="store-btn primary" href="${escapeHtml(app.apple.appStoreUrl)}" rel="noopener">Download on the App Store</a>`
    );
  }

  if (app.google?.playStoreUrl && app.google?.liveOnStore === true) {
    buttons.push(
      `<a class="store-btn secondary" href="${escapeHtml(app.google.playStoreUrl)}" rel="noopener">Get it on Google Play</a>`
    );
  }

  if (buttons.length === 0) {
    buttons.push('<p class="subtitle">Store links coming soon.</p>');
  }

  return buttons.join('\n      ');
}

function buildFeaturesHtml(features) {
  return features
    .map((f) => `<li>${escapeHtml(f.charAt(0).toUpperCase() + f.slice(1))}</li>`)
    .join('\n      ');
}

function replaceAll(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyLandingAssets(app, outDir) {
  const assets = app.marketing?.assets;
  const captions = app.listing?.screenshotCaptions || [];
  let iconRel = null;
  const screenshots = [];

  if (!assets) return { iconRel, screenshots };

  const imagesDir = join(outDir, 'images');
  await mkdir(imagesDir, { recursive: true });

  if (assets.iconPath) {
    const src = resolve(getRoot(), assets.iconPath);
    if (await fileExists(src)) {
      const ext = extname(src) || '.png';
      iconRel = `images/icon${ext}`;
      await copyFile(src, join(outDir, iconRel));
    }
  }

  const shots = assets.screenshots || [];
  for (let i = 0; i < shots.length; i++) {
    const shot = typeof shots[i] === 'string' ? { path: shots[i] } : shots[i];
    const src = resolve(getRoot(), shot.path);
    if (!(await fileExists(src))) continue;

    const ext = extname(src) || '.png';
    const rel = `images/screen-${i + 1}${ext}`;
    await copyFile(src, join(outDir, rel));
    screenshots.push({
      src: rel,
      caption: shot.caption || captions[i] || '',
    });
  }

  return { iconRel, screenshots };
}

function buildAppIconHtml(iconRel, appName) {
  if (!iconRel) return '';
  return `<img class="app-icon" src="${escapeHtml(iconRel)}" alt="${escapeHtml(appName)} app icon" width="88" height="88">`;
}

function buildScreenshotsHtml(screenshots) {
  if (!screenshots.length) return '';

  const items = screenshots
    .map(
      (s) => `<figure class="shot">
        <img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.caption || 'App screenshot')}" loading="lazy" width="200">
        ${s.caption ? `<figcaption>${escapeHtml(s.caption)}</figcaption>` : ''}
      </figure>`
    )
    .join('\n      ');

  return `<section class="screenshots-section">
      <h2>Screenshots</h2>
      <div class="screenshots">${items}</div>
    </section>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.app || args._[0];

  if (!slug) {
    console.error('Usage: npm run generate-landing -- --app <slug>');
    process.exit(1);
  }

  const config = await loadLauncherConfig();
  const app = await loadAppEnriched(slug);
  const template = await readFile(join(getRoot(), 'templates', 'landing.html'), 'utf8');

  const outDir = docsPath(slug);
  await mkdir(outDir, { recursive: true });

  const { iconRel, screenshots } = await copyLandingAssets(app, outDir);

  const subtitle =
    app.listing?.subtitle ||
    app.listing?.shortDescription ||
    app.problem?.slice(0, 80) ||
    '';

  const metaDescription =
    app.listing?.shortDescription ||
    app.listing?.promotionalText ||
    app.problem ||
    '';

  const accent = app.marketing?.accentColor || DEFAULT_ACCENT;
  const accentSoft = app.marketing?.accentSoft || DEFAULT_ACCENT_SOFT;

  const badgeText =
    app.monetization === 'paid' && app.priceGBP != null
      ? 'No subscription'
      : app.status === 'live'
        ? 'Available now'
        : 'Coming soon';

  const privacyUrl = app.listing?.privacyPolicyUrl || '#';
  const supportEmail = app.listing?.supportEmail || '';
  const footerLine = app.marketing?.footerLine || app.appName;

  const landingPageUrl = `${config.siteBaseUrl.replace(/\/$/, '')}/${slug}/`;
  const ogImage = iconRel
    ? `<meta property="og:image" content="${escapeHtml(`${landingPageUrl}${iconRel}`)}">`
    : '';

  const html = replaceAll(template, {
    APP_NAME: escapeHtml(app.appName),
    SUBTITLE: escapeHtml(subtitle),
    META_DESCRIPTION: escapeHtml(metaDescription.slice(0, 160)),
    ACCENT_COLOR: escapeHtml(accent),
    ACCENT_SOFT: accentSoft,
    BADGE_TEXT: escapeHtml(badgeText),
    PRICE_LINE: buildPriceLine(app),
    STORE_BUTTONS: buildStoreButtons(app),
    FEATURES_HTML: buildFeaturesHtml(extractFeatures(app)),
    FOOTER_LINE: escapeHtml(footerLine),
    PRIVACY_URL: escapeHtml(privacyUrl),
    SUPPORT_EMAIL: escapeHtml(supportEmail),
    APP_ICON: buildAppIconHtml(iconRel, app.appName),
    SCREENSHOTS_SECTION: buildScreenshotsHtml(screenshots),
    OG_IMAGE: ogImage,
  });

  const outPath = join(outDir, 'index.html');
  await writeFile(outPath, html, 'utf8');

  const registryApp = await loadApp(slug);
  registryApp.marketing = {
    ...registryApp.marketing,
    landingPageUrl,
    landingPagePath: `docs/${slug}/index.html`,
  };
  if (app.apple?.appStoreUrl && registryApp.apple) {
    registryApp.apple.appStoreUrl = app.apple.appStoreUrl;
  }
  if (app.google?.playStoreUrl && registryApp.google) {
    registryApp.google.playStoreUrl = app.google.playStoreUrl;
  }
  await saveApp(slug, registryApp);

  console.log(`\n✓ Landing page: docs/${slug}/index.html`);
  if (iconRel) console.log(`✓ App icon: docs/${slug}/${iconRel}`);
  if (screenshots.length) console.log(`✓ Screenshots: ${screenshots.length} copied`);
  console.log(`✓ Landing URL (after deploy): ${landingPageUrl}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
