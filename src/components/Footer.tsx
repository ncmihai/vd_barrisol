import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { localizedPaths } from "@/lib/i18n";
import type { PublicNav, PublicSiteSettings } from "@/lib/publicTypes";

export function Footer({
  locale,
  nav,
  settings,
}: {
  locale: Locale;
  nav: PublicNav;
  settings: PublicSiteSettings;
}) {
  const socialLinks = [
    settings.facebookUrl
      ? { href: settings.facebookUrl, label: "Facebook" }
      : null,
    settings.instagramUrl
      ? { href: settings.instagramUrl, label: "Instagram" }
      : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Link href={localizedPaths[locale].home}>{settings.brandName}</Link>
        <p>{nav.footerText}</p>
        <div className="site-footer__company">
          {settings.legalName && <span>{settings.legalName}</span>}
          {settings.registrationNumber && (
            <span>{settings.registrationNumber}</span>
          )}
        </div>
      </div>
      <div className="site-footer__column">
        <h2>{locale === "ro" ? "Linkuri" : "Links"}</h2>
        <div className="site-footer__links">
          {nav.footerLinks.map((link) => (
            <a
              href={link.href}
              key={`${link.href}-${link.label}`}
              rel={link.newTab ? "noreferrer" : undefined}
              target={link.newTab ? "_blank" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="site-footer__column">
        <h2>{locale === "ro" ? "Contact" : "Contact"}</h2>
        <div className="site-footer__contact">
          {settings.phone && (
            <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
              {settings.phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          )}
          {settings.whatsappNumber && (
            <a href={settings.whatsappHref}>WhatsApp</a>
          )}
          {socialLinks.map((link) => (
            <a
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>{settings.mainCity}</span>
        {nav.creditHref ? (
          <a href={nav.creditHref}>{nav.creditLabel}</a>
        ) : (
          <span>{nav.creditLabel}</span>
        )}
      </div>
    </footer>
  );
}
