"use server"

import type { 
  KioskSlotsResponse, 
  KioskApiError 
} from "../kiosk-detail-types"

/**
 * Fetches detailed slot information for a specific kiosk
 * Includes slot states, battery details, and fault information
 * 
 * @param kioskId - The unique identifier of the kiosk (e.g., "DTN00143")
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to slot information or error
 */
export async function getKioskSlots(
  kioskId: string,
  signal?: AbortSignal
): Promise<KioskSlotsResponse | KioskApiError> {
  const TIMEOUT_DURATION = 30000 // 30 seconds

  try {
    console.log(`[API] Fetching kiosk slots for: ${kioskId}`)

    // Create timeout controller
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(
      () => timeoutController.abort(),
      TIMEOUT_DURATION
    )

    // Combine user signal with timeout signal
    const combinedSignal = signal
      ? combineAbortSignals([signal, timeoutController.signal])
      : timeoutController.signal

    // Get API base URL from environment
    const apiBaseUrl = process.env.HONO_API_URL 
    const apiKey = process.env.HONO_API_KEY

    if (!apiKey) {
      console.error("[API] Missing HONO_API_KEY environment variable")
      return {
        success: false,
        error: "API key not configured",
        errorType: "api_key_invalid",
      }
    }

    const response = await fetch(`${apiBaseUrl}/api/kiosks/${kioskId}/slots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      signal: combinedSignal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: `Kiosk ${kioskId} not found`,
          errorType: "not_found",
        }
      }

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: "Invalid API key",
          errorType: "api_key_invalid",
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = (await response.json()) as KioskSlotsResponse

    console.log(`[API] Successfully fetched slots for kiosk: ${kioskId}`)
    return data
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        if (signal?.aborted) {
          console.log("[API] Kiosk slots request aborted by user")
          return {
            success: false,
            error: "Request was cancelled",
            errorType: "aborted",
          }
        }
        console.log("[API] Kiosk slots request timed out")
        return {
          success: false,
          error: "Request timed out",
          errorType: "timeout",
        }
      }

      console.error("[API] Error fetching kiosk slots:", error)
      return {
        success: false,
        error: error.message,
        errorType: "unknown",
      }
    }

    return {
      success: false,
      error: "An unknown error occurred",
      errorType: "unknown",
    }
  }
}

/**
 * Combines multiple AbortSignals into one
 * Used to handle both user cancellation and timeout
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort()
      return controller.signal
    }

    signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    })
  }

  return controller.signal
}

