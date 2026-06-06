import type { Locale } from '@/lib/i18n'
import type { PublicProject, PublicSiteSettings } from '@/lib/publicTypes'

export const buildProfessionalServiceJsonLd = ({
  locale,
  projects,
  settings,
}: {
  locale: Locale
  projects: PublicProject[]
  settings: PublicSiteSettings
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vdbarrisol.ro'

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    areaServed: [
      {
        '@type': 'City',
        name: settings.mainCity,
      },
      {
        '@type': 'Country',
        name: locale === 'ro' ? 'Romania' : 'Romania',
      },
    ],
    description: settings.seoDescription,
    email: settings.email || undefined,
    image: projects.map((project) => `${siteUrl}${project.image.src}`),
    name: settings.brandName,
    telephone: settings.phone || undefined,
    url: siteUrl,
  }
}
