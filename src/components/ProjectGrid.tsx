import Image from 'next/image'

import type { PublicProject } from '@/lib/publicTypes'

export function ProjectGrid({ projects }: { projects: PublicProject[] }) {
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
            <h3>{project.title}</h3>
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
