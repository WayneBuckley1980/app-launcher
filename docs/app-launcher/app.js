import { generateContentFiles, CONTENT_PLATFORMS } from '../shared/content-generator.js';
import { buildAllLinks } from '../shared/utm.js';

const STORAGE_KEY = 'applauncher-apps';
const ACTIVE_KEY = 'applauncher-active-slug';
const IS_GITHUB_PAGES = location.hostname.endsWith('github.io');

const appsBase = IS_GITHUB_PAGES ? '../data/apps/' : '/apps/';
const configUrl = IS_GITHUB_PAGES ? '../data/config/launcher.json' : '/config/launcher.json';
const landingBasePath = IS_GITHUB_PAGES ? '..' : '/docs';

/** @type {Record<string, object>} */
let registryApps = {};
/** @type {Record<string, object>} */
let apps = {};
/** @type {object} */
let config = {
  siteBaseUrl: 'https://waynebuckley1980.github.io/app-launcher',
  defaultCampaign: 'launch',
  defaultMedium: 'social',
};

/** @type {Array<{filename: string, content: string}>} */
let generatedContent = [];
let selectedPlatformIndex = 0;
/** @type {string | null} */
let activeSlug = null;
let isNewAppDraft = false;

const $ = (sel) => document.querySelector(sel);
const form = $('#app-form');
const appListEl = $('#app-list');

function deepMergeApp(base = {}, override = {}) {
  return {
    ...base,
    ...override,
    listing: { ...base.listing, ...override.listing },
    marketing: { ...base.marketing, ...override.marketing },
    apple: override.apple !== undefined ? { ...base.apple, ...override.apple } : base.apple,
    google: override.google !== undefined ? { ...base.google, ...override.google } : base.google,
  };
}

function isAppUsable(app) {
  return Boolean(app?.appName?.trim() && app?.id?.trim());
}

function hasMeaningfulDetails(app) {
  return Boolean(
    app?.problem?.trim() ||
      app?.targetAudience?.trim() ||
      app?.differentiator?.trim() ||
      app?.marketing?.featureBullets?.length
  );
}

async function loadConfig() {
  try {
    const res = await fetch(configUrl);
    if (res.ok) config = await res.json();
  } catch {
    /* defaults */
  }
}

async function loadRegistryApps() {
  registryApps = {};
  try {
    const res = await fetch(`${appsBase}index.json`);
    if (!res.ok) return;
    const slugs = await res.json();
    for (const slug of slugs) {
      try {
        const appRes = await fetch(`${appsBase}${slug}.json`);
        if (appRes.ok) registryApps[slug] = await appRes.json();
      } catch {
        /* skip */
      }
    }
  } catch {
    /* offline */
  }
}

function loadSavedApps() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function buildAppsState() {
  const saved = loadSavedApps();
  apps = { ...registryApps };

  for (const slug of Object.keys(saved)) {
    const reg = registryApps[slug] || {};
    const local = saved[slug] || {};
    if (hasMeaningfulDetails(local) || !registryApps[slug]) {
      apps[slug] = deepMergeApp(reg, local);
    } else if (hasMeaningfulDetails(reg)) {
      apps[slug] = reg;
    } else {
      apps[slug] = deepMergeApp(reg, local);
    }
  }
}

