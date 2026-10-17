# Freq — Your other world is live.

A new website direction for getfreq.app, prepared in its existing GitHub/Vercel repository.

## October 16 direction

The user rejected the green identity and asked for an immersive, fun escape built around live creators, with a simple experience. This version uses midnight blue, lavender, coral and peach, original creator artwork, and room-shaped portals. Its headline is “Your other world is live.”

The page has one primary action: join the existing waitlist. Three sample rooms introduce music, gaming and conversation. Each room demonstrates an optional two-choice interaction and a device-local follow. No mood filters, memberships, gifts, paid tiers, earnings dashboards or fabricated audience counts appear. All creators and interactions are explicitly fictional previews; live broadcasting is not connected.

## Files and build

- `src/index.template.html`: page content and accessible structure.
- `src/styles.css`: responsive visual system; reduced-motion support.
- `src/app.js`: room dialog, sample choice, local follows, and Mailchimp submission.
- `assets/creator-worlds-v3.webp`: optimized original imagegen triptych of fictional adult creators; `.jpg` is the social-sharing image.
- `scripts/build.mjs`: bundles page styles and behavior into root `index.html`, with separately cacheable artwork and fonts.

Run `node scripts/build.mjs` after editing source. No dependency installation is required. Publish `index.html` together with `assets/`. Font licenses are bundled in the page and retained in `assets/fonts`. For an optional standalone local preview, `node scripts/build.mjs --portable` writes `freq-preview.html`.

## Existing connections preserved

- GitHub: https://github.com/CamLewis2k/freq-landing
- Vercel: existing `freq-landing` project, team `camlewis2ks-projects` per the uploaded project brief. Verify current ownership and production branch through the connected service before publishing.
- Domain: https://www.getfreq.app/ — GoDaddy DNS remains unchanged.
- Mailchimp: original audience, form POST, honeypot and JSONP callback integration preserved.
- Instagram and TikTok: original profile links preserved.
- Earlier website favorites: retain `freq-web-tuned-v3` local-storage key and creator IDs.

Mailchimp success is shown only after a confirmed callback. The page handles rejection, duplicate signup, timeout and network failure. Without JavaScript, the original native form POST remains available. No real signup is submitted during verification.

## Publishing

GitHub and Vercel access were verified on October 16, 2026 (America/New_York).

- Vercel project ID: `prj_g2IJPI69OnBCqKL57axDVp8RXvae`.
- Verified account ID: `team_y3dZOECM1AWR6VcMzOBleBCi`.
- Production branch: `main`.
- Production domains: `www.getfreq.app` and `getfreq.app`.
- Previous production commit: `0d9c682c6f37dfc1806a1f2db1ffacc182f44fc4`.

The release uses the existing repository and project. The connector must use the exact project ID with its authenticated scope; explicitly passing the historical team slug returned HTTP 403 during the October 16 continuation. Check the exact deployment and its assigned domains before reporting a release as live. The GitHub connector has write access; shell Git authentication is separate. The Vercel connector resolves this project through its authenticated default scope and exact project ID.

Do not create a replacement hosting project or change DNS. Reconcile the current remote head before updating production; preserve unrelated changes and branch protections.

## October 16 continuation

- Recovered the saved rebuild and confirmed the original production commit, repository and custom domains.
- Converted the unchanged 1536×1024 artwork to WebP for the page and JPEG for social sharing. Initial page + image + font bytes fell from 2,602,113 to approximately 452,500 (about 83% smaller, before HTTP compression).
- Preserved the simple three-room concept and existing Mailchimp integration.
- Added artwork preload, allowed hero buttons to wrap on narrow screens, and improved mobile email-field and consent-text readability.

## Verification

Passed JavaScript syntax checks, the standalone build, HTML anchors/labels/unique-ID checks, CSS parsing, and 36 browserless assertions covering room navigation, sample choices, legacy follows, storage failure, and Mailchimp success/rejection/duplicate/network/timeout handling. No real signup or outbound request was sent during verification. Browser visual QA remains outstanding: the supported browser-control skill is unavailable in this managed environment. Mobile breakpoints are implemented but have not been visually verified for this revision.

## Artwork provenance

Built-in image generation produced an original 1536×1024 triptych of fictional adults: a Black male DJ, an East Asian woman gamer, and a Black woman conversation host. The prompt requested a friendly, immersive live-entertainment world with luminous arches, midnight blue, violet, coral and icy blue, natural expressions, no green and no typography or logos. CSS crops the panels for individual room portraits. The artwork does not imply endorsements, existing Freq creators or actual broadcasts. Previous artwork remains in the earlier local design commits.

## Separate native app

This repository is the marketing website. The Expo app is a separate project at `@getfreqapp/getfreqapp` (project ID `754053d7-f789-4cab-8dba-7f13de3e2b79`). This website change does not update its existing Expo preview.
