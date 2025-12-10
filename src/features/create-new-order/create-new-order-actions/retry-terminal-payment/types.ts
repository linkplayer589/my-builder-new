import { z } from "zod"

/**
 * Request payload for retry-terminal-payment endpoint
 */
export const retryTerminalPaymentSchema = z.object({
    terminalId: z.string().min(1, "Terminal ID is required"),
    // Provide either invoiceId OR orderId (resortId extracted from order)
    invoiceId: z.string().optional(),
    orderId: z.number().optional(),
    resortId: z.number().optional(), // Optional if orderId provided
}).refine(
    (data) => data.invoiceId || data.orderId,
    { message: "Either invoiceId or orderId must be provided" }
)
export type TRetryTerminalPaymentRequest = z.infer<typeof retryTerminalPaymentSchema>

/**
 * Successful response from retry-terminal-payment endpoint
 */
export type TRetryTerminalPaymentResponse = {
    success: true
    message: string
    paymentIntentId: string
    clientSecret: string
    remainingAmountCents: number
    invoiceId: string
    orderId?: number
}

/**
 * Error response from retry-terminal-payment endpoint
 */
export type TRetryTerminalPaymentErrorResponse = {
    success: false
    error: string
    errorType: "validation" | "unknown" | "timeout" | "aborted" | "not_found" | "terminal_error" | "already_paid"
}

/**
 * Combined response type for retry-terminal-payment
 */
export type TRetryTerminalPaymentResult =
    | TRetryTerminalPaymentResponse
    | TRetryTerminalPaymentErrorResponse







