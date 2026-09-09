import type { CollectionConfig } from "payload";

import { admins, adminsOrSelf, isAdmin } from "@/access/admins";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    group: "Admin",
    hidden: ({ user }) => !isAdmin(user),
    useAsTitle: "email",
  },
  auth: true,
  access: {
    unlock: admins,
    create: admins,
    delete: admins,
    read: adminsOrSelf,
    update: adminsOrSelf,
  },
  fields: [
    {
      name: "name",
      type: "text",
      admin: {
        description: "Internal display name for the Payload admin.",
      },
    },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
  ],
};
