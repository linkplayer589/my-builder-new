"use server"

import { createSkipassSchema } from "./schema"
import type { TCreateSkipassResponse, CreateSkipassApiResponse } from "./types"

/**
 * Creates a new skipass on a device
 *
 * @param orderId - Order ID
 * @param oldPassId - Current pass ID to swap from
 * @param newPassId - New pass ID to swap to
 * @returns Object with success status and message
 *
 * @description
 * Calls the Hono API to create a new Skidata order for the specified device.
 * This is intended as process 2 of the swap flow.
 * Has a 60-second timeout for the API request.
 */
export async function ordersTableCreateSkipassApi(
  orderId: number,
  oldPassId: string,
  newPassId: string
): Promise<TCreateSkipassResponse> {
  console.log("🆕 [API] Create skipass...", { orderId, oldPassId, newPassId })

  const HONO_API_URL = process.env.NEXT_PUBLIC_HONO_API_URL ?? process.env.HONO_API_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !API_KEY) {
    console.error("Missing required environment variables:", { HONO_API_URL, API_KEY })
    return {
      success: false,
      message: "Server configuration error",
    }
  }

  try {
    const payload = createSkipassSchema.parse({ orderId, oldPassId, newPassId })
    console.log("Attempting to create skipass with payload:", JSON.stringify(payload, null, 2))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const response = await fetch(`${HONO_API_URL}/api/cash-desk/create-skipass`, {
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

    const responseData = (await response.json()) as CreateSkipassApiResponse
    console.log("Create Skipass API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (!response.ok || !responseData.success) {
      console.error("Create skipass failed:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      })
      return {
        success: false,
        message: "Failed to create skipass. Please try again.",
        data: responseData,
      }
    }

    return {
      success: true,
      data: responseData,
      message: "Successfully created skipass",
    }
  } catch (error) {
    console.error("Error in ordersTableCreateSkipassApi:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      payload: { orderId, oldPassId, newPassId },
    })

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        message: "Request timed out. Please try again.",
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}


