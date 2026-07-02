import { buildLandingUrl } from './utm.js';

export const CONTENT_PLATFORMS = [
  { id: 'reddit-post', label: 'Reddit', file: 'reddit-post.md' },
  { id: 'reddit-indie-dev', label: 'Reddit (indie dev)', file: 'reddit-indie-dev.md' },
  { id: 'facebook-group', label: 'Facebook', file: 'facebook-group.md' },
  { id: 'instagram-post-1', label: 'Instagram — launch', file: 'instagram-post-1.md' },
  { id: 'instagram-post-2', label: 'Instagram — story', file: 'instagram-post-2.md' },
  { id: 'instagram-post-3', label: 'Instagram — features', file: 'instagram-post-3.md' },
  { id: 'linkedin-post', label: 'LinkedIn', file: 'linkedin-post.md' },
  { id: 'twitter-post', label: 'X / Twitter', file: 'twitter-post.md' },
  { id: 'email-newsletter', label: 'Email', file: 'email-newsletter.md' },
];

export function buildContentContext(app, config, platform) {
  const landingBase =
    app.marketing?.landingPageUrl ||
    `${config.siteBaseUrl.replace(/\/$/, '')}/${app.id}/`;

  const link = buildLandingUrl(landingBase, {
    source: platform,
    medium: 'social',
    campaign: config.defaultCampaign || 'launch',
  });

  const features =
    app.marketing?.featureBullets?.length > 0
      ? app.marketing.featureBullets
      : [app.differentiator].filter(Boolean);

  const iosLive = Boolean(app.apple?.appStoreUrl);
  const androidLive = app.google?.liveOnStore === true && app.google?.playStoreUrl;

  let storeLine;
  if (iosLive && androidLive) storeLine = 'Available on iPhone and Android';
  else if (iosLive) storeLine = 'Available on iPhone (Android coming soon)';
  else if (androidLive) storeLine = 'Available on Android';
  else storeLine = 'Coming soon to app stores';

  let priceLine;
  switch (app.monetization) {
    case 'free':
      priceLine = 'Free download';
      break;
    case 'subscription':
      priceLine = 'Subscription app';
      break;
    case 'freemium':
      priceLine = 'Free with optional upgrades';
      break;
    default:
      priceLine =
        app.priceGBP != null
          ? `£${app.priceGBP.toFixed(2)} one-time — no subscription`
          : 'One-time purchase';
  }

  const keywords = app.listing?.keywords || [];
  const hashtags = keywords
    .slice(0, 8)
    .map((k) => `#${k.replace(/\s+/g, '')}`)
    .join(' ');

  const audienceClean = (app.targetAudience || '').replace(/\.\s*$/, '');

  return {
    appName: app.appName,
    slug: app.id,
    problem: app.problem || '',
    audience: audienceClean,
    differentiator: app.differentiator || '',
    subtitle: app.listing?.subtitle || app.listing?.shortDescription || '',
    shortDescription: app.listing?.shortDescription || '',
    promotionalText: app.listing?.promotionalText || '',
    features,
    link,
    storeLine,
    priceLine,
    geography: app.geography || '',
    hashtags,
    footerNote: app.marketing?.footerLine || '',
    featureListMarkdown: features.map((f) => `- ${f}`).join('\n'),
    featureListPlain: features.map((f) => `• ${f}`).join('\n'),
  };
}

function header(ctx, platform, title) {
  const date = new Date().toISOString().slice(0, 10);
  return `# ${title}

**App:** ${ctx.appName} · **Platform:** ${platform} · **Generated:** ${date}

> Review and edit before posting. Replace anything in [brackets].

**Tracked link for this platform:**
${ctx.link}

---
`;
}

export function generateContentFiles(app, config) {
  const platforms = [
    ['reddit', generateReddit],
    ['reddit-indie', generateRedditIndie],
    ['facebook', generateFacebook],
    ['instagram-1', generateInstagram1],
    ['instagram-2', generateInstagram2],
    ['instagram-3', generateInstagram3],
    ['linkedin', generateLinkedIn],
    ['twitter', generateTwitter],
    ['email', generateEmail],
  ];

  return platforms.map(([platform, fn]) => {
    const ctx = buildContentContext(app, config, platform.split('-')[0]);
    return fn(ctx, platform);
  });
}

function generateReddit(ctx) {
  return {
    filename: 'reddit-post.md',
    content: `${header(ctx, 'Reddit', 'Reddit post — audience focus')}

## Title options

- ${ctx.problem.split('.')[0] || `Built ${ctx.appName} for ${ctx.audience.split(';')[0].trim()}`}
- I built a small app after struggling with: ${ctx.problem.split('—')[0].trim()}

## Post body

${ctx.problem}

I built **${ctx.appName}** for ${ctx.audience.toLowerCase()}.

${ctx.featureListPlain}

${ctx.priceLine}. ${ctx.storeLine}.

${ctx.footerNote ? `${ctx.footerNote}\n\n` : ''}Link: ${ctx.link}

Happy to answer questions. If self-promo isn't allowed here, mods please remove — not trying to spam.

## Tips

- Personalise the opening — add your own story
- Post in one subreddit first; wait a few days before cross-posting
- Read sub rules before posting
`,
  };
}

