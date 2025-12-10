"use server"

import { z } from "zod"

import {
    checkPaymentStatusSchema,
    type TCheckPaymentStatusRequest,
    type TCheckPaymentStatusResult,
    type TCheckPaymentStatusAPIResponse,
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
    return `cps-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Checks the payment status for a terminal payment.
 * Poll this endpoint to verify if the terminal payment has completed.
 *
 * @param payload - The payment status request data (resortId + invoiceId OR orderId)
 * @returns Promise with payment status information
 */
export async function checkPaymentStatus(
    payload: TCheckPaymentStatusRequest
): Promise<TCheckPaymentStatusResult> {
    const requestId = generateRequestId()
    const timestamp = new Date().toISOString()

    console.log("───────────────────────────────────────────────────────────────")
    console.log("🔍 [CHECK-PAYMENT-STATUS] Checking payment status")
    console.log("───────────────────────────────────────────────────────────────")
    console.log(`📋 Request ID: ${requestId}`)
    console.log(`🕐 Timestamp: ${timestamp}`)
    console.log("📦 Query Parameters:")
    console.log(`   ├─ Resort ID: ${payload.resortId}`)
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
        const validatedPayload = checkPaymentStatusSchema.parse(payload)
        console.log(`✅ [${requestId}] Payload validation passed`)

        const url = new URL(`${HONO_API_URL}/api/cash-desk/check-payment-status`)
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
            let errorType: "validation" | "unknown" | "timeout" | "aborted" | "not_found" = "unknown"

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

            console.log("───────────────────────────────────────────────────────────────")
            console.log(`❌ [CHECK-PAYMENT-STATUS] FAILED - Request ID: ${requestId}`)
            console.log(`   ├─ Error Type: ${errorType}`)
            console.log(`   └─ Error Message: ${errorMessage}`)
            console.log("───────────────────────────────────────────────────────────────")

            return {
                success: false,
                error: errorMessage,
                errorType,
            }
        }

        const responseData = (await response.json()) as TCheckPaymentStatusAPIResponse

        // Determine status emoji
        const statusEmoji = responseData.status === "succeeded" ? "✅" :
                           responseData.status === "processing" ? "⏳" :
                           responseData.status === "failed" ? "❌" :
                           responseData.status === "canceled" ? "🚫" : "🔄"

        console.log("───────────────────────────────────────────────────────────────")
        console.log(`${statusEmoji} [CHECK-PAYMENT-STATUS] Result - Request ID: ${requestId}`)
        console.log("───────────────────────────────────────────────────────────────")
        console.log("🆔 IDs in Response:")
        console.log(`   ├─ Invoice ID: ${responseData.invoiceId || "(not in response)"}`)
        console.log(`   ├─ PaymentIntent ID: ${responseData.paymentIntentId || "(not in response)"}`)
        console.log(`   └─ Order ID: ${responseData.orderId || "(not in response)"}`)
        console.log("📊 Payment Status:")
        console.log(`   ├─ Status: ${responseData.status}`)
        console.log(`   ├─ Success: ${responseData.success}`)
        console.log(`   ├─ Amount Paid: ${responseData.amountPaid ? `${responseData.amountPaid} cents (${(responseData.amountPaid / 100).toFixed(2)} ${responseData.currency?.toUpperCase()})` : "(not paid)"}`)
        console.log(`   ├─ Payment Method: ${responseData.paymentMethodType || "(unknown)"}`)
        console.log(`   └─ Paid At: ${responseData.paidAt || "(not yet)"}`)
        if (responseData.errorMessage) {
            console.log(`   ⚠️ Error Message: ${responseData.errorMessage}`)
        }
        console.log("───────────────────────────────────────────────────────────────")

        return responseData
    } catch (error) {
        console.error(`❌ [${requestId}] Exception during checkPaymentStatus:`, error)

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

