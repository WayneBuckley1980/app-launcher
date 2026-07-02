#!/usr/bin/env node
/**
 * Generate tracked links for all primary channels of an app.
 * Usage: npm run market -- --app dogsafe
 */
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

const DEFAULT_CHANNELS = ['reddit', 'facebook', 'twitter', 'email', 'instagram'];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.app || args._[0];

  if (!slug) {
    console.error('Usage: npm run market -- --app <slug>');
    process.exit(1);
  }

  const config = await loadLauncherConfig();
  const app = await loadAppEnriched(slug);
  const channels = app.marketing?.primaryChannels?.length
    ? [...app.marketing.primaryChannels, 'email']
    : DEFAULT_CHANNELS;

  const uniqueChannels = [...new Set(channels)];

  const landingBase =
    app.marketing?.landingPageUrl ||
    `${config.siteBaseUrl.replace(/\/$/, '')}/${slug}/`;

  const linksDir = join(campaignsPath(slug), 'links');
  await mkdir(linksDir, { recursive: true });

  console.log(`\nMarketing links — ${app.appName}\n`);
  console.log(`Landing page: ${landingBase}\n`);
  console.log('─'.repeat(50));

  for (const source of uniqueChannels) {
    const utm = {
      source,
      medium: args.medium || config.defaultMedium || 'social',
      campaign: args.campaign || config.defaultCampaign || 'launch',
    };

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

    const filename = `${source}-${utm.campaign}.md`;
    await writeFile(join(linksDir, filename), bundle, 'utf8');
    console.log(`✓ ${source.padEnd(12)} → campaigns/${slug}/links/${filename}`);
    console.log(`  ${landing}\n`);
  }

  console.log('─'.repeat(50));
  console.log(`\nContent drafts: campaigns/${slug}/content/`);
  console.log(`Playbook:       campaigns/${slug}/MARKETING.md`);
  console.log('\nShare landing page links in posts — not raw App Store URLs.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