function saveAppsToStorage() {
  const saved = {};
  for (const slug of Object.keys(apps)) {
    if (hasMeaningfulDetails(apps[slug]) || !registryApps[slug]) {
      saved[slug] = apps[slug];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function emptyAppTemplate() {
  return {
    appName: '',
    id: '',
    problem: '',
    targetAudience: '',
    differentiator: '',
    geography: '',
    listing: { subtitle: '', shortDescription: '', keywords: [] },
    marketing: { featureBullets: [], footerLine: '', landingPageUrl: '' },
    monetization: 'paid',
    priceGBP: '',
    apple: { appStoreUrl: '' },
    google: { playStoreUrl: '', liveOnStore: false },
  };
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
  const id = (fd.get('id') || slugify(fd.get('appName') || '')).toString().trim();
  const keywords = fd
    .get('keywords')
    ?.toString()
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean) || [];
  const featureBullets = fd
    .get('featureBullets')
    ?.toString()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean) || [];

  const priceRaw = fd.get('priceGBP')?.toString().trim();
  const priceGBP = priceRaw ? parseFloat(priceRaw) : undefined;

  const appStoreUrl = fd.get('appStoreUrl')?.toString().trim() || '';
  const playStoreUrl = fd.get('playStoreUrl')?.toString().trim() || '';
  const androidLive = fd.get('androidLive') === 'on';

  let landingPageUrl = fd.get('landingPageUrl')?.toString().trim() || '';
  if (!landingPageUrl && id) {
    landingPageUrl = `${config.siteBaseUrl.replace(/\/$/, '')}/${id}/`;
  }

  const existing = apps[activeSlug] || registryApps[activeSlug] || {};

  return deepMergeApp(existing, {
    id,
    appName: fd.get('appName')?.toString().trim() || '',
    repoPath: existing.repoPath || `../${id}`,
    status: existing.status || 'development',
    liveOnStore: existing.liveOnStore,
    problem: fd.get('problem')?.toString().trim() || '',
    targetAudience: fd.get('targetAudience')?.toString().trim() || '',
    differentiator: fd.get('differentiator')?.toString().trim() || '',
    geography: fd.get('geography')?.toString().trim() || '',
    monetization: fd.get('monetization')?.toString() || 'paid',
    ...(priceGBP != null && !Number.isNaN(priceGBP) ? { priceGBP } : {}),
    listing: {
      subtitle: fd.get('subtitle')?.toString().trim() || '',
      shortDescription: fd.get('shortDescription')?.toString().trim() || '',
      keywords,
    },
    apple: appStoreUrl ? { ...existing.apple, appStoreUrl } : existing.apple,
    google: playStoreUrl
      ? { ...existing.google, playStoreUrl, liveOnStore: androidLive }
      : existing.google,
    marketing: {
      ...existing.marketing,
      landingPageUrl,
      featureBullets,
      footerLine: fd.get('footerLine')?.toString().trim() || '',
      primaryChannels: existing.marketing?.primaryChannels || ['reddit', 'facebook-groups'],
      accountStrategy: existing.marketing?.accountStrategy || 'developer-brand',
    },
  });
}

function setField(name, value) {
  const el = form.elements.namedItem(name);
  if (!el) return;
  if (el instanceof RadioNodeList) return;
  if (el.type === 'checkbox') {
    el.checked = Boolean(value);
  } else {
    el.value = value ?? '';
  }
}

function fillForm(app) {
  const data = appToForm(app || emptyAppTemplate());
  for (const [key, value] of Object.entries(data)) {
    setField(key, value);
  }
}

function refreshAppList() {
  appListEl.innerHTML = '';
  const slugs = Object.keys(apps).sort((a, b) =>
    (apps[a].appName || a).localeCompare(apps[b].appName || b)
  );

  if (slugs.length === 0) {
    appListEl.innerHTML = '<p class="app-list-empty">No apps yet — add one below.</p>';
    return;
  }

  for (const slug of slugs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `app-list-item${slug === activeSlug && !isNewAppDraft ? ' active' : ''}`;
    btn.dataset.slug = slug;
    btn.innerHTML = `
      <span class="app-list-name">${escapeHtml(apps[slug].appName || slug)}</span>
      <span class="app-list-slug">${escapeHtml(slug)}</span>
    `;
    btn.addEventListener('click', () => selectApp(slug));
    appListEl.appendChild(btn);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function refreshGeneratedForApp(app) {
  if (!isAppUsable(app)) {
    generatedContent = [];
    renderContent();
    $('#links-list').innerHTML = '<p class="panel-intro">Save app details first, then generate.</p>';
    return;
  }
  generatedContent = generateContentFiles(app, config);
  selectedPlatformIndex = 0;
  renderContent();
  renderLinks(app);
  renderLanding(app);
}

function selectApp(slug) {
  if (!apps[slug]) return;

  isNewAppDraft = false;
  activeSlug = slug;
  localStorage.setItem(ACTIVE_KEY, slug);

  fillForm(apps[slug]);
  refreshAppList();
  refreshGeneratedForApp(apps[slug]);
}

function startNewApp() {
  isNewAppDraft = true;
  activeSlug = null;
  localStorage.removeItem(ACTIVE_KEY);
  fillForm(emptyAppTemplate());
  refreshAppList();
  generatedContent = [];
  renderContent();
  $('#links-list').innerHTML = '<p class="panel-intro">Fill in details and save your new app.</p>';
  $('#landing-preview').src = 'about:blank';
  switchTab('details');
}

function saveApp() {
  const app = formToApp();
  if (!app.appName || !app.id) {
    alert('App name and slug are required.');
    return;
  }

  const slug = app.id;
  const wasNew = isNewAppDraft || slug !== activeSlug;

  apps[slug] = app;
  activeSlug = slug;
  isNewAppDraft = false;

  saveAppsToStorage();
  localStorage.setItem(ACTIVE_KEY, slug);

  refreshAppList();
  fillForm(apps[slug]);
  showToast('App saved');
}

function generateAll() {
  const app = formToApp();
  if (!app.appName || !app.id) {
    alert('Enter an app name and slug first.');
    return;
  }

  apps[app.id] = app;
  activeSlug = app.id;
  isNewAppDraft = false;
  saveAppsToStorage();
  localStorage.setItem(ACTIVE_KEY, app.id);

  refreshAppList();
  fillForm(apps[app.id]);

  generatedContent = generateContentFiles(app, config);
  selectedPlatformIndex = 0;
  renderContent();
  renderLinks(app);
  renderLanding(app);
  showToast('Posts & links generated (app saved)');
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
    $('#content-label').textContent = 'No posts yet';
    $('#content-output').value =
      'Fill in app details, click Save app, then Generate posts & links.';
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
    btn.addEventListener('click', () => copyText(decodeURIComponent(btn.dataset.url)));
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
  setTimeout(() => {
    t.hidden = true;
  }, 2000);
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${name}`);
  });
}

function downloadJson() {
  const app = activeSlug ? apps[activeSlug] : formToApp();
  if (!app?.id) {
    alert('Save the app first.');
    return;
  }
  const blob = new Blob([JSON.stringify(app, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${app.id}.json`;
  a.click();
}

async function init() {
  await loadConfig();
  await loadRegistryApps();
  buildAppsState();

  const savedActive = localStorage.getItem(ACTIVE_KEY);
  if (savedActive && apps[savedActive]) {
    selectApp(savedActive);
  } else {
    const first = Object.keys(apps).sort()[0];
    if (first) selectApp(first);
    else startNewApp();
  }

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  $('#btn-generate').addEventListener('click', generateAll);
  $('#btn-save-app').addEventListener('click', saveApp);
  $('#btn-new-app').addEventListener('click', startNewApp);
  $('#btn-download-json').addEventListener('click', downloadJson);
  $('#btn-copy-content').addEventListener('click', () => copyText($('#content-output').value));
}

init();
