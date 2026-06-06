import type { GlobalConfig } from 'payload'

import { adminOrEditor } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  label: 'Gallery Page',
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
      name: 'copy',
      type: 'textarea',
      localized: true,
      required: true,
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
