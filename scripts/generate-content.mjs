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
  buildContentContext,
  generateContentFiles,
  generateIndexReadme,
} from './lib/content.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.app || args._[0];

  if (!slug) {
    console.error('Usage: npm run generate-content -- --app <slug>');
    console.error('Example: npm run generate-content -- --app dogsafe');
    process.exit(1);
  }

  const config = await loadLauncherConfig();
  const app = await loadAppEnriched(slug);

  const outDir = join(campaignsPath(slug), 'content', 'generated');
  await mkdir(outDir, { recursive: true });

  const files = generateContentFiles(app, config);
  const ctx = buildContentContext(app, config, 'content');

  for (const { filename, content } of files) {
    const path = join(outDir, filename);
    await writeFile(path, content, 'utf8');
    console.log(`✓ campaigns/${slug}/content/generated/${filename}`);
  }

  const readmePath = join(outDir, 'README.md');
  await writeFile(readmePath, generateIndexReadme(ctx, files.length), 'utf8');
  console.log(`✓ campaigns/${slug}/content/generated/README.md`);

  console.log(`\n${files.length} drafts ready for ${app.appName}.`);
  console.log('\nNext steps:');
  console.log(`  1. Open campaigns/${slug}/content/generated/`);
  console.log('  2. Edit a post — make it sound like you');
  console.log('  3. Copy and paste to Reddit, Instagram, etc.');
  console.log(`\nLanding page: ${app.marketing?.landingPageUrl || '(run npm run generate-landing)'}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
