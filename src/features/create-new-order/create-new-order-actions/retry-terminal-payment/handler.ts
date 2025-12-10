"use server"

import { z } from "zod"

import {
    retryTerminalPaymentSchema,
    type TRetryTerminalPaymentRequest,
    type TRetryTerminalPaymentResult,
    type TRetryTerminalPaymentResponse,
} from "./types"

type APIErrorResponse = {
    message?: string
    error?: string
    [key: string]: unknown
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
    return `rtp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Retries a terminal payment that failed or timed out.
 * Use this if the initial terminal payment fails or times out.
 *
 * @param payload - The retry payment request data (terminalId + invoiceId OR orderId)
 * @returns Promise with new paymentIntentId, clientSecret for retry
 */
export async function retryTerminalPayment(
    payload: TRetryTerminalPaymentRequest
): Promise<TRetryTerminalPaymentResult> {
    const requestId = generateRequestId()
    const timestamp = new Date().toISOString()

    console.log("═══════════════════════════════════════════════════════════════")
    console.log("🔄 [RETRY-TERMINAL-PAYMENT] Retrying terminal payment")
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`📋 Request ID: ${requestId}`)
    console.log(`🕐 Timestamp: ${timestamp}`)
    console.log("📦 Input Parameters:")
    console.log(`   ├─ Terminal ID: ${payload.terminalId}`)
    console.log(`   ├─ Invoice ID: ${payload.invoiceId || "(not provided)"}`)
    console.log(`   └─ Order ID: ${payload.orderId || "(not provided)"}`)

    const HONO_API_URL = process.env.HONO_API_URL ?? ""
    const HONO_API_KEY = process.env.HONO_API_KEY

    if (!HONO_API_URL || !HONO_API_KEY) {
        console.error(`❌ [${requestId}] API configuration missing`)
        return {
            success: false,
            error: "API URL or API KEY is not set",
            errorType: "unknown",
        }
    }

    try {
        // Validate the payload
        const validatedPayload = retryTerminalPaymentSchema.parse(payload)
        console.log(`✅ [${requestId}] Payload validation passed`)

        const url = new URL(`${HONO_API_URL}/api/cash-desk/retry-terminal-payment`)
        console.log(`🌐 [${requestId}] Calling API: ${url.toString()}`)

        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            },
            body: JSON.stringify(validatedPayload),
        }

        const fetchStartTime = performance.now()
        const response = await fetch(url.toString(), options)
        const fetchDuration = (performance.now() - fetchStartTime).toFixed(2)

        console.log(`📡 [${requestId}] Response received in ${fetchDuration}ms - Status: ${response.status}`)

        if (!response.ok) {
            let errorMessage: string
            let errorType: "validation" | "unknown" | "timeout" | "aborted" | "not_found" | "terminal_error" | "already_paid" = "unknown"

            try {
                const errorData = (await response.json()) as APIErrorResponse
                console.error(`❌ [${requestId}] API Error Response:`, JSON.stringify(errorData, null, 2))
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)

                // Check for specific error types
                if (
                    errorMessage.toLowerCase().includes("not found") ||
                    errorMessage.toLowerCase().includes("invoice not found") ||
                    errorMessage.toLowerCase().includes("order not found") ||
                    response.status === 404
                ) {
                    errorType = "not_found"
                } else if (
                    errorMessage.toLowerCase().includes("terminal not found") ||
                    errorMessage.toLowerCase().includes("reader not found") ||
                    errorMessage.toLowerCase().includes("reader is currently busy")
                ) {
                    errorType = "terminal_error"
                } else if (
                    errorMessage.toLowerCase().includes("already paid") ||
                    errorMessage.toLowerCase().includes("no remaining amount")
                ) {
                    errorType = "already_paid"
                } else if (response.status >= 400 && response.status < 500) {
                    errorType = "validation"
                }
            } catch (parseError) {
                console.error(`❌ [${requestId}] Failed to parse error response:`, parseError)
                errorMessage = `${response.status} ${response.statusText}`

                if (response.status === 404) {
                    errorType = "not_found"
                }
            }

            console.log("═══════════════════════════════════════════════════════════════")
            console.log(`❌ [RETRY-TERMINAL-PAYMENT] FAILED - Request ID: ${requestId}`)
            console.log(`   ├─ Error Type: ${errorType}`)
            console.log(`   └─ Error Message: ${errorMessage}`)
            console.log("═══════════════════════════════════════════════════════════════")

            return {
                success: false,
                error: errorMessage,
                errorType,
            }
        }

        const responseData = (await response.json()) as TRetryTerminalPaymentResponse

        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`✅ [RETRY-TERMINAL-PAYMENT] SUCCESS - Request ID: ${requestId}`)
        console.log("═══════════════════════════════════════════════════════════════")
        console.log("🆔 IDs in Response:")
        console.log(`   ├─ PaymentIntent ID: ${responseData.paymentIntentId}`)
        console.log(`   ├─ Invoice ID: ${responseData.invoiceId}`)
        console.log(`   └─ Order ID: ${responseData.orderId || "(not in response)"}`)
        console.log("💰 Payment Details:")
        console.log(`   └─ Remaining Amount: ${responseData.remainingAmountCents} cents (${(responseData.remainingAmountCents / 100).toFixed(2)} EUR)`)
        console.log(`🔑 Client Secret (first 20 chars): ${responseData.clientSecret?.substring(0, 20)}...`)
        console.log("═══════════════════════════════════════════════════════════════")

        return responseData
    } catch (error) {
        console.error(`❌ [${requestId}] Exception during retryTerminalPayment:`, error)

        // Handle validation errors
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
                errorType: "validation",
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
            errorType: "unknown",
        }
    }
}

