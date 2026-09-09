# VD BARRISOL Task Tracker

Last updated: 2026-09-09

## Authoritative Beta Plan

`VD_BARRISOL_BETA_PLAN.md` is now the source of truth for implementation planning. It supersedes older sequencing assumptions in this tracker, especially the immediate Hetzner migration and the earlier GSAP-first direction. The current execution order starts with Phase 0 baseline verification, then Phase 1 public UI/journey corrections.

## Current Stage

Private content demo. The website is implemented, deployed on Vercel, backed by Neon, and now has real public contact/social/location details seeded in Payload.

## Decisions Made

- [x] Brand name is VD BARRISOL.
- [x] Site will be Romanian and English.
- [x] Main service area is Constanta, with work across Romania.
- [x] Domain target is `vdbarrisol.ro`.
- [x] Stack target is Next.js + Payload CMS + Neon Postgres + Vercel.
- [x] Initial image storage target is Digi private storage / FTP-style storage.
- [x] Future self-hosting is a later migration project; keep Vercel, Neon, and Digi for the beta.
- [x] Pricing calculator rules must be editable from Payload.
- [x] Contact submissions should both save in Payload and send email.
- [x] WhatsApp direct CTA is required.
- [x] Public phone is `0793 124 425`.
- [x] Public email is `vdbarrisol@gmail.com`.
- [x] WhatsApp number is `40793124425`.
- [x] Facebook page is `https://www.facebook.com/p/VD-Barrisol-61564327003788/`.
- [x] Instagram page is `https://www.instagram.com/vd_barrisol/`.
- [x] Service locations from Facebook: Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia, Murfatlar.
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

The completed items below describe the alpha/current implementation. For beta work, use the phase checklists in `VD_BARRISOL_BETA_PLAN.md` and record each finished phase here with verification evidence.

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
- [x] Support common Neon/Vercel Postgres env aliases for Payload runtime.
- [x] Add CMS fields for Facebook, Instagram, company legal name, registration number, and service cities.
- [x] Add homepage trust strip and service coverage section.
- [x] Improve footer with contact, social, legal/company context, and localized links.
- [x] Seed real contact/social/location details into Payload.

## CMS Content Checklist

- [ ] Create first admin user at `/admin`.
- [x] Add real public phone number.
- [x] Add real public email.
- [x] Add real WhatsApp number in international format, e.g. `407XXXXXXXX`.
- [x] Add Facebook and Instagram links.
- [x] Add service city list.
- [ ] Confirm whether visible company details should include `VD BARRISOL S.R.L.` and `CUI 51496619`.
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

## Beta Phase 0 Baseline

Completed 2026-09-09 against commit `6cd809f75241e698125c3a774c24e3f7ce2ab31a` (`Build guided estimate calculator`). No application code or production data was changed during this phase.

### Environment

- Branch: `main`, aligned with `origin/main` before planning-file edits.
- Runtime: Node `v22.23.2`, npm `10.9.8`.
- Key versions: Next `16.2.6`, React `19.2.6`, Payload `3.84.1`, TypeScript `5.7.3`, Vitest `4.0.18`, Playwright `1.58.2`.
- Declared env-var names were inspected from `.env.example`; secret values were not printed.
- No root `AGENTS.md` was present.

### Checks

- [x] `npm run lint` passed.
- [x] `npm run test:int` passed: 1 file, 4 tests.
- [x] `PAYLOAD_SECRET=local-build-secret npm run build` passed. Next completed TypeScript, page generation, and route output.
- [ ] Clean `npm ci` install: blocked. It stalled during npm dependency resolution after peer-dependency warnings and was stopped; the existing installed tree remained usable for the checks above.
- [ ] Separate typecheck: not available as a script; TypeScript was checked as part of the production build.

### Route baseline

Local routes returned HTTP 200 for `/ro`, `/en`, `/ro/galerie`, `/en/gallery`, `/ro/despre`, `/en/about`, `/ro/confidentialitate`, `/en/privacy`, `/ro/cookies`, and `/en/cookies`.

The document language was `lang="ro"` for every inspected route, including English routes. This is a confirmed Phase 1/2 defect.

### Visual baseline

Screenshots were captured under `output/playwright/` at:

- RO homepage: `390x844`, `768x1024`, `1440x1000` viewports.
- RO gallery: `1440x1000` viewport.
- EN homepage: `1440x1000` viewport.

Confirmed observations:

- Header/footer navigation contains generic `Link` labels in the current fallback/CMS state.
- Typography visibly falls back to a serif style, matching the reported font-cascade issue.
- The mobile homepage is very tall and the calculator/form flow is dense at 390px.
- The desktop hero is visually dominant and the calculator occupies a large composite panel below it.
- Existing demo projects and placeholder imagery are visible and need explicit demo treatment before public launch.
- The English page contains English primary copy but still requires a full localization audit; the document language is incorrectly Romanian.

### Phase 0 exit status

Phase 0 is complete. The baseline is reproducible enough to begin Phase 1, with the npm clean-install issue recorded as an environment follow-up rather than silently treated as passed.

