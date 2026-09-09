# Beta audit and release handoff

Reviewed 2026-09-09 against `VD_BARRISOL_BETA_PLAN.md`, starting at `0cdee16`.

## Correction to previous phase reports

The previous phase summaries describe partial implementations, not completion of every exit criterion. This document supersedes their completion claims. The original brief remains the scope source. A passing fallback build does not verify Payload, migrations, media storage, or real enquiry delivery.

## Implementation audit

| Phase              | Implemented in this audit                                                                                                                                                                                                                                                                                                                                                                            | Remaining acceptance or decision                                                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0: Baseline        | Normal `npm ci` now works; Node 22 is pinned. Added real API, CMS/database and browser suites.                                                                                                                                                                                                                                                                                                       | The original performance baseline was never measured, so a valid before/after comparison cannot be reconstructed from the earlier claims.                                                                                                                                                   |
| 1: Visitor journey | Light calculator/result, full-width form, shorter hero draft, portfolio secondary CTA, correct final-step action, keyboard radio groups, skip link, live submission messages, direct WhatsApp fallback, services/FAQ surfaces.                                                                                                                                                                       | Owner review of the visual direction and final translated copy. Real device keyboard/zoom checks remain manual.                                                                                                                                                                             |
| 2: CMS/runtime     | Bounded Postgres connections/statements, explicit migration command instead of startup migrations, locale-keyed Next cache plus per-render deduplication, hook invalidation, explicit demo/live mode, no sample pricing/testimonials on outage, no cross-language CMS fallback, equivalent locale links, patched dependencies.                                                                       | Deploy with the migrations; investigate the existing production Neon delay with production access/logs. Cached public content is shared per locale and refreshed every 60 seconds; the current root layout intentionally stays dynamic for correct HTML language.                           |
| 3: Enquiries       | Strict pricing validation, comma decimals and raw edits, dimension authority, schema version, non-personal session state, stale-price review, Payload approval switch, VAT wording, durable hashed-IP rate limit, streamed body bound, unique receipt keys, server pricing snapshot, persisted notification status, bounded email calls, restored authenticated Payload lead-list/bulk routes.       | Owner must approve prices, minimum semantics and VAT. Real sender-domain verification and actual delivery approval are external. Failed email is retained with status; automatic background retries are not enabled.                                                                        |
| 4: Content         | Draft/demo/published projects, stable unique slugs, audience/finish/lighting metadata, localized details and gallery images, shareable/resettable filters, project-specific WhatsApp, approved testimonials, editable Services/process/FAQ/architect content, conditional services/architect routes, focal points, generated types and migrations.                                                   | Owner enters and publishes content. Shared project slugs are intentional; translated slugs were conditional in the plan. No lightbox or technical downloads are needed for the current image gallery.                                                                                       |
| 5: Motion          | CMS off/stretch preset; lazy Motion features; reduced-motion subscription; anchored visits skip introduction; session-only reveal; reveal below text; short panel transitions; manual/pause carousel.                                                                                                                                                                                                | Owner must approve the membrane prototype. It is a short visual suggestion, not a physics simulation.                                                                                                                                                                                       |
| 6: SEO/a11y/media  | Canonicals for project/service/architect routes, equivalent language links, dynamic sitemap excludes aliases/demo projects, safe JSON-LD excludes illustrative work and unconfirmed nationwide coverage, noindex by default, analytics opt-in, revisioned image URLs, bounded Digi/fetch requests and shorter caching, explicit illustrative labels, keyboard and no-JS checks, browser lab capture. | Real Digi upload/replacement/deletion needs the owner's media account. Physical Safari/iOS/Android and assistive technology checks remain manual. Field Web Vitals are unknown. Vercel deployment protection must be enabled for genuinely private previews; noindex is not access control. |
| 7: Release         | CI now includes disposable Postgres migrations, CMS checks and browser tests, alongside lint/types/unit API tests/build. Added a production-mode CMS browser suite, including lead persistence, duplicate prevention, admin login, and content invalidation.                                                                                                                                         | The two new migrations were applied to Neon in batch 3 on 2026-09-09. Application deployment, content approval and owner acceptance remain.                                                                                                         |
| 8: Self-hosting    | Operational sequence documented in `SELF_HOSTING.md`. Analytics is optional and database/storage remain configurable.                                                                                                                                                                                                                                                                                | The actual hosting move remains outside beta, as specified in the brief. Do not claim an unconfigured storage provider is implemented.                                                                                                                                                      |

## Final verification status (2026-09-09)

