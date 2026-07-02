import { generateContentFiles, CONTENT_PLATFORMS } from '../shared/content-generator.js';
import { buildAllLinks } from '../shared/utm.js';

const STORAGE_KEY = 'applauncher-apps';
const IS_GITHUB_PAGES = location.hostname.endsWith('github.io');

const appsBase = IS_GITHUB_PAGES ? '../data/apps/' : '/apps/';
const configUrl = IS_GITHUB_PAGES ? '../data/config/launcher.json' : '/config/launcher.json';
const landingBasePath = IS_GITHUB_PAGES ? '..' : '/docs';

/** @type {Record<string, object>} */
let apps = {};
/** @type {object} */
let config = { siteBaseUrl: 'https://waynebuckley1980.github.io/app-launcher', defaultCampaign: 'launch', defaultMedium: 'social' };
/** @type {Array<{filename: string, content: string}>} */
let generatedContent = [];
let selectedPlatformIndex = 0;

const $ = (sel) => document.querySelector(sel);
const appSelect = $('#app-select');
const form = $('#app-form');

async function loadConfig() {
  try {
    const res = await fetch(configUrl);
    if (res.ok) config = await res.json();
  } catch {
    /* use defaults */
  }
}

async function loadRegistryApps() {
  try {
    const res = await fetch(`${appsBase}index.json`);
    if (!res.ok) return;
    const slugs = await res.json();
    for (const slug of slugs) {
      if (apps[slug]) continue;
      try {
        const appRes = await fetch(`${appsBase}${slug}.json`);
        if (appRes.ok) apps[slug] = await appRes.json();
      } catch {
        /* skip */
      }
    }
  } catch {
    /* offline or local without server */
  }
}

function loadLocalApps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const local = JSON.parse(raw);
      apps = { ...apps, ...local };
    }
  } catch {
    /* ignore */
  }
}

function saveLocalApps() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function appToForm(app) {
  const bullets = app.marketing?.featureBullets || [];
  const keywords = app.listing?.keywords || [];
  return {
    appName: app.appName || '',
    id: app.id || '',
    problem: app.problem || '',
    targetAudience: app.targetAudience || '',
    differentiator: app.differentiator || '',
    geography: app.geography || '',
    subtitle: app.listing?.subtitle || '',
    shortDescription: app.listing?.shortDescription || '',
    keywords: keywords.join(', '),
    featureBullets: bullets.join('\n'),
    monetization: app.monetization || 'paid',
    priceGBP: app.priceGBP ?? '',
    appStoreUrl: app.apple?.appStoreUrl || '',
    playStoreUrl: app.google?.playStoreUrl || '',
    androidLive: app.google?.liveOnStore === true,
    landingPageUrl: app.marketing?.landingPageUrl || '',
    footerLine: app.marketing?.footerLine || '',
  };
}

function formToApp() {
  const fd = new FormData(form);
  const id = (fd.get('id') || slugify(fd.get('appName'))).toString().trim();
  const keywords = fd
    .get('keywords')
    .toString()
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const featureBullets = fd
    .get('featureBullets')
    .toString()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const priceRaw = fd.get('priceGBP');
  const priceGBP = priceRaw ? parseFloat(priceRaw) : undefined;

  const appStoreUrl = fd.get('appStoreUrl')?.toString().trim();
  const playStoreUrl = fd.get('playStoreUrl')?.toString().trim();
  const androidLive = fd.get('androidLive') === 'on';

  let landingPageUrl = fd.get('landingPageUrl')?.toString().trim();
  if (!landingPageUrl) {
    landingPageUrl = `${config.siteBaseUrl.replace(/\/$/, '')}/${id}/`;
  }

  return {
    id,
    appName: fd.get('appName').toString().trim(),
    repoPath: `../${id}`,
    status: 'live',
    problem: fd.get('problem').toString().trim(),
    targetAudience: fd.get('targetAudience').toString().trim(),
    differentiator: fd.get('differentiator').toString().trim(),
    geography: fd.get('geography').toString().trim(),
    monetization: fd.get('monetization').toString(),
    ...(priceGBP != null && !Number.isNaN(priceGBP) ? { priceGBP } : {}),
    listing: {
      subtitle: fd.get('subtitle').toString().trim(),
      shortDescription: fd.get('shortDescription').toString().trim(),
      keywords,
    },
    apple: appStoreUrl
      ? { appStoreUrl, bundleId: '' }
      : undefined,
    google: playStoreUrl
      ? { playStoreUrl, packageName: '', liveOnStore: androidLive }
      : undefined,
    marketing: {
      landingPageUrl,
      featureBullets,
      footerLine: fd.get('footerLine').toString().trim(),
      primaryChannels: ['reddit', 'facebook-groups'],
      accountStrategy: 'developer-brand',
    },
  };
}

function fillForm(app) {
  const data = appToForm(app);
  for (const [key, value] of Object.entries(data)) {
    const el = form.elements.namedItem(key);
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = Boolean(value);
    else el.value = value ?? '';
  }
}

