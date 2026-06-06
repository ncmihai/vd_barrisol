import Link from 'next/link'

import type { Locale } from '@/lib/i18n'
import { localizedPaths } from '@/lib/i18n'
import type { PublicNav, PublicSiteSettings } from '@/lib/publicTypes'

export function Footer({
  locale,
  nav,
  settings,
}: {
  locale: Locale
  nav: PublicNav
  settings: PublicSiteSettings
}) {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Link href={localizedPaths[locale].home}>{settings.brandName}</Link>
        <p>{nav.footerText}</p>
      </div>
      <div className="site-footer__links">
        {nav.footerLinks.map((link) => (
          <a
            href={link.href}
            key={`${link.href}-${link.label}`}
            rel={link.newTab ? 'noreferrer' : undefined}
            target={link.newTab ? '_blank' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="site-footer__contact">
        {settings.phone && <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a>}
        {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
        {settings.whatsappNumber && <a href={settings.whatsappHref}>WhatsApp</a>}
      </div>
      <div className="site-footer__bottom">
        <span>{settings.mainCity}</span>
        {nav.creditHref ? <a href={nav.creditHref}>{nav.creditLabel}</a> : <span>{nav.creditLabel}</span>}
      </div>
    </footer>
  )
}
