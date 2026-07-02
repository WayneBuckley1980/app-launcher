#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  parseArgs,
  loadAppEnriched,
  loadLauncherConfig,
  campaignsPath,
} from './lib/apps.mjs';
import {
  buildLandingUrl,
  buildAppStoreUrl,
  buildPlayStoreUrl,
  formatLinkBundle,
} from './lib/utm.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.app || args._[0];

  if (!slug) {
    console.error('Usage: npm run generate-links -- --app <slug> --source <channel> [--campaign launch] [--medium social] [--content hero] [--save]');
    process.exit(1);
  }

  if (!args.source) {
    console.error('Error: --source is required (e.g. reddit, facebook, twitter, email)');
    process.exit(1);
  }

  const config = await loadLauncherConfig();
  const app = await loadAppEnriched(slug);

  const utm = {
    source: args.source,
    medium: args.medium || config.defaultMedium || 'social',
    campaign: args.campaign || config.defaultCampaign || 'launch',
    content: args.content,
  };

  const landingBase =
    app.marketing?.landingPageUrl ||
    `${config.siteBaseUrl.replace(/\/$/, '')}/${slug}/`;

  const landing = buildLandingUrl(landingBase, utm);

  const ios = app.apple?.appStoreUrl
    ? buildAppStoreUrl(app.apple.appStoreUrl, utm)
    : null;

  const android = app.google?.playStoreUrl
    ? buildPlayStoreUrl(app.google.playStoreUrl, utm)
    : null;

  const bundle = formatLinkBundle({
    appName: app.appName,
    landing,
    ios,
    android,
    utm,
  });

  console.log('\n' + bundle);

  if (args.save) {
    const dir = join(campaignsPath(slug), 'links');
    await mkdir(dir, { recursive: true });
    const filename = `${utm.source}-${utm.campaign}.md`;
    const path = join(dir, filename);
    await writeFile(path, bundle, 'utf8');
    console.log(`Saved: campaigns/${slug}/links/${filename}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
