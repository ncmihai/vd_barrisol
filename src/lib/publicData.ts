import { getFallbackSiteData } from "@/lib/fallbackContent";
import { localizedPaths, routeLabels, type Locale } from "@/lib/i18n";
import { getDatabaseUrl } from "@/lib/databaseUrl";
import type {
  PublicAboutPage,
  PublicGalleryPage,
  PublicHomePage,
  PublicImage,
  PublicNav,
  PublicProject,
  PublicSiteData,
  PublicSiteSettings,
  PublicTestimonial,
} from "@/lib/publicTypes";

type AnyRecord = Record<string, unknown>;
type LocalizedPathKey = keyof (typeof localizedPaths)["ro"];

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" ? (value as AnyRecord) : {};

const getRelationId = (value: unknown) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && "id" in value) {
    return String((value as { id?: string | number }).id || "");
  }

  return String(value);
};

const imageFromAsset = (asset: unknown, fallback: PublicImage): PublicImage => {
  if (!asset || typeof asset !== "object") {
    return fallback;
  }

  const item = asset as AnyRecord;
  const id = getRelationId(item);
  const variants = (
    item.variants && typeof item.variants === "object" ? item.variants : {}
  ) as AnyRecord;
  const preferredVariant =
    item.preferredVariant && item.preferredVariant !== "auto"
      ? item.preferredVariant
      : "2k";
  const variant =
    preferredVariant === "1080"
      ? (variants.hd1080 as AnyRecord | undefined)
      : preferredVariant === "original"
        ? (variants.original as AnyRecord | undefined)
        : preferredVariant === "thumbnail"
          ? (variants.thumbnail as AnyRecord | undefined)
          : ((variants.twoK ||
              variants.hd1080 ||
              variants.original ||
              variants.thumbnail) as AnyRecord | undefined);

  if (!id || item.uploadStatus !== "ready" || !variant?.digiStoragePath) {
    return fallback;
  }

  return {
    alt: nonEmptyString(item.alt, fallback.alt),
    height:
      typeof variant.height === "number" ? variant.height : fallback.height,
    src: `/api/assets/images/${id}?variant=${preferredVariant}`,
    width: typeof variant.width === "number" ? variant.width : fallback.width,
  };
};

const whatsappHref = (number?: unknown) => {
  const normalized = String(number || "").replace(/[^\d]/g, "");

  return normalized ? `https://wa.me/${normalized}` : "https://wa.me/";
};

const nonEmptyString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const navigationLabel = (href: string, locale: Locale, fallback: string) => {
  const normalizedHref = href.replace(/\/$/, "");
  const paths = localizedPaths[locale];
  const labels = routeLabels[locale];

  if (normalizedHref === paths.home) return labels.home;
  if (normalizedHref === paths.gallery) return labels.gallery;
  if (normalizedHref === paths.about) return labels.about;
  if (normalizedHref === paths.privacy) {
    return locale === "ro" ? "Confidentialitate" : "Privacy";
  }
  if (normalizedHref === paths.cookies) return "Cookies";
  if (normalizedHref === "#calculator") return labels.calculator;
  if (normalizedHref === "#contact") return labels.contact;

  return fallback;
};

const internalRouteKeysBySlug = new Map<string, LocalizedPathKey>(
  Object.values(localizedPaths).flatMap((paths) =>
    Object.entries(paths).map(
      ([key, href]) => [href, key as LocalizedPathKey] as const,
    ),
  ),
);

const localizeInternalHref = (href: string, locale: Locale) => {
  const routeKey = internalRouteKeysBySlug.get(href);

  if (!routeKey) {
    return href;
  }

  return localizedPaths[locale][routeKey];
};

const shouldUseFallbackContent = () =>
  !getDatabaseUrl() ||
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.VDB_FORCE_STATIC_FALLBACK === "1";

