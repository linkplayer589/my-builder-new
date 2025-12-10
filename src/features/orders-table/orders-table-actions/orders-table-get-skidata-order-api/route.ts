"use server"

import type { TSkidataOrderResponse } from "./types"

/**
 * Fetches Skidata order details from the API
 * 
 * @param resortId - Resort ID for the Skidata system
 * @param skidataOrderId - Skidata order ID to fetch
 * @returns Skidata order response with full order details
 * @throws Error if the API request fails
 * 
 * @description
 * Retrieves order details from the Skidata system via Hono API.
 * Used to display Skidata order information in dialogs and order views.
 * 
 * @example
 * const order = await ordersTableGetSkidataOrderApi(1, "SKI123456")
 * console.log(order.orderDetails.confirmationNumber)
 */
export async function ordersTableGetSkidataOrderApi(
    resortId: number,
    skidataOrderId: string
): Promise<TSkidataOrderResponse> {
    console.log("🎿 [API] Getting Skidata order...", { resortId, skidataOrderId })

    const HONO_API_URL = process.env.HONO_API_URL ?? ""
    const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

    if (!HONO_API_URL || !HONO_API_KEY) {
        console.error("Missing required environment variables for Skidata API")
        throw new Error("Server configuration error")
    }

    const response = await fetch(`${HONO_API_URL}/api/skidata/get-order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": HONO_API_KEY,
        },
        body: JSON.stringify({
            resortId,
            skidataOrderId,
        }),
        cache: "no-store",
    })

    if (!response.ok) {
        console.error("Failed to fetch Skidata order:", {
            status: response.status,
            statusText: response.statusText,
        })
        throw new Error("Failed to fetch Skidata order")
    }

    return response.json() as Promise<TSkidataOrderResponse>
}

