import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/admins";
import { revalidatePublicSite } from "@/lib/revalidatePublic";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    defaultColumns: ["clientName", "city", "featured", "updatedAt"],
    group: "Content",
    useAsTitle: "clientName",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
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
      name: "approved",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Publish only genuine testimonials approved for public use.",
      },
    },
    {
      name: "clientName",
      type: "text",
      required: true,
    },
    {
      name: "city",
      type: "text",
    },
    {
      name: "headline",
      type: "text",
      localized: true,
    },
    {
      name: "quote",
      type: "textarea",
      localized: true,
      required: true,
    },
    {
      name: "story",
      type: "richText",
      localized: true,
      admin: {
        description:
          "Longer article-style testimonial content. The public card uses quote/headline first.",
      },
    },
    {
      name: "relatedProject",
      type: "relationship",
      relationTo: "projects",
    },
    {
      name: "image",
      type: "relationship",
      relationTo: "image-assets",
    },
    {
      name: "rating",
      type: "number",
      min: 1,
      max: 5,
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