- Passed: lockfile installation, lint, TypeScript, 21 integration tests, and the Next production build (31 generated pages).
- Passed: all 5 Chromium UI tests, including RO/EN routes, calculator state, keyboard controls, no-JavaScript contact fallback, and overflow checks at 320/390/479/736/768/1024/1440px. Desktop/mobile screenshots are in `output/playwright/` (filenames identify the starting locale; the calculator test switches languages before capture).
- Local migrations, the targeted beta rollback/reapply preservation check, and the production-mode CMS browser suite passed against the disposable Postgres database. The CMS suite covered lead persistence, stale-pricing recovery, duplicate receipts, admin access, authenticated lead listing, and gallery cache invalidation. The suite emitted a Next development warning about a closed destination stream after the test completed; the test itself passed and no request failure was observed.
- The unreachable-database probe returned HTTP 200 with contact details in 1.45 seconds, but reused cached content. It does NOT prove the cold-cache outage case or resolve the production Neon incident.
- Browser lab sampling ran, but local unthrottled samples are not field Web Vitals or a valid before/after performance baseline. No performance acceptance claim is made.
- Production migrations were applied to Neon on 2026-09-09 in batch 3: `20260909_130243_beta_completion` and `20260909_173143_image_focal_points`. No real notification or application deployment was performed as part of this migration step; the GitHub release commit is `a16cea5`.
- Production schema verification passed read-only after migration: both new migration names are recorded in Payload batch 3, and the new rate-limit, services, project metadata and image focal-point structures exist. Neon currently contains 0 projects and 0 leads, so no existing content rows were changed by this migration.

## Controlled deployment

1. Back up Neon and confirm its restore point. Check for duplicate project slugs before adding the unique index. Do not delete or rename owner content automatically.
2. Apply the committed migrations through a controlled release job using the intended Neon connection: `npm run payload migrate`. The app no longer runs migrations during ordinary HTTP requests. Never use `migrate:fresh` on Neon.
3. Deploy the matching application revision. The schema additions preserve old records, but existing projects default to draft, testimonials to unapproved and pricing to unapproved. This intentionally prevents accidental sample publication.
4. In Payload, review both languages in Pricing Settings and enable Approved for public estimates. If not approved, the site offers WhatsApp without a numeric quote.
5. Publish real projects/testimonials when ready. Enable services and architect content only when confirmed. Set Home Page > Motion preset to Stretch to enable the optional reveal.
6. Verify public routes, `/admin`, lead listing and a consented real delivery test. Confirm contact/privacy text and protect private previews.

Environment additions (also in `.env.example`):

- `VDB_CONTENT_MODE=live`: approved CMS content. `demo` is an explicit development presentation with sample pricing, demonstration labels and no fictional testimonials.
- `VDB_PUBLIC_INDEXING=0` until public launch; set `1` only after approval. Demo mode always remains noindex.
- `VDB_ANALYTICS=0` until the owner approves actual tracking/privacy behavior.
- `PAYLOAD_RUN_MIGRATIONS=0`: default. Use the CLI migration job; do not enable startup migrations as a timeout workaround.
- Existing `DATABASE_URL`, `PAYLOAD_SECRET`, Digi and email variables remain required for their integrations. Rate limits use Postgres, so no Redis service is required.

## Verification commands

```sh
npm ci
npm run lint
npm run typecheck
npm run test:int
PAYLOAD_SECRET=local-build-secret VDB_FORCE_STATIC_FALLBACK=1 npm run build
npm run test:e2e
# Only on a disposable local database with "audit" in its name:
DATABASE_URL=postgresql://postgres:local-audit-only@127.0.0.1:55439/vd_beta_audit npm run payload migrate
DATABASE_URL=postgresql://postgres:local-audit-only@127.0.0.1:55439/vd_beta_audit npm run test:db
DATABASE_URL=postgresql://postgres:local-audit-only@127.0.0.1:55439/vd_beta_audit npx playwright test --config playwright.cms.config.ts
```

The database guard script refuses remote databases. Notification tests use mocks or explicitly empty credentials; no real messages are sent. Test scripts create only local audit users and fixtures.

## Deliberate limits

- The minimum continues to apply to the subtotal, before the range percentage, matching existing behavior. Thus the displayed lower bound may be lower than the minimum. Changing that is a business decision.
- VAT mode is disclosure only. No unapproved tax rate or tax calculation was invented.
- Browser-supplied prices are never used to persist a lead. Pricing version mismatches require a second explicit submission after reviewing the current quote.
- The SQL unique key prevents duplicate persistence; a simultaneous collision may return a retryable service error, and a subsequent retry retrieves the saved receipt.
- Image caching uses a revision in public URLs and 60-second upstream caches. Previously cached old revisions can remain until the consuming cache expires; this is not immediate global deletion.
- Residual dependency advisories after compatible fixes are low/moderate. The reported Payload account-unlock issue is mitigated by explicit admin-only unlock access. Do not force-downgrade Payload to the obsolete package suggested by npm audit.

Reference documentation used: [Next data cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache), [Payload migrations](https://payloadcms.com/docs/database/migrations).
