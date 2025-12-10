"use server"

import { z } from "zod"
import posthog from "posthog-js"

/**
 * JSDoc: Schema for fetching order details before collection
 * Why: Validates order ID and ensures proper data structure for API call
 * How: Uses Zod validation to ensure orderId is a valid number
 */
const fetchOrderSchema = z.object({
  orderId: z.number().positive("Order ID must be a positive number"),
})

/**
 * JSDoc: Type definitions for order fetch response
 * Why: Provides type safety for the complex order data structure
 * How: Mirrors the API response structure with proper TypeScript types
 */
export type OrderDetails = {
  id: number
  status: string
  orderStatus: string | null
  paymentStatus: string
  clientDetails: {
    name: string
    email: string
    mobile: string
    stripeClientId: string
  }
  resortId: number
  salesChannel: string
  orderDetails: {
    resortId: number
    startDate: string
    products: Array<{
      productId: string
      consumerCategoryId: string
      insurance: boolean
      metadata: {
        salesRuleData: string
      }
    }>
  }
  calculatedOrderPrice: unknown // Using existing type from general-types
  deviceIds: string[] | null
  otp: string
  /** Whether the order is currently eligible for collection */
  canCollect?: boolean
  /** Optional reason explaining why collection is blocked */
  blockReason?: string | null
}

export type PaymentDetails = {
  isFullyPaid: boolean
  remainingAmountCents: number
  invoiceId: string
  invoiceStatus: string
  paymentIntentId: string
}

export type NewAPIResponse = {
  success: boolean
  orderNumber: number
  paid: boolean
  remainingBalance: number
  currency: string
  canCollect: boolean
  reason?: string
  orderDetails: {
    resortId: number
    startDate: string
    products: Array<{
      productId: string
      consumerCategoryId: string
      insurance: boolean
      metadata: {
        salesRuleData: string
      }
      productName: {
        en: string
        de: string
        fr: string
        it: string
      }
      consumerCategoryName: {
        en: string
        de: string
        fr: string
        it: string
      }
    }>
  }
  calculatedOrderPrice: unknown
  stripeDetails: {
    stripeInvoiceId: string
    stripeInvoiceStatus: string
    stripePaymentIntentIds: string[]
  }
}

export type FetchOrderResponse = {
  success: true
  data: {
    order: OrderDetails
    payment: PaymentDetails
  }
}

export type FetchOrderError = {
  success: false
  error: string
  errorType: "validation" | "api_key_invalid" | "not_found" | "unknown"
}

/**
 * JSDoc: Fetches order details before collection process
 * Why: Need to validate order status and payment before allowing collection
 * How: Calls the fetch-order API endpoint with proper error handling and logging
 */
