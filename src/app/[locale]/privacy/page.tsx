import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '@/components/LegalPage'
import { getLegalPageContent } from '@/lib/legalContent'

export const revalidate = 300

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const content = getLegalPageContent('privacy', 'en')

  return {
    alternates: {
      canonical: '/en/privacy',
      languages: {
        en: '/en/privacy',
        ro: '/ro/confidentialitate',
      },
    },
    description: content.description,
    title: content.title,
  }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params

  if (locale !== 'en') {
    notFound()
  }

  return <LegalPage kind="privacy" locale="en" />
}