export const getPublicSiteData = async (
  locale: Locale,
): Promise<PublicSiteData> => {
  const fallback = getFallbackSiteData(locale);

  if (shouldUseFallbackContent()) {
    return fallback;
  }

  try {
    const [{ default: config }, { getPayload }] = await Promise.all([
      import("@payload-config"),
      import("payload"),
    ]);
    const payload = await getPayload({ config });
    const [
      siteSettings,
      navigationFooter,
      homePage,
      galleryPage,
      aboutPage,
      pricingSettings,
      projects,
      testimonials,
    ] = await Promise.all([
      payload.findGlobal({ depth: 2, locale, slug: "site-settings" }),
      payload.findGlobal({ depth: 1, locale, slug: "navigation-footer" }),
      payload.findGlobal({ depth: 2, locale, slug: "home-page" }),
      payload.findGlobal({ depth: 1, locale, slug: "gallery-page" }),
      payload.findGlobal({ depth: 2, locale, slug: "about-page" }),
      payload.findGlobal({ depth: 0, locale, slug: "pricing-settings" }),
      payload.find({
        collection: "projects",
        depth: 2,
        limit: 20,
        locale,
        sort: "sortOrder",
      }),
      payload.find({
        collection: "testimonials",
        depth: 2,
        limit: 20,
        locale,
        sort: "sortOrder",
      }),
    ]);

    const settings = mapSiteSettings(asRecord(siteSettings), fallback.settings);
    const nav = mapNavigation(asRecord(navigationFooter), fallback.nav, locale);
    const home = mapHomePage(asRecord(homePage), fallback.home);
    const gallery = mapGalleryPage(asRecord(galleryPage), fallback.gallery);
    const about = mapAboutPage(asRecord(aboutPage), fallback.about);
    const mappedProjects = projects.docs
      .map((project) => mapProject(asRecord(project)))
      .filter((project) => project.title && project.summary);
    const mappedTestimonials = testimonials.docs
      .map((testimonial) => mapTestimonial(asRecord(testimonial)))
      .filter((testimonial) => testimonial.clientName && testimonial.quote);

    return {
      about,
      gallery,
      home,
      nav,
      pricing: {
        ...fallback.pricing,
        ...asRecord(pricingSettings),
      },
      projects: mappedProjects,
      settings,
      testimonials: mappedTestimonials,
    };
  } catch (error) {
    console.warn(
      "[public-data] using fallback content",
      error instanceof Error ? error.message : error,
    );

    return fallback;
  }
};

const mapSiteSettings = (
  doc: AnyRecord,
  fallback: PublicSiteSettings,
): PublicSiteSettings => {
  const seo = asRecord(doc.seo);
  const whatsappNumber = nonEmptyString(
    doc.whatsappNumber,
    fallback.whatsappNumber,
  );

  return {
    brandName: nonEmptyString(doc.brandName, fallback.brandName),
    domain: nonEmptyString(doc.domain, fallback.domain),
    email: nonEmptyString(doc.email, fallback.email),
    facebookUrl: nonEmptyString(doc.facebookUrl, fallback.facebookUrl),
    instagramUrl: nonEmptyString(doc.instagramUrl, fallback.instagramUrl),
    legalName: nonEmptyString(doc.legalName, fallback.legalName),
    logo: imageFromAsset(doc.logoImage, fallback.logo),
    mainCity: nonEmptyString(doc.mainCity, fallback.mainCity),
    phone: nonEmptyString(doc.phone, fallback.phone),
    registrationNumber: nonEmptyString(
      doc.registrationNumber,
      fallback.registrationNumber,
    ),
    seoDescription: nonEmptyString(seo.description, fallback.seoDescription),
    seoTitle: nonEmptyString(seo.title, fallback.seoTitle),
    serviceArea: nonEmptyString(doc.serviceArea, fallback.serviceArea),
    serviceCities:
      Array.isArray(doc.serviceCities) && doc.serviceCities.length > 0
        ? doc.serviceCities
            .map((item) => nonEmptyString(asRecord(item).city, ""))
            .filter(Boolean)
        : fallback.serviceCities,
    whatsappHref: whatsappHref(whatsappNumber),
    whatsappNumber,
  };
};

const mapNavigation = (
  doc: AnyRecord,
  fallback: PublicNav,
  locale: Locale,
): PublicNav => ({
  creditHref: nonEmptyString(doc.creditHref, fallback.creditHref || ""),
  creditLabel: nonEmptyString(doc.creditLabel, fallback.creditLabel),
  footerLinks:
    Array.isArray(doc.footerLinks) && doc.footerLinks.length > 0
      ? doc.footerLinks.map((link: AnyRecord) => {
          const href = localizeInternalHref(nonEmptyString(link.href, "#"), locale);
          return {
            href,
            label: navigationLabel(
              href,
              locale,
              locale === "ro" ? "Sectiune" : "Section",
            ),
            newTab: Boolean(link.newTab),
          };
        })
      : fallback.footerLinks,
  footerText: nonEmptyString(doc.footerText, fallback.footerText),
  headerLinks:
    Array.isArray(doc.headerLinks) && doc.headerLinks.length > 0
      ? doc.headerLinks.map((link: AnyRecord) => {
          const href = localizeInternalHref(nonEmptyString(link.href, "#"), locale);
          return {
            href,
            label: navigationLabel(
              href,
              locale,
              locale === "ro" ? "Sectiune" : "Section",
            ),
          };
        })
      : fallback.headerLinks,
});

