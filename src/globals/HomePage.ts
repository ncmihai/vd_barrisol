import type { GlobalConfig } from 'payload'

import { adminOrEditor } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
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
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
        },
        {
          name: 'headline',
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
        {
          name: 'slides',
          type: 'array',
          minRows: 1,
          fields: [
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'image-assets',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
              localized: true,
            },
          ],
        },
      ],
    },
    {
      name: 'calculator',
      type: 'group',
      fields: [
        {
          name: 'headline',
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
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'headline',
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
