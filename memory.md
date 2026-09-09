# VD BARRISOL Memory

Last updated: 2026-09-09

## Beta Audit Update

`BETA_AUDIT.md` supersedes the earlier phase-completion claims. The source plan still defines scope. New code requires the beta-completion and focal-point migrations before deployment. Public pricing is approval-gated; existing projects become draft and testimonials unapproved pending owner review. Never publish the example fixtures as verified work. User already has an admin and explicitly wants the legal name/CUI visible. Future hosting is an owner-operated server, not necessarily Hetzner; see `SELF_HOSTING.md`.

## Current Planning Source

- `VD_BARRISOL_BETA_PLAN.md` is the authoritative plan for the alpha-to-beta work.
- It is based on a source review and visual evidence captured on 2026-09-09. Findings marked as observed still need verification against the current checkout before implementation.
- Execute one phase at a time, starting with Phase 0. Do not treat historical checks as current verification.
- The beta stays on Vercel, Neon, and Digi. Future self-hosting is Phase 8 and is outside the beta release.
- Motion is the selected animation direction in the plan. Do not install or implement it until the Phase 0/Phase 1 baseline and UI decisions justify it.

## Working Rules

- Do not be a yes-man. Push back on choices that hurt quality, SEO, performance, maintainability, or brand trust.
- Treat the project like collaboration between two friends: direct, practical, and constructive.
- Keep implementation decisions documented before building.
- Prefer a curated CMS over a freeform visual builder. Payload should control content and business settings; code should control layout and design quality.

## Brand Facts

- Brand name: VD BARRISOL.
- Domain target: vdbarrisol.ro, not purchased yet.
- Business: premium ceiling firm.
- Main service area: Constanta and nearby localities.
- Service locations from Facebook: Mamaia-Sat, Comuna Valu lui Traian, Constanta, Mamaia, Comuna Cumpana, Navodari, Comuna Agigea, Lazu, Mangalia, Murfatlar.
- Site languages: Romanian and English.
- Brand colors known now: orange and black.
- Full palette:
  - Warm neutral: `#E9E3DF`
  - Orange: `#FF7A30`
  - Blue: `#465C88`
  - Black: `#000000`
- Public phone: `0793 124 425`.
- Public email: `vdbarrisol@gmail.com`.
- WhatsApp number: `40793124425`.
- Facebook: `https://www.facebook.com/p/VD-Barrisol-61564327003788/`.
- Instagram: `https://www.instagram.com/vd_barrisol/`.
- Contact details and social links are managed from Payload.
- WhatsApp CTA should open a direct WhatsApp conversation link.

## Content Model Notes

- Landing page sections:
  - Hero with rotating project photos.
  - Estimate calculator based primarily on square meters.
  - Contact details / CTA.
- Gallery page:
  - Past work projects.
  - Testimonials in article/editorial style.
- About page:
  - Company story, positioning, trust details, service area.
- Footer:
  - Links and sections editable from Payload.

## Calculator Notes

- Currency display: RON and EUR.
- Prices must be clearly marked approximate.
- Pricing rules must be editable from Payload.
- VAT/tax handling is still unclear and must be confirmed.
- Calculator should be implemented in TypeScript, not Python, unless future requirements demand a separate compute service.

## Media Notes

- Images will be uploaded from Payload.
- Initial storage target: Digi private storage / FTP-style storage.
- Future storage target: Hetzner VPS.
- Store stable app URLs in Payload and keep storage-provider internals abstracted.
- Do not expose temporary private storage links directly as public canonical media URLs.

## Logo Notes

- User provided a low-resolution raster logo in chat.
- A planning-only AI upscale was generated at `assets/brand/vd-barrisol-logo-upscaled-planning.png`.
- A transparent PNG derived from the upscale exists at `public/brand/vd-barrisol-logo-transparent.png`.
- The upscale is not exact enough for final production branding. It should not be treated as the final logo.
- Preferred final input: original SVG, PDF, AI, EPS, or large transparent PNG.
- If no original exists, redraw/vectorize manually and get explicit approval before using it as the production logo.

## Build Notes

- Public fallback images are generated placeholders in `public/placeholders`.
- These placeholders are not a substitute for real VD BARRISOL project photos before launch.
- Local build requires `PAYLOAD_SECRET` even when using fallback content because Payload API routes import the config during production page-data collection.
- Public pages use polished draft copy for the private demo, but real project photos and testimonials are still required before public launch.
- Neon was baselined with `20260606_140813_initial` after `migrate:fresh`; do not use dynamic dev schema pushes as the production source of truth.
- Added migration `20260606_153216_add_company_contact_fields` for Facebook, Instagram, legal/company fields, and service cities.

## Next Demo Requirements

- The owner already created the first Payload admin user; verify access rather than creating another account.
- Confirm seeded `Site Settings` values: phone, email, WhatsApp, Facebook, Instagram, service cities, `VD BARRISOL S.R.L.`, and `CUI 51496619`.
- Replace generated/placeholder images with real VD BARRISOL project photos.
- Review basic privacy and cookie pages before sharing the site publicly.
