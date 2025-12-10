// export const databasePrefix = "shadcn"

import { BookOpen, Settings2, SquareTerminal } from "lucide-react"

export const unknownError = "An unknown error occurred. Please try again later."

export const sidebarConfig = {
  user: {
    name: "Admin",
    email: "", // Will be populated from Clerk
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      items: [
        {
          title: "Statistics",
          url: "/dashboard/statistics",
        },
      ],
    },
    {
      title: "Orders",
      url: "/orders",
      icon: BookOpen,
      items: [
        {
          title: "All Order History",
          url: "/orders",
        },
        {
          title: "Lifepasses in Orders",
          url: "/orders/lifepasses",
        },
        {
          title: "Tickets in Skidata",
          url: "/orders/skidata-reporting",
        },
        {
          title: "Sales Tax Reporting",
          url: "/orders/sales-tax-reporting",
        },
        {
          title: "Weekly Export",
          url: "/orders/weekly-export",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Sessions",
          url: "/settings/sessions",
        },
        {
          title: "Resorts",
          url: "/settings/resorts",
        },
        {
          title: "Devices",
          url: "/settings/devices",
        },
        {
          title: "Products",
          url: "/settings/products",
        },
        {
          title: "kiosks",
          url: "/settings/kiosks",
        },
        {
          title: "Sales Channels",
          url: "/settings/sales-channels",
        },
        {
          title: "Catalogs",
          url: "/settings/catalogs",
        },
        {
          title: "Resort Configuration",
          url: "/settings/resort-config",
        },
      ],
    },
    {
      title: "Template Builder",
      url: "/template-builder",
      icon: BookOpen,
      items: [
        {
          title: "All Templates",
          url: "/template-builder",
        },
        {
          title: "Create Template",
          url: "/template-builder/create",
        },
      ],
    },
  ],
}
