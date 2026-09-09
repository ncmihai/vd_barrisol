import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EstimateCalculator } from "@/components/EstimateCalculator";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProjectGrid } from "@/components/ProjectGrid";
import { TestimonialList } from "@/components/TestimonialList";
import { ServicesContent } from "@/components/ServicesContent";
import { isLocale, type Locale } from "@/lib/i18n";
import { getPublicSiteData } from "@/lib/publicData";
import { buildProfessionalServiceJsonLd } from "@/lib/structuredData";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "ro";
  const data = await getPublicSiteData(locale);
  const title = data.home.seoTitle || data.settings.seoTitle;
  const description = data.home.seoDescription || data.settings.seoDescription;

  return {
    alternates: {
      canonical: locale === "ro" ? "/ro" : "/en",
      languages: {
        en: "/en",
        ro: "/ro",
      },
    },
    description,
    openGraph: {
      description,
      images: [data.home.heroSlides[0]?.image.src || data.settings.logo.src],
      locale,
      siteName: data.settings.brandName,
      title,
      type: "website",
    },
    title,
  };
}

export default async function Home({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const data = await getPublicSiteData(locale);
  const whatsappHref = data.settings.whatsappNumber
    ? data.settings.whatsappHref
    : "#contact";
  const jsonLd = buildProfessionalServiceJsonLd({
    locale,
    projects: data.projects,
    settings: data.settings,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <HeroCarousel home={data.home} locale={locale} settings={data.settings} />

      <section className="section section--intro">
        <div className="section__inner intro-grid">
          <div>
            <p className="eyebrow">
              {locale === "ro"
                ? "Solutii pentru interior"
                : "Interior solutions"}
            </p>
            <h2>
              {locale === "ro"
                ? "Finisaj curat. Lumina integrata. Montaj precis."
                : "Clean finish. Integrated light. Precise installation."}
            </h2>
          </div>
          <p>
            {locale === "ro"
              ? "Fiecare proiect incepe cu masuratori clare, alegerea finisajului potrivit si o discutie despre lumina, acces si detaliile de montaj."
              : "Every project starts with clear measurements, the right finish, and a practical discussion about light, access, and installation details."}
          </p>
        </div>
      </section>

      <section className="section section--calculator" id="calculator">
        <div className="section__inner calculator-layout">
          <div className="section-heading">
            <p className="eyebrow">
              {locale === "ro" ? "Calculator" : "Calculator"}
            </p>
            <h2>{data.home.calculatorHeadline}</h2>
            <p>{data.home.calculatorCopy}</p>
          </div>
          <EstimateCalculator
            pricingAvailable={data.pricingAvailable}
            locale={locale}
            pricing={data.pricing}
            serviceCities={data.settings.serviceCities}
            whatsappHref={whatsappHref}
          />
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section-heading section-heading--row">
            <div>
              <p className="eyebrow">{locale === "ro" ? "Lucrari" : "Work"}</p>
              <h2>
                {locale === "ro" ? "Exemple de proiecte" : "Project examples"}
              </h2>
            </div>
            <a
              className="text-link"
              href={locale === "ro" ? "/ro/galerie" : "/en/gallery"}
            >
              {locale === "ro" ? "Vezi galeria" : "View gallery"}
            </a>
          </div>
          {data.projects.length > 0 ? (
            <ProjectGrid
              locale={locale}
              projects={(data.projects.filter((project) => project.featured)
                .length > 0
                ? data.projects.filter((project) => project.featured)
                : data.projects
              ).slice(0, 2)}
            />
          ) : (
            <p className="content-empty">
              {locale === "ro"
                ? "Exemplele de proiecte vor fi adaugate aici."
                : "Project examples will be added here."}
            </p>
          )}
        </div>
      </section>

      {data.testimonials.length > 0 && (
        <section className="section section--testimonials">
          <div className="section__inner">
            <TestimonialList testimonials={data.testimonials.slice(0, 2)} />
          </div>
        </section>
      )}
      <ServicesContent data={data} locale={locale} />
      <section className="section section--coverage">
        <div className="section__inner coverage-grid">
          <h2>
            {locale === "ro"
              ? "Constanta si imprejurimi"
              : "Constanta and nearby areas"}
          </h2>
          <div className="coverage-list">
            {data.settings.serviceCities.map((city) => (
              <span key={city}>{city}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
