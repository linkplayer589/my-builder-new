"use server"

import { z } from "zod"
import posthog from "posthog-js"

/**
 * JSDoc: Schema for click-and-collect payment capture
 * Why: Validates payment data for the dedicated click-and-collect capture endpoint
 * How: Uses the same schema as the Hono API endpoint for consistency
 */
const clickAndCollectCapturePaymentSchema = z.object({
  orderId: z.number().int().positive(),
  readerId: z.string().min(1),
  /** Optional, for backends that require explicit amount */
  amountCents: z.number().int().nonnegative().optional(),
  /** Optional 3-letter currency code, e.g., EUR */
  currency: z.string().min(3).max(3).optional(),
  /** Optional invoice identifier if backend needs it */
  invoiceId: z.string().min(3).optional(),
  /** Optional order number alias for backends expecting this naming */
  orderNumber: z.number().int().positive().optional(),
  /** Optional stripe invoice id alias */
  stripeInvoiceId: z.string().min(3).optional(),
  /** Optional existing PaymentIntent to process on the reader */
  paymentIntentId: z.string().min(3).optional()
})

export type ClickAndCollectCapturePaymentRequest = z.infer<typeof clickAndCollectCapturePaymentSchema>

export type ClickAndCollectCapturePaymentResponse = {
  success: boolean
  transactionId?: string
  status?: string
  message?: string
}

export type ClickAndCollectCapturePaymentError = {
  success: false
  error: string
  errorType: "validation" | "api_key_invalid" | "unknown" | "timeout" | "aborted"
}

/**
 * JSDoc: Capture remaining balance payment for click-and-collect orders
 * Why: Process payments for outstanding balances using the dedicated click-and-collect endpoint
 * How: Calls the specialized /api/click-and-collect/capture-payment endpoint
 */
export async function captureClickCollectPayment(
  request: ClickAndCollectCapturePaymentRequest
): Promise<ClickAndCollectCapturePaymentResponse | ClickAndCollectCapturePaymentError> {
  console.log("💳 [API] Capturing click-and-collect payment...", {
    orderId: request.orderId,
    readerId: request.readerId,
  })

  // Log payment capture initiation
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('click_collect_payment_capture_started', {
      order_id: request.orderId,
      reader_id: request.readerId,
      amount_cents: request.amountCents,
      currency: request.currency,
      invoice_id: request.invoiceId,
      order_number: request.orderNumber,
      stripe_invoice_id: request.stripeInvoiceId,
      payment_intent_id: request.paymentIntentId,
      timestamp: new Date().toISOString()
    })
  }

  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

  if (!HONO_API_URL || !HONO_API_KEY) {
    const error = {
      success: false as const,
      error: "API URL or API KEY is not set",
      errorType: "unknown" as const,
    }

    // Log configuration errors
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('click_collect_payment_configuration_error', {
        order_id: request.orderId,
        error: error.error,
        missing_url: !HONO_API_URL,
        missing_key: !HONO_API_KEY,
        timestamp: new Date().toISOString(),
        severity: 'high'
      })
    }

    return error
  }

  try {
    const validatedRequest = clickAndCollectCapturePaymentSchema.parse(request)

    const response = await fetch(
      `${HONO_API_URL}/api/click-and-collect/capture-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HONO_API_KEY,
        },
        body: JSON.stringify({
          // Primary fields
          orderId: validatedRequest.orderId,
          readerId: validatedRequest.readerId,
          amountCents: validatedRequest.amountCents,
          currency: validatedRequest.currency?.toUpperCase(),
          invoiceId: validatedRequest.invoiceId,
          // Common aliases for backend compatibility
          orderNumber: validatedRequest.orderNumber ?? validatedRequest.orderId,
          stripeInvoiceId: validatedRequest.stripeInvoiceId ?? validatedRequest.invoiceId,
          reader: validatedRequest.readerId,
          stripeReaderId: validatedRequest.readerId,
          amount: validatedRequest.amountCents, // Some backends expect 'amount' in cents
          paymentIntentId: validatedRequest.paymentIntentId
        }),
      }
    )

    console.log("💳 [API] Payment capture response status:", response.status)

    if (!response.ok) {
      let errorMessage: string
      let errorType: "validation" | "api_key_invalid" | "unknown" = "unknown"

      try {
        // First check if the response is JSON by looking at content-type
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = (await response.json()) as { message?: string; error?: string }
          console.error("Payment API Error Response:", errorData)
          errorMessage = errorData.message || errorData.error || `${response.status} ${response.statusText}`
        } else {
          // Handle non-JSON responses (HTML, plain text, etc.)
          const textResponse = await response.text()
          console.error("Payment API Non-JSON Error Response:", textResponse.substring(0, 200) + "...")

          // Provide more helpful error messages based on status code
          if (response.status === 404) {
            errorMessage = "Click-and-collect capture endpoint not found. The API may not be updated."
          } else if (response.status === 500) {
            errorMessage = "Internal server error during payment capture. Please try again or contact support."
          } else {
            errorMessage = `Payment capture failed: ${response.status} ${response.statusText}`
          }
        }

        // Determine error type based on status code and message
        if (response.status === 401 || response.status === 403 ||
            errorMessage.toLowerCase().includes("invalid api key")) {
          errorType = "api_key_invalid"
        } else if (response.status >= 400 && response.status < 500) {
          errorType = "validation"
        }
      } catch (parseError) {
        console.error("Failed to parse payment error response:", parseError)

        // Provide specific error messages based on status code
        if (response.status === 404) {
          errorMessage = "Click-and-collect capture service unavailable. Please check API configuration."
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = "Authentication failed. Please check API configuration."
          errorType = "api_key_invalid"
        } else {
          errorMessage = `Payment capture error: ${response.status} ${response.statusText}`
        }
      }

      // Log payment API errors
      if (typeof window !== 'undefined' && posthog) {
        const severity = errorType === "api_key_invalid" ? 'high' : 'medium'

      posthog.capture('click_collect_payment_capture_api_error', {
          order_id: request.orderId,
          reader_id: request.readerId,
          error_message: errorMessage,
          error_type: errorType,
          status_code: response.status,
        amount_cents: request.amountCents,
        currency: request.currency,
        invoice_id: request.invoiceId,
        order_number: request.orderNumber,
        stripe_invoice_id: request.stripeInvoiceId,
        payment_intent_id: request.paymentIntentId,
          timestamp: new Date().toISOString(),
          severity
        })
      }

      return {
        success: false,
        error: errorMessage,
        errorType,
      }
    }

    const data = await response.json() as ClickAndCollectCapturePaymentResponse

    // Log successful payment capture
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('click_collect_payment_capture_success', {
        order_id: request.orderId,
        reader_id: request.readerId,
        transaction_id: data.transactionId,
        amount_cents: request.amountCents,
        currency: request.currency,
        invoice_id: request.invoiceId,
        order_number: request.orderNumber,
        stripe_invoice_id: request.stripeInvoiceId,
        payment_intent_id: request.paymentIntentId,
        timestamp: new Date().toISOString()
      })
    }

    return {
      success: true,
      transactionId: data.transactionId,
      status: data.status,
      message: data.message || "Payment captured successfully",
    }
  } catch (error) {
    console.error("Error capturing click-and-collect payment:", error)

    const errorResult = {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to capture payment",
      errorType: "unknown" as const,
    }

    // Log unexpected errors
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('click_collect_payment_capture_unexpected_error', {
        order_id: request.orderId,
        reader_id: request.readerId,
        error_message: errorResult.error,
        error_name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      })
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Invalid payment data",
        errorType: "validation",
      }
    }

    return errorResult
  }
}
