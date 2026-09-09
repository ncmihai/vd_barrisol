import Image from 'next/image'

import type { PublicProject } from '@/lib/publicTypes'
import type { Locale } from '@/lib/i18n'

export function ProjectGrid({ locale, projects }: { locale: Locale; projects: PublicProject[] }) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <article className="project-card" key={project.slug}>
          <div className="project-card__image">
            <Image
              alt={project.image.alt}
              fill
              sizes="(max-width: 720px) 100vw, 50vw"
              src={project.image.src}
            />
          </div>
          <div className="project-card__body">
            <span>{project.city}</span>
            <h3>
              <a href={locale === 'ro' ? `/ro/proiecte/${project.slug}` : `/en/projects/${project.slug}`}>
                {project.title}
              </a>
            </h3>
            <p>{project.summary}</p>
            <dl>
              {project.areaSqm && (
                <>
                  <dt>mp</dt>
                  <dd>{project.areaSqm}</dd>
                </>
              )}
              {project.ceilingType && (
                <>
                  <dt>tip</dt>
                  <dd>{project.ceilingType}</dd>
                </>
              )}
            </dl>
          </div>
        </article>
      ))}
    </div>
  )
}
