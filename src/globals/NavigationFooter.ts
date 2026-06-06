import type { GlobalConfig } from 'payload'

import { adminOrEditor } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const NavigationFooter: GlobalConfig = {
  slug: 'navigation-footer',
  label: 'Navigation & Footer',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: adminOrEditor,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidatePublicSite()

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'headerLinks',
      type: 'array',
      defaultValue: [
        { label: 'Galerie', href: '/ro/galerie' },
        { label: 'Despre', href: '/ro/despre' },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      defaultValue: [
        { label: 'Galerie', href: '/ro/galerie' },
        { label: 'Despre', href: '/ro/despre' },
        { label: 'Confidentialitate', href: '/ro/confidentialitate' },
        { label: 'Cookies', href: '/ro/cookies' },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'footerText',
      type: 'textarea',
      localized: true,
      defaultValue:
        'Tavane extensibile premium pentru locuinte, spatii comerciale si proiecte cu iluminat integrat.',
    },
    {
      name: 'creditLabel',
      type: 'text',
      defaultValue: 'made by NCM',
    },
    {
      name: 'creditHref',
      type: 'text',
    },
  ],
}
