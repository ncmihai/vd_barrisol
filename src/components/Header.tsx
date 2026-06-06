import Image from 'next/image'
import Link from 'next/link'

import type { Locale } from '@/lib/i18n'
import { localizedPaths, routeLabels } from '@/lib/i18n'
import type { PublicNav, PublicSiteSettings } from '@/lib/publicTypes'

export function Header({
  locale,
  nav,
  settings,
}: {
  locale: Locale
  nav: PublicNav
  settings: PublicSiteSettings
}) {
  const labels = routeLabels[locale]

  return (
    <header className="site-header">
      <Link aria-label={settings.brandName} className="brand-lockup" href={localizedPaths[locale].home}>
        <Image
          alt={settings.logo.alt}
          className="brand-lockup__mark"
          height={64}
          priority
          src={settings.logo.src}
          width={180}
        />
      </Link>
      <nav aria-label="Primary navigation" className="site-nav">
        {nav.headerLinks.map((link) => (
          <Link href={link.href} key={`${link.href}-${link.label}`}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="locale-link" href={labels.localeSwitchPath}>
          {labels.localeSwitch}
        </Link>
        <a className="header-whatsapp" href={settings.whatsappNumber ? settings.whatsappHref : '#contact'}>
          {labels.whatsapp}
        </a>
      </div>
    </header>
  )
}