function refreshAppSelect() {
  const current = appSelect.value;
  appSelect.innerHTML = '';
  const slugs = Object.keys(apps).sort();
  if (slugs.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '— New app —';
    appSelect.appendChild(opt);
    return;
  }
  for (const slug of slugs) {
    const opt = document.createElement('option');
    opt.value = slug;
    opt.textContent = apps[slug].appName || slug;
    appSelect.appendChild(opt);
  }
  if (current && apps[current]) appSelect.value = current;
  else appSelect.value = slugs[0];
}

function getCurrentApp() {
  return formToApp();
}

function generateAll() {
  const app = getCurrentApp();
  if (!app.appName || !app.id) {
    alert('Enter at least an app name and slug.');
    return;
  }
  apps[app.id] = app;
  saveLocalApps();
  refreshAppSelect();
  appSelect.value = app.id;

  generatedContent = generateContentFiles(app, config);
  selectedPlatformIndex = 0;
  renderContent();
  renderLinks(app);
  renderLanding(app);
  showToast('Posts & links generated');
}

function renderContent() {
  const pills = $('#platform-pills');
  pills.innerHTML = '';
  generatedContent.forEach((item, i) => {
    const meta = CONTENT_PLATFORMS.find((p) => p.file === item.filename);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pill${i === selectedPlatformIndex ? ' active' : ''}`;
    btn.textContent = meta?.label || item.filename;
    btn.addEventListener('click', () => {
      selectedPlatformIndex = i;
      renderContent();
    });
    pills.appendChild(btn);
  });

  const item = generatedContent[selectedPlatformIndex];
  if (item) {
    $('#content-label').textContent = item.filename;
    $('#content-output').value = item.content;
  } else {
    $('#content-label').textContent = 'Generate posts first';
    $('#content-output').value = 'Fill in app details and click "Generate posts & links".';
  }
}

function renderLinks(app) {
  const list = $('#links-list');
  list.innerHTML = '';
  const links = buildAllLinks(app, config);
  for (const row of links) {
    const div = document.createElement('div');
    div.className = 'link-row';
    div.innerHTML = `
      <strong>${row.label}</strong>
      <code>${row.landing}</code>
      <button type="button" class="btn btn-secondary copy-link" data-url="${encodeURIComponent(row.landing)}">Copy</button>
    `;
    list.appendChild(div);
  }
  list.querySelectorAll('.copy-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      copyText(decodeURIComponent(btn.dataset.url));
    });
  });
}

function renderLanding(app) {
  const url = app.marketing?.landingPageUrl || `${config.siteBaseUrl}/${app.id}/`;
  const localPreview = `${landingBasePath}/${app.id}/index.html`;
  $('#landing-open').href = IS_GITHUB_PAGES ? `../${app.id}/` : url;
  $('#landing-preview').src = localPreview;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 2000);
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${name}`);
  });
}

function newApp() {
  form.reset();
  form.elements.namedItem('id').value = '';
  form.elements.namedItem('monetization').value = 'paid';
  generatedContent = [];
  renderContent();
  $('#links-list').innerHTML = '<p class="panel-intro">Generate posts first.</p>';
}

function saveApp() {
  const app = getCurrentApp();
  if (!app.id || !app.appName) {
    alert('App name and slug required.');
    return;
  }
  apps[app.id] = app;
  saveLocalApps();
  refreshAppSelect();
  appSelect.value = app.id;
  showToast('Saved in this browser');
}

function downloadJson() {
  const app = getCurrentApp();
  const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${app.id || 'app'}.json`;
  a.click();
}

function onAppSelectChange() {
  const slug = appSelect.value;
  if (slug && apps[slug]) {
    fillForm(apps[slug]);
    generatedContent = generateContentFiles(apps[slug], config);
    selectedPlatformIndex = 0;
    renderContent();
    renderLinks(apps[slug]);
    renderLanding(apps[slug]);
  }
}

async function init() {
  await loadConfig();
  await loadRegistryApps();
  loadLocalApps();
  refreshAppSelect();

  const first = appSelect.value;
  if (first && apps[first]) {
    fillForm(apps[first]);
    generatedContent = generateContentFiles(apps[first], config);
    renderContent();
    renderLinks(apps[first]);
    renderLanding(apps[first]);
  } else if (Object.keys(apps).length === 0) {
    newApp();
  }

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  appSelect.addEventListener('change', onAppSelectChange);
  $('#btn-generate').addEventListener('click', generateAll);
  $('#btn-save-app').addEventListener('click', saveApp);
  $('#btn-new-app').addEventListener('click', newApp);
  $('#btn-download-json').addEventListener('click', downloadJson);
  $('#btn-copy-content').addEventListener('click', () => {
    copyText($('#content-output').value);
  });

  form.addEventListener('input', () => {
    /* optional live regen — keep manual for performance */
  });
}

init();
