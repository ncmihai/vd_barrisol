import Link from "next/link";
import { localizedPaths, type Locale } from "@/lib/i18n";
import type { PublicSiteData } from "@/lib/publicTypes";

export function ServicesContent({
  data,
  locale,
}: {
  data: PublicSiteData;
  locale: Locale;
}) {
  const services = data.services;
  if (!services) return null;
  return (
    <>
      {services.items.length > 0 && (
        <section id="services" className="section">
          <div className="section__inner">
            <div className="section-heading">
              <h2>
                {locale === "ro"
                  ? "Servicii pentru spatiul tau"
                  : "Services for your space"}
              </h2>
            </div>
            <div className="services-grid">
              {services.items.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.customQuote && (
                    <p>
                      {locale === "ro"
                        ? "Necesita oferta personalizata"
                        : "Custom quote required"}
                    </p>
                  )}
                </article>
              ))}
            </div>
            {services.architects && (
              <Link
                className="text-link"
                href={localizedPaths[locale].architects}
              >
                {services.architects.title}
              </Link>
            )}
          </div>
        </section>
      )}
      {services.process.length > 0 && (
        <section className="section">
          <div className="section__inner">
            <h2>
              {locale === "ro" ? "Etapele proiectului" : "Project process"}
            </h2>
            <ol className="services-grid">
              {services.process.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      {services.faq.length > 0 && (
        <section className="section">
          <div className="section__inner">
            <h2>
              {locale === "ro"
                ? "Intrebari frecvente"
                : "Frequently asked questions"}
            </h2>
            {services.faq.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