## Beta Phase 1 Public UI Baseline

Completed 2026-09-09. The public UI pass preserves the existing CMS, pricing engine, routes, and lead contract.

### Completed

- [x] Fixed the font cascade so the declared sans-serif stack is not reset by `font: inherit`.
- [x] Added locale-aware document language handling for RO/EN routes through the supported Next `proxy.ts` convention.
- [x] Replaced generic CMS navigation fallbacks such as `Link` with route-aware localized labels.
- [x] Moved the short interior context section before the calculator so the visitor understands the offer before configuring it.
- [x] Reduced hero height to give the calculator and supporting content earlier visibility.
- [x] Added manual hero slide controls, pause/resume control, pressed states, and reduced-motion timer behavior.
- [x] Captured refreshed representative screenshots at 390px and 1440px in `output/playwright/`.
- [x] Re-ran lint, integration tests, and production build successfully.

### Known follow-up

- The localized document-language fix makes public locale pages dynamic because the root layout reads the request header. Phase 2 should assess whether the same correctness can be retained with a more cache-friendly route/layout structure.
- The npm clean-install stall from Phase 0 remains unresolved.
- Demo imagery/projects still need explicit content-mode handling and replacement before public launch.
- Calculator validation, server-side recalculation, lead abuse protection, and CMS failure semantics belong to Phase 2/3.

### Phase 1 exit status

Phase 1 is complete for the initial public UI and visitor-journey correction pass. The site is ready for Phase 2 framework, CMS, data-flow, and localization hardening.

## Beta Phase 2 Framework, CMS, And Localization Hardening

Completed 2026-09-09. This phase tightened the public data boundary without changing the Payload schema or pricing contract.

### Completed

- [x] Empty CMS project and testimonial collections no longer resurrect fallback demo records.
- [x] Incomplete CMS project/testimonial records are filtered from public output instead of borrowing fields from an unrelated sample record.
- [x] Homepage and gallery now render deliberate localized empty states when approved content is unavailable.
- [x] Navigation labels remain localized and route-aware when saved CMS labels are blank.
- [x] Production build and TypeScript validation pass after the data-boundary changes.

### Known follow-up

- The public loader still uses a broad Payload read and catches all failures into global fallback content. A future content-mode decision is needed before unrestricted launch so outages do not silently look like approved demo content.
- Pricing settings are still merged from Payload with limited normalization; authoritative server-side recalculation belongs to Phase 3.
- Locale pages remain dynamic because the document language is derived from request headers. Cache-friendly restructuring should be evaluated separately.
- `PUBLIC_DATA_TIMEOUT_MS` is documented but not yet wired into bounded Payload reads.

### Phase 2 exit status

Phase 2 is complete for the agreed CMS-empty-state and localization hardening pass. The next milestone is Phase 3: trustworthy calculator and enquiry flow.

## Beta Phase 3 Calculator And Enquiry Trust

Completed 2026-09-09. The calculator remains client-responsive, but submitted leads now use validated server-side pricing.

### Completed

- [x] Added shared pricing input validation for finite positive areas, supported option IDs, and bounded custom city values.
- [x] Invalid calculator input now suppresses the estimate actions instead of falling back to a plausible price or stale dimensions.
- [x] The lead endpoint ignores browser-submitted totals and pricing snapshots.
- [x] The lead endpoint loads current localized `Pricing Settings` from Payload and recalculates the estimate before persistence.
- [x] Public direct creation through the Payload Leads collection is closed; the custom endpoint remains the intended write path.
- [x] Request JSON is size-bounded and lead text fields are bounded before database work.
- [x] Notification emails use the authoritative recalculated estimate, while notification failure does not discard the saved lead.
- [x] Added pricing tests for invalid area and unknown option rejection.

### Known follow-up

- The custom endpoint still needs durable rate limiting, idempotency, and a dedicated endpoint test harness.
- Decimal comma parsing, dimension-mode validation, stale-price review, and pricing/VAT version fields remain to be implemented.
- Payload `overrideAccess` is still used intentionally after endpoint validation; this should be reviewed alongside the final API tests.
- Email notification status is logged but not persisted as a lead status field.

### Phase 3 exit status

Phase 3 is complete for the core calculator trust boundary and lead write protection. The next milestone is Phase 4: portfolio, services, and CMS editing.

## Beta Phase 4 Portfolio And CMS Editing

Completed 2026-09-09 for the existing project content model. No migration was needed.

### Completed

- [x] The existing Payload `featured` field now controls homepage project selection when featured projects exist.
- [x] Project cards link to localized detail routes:
  - `/ro/proiecte/[slug]`
  - `/en/projects/[slug]`
- [x] Reusable project detail pages show only saved project fields: city, title, summary, image, area, and ceiling type.
- [x] Project image containers now have stable aspect ratios to prevent layout shifts.
- [x] Missing/empty project content remains an honest empty state rather than demo content.
- [x] Existing Romanian and English gallery routes both use the localized project-card contract.
- [x] Lint, pricing tests, and production build pass with the new routes.