const mapHomePage = (
  doc: AnyRecord,
  fallback: PublicHomePage,
): PublicHomePage => {
  const calculator = asRecord(doc.calculator);
  const contact = asRecord(doc.contact);
  const hero = asRecord(doc.hero);
  const seo = asRecord(doc.seo);
  const slides = Array.isArray(hero.slides) ? hero.slides : [];

  return {
    calculatorCopy: nonEmptyString(calculator.copy, fallback.calculatorCopy),
    calculatorHeadline: nonEmptyString(
      calculator.headline,
      fallback.calculatorHeadline,
    ),
    contactCopy: nonEmptyString(contact.copy, fallback.contactCopy),
    contactHeadline: nonEmptyString(contact.headline, fallback.contactHeadline),
    heroCopy: nonEmptyString(hero.copy, fallback.heroCopy),
    heroEyebrow: nonEmptyString(hero.eyebrow, fallback.heroEyebrow),
    heroHeadline: nonEmptyString(hero.headline, fallback.heroHeadline),
    heroSlides:
      slides.length > 0
        ? slides.map((rawSlide, index) => {
            const slide = asRecord(rawSlide);

            return {
              caption: nonEmptyString(
                slide.caption,
                fallback.heroSlides[index % fallback.heroSlides.length]
                  ?.caption || "",
              ),
              image: imageFromAsset(
                slide.image,
                fallback.heroSlides[index % fallback.heroSlides.length]
                  ?.image || fallback.heroSlides[0].image,
              ),
            };
          })
        : fallback.heroSlides,
    seoDescription: nonEmptyString(
      seo.description,
      fallback.seoDescription || "",
    ),
    seoTitle: nonEmptyString(seo.title, fallback.seoTitle || ""),
  };
};

const mapGalleryPage = (
  doc: AnyRecord,
  fallback: PublicGalleryPage,
): PublicGalleryPage => {
  const seo = asRecord(doc.seo);

  return {
    copy: nonEmptyString(doc.copy, fallback.copy),
    headline: nonEmptyString(doc.headline, fallback.headline),
    seoDescription: nonEmptyString(
      seo.description,
      fallback.seoDescription || "",
    ),
    seoTitle: nonEmptyString(seo.title, fallback.seoTitle || ""),
  };
};

const mapAboutPage = (
  doc: AnyRecord,
  fallback: PublicAboutPage,
): PublicAboutPage => {
  const seo = asRecord(doc.seo);

  return {
    headline: nonEmptyString(doc.headline, fallback.headline),
    image: imageFromAsset(doc.image, fallback.image),
    intro: nonEmptyString(doc.intro, fallback.intro),
    seoDescription: nonEmptyString(
      seo.description,
      fallback.seoDescription || "",
    ),
    seoTitle: nonEmptyString(seo.title, fallback.seoTitle || ""),
    values:
      Array.isArray(doc.values) && doc.values.length > 0
        ? doc.values.map((rawValue) => {
            const value = asRecord(rawValue);

            return {
              copy: nonEmptyString(value.copy, ""),
              title: nonEmptyString(value.title, ""),
            };
          })
        : fallback.values,
  };
};

const mapProject = (doc: AnyRecord): PublicProject => ({
  areaSqm: typeof doc.areaSqm === "number" ? doc.areaSqm : undefined,
  ceilingType: nonEmptyString(doc.ceilingType, ""),
  city: nonEmptyString(doc.city, ""),
  featured: Boolean(doc.featured),
  image: imageFromAsset(doc.mainImage, fallbackImage),
  slug: nonEmptyString(doc.slug, ""),
  summary: nonEmptyString(doc.summary, ""),
  title: nonEmptyString(doc.title, ""),
});

const mapTestimonial = (doc: AnyRecord): PublicTestimonial => ({
  city: nonEmptyString(doc.city, ""),
  clientName: nonEmptyString(doc.clientName, ""),
  headline: nonEmptyString(doc.headline, ""),
  image: doc.image
    ? imageFromAsset(doc.image, fallbackImage)
    : undefined,
  quote: nonEmptyString(doc.quote, ""),
});

const fallbackImage: PublicImage = {
  alt: "VD BARRISOL project image",
  src: "/placeholders/stretch-ceiling-detail.png",
};
