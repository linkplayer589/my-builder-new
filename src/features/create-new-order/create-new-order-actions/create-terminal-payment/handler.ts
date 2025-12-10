"use server"

import { z } from "zod"

import {
    createTerminalPaymentSchema,
    type TCreateTerminalPaymentRequest,
    type TCreateTerminalPaymentResult,
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
    return `ctp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Creates a terminal payment (Stripe Invoice + PaymentIntent) for cash desk orders.
 * This creates the payment on the Stripe terminal and returns the clientSecret for processing.
 *
 * @param payload - The terminal payment request data
 * @returns Promise with success/error result containing invoiceId, paymentIntentId, clientSecret
 */
export async function createTerminalPayment(
    payload: TCreateTerminalPaymentRequest
): Promise<TCreateTerminalPaymentResult> {
    const requestId = generateRequestId()
    const timestamp = new Date().toISOString()

    console.log("═══════════════════════════════════════════════════════════════")
    console.log("💳 [CREATE-TERMINAL-PAYMENT] Starting new terminal payment request")
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`📋 Request ID: ${requestId}`)
    console.log(`🕐 Timestamp: ${timestamp}`)
    console.log("📦 Input Parameters:")
    console.log(`   ├─ Terminal ID: ${payload.terminalId}`)
    console.log(`   ├─ Resort ID: ${payload.resortId}`)
    console.log(`   ├─ Order ID: ${payload.orderId}`)
    console.log(`   ├─ Start Date: ${payload.startDate}`)
    console.log(`   ├─ Customer Name: ${payload.name}`)
    console.log(`   ├─ Telephone: ${payload.telephone}`)
    console.log(`   ├─ Email: ${payload.email || "(not provided)"}`)
    console.log(`   ├─ Language: ${payload.languageCode}`)
    console.log(`   └─ Devices Count: ${payload.devices?.length || 0}`)

    if (payload.devices && payload.devices.length > 0) {
        console.log("📱 Device Details:")
        payload.devices.forEach((device, idx) => {
            console.log(`   Device ${idx + 1}:`)
            console.log(`      ├─ Product ID: ${device.productId}`)
            console.log(`      ├─ Consumer Category ID: ${device.consumerCategoryId}`)
            console.log(`      └─ Insurance: ${device.insurance}`)
        })
    }

    const HONO_API_URL = process.env.HONO_API_URL ?? ""
    const HONO_API_KEY = process.env.HONO_API_KEY

    if (!HONO_API_URL || !HONO_API_KEY) {
        console.error(`❌ [${requestId}] API configuration missing`)
        console.log(`   ├─ HONO_API_URL: ${HONO_API_URL ? "✅ Set" : "❌ Missing"}`)
        console.log(`   └─ HONO_API_KEY: ${HONO_API_KEY ? "✅ Set" : "❌ Missing"}`)
        return {
            success: false,
            error: "API URL or API KEY is not set",
            errorType: "config_error",
        }
    }

    try {
        // Validate the payload
        const validatedPayload = createTerminalPaymentSchema.parse(payload)
        console.log(`✅ [${requestId}] Payload validation passed`)

        const url = new URL(`${HONO_API_URL}/api/cash-desk/create-terminal-payment`)
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

        console.log(`📡 [${requestId}] Response received in ${fetchDuration}ms`)
        console.log(`   ├─ Status: ${response.status}`)
        console.log(`   └─ StatusText: ${response.statusText}`)

        if (!response.ok) {
            let errorMessage: string
            let errorType: "validation" | "unknown" | "timeout" | "aborted" | "config_error" | "terminal_error" = "unknown"

            try {
                const errorData = (await response.json()) as APIErrorResponse
                console.error(`❌ [${requestId}] API Error Response:`, JSON.stringify(errorData, null, 2))
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)

                // Check for specific error types
                if (
                    errorMessage.toLowerCase().includes("terminal not found") ||
                    errorMessage.toLowerCase().includes("reader not found")
                ) {
                    errorType = "terminal_error"
                } else if (
                    errorMessage.toLowerCase().includes("stripe configuration") ||
                    errorMessage.toLowerCase().includes("resort not found") ||
                    response.status === 401 ||
                    response.status === 403
                ) {
                    errorType = "config_error"
                } else if (response.status >= 400 && response.status < 500) {
                    errorType = "validation"
                }
            } catch (parseError) {
                console.error(`❌ [${requestId}] Failed to parse error response:`, parseError)
                errorMessage = `${response.status} ${response.statusText}`

                if (response.status === 401 || response.status === 403) {
                    errorType = "config_error"
                }
            }

            console.log("═══════════════════════════════════════════════════════════════")
            console.log(`❌ [CREATE-TERMINAL-PAYMENT] FAILED - Request ID: ${requestId}`)
            console.log(`   ├─ Error Type: ${errorType}`)
            console.log(`   └─ Error Message: ${errorMessage}`)
            console.log("═══════════════════════════════════════════════════════════════")

            return {
                success: false,
                error: errorMessage,
                errorType,
            }
        }

        const responseData = (await response.json()) as {
            success: true
            invoiceId: string
            paymentIntentId: string
            clientSecret: string
            terminalId: string
            totalAmount: number
            currency: string
            orderId: number
        }

        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`✅ [CREATE-TERMINAL-PAYMENT] SUCCESS - Request ID: ${requestId}`)
        console.log("═══════════════════════════════════════════════════════════════")
        console.log("🆔 IDs Summary (IMPORTANT - Track these!):")
        console.log(`   ├─ Invoice ID: ${responseData.invoiceId}`)
        console.log(`   ├─ PaymentIntent ID: ${responseData.paymentIntentId}`)
        console.log(`   ├─ Terminal ID: ${responseData.terminalId}`)
        console.log(`   └─ Order ID: ${responseData.orderId}`)
        console.log("💰 Payment Details:")
        console.log(`   ├─ Total Amount: ${responseData.totalAmount} (${(responseData.totalAmount / 100).toFixed(2)} ${responseData.currency?.toUpperCase()})`)
        console.log(`   └─ Currency: ${responseData.currency}`)
        console.log(`🔑 Client Secret (first 20 chars): ${responseData.clientSecret?.substring(0, 20)}...`)
        console.log("═══════════════════════════════════════════════════════════════")

        return responseData
    } catch (error) {
        console.error(`❌ [${requestId}] Exception during createTerminalPayment:`, error)

        // Handle validation errors
        if (error instanceof z.ZodError) {
            console.log(`   └─ Validation Errors:`, error.errors)
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

