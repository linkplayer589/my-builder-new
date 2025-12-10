"use server"

import { db } from "@/db"
import { salesChannels } from "@/db/schema"
import { eq } from "drizzle-orm"
import { unstable_cache } from "@/lib/unstable-cache"
import type { SalesChannel } from "@/db/schema"

/**
 * Fetches all sales channels for a specific resort
 *
 * @description
 * Retrieves all sales channels associated with a resort, including
 * their active product and consumer category configurations.
 * Results are cached for 1 hour with automatic revalidation.
 *
 * @param resortId - The ID of the resort to fetch sales channels for
 * @returns Promise resolving to array of sales channels
 *
 * @example
 * ```typescript
 * const channels = await getSalesChannelsByResortId(1)
 * channels.forEach(channel => {
 *   console.log(channel.name, channel.type)
 * })
 * ```
 */
export async function getSalesChannelsByResortId(
    resortId: number
): Promise<SalesChannel[]> {
    return await unstable_cache(
        async () => {
            console.log("[DB] Fetching sales channels for resort...", { resortId })

            try {
                const channels = await db
                    .select()
                    .from(salesChannels)
                    .where(eq(salesChannels.resortId, resortId))
                    .orderBy(salesChannels.name)

                console.log("[DB] Found sales channels:", { count: channels.length })
                return channels
            } catch (error) {
                console.error("Error fetching sales channels:", error)
                return []
            }
        },
        [`resort-config-sales-channels-${resortId}`],
        {
            revalidate: 3600, // Cache for 1 hour
            tags: ["sales-channels", `resort-${resortId}-channels`],
        }
    )()
}

