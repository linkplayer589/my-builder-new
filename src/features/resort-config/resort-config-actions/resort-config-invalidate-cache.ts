"use server"

import type { TCacheInvalidationResponse, TApiResult } from "../resort-config-types/resort-config-types"

/**
 * Invalidates the catalog cache for a specific resort
 *
 * @description
 * Calls the backend API to clear KV cache and product_prices database table
 * for the specified resort. This should be called after making configuration
 * changes to ensure fresh data is fetched.
 *
 * @param resortId - The ID of the resort to invalidate cache for
 * @returns Promise resolving to the API result with cache invalidation response
 *
 * @example
 * ```typescript
 * const result = await invalidateCatalogCache(1)
 * if (result.data?.success) {
 *   console.log("Cache invalidated successfully")
 * }
 * ```
 */
export async function invalidateCatalogCache(
    resortId: number
): Promise<TApiResult<TCacheInvalidationResponse>> {
    console.log("🗑️ [API] Invalidating catalog cache...", { resortId })

    try {
        const HONO_API_URL = process.env.HONO_API_URL ?? ""
        const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

        const url = new URL(`${HONO_API_URL}/api/script/invalidate-catalog-cache`)

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            },
            body: JSON.stringify({ resortId }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string }
            console.error("❌ [API] Cache invalidation failed:", response.status, errorData)
            return {
                data: null,
                error: errorData.message ?? `Failed to invalidate cache: ${response.status}`,
                status: response.status,
            }
        }

        const data = await response.json() as TCacheInvalidationResponse
        console.log("✅ [API] Cache invalidated successfully", data)

        return {
            data,
            error: null,
            status: response.status,
        }
    } catch (error) {
        console.error("❌ [API] Cache invalidation error:", error)
        return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to invalidate cache",
            status: 500,
        }
    }
}

