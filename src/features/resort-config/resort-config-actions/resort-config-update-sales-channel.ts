"use server"

import { db } from "@/db"
import { salesChannels } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import type { TSalesChannelConfigUpdate, TApiResult } from "../resort-config-types/resort-config-types"
import type { SalesChannel } from "@/db/schema"

/**
 * Updates a sales channel's active products and consumer categories
 *
 * @description
 * Updates the activeProductIds and activeConsumerCategoryIds arrays
 * for a specific sales channel. This determines which products and
 * categories are available for sale through that channel.
 *
 * @param update - The configuration update payload
 * @returns Promise resolving to the updated sales channel or error
 *
 * @example
 * ```typescript
 * const result = await updateSalesChannelConfig({
 *   id: 1,
 *   activeProductIds: ["prod-1", "prod-2"],
 *   activeConsumerCategoryIds: ["cat-1", "cat-2"]
 * })
 * ```
 */
export async function updateSalesChannelConfig(
    update: TSalesChannelConfigUpdate
): Promise<TApiResult<SalesChannel>> {
    console.log("📝 [DB] Updating sales channel config...", {
        id: update.id,
        productCount: update.activeProductIds.length,
        categoryCount: update.activeConsumerCategoryIds.length
    })

    try {
        const [updated] = await db
            .update(salesChannels)
            .set({
                activeProductIds: update.activeProductIds,
                activeConsumerCategoryIds: update.activeConsumerCategoryIds,
                updatedAt: new Date(),
            })
            .where(eq(salesChannels.id, update.id))
            .returning()

        if (!updated) {
            console.error("❌ [DB] Sales channel not found:", update.id)
            return {
                data: null,
                error: `Sales channel with ID ${update.id} not found`,
                status: 404,
            }
        }

        // Invalidate cache for sales channels
        revalidateTag("sales-channels", "max")

        console.log("✅ [DB] Sales channel updated successfully", { id: updated.id })

        return {
            data: updated,
            error: null,
            status: 200,
        }
    } catch (error) {
        console.error("❌ [DB] Failed to update sales channel:", error)
        return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to update sales channel",
            status: 500,
        }
    }
}

/**
 * Batch updates multiple sales channels
 *
 * @description
 * Updates multiple sales channels at once, useful when making
 * configuration changes across all channels for a resort.
 *
 * @param updates - Array of configuration updates
 * @returns Promise resolving to array of results
 */
export async function batchUpdateSalesChannelConfigs(
    updates: TSalesChannelConfigUpdate[]
): Promise<TApiResult<SalesChannel>[]> {
    console.log("📝 [DB] Batch updating sales channels...", { count: updates.length })

    const results = await Promise.all(
        updates.map(update => updateSalesChannelConfig(update))
    )

    const successCount = results.filter(r => r.data !== null).length
    console.log(`✅ [DB] Batch update completed: ${successCount}/${updates.length} succeeded`)

    return results
}

