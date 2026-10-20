# Freq — Don’t just watch. Pull up.

Bold live-entertainment landing revision, October 20, 2026. This supersedes the cream editorial design rejected by the owner.

## Direction

Dark ink, coral and electric blue. Oversized Barlow condensed typography. A large illustrated live-room concept switches between music, gaming and conversation. No generated faces, fake people, fabricated viewer counts, testimonials or live broadcasts. Concept status and prelaunch status remain explicit. The decorative record/equalizer animation is pausable and automatically disabled for reduced-motion preferences.

## Build and test

`node scripts/build.mjs` builds the production `index.html`.
`node scripts/build.mjs --portable` builds a self-contained `Freq-Design-Review.html`.
`node --check src/app.js`, `node tests/check-interactions.cjs` and `python3 tests/check-static.py` validate the implementation. Tests mock all submissions. Never submit synthetic email addresses to the real form.

Source is in `src/`; production publishes `index.html` and `assets/`. Manrope and Barlow font licenses are bundled. The social image contains original typography/graphics only. No imagegen portraits or stock imagery are used.

## Preserved integrations

- Repository: https://github.com/CamLewis2k/freq-landing
- Vercel project: prj_g2IJPI69OnBCqKL57axDVp8RXvae
- Live URL: https://www.getfreq.app/
- Original Mailchimp audience, form action, honeypot and callback-confirmed states.
- Existing Instagram and TikTok links.
- No credentials, access settings, analytics, DNS, native-app or private-pilot changes.

The room selector is a local design preview only. It does not connect to a stream, send requests to creators, create accounts or store preferences.

## Baseline and rollback

This revision starts from production commit `4d18edf187c2872d77c23f83aed158907dab631a`, deployment `dpl_4E3piu6YusvPtZNQ3eBMZcEyjvFk`. The older midnight/violet portrait design remains in commit `09cd51df971bbb43c036bac031b7826a2faac111`, deployment `dpl_BPsUHb8v5bGsqUwnHZcE4SgKEuuy`.

Use the existing authenticated Vercel default scope and exact project ID. Existing preview deployments require login; do not alter protection. Browser QA and final deployment identity are reported in the release conversation. Production-first visual verification is authorized because the supported cloud browser cannot reach the local executor and preview SSO is retained.
