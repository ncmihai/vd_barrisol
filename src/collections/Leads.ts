import type { CollectionConfig } from "payload";

import { admins, authenticated } from "@/access/admins";

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    defaultColumns: [
      "name",
      "phone",
      "city",
      "estimateRonMin",
      "estimateRonMax",
      "createdAt",
    ],
    group: "Business",
    useAsTitle: "name",
  },
  access: {
    create: authenticated,
    delete: admins,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: "requestKey",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "notificationStatus",
      type: "select",
      defaultValue: "pending",
      options: ["pending", "sent", "failed", "skipped"],
      admin: { readOnly: true },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "city",
      type: "text",
    },
    {
      name: "message",
      type: "textarea",
    },
    {
      name: "preferredContact",
      type: "select",
      defaultValue: "whatsapp",
      options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Phone", value: "phone" },
        { label: "Email", value: "email" },
      ],
      required: true,
    },
    {
      name: "locale",
      type: "select",
      defaultValue: "ro",
      options: [
        { label: "Romanian", value: "ro" },
        { label: "English", value: "en" },
      ],
      required: true,
    },
    {
      name: "calculatorInput",
      type: "json",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "pricingSnapshot",
      type: "json",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "estimateRonMin",
      type: "number",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "estimateRonMax",
      type: "number",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "estimateEurMin",
      type: "number",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "estimateEurMax",
      type: "number",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "source",
      type: "text",
      defaultValue: "website-calculator",
    },
  ],
};
