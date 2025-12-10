"use server"

import { returnLifepassSchema } from "./schema"
import type { TReturnLifepassResponse, ReturnLifepassApiResponse } from "./types"

/**
 * Returns one or more lifepass devices to inventory
 * 
 * @param deviceIds - Array of device IDs to return
 * @returns Object with success status and message
 * 
 * @description
 * Calls the Hono API to return lifepass devices to inventory.
 * Typically used when a customer returns their devices at the end of rental.
 * Has a 10-second timeout for the API request.
 * 
 * @example
 * const result = await ordersTableReturnLifepassApi(["DEVICE123", "DEVICE456"])
 * if (result.success) {
 *   console.log(result.message) // "Successfully returned 2 lifepasses"
 * }
 */
export async function ordersTableReturnLifepassApi(
  deviceIds: string[]
): Promise<TReturnLifepassResponse> {
  console.log("🔄 [API] Returning lifepasses...", {
    deviceCount: deviceIds.length,
  })
  
  const HONO_API_URL =
    process.env.NEXT_PUBLIC_HONO_API_URL ?? process.env.HONO_API_URL ?? ""
  const API_KEY =
    process.env.NEXT_PUBLIC_API_KEY ?? process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !API_KEY) {
    console.error("Missing required environment variables:", {
      HONO_API_URL,
      API_KEY,
    })
    return {
      success: false,
      message: "Server configuration error",
    }
  }

  try {
    const payload = returnLifepassSchema.parse({
      deviceIdsArray: deviceIds,
    })

    console.log(
      "Attempting to return lifepasses with payload:",
      JSON.stringify(payload, null, 2)
    )

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      `${HONO_API_URL}/api/cash-desk/return-lifepass`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      }
    )

    clearTimeout(timeoutId)

    const responseData = (await response.json()) as ReturnLifepassApiResponse
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (!response.ok || !responseData.success) {
      console.error("Return lifepass failed:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      })
      return {
        success: false,
        message: "Failed to return lifepass. Please try again.",
        data: responseData,
      }
    }

    return {
      success: true,
      data: responseData,
      message: `Successfully returned ${deviceIds.length} lifepass${deviceIds.length > 1 ? "es" : ""}`,
    }
  } catch (error) {
    console.error("Error in returnLifepass:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      deviceIds,
    })

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        message: "Request timed out. Please try again.",
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while returning the lifepass",
    }
  }
}

