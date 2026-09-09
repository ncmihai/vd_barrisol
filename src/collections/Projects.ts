import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/admins";
import { revalidatePublicSite } from "@/lib/revalidatePublic";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    defaultColumns: ["title", "city", "ceilingType", "featured", "updatedAt"],
    group: "Content",
    useAsTitle: "title",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) =>
      req.user ? true : { publication: { equals: "published" } },
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidatePublicSite();

        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidatePublicSite();

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "publication",
      type: "select",
      defaultValue: "draft",
      required: true,
      options: ["draft", "demo", "published"],
    },
    {
      name: "audience",
      type: "select",
      options: ["residential", "commercial"],
    },
    {
      name: "finishId",
      type: "text",
      admin: {
        description: "Matching Pricing Settings finish ID, if applicable.",
      },
    },
    {
      name: "lightingId",
      type: "text",
      admin: {
        description: "Matching Pricing Settings lighting ID, if applicable.",
      },
    },
    { name: "details", type: "textarea", localized: true },
    { name: "technicalDetails", type: "textarea", localized: true },
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      validate: (value: unknown) =>
        typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : "Use lowercase letters, numbers and single hyphens.",
    },
    {
      name: "city",
      type: "text",
      defaultValue: "Constanta",
    },
    {
      name: "areaSqm",
      label: "Approximate area in square meters",
      type: "number",
    },
    {
      name: "ceilingType",
      type: "text",
      localized: true,
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "mainImage",
      type: "relationship",
      relationTo: "image-assets",
    },
    {
      name: "images",
      type: "relationship",
      hasMany: true,
      relationTo: "image-assets",
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      index: true,
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
    },
  ],
};
