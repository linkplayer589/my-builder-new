"use server"

import { type Order } from "@/db/schema"

export type ConfirmPaymentSchemaType = {
  orderId: string
  transactionId: string
}

export type ConfirmPaymentResponse = {
  success: boolean
  data: Order
}

type APIErrorResponse = {
  message?: string
  error?: string
  [key: string]: unknown
}

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

export async function retrieveOrder(
  payload: ConfirmPaymentSchemaType,
  signal?: AbortSignal
): Promise<
  | ConfirmPaymentResponse
  | {
      success: false
      error: string
      errorType: "validation" | "unknown" | "timeout" | "aborted"
    }
> {
  console.log("🔍 [API] Retrieving order...", { orderId: payload.orderId })
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
    const url = new URL(`${HONO_API_URL}/api/kiosk/retrieve-order`)
    console.log("Calling API endpoint:", url.toString())

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      } as HeadersInit,
      body: JSON.stringify({ orderId: Number(payload.orderId) }),
      // Combine both the passed signal and timeout signal
      signal: signal
        ? AbortSignal.any([signal, timeoutController.signal])
        : timeoutController.signal,
    }

    console.log("Request payload:", { orderId: Number(payload.orderId) })
    const response = await fetch(url, options)
    console.log("Response status:", response.status, response.statusText)

    if (!response.ok) {
      let errorMessage: string
      try {
        const errorData = (await response.json()) as APIErrorResponse
        console.error("API Error Response:", errorData)
        errorMessage =
          errorData.message || errorData.error || JSON.stringify(errorData)
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError)
        errorMessage = `${response.status} ${response.statusText}`
      }

      throw new Error(errorMessage)
    }

    const responseData = (await response.json()) as Order
    console.log("Order status:", responseData.status)

    return {
      success: true,
      data: responseData,
    } as ConfirmPaymentResponse
  } catch (error) {
    console.error("Error confirming payment:", error)

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
