"use server"

import { revalidateTag } from "next/cache"
import type { ZodIssue } from "zod"

import { type OrderDataType } from "../../create-new-order-components/create-new-order-sheet"
import type {
  CashDeskSubmitOrderReturn,
  CashDeskSubmitOrderSchemaType,
} from "./types"

/**
 * Error with optional session ID for debugging
 */
export type SubmitOrderError = Error & { sessionId?: number }

export async function submitOrder(
  orderId: number,
  orderData: OrderDataType,
  paymentBypassed: boolean = false,
  resubmit: boolean = false
): Promise<
  | { success: true; data: CashDeskSubmitOrderReturn }
  | { success: false; error: SubmitOrderError; errorType: "unknown"; sessionId?: number }
  | { success: false; error: ZodIssue[]; errorType: "validation"; sessionId?: number }
> {
  console.log("📝 [API] Submitting order...", {
    orderId,
    resortId: orderData.resortId,
    paymentBypassed,
    resubmit,
  })

  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY

  if (!HONO_API_URL || !HONO_API_KEY) {
    return {
      success: false,
      error: new Error("API URL or API KEY is not set"),
      errorType: "unknown",
    }
  }

  console.log(orderData)

  const cashDeskSubmitOrderPayload: CashDeskSubmitOrderSchemaType = {
    orderId: orderId,
    resortId: orderData.resortId,
    telephone: orderData.telephone,
    name: orderData.name,
    email: orderData.email,
    languageCode: orderData.languageCode,
    devices: orderData.devices,
    startDate: orderData.startDate?.toISOString().split("T")[0] ?? "",
    paymentBypassed: paymentBypassed,
    resubmit: resubmit,
  }

  console.log("Payload:", cashDeskSubmitOrderPayload)

  try {
    const url = new URL(`${HONO_API_URL}/api/cash-desk/submit-order`)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      },
      body: JSON.stringify(cashDeskSubmitOrderPayload),
      signal: controller.signal,
    }

    try {
      const response = await fetch(url.toString(), options)
      const responseJson = (await response.json()) as
        | CashDeskSubmitOrderReturn
        | ZodIssue[]

      console.log("Response:", responseJson)

      if (!response.ok) {
        console.error("Failed to submit order:", responseJson)

        // Extract sessionId from API response for debugging
        const errorResponseWithSession = responseJson as
          | { error?: string; message?: string; sessionId?: number }
          | ZodIssue[]
        const sessionId = !Array.isArray(errorResponseWithSession)
          ? errorResponseWithSession.sessionId
          : undefined

        if (response.status === 400 && Array.isArray(responseJson)) {
          // Return validation errors
          return {
            success: false,
            error: responseJson,
            errorType: "validation",
            sessionId,
          }
        }

        // Extract error message from API response
        // API may return error in 'error' field or 'message' field
        const errorMessage = Array.isArray(errorResponseWithSession)
          ? "Validation errors occurred"
          : errorResponseWithSession.error ||
            errorResponseWithSession.message ||
            response.statusText ||
            "An error occurred during order submission"

        console.error("Extracted error message:", errorMessage, "sessionId:", sessionId)

        // Create error with sessionId attached
        const error = new Error(errorMessage) as SubmitOrderError
        error.sessionId = sessionId

        return {
          success: false,
          error,
          errorType: "unknown",
          sessionId,
        }
      }

      // Only revalidate on success
      revalidateTag("orders", "max")

      // Return successful result
      return { success: true, data: responseJson as CashDeskSubmitOrderReturn }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error("Error submitting order:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("An unknown error occurred."),
      errorType: "unknown",
    }
  }
}
