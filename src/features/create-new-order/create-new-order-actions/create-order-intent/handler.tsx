"use server"

import {
  type CreateOrderIntentResponse,
  type CreateOrderIntentSchemaType,
} from "./types"

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

export async function createOrderIntent(
  payload: CreateOrderIntentSchemaType,
  signal?: AbortSignal
): Promise<
  | { success: true; data: CreateOrderIntentResponse }
  | {
      success: false
      error: string
      errorType: "validation" | "unknown" | "timeout" | "aborted"
    }
> {
  console.log("📋 [API] Creating order intent...", {
    resortId: payload.resortId,
  })
  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY

  if (!HONO_API_URL || !HONO_API_KEY) {
    return {
      success: false,
      error: "API URL or API KEY is not set",
      errorType: "unknown",
    }
  }

  // Create a timeout abort controller
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timeoutController.abort()
  }, TIMEOUT_DURATION)

  try {
    const url = new URL(`${HONO_API_URL}/api/cash-desk/create-order-intent`)

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      },
      body: JSON.stringify(payload),
      // Combine both the passed signal and timeout signal
      signal: signal
        ? AbortSignal.any([signal, timeoutController.signal])
        : timeoutController.signal,
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = (await response.json()) as CreateOrderIntentResponse
    return { success: true, data }
  } catch (error) {
    console.error("Error creating order intent:", error)

    // Handle abort errors
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: timeoutController.signal.aborted
          ? "Request timed out after 30 seconds"
          : "Request was aborted",
        errorType: timeoutController.signal.aborted ? "timeout" : "aborted",
      }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      errorType: "unknown",
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
