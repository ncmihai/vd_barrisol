import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vdbarrisol.ro'
  const routes = ['', '/ro', '/en', '/ro/galerie', '/en/gallery', '/ro/despre', '/en/about']

  return routes.map((route) => ({
    changeFrequency: 'weekly',
    lastModified: new Date(),
    priority: route === '' || route === '/ro' || route === '/en' ? 1 : 0.8,
    url: `${siteUrl}${route}`,
  }))
}
