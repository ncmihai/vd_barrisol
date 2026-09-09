import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n'
import { getPublicSiteData } from '@/lib/publicData'

export const revalidate = 300

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale) || rawLocale !== 'en') notFound()
  const data = await getPublicSiteData('en')
  const project = data.projects.find((item) => item.slug === slug)
  if (!project) notFound()
  return { description: project.summary, title: project.title }
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale) || rawLocale !== 'en') notFound()
  const data = await getPublicSiteData('en')
  const project = data.projects.find((item) => item.slug === slug)
  if (!project) notFound()

  return (
    <>
      <section className="page-hero page-hero--project">
        <div className="section__inner project-detail-grid">
          <div>
            <p className="eyebrow">{project.city || 'Project'}</p>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <Link className="button button--primary" href="/en#calculator">Discuss a similar project</Link>
          </div>
          <div className="project-detail-image">
            <Image alt={project.image.alt} fill priority sizes="(max-width: 900px) 100vw, 52vw" src={project.image.src} />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section__inner project-detail-facts">
          {project.areaSqm && <span>{project.areaSqm} sqm</span>}
          {project.ceilingType && <span>{project.ceilingType}</span>}
          <span>VD BARRISOL</span>
        </div>
      </section>
    </>
  )
}
