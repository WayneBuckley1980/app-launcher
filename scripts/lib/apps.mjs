import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function getRoot() {
  return ROOT;
}

export function appPath(slug) {
  return join(ROOT, 'apps', `${slug}.json`);
}

export function docsPath(slug) {
  return join(ROOT, 'docs', slug);
}

/** @deprecated Use docsPath — GitHub Pages serves from /docs */
export function sitesPath(slug) {
  return docsPath(slug);
}

export function campaignsPath(slug) {
  return join(ROOT, 'campaigns', slug);
}

export async function loadLauncherConfig() {
  const path = join(ROOT, 'config', 'launcher.json');
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

export async function loadApp(slug) {
  const path = appPath(slug);
  try {
    await access(path);
  } catch {
    throw new Error(`App not found: ${slug}. Run: npm run add-app`);
  }
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

export async function saveApp(slug, app) {
  const path = appPath(slug);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(app, null, 2)}\n`, 'utf8');
}

export async function loadListingMetadata(app) {
  if (app.listing) return app.listing;

  if (!app.listingMetadataPath) return null;

  const metaPath = resolve(ROOT, app.listingMetadataPath);
  try {
    const raw = await readFile(metaPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function mergeAppWithListing(app, listing) {
  if (!listing) return { ...app };

  return {
    ...app,
    priceGBP: app.priceGBP ?? listing.priceGBP,
    listing: {
      subtitle: listing.subtitle,
      promotionalText: listing.promotionalText,
      shortDescription: listing.shortDescription,
      fullDescription: listing.fullDescription,
      keywords: listing.keywords,
      privacyPolicyUrl: listing.privacyPolicyUrl,
      supportEmail: listing.supportEmail,
    },
    apple: {
      ...app.apple,
      ascAppId: app.apple?.ascAppId ?? listing.apple?.ascAppId,
      bundleId: app.apple?.bundleId ?? listing.bundleId ?? listing.apple?.bundleId,
      appStoreUrl:
        app.apple?.appStoreUrl ??
        (listing.apple?.ascAppId
          ? `https://apps.apple.com/app/id${listing.apple.ascAppId}`
          : undefined),
    },
    google: {
      ...app.google,
      packageName: app.google?.packageName ?? listing.androidPackage ?? listing.google?.packageName,
      playStoreUrl:
        app.google?.playStoreUrl ??
        (listing.google?.packageName || listing.androidPackage
          ? `https://play.google.com/store/apps/details?id=${listing.google?.packageName ?? listing.androidPackage}`
          : undefined),
    },
  };
}

export async function loadAppEnriched(slug) {
  const app = await loadApp(slug);
  const listing = await loadListingMetadata(app);
  return mergeAppWithListing(app, listing);
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

export function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
