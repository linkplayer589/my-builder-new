import { z } from "zod"

/**
 * Request payload for check-payment-status endpoint
 */
export const checkPaymentStatusSchema = z.object({
    resortId: z.number(),
    // Provide either invoiceId OR orderId
    invoiceId: z.string().optional(),
    orderId: z.number().optional(),
}).refine(
    (data) => data.invoiceId || data.orderId,
    { message: "Either invoiceId or orderId must be provided" }
)
export type TCheckPaymentStatusRequest = z.infer<typeof checkPaymentStatusSchema>

/**
 * Payment status values returned by the API
 */
export type TPaymentStatus =
    | "succeeded"
    | "processing"
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "canceled"
    | "failed"

/**
 * API response from check-payment-status endpoint.
 * Note: success: false does NOT mean error - it means payment is still processing.
 * success: true means payment succeeded.
 * An actual error response will have 'error' and 'errorType' fields instead of 'status'.
 */
export type TCheckPaymentStatusAPIResponse = {
    success: boolean
    status: TPaymentStatus
    paymentIntentId?: string
    invoiceId?: string
    orderId?: string
    amountPaid?: number // Amount in cents
    currency?: string
    paymentMethodType?: string // e.g., "card_present"
    paidAt?: string // ISO timestamp
    errorMessage?: string // If payment failed
}

/**
 * Error response when the API call itself fails (not payment failure)
 */
export type TCheckPaymentStatusErrorResponse = {
    success: false
    error: string
    errorType: "validation" | "unknown" | "timeout" | "aborted" | "not_found"
}

/**
 * Combined response type for check-payment-status
 * Use 'error' field to distinguish between API error and payment status
 */
export type TCheckPaymentStatusResult =
    | TCheckPaymentStatusAPIResponse
    | TCheckPaymentStatusErrorResponse

/**
 * Helper to check if response is an API error (not a payment status)
 */
export function isApiError(result: TCheckPaymentStatusResult): result is TCheckPaymentStatusErrorResponse {
    return "error" in result && "errorType" in result
}

