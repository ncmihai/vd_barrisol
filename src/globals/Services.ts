import type { GlobalConfig } from "payload";
import { adminOrEditor } from "@/access/admins";
import { revalidatePublicSite } from "@/lib/revalidatePublic";

export const Services: GlobalConfig = {
  slug: "services",
  admin: {
    group: "Pages",
    description:
      "Only enabled, translated items appear publicly. Keep unconfirmed services unpublished.",
  },
  access: { read: () => true, update: adminOrEditor },
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
      name: "items",
      type: "array",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: false },
        { name: "title", type: "text", localized: true, required: true },
        {
          name: "description",
          type: "textarea",
          localized: true,
          required: true,
        },
        { name: "customQuote", type: "checkbox", defaultValue: true },
      ],
    },
    {
      name: "architects",
      type: "group",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: false },
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
      ],
    },
    {
      name: "process",
      type: "array",
      fields: [
        { name: "title", type: "text", localized: true, required: true },
        {
          name: "description",
          type: "textarea",
          localized: true,
          required: true,
        },
      ],
    },
    {
      name: "faq",
      label: "Frequently asked questions",
      type: "array",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: false },
        { name: "question", type: "text", localized: true, required: true },
        { name: "answer", type: "textarea", localized: true, required: true },
      ],
    },
  ],
};
