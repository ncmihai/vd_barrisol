import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { isLocale, type Locale } from '@/lib/i18n'
import { getPublicSiteData } from '@/lib/publicData'

export const revalidate = 300

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'ro'
  const data = await getPublicSiteData(locale)
  const title = data.about.seoTitle || data.about.headline
  const description = data.about.seoDescription || data.about.intro

  return {
    alternates: {
      canonical: locale === 'ro' ? '/ro/despre' : '/en/about',
      languages: {
        en: '/en/about',
        ro: '/ro/despre',
      },
    },
    description,
    title,
  }
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params

  if (!isLocale(rawLocale)) {
    notFound()
  }

  const locale = rawLocale as Locale
  const data = await getPublicSiteData(locale)

  return (
    <>
      <section className="page-hero page-hero--about">
        <div className="section__inner about-hero-grid">
          <div>
            <p className="eyebrow">{locale === 'ro' ? 'Despre' : 'About'}</p>
            <h1>{data.about.headline}</h1>
            <p>{data.about.intro}</p>
          </div>
          <div className="about-hero-image">
            <Image
              alt={data.about.image.alt}
              fill
              priority
              sizes="(max-width: 720px) 100vw, 42vw"
              src={data.about.image.src}
            />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section__inner value-grid">
          {data.about.values.map((value) => (
            <article className="value-item" key={value.title}>
              <h2>{value.title}</h2>
              <p>{value.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
