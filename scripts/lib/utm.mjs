export function buildUtmParams({ source, medium, campaign, content }) {
  const params = new URLSearchParams();
  if (source) params.set('utm_source', source);
  if (medium) params.set('utm_medium', medium);
  if (campaign) params.set('utm_campaign', campaign);
  if (content) params.set('utm_content', content);
  return params;
}

export function appendQuery(url, params) {
  const u = new URL(url);
  for (const [key, value] of params.entries()) {
    u.searchParams.set(key, value);
  }
  return u.toString();
}

/** Landing page URL with UTM params for page-level attribution */
export function buildLandingUrl(baseUrl, utm) {
  const params = buildUtmParams(utm);
  const qs = params.toString();
  const sep = baseUrl.includes('?') ? '&' : '?';
  return qs ? `${baseUrl}${sep}${qs}` : baseUrl;
}

/**
 * Google Play supports referrer param for install attribution.
 * @see https://developer.android.com/distribute/marketing-tools/linking
 */
export function buildPlayStoreUrl(playStoreUrl, utm) {
  const referrerParts = [];
  if (utm.source) referrerParts.push(`utm_source=${encodeURIComponent(utm.source)}`);
  if (utm.medium) referrerParts.push(`utm_medium=${encodeURIComponent(utm.medium)}`);
  if (utm.campaign) referrerParts.push(`utm_campaign=${encodeURIComponent(utm.campaign)}`);
  if (utm.content) referrerParts.push(`utm_content=${encodeURIComponent(utm.content)}`);

  const referrer = referrerParts.join('&');
  const u = new URL(playStoreUrl);
  if (referrer) u.searchParams.set('referrer', referrer);
  return u.toString();
}

/**
 * App Store public URL. Apple attributes installs via App Store Connect
 * Sources / Campaigns — UTM on the web landing page is the main web funnel signal.
 */
export function buildAppStoreUrl(appStoreUrl, utm) {
  const params = buildUtmParams({
    source: utm.source,
    medium: utm.medium,
    campaign: utm.campaign,
    content: utm.content,
  });
  return appendQuery(appStoreUrl, params);
}

export function formatLinkBundle({ appName, landing, ios, android, utm }) {
  const lines = [
    `# Tracked links — ${appName}`,
    '',
    `Source: ${utm.source} · Campaign: ${utm.campaign} · Medium: ${utm.medium}`,
    '',
    '## Landing page (share this in posts)',
    landing,
    '',
  ];

  if (ios) {
    lines.push('## App Store (direct)', ios, '');
  }
  if (android) {
    lines.push('## Google Play (direct)', android, '');
  }

  lines.push(
    '## Tips',
    '- Prefer the **landing page** link in Reddit, Facebook, and email — it works on all devices.',
    '- Check App Store Connect → Analytics → Sources after a few days.',
    '- Play Console → User acquisition shows referrer data from Android links.',
    ''
  );

  return lines.join('\n');
}
