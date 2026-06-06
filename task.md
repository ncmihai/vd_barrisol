# VD BARRISOL Task Tracker

Last updated: 2026-06-06

## Current Stage

Private content demo. The website is implemented, deployed on Vercel, and backed by Neon with an initial Payload migration baseline.

## Decisions Made

- [x] Brand name is VD BARRISOL.
- [x] Site will be Romanian and English.
- [x] Main service area is Constanta, with work across Romania.
- [x] Domain target is `vdbarrisol.ro`.
- [x] Stack target is Next.js + Payload CMS + Neon Postgres + Vercel.
- [x] Initial image storage target is Digi private storage / FTP-style storage.
- [x] Future storage target is Hetzner VPS.
- [x] Pricing calculator rules must be editable from Payload.
- [x] Contact submissions should both save in Payload and send email.
- [x] WhatsApp direct CTA is required.
- [x] Orange and black are current known brand colors.
- [x] Final palette is `#E9E3DF`, `#FF7A30`, `#465C88`, `#000000`.

## Open Questions

- [x] Confirm final brand palette.
- [ ] Get original logo file: SVG, PDF, AI, EPS, or high-resolution PNG.
- [ ] Confirm whether VAT should be shown, hidden, included, or configured per estimate.
- [ ] Define actual base pricing values.
- [ ] Define calculator options: material, lighting, complexity, perimeter, transport, minimum price.
- [ ] Confirm EUR conversion strategy: fixed editable rate or manually configured EUR prices.
- [x] Confirm email provider for lead notifications.
- [ ] Confirm final domain purchase and DNS ownership.
- [ ] Confirm whether project detail pages are needed now or later.
- [x] Confirm if legal pages are needed at launch: privacy, cookies.
- [x] Generate initial Payload migration after Neon `DATABASE_URL` is available.

## Planning Tasks

- [x] Create planning folder.
- [x] Save planning-only logo upscale.
- [x] Create `memory.md`.
- [x] Create `architecture.md`.
- [x] Create `task.md`.
- [x] Create `inspiration.md`.
- [x] Review Mereya implementation pieces to reuse before scaffolding.
- [x] Finalize initial CMS model.
- [x] Finalize initial calculator formula.
- [x] Finalize initial visual direction.

## Implementation Backlog

- [x] Scaffold Next.js + Payload project.
- [x] Configure Payload Postgres adapter.
- [x] Add locale routing for Romanian and English.
- [x] Add Payload globals.
- [x] Add Image Assets collection.
- [x] Add Projects collection.
- [x] Add Testimonials collection.
- [x] Add Leads collection.
- [x] Add Digi storage helper.
- [x] Add stable image route.
- [x] Add calculator engine and tests.
- [x] Add home page.
- [x] Add gallery page.
- [x] Add about page.
- [x] Add contact/lead flow.
- [x] Add sitemap and robots.
- [x] Add JSON-LD.
- [x] Add Vercel deployment configuration.
- [x] Add basic bilingual privacy and cookie pages.
- [x] Generate and apply initial Payload migration to Neon.
- [x] Replace public-facing fallback placeholder copy with private-demo draft copy.

## CMS Content Checklist

- [ ] Create first admin user at `/admin`.
- [ ] Add real public phone number.
- [ ] Add real public email.
- [ ] Add real WhatsApp number in international format, e.g. `407XXXXXXXX`.
- [ ] Upload final logo file when available.
- [ ] Upload real hero photos.
- [ ] Add at least 4 real projects with city, area, ceiling type, summary, and photos.
- [ ] Add real testimonials approved for public use.
- [ ] Confirm pricing values: base RON/mp, minimum price, lighting options, complexity multipliers, travel fees.
- [ ] Confirm VAT wording and calculator disclaimer.
- [ ] Review privacy/cookie pages before public launch.

## Verification

- [x] `npm run test:int`
- [x] `npm run lint`
- [x] `PAYLOAD_SECRET=local-build-secret npm run build`
- [x] `npm run payload migrate:status`

## Quality Bar

- The site should feel premium and practical, not like a generic construction template.
- The first screen must show the actual product/work clearly.
- The calculator must be honest about approximation.
- The CMS must be easy enough for a non-developer to update safely.
- Images must be compressed and dimensioned so the site is fast on mobile.
- The design should use orange/black carefully; avoid making the whole site one heavy orange/black block.
