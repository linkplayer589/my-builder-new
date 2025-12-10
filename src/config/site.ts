// import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "LifePass Admin Panel",
  description:
    "Admin Panel for the LifePass project. This project is a part of the LifePass project.",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://mountain-technologies-admin.vercel.app/",
  links: { github: "https://github.com/J-Giggles/mountain-technologies-admin" },
}
