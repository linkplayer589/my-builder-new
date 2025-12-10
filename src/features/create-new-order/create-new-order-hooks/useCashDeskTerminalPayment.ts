import { useCallback, useRef, useState } from "react"

import { createTerminalPayment } from "../create-new-order-actions/create-terminal-payment/handler"
import type { TCreateTerminalPaymentRequest } from "../create-new-order-actions/create-terminal-payment/types"
import { checkPaymentStatus } from "../create-new-order-actions/check-payment-status/handler"
import { isApiError, type TPaymentStatus } from "../create-new-order-actions/check-payment-status/types"
import { retryTerminalPayment } from "../create-new-order-actions/retry-terminal-payment/handler"

/**
 * Payment flow status states
 */
export type TTerminalPaymentStatus =
    | "idle"
    | "creating"
    | "processing"
    | "polling"
    | "succeeded"
    | "failed"
    | "timeout"
    | "canceled"

/**
 * Terminal payment state interface
 */
export interface TTerminalPaymentState {
    status: TTerminalPaymentStatus
    invoiceId?: string
    paymentIntentId?: string
    clientSecret?: string
    totalAmount?: number
    currency?: string
    error?: string
    errorType?: string
    pollAttempts?: number
    maxPollAttempts?: number
    /** Unique session ID for tracking this payment flow */
    sessionId?: string
    /** Order ID associated with this payment */
    orderId?: number
    /** Terminal ID used for this payment */
    terminalId?: string
}

/**
 * Default polling configuration
 */
const DEFAULT_MAX_POLL_ATTEMPTS = 60 // 60 attempts
const DEFAULT_POLL_INTERVAL_MS = 2000 // 2 seconds between polls (2 minutes total)

/**
 * Generate a unique session ID for tracking the entire payment flow
 */
function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Log IDs summary for debugging
 */
function logIdsSummary(
    sessionId: string,
    context: string,
    ids: {
        orderId?: number
        invoiceId?: string
        paymentIntentId?: string
        terminalId?: string
    }
) {
    console.log(`🔗 [${sessionId}] ${context} - IDs Summary:`)
    console.log(`   ├─ Order ID: ${ids.orderId ?? "(not set)"}`)
    console.log(`   ├─ Invoice ID: ${ids.invoiceId ?? "(not set)"}`)
    console.log(`   ├─ PaymentIntent ID: ${ids.paymentIntentId ?? "(not set)"}`)
    console.log(`   └─ Terminal ID: ${ids.terminalId ?? "(not set)"}`)
}

/**
 * Custom hook for managing cash desk terminal payment flow.
 *
 * Handles the complete payment flow:
 * 1. Create terminal payment (Invoice + PaymentIntent)
 * 2. Poll for payment completion
 * 3. Retry payment if needed
 *
 * @returns Object with state and payment management functions
 */
