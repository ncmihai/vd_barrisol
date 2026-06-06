import type { GlobalConfig } from 'payload'

import { adminOrEditor } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  admin: {
    group: 'Pages',
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
      name: 'headline',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'values',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'copy',
          type: 'textarea',
          localized: true,
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'image-assets',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}
