import type { Locale } from "@/lib/i18n";
import type { PublicProject, PublicSiteSettings } from "@/lib/publicTypes";
import { getSiteUrl } from "@/lib/siteUrl";

export const buildProfessionalServiceJsonLd = ({
  locale,
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
      {
        "@type": "City",
        name: settings.mainCity,
      },
      {
        "@type": "Country",
        name: locale === "ro" ? "Romania" : "Romania",
      },
    ],
    description: settings.seoDescription,
    email: settings.email || undefined,
    image: projects.map((project) => `${siteUrl}${project.image.src}`),
    name: settings.brandName,
    sameAs: [settings.facebookUrl, settings.instagramUrl].filter(Boolean),
    telephone: settings.phone || undefined,
    url: siteUrl,
  };
};
