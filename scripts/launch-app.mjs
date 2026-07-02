#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { parseArgs, loadApp, getRoot } from './lib/apps.mjs';

function run(cmd) {
  console.log(`\n→ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd: getRoot() });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.app || args._[0];

  if (!slug) {
    console.error('Usage: npm run launch -- --app <slug> [--source reddit]');
    process.exit(1);
  }

  const app = await loadApp(slug);
  console.log(`\nApp Launcher — launch prep for ${app.appName}\n`);

  run(`node scripts/generate-landing.mjs --app ${slug}`);

  const source = args.source || 'reddit';
  const saveFlag = args.save !== false ? '--save' : '';
  run(`node scripts/generate-links.mjs --app ${slug} --source ${source} ${saveFlag}`.trim());

  run(`node scripts/generate-content.mjs --app ${slug}`);

  console.log('\n--- Ready to market ---');
  console.log(`Content:   campaigns/${slug}/content/generated/`);
  console.log(`Checklist: campaigns/${slug}/launch-checklist.md`);
  console.log(`Links:     campaigns/${slug}/links/${source}-launch.md`);
  console.log(`Preview:   docs/${slug}/index.html`);
  console.log('\nDeploy: npm run deploy');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
