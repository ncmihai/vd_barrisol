import type { Locale } from "@/lib/i18n";
import type { PublicProject, PublicSiteSettings } from "@/lib/publicTypes";
import { getSiteUrl } from "@/lib/siteUrl";

export const buildProfessionalServiceJsonLd = ({
  locale: _locale,
  projects,
  settings,
}: {
  locale: Locale;
  projects: PublicProject[];
  settings: PublicSiteSettings;
}) => {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    areaServed: [
      ...[settings.mainCity, ...settings.serviceCities]
        .filter(Boolean)
        .map((name) => ({ "@type": "City", name })),
    ],
    description: settings.seoDescription,
    email: settings.email || undefined,
    image: projects
      .filter(
        (project) =>
          project.publication === "published" &&
          !project.image.src.startsWith("/placeholders/"),
      )
      .map((project) => project.image.src)
      .filter((src) => src.startsWith("http") || src.startsWith("/"))
      .map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`)),
    name: settings.brandName,
    sameAs: [settings.facebookUrl, settings.instagramUrl].filter(Boolean),
    telephone: settings.phone || undefined,
    url: siteUrl,
  };
};
