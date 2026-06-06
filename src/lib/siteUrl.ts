const fallbackSiteUrl = 'https://vdbarrisol.ro'

export const getSiteUrl = () => {
  const rawUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).trim().replace(/\/+$/, '')

  try {
    const url = new URL(rawUrl)

    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      url.protocol = 'https:'
    }

    return url.toString().replace(/\/+$/, '')
  } catch {
    return fallbackSiteUrl
  }
}
