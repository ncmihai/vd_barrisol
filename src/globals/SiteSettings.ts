import type { GlobalConfig } from "payload";

import { adminOrEditor, isAdmin } from "@/access/admins";
import { revalidatePublicSite } from "@/lib/revalidatePublic";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Settings",
  },
  access: {
    read: () => true,
    update: adminOrEditor,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidatePublicSite();

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "brandName",
      type: "text",
      defaultValue: "VD BARRISOL",
      required: true,
    },
    {
      name: "domain",
      type: "text",
      defaultValue: "vdbarrisol.ro",
      required: true,
    },
    {
      name: "logoImage",
      type: "relationship",
      relationTo: "image-assets",
      admin: {
        description: "Use the final approved logo asset here when available.",
      },
    },
    {
      name: "phone",
      type: "text",
      defaultValue: "0793 124 425",
      admin: {
        description: "Public phone number as displayed.",
      },
    },
    {
      name: "email",
      type: "email",
      defaultValue: "vdbarrisol@gmail.com",
    },
    {
      name: "whatsappNumber",
      type: "text",
      defaultValue: "40793124425",
      admin: {
        description:
          "Use international format without spaces for best WhatsApp links, e.g. 407XXXXXXXX.",
      },
    },
    {
      name: "facebookUrl",
      type: "text",
      defaultValue: "https://www.facebook.com/p/VD-Barrisol-61564327003788/",
    },
    {
      name: "instagramUrl",
      type: "text",
      defaultValue: "https://www.instagram.com/vd_barrisol/",
    },
    {
      name: "legalName",
      type: "text",
      defaultValue: "VD BARRISOL S.R.L.",
      admin: {
        description: "Optional public company name for footer/legal context.",
      },
    },
    {
      name: "registrationNumber",
      type: "text",
      defaultValue: "CUI 51496619",
      admin: {
        description:
          "Optional public registry/tax identifier. Confirm before final launch.",
      },
    },
    {
      name: "mainCity",
      type: "text",
      defaultValue: "Constanta",
    },
    {
      name: "serviceArea",
      type: "text",
      localized: true,
      defaultValue:
        "Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia si Murfatlar",
    },
    {
      name: "serviceCities",
      type: "array",
      defaultValue: [
        { city: "Mamaia-Sat" },
        { city: "Valu lui Traian" },
        { city: "Constanta" },
        { city: "Mamaia" },
        { city: "Cumpana" },
        { city: "Navodari" },
        { city: "Agigea" },
        { city: "Lazu" },
        { city: "Mangalia" },
        { city: "Murfatlar" },
      ],
      fields: [
        {
          name: "city",
          type: "text",
          localized: true,
          required: true,
        },
      ],
    },
    {
      name: "palette",
      type: "group",
      admin: {
        description: "Brand palette locked for the public design.",
      },
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
      fields: [
        {
          name: "warmNeutral",
          type: "text",
          defaultValue: "#E9E3DF",
          required: true,
        },
        {
          name: "orange",
          type: "text",
          defaultValue: "#FF7A30",
          required: true,
        },
        {
          name: "blue",
          type: "text",
          defaultValue: "#465C88",
          required: true,
        },
        {
          name: "black",
          type: "text",
          defaultValue: "#000000",
          required: true,
        },
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          required: true,
        },
        {
          name: "defaultOgImage",
          type: "relationship",
          relationTo: "image-assets",
        },
      ],
    },
  ],
};
