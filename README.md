# Freq — Live is better with company.

An editorial redesign of the existing getfreq.app landing page, October 20, 2026.

## Direction

Warm paper, dark ink, restrained violet and coral; large serif typography; an original typographic invitation; small line illustrations. No generated people, invented creators, testimonials, user counts, fake live rooms, or simulated social interactions. Music, gaming and conversation are framed as intended uses. Prelaunch status is explicit.

## Build

- `src/index.template.html`: accessible page content and metadata.
- `src/styles.css`: responsive layout, focus treatments, and reduced-motion support.
- `src/app.js`: existing Mailchimp waitlist with verified response states.
- `scripts/build.mjs`: dependency-free build.
- `assets/fonts/Manrope.ttf`: retained body font, with OFL license.
- `assets/freq-social.png`: new text-only social-sharing graphic, no stock or generated faces.

Run `node scripts/build.mjs` to write `index.html`. Run `node scripts/build.mjs --portable` for a self-contained `Freq-Design-Review.html` with embedded font. The portable file still uses the real Mailchimp waitlist: do not submit a test email to it.

Publish `index.html` and `assets/`. The existing GitHub/Vercel project and domain stay unchanged.

## Tests

Run `node --check src/app.js`, `node tests/check-interactions.cjs`, and `python3 tests/check-static.py`. Tests mock all network requests; no real signup is sent. They cover validation, honeypot, duplicate submission, callback identity, success, already-subscribed responses, provider failure, timeout, stale responses, and no-JavaScript form fallback. Browser QA is recorded separately in the release report.

## Preserved integrations

- Repository: https://github.com/CamLewis2k/freq-landing
- Vercel project: `prj_g2IJPI69OnBCqKL57axDVp8RXvae`
- Production: https://www.getfreq.app/
- Original Mailchimp form endpoint, audience IDs, and honeypot unchanged.
- Original Instagram and TikTok links unchanged.
- No analytics, credentials, new providers, DNS changes, or security setting changes.

## Release and rollback

This redesign begins from verified production commit `09cd51df971bbb43c036bac031b7826a2faac111` and deployment `dpl_BPsUHb8v5bGsqUwnHZcE4SgKEuuy`. The previous source remains recoverable through Git history. Use the authenticated Vercel default scope with the exact project ID; do not substitute a new hosting project. Existing preview URLs require Vercel login. Do not disable protection to test a preview.

The native Expo app and private live-pilot Site are separate projects and are not changed by this landing release.
