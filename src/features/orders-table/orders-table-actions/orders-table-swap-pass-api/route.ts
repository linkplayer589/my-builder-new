"use server"

import { swapPassSchema } from "./schema"
import type { TSwapPassResponse, SwapPassApiResponse } from "./types"

/**
 * Swaps a lifepass device for an order
 *
 * @param orderId - Order ID
 * @param oldPassId - Current pass ID to swap from
 * @param newPassId - New pass ID to swap to
 * @param resortId - Resort ID
 * @param swapSkipass - Whether to create new skipass on the device
 * @returns Object with success status and message
 *
 * @description
 * Calls the Hono API to swap a lifepass device associated with an order.
 * Optionally creates a new skipass on the device if swapSkipass is true.
 * Has a 60-second timeout for the API request.
 *
 * @example
 * const result = await ordersTableSwapPassApi(123, "OLD123", "NEW456", 1, false)
 * if (result.success) {
 *   console.log("Pass swapped successfully")
 * }
 */
export async function ordersTableSwapPassApi(
    orderId: number,
    oldPassId: string,
    newPassId: string,
    resortId: number,
    _swapSkipass?: boolean
): Promise<TSwapPassResponse> {
    console.log("🔄 [API] Swapping pass (Myth only)...", { orderId, oldPassId, newPassId, resortId })

    const HONO_API_URL = process.env.NEXT_PUBLIC_HONO_API_URL ?? process.env.HONO_API_URL ?? ""
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? process.env.HONO_API_KEY ?? ""

    if (!HONO_API_URL || !API_KEY) {
        console.error("Missing required environment variables:", { HONO_API_URL, API_KEY })
        return {
            success: false,
            message: "Server configuration error"
        }
    }

    try {
        const payload = swapPassSchema.parse({
            orderId,
            resortId,
            oldPassId,
            newPassId,
        })

        console.log("Attempting to swap pass with payload:", JSON.stringify(payload, null, 2))

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

        const response = await fetch(`${HONO_API_URL}/api/cash-desk/swap-active-lifepass`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            cache: 'no-store'
        })

        clearTimeout(timeoutId)

        const responseData = await response.json() as SwapPassApiResponse
        console.log("API Response:", {
            status: response.status,
            statusText: response.statusText,
            data: responseData
        })

        if (!response.ok || !responseData.success) {
            console.error("Swap pass failed:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            })
            try {
                console.error("Swap pass failed (raw json):", JSON.stringify(responseData, null, 2))
            } catch {}
            return {
                success: false,
                message: "Failed to swap pass. Please try again.",
                data: responseData
            }
        }

        return {
            success: true,
            data: responseData,
            message: "Successfully swapped pass"
        }
    } catch (error) {
        console.error("Error in swapPass:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            payload: { orderId, oldPassId, newPassId, resortId }
        })

        if (error instanceof Error && error.name === "AbortError") {
            return {
                success: false,
                message: "Request timed out. Please try again.",
            }
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred"
        }
    }
}

