# VD BARRISOL

Next.js + Payload CMS website for VD BARRISOL, a premium stretch ceiling company based in Constanta and working across Romania.

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

The public site has fallback content when `DATABASE_URL` is missing. Payload admin and lead saving require a real database.

## Useful Scripts

- `npm run dev` starts the site locally.
- `npm run build` builds the production app.
- `npm run lint` runs ESLint.
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

- `Site Settings`: brand, domain, contact, WhatsApp, logo, palette, SEO.
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
- Neon has the committed initial Payload migration applied: `20260606_140813_initial`.
- Public pages are ready for a private demo, but real owner content is still required before public launch.

## Vercel Environment Variables

Required for production:

```bash
DATABASE_URL=
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
- Use the Neon pooled connection string for `DATABASE_URL`.
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
- Add real phone, email, and WhatsApp number in `Site Settings`.
- Confirm the WhatsApp number uses international format without spaces.
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
- Confirm real phone, email, and WhatsApp number in Payload.
- Confirm real calculator pricing values.
- Confirm VAT wording.
- Add real testimonials approved for public use.
- Have privacy/cookie text reviewed before public launch.
