import type { GlobalConfig } from 'payload'

import { adminOrEditor, isAdmin } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
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
      name: 'brandName',
      type: 'text',
      defaultValue: 'VD BARRISOL',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      defaultValue: 'vdbarrisol.ro',
      required: true,
    },
    {
      name: 'logoImage',
      type: 'relationship',
      relationTo: 'image-assets',
      admin: {
        description: 'Use the final approved logo asset here when available.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Public phone number as displayed.',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      admin: {
        description: 'Use international format without spaces for best WhatsApp links, e.g. 407XXXXXXXX.',
      },
    },
    {
      name: 'mainCity',
      type: 'text',
      defaultValue: 'Constanta',
    },
    {
      name: 'serviceArea',
      type: 'text',
      localized: true,
      defaultValue: 'Constanta si proiecte in mai multe orase din Romania',
    },
    {
      name: 'palette',
      type: 'group',
      admin: {
        description: 'Brand palette locked for the public design.',
      },
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
      fields: [
        {
          name: 'warmNeutral',
          type: 'text',
          defaultValue: '#E9E3DF',
          required: true,
        },
        {
          name: 'orange',
          type: 'text',
          defaultValue: '#FF7A30',
          required: true,
        },
        {
          name: 'blue',
          type: 'text',
          defaultValue: '#465C88',
          required: true,
        },
        {
          name: 'black',
          type: 'text',
          defaultValue: '#000000',
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
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          required: true,
        },
        {
          name: 'defaultOgImage',
          type: 'relationship',
          relationTo: 'image-assets',
        },
      ],
    },
  ],
}
