import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '@/components/LegalPage'
import { isLocale, type Locale } from '@/lib/i18n'
import { getLegalPageContent } from '@/lib/legalContent'

export const revalidate = 300

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'ro'
  const content = getLegalPageContent('cookies', locale)

  return {
    alternates: {
      canonical: `/${locale}/cookies`,
      languages: {
        en: '/en/cookies',
        ro: '/ro/cookies',
      },
    },
    description: content.description,
    title: content.title,
  }
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params

  if (!isLocale(rawLocale)) {
    notFound()
  }

  return <LegalPage kind="cookies" locale={rawLocale as Locale} />
}
