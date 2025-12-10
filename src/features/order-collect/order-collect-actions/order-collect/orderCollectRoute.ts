"use server"

import { z } from "zod"
import posthog from "posthog-js"

/**
 * JSDoc: Schema for click and collect order submission with bypass payment option
 * Why: Allows operational override during payment terminal issues or admin edge cases
 * How: Optional bypassPayment boolean defaults to false for normal operations
 */
const orderCollectSchema = z.object({
  orderId: z.number(),
  deviceIds: z
    .array(z.string().min(1, "Device ID is required"))
    .min(1, "At least one device ID is required"),
  /**
   * JSDoc: Allow bypassing payment enforcement for admin/edge cases.
   * Why: Operational override during issues with payment terminals or Stripe.
   * How: Optional boolean; when true, submit proceeds even if not fully paid.
   */
  bypassPayment: z.boolean().optional().default(false),
  /**
   * JSDoc: Allow early pickup collection even when start date window not reached.
   * Why: Operational override when guests arrive early and admin approves.
   * How: Optional boolean; when true, backend permits collection before window.
   */
  earlyPickup: z.boolean().optional().default(false)
})

export async function orderCollectRoute(
  orderId: number,
  deviceIds: string[],
  bypassPayment: boolean = false,
  earlyPickup: boolean = false
): Promise<{ success: boolean; message?: string }> {
  console.log("📝 [API] Submitting Click & Collect order...", {
    orderId,
    deviceCount: deviceIds.length,
    bypassPayment,
    earlyPickup,
  })

  // Log the start of order submission process
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('order_collection_submit_started', {
      order_id: orderId,
      device_count: deviceIds.length,
      bypass_payment: bypassPayment,
      early_pickup: earlyPickup,
      timestamp: new Date().toISOString(),
      action: 'click_and_collect_submit'
    })
  }

  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !HONO_API_KEY) {
    console.error("❌ [API] Missing required API configuration")
    return {
      success: false,
      message: "API configuration missing. Please check environment variables.",
    }
  }

  try {
    const payload = orderCollectSchema.parse({
      orderId,
      deviceIds,
      bypassPayment,
      earlyPickup,
    })

    const fullApiUrl = `${HONO_API_URL}/api/click-and-collect/cash-desk/collect-order`
    console.log("📤 [API] Making request to:", fullApiUrl)

    const response = await fetch(fullApiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HONO_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    )

    console.log("📤 [API] Response status:", response.status, response.statusText)
    console.log("📤 [API] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage: string

      try {
        // First check if the response is JSON by looking at content-type
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = (await response.json()) as { message?: string }
          console.error("Order Collection API Error Response:", errorData)
          errorMessage = errorData.message || `${response.status} ${response.statusText}`
        } else {
          // Handle non-JSON responses (HTML, plain text, etc.)
          const textResponse = await response.text()
          console.error("Order Collection API Non-JSON Error Response:", textResponse.substring(0, 200) + "...")

          // Provide more helpful error messages based on status code
          if (response.status === 404) {
            errorMessage = "Click & Collect collection endpoint not found. Please check API configuration."
          } else if (response.status === 500) {
            errorMessage = "Internal server error during order collection. Please try again or contact support."
          } else {
            errorMessage = `Order collection failed: ${response.status} ${response.statusText}`
          }
        }
      } catch (parseError) {
        console.error("Failed to parse order submission error response:", parseError)

        // Provide specific error messages based on status code
        if (response.status === 404) {
          errorMessage = "Click & Collect service unavailable. The order collection endpoint may not be configured."
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = "Authentication failed. Please check API configuration."
        } else {
          errorMessage = `Order collection error: ${response.status} ${response.statusText}`
        }
      }

      // Log API submission errors
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_submit_failed', {
          order_id: orderId,
          device_count: deviceIds.length,
          bypass_payment: bypassPayment,
          early_pickup: earlyPickup,
          error_message: errorMessage,
          status_code: response.status,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }

      return {
        success: false,
        message: errorMessage,
      }
    }

    // Log successful order submission
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_submit_success', {
        order_id: orderId,
        device_count: deviceIds.length,
        bypass_payment: bypassPayment,
      early_pickup: earlyPickup,
        timestamp: new Date().toISOString()
      })
    }

    return {
      success: true,
      message: "Order submitted successfully",
    }
  } catch (error) {
    console.error("Error submitting Click & Collect order:", error)

    // Log unexpected errors with different severity based on error type
    if (typeof window !== 'undefined' && posthog) {
      const isValidationError = error instanceof z.ZodError
      posthog.capture('order_collection_submit_error', {
        order_id: orderId,
        device_count: deviceIds.length,
        bypass_payment: bypassPayment,
        early_pickup: earlyPickup,
        error_type: isValidationError ? 'validation' : 'unexpected',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
        severity: isValidationError ? 'low' : 'medium'
      })
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0]?.message ?? "Invalid input data",
      }
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit order",
    }
  }
}
