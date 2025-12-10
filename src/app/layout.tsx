import { ThemeProvider } from "@/features/theme/theme-providers/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"

import { Providers } from "./providers"

import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { dbGetAllResorts } from "@/features/resorts/resort-actions/db-get-all-resorts"

import { fontMono, fontSans } from "@/lib/fonts"
import { Toaster } from "@/components/ui/toaster"

import QueryProvider from "./query-provider"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  authors: [
    {
      name: "Jordan Gigg - Giggabit LTD",
      url: "https://www.linkedin.com/in/jordangigg/",
    },
  ],
  creator: "Jordan Gigg",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  // Fetch resorts at the root level
  const initialResorts = await dbGetAllResorts()

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <QueryProvider>
            <Providers initialResorts={initialResorts}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <main className="flex-1">{children}</main>
                <TailwindIndicator />
              </ThemeProvider>
              <Toaster />
            </Providers>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
