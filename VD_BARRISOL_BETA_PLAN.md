# VD BARRISOL — Alpha to Beta Implementation Plan

Prepared: 9 September 2026. Status: proposed plan; no website changes made during this review.

## 1. Purpose and decisions

Turn the existing website into a coherent, reliable beta. Preserve useful implementation and make the main journey work end to end:

**Simulate a ceiling budget → explore relevant portfolio examples → discuss the project on WhatsApp.**

Visitors may enter at any point. Do not force someone who already wants to contact the business through the calculator.

Confirmed direction:

- Primary audiences: homeowners and businesses, especially hotels. Make services and project information useful and discoverable for architects too.
- Visual direction: bright, architectural, spacious, with orange as the primary brand accent.
- Keep `#FF7A30`, `#E9E3DF`, `#465C88`, and `#000000`; add compatible neutral shades and accessible interaction colors where needed.
- Keep Romanian and English throughout.
- The calculator is a central product feature. Business values remain editable in Payload.
- Use Motion for selected animation. Include a ceiling-stretch brand animation, subject to the behavior and performance requirements below.
- Placeholders are acceptable during beta development. Real photography is not a prerequisite for implementation.
- Stay on Vercel, Neon, and Digi for now. Prepare for a future owner-operated server with 6 CPU cores and 12 GB RAM. This replaces the earlier assumption that Hetzner must be the next destination.
- Keep Next.js, Payload, TypeScript, and Postgres. No framework replacement is justified by the findings in this review.

### Business details to preserve

| Field | Value |
|---|---|
| Brand | VD BARRISOL |
| Legal name | VD BARRISOL S.R.L. |
| CUI | 51496619 |
| Phone | 0793 124 425 |
| Email | vdbarrisol@gmail.com |
| WhatsApp number | 40793124425 |
| Main service area | Constanța and nearby localities |
| Localities | Mamaia-Sat, Valu lui Traian, Constanța, Mamaia, Cumpăna, Năvodari, Agigea, Lazu, Mangalia, Murfatlar |
| Facebook | https://www.facebook.com/p/VD-Barrisol-61564327003788/ |
| Instagram | https://www.instagram.com/vd_barrisol/ |
| Current deployment | https://vdbarrisol.vercel.app |
| Future domain | vdbarrisol.ro; ownership and readiness must be checked before use |

Do not infer nationwide installation availability from older sample copy. Treat work beyond the main area as a discussion, pending confirmation.

## 2. Evidence and current state

