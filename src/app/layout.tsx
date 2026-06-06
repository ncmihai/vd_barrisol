import type { Metadata } from 'next'

import { getSiteUrl } from '@/lib/siteUrl'

import './globals.css'

export const metadata: Metadata = {
  applicationName: 'VD BARRISOL',
  generator: 'Next.js',
  metadataBase: new URL(getSiteUrl()),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