export function useCashDeskTerminalPayment() {
    const [state, setState] = useState<TTerminalPaymentState>({ status: "idle" })
    const abortControllerRef = useRef<AbortController | null>(null)
    const isPollingRef = useRef(false)
    const sessionIdRef = useRef<string>(generateSessionId())

    /**
     * Reset the payment state to idle
     */
    const reset = useCallback(() => {
        const oldSessionId = sessionIdRef.current
        const newSessionId = generateSessionId()
        sessionIdRef.current = newSessionId

        console.log("═══════════════════════════════════════════════════════════════")
        console.log("🔄 [HOOK] Payment state RESET")
        console.log(`   ├─ Old Session ID: ${oldSessionId}`)
        console.log(`   └─ New Session ID: ${newSessionId}`)
        console.log("═══════════════════════════════════════════════════════════════")

        // Abort any ongoing requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        isPollingRef.current = false
        setState({ status: "idle", sessionId: newSessionId })
    }, [])

    /**
     * Step 1: Create terminal payment (Invoice + PaymentIntent)
     * Creates the payment on the Stripe terminal and returns the clientSecret
     */
    const createPayment = useCallback(async (
        params: Omit<TCreateTerminalPaymentRequest, "devices"> & {
            devices: Array<{
                productId: string
                consumerCategoryId: string
                insurance: boolean
            }>
        }
    ): Promise<{
        success: boolean
        invoiceId?: string
        paymentIntentId?: string
        clientSecret?: string
        totalAmount?: number
        currency?: string
        error?: string
    }> => {
        const sessionId = sessionIdRef.current

        console.log("═══════════════════════════════════════════════════════════════")
        console.log("💳 [HOOK] Step 1: CREATE TERMINAL PAYMENT")
        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`📋 Session ID: ${sessionId}`)
        console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
        console.log("📦 Input Parameters to Hook:")
        console.log(`   ├─ Terminal ID: ${params.terminalId}`)
        console.log(`   ├─ Resort ID: ${params.resortId}`)
        console.log(`   ├─ Order ID: ${params.orderId}`)
        console.log(`   ├─ Start Date: ${params.startDate}`)
        console.log(`   ├─ Customer: ${params.name}`)
        console.log(`   └─ Devices: ${params.devices?.length || 0}`)

        logIdsSummary(sessionId, "BEFORE createPayment", {
            orderId: params.orderId,
            terminalId: params.terminalId,
        })

        // Cancel any existing requests
        if (abortControllerRef.current) {
            console.log(`⚠️ [${sessionId}] Aborting previous request`)
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        setState({
            status: "creating",
            sessionId,
            orderId: params.orderId,
            terminalId: params.terminalId,
        })

        try {
            console.log(`🌐 [${sessionId}] Calling createTerminalPayment API...`)

            const result = await createTerminalPayment(
                params as TCreateTerminalPaymentRequest
            )

            if (!result.success) {
                console.error(`❌ [${sessionId}] createTerminalPayment FAILED:`, result.error)
                setState({
                    status: "failed",
                    error: result.error,
                    errorType: result.errorType,
                    sessionId,
                    orderId: params.orderId,
                    terminalId: params.terminalId,
                })
                return { success: false, error: result.error }
            }

            console.log("═══════════════════════════════════════════════════════════════")
            console.log(`✅ [${sessionId}] createTerminalPayment SUCCESS`)
            console.log("═══════════════════════════════════════════════════════════════")
            logIdsSummary(sessionId, "AFTER createPayment SUCCESS", {
                orderId: result.orderId,
                invoiceId: result.invoiceId,
                paymentIntentId: result.paymentIntentId,
                terminalId: result.terminalId,
            })
            console.log("💰 Payment Details:")
            console.log(`   ├─ Total Amount: ${result.totalAmount} cents (${(result.totalAmount / 100).toFixed(2)} ${result.currency?.toUpperCase()})`)
            console.log(`   └─ Currency: ${result.currency}`)
            console.log("═══════════════════════════════════════════════════════════════")

            setState({
                status: "processing",
                invoiceId: result.invoiceId,
                paymentIntentId: result.paymentIntentId,
                clientSecret: result.clientSecret,
                totalAmount: result.totalAmount,
                currency: result.currency,
                sessionId,
                orderId: result.orderId,
                terminalId: result.terminalId,
            })

            return {
                success: true,
                invoiceId: result.invoiceId,
                paymentIntentId: result.paymentIntentId,
                clientSecret: result.clientSecret,
                totalAmount: result.totalAmount,
                currency: result.currency,
            }
        } catch (error) {
            console.error(`❌ [${sessionId}] Exception in createPayment:`, error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
            setState({
                status: "failed",
                error: errorMessage,
                sessionId,
                orderId: params.orderId,
                terminalId: params.terminalId,
            })
            return { success: false, error: errorMessage }
        }
    }, [])

    /**
     * Step 2: Poll for payment completion
     * Continuously checks the payment status until success, failure, or timeout
     */
    const pollPaymentStatus = useCallback(async (
        resortId: number,
        invoiceId: string,
        maxAttempts: number = DEFAULT_MAX_POLL_ATTEMPTS,
        intervalMs: number = DEFAULT_POLL_INTERVAL_MS
    ): Promise<{
        success: boolean
        status: TPaymentStatus | "timeout"
        error?: string
    }> => {
        const sessionId = sessionIdRef.current

        console.log("═══════════════════════════════════════════════════════════════")
        console.log("🔄 [HOOK] Step 2: POLL PAYMENT STATUS")
        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`📋 Session ID: ${sessionId}`)
        console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
        console.log("📦 Polling Parameters:")
        console.log(`   ├─ Resort ID: ${resortId}`)
        console.log(`   ├─ Invoice ID: ${invoiceId}`)
        console.log(`   ├─ Max Attempts: ${maxAttempts}`)
        console.log(`   ├─ Interval: ${intervalMs}ms`)
        console.log(`   └─ Total Max Wait: ${(maxAttempts * intervalMs / 1000 / 60).toFixed(1)} minutes`)

        logIdsSummary(sessionId, "BEFORE polling", {
            invoiceId,
            orderId: state.orderId,
            paymentIntentId: state.paymentIntentId,
            terminalId: state.terminalId,
        })

        // Prevent concurrent polling
        if (isPollingRef.current) {
            console.warn(`⚠️ [${sessionId}] Polling already in progress - rejecting`)
            return { success: false, status: "processing", error: "Polling already in progress" }
        }

        isPollingRef.current = true
        setState((prev) => ({
            ...prev,
            status: "polling",
            pollAttempts: 0,
            maxPollAttempts: maxAttempts,
        }))

        console.log(`🔄 [${sessionId}] Starting polling loop...`)

        try {
            // Initial check
            console.log(`🔍 [${sessionId}] Initial status check...`)
            const initialResult = await checkPaymentStatus({ resortId, invoiceId })

            // Check if it's an API error (not payment status)
            if (!isApiError(initialResult) && initialResult.status === "succeeded") {
                console.log("═══════════════════════════════════════════════════════════════")
                console.log(`✅ [${sessionId}] Payment ALREADY SUCCEEDED (initial check)`)
                console.log("═══════════════════════════════════════════════════════════════")
                logIdsSummary(sessionId, "SUCCESS (initial)", {
                    invoiceId: initialResult.invoiceId,
                    orderId: initialResult.orderId ? Number(initialResult.orderId) : undefined,
                    paymentIntentId: initialResult.paymentIntentId,
                })
                setState((prev) => ({ ...prev, status: "succeeded" }))
                isPollingRef.current = false
                return { success: true, status: "succeeded" }
            }

            // Polling loop
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Wait for the interval
                await new Promise((resolve) => setTimeout(resolve, intervalMs))

                // Check if we've been aborted
                if (!isPollingRef.current) {
                    console.log(`🛑 [${sessionId}] Polling CANCELLED at attempt ${attempt + 1}`)
                    return { success: false, status: "canceled", error: "Polling was cancelled" }
                }

                // Update attempt count in state
                setState((prev) => ({
                    ...prev,
                    pollAttempts: attempt + 1,
                }))

                // Log every 5th attempt or first/last to reduce noise
                const shouldLogDetail = attempt === 0 || attempt === maxAttempts - 1 || (attempt + 1) % 5 === 0
                if (shouldLogDetail) {
                    console.log(`───────────────────────────────────────────────────────────────`)
                    console.log(`🔍 [${sessionId}] Poll attempt ${attempt + 1}/${maxAttempts}`)
                    console.log(`   ├─ Invoice ID being checked: ${invoiceId}`)
                    console.log(`   └─ Time elapsed: ${((attempt + 1) * intervalMs / 1000).toFixed(0)}s`)
                }

                try {
                    const result = await checkPaymentStatus({ resortId, invoiceId })

                    // Check if it's an API error (not payment status)
                    if (isApiError(result)) {
                        console.warn(`⚠️ [${sessionId}] Poll ${attempt + 1} - API error:`, result.error)
                        continue // Continue polling on transient API errors
                    }

                    // We have a valid payment status response
                    const { status } = result

                    // Success case - payment completed
                    if (status === "succeeded") {
                        console.log("═══════════════════════════════════════════════════════════════")
                        console.log(`✅ [${sessionId}] Payment SUCCEEDED at attempt ${attempt + 1}`)
                        console.log("═══════════════════════════════════════════════════════════════")
                        logIdsSummary(sessionId, "SUCCESS (polling)", {
                            invoiceId: result.invoiceId,
                            orderId: result.orderId ? Number(result.orderId) : undefined,
                            paymentIntentId: result.paymentIntentId,
                        })
                        console.log("💰 Payment Details:")
                        console.log(`   ├─ Amount Paid: ${result.amountPaid} cents`)
                        console.log(`   ├─ Currency: ${result.currency}`)
                        console.log(`   ├─ Payment Method: ${result.paymentMethodType}`)
                        console.log(`   └─ Paid At: ${result.paidAt}`)
                        console.log("═══════════════════════════════════════════════════════════════")

                        setState((prev) => ({ ...prev, status: "succeeded" }))
                        isPollingRef.current = false
                        return { success: true, status: "succeeded" }
                    }

                    // Failure cases - stop polling
                    if (status === "failed" || status === "canceled") {
                        console.log("═══════════════════════════════════════════════════════════════")
                        console.error(`❌ [${sessionId}] Payment ${status.toUpperCase()} at attempt ${attempt + 1}`)
                        console.log("═══════════════════════════════════════════════════════════════")
                        logIdsSummary(sessionId, `FAILED (${status})`, {
                            invoiceId: result.invoiceId,
                            orderId: result.orderId ? Number(result.orderId) : undefined,
                            paymentIntentId: result.paymentIntentId,
                        })
                        console.log(`   └─ Error: ${result.errorMessage || "No error message"}`)

                        setState((prev) => ({
                            ...prev,
                            status: "failed",
                            error: result.errorMessage || `Payment ${status}`,
                        }))
                        isPollingRef.current = false
                        return {
                            success: false,
                            status,
                            error: result.errorMessage || `Payment ${status}`,
                        }
                    }

                    // Still processing - only log occasionally
                    if (shouldLogDetail) {
                        console.log(`⏳ [${sessionId}] Status: ${status} - continuing to poll...`)
                    }
                } catch (pollError) {
                    console.error(`❌ [${sessionId}] Error during poll ${attempt + 1}:`, pollError)
                    // Continue polling on errors
                }
            }

            // Timeout
            console.log("═══════════════════════════════════════════════════════════════")
            console.error(`⏱️ [${sessionId}] Payment polling TIMED OUT after ${maxAttempts} attempts`)
            console.log("═══════════════════════════════════════════════════════════════")
            logIdsSummary(sessionId, "TIMEOUT", {
                invoiceId,
                orderId: state.orderId,
                paymentIntentId: state.paymentIntentId,
                terminalId: state.terminalId,
            })

            setState((prev) => ({
                ...prev,
                status: "timeout",
                error: "Payment verification timed out. Please check manually.",
            }))
            isPollingRef.current = false
            return {
                success: false,
                status: "timeout",
                error: "Payment verification timed out",
            }
        } catch (error) {
            console.error(`❌ [${sessionId}] Exception during polling:`, error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
            setState((prev) => ({
                ...prev,
                status: "failed",
                error: errorMessage,
            }))
            isPollingRef.current = false
            return { success: false, status: "failed", error: errorMessage }
        }
    }, [state.orderId, state.paymentIntentId, state.terminalId])

    /**
     * Step 3: Retry payment if needed
     * Re-initiates the terminal payment for a failed/timed out payment
     */
    const retryPayment = useCallback(async (params: {
        terminalId: string
        orderId: number
        invoiceId?: string
    }): Promise<{
        success: boolean
        paymentIntentId?: string
        clientSecret?: string
        error?: string
    }> => {
        const sessionId = sessionIdRef.current

        console.log("═══════════════════════════════════════════════════════════════")
        console.log("🔄 [HOOK] Step 3: RETRY TERMINAL PAYMENT")
        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`📋 Session ID: ${sessionId}`)
        console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
        console.log("📦 Retry Parameters:")
        console.log(`   ├─ Terminal ID: ${params.terminalId}`)
        console.log(`   ├─ Order ID: ${params.orderId}`)
        console.log(`   └─ Invoice ID: ${params.invoiceId || "(not provided)"}`)

        logIdsSummary(sessionId, "BEFORE retry", {
            orderId: params.orderId,
            invoiceId: params.invoiceId,
            terminalId: params.terminalId,
            paymentIntentId: state.paymentIntentId,
        })

        // Cancel any existing requests
        if (abortControllerRef.current) {
            console.log(`⚠️ [${sessionId}] Aborting previous request`)
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        setState((prev) => ({
            ...prev,
            status: "processing",
            error: undefined,
        }))

        try {
            console.log(`🌐 [${sessionId}] Calling retryTerminalPayment API...`)

            const result = await retryTerminalPayment({
                terminalId: params.terminalId,
                orderId: params.orderId,
                invoiceId: params.invoiceId,
            })

            if (!result.success) {
                console.error(`❌ [${sessionId}] retryTerminalPayment FAILED:`, result.error)

                // Check for "already paid" case
                if (result.errorType === "already_paid") {
                    console.log(`✅ [${sessionId}] Invoice already paid - treating as success`)
                    setState((prev) => ({ ...prev, status: "succeeded" }))
                    return { success: true }
                }

                setState((prev) => ({
                    ...prev,
                    status: "failed",
                    error: result.error,
                    errorType: result.errorType,
                }))
                return { success: false, error: result.error }
            }

            console.log("═══════════════════════════════════════════════════════════════")
            console.log(`✅ [${sessionId}] retryTerminalPayment SUCCESS`)
            console.log("═══════════════════════════════════════════════════════════════")
            logIdsSummary(sessionId, "AFTER retry SUCCESS", {
                orderId: params.orderId,
                invoiceId: result.invoiceId,
                paymentIntentId: result.paymentIntentId,
                terminalId: params.terminalId, // Use the input terminalId since response doesn't include it
            })

            setState((prev) => ({
                ...prev,
                status: "processing",
                paymentIntentId: result.paymentIntentId,
                clientSecret: result.clientSecret,
                invoiceId: result.invoiceId,
            }))

            return {
                success: true,
                paymentIntentId: result.paymentIntentId,
                clientSecret: result.clientSecret,
            }
        } catch (error) {
            console.error(`❌ [${sessionId}] Exception in retryPayment:`, error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
            setState((prev) => ({
                ...prev,
                status: "failed",
                error: errorMessage,
            }))
            return { success: false, error: errorMessage }
        }
    }, [state.paymentIntentId])

    /**
     * Cancel ongoing operations (polling, requests)
     */
    const cancel = useCallback(() => {
        const sessionId = sessionIdRef.current

        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`🛑 [${sessionId}] CANCELLING all operations`)
        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`   ├─ Was polling: ${isPollingRef.current}`)
        console.log(`   ├─ Current status: ${state.status}`)
        console.log(`   └─ Had active request: ${abortControllerRef.current !== null}`)

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        isPollingRef.current = false
        setState((prev) => ({
            ...prev,
            status: prev.status === "polling" ? "canceled" : prev.status,
        }))
    }, [state.status])

    /**
     * Check payment status once (manual check)
     */
    const checkStatus = useCallback(async (
        resortId: number,
        params: { invoiceId?: string; orderId?: number }
    ): Promise<{
        success: boolean
        status?: TPaymentStatus
        error?: string
    }> => {
        const sessionId = sessionIdRef.current

        console.log("───────────────────────────────────────────────────────────────")
        console.log(`🔍 [${sessionId}] MANUAL STATUS CHECK`)
        console.log("───────────────────────────────────────────────────────────────")
        console.log(`   ├─ Resort ID: ${resortId}`)
        console.log(`   ├─ Invoice ID: ${params.invoiceId || "(not provided)"}`)
        console.log(`   └─ Order ID: ${params.orderId || "(not provided)"}`)

        try {
            const result = await checkPaymentStatus({
                resortId,
                invoiceId: params.invoiceId,
                orderId: params.orderId,
            })

            // Check if it's an API error
            if (isApiError(result)) {
                console.error(`❌ [${sessionId}] Manual check FAILED:`, result.error)
                return { success: false, error: result.error }
            }

            // We have a valid payment status response
            const { status } = result

            console.log(`📊 [${sessionId}] Manual check result: ${status}`)
            logIdsSummary(sessionId, "Manual check", {
                invoiceId: result.invoiceId,
                orderId: result.orderId ? Number(result.orderId) : undefined,
                paymentIntentId: result.paymentIntentId,
            })

            // Update state based on status
            if (status === "succeeded") {
                setState((prev) => ({ ...prev, status: "succeeded" }))
            } else if (status === "failed" || status === "canceled") {
                setState((prev) => ({
                    ...prev,
                    status: "failed",
                    error: result.errorMessage || `Payment ${status}`,
                }))
            }

            return { success: true, status }
        } catch (error) {
            console.error(`❌ [${sessionId}] Exception in checkStatus:`, error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
            return { success: false, error: errorMessage }
        }
    }, [])

    return {
        state,
        createPayment,
        pollPaymentStatus,
        retryPayment,
        checkStatus,
        cancel,
        reset,
    }
}

