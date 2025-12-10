"use server"

import { cancelSkipassSchema } from "./schema"
import type { TCancelSkipassResponse, CancelSkipassApiResponse } from "./types"

/**
 * Cancels the old skipass on a device (minimal payload)
 *
 * @param orderId - Skidata Order ID (previous order to cancel from)
 * @param oldPassId - Old device/pass ID to cancel
 */
export async function ordersTableCancelSkipassApi(
  orderId: number,
  deviceId: number
): Promise<TCancelSkipassResponse> {
  console.log("🗑️ [API] Cancel skipass...", { orderId, deviceId })

  const HONO_API_URL = process.env.NEXT_PUBLIC_HONO_API_URL ?? process.env.HONO_API_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !API_KEY) {
    console.error("Missing required environment variables:", { HONO_API_URL, API_KEY })
    return { success: false, message: "Server configuration error" }
  }

  try {
    const payload = cancelSkipassSchema.parse({ orderId, deviceId })
    console.log("Attempting to cancel skipass with payload:", JSON.stringify(payload, null, 2))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const response = await fetch(`${HONO_API_URL}/api/cash-desk/cancel-skipass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    const responseData = (await response.json()) as CancelSkipassApiResponse
    console.log("Cancel Skipass API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (!response.ok || !responseData.success) {
      console.error("Cancel skipass failed:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      })
      return { success: false, message: "Failed to cancel skipass. Please try again.", data: responseData }
    }

    return { success: true, data: responseData, message: "Successfully cancelled skipass" }
  } catch (error) {
    console.error("Error in ordersTableCancelSkipassApi:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      payload: { orderId, deviceId },
    })

    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, message: "Request timed out. Please try again." }
    }

    return { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}


