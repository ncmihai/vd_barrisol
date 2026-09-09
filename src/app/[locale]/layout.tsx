import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isLocale, localizedPaths, type Locale } from "@/lib/i18n";
import { getPublicSiteData } from "@/lib/publicData";

export const revalidate = 300;

export async function generateStaticParams() {
  return [{ locale: "ro" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const data = await getPublicSiteData(locale);
  const nav = {
    ...data.nav,
    headerLinks: [...data.nav.headerLinks],
    footerLinks: [...data.nav.footerLinks],
  };
  const servicePath = localizedPaths[locale].services;
  if (
    data.services?.items.length &&
    !nav.headerLinks.some((link) => link.href === servicePath)
  )
    nav.headerLinks.push({
      href: servicePath,
      label: locale === "ro" ? "Servicii" : "Services",
    });
  if (
    data.services?.architects &&
    !nav.footerLinks.some(
      (link) => link.href === localizedPaths[locale].architects,
    )
  )
    nav.footerLinks.push({
      href: localizedPaths[locale].architects,
      label: locale === "ro" ? "Arhitecti" : "Architects",
    });

  return (
    <>
      <a className="skip-link" href="#main-content">
        {locale === "ro" ? "Sari la continut" : "Skip to content"}
      </a>
      <Header locale={locale} nav={nav} settings={data.settings} />
      <main id="main-content">
        {data.contentStatus === "demo" && (
          <p className="demo-notice">
            {locale === "ro"
              ? "Demonstratie: imaginile, proiectele si preturile sunt illustrative."
              : "Demo: images, projects and prices are illustrative."}
          </p>
        )}
        {children}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              locale === "ro"
                ? '<p>Pentru o estimare, <a href="#contact">contacteaza-ne</a>.</p>'
                : '<p>For an estimate, <a href="#contact">contact us</a>.</p>',
          }}
        />
      </main>
      <Footer locale={locale} nav={nav} settings={data.settings} />
      {process.env.VERCEL && process.env.VDB_ANALYTICS === "1" && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
