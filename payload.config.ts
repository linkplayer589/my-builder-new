import { postgresAdapter } from "@payloadcms/db-postgres"
import { slateEditor } from "@payloadcms/richtext-slate"
import { buildConfig } from "payload"

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "SOME_SECRET_KEY",
  serverURL: process.env.PAYLOAD_URL || "http://localhost:3000",
  admin: {
    user: "users",
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL!,
    },
  }),
  collections: [
    {
      slug: "users",
      auth: true,
      access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "role",
          type: "select",
          options: ["admin", "editor"],
          defaultValue: "editor",
          required: true,
        },
      ],
    },
    {
      slug: "email-templates",
      access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "category",
          type: "select",
          options: [
            { label: "Welcome", value: "welcome" },
            { label: "Notification", value: "notification" },
            { label: "Marketing", value: "marketing" },
            { label: "Transactional", value: "transactional" },
            { label: "Alert", value: "alert" },
          ],
          required: true,
        },
        {
          name: "subject",
          type: "text",
          required: true,
        },
        {
          name: "templateDocument",
          type: "json",
          required: true,
        },
        {
          name: "html",
          type: "textarea",
        },
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          label: "Active Template",
        },
        {
          name: "variables",
          type: "array",
          fields: [
            {
              name: "key",
              type: "text",
              required: true,
            },
            {
              name: "description",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
  typescript: {
    outputFile: "./payload-types.ts",
  },
})