Repository: [ncmihai/vd_barrisol](https://github.com/ncmihai/vd_barrisol).

Source review was pinned to `6cd809f75241e698125c3a774c24e3f7ce2ab31a` — `Build guided estimate calculator`. It matched the default branch when inspected. Declared dependencies include Next.js 16.2.6, React 19.2.6, and Payload 3.84.1. Neither GSAP nor Motion is declared in `package.json`.

The review combined source inspection and desktop browser observations. It did not run a local build, authenticate to Payload, submit leads, send WhatsApp messages, measure Core Web Vitals, or retest mobile layouts. Previous successful checks in the handoff are historical evidence, not verification of this plan.

### Observed visitor journey

Screenshot references below are included in the companion ZIP under `evidence/`. They record the existing alpha, not a proposed redesign. Some are viewport captures focused on the relevant controls.

| Step | Surface and health | Evidence and implication |
|---|---|---|
| 1 | Romanian homepage — needs correction | `vd-01-home.jpg`: visible header/footer labels say “Link”; the hero dominates the first screen; calculator introduction crosses from black onto a pale background and loses readability. |
| 2 | Finish selection — functional, underexplained | `vd-02-finish.jpg`: navigation works, but options are mostly text cards. Selecting glossy changed the 20 m² estimate from 3,060–4,140 to 3,672–4,968 RON in this session. These are observed sample outputs, not approved prices. |
| 3 | Lighting — functional, limited content | `vd-03-lighting.jpg`: two options were displayed in the live Romanian state. Do not assume a missing option is a UI bug until the saved pricing settings are inspected. |
| 4 | Details — unclear completion | `vd-04-details.jpg`: the last step retains a disabled “Continuă” button; only Constanța appears as a city shortcut. Give the final step an explicit useful next action. |
| 5 | Contact form reveal — needs layout repair | `vd-05-form.jpg`: the form appears, but the estimate panel visually covers part of its horizontal space. No submission was performed. Verify grid placement and all fields at each breakpoint. |
| 6 | Gallery — basic display works | `vd-06-gallery.jpg`: sample images render, but there are no project-detail links or filters in the inspected grid. The first full-page homepage capture had unloaded lower images; that alone is not evidence of broken image delivery. |
| 7 | English calculator — partially localized | `vd-07-english.jpg`: English controls coexist with Romanian option labels and disclaimer. The inspected document reports `lang="ro"`. |

### Findings confirmed in source

| Priority | Finding | Files and action |
|---|---|---|
| High | The intended sans-serif font is overridden | `src/app/globals.css` sets `body` font-family, then includes `body` in a later `font: inherit` rule. Computed font in the browser was Times New Roman. Fix the cascade before judging typography. |
| High | Missing labels become generic “Link” | `src/lib/publicData.ts`, `src/globals/NavigationFooter.ts`. Provide localized route-aware fallbacks and validate saved labels. Inspect CMS values; the exact reason they are missing is unverified. |
| High | Invalid input can still produce a plausible estimate | `src/lib/pricing.ts` substitutes 1 m² for invalid area; `EstimateCalculator.tsx` can retain the previous area when dimensions become invalid. Show invalid state instead of a misleading result. |
| High | Lead prices and snapshots are trusted from the browser | `src/app/api/leads/route.ts` stores submitted estimate numbers and pricing JSON without calling the pricing engine. Recalculate using authoritative settings. |
| High | Lead collection creation access is permissive | `src/collections/Leads.ts` allows public `create`. Review every reachable write path as well as the custom endpoint. The custom `/api/leads` route may shadow Payload's same-path REST handler; no separate bypass was demonstrated, and GraphQL is disabled in the reviewed config. |
| High | Empty or failed CMS reads can restore demo content | `src/lib/publicData.ts` returns fixtures on errors and empty collections; builds intentionally use fallback content. Separate development examples from production fallback behavior. |
| Medium | Locale handling is incomplete | `src/app/layout.tsx` fixes the document language to Romanian; `src/lib/i18n.ts` switches to the other homepage; `ProjectGrid.tsx` hardcodes Romanian labels. Preserve equivalent page and calculator state when switching languages. |
| Medium | Hero controls have accessibility problems | `HeroCarousel.tsx` puts buttons inside an `aria-hidden` container and rotates every 6.5 seconds without pause controls. CSS reduced-motion rules do not stop that timer. |
| Medium | Editorial controls are only partly connected | The project schema has `featured` and multiple images, but the public mapping drops those fields and the homepage simply takes the first two projects. |
| Medium | Data loading is broader than necessary | `getPublicSiteData` fetches six globals and two collections together, and is called by layout, page, and metadata. Measure duplication and failures, then narrow and deduplicate reads. `PUBLIC_DATA_TIMEOUT_MS` is not used in this reviewed loader. |
| Medium | Storage portability is incomplete | `src/lib/storage.ts` wraps Digi functions, but upload helpers remain Digi-specific and the Hetzner branch throws. Stable image URLs are a useful starting point, not a finished migration system. |
| Medium | Automated coverage is narrow | The repository contains four pure pricing tests under `tests/int/`; this is not lead/API/browser integration coverage. Playwright is a dependency, but no browser suite was present in the inspected tree. |

Source links: [public data mapping](https://github.com/ncmihai/vd_barrisol/blob/6cd809f75241e698125c3a774c24e3f7ce2ab31a/src/lib/publicData.ts), [calculator](https://github.com/ncmihai/vd_barrisol/blob/6cd809f75241e698125c3a774c24e3f7ce2ab31a/src/components/EstimateCalculator.tsx), [lead endpoint](https://github.com/ncmihai/vd_barrisol/blob/6cd809f75241e698125c3a774c24e3f7ce2ab31a/src/app/api/leads/route.ts), [lead collection](https://github.com/ncmihai/vd_barrisol/blob/6cd809f75241e698125c3a774c24e3f7ce2ab31a/src/collections/Leads.ts).

## 3. Competitor references and implications

These are examples, not an exhaustive market survey or evidence of conversion rates. Visual observations refer to the desktop pages captured on 9 September 2026. Competitors' commercial claims have not been independently verified.

| Reference | What is visible | Adopt for VD BARRISOL | Trade-off to avoid |
|---|---|---|---|
| [VIPcasa, Romania](https://vipcasa.ro/) | Orange accents, large ceiling photography, a dark floating navigation group, measurement CTA, service categories, and recent projects. Screenshot: `ref-vipcasa.jpg`. | Immediate service clarity, useful categories, and a visible next action. | Its large hero and dense navigation consume substantial space. Keep your calculator easier to reach; do not copy its claims or styling. |
| [Symetric, Romania](https://www.symetric.ro/barrisol) | White surfaces, sans-serif typography, a commercial interior hero, two clear CTAs, and explanations of finish types. Screenshot: `ref-symetric.jpg`; cookie panel remains visible in the captured state. | Bright presentation and straightforward explanations for matte, glossy, translucent, acoustic, and printed solutions. | Store navigation/search/cart add complexity that your lead-generation site does not need. Avoid opening with a long manufacturer history. |
| [Barrisol Welch, UK](https://www.barrisolwelch.com/) | Large architectural photographs, restrained white header, product/application navigation, projects, brochures, and CAD resources. Screenshot: `ref-welch.jpg`. | Project-led credibility and a useful route for architects. | A broad manufacturer-style catalogue would be excessive for this beta. Only offer technical resources you actually possess and may distribute. |

Recommendation: combine a clear local installer journey with architectural presentation. The opportunity is an understandable budget simulation connected to examples and a conversation. Do not claim this is unique in the market without broader research.

## 4. Scope and trade-offs

| Decision | Benefit | Cost or limitation | Recommendation |
|---|---|---|---|
| Improve the existing Next.js/Payload app | Retains calculator, CMS, localization, and deployment work | Existing defects still need correction | Keep and harden it. |
| Keep calculator near the top | Matches the owner's preferred journey | Visitors need enough context to choose options | Short hero, compact explanation, then calculator. |
| Use placeholders during development | UI work can proceed immediately | They cannot demonstrate real installation quality | Label demonstrations and keep testimonials unpublished unless real. |
| Use Motion selectively | Suits React interaction and brand choreography | Adds code; expensive animation can still perform poorly | CSS for simple states; Motion for the membrane and coordinated changes. |
| Show a loader on every navigation | Repeated brand exposure | Adds friction, routing complexity, and perceived delay | Do not make it the beta default. Use a brief first-visit reveal and optional short route entrance. |
| Stay on Vercel now | Reduces infrastructure work during beta | Ongoing provider dependence and usage costs | Retain it; prepare migration documentation later. |
| Add project detail pages | Supports portfolio depth and specific enquiries | Requires content modelling and maintenance | Build one reusable template, with demos clearly marked. |

Beta includes: redesigned public routes, working four-step simulation, relevant portfolio browsing, WhatsApp handoff, reliable optional lead capture, editable content/pricing, deliberate empty/error states, localization, restrained motion, and release verification.

Defer: customer accounts, online payments, booking calendars, full CRM, 3D room configurator, photorealistic cloth physics, architect login portals, large blog programmes, automatic quote PDFs, mass city landing pages, and the hosting move.

## 5. Execution rules for Codex

1. Work in the existing repository. Original owner path: `/Users/ncmihai/Desktop/SITE CWN/vd_barrisol`; use the actual checkout path in the current environment.
2. Read applicable `AGENTS.md`, then `README.md`, `architecture.md`, `memory.md`, `task.md`, and relevant source. This brief supplies the owner's newer product direction; reconcile outdated GSAP/Hetzner assumptions.
3. Inspect Git status and current commit. Preserve existing user edits. Do not reset to the reviewed commit; investigate differences.
4. Execute the requested phase in small, reviewable changes. By default, one phase per work session. Finish implementation and verification before reporting the phase as complete.
5. Keep business content editable. Do not replace Payload with hardcoded production data to make a screenshot look correct.
6. Keep the pure TypeScript pricing engine. Do not introduce Python or a separate calculation service.
7. Do not invent prices, VAT treatment, installation promises, testimonials, completed jobs, certifications, or official manufacturer affiliation. Unconfirmed services can be draft CMS entries.
8. Preserve existing routes and redirects. Add migrations for schema changes and verify them against a disposable database; never run destructive changes on Neon production as part of routine testing.
9. Do not submit test enquiries to real recipients. Use isolated fixtures and a notification test adapter.
10. This plan authorizes planning only in this review. In future execution, deployment, database migration, and content publishing follow the owner's actual instruction for that session.
11. Record completed tasks, changed files, validation results, known gaps, and the next step in `task.md`. Do not mark a skipped or blocked check as passed.

## Phase 0 — Establish a reproducible baseline

**Goal:** identify what the current checkout actually does before changing it. This is a short prerequisite to Phase 1.

- [ ] Record commit, branch, runtime, dependency versions, existing env-var names, and configured integrations without printing secrets.
- [ ] Use the lockfile to install dependencies. Run the available lint, type, test, and build checks with appropriate development/test configuration.
- [ ] Capture home, gallery, about, and calculator states in RO/EN at 390, 768, and 1440 px; include the expanded form and invalid-input states.
- [ ] Verify the findings above against current code. Inspect CMS localization/empty-array shapes using safe development data.
- [ ] Record initial production-build page weight, image sizes, and repeatable mobile lab measurements. Do not invent baseline scores.
- [ ] Make a short task list distinguishing existing failures from changes introduced later.

**Benefit:** prevents regressions and wasted rewrites. **Cost:** a small setup step before visible progress.

**Exit:** repeatable local startup and a recorded baseline, or clearly identified environment blockers with work that can still proceed.

## Phase 1 — Redesign the public UI and visitor journey

**Goal:** a consistent bright architectural site using existing data contracts. Fix localized labels and visible layout defects within this phase; larger data changes belong to Phase 2.

### 1A. Design foundation

- [ ] Correct the font cascade. Use a clear sans-serif with Romanian character support; use a local font asset or system stack with a reliable fallback.
- [ ] Centralize spacing, typography, surface, border, radius, focus, and motion tokens. Start from the existing CSS; use component-scoped styles where they reduce conflicts. Do not add a UI framework just for this redesign.
- [ ] Use warm off-white backgrounds, near-black text, orange primary actions, and restrained blue accents. Avoid large black sections as the default presentation.
- [ ] Use black/dark text on the brand orange button unless a measured alternative passes contrast. Orange should not be the only signal of selection or error.
- [ ] Favor large ceiling imagery, clear alignment, restrained borders, and readable copy over heavy shadows and repeated decorative cards.

### 1B. Homepage order

1. Compact header: logo, Calculator, Portfolio, Services, About, locale switch. Services can initially be a homepage anchor. Architect access can sit in the services area/footer to avoid overcrowding.
2. Hero: concise headline, one supporting sentence, one strong interior image. Primary action: “Simulează costul”; secondary: “Vezi portofoliul”. Keep WhatsApp accessible.
3. Short context: what a stretch ceiling is and what the simulation covers.
4. Full calculator directly below this introduction; do not bury it beneath long marketing sections.
5. Selected portfolio examples, with ceiling finish, lighting, and space type.
6. Services and use cases: homes, hotels/commercial spaces, and architectural collaboration.
7. Simple process: simulation → discussion/measurement → confirmed proposal → installation.
8. Concise practical FAQ and service-area content, then contact/legal footer. Hide empty testimonial sections.

Suggested draft hero copy, to be editable in both languages:

> RO: Tavane extensibile, lumină integrată, spații transformate.
>
> Pentru locuințe, hoteluri și spații comerciale din Constanța și împrejurimi. Explorează finisajele, simulează bugetul și discută cu noi despre proiect.
>
> EN: Stretch ceilings and integrated lighting for your space.
>
> For homes, hotels and commercial interiors in Constanța and nearby areas. Explore finishes, simulate your budget and discuss your project with us.

### 1C. UI implementation

- [ ] Preserve the four calculator steps. Use compact progress, clear selection states, short explanations, and optional sample imagery for finish/lighting choices.
- [ ] Give the last step a completion action such as “Vezi exemple potrivite”, alongside the persistent WhatsApp action. Remove the dead-end disabled Next button.
- [ ] Make the summary a readable light panel. On desktop it can remain beside the inputs; on mobile show a compact result near the current controls without covering fields or the keyboard.
- [ ] Repair the expanded form layout. Give it its own full-width row or deliberate panel; use distinct reveal/submit labels and accessible status messages.
- [ ] Use “Discută pe WhatsApp” for conversation; do not imply a confirmed appointment when the action only opens chat.
- [ ] Fix placeholder navigation labels, sticky-header anchor offsets, visible focus, mobile navigation, and gallery/about/footer visual consistency.
- [ ] Keep existing hero data support, but use one strong image by default while imagery is limited. If a carousel stays enabled, keep text stable and provide accessible manual controls.

**Primary files:** `src/app/globals.css`, `src/components/{Header,Footer,HeroCarousel,EstimateCalculator,ProjectGrid,TestimonialList}.tsx`, public route pages, `src/lib/i18n.ts`, and route-label fallbacks in `src/lib/publicData.ts`.

**Benefit:** improves clarity and makes the brand recognizable immediately. **Cost:** some UI will be revisited when richer content contracts arrive; keep components reusable.

**Exit:** existing public pages are coherent in both languages; calculator and form remain usable; no hidden fields, clipped actions, unreadable text, or horizontal page overflow at 320, 390, 479, 736, 768, 1024, and 1440 px. Capture representative desktop/mobile screenshots. Real photos are not required.

## Phase 2 — Harden the framework, data flow, and localization

**Goal:** strengthen the existing stack without a rewrite.

- [ ] Audit installed versions and advisories at implementation time. Apply needed compatible patches separately from broad refactoring; keep Payload packages aligned.
- [ ] Set a supported, maintained Node runtime consistently across local development, CI, and Vercel. The current engine declaration still permits Node 18; verify it against the installed Next/Payload versions. See [Next.js installation requirements](https://nextjs.org/docs/app/getting-started/installation).
- [ ] Keep content, metadata, and layout server-rendered. Keep calculator, gallery interaction, and animation as narrow client components.
- [ ] Replace permissive `AnyRecord` mapping where practical with typed public DTOs and explicit validation. Return only fields each public surface needs.
- [ ] Separate missing fields, intentionally empty content, failed requests, and development fixtures. A deliberately empty portfolio must not resurrect sample jobs or a customer quote.
- [ ] Add an explicit demo/content mode. Production builds and runtime recovery must never silently substitute demo prices or testimonials. Serve approved cached content when available; otherwise render honest empty/unavailable states.
- [ ] Narrow and deduplicate public reads. Use the caching/revalidation mechanism supported by the installed Next version, with locale-aware keys. Confirm CMS edits invalidate the affected pages and pricing data.
- [ ] Implement bounded DB/storage requests and truthful error handling. Wire documented timeout settings to actual code, or remove stale documentation. Avoid timeout wrappers that leave uncontrolled work running.
- [ ] Fix RO/EN CMS defaults, missing navigation labels, option labels, disclaimers, image alt text, units, number formatting, and page-equivalent language switching.
- [ ] Render the correct document language from the server for each locale. Review root-layout/Payload-layout boundaries before restructuring; do not fix this only after hydration.
- [ ] Preserve every existing localized redirect and legal route. Extend centralized route mapping when new pages are added.
- [ ] Keep contact links usable when optional data fails. Remove dead `#contact` fallbacks where no matching element exists.

**Benefit:** changes in Payload reliably reach the website and failures stop producing misleading content. **Cost:** cache behavior and localization require meaningful integration checks.

**Exit:** editing a label, price, city, or featured project in a test CMS reaches the correct pages; missing translations and outages have deliberate behavior; both locales use the correct document language; no sample content appears accidentally.

## Phase 3 — Make the calculator and enquiry flow trustworthy

**Goal:** retain instant simulation while giving every estimate and enquiry consistent meaning.

- [ ] Keep `calculateEstimate(input, settings)` as the shared engine. Define and validate a versioned input schema; permit only known option IDs and finite, positive dimensions/area within a documented supported range.
- [ ] Preserve raw input while editing. Empty, zero, negative, malformed, or unsupported values must show a helpful error and suppress the quote action/result instead of reverting silently to 1 m² or an old value.
- [ ] Support decimal inputs in both locales, including Romanian comma handling. Validate dimension mode and direct-area mode consistently.
- [ ] Make all amounts, multipliers, minimums, travel fees, exchange rate, range percentage, and VAT wording editable in Payload. Validate duplicate/empty option IDs and settings boundaries.
- [ ] Show RON prominently, EUR secondarily, with editable approximation/VAT wording. Do not treat an “excluded VAT” label as an implemented tax calculation. Confirm business treatment before enabling such calculation.
- [ ] Document what the estimate includes and what requires measurement. Confirm whether the minimum applies to the subtotal or to the displayed lower bound: the current engine can show a lower bound below the configured minimum. Preserve existing behavior until that decision is explicit.
- [ ] Do not price specialist services merely because their marketing card exists. Use “Necesită ofertă personalizată” / “Custom quote required” for services without approved rules.
- [ ] Keep a single-space simulation in beta. Hotel visitors can describe multiple rooms in the enquiry; do not imply a single-room result is a complete hotel quote.
- [ ] Preserve non-personal configuration when moving to the gallery and back, and when switching locale. Use versioned session state with validation; do not persist contact fields by default.
- [ ] Link the result to matching portfolio categories with a visible reset/show-all option. Carry selected project context into the enquiry, without silently changing the simulated specification.
- [ ] Build a localized WhatsApp message from the visible configuration: area, finish, lighting, complexity, city, estimated range, approximation wording, and optionally selected project. Opening WhatsApp must remain an explicit click; it is not proof that a message was sent.
- [ ] Keep optional lead capture secondary and reveal it only when requested. Include a clear privacy link and required/optional field labels. Preserve values on failure and prevent duplicate submissions.
- [ ] Validate and rate-limit the custom endpoint before expensive DB work. Bound body and field sizes; use shared durable rate limits suitable for Vercel instances, not only a process-local map. Add a honeypot if needed; add CAPTCHA only if actual abuse warrants it.
- [ ] Recalculate submitted estimates server-side using validated authoritative pricing. Ignore browser-supplied totals and snapshots as authority. Store normalized input, calculated range, timestamp, schema/pricing version, and the settings snapshot used.
- [ ] If prices changed since the displayed simulation, return the updated range for review; do not silently turn the old displayed value into a different enquiry.
- [ ] Restrict collection-level lead creation and verify route precedence so any reachable Payload API cannot bypass the custom endpoint's validation and abuse protection. Preserve appropriate admin access. Review the intentional server-side use of `overrideAccess` against [Payload access-control guidance](https://payloadcms.com/docs/access-control/overview).
- [ ] Persist the lead before sending a notification. Record notification status; retain the lead if email fails. Use bounded retries/idempotency and include the selected specification in notifications.
- [ ] Keep direct WhatsApp usable if the lead service fails. If authoritative pricing is unavailable, suppress the numeric quote and offer a discussion rather than presenting fallback business rates.

The current client-side calculator receives pricing rules. Hiding line items in the UI does not make those rules secret. Keeping the simulation local is reasonable for beta; if commercial confidentiality becomes a requirement, move calculation behind a server endpoint as a separate decision.

**Primary files:** `src/lib/pricing.ts`, `src/components/EstimateCalculator.tsx`, `src/globals/PricingSettings.ts`, `src/app/api/leads/route.ts`, `src/collections/Leads.ts`, `src/lib/leadNotifications.ts`.

**Benefit:** credible simulations and reliable sales context. **Cost:** schema/version handling and real endpoint tests, beyond visual polish.

**Exit:** equivalent valid inputs give the same client/server result; invalid and stale inputs are handled explicitly; tampered totals do not become authoritative saved prices; direct collection creation cannot bypass the intended rules; a failed notification does not lose or duplicate the lead.

## Phase 4 — Complete portfolio, services, and CMS editing

**Goal:** make the portfolio useful to all three audiences and make future content replacement straightforward.

- [ ] Add a reusable project detail template under proposed routes `/ro/proiecte/[slug]` and `/en/projects/[slug]`. Keep `/ro/galerie` and `/en/gallery` as the portfolio indexes.
- [ ] Extend Projects with audience/space type, finish and lighting IDs, localized project detail text, demo/published state, and optional technical details. Reuse existing main/multiple image fields, `featured`, and sort order.
- [ ] Use unique stable project IDs and validated slugs. If slugs are translated, store their relationship explicitly for language switching.
- [ ] Show real project metadata only when present. Do not replace a missing area, location, or image with facts from a different demo project.
- [ ] Add simple filters: all, residential, commercial/hotel; optional finish/lighting filters only where enough entries exist. Make selected filters shareable without creating indexable duplicate pages.
- [ ] Project pages should include image gallery, brief scope, finish/lighting, relevant constraints, and “Discută un proiect similar”. Do not invent measurements or completion dates.
- [ ] Add a Services global or small collection, based on actual reuse. Candidate categories: stretch ceilings/finishes, integrated lighting, printed ceilings, acoustic solutions, stretch walls, maintenance/repairs. The owner's “almost all” is not confirmation of every category; unsupported items remain draft.
- [ ] Provide a concise service overview at proposed `/ro/servicii` and `/en/services`. Add separate service detail routes only when content is sufficient to make them useful.
- [ ] Add an architect section, and proposed `/ro/arhitecti` / `/en/architects` when there is useful content: collaboration process, information to send, design constraints to discuss, suitable examples, and a project enquiry CTA.
- [ ] Let architects send plans through WhatsApp/email initially. Do not build file uploads, a resource portal, or invented CAD downloads for beta.
- [ ] Add editable localized FAQ content. Useful subjects: how simulation differs from a final proposal, finish choice, lighting, measurement, installation planning, maintenance, and service area. Technical claims must match the actual supplied systems.
- [ ] Add explicit demo labels: “Imagine demonstrativă” / “Illustrative image” and “Proiect demonstrativ” / “Demo project”. Keep demo projects separate from verified completed work in content and structured data. Enforce publication filters in server-side public queries as well as collection access; review Payload Local API access-bypass defaults.
- [ ] Keep fictional testimonials out of public presentation. Developers can test testimonial layout with fixtures in a development preview; an empty public collection should hide the section.
- [ ] Make hero selection, featured projects, service order, contact details, locality list, and FAQs editable without deployment. Add concise field descriptions and preview support where useful.
- [ ] Preserve image aspect ratio, alt text, and focal point. Replace temporary images through CMS relationships, not component edits.
- [ ] Add schema migrations and regenerate Payload types/import map as required. Verify existing records survive the upgrade.

**Benefit:** turns a static gallery into a useful selection and enquiry tool; prepares for real content later. **Cost:** additional routes and editorial fields need sensible defaults and upkeep. Defer thin pages rather than publishing an empty catalogue.

**Exit:** an editor can create and replace a demo project, publish an approved project, choose featured content, translate it, and change service visibility; the website reflects those choices correctly. No code edit is needed for routine content replacement.

## Phase 5 — Add the ceiling-stretch animation with Motion

**Goal:** a memorable brand moment that suggests the actual material being tensioned into a ceiling.

Motion is the selected library, not a promise of automatic performance improvement over GSAP. Rendering cost depends on what moves, how much of the screen repaints, and how the browser handles it. Prefer transforms and opacity; profile any deformation. See [Motion performance](https://motion.dev/docs/performance).

### Visual sequence

1. A pale membrane sits loosely inside a fine architectural perimeter frame; a subtle shadow suggests slack.
2. Its corners draw toward the frame and its curved edge settles into a taut, smooth surface.
3. A restrained orange perimeter light resolves around it, connecting the installation idea to the brand.
4. The composition reveals or blends into the hero ceiling image. Text and CTA remain stable and readable.

Suggested first prototype timing: approximately 0.7–1.0 seconds total. These are design budgets to validate, not measured performance claims. Use a prepared membrane asset, a lightweight vector deformation, or a small layered composition; compare complexity and measured behavior before choosing. No Three.js, WebGL, physics simulation, full-screen video, or paid Motion feature is required for this beta.

### Required behavior

| Situation | Beta behavior |
|---|---|
| First homepage visit in a session | Play the short reveal in the hero media region. Header, headline, and calculator link are usable immediately. |
| Repeat visit or Back/Forward | Do not replay the introduction or reset calculator state. |
| Direct link to calculator/project | Respect the destination; skip the homepage introduction. |
| Navigation to another page | Default to a short entrance of the new page's media/content. Keep standard Next navigation and history behavior. |
| Genuine slow route/data load | Use a real localized loading state/skeleton. An optional small membrane motif may accompany it; do not fake progress percentages. |
| Reduced-motion preference | Show the final static composition immediately; remove nonessential movement. |
| JS failure or disabled JS | Server-rendered content and navigation remain visible. No opaque overlay remains stuck above the page. |

The recommended beta defaults implement the desired stretching idea as a first-visit reveal, not a mandatory wait. If the owner later chooses a full-screen version, it must be immediately skippable, bounded by an independent fail-open timeout, and proven not to hide useful content or block input. Never delay a navigation only to finish an animation.

### Implementation tasks

- [ ] Install `motion` and use its React integration inside focused client components; do not install GSAP alongside it. Verify the current API against [Motion installation](https://motion.dev/docs/react-installation).
- [ ] Keep the effect isolated from CMS fetches and calculator mounting. Do not convert the full app layout into a client component for animation.
- [ ] Use lazy feature loading where it reduces the actual bundle; measure the result rather than quoting the library's smallest advertised footprint. See [Motion bundle-size guidance](https://motion.dev/docs/react-reduce-bundle-size).
- [ ] Implement reduced motion using the supported Motion APIs and CSS fallback. Deformation/clip/path animation may need explicit disabling in addition to global preferences. See [Motion accessibility](https://motion.dev/docs/react-accessibility).
- [ ] Add CMS controls for enabled/disabled and approved preset selection; keep low-level timing and animation internals in code.
- [ ] Prototype the effect in an isolated preview first. Verify that it reads as a membrane becoming taut, not a generic wipe, curtain, or rubbery logo.
- [ ] Use subtle calculator panel transitions, around 150–220 ms. Keep keyboard focus predictable and make the final numerical result available to assistive technology without announcing every animation frame.
- [ ] Add short gallery/lightbox transitions if useful. Avoid blanket scroll reveals that initially hide every section.
- [ ] If a hero carousel remains, add pause/manual controls, stop rotation for reduced motion, and remove interactive elements from `aria-hidden` containers.
- [ ] Test rapid navigation, repeated clicks, browser history, direct links, resize, slow loading, and component unmount cleanup. Do not use undocumented router internals to force exit animations.

**Benefit:** a distinctive effect that explains the product visually. **Cost:** motion needs dedicated mobile/browser testing; a fullscreen gate can harm the exact conversion journey we want.

**Exit:** the approved effect is recognizable, optional, short, and stable. Animation-disabled and reduced-motion paths work completely; the effect never delays access to calculator controls or leaves a blocking layer behind.

## Phase 6 — Search visibility, accessibility, and performance

**Goal:** the improved interface remains discoverable and usable across devices.

### Search and content readiness

- [ ] Provide unique localized titles/descriptions, canonical URLs, alternate-language links, sitemap entries, and correct status codes for the implemented pages.
- [ ] Update the existing structured-data helper to use verified service areas and real published images. Build absolute URLs safely; do not blindly prepend the site URL to an already absolute image URL.
- [ ] Safely serialize JSON-LD so CMS text cannot terminate its script element. Exclude demo projects and unsupported review/rating claims.
- [ ] Use service and audience language naturally: tavane extensibile Constanța, iluminat integrat, hoteluri/spații comerciale, colaborare arhitecți. These are topic directions, not keyword-volume findings or ranking guarantees.
- [ ] Keep locality coverage concise and accurate. Do not generate ten near-identical town pages.
- [ ] Keep preview/demo pages out of search indexes. Use proper access protection for a private beta; `noindex` alone is not privacy protection.
- [ ] Verify legal/footer links and contact details. Before collecting real enquiries, have the owner review privacy/cookie text, actual analytics behavior, retention, and VAT wording. Do not add tracking or a cosmetic consent banner without deciding how it operates.

### Accessibility and responsive behavior

- [ ] Verify keyboard-only navigation, focus visibility/order, skip link, menu close/Escape behavior, field labels, errors, and announced result/submission status.
- [ ] Use native radios or equivalent correct semantics for mutually exclusive options; do not rely only on colored cards.
- [ ] Maintain readable contrast, comfortable touch targets, 200% zoom, and reflow at narrow widths. Aim for WCAG 2.2 AA; automated checks alone do not establish compliance.
- [ ] Test mobile calculator input with the software keyboard visible, sticky controls, orientation changes, and long translations.
- [ ] If adding a lightbox, manage focus, close with Escape, restore focus, and retain useful image alt text/captions.
- [ ] Test RO/EN in current Chrome, Firefox, Safari, iOS Safari, and Android Chrome where available; record unavailable environments.

### Performance and media

- [ ] Serve responsive images with explicit dimensions and suitable compression. Prioritize the first visible hero image, lazy-load below-fold media, and avoid loading every carousel image at full size immediately.
- [ ] Inspect actual file sizes and image-proxy timing. The current public image route involves Payload, a Digi download link, and a byte fetch; measure before changing the provider.
- [ ] Add bounded upstream image fetches, deliberate 404/502/timeout behavior, and a graceful visual fallback. Avoid treating all infrastructure errors as missing assets.
- [ ] Prevent stale replacements: use an asset revision/content hash in image cache keys while retaining stable asset identity. Verify replacement and deletion behavior through Next image optimization and any CDN cache.
- [ ] Record route JS and image bytes before/after. Suggested animation-only budget: at most 30 KB added compressed JS and 100 KB of extra compressed visual assets; explain and measure any necessary exception.
- [ ] Measure motion on/off under the same conditions. A useful investigation trigger is an LCP regression over 100 ms in repeated comparable lab runs; noisy measurements need interpretation, not an automatic pass/fail claim.
- [ ] Target good Core Web Vitals: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile once enough real-user data exists. Before that, use repeatable lab checks and mark field status as unknown. See [Web Vitals](https://web.dev/articles/vitals).
- [ ] Check that critical content is present in initial HTML. Marketing navigation should work without JavaScript; the calculator may show a useful contact fallback when JavaScript is unavailable.

**Benefit:** makes the beta useful beyond the developer's desktop. **Cost:** several issues will require device-specific fixes; no single Lighthouse score substitutes for the full journey.

**Exit:** no known critical keyboard, contrast, localization, or layout defects; measured performance is recorded honestly; published pages have appropriate metadata and indexability.

## Phase 7 — Verify and release a controlled beta

**Goal:** prove the agreed scope works, then deploy through the existing Vercel workflow when instructed.

### Required verification

| Area | Meaningful checks |
|---|---|
| Pricing | Decimal/dimension equivalence; invalid values; unknown/removed option IDs; minimum/range semantics; zero-fee cities; custom cities; EUR rounding; settings changes. |
| API | Valid lead; malformed/oversized body; tampered totals; unavailable pricing; invalid options; rate limit; duplicate request; DB failure; email failure; no public bypass through Payload REST. |
| CMS | Required fields, localization, featured selection, publish/demo state, empty collections, image replacement, revalidation, and access control. |
| Visitor journey | Both locales: configure → view relevant examples → return without losing configuration → inspect generated WhatsApp URL. Test messages using assertions; do not send real messages. |
| UI | Expanded form, mobile keyboard, long values, empty/error states, lightbox/menu focus, reduced motion, animation cleanup, Back/Forward. |
| Deployment | Build, migrations against disposable data, route/redirect smoke checks, environment configuration, image delivery, metadata, and rollback instructions. |

- [ ] Keep the four existing pricing tests and extend them for actual risks. Add real endpoint tests and a small Playwright smoke suite; do not write broad snapshot tests that merely duplicate markup.
- [ ] Add CI for lint, type checks, meaningful tests, and build. Use a disposable test database and safe notification adapter; preview builds must not modify production data.
- [ ] Use Vercel previews for review. Tag or otherwise record the verified release commit and migration state before deployment.
- [ ] Document application rollback separately from database rollback. Do not assume redeploying an older commit reverses a schema migration.
- [ ] Give the owner a short editor guide: prices, VAT text, projects, demo visibility, hero, translations, enquiries, and animation toggle.
- [ ] Keep a concise known-issues list with severity and ownership. Test with a small mix of homeowner, business, and architect users when available.
- [ ] If analytics are enabled, distinguish calculator start/completion, portfolio engagement, and WhatsApp click. A click is not a confirmed enquiry; do not send contact text or personal data in event payloads.

### Definition of beta

- [ ] The main journey works in RO and EN without assistance.
- [ ] Price configuration remains editable and invalid data cannot generate an authoritative misleading estimate.
- [ ] All visible controls work, including form and navigation states.
- [ ] Placeholder images/projects are clearly identified; fictional testimonials are not presented as real.
- [ ] CMS, image, and notification failures have deliberate behavior.
- [ ] The stretch animation passes the accessibility/failure/performance checks.
- [ ] Critical routes, access rules, and regression tests pass.
- [ ] Known limitations are documented; no critical blocker is disguised by fallback data.

Real photography, a full portfolio, and the future domain can remain outstanding for a controlled beta. Before an unrestricted public launch, replace or clearly separate demonstration content, approve the public service list and commercial wording, review privacy handling, and verify the intended domain/email setup. The original `noreply@vdbarrisol.ro` sender must not be assumed usable before that domain and sending identity are ready.

**Benefit:** makes “beta” a verifiable milestone. **Cost:** final reliability work takes time even when the UI already looks finished.

**Exit:** a verified beta release with a short handoff, measured checks, known limitations, and rollback procedure.

## Phase 8 — Future self-hosting, outside the beta release

**Goal:** move infrastructure later without rebuilding the public website.

Six cores and 12 GB RAM are a plausible starting point for a modest deployment, not a capacity guarantee. CPU generation, storage, concurrent load, image processing, upload bandwidth, and network/power availability matter. The current build script allows an 8 GB Node heap; that is a ceiling, not measured usage. Prefer building an artifact/image elsewhere if compiling alongside the live services would cause contention.

| Option | Advantage | Responsibility/trade-off |
|---|---|---|
| Keep Vercel/Neon/Digi | Least operational change | Provider costs and limits continue. |
| Move app first, keep managed DB/media | Smaller migration and easy comparison | Still depends on external services. |
| Move app, DB, and media locally | Maximum control | Backups, restore drills, TLS, patching, connectivity, monitoring, and recovery become owner responsibilities. |

Recommended order: app → media → database, as separate reversible projects. Keep Neon initially unless there is a concrete reason to move it too.

- [ ] Prepare a production Node/Docker deployment compatible with the installed Next/Payload versions. Verify the official [Next.js self-hosting guidance](https://nextjs.org/docs/app/guides/self-hosting) at migration time.
- [ ] Define a genuine storage interface for upload/read/delete/variants with provider-neutral metadata. Keep existing Digi records readable during transition; do not simply rename `digiStoragePath` and lose old assets.
- [ ] Test local connectivity, upstream bandwidth, public reachability/CGNAT constraints, HTTPS termination, process restart, resource limits, and health checks before DNS changes.
- [ ] Keep storage and DB private behind the application. Use persistent volumes and off-machine backups; prove a restore works.
- [ ] Load-test representative pages, media requests, admin editing, and enquiry volume on the actual hardware.
- [ ] Remove or gate Vercel-specific analytics when not applicable. Ensure caching, revalidation, and notification retries still work.
- [ ] If migrating media, copy first, verify counts/checksums, switch reads, monitor, and retain a rollback window. Do not delete the source as part of the initial cutover.
- [ ] If migrating Postgres later, make a separate migration/reconciliation plan for records and new enquiries during cutover.

**Exit:** migration is scheduled only after the target system has passed operational tests. Self-hosting is not a prerequisite for beta and should not be mixed into the UI redesign.

## 6. Suggested Codex session prompts

Start with:

> Read `VD_BARRISOL_BETA_PLAN.md` and the repository instructions. Complete Phase 0, then implement Phase 1 against the current checkout. Preserve existing CMS/pricing behavior and user edits. Use the bright architectural direction and orange palette. Fix the confirmed navigation/font/calculator layout issues. Use clearly identified placeholders where needed. Do not deploy or change production data. Finish with changed files, verification evidence, unresolved issues, and the next phase.

For subsequent sessions:

> Read `VD_BARRISOL_BETA_PLAN.md` and current `task.md`. Verify the previous phase's status and complete Phase N only. Reuse existing implementation; do not rebuild completed features. Meet the phase's exit criteria, update progress, and report concrete blockers rather than claiming untested work passed.

If a phase is too large for one review, split it by its numbered subsection or by a cohesive functional change. Keep the phase boundary and acceptance criteria intact.

## 7. Evidence images

The Markdown plan is usable on its own. For the visual appendix, extract the companion ZIP; it contains this file and the following screenshots in matching relative paths.

### Existing homepage

![Existing Romanian homepage and calculator layout](evidence/vd-01-home.jpg)

### Calculator progression and optional form

![Step 2: finish options](evidence/vd-02-finish.jpg)

![Step 3: lighting options and contrast problem](evidence/vd-03-lighting.jpg)

![Step 4: details and disabled final action](evidence/vd-04-details.jpg)

![Step 5: form reveal and overlap](evidence/vd-05-form.jpg)

### Portfolio and localization

![Step 6: existing gallery](evidence/vd-06-gallery.jpg)

![Step 7: English calculator with Romanian content](evidence/vd-07-english.jpg)

### Competitor visual references

![VIPcasa desktop homepage](evidence/ref-vipcasa.jpg)

![Symetric Barrisol page, with cookie panel visible](evidence/ref-symetric.jpg)

![Barrisol Welch desktop homepage](evidence/ref-welch.jpg)