### Deliberately deferred

- Project galleries using the existing `images` relationship need a richer public DTO before being exposed.
- Translated project slugs and language-preserving detail-page switching need an explicit editorial model.
- Services, architect content, FAQ editing, project filters, and demo/published workflow require new Payload fields/globals and should be designed before migration.
- Fictional testimonials remain excluded when the public collection is empty.

### Phase 4 exit status

Phase 4 is complete for the current project model and reusable portfolio detail flow. The next milestone is Phase 5: the optional ceiling-stretch brand motion prototype.

## Beta Phase 5 Brand Motion

Completed 2026-09-09 for the first-visit hero reveal prototype.

### Completed

- [x] Added `motion` as the selected animation dependency.
- [x] Added a short membrane/perimeter reveal over the hero media region.
- [x] The reveal is first-visit-only per browser session using session storage.
- [x] The reveal is pointer-transparent and does not delay navigation, hero actions, or calculator access.
- [x] The reveal automatically exits after approximately one second.
- [x] Reduced-motion users skip the reveal; the existing CSS reduced-motion rules remove nonessential transitions.
- [x] The animation remains isolated inside the existing client-side hero component.
- [x] Browser screenshot verification confirmed the reveal renders over the hero without changing the layout.

### Known follow-up

- The exact membrane deformation is intentionally a lightweight prototype, not physics or a final material simulation.
- Motion bundle impact and Core Web Vitals should be measured in Phase 6 with production-like media.
- A CMS enable/disable control and approved preset selection can be added after the owner approves this visual direction.
- Dependency audit reported existing vulnerabilities after installation; no automatic audit fix was applied.

### Phase 5 exit status

Phase 5 is complete for the optional first-visit motion prototype. The next milestone is Phase 6: SEO, accessibility, and performance verification.

## Beta Phase 6 SEO, Accessibility, And Performance

Completed 2026-09-09 for the high-confidence metadata and interaction checks available in the current environment.

### Completed

- [x] Structured data now uses configured service cities and avoids duplicating the site URL for already-absolute images.
- [x] JSON-LD serialization escapes `<` before insertion into the document script element.
- [x] Sitemap now includes both legal-language aliases and approved project detail routes.
- [x] Robots rules now disallow `/admin` and `/api` while exposing the sitemap.
- [x] Calculator option groups expose selected state through `aria-pressed` and grouped labels.
- [x] Project image containers have stable dimensions, reducing layout shift risk.
- [x] RO and EN route smoke checks returned `200` with the correct document language.
- [x] `robots.txt` and `sitemap.xml` returned `200` with the expected directives and URLs.
- [x] Lint, tests, and production build passed.

### Known follow-up

- Core Web Vitals, bundle sizes, image transfer sizes, and LCP/INP/CLS are not measured yet; they need production-like media and repeatable lab conditions.
- Keyboard-only, screen-reader, zoom, iOS Safari, Android Chrome, and reduced-motion device checks still need a dedicated test session.
- The current route pages remain dynamic because of request-derived document language; caching impact needs measurement before changing architecture.
- Demo content, privacy wording, analytics behavior, and final domain/email readiness remain launch decisions.

### Phase 6 exit status

Phase 6 is complete for the code-level SEO, structured-data, robots/sitemap, and calculator-semantic improvements. The next milestone is Phase 7: controlled beta verification and release readiness.

## Beta Phase 7 Controlled Release Readiness

Completed 2026-09-09 for the repeatable local/CI release gate. No production data, real lead recipient, or deployment was touched.

### Completed

- [x] Added `npm run typecheck`, including Next route type generation before `tsc --noEmit`.
- [x] Added GitHub Actions CI for Node 22, clean install, lint, typecheck, integration tests, and fallback-content build.
- [x] Added a controlled beta release checklist and separate application/database rollback guidance to `README.md`.
- [x] Documented the new localized project-detail routes in the public route list.
- [x] Local release gate passed:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test:int`
  - `PAYLOAD_SECRET=local-build-secret VDB_FORCE_STATIC_FALLBACK=1 npm run build`

### Not yet verified

- Real API integration tests against an isolated database.
- Tampered-total, oversized-body, duplicate-request, rate-limit, DB-failure, and email-failure scenarios.
- Authenticated Payload admin editing and migration rollback drill.
- Full Playwright smoke suite and device matrix.
- Vercel preview deployment and owner acceptance review.

These are release checks still requiring isolated infrastructure or owner coordination; they are not marked as passed.

### Phase 7 exit status

Phase 7 is complete for the reproducible code/CI release gate. The application is ready for a controlled preview deployment and owner acceptance review. Phase 8 self-hosting remains future work and is not part of the beta.

## Quality Bar

- The site should feel premium and practical, not like a generic construction template.
- The first screen must show the actual product/work clearly.
- The calculator must be honest about approximation.
- The CMS must be easy enough for a non-developer to update safely.
- Images must be compressed and dimensioned so the site is fast on mobile.
- The design should use orange/black carefully; avoid making the whole site one heavy orange/black block.
