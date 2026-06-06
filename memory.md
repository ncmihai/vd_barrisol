# VD BARRISOL Memory

Last updated: 2026-06-06

## Working Rules

- Do not be a yes-man. Push back on choices that hurt quality, SEO, performance, maintainability, or brand trust.
- Treat the project like collaboration between two friends: direct, practical, and constructive.
- Keep implementation decisions documented before building.
- Prefer a curated CMS over a freeform visual builder. Payload should control content and business settings; code should control layout and design quality.

## Brand Facts

- Brand name: VD BARRISOL.
- Domain target: vdbarrisol.ro, not purchased yet.
- Business: premium ceiling firm.
- Main service area: Constanta.
- Wider service area: other cities in Romania.
- Site languages: Romanian and English.
- Brand colors known now: orange and black.
- Full palette:
  - Warm neutral: `#E9E3DF`
  - Orange: `#FF7A30`
  - Blue: `#465C88`
  - Black: `#000000`
- Contact details: phone, email, WhatsApp to be managed from Payload.
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

## Next Demo Requirements

- Create the first Payload admin user in production.
- Fill `Site Settings` with real phone, email, and WhatsApp number.
- Replace generated/placeholder images with real VD BARRISOL project photos.
- Review basic privacy and cookie pages before sharing the site publicly.