export async function fetchOrderRoute(
  orderId: number
): Promise<FetchOrderResponse | FetchOrderError> {
  console.log("📋 [API] Fetching order details for collection...", { orderId })

  // Log the start of order fetching process
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('order_fetch_started', {
      order_id: orderId,
      timestamp: new Date().toISOString(),
      action: 'click_and_collect_fetch'
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
      posthog.capture('order_fetch_configuration_error', {
        order_id: orderId,
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
    const payload = fetchOrderSchema.parse({ orderId })

    const response = await fetch(
      `${HONO_API_URL}/api/click-and-collect/fetch-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HONO_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      let errorMessage: string
      let errorType: "validation" | "api_key_invalid" | "not_found" | "unknown" = "unknown"

      try {
        const errorData = (await response.json()) as { message?: string; error?: string }
        console.error("API Error Response:", errorData)
        errorMessage = errorData.message || errorData.error || `${response.status} ${response.statusText}`

        // Determine error type based on status code and message
        if (response.status === 401 || response.status === 403 ||
            errorMessage.toLowerCase().includes("invalid api key")) {
          errorType = "api_key_invalid"
        } else if (response.status === 404 ||
                   errorMessage.toLowerCase().includes("not found")) {
          errorType = "not_found"
        } else if (response.status >= 400 && response.status < 500) {
          errorType = "validation"
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError)
        errorMessage = `${response.status} ${response.statusText}`

        if (response.status === 401 || response.status === 403) {
          errorType = "api_key_invalid"
        } else if (response.status === 404) {
          errorType = "not_found"
        }
      }

      // Log API errors with appropriate severity
      if (typeof window !== 'undefined' && posthog) {
        const severity = errorType === "api_key_invalid" ? 'high' :
                        errorType === "not_found" ? 'medium' : 'low'

        posthog.capture('order_fetch_api_error', {
          order_id: orderId,
          error_message: errorMessage,
          error_type: errorType,
          status_code: response.status,
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

    const rawData = await response.json() as unknown
    console.log("🔍 [FetchOrder] Raw API Response:", rawData)

    // Check if this is the new API format
    const isNewAPIFormat = rawData !== null &&
                          typeof rawData === 'object' &&
                          'paid' in rawData &&
                          'remainingBalance' in rawData &&
                          'stripeDetails' in rawData

    let data: FetchOrderResponse

    if (isNewAPIFormat) {
      console.log("🔄 [FetchOrder] Detected NEW API format, converting to expected format...")
      // Type-safe casting after confirming the structure
      const newData = rawData as NewAPIResponse

      // Transform new API format to expected format
      data = {
        success: true,
        data: {
          order: {
            id: newData.orderNumber,
            status: newData.canCollect ? "ready" : "pending",
            orderStatus: null,
            paymentStatus: newData.paid ? "paid" : "unpaid",
            clientDetails: {
              name: "Unknown", // Not provided in new API
              email: "Unknown", // Not provided in new API
              mobile: "Unknown", // Not provided in new API
              stripeClientId: "Unknown" // Not provided in new API
            },
            resortId: newData.orderDetails.resortId,
            salesChannel: "Unknown", // Not provided in new API
            orderDetails: {
              resortId: newData.orderDetails.resortId,
              startDate: newData.orderDetails.startDate,
              products: newData.orderDetails.products
            },
            calculatedOrderPrice: newData.calculatedOrderPrice,
            deviceIds: null, // Not provided in new API
            otp: "Unknown", // Not provided in new API
            canCollect: newData.canCollect,
            blockReason: newData.reason ?? null
          },
          payment: {
            // Derive payment completion from remaining balance (single source of truth)
            isFullyPaid: newData.remainingBalance <= 0,
            remainingAmountCents: newData.remainingBalance,
            invoiceId: newData.stripeDetails.stripeInvoiceId,
            invoiceStatus: newData.stripeDetails.stripeInvoiceStatus,
            // Prefer the most recent PaymentIntent (last in array)
            paymentIntentId: (Array.isArray(newData.stripeDetails.stripePaymentIntentIds) && newData.stripeDetails.stripePaymentIntentIds.length > 0)
              ? (newData.stripeDetails.stripePaymentIntentIds.slice(-1)[0] ?? "Unknown")
              : "Unknown"
          }
        }
      }

      // Log the critical backend inconsistency detected in new API format
      if (newData.paid && newData.remainingBalance > 0) {
        console.error("🚨 [FetchOrder] BACKEND INCONSISTENCY IN NEW API FORMAT:", {
          orderId,
          backendSaysPaid: newData.paid,
          backendRemainingBalance: newData.remainingBalance,
          backendRemainingEuros: newData.remainingBalance / 100,
          stripeInvoiceId: newData.stripeDetails.stripeInvoiceId,
          stripeInvoiceStatus: newData.stripeDetails.stripeInvoiceStatus,
          message: "Backend reports paid=true but remainingBalance > 0 - this is contradictory!"
        })

        // Log critical backend API contradiction
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('critical_backend_api_contradiction', {
            order_id: orderId,
            backend_says_paid: newData.paid,
            backend_remaining_balance: newData.remainingBalance,
            stripe_invoice_id: newData.stripeDetails.stripeInvoiceId,
            stripe_invoice_status: newData.stripeDetails.stripeInvoiceStatus,
            api_format: 'new',
            timestamp: new Date().toISOString(),
            severity: 'critical'
          })
        }
      }
    } else {
      console.log("🔄 [FetchOrder] Detected OLD API format, using as-is...")
      // Type-safe casting after confirming it's not the new format
      data = rawData as FetchOrderResponse
    }

    // Enhanced debug logging for payment status detection issues
    console.log("🔍 [FetchOrder] Payment Status Debug:", {
      orderId,
      apiFormat: isNewAPIFormat ? 'new' : 'old',
      isFullyPaid: data.data.payment.isFullyPaid,
      remainingAmountCents: data.data.payment.remainingAmountCents,
      invoiceId: data.data.payment.invoiceId,
      invoiceStatus: data.data.payment.invoiceStatus,
      paymentIntentId: data.data.payment.paymentIntentId,
      orderPaymentStatus: data.data.order.paymentStatus,
      orderStatus: data.data.order.status
    })

    // Validate payment status consistency
    const isConsistent = data.data.payment.isFullyPaid === (data.data.payment.remainingAmountCents <= 0)
    if (!isConsistent) {
      console.error("🚨 [FetchOrder] PAYMENT STATUS INCONSISTENCY DETECTED:", {
        orderId,
        reportedAsFullyPaid: data.data.payment.isFullyPaid,
        actualRemainingCents: data.data.payment.remainingAmountCents,
        expectedFullyPaid: data.data.payment.remainingAmountCents <= 0,
        invoiceId: data.data.payment.invoiceId,
        paymentIntentId: data.data.payment.paymentIntentId,
        apiFormat: isNewAPIFormat ? 'new' : 'old'
      })

      // Log critical payment status inconsistency
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('critical_payment_status_inconsistency', {
          order_id: orderId,
          reported_fully_paid: data.data.payment.isFullyPaid,
          actual_remaining_cents: data.data.payment.remainingAmountCents,
          expected_fully_paid: data.data.payment.remainingAmountCents <= 0,
          invoice_id: data.data.payment.invoiceId,
          payment_intent_id: data.data.payment.paymentIntentId,
          api_format: isNewAPIFormat ? 'new' : 'old',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        })
      }
    }

    // Log successful order fetch
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_fetch_success', {
        order_id: orderId,
        order_status: data.data.order.status,
        payment_status: data.data.order.paymentStatus,
        is_fully_paid: data.data.payment.isFullyPaid,
        remaining_amount_cents: data.data.payment.remainingAmountCents,
        products_count: data.data.order.orderDetails.products.length,
        payment_status_consistent: isConsistent,
        api_format: isNewAPIFormat ? 'new' : 'old',
        timestamp: new Date().toISOString()
      })
    }

    return data
  } catch (error) {
    console.error("Error fetching order details:", error)

    const errorResult = {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch order details",
      errorType: "unknown" as const,
    }

    // Log unexpected errors
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_fetch_unexpected_error', {
        order_id: orderId,
        error_message: errorResult.error,
        error_name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      })
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Invalid order ID",
        errorType: "validation",
      }
    }

    return errorResult
  }
}
