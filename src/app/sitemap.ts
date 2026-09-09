import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/siteUrl'
import { getPublicSiteData } from '@/lib/publicData'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const routes = [
    '',
    '/ro',
    '/en',
    '/ro/galerie',
    '/en/gallery',
    '/ro/despre',
    '/en/about',
    '/ro/confidentialitate',
    '/en/privacy',
    '/ro/cookies',
    '/en/cookies',
    '/ro/privacy',
    '/en/confidentialitate',
  ]

  const [roData, enData] = await Promise.all([
    getPublicSiteData('ro'),
    getPublicSiteData('en'),
  ])
  const projectRoutes = [
    ...roData.projects.map((project) => `/ro/proiecte/${project.slug}`),
    ...enData.projects.map((project) => `/en/projects/${project.slug}`),
  ]

  return [...routes, ...projectRoutes].map((route) => ({
    changeFrequency: 'weekly',
    lastModified: new Date(),
    priority: route === '' || route === '/ro' || route === '/en' ? 1 : 0.8,
    url: `${siteUrl}${route}`,
  }))
}
