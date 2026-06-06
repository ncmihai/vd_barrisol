import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  async redirects() {
    return [
      {
        destination: '/ro/galerie',
        permanent: true,
        source: '/ro/gallery',
      },
      {
        destination: '/ro/despre',
        permanent: true,
        source: '/ro/about',
      },
      {
        destination: '/en/gallery',
        permanent: true,
        source: '/en/galerie',
      },
      {
        destination: '/en/about',
        permanent: true,
        source: '/en/despre',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/brand/**',
      },
      {
        pathname: '/placeholders/**',
      },
      {
        pathname: '/api/assets/images/**',
      },
    ],
    remotePatterns: [
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
