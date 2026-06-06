import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/siteUrl'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]

  return routes.map((route) => ({
    changeFrequency: 'weekly',
    lastModified: new Date(),
    priority: route === '' || route === '/ro' || route === '/en' ? 1 : 0.8,
    url: `${siteUrl}${route}`,
  }))
}
