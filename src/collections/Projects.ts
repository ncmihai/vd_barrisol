import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    defaultColumns: ['title', 'city', 'ceilingType', 'featured', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidatePublicSite()

        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidatePublicSite()

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      defaultValue: 'Constanta',
    },
    {
      name: 'areaSqm',
      label: 'Approximate area in square meters',
      type: 'number',
    },
    {
      name: 'ceilingType',
      type: 'text',
      localized: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'mainImage',
      type: 'relationship',
      relationTo: 'image-assets',
    },
    {
      name: 'images',
      type: 'relationship',
      hasMany: true,
      relationTo: 'image-assets',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
    },
  ],
}
