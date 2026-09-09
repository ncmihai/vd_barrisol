import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectGrid } from "@/components/ProjectGrid";
import { TestimonialList } from "@/components/TestimonialList";
import { type Locale } from "@/lib/i18n";
import { getPublicSiteData } from "@/lib/publicData";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (rawLocale !== "ro") {
    notFound();
  }

  const locale = rawLocale;
  const data = await getPublicSiteData(locale);
  const title = data.gallery.seoTitle || data.gallery.headline;
  const description = data.gallery.seoDescription || data.gallery.copy;

  return {
    alternates: {
      canonical: "/ro/galerie",
      languages: {
        en: "/en/gallery",
        ro: "/ro/galerie",
      },
    },
    description,
    title,
  };
}

export default async function GaleriePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (rawLocale !== "ro") {
    notFound();
  }

  const locale = rawLocale as Locale;
  const data = await getPublicSiteData(locale);

  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <p className="eyebrow">Galerie</p>
          <h1>{data.gallery.headline}</h1>
          <p>{data.gallery.copy}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <ProjectGrid filters locale={locale} projects={data.projects} />
        </div>
      </section>
      <section className="section section--testimonials">
        <div className="section__inner">
          <div className="section-heading">
            <p className="eyebrow">Testimoniale</p>
            <h2>Ce spun clientii</h2>
          </div>
          <TestimonialList testimonials={data.testimonials} />
        </div>
      </section>
    </>
  );
}
