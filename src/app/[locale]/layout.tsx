import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { isLocale, type Locale } from '@/lib/i18n'
import { getPublicSiteData } from '@/lib/publicData'

export const revalidate = 300

export async function generateStaticParams() {
  return [{ locale: 'ro' }, { locale: 'en' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params

  if (!isLocale(rawLocale)) {
    notFound()
  }

  const locale = rawLocale as Locale
  const data = await getPublicSiteData(locale)

  return (
    <>
      <Header locale={locale} nav={data.nav} settings={data.settings} />
      <main>{children}</main>
      <Footer locale={locale} nav={data.nav} settings={data.settings} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
