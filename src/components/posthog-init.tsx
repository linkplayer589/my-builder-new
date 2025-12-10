"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}

export function PostHogInit() {
  useEffect(() => {
    // Only initialize if it hasn't been already
    if (!posthog.__loaded) {
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          loaded: (ph) => {
            if (process.env.NODE_ENV === "development") {
              window.posthog = ph
            }
          },
          person_profiles: "identified_only",
        })
      }
    }
  }, [])

  return null
}
