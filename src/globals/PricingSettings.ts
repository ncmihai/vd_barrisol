import type { GlobalConfig } from 'payload'

import { adminOrEditor } from '@/access/admins'
import { revalidatePublicSite } from '@/lib/revalidatePublic'

export const PricingSettings: GlobalConfig = {
  slug: 'pricing-settings',
  label: 'Pricing Settings',
  admin: {
    group: 'Business',
    description: 'Editable calculator rules. The public result is an approximate range, not a final offer.',
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
      name: 'basePriceRonPerSqm',
      type: 'number',
      defaultValue: 180,
      min: 0,
      required: true,
    },
    {
      name: 'minimumProjectRon',
      type: 'number',
      defaultValue: 1500,
      min: 0,
      required: true,
    },
    {
      name: 'eurRate',
      label: 'RON per EUR',
      type: 'number',
      defaultValue: 5,
      min: 0.01,
      required: true,
    },
    {
      name: 'rangePercent',
      type: 'number',
      defaultValue: 15,
      min: 0,
      max: 60,
      required: true,
    },
    {
      name: 'vatMode',
      type: 'select',
      defaultValue: 'not-specified',
      options: [
        { label: 'Not specified', value: 'not-specified' },
        { label: 'Included', value: 'included' },
        { label: 'Excluded', value: 'excluded' },
      ],
      required: true,
    },
    {
      name: 'ceilingTypes',
      type: 'array',
      minRows: 1,
      defaultValue: [
        { label: 'Mat standard', value: 'mat-standard', multiplier: 1 },
        { label: 'Lucios / oglinda', value: 'lucios', multiplier: 1.2 },
        { label: 'Iluminat / translucid', value: 'translucid', multiplier: 1.35 },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'multiplier',
          type: 'number',
          defaultValue: 1,
          min: 0,
          required: true,
        },
      ],
    },
    {
      name: 'lightingOptions',
      type: 'array',
      defaultValue: [
        { label: 'Fara iluminat integrat', value: 'none', fixedRon: 0, perSqmRon: 0 },
        { label: 'Banda LED perimetrala', value: 'perimeter-led', fixedRon: 400, perSqmRon: 45 },
        { label: 'Iluminat complex', value: 'complex-lighting', fixedRon: 900, perSqmRon: 75 },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'fixedRon',
          type: 'number',
          defaultValue: 0,
          min: 0,
          required: true,
        },
        {
          name: 'perSqmRon',
          type: 'number',
          defaultValue: 0,
          min: 0,
          required: true,
        },
      ],
    },
    {
      name: 'complexityOptions',
      type: 'array',
      defaultValue: [
        { label: 'Camera simpla', value: 'simple', multiplier: 1 },
        { label: 'Colturi / forme moderate', value: 'moderate', multiplier: 1.12 },
        { label: 'Forme complexe', value: 'complex', multiplier: 1.25 },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'multiplier',
          type: 'number',
          defaultValue: 1,
          min: 0,
          required: true,
        },
      ],
    },
    {
      name: 'cityFees',
      type: 'array',
      defaultValue: [
        { city: 'Constanta', fixedRon: 0 },
        { city: 'Bucuresti', fixedRon: 600 },
      ],
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'fixedRon',
          type: 'number',
          defaultValue: 0,
          min: 0,
          required: true,
        },
      ],
    },
    {
      name: 'fallbackTravelFeeRon',
      type: 'number',
      defaultValue: 350,
      min: 0,
      required: true,
    },
    {
      name: 'disclaimer',
      type: 'textarea',
      localized: true,
      defaultValue: 'Pretul este aproximativ si poate varia dupa masuratori, material, iluminat si detaliile reale ale montajului.',
    },
  ],
}
