import { cache } from "react"
import { notFound } from "next/navigation"
import type { Resort } from "@/db/schema"
import { dbGetAllResorts } from "@/features/resorts/resort-actions/db-get-all-resorts"

import { unstable_cache } from "@/lib/unstable-cache"

export const normalizeResortName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

export const getCachedResorts = cache(async () => {
  return await dbGetAllResorts()
})

export const validateResortAccess = unstable_cache(
  async (resortName: string): Promise<Resort> => {
    const resorts = await getCachedResorts()
    const resort = resorts.find(
      (r) => normalizeResortName(r.name) === resortName
    )

    if (!resort) {
      notFound()
    }

    return resort
  },
  ["resort-access"],
  {
    revalidate: 3600,
    tags: ["resorts"],
  }
)

// Function to get resortId based on resort name
export const getResortIdFromName = unstable_cache(
  async (resortName: string): Promise<number | null> => {
    const resorts = await getCachedResorts() // Fetch resorts from cache or DB
    const resort = resorts.find(
      (r) => normalizeResortName(r.name) === resortName // Find resort by normalized name
    )

    if (!resort) {
      console.log("Resort not found for name:", resortName)
      notFound() // If resort is not found, trigger the 404 page
      return null
    }

    return resort.id
  },
  ["resort-id-from-name"],
  {
    revalidate: 3600, // Cache duration for 1 hour
    tags: ["resorts"], // Tagging for cache invalidation
  }
)
