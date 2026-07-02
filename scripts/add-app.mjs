#!/usr/bin/env node
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import {
  getRoot,
  appPath,
  campaignsPath,
  saveApp,
  slugify,
} from './lib/apps.mjs';
import { createPrompt, askRequired, askChoice, askYesNo, ask } from './lib/prompts.mjs';

const MONETIZATION = ['paid', 'subscription', 'freemium', 'iap', 'free'];
const STATUS = ['planning', 'development', 'live'];

function buildChecklist(slug, app) {
  const date = new Date().toISOString().slice(0, 10);
  return `# Launch checklist — ${app.appName}

Generated ${date} by \`npm run add-app\`

## Pre-launch

- [${app.status === 'live' ? 'x' : ' '}] App registry entry in \`apps/${slug}.json\`
- [ ] Store listings (iOS + Android)
- [ ] Privacy policy URL live
- [ ] Support email configured
- [ ] Screenshots and captions
- [ ] Landing page with UTM-tracked store links — \`npm run generate-landing -- --app ${slug}\`
- [ ] App Store Connect / Play Console analytics enabled

## Branding

- [ ] Profile bios per platform drafted
- [ ] Link page or landing page published

## Social (manual account setup)

- [ ] Decide: developer brand vs dedicated app account
- [ ] Create accounts on chosen platforms
- [ ] Generate tracked links — \`npm run generate-links -- --app ${slug} --source reddit\`

## Content (review before posting)

- [ ] First posts drafted for primary channels: ${(app.marketing?.primaryChannels ?? ['reddit']).join(', ')}
- [ ] Reddit / community post suggestions reviewed
- [ ] Launch week calendar planned

## Post-launch

- [ ] Track sources weekly (store consoles + UTM landing traffic)
- [ ] Note which channels convert vs bounce
- [ ] Iterate listing copy based on learnings

---

**Problem:** ${app.problem}

**Audience:** ${app.targetAudience}

**Differentiator:** ${app.differentiator}
`;
}

async function main() {
  console.log('\nApp Launcher — add a new app to the registry\n');

  const rl = createPrompt();

  try {
    const name = await askRequired(rl, 'App name');
    let slug = slugify(await ask(rl, 'App slug (URL id)', { defaultValue: slugify(name) }));
    if (!slug) slug = slugify(name);

    try {
      await access(appPath(slug));
      console.error(`\nError: apps/${slug}.json already exists.`);
      process.exit(1);
    } catch {
      // ok
    }

    const problem = await askRequired(rl, 'What problem does it solve?');
    const targetAudience = await askRequired(rl, 'Who is it for?');
    const differentiator = await askRequired(rl, "What's new / different?");
    const monetization = await askChoice(rl, 'How does it make money?', MONETIZATION, 1);
    const geography = await ask(rl, 'Primary geography', { defaultValue: 'UK' });
    const status = await askChoice(rl, 'Current status?', STATUS, 1);

    let priceGBP;
    if (monetization === 'paid') {
      const priceRaw = await ask(rl, 'Price in GBP', { defaultValue: '2.99' });
      priceGBP = parseFloat(priceRaw) || undefined;
    }

    const repoPath = await ask(rl, 'Path to app repo (relative to AppLauncher)', {
      defaultValue: `../${slug}`,
    });

    const hasApple = await askYesNo(rl, 'On (or planning) Apple App Store?', true);
    let apple;
    if (hasApple) {
      const ascAppId = await ask(rl, 'App Store Connect app ID (numeric, optional)');
      const bundleId = await ask(rl, 'iOS bundle ID (optional)');
      apple = {};
      if (ascAppId) {
        apple.ascAppId = ascAppId;
        apple.appStoreUrl = `https://apps.apple.com/app/id${ascAppId}`;
        apple.appStoreConnectUrl = `https://appstoreconnect.apple.com/apps/${ascAppId}`;
      }
      if (bundleId) apple.bundleId = bundleId;
    }

    const hasGoogle = await askYesNo(rl, 'On (or planning) Google Play?', true);
    let google;
    if (hasGoogle) {
      const packageName = await ask(rl, 'Android package name (optional)');
      if (packageName) {
        google = {
          packageName,
          playStoreUrl: `https://play.google.com/store/apps/details?id=${packageName}`,
        };
      }
    }

    const channelsRaw = await ask(rl, 'Primary channels (comma-separated)', {
      defaultValue: 'reddit,facebook-groups,app-store-search',
    });
    const primaryChannels = channelsRaw.split(',').map((s) => s.trim()).filter(Boolean);

    const app = {
      id: slug,
      appName: name,
      repoPath,
      status,
      liveOnStore: status === 'live',
      monetization,
      geography,
      problem,
      targetAudience,
      differentiator,
      ...(priceGBP !== undefined ? { priceGBP } : {}),
      ...(apple ? { apple } : {}),
      ...(google ? { google } : {}),
      marketing: {
        landingPageUrl: null,
        primaryChannels,
        accountStrategy: 'developer-brand',
      },
    };

    await saveApp(slug, app);

    const checklistDir = campaignsPath(slug);
    await mkdir(checklistDir, { recursive: true });
    const checklistPath = join(checklistDir, 'launch-checklist.md');
    await writeFile(checklistPath, buildChecklist(slug, app), 'utf8');

    console.log('\n✓ Created apps/' + slug + '.json');
    console.log('✓ Created campaigns/' + slug + '/launch-checklist.md');
    console.log('\nNext steps:');
    console.log(`  npm run generate-landing -- --app ${slug}`);
    console.log(`  npm run generate-links -- --app ${slug} --source reddit`);
    console.log(`  npm run launch -- --app ${slug}`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
