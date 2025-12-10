"use server"

import { z } from "zod"

import { getMythOrderSchema } from "./schema"
import { type MythOrderResponse } from "./types"

/**
 * Fetches Myth order details from the Hono API
 *
 * @param orderId - The Myth order ID to fetch
 * @returns Myth order response with full order details
 * @throws Error if the API request fails or validation fails
 *
 * @description
 * Retrieves order details from the Myth system via Hono API.
 * Used by the Myth dialog to display order information and device status.
 *
 * @example
 * const order = await getMythOrder(12345)
 * console.log(order.orderDetails?.orderId)
 */
export async function getMythOrder(
  orderId: number
): Promise<MythOrderResponse> {
  console.log("🔍 [API] Fetching Myth order...", { orderId })

  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !HONO_API_KEY) {
    console.error("Missing required environment variables for Myth API")
    throw new Error("Server configuration error")
  }

  try {
    const payload = { orderId }
    getMythOrderSchema.parse(payload)

    const response = await fetch(`${HONO_API_URL}/api/myth/get-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      } as const,
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch Myth order", {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error("Failed to fetch Myth order")
    }

    const data = (await response.json()) as unknown
    if (!data || typeof data !== "object" || !("success" in data)) {
      throw new Error("Invalid response format")
    }

    return data as MythOrderResponse
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.message)
      throw new Error(`Validation error: ${error.message}`)
    }
    throw error
  }
}

