# VD BARRISOL

Current beta audit and migration prerequisites: [BETA_AUDIT.md](BETA_AUDIT.md). Earlier phase summaries overstated completion. Read this handoff before deploying the new schema.

Next.js + Payload CMS website for VD BARRISOL, a premium stretch ceiling company based in Constanta and nearby localities.

- Temporary Vercel domain: `https://vdbarrisol.vercel.app`
- Intended production domain: `https://vdbarrisol.ro`

## Stack

- Next.js App Router
- Payload CMS 3
- Neon Postgres
- Vercel hosting
- Digi Storage for images now
- Storage abstraction prepared for a later Hetzner migration
- TypeScript pricing calculator

## Local Setup

```bash
cd /Users/ncmihai/Desktop/SITE\ CWN/vd_barrisol
cp .env.example .env.local
npm install
npm run dev
```

When the database is unavailable, the public site retains contact information but suppresses numeric pricing and sample testimonials. Set `VDB_CONTENT_MODE=demo` explicitly for illustrative development content. Payload admin and lead saving require a real database.

## Useful Scripts

- `npm run dev` starts the site locally.
- `npm run build` builds the production app.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run test:int` runs pricing tests.
- `npm run generate:types` regenerates Payload types.
- `npm run generate:importmap` regenerates the Payload admin import map.

## Public Routes

- `/` redirects by browser language, defaulting to `/ro`.
- `/ro`
- `/en`
- `/ro/galerie`
- `/en/gallery`
- `/ro/despre`
- `/en/about`
- `/ro/proiecte/[slug]`
- `/en/projects/[slug]`
- `/ro/confidentialitate`
- `/en/privacy`
- `/ro/cookies`
- `/en/cookies`
- `/admin`

SEO redirects:

- `/ro/gallery` -> `/ro/galerie`
- `/ro/about` -> `/ro/despre`
- `/en/galerie` -> `/en/gallery`
- `/en/despre` -> `/en/about`

## CMS Model

Globals:

- `Site Settings`: brand, domain, contact, WhatsApp, Facebook, Instagram, company details, service cities, logo, palette, SEO.
- `Navigation & Footer`: header links, footer links, footer copy, credit.
- `Home Page`: hero slides, calculator intro, contact intro, SEO.
- `Gallery Page`: gallery intro and SEO.
- `About Page`: company story, values, image, SEO.
- `Pricing Settings`: calculator rules, currencies, VAT mode, disclaimer.

Collections:

- `Users`
- `Image Assets`
- `Projects`
- `Testimonials`
- `Leads`

## Media

The active image flow is:

1. Editor creates or opens an Image Asset.
2. Editor chooses a JPG, PNG, or WebP.
3. Browser generates original, 2K, 1080, and thumbnail variants.
4. App prepares protected Digi upload targets.
5. Browser uploads directly to Digi.
6. Payload stores metadata and stable app URLs.
7. Public pages render `/api/assets/images/[id]` URLs.

This keeps public URLs controlled by the app so Digi can be replaced by Hetzner later.

## Current Deployment State

- GitHub repo: `https://github.com/ncmihai/vd_barrisol`
- Temporary site: `https://vdbarrisol.vercel.app`
- Neon has the committed Payload migrations applied:
  - `20260606_140813_initial`
  - `20260606_153216_add_company_contact_fields`
- Public pages are ready for a private demo, but real owner content is still required before public launch.

## Vercel Environment Variables

Required for production:

```bash
DATABASE_URL=
# Optional aliases accepted by the app if `DATABASE_URL` is not present:
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=https://vdbarrisol.vercel.app

DIGI_STORAGE_EMAIL=
DIGI_STORAGE_PASSWORD=
DIGI_STORAGE_MOUNT_ID=
DIGI_STORAGE_API_URL=https://storage.rcs-rds.ro/api/v2.1
DIGI_STORAGE_BASE_PATH=vd-barrisol/images
DIGI_IMAGE_MAX_BYTES=26214400

CONTACT_FROM_EMAIL=VD BARRISOL <noreply@vdbarrisol.ro>
CONTACT_TO_EMAIL=
RESEND_API_KEY=

POSTGRES_CONNECT_TIMEOUT_MS=7000
PUBLIC_DATA_TIMEOUT_MS=8000
```

Notes:

- `PAYLOAD_SECRET` must be a long random string.
- Use the Neon pooled connection string for `DATABASE_URL`. The app also accepts `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, or `POSTGRES_URL_NON_POOLING`, but `DATABASE_URL` is the preferred name.
- Email sending is skipped when `RESEND_API_KEY` or `CONTACT_TO_EMAIL` is missing, but leads still save if the database is configured.
- `DIGI_STORAGE_MOUNT_ID` can be left empty only if mount auto-discovery works for the Digi account.

## Migration Workflow

When the Payload schema changes:

```bash
npm run payload migrate:create descriptive_name
npm run generate:types
npm run generate:importmap
npm run payload migrate
```

Only use `migrate:fresh` on disposable databases. It drops all data.

## CMS Content Checklist

- Create the first admin user at `/admin`.
- Confirm current public phone: `0793 124 425`.
- Confirm current public email: `vdbarrisol@gmail.com`.
- Confirm current WhatsApp number: `40793124425`.
- Confirm Facebook URL: `https://www.facebook.com/p/VD-Barrisol-61564327003788/`.
- Confirm Instagram URL: `https://www.instagram.com/vd_barrisol/`.
- Confirm service cities: Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia, Murfatlar.
- Confirm whether `VD BARRISOL S.R.L.` and `CUI 51496619` should remain visible in the footer/legal context.
- Add real pricing values in `Pricing Settings`.
- Confirm VAT wording before public launch.
- Upload real hero and project images through `Image Assets`.
- Add at least 4 real projects and approved testimonials.
- Review `/ro/confidentialitate`, `/en/privacy`, `/ro/cookies`, and `/en/cookies`.

## Domain Launch

1. Purchase `vdbarrisol.ro`.
2. Add the domain to Vercel.
3. Update `NEXT_PUBLIC_SITE_URL=https://vdbarrisol.ro`.
4. Update Payload `Site Settings` domain to `vdbarrisol.ro`.
5. Point DNS to Vercel.
6. Redeploy and verify sitemap, canonical URLs, and alternate language links.

## Before Launch

- Replace placeholder images with real VD BARRISOL project photos.
- Replace the planning logo with an approved SVG, PDF, AI, EPS, or high-resolution transparent PNG.
- Confirm real phone, email, WhatsApp, Facebook, Instagram, company details, and service cities in Payload.
- Confirm real calculator pricing values.
- Confirm VAT wording.
- Add real testimonials approved for public use.
- Have privacy/cookie text reviewed before public launch.

## Controlled Beta Release Checklist

Run locally before requesting a Vercel deployment:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:int
PAYLOAD_SECRET=local-build-secret VDB_FORCE_STATIC_FALLBACK=1 npm run build
```

Verify manually in both `/ro` and `/en`:

- Header, locale switch, gallery, about, legal links, calculator steps, invalid input, WhatsApp URL, and expanded enquiry form.
- Empty project/testimonial states and approved CMS content states.
- `/robots.txt`, `/sitemap.xml`, canonical URLs, document language, and project-detail routes.
- `/admin` with the owner account, without exposing admin/API routes to search.

Do not submit a test enquiry to the real database or notification recipient. Use an isolated database and notification adapter for API verification. Keep the verified commit, migration state, environment configuration, and rollback commit documented before deployment.

Rollback application code and database migrations separately. Redeploying an older commit does not reverse a Payload migration.
