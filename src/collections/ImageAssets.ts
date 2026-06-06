import type { CollectionConfig, FieldAccess } from 'payload'

import { admins, authenticated, isAdminOrEditor } from '@/access/admins'
import { cleanupDeletedImageAssetFiles } from '@/lib/imageAssetDeletion'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

const usageOptions = [
  { label: 'Library', value: 'library' },
  { label: 'Logo', value: 'logo' },
  { label: 'Hero', value: 'hero' },
  { label: 'Project', value: 'project' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'About', value: 'about' },
  { label: 'Open Graph', value: 'og' },
]

const variantFields = [
  {
    name: 'url',
    type: 'text' as const,
    admin: {
      disabled: true,
    },
  },
  {
    name: 'digiStoragePath',
    type: 'text' as const,
    admin: {
      disabled: true,
    },
  },
  {
    name: 'width',
    type: 'number' as const,
    admin: {
      disabled: true,
    },
  },
  {
    name: 'height',
    type: 'number' as const,
    admin: {
      disabled: true,
    },
  },
  {
    name: 'mimeType',
    type: 'text' as const,
    admin: {
      disabled: true,
    },
  },
  {
    name: 'filesize',
    type: 'number' as const,
    admin: {
      disabled: true,
    },
  },
]

const internalFieldRead: FieldAccess = ({ req: { user } }) => isAdminOrEditor(user)

export const ImageAssets: CollectionConfig = {
  slug: 'image-assets',
  labels: {
    plural: 'Image Library',
    singular: 'Image',
  },
  admin: {
    defaultColumns: ['adminThumbnailUrl', 'title', 'intendedUsage', 'preferredVariant', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    create: authenticated,
    delete: admins,
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
    afterDelete: [cleanupDeletedImageAssetFiles],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Public alt text. Keep it descriptive for SEO and accessibility.',
      },
    },
    {
      name: 'intendedUsage',
      type: 'select',
      defaultValue: ['library'],
      hasMany: true,
      options: usageOptions,
    },
    {
      name: 'preferredVariant',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Original', value: 'original' },
        { label: '2K WebP', value: '2k' },
        { label: '1080 WebP', value: '1080' },
      ],
      required: true,
    },
    {
      name: 'digiUploader',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/DigiImageUploader#DigiImageUploader',
        },
      },
    },
    {
      name: 'uploadStatus',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Uploading', value: 'uploading' },
        { label: 'Ready', value: 'ready' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'storageProvider',
      type: 'select',
      defaultValue: 'digi_storage',
      options: [
        { label: 'Digi Storage', value: 'digi_storage' },
        { label: 'Hetzner storage', value: 'hetzner_storage' },
      ],
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
        description: 'Provider metadata is intentionally hidden from editors. Hetzner migration belongs in the storage layer.',
      },
    },
    {
      name: 'adminThumbnailUrl',
      type: 'text',
      label: 'Preview',
      admin: {
        components: {
          Cell: '@/components/admin/ImageAssetPreviewCell#ImageAssetPreviewCell',
          Field: '@/components/admin/HiddenAdminField#HiddenAdminField',
        },
        disableBulkEdit: true,
        disableGroupBy: true,
        disableListFilter: true,
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: internalFieldRead,
      },
    },
    {
      name: 'originalFilename',
      type: 'text',
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'filesize',
      type: 'number',
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      access: {
        read: internalFieldRead,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'variants',
      type: 'group',
      admin: {
        condition: () => false,
      },
      access: {
        read: internalFieldRead,
      },
      fields: [
        {
          name: 'original',
          type: 'group',
          fields: variantFields,
        },
        {
          name: 'twoK',
          label: '2K',
          type: 'group',
          fields: variantFields,
        },
        {
          name: 'hd1080',
          label: '1080',
          type: 'group',
          fields: variantFields,
        },
        {
          name: 'thumbnail',
          type: 'group',
          fields: variantFields,
        },
      ],
    },
  ],
}
