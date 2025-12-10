"use server"

import { db } from "@/db"
import { resorts, type Resort } from "@/db/schema"
import { unstable_cache } from "@/lib/unstable-cache"

export async function dbGetAllResorts(): Promise<Resort[]> {
    return await unstable_cache(
        async () => {
            console.log("[DB] Getting all resorts...")
            try {
                const results = await db.select().from(resorts)

                if (!results.length) {
                    console.warn("No resorts found in database")
                }

                return results
            } catch (error) {
                console.error("Error fetching resorts:", error)
                return []
            }
        },
        ["resorts"],
        {
            revalidate: 3600, // Cache for 1 hour
            tags: ["resorts"],
        }
    )()
}