function generateRedditIndie(ctx) {
  return {
    filename: 'reddit-indie-dev.md',
    content: `${header(ctx, 'Reddit (r/sideproject)', 'Reddit post — indie dev angle')}

## Title

Launched ${ctx.appName} — ${ctx.subtitle || ctx.shortDescription}

## Post body

I shipped **${ctx.appName}** — ${ctx.shortDescription || ctx.problem}

**Problem:** ${ctx.problem}

**What it does:**
${ctx.featureListMarkdown}

**Pricing:** ${ctx.priceLine}

**Where I'm at:** Early marketing — trying to learn what messaging works before scaling.

**Link:** ${ctx.link}

Would love feedback from anyone who's marketed a niche app:
- One community at a time, or several?
- Landing page vs direct App Store link?

Thanks!
`,
  };
}

function generateFacebook(ctx) {
  return {
    filename: 'facebook-group.md',
    content: `${header(ctx, 'Facebook groups', 'Facebook group post')}

## Post (keep it short)

${ctx.subtitle || ctx.appName} — ${ctx.shortDescription}

${ctx.featureListPlain}

${ctx.priceLine}. ${ctx.storeLine}.

${ctx.link}

${ctx.footerNote ? `\n${ctx.footerNote}` : ''}

## Tips

- Ask group admins before posting links if unsure
- UK groups work well if geography is ${ctx.geography || 'local'}
`,
  };
}

function generateInstagram1(ctx) {
  return {
    filename: 'instagram-post-1.md',
    content: `${header(ctx, 'Instagram', 'Instagram caption — launch')}

## Caption

${ctx.subtitle || ctx.appName} is live 🎉

${ctx.shortDescription}

${ctx.featureListPlain}

${ctx.priceLine}
${ctx.storeLine}
Link in bio 👆 or: ${ctx.link}

${ctx.hashtags}

## Image ideas

- App screenshot: home screen / main feature
- Text overlay: "${ctx.subtitle || ctx.appName}"
- Story: swipe-up or link sticker to landing page
`,
  };
}

function generateInstagram2(ctx) {
  return {
    filename: 'instagram-post-2.md',
    content: `${header(ctx, 'Instagram', 'Instagram caption — problem/solution')}

## Caption

${ctx.problem.split('.')[0]}.

That's why I built ${ctx.appName}.

${ctx.features[0] || ctx.differentiator}
${ctx.features[1] || ''}

${ctx.link}

${ctx.hashtags}

## Image ideas

- Before/after: generic app vs your app's main screen
- Carousel slide 1: the problem · slide 2–3: features · slide 4: CTA
`,
  };
}

function generateInstagram3(ctx) {
  return {
    filename: 'instagram-post-3.md',
    content: `${header(ctx, 'Instagram', 'Instagram caption — feature highlight')}

## Caption

3 things ${ctx.appName} does well:

1️⃣ ${ctx.features[0] || 'Core feature one'}
2️⃣ ${ctx.features[1] || 'Core feature two'}
3️⃣ ${ctx.features[2] || 'Core feature three'}

${ctx.priceLine} · ${ctx.storeLine}

${ctx.link}

${ctx.hashtags}

## Reels idea (15–30 sec)

- Hook: state the problem your app solves
- Show app opening → main screen → key feature
- CTA: "Link in bio"
`,
  };
}

function generateLinkedIn(ctx) {
  return {
    filename: 'linkedin-post.md',
    content: `${header(ctx, 'LinkedIn', 'LinkedIn post')}

## Post

I built ${ctx.appName} — ${ctx.subtitle || ctx.shortDescription}

The problem: ${ctx.problem}

${ctx.differentiator}

Key features:
${ctx.featureListMarkdown}

${ctx.priceLine}. ${ctx.storeLine}.

Building is the easy part. Marketing a focused utility app is the real learning curve — sharing early in case it helps others in the indie app space.

${ctx.link}

#indieapp #mobileapp #buildinpublic
`,
  };
}

function generateTwitter(ctx) {
  return {
    filename: 'twitter-post.md',
    content: `${header(ctx, 'X / Twitter', 'X (Twitter) posts')}

## Post option 1 (short)

Shipped ${ctx.appName} — ${ctx.shortDescription}

${ctx.priceLine}
${ctx.link}

## Post option 2 (thread starter)

🧵 Why I built ${ctx.appName}

1/ ${ctx.problem}

2/ ${ctx.features[0] || ctx.differentiator}

3/ ${ctx.features[1] || 'More on the landing page'}

${ctx.link}
`,
  };
}

function generateEmail(ctx) {
  return {
    filename: 'email-newsletter.md',
    content: `${header(ctx, 'Email', 'Email / newsletter draft')}

## Subject lines

- I built ${ctx.appName} — ${ctx.subtitle || 'would love your feedback'}
- ${ctx.appName}: ${ctx.shortDescription}

## Body

Hi,

I've launched **${ctx.appName}** — ${ctx.problem.toLowerCase()}

It ${ctx.shortDescription?.toLowerCase() || 'helps with that'}:

${ctx.featureListMarkdown}

**${ctx.priceLine}** · ${ctx.storeLine}

Try it here: ${ctx.link}

I'd really appreciate if you shared it with anyone who fits: ${ctx.audience.toLowerCase()}

Thanks,
[Your name]

${ctx.footerNote ? `\n---\n${ctx.footerNote}` : ''}
`,
  };
}

export function generateIndexReadme(ctx, fileCount) {
  return `# Generated content — ${ctx.appName}\n\n${fileCount} drafts. Edit before posting.\n`;
}
