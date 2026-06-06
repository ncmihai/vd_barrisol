import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '@/components/LegalPage'
import { getLegalPageContent } from '@/lib/legalContent'

export const revalidate = 300

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const content = getLegalPageContent('privacy', 'ro')

  return {
    alternates: {
      canonical: '/ro/confidentialitate',
      languages: {
        en: '/en/privacy',
        ro: '/ro/confidentialitate',
      },
    },
    description: content.description,
    title: content.title,
  }
}

export default async function ConfidentialitatePage({ params }: PageProps) {
  const { locale } = await params

  if (locale !== 'ro') {
    notFound()
  }

  return <LegalPage kind="privacy" locale="ro" />
}
