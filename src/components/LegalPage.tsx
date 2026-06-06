import type { Locale } from '@/lib/i18n'
import { getLegalPageContent, type LegalPageKind } from '@/lib/legalContent'

export function LegalPage({ kind, locale }: { kind: LegalPageKind; locale: Locale }) {
  const content = getLegalPageContent(kind, locale)

  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner legal-content">
          <p className="legal-content__notice">{content.updatedLabel}</p>
          {content.sections.map((section) => (
            <article className="legal-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
