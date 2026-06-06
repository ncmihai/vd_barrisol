# VD BARRISOL Architecture

Last updated: 2026-06-06

## Proposed Stack

- Next.js App Router with TypeScript.
- Payload CMS 3 inside the Next.js app.
- Neon Postgres for Payload data.
- Vercel for hosting, previews, ISR, analytics, and deployment.
- Digi Storage for initial image storage.
- Storage abstraction designed so Hetzner can replace Digi later.
- Plain CSS or CSS modules for the public website unless the UI grows enough to justify a component system.

## Brand Palette

- Warm neutral: `#E9E3DF`
- Orange: `#FF7A30`
- Blue: `#465C88`
- Black: `#000000`

## Source Blueprint

Use `mereya_star` as a local architecture reference, especially for:

- Next.js + Payload project structure.
- Payload globals and collections.
- Digi-backed image assets.
- Stable app-routed media URLs.
- Revalidation after CMS edits.
- Sitemap, robots, metadata, and structured data.
- Task tracking in markdown.

Do not copy these Mereya-specific pieces unless needed:

- Audio/music collections.
- Newsletter flow.
- DJ-specific design language.
- German localization.
- Umami admin dashboard.
- Artist-specific analytics events.

## Public Routes

Recommended route structure:

- `/` redirects to `/ro`.
- `/ro` Romanian landing page.
- `/en` English landing page.
- `/ro/galerie` Romanian gallery.
- `/en/gallery` English gallery.
- `/ro/despre` Romanian about page.
- `/en/about` English about page.
- `/admin` Payload dashboard.

Alternative: use one canonical slug per page, such as `/ro/gallery` and `/en/gallery`, to reduce routing complexity. This is simpler but less natural for Romanian SEO.

## Payload Globals

### Site Settings

- Brand name.
- Logo image asset.
- Phone.
- Email.
- WhatsApp number.
- Main city.
- Service area.
- SEO title and description by locale.
- Default Open Graph image.

### Navigation And Footer

- Header links by locale.
- Footer link groups.
- Social links.
- Legal/company text.
- Optional credit link.

### Home Page

- Hero slides.
- Hero headline and supporting copy by locale.
- Calculator intro text.
- Contact section text.
- Selected featured projects.
- SEO fields.

### Gallery Page

- Intro copy by locale.
- Featured testimonials.
- Featured projects.
- SEO fields.

### About Page

- Story content by locale.
- Trust points.
- Service area copy.
- Certifications/warranty fields if available.
- SEO fields.

### Pricing Settings

- Active currency defaults.
- EUR conversion setting or manually entered EUR display values.
- Base price per sqm.
- Minimum project price.
- Product/ceiling type options.
- Finish/material options.
- Lighting options.
- Shape/complexity multipliers.
- Location/transport settings.
- VAT/tax display mode.
- Approximation range percentage.
- Disclaimer copy by locale.

## Payload Collections

### Users

Payload admin users.

### Image Assets

Digi-backed website image library:

- Title.
- Alt text by locale.
- Usage tags: hero, gallery, project, about, logo, open graph.
- Generated variants.
- Storage metadata hidden from editors where possible.

### Projects

- Title by locale.
- Slug.
- Location.
- City.
- Approximate area.
- Ceiling type.
- Short description by locale.
- Main image.
- Gallery images.
- Featured flag.
- Sort order.

### Testimonials

Article/editorial-style testimonials:

- Client display name.
- Project relation.
- Quote/content by locale.
- Related project.
- Main image optional.
- Rating optional.
- Publish date optional.
- Featured flag.

### Leads

Private collection for calculator/contact submissions:

- Name.
- Phone.
- Email.
- WhatsApp preference.
- City.
- Square meters.
- Selected calculator options.
- Estimated price range.
- Message.
- Locale.
- Source page.
- Submission timestamp.

## Calculator Implementation

Use a pure TypeScript pricing engine:

- `calculateEstimate(input, pricingSettings)`.
- Shared by client UI, server validation, and tests.
- Keep all business values in Payload, not hardcoded in UI.
- Store submitted estimate snapshots in `Leads` so later pricing changes do not rewrite old lead context.

Do not use Python for the calculator. It would add a separate runtime and deployment surface without solving a real problem here.

## Contact Flow

- Primary CTA: WhatsApp direct link.
- Secondary CTA: phone and email.
- Contact/estimate form:
  - Saves a lead in Payload.
  - Sends notification email.
  - Shows a clear success state.

Email provider still needs a decision. Resend is a clean Vercel-friendly default.

## Media Flow

Initial goal:

- Admin creates/edits Image Asset in Payload.
- Browser or server generates web-friendly variants.
- Bytes are uploaded to Digi Storage.
- Payload stores metadata and stable app URLs.
- Public frontend loads images through app URLs, not raw private storage links.

Future Hetzner migration:

- Keep provider-specific logic behind `storageProvider` helpers.
- Avoid baking Digi paths into public content decisions.

## SEO

- Locale-specific metadata.
- Canonicals and alternate language links.
- Sitemap.
- Robots.
- Open Graph image.
- LocalBusiness or ProfessionalService JSON-LD.
- Project pages can be added later if SEO needs grow.

## Testing Baseline

- Unit tests for calculator pricing logic.
- Integration test for lead creation.
- Playwright smoke test for:
  - Home page loads in RO and EN.
  - Calculator produces estimate.
  - Gallery renders projects/testimonials.
  - Contact CTA links are valid.
