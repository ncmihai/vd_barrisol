import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  applicationName: 'VD BARRISOL',
  generator: 'Next.js',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vdbarrisol.ro'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
