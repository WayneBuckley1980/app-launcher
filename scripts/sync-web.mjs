#!/usr/bin/env node
/**
 * Copy dashboard + app data into docs/ for GitHub Pages.
 */
import { cp, mkdir, readdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getRoot } from './lib/apps.mjs';

const ROOT = getRoot();

async function sync() {
  const dest = join(ROOT, 'docs', 'app-launcher');
  const dataApps = join(ROOT, 'docs', 'data', 'apps');
  const dataConfig = join(ROOT, 'docs', 'data', 'config');

  await mkdir(dest, { recursive: true });
  await mkdir(dataApps, { recursive: true });
  await mkdir(dataConfig, { recursive: true });

  for (const file of ['index.html', 'styles.css', 'app.js']) {
    await cp(join(ROOT, 'dashboard', file), join(dest, file));
  }

  await cp(join(ROOT, 'shared'), join(ROOT, 'docs', 'shared'), { recursive: true });

  for (const file of await readdir(join(ROOT, 'apps'))) {
    if (file.endsWith('.json')) {
      await copyFile(join(ROOT, 'apps', file), join(dataApps, file));
    }
  }

  await cp(join(ROOT, 'config', 'launcher.json'), join(dataConfig, 'launcher.json'));

  console.log('✓ Synced dashboard → docs/app-launcher/');
  console.log('✓ Synced apps → docs/data/apps/');
  console.log('✓ Synced shared → docs/shared/');
  console.log('\nGitHub Pages URLs:');
  console.log('  Dashboard: .../app-launcher/');
  console.log('  DogSafe:   .../dogsafe/');
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
