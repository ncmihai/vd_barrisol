import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EstimateCalculator } from "@/components/EstimateCalculator";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProjectGrid } from "@/components/ProjectGrid";
import { TestimonialList } from "@/components/TestimonialList";
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
  const trustItems =
    locale === "ro"
      ? [
          { label: "Masuratoare", value: "discutie tehnica inainte de oferta" },
          { label: "Montaj", value: "curat, precis, adaptat spatiului" },
          { label: "Proiecte", value: "rezidentiale si comerciale" },
          { label: "Acoperire", value: "Constanta si localitatile apropiate" },
        ]
      : [
          {
            label: "Measurement",
            value: "technical check before the final offer",
          },
          {
            label: "Installation",
            value: "clean, precise, adapted to the room",
          },
          { label: "Projects", value: "residential and commercial" },
          { label: "Coverage", value: "Constanta and nearby localities" },
        ];
  const jsonLd = buildProfessionalServiceJsonLd({
    locale,
    projects: data.projects,
    settings: data.settings,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <HeroCarousel home={data.home} locale={locale} settings={data.settings} />

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
            locale={locale}
            pricing={data.pricing}
            serviceCities={data.settings.serviceCities}
            whatsappHref={whatsappHref}
          />
        </div>
      </section>

      <section className="section section--intro">
        <div className="section__inner intro-grid">
          <div>
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

      <section
        className="trust-strip"
        aria-label={locale === "ro" ? "Detalii de incredere" : "Trust details"}
      >
        <div className="trust-strip__inner">
          {trustItems.map((item) => (
            <div className="trust-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--coverage">
        <div className="section__inner coverage-grid">
          <div>
            <p className="eyebrow">
              {locale === "ro" ? "Zone acoperite" : "Coverage"}
            </p>
            <h2>
              {locale === "ro"
                ? "Lucrari in Constanta si localitatile din jur"
                : "Work in Constanta and nearby localities"}
            </h2>
          </div>
          <div className="coverage-list">
            {data.settings.serviceCities.map((city) => (
              <span key={city}>{city}</span>
            ))}
          </div>
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
          <ProjectGrid projects={data.projects.slice(0, 2)} />
        </div>
      </section>

      <section className="section section--testimonials">
        <div className="section__inner">
          <TestimonialList testimonials={data.testimonials.slice(0, 2)} />
        </div>
      </section>
    </>
  );
}
