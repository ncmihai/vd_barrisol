import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EstimateCalculator } from '@/components/EstimateCalculator'
import { HeroCarousel } from '@/components/HeroCarousel'
import { ProjectGrid } from '@/components/ProjectGrid'
import { TestimonialList } from '@/components/TestimonialList'
import { isLocale, type Locale } from '@/lib/i18n'
import { getPublicSiteData } from '@/lib/publicData'
import { buildProfessionalServiceJsonLd } from '@/lib/structuredData'

export const revalidate = 300

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'ro'
  const data = await getPublicSiteData(locale)
  const title = data.home.seoTitle || data.settings.seoTitle
  const description = data.home.seoDescription || data.settings.seoDescription

  return {
    alternates: {
      canonical: locale === 'ro' ? '/ro' : '/en',
      languages: {
        en: '/en',
        ro: '/ro',
      },
    },
    description,
    openGraph: {
      description,
      images: [data.home.heroSlides[0]?.image.src || data.settings.logo.src],
      locale,
      siteName: data.settings.brandName,
      title,
      type: 'website',
    },
    title,
  }
}

export default async function Home({ params }: PageProps) {
  const { locale: rawLocale } = await params

  if (!isLocale(rawLocale)) {
    notFound()
  }

  const locale = rawLocale as Locale
  const data = await getPublicSiteData(locale)
  const whatsappHref = data.settings.whatsappNumber ? data.settings.whatsappHref : '#contact'
  const jsonLd = buildProfessionalServiceJsonLd({
    locale,
    projects: data.projects,
    settings: data.settings,
  })

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <HeroCarousel home={data.home} locale={locale} settings={data.settings} />

      <section className="section section--intro">
        <div className="section__inner intro-grid">
          <div>
            <p className="eyebrow">{data.settings.serviceArea}</p>
            <h2>{locale === 'ro' ? 'Finisaj curat. Lumina integrata. Montaj precis.' : 'Clean finish. Integrated light. Precise installation.'}</h2>
          </div>
          <p>
            {locale === 'ro'
              ? 'Site-ul este construit ca administrarea continutului sa ramana simpla: imagini, proiecte, testimoniale, preturi si date de contact se modifica din Payload.'
              : 'The site is built so content management stays simple: images, projects, testimonials, prices, and contact details are edited from Payload.'}
          </p>
        </div>
      </section>

      <section className="section section--calculator" id="calculator">
        <div className="section__inner">
          <div className="section-heading">
            <p className="eyebrow">{locale === 'ro' ? 'Calculator' : 'Calculator'}</p>
            <h2>{data.home.calculatorHeadline}</h2>
            <p>{data.home.calculatorCopy}</p>
          </div>
          <EstimateCalculator locale={locale} pricing={data.pricing} whatsappHref={whatsappHref} />
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section-heading section-heading--row">
            <div>
              <p className="eyebrow">{locale === 'ro' ? 'Lucrari' : 'Work'}</p>
              <h2>{locale === 'ro' ? 'Exemple de proiecte' : 'Project examples'}</h2>
            </div>
            <a className="text-link" href={locale === 'ro' ? '/ro/galerie' : '/en/gallery'}>
              {locale === 'ro' ? 'Vezi galeria' : 'View gallery'}
            </a>
          </div>
          <ProjectGrid projects={data.projects.slice(0, 2)} />
        </div>
      </section>

      <section className="section section--contact" id="contact">
        <div className="section__inner contact-grid">
          <div>
            <p className="eyebrow">{locale === 'ro' ? 'Contact' : 'Contact'}</p>
            <h2>{data.home.contactHeadline}</h2>
            <p>{data.home.contactCopy}</p>
          </div>
          <div className="contact-panel">
            {data.settings.phone && <a href={`tel:${data.settings.phone.replace(/\s+/g, '')}`}>{data.settings.phone}</a>}
            {data.settings.email && <a href={`mailto:${data.settings.email}`}>{data.settings.email}</a>}
            <a className="button button--primary" href={whatsappHref}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="section section--testimonials">
        <div className="section__inner">
          <TestimonialList testimonials={data.testimonials.slice(0, 2)} />
        </div>
      </section>
    </>
  )
}
