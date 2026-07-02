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

export function buildLandingUrl(baseUrl, utm) {
  const params = buildUtmParams(utm);
  const qs = params.toString();
  const sep = baseUrl.includes('?') ? '&' : '?';
  return qs ? `${baseUrl}${sep}${qs}` : baseUrl;
}

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

export function buildAppStoreUrl(appStoreUrl, utm) {
  const params = buildUtmParams({
    source: utm.source,
    medium: utm.medium,
    campaign: utm.campaign,
    content: utm.content,
  });
  return appendQuery(appStoreUrl, params);
}

export const LINK_CHANNELS = [
  { id: 'reddit', label: 'Reddit' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'email', label: 'Email' },
];

export function buildAllLinks(app, config) {
  const landingBase =
    app.marketing?.landingPageUrl ||
    `${config.siteBaseUrl.replace(/\/$/, '')}/${app.id}/`;

  const utmBase = {
    medium: config.defaultMedium || 'social',
    campaign: config.defaultCampaign || 'launch',
  };

  return LINK_CHANNELS.map(({ id, label }) => {
    const utm = { ...utmBase, source: id };
    const landing = buildLandingUrl(landingBase, utm);
    return {
      id,
      label,
      landing,
      ios: app.apple?.appStoreUrl ? buildAppStoreUrl(app.apple.appStoreUrl, utm) : null,
      android:
        app.google?.liveOnStore === true && app.google?.playStoreUrl
          ? buildPlayStoreUrl(app.google.playStoreUrl, utm)
          : null,
    };
  });
}
