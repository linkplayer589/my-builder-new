"use server"

import { z } from "zod"
import posthog from "posthog-js"
import { getProductsSchema, type GetProductsSchemaType } from "./schema"
import { type GetProductsAPIReturnType } from "./types"

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

type APIErrorResponse = {
    message?: string
    error?: string
    [key: string]: unknown
}

export async function getProducts(
    payload: GetProductsSchemaType,
    signal?: AbortSignal
): Promise<
    | { success: true; data: GetProductsAPIReturnType }
    | { success: false; error: string; errorType: "validation" | "unknown" | "timeout" | "aborted" | "api_key_invalid" | "sales_channel_not_found" }
> {
    console.log("🛍️ [API] Getting products...", { resortId: payload.resortId })

    // Log the start of product fetching process
    if (typeof window !== 'undefined' && posthog) {
        posthog.capture('products_fetch_started', {
            resort_id: payload.resortId,
            start_date: payload.startDate,
            timestamp: new Date().toISOString()
        })
    }

    const HONO_API_URL = process.env.HONO_API_URL ?? ""
    const HONO_API_KEY = process.env.HONO_API_KEY

    if (!HONO_API_URL || !HONO_API_KEY) {
        const error = {
            success: false as const,
            error: "API URL or API KEY is not set",
            errorType: "unknown" as const,
        }

        // Log configuration errors
        if (typeof window !== 'undefined' && posthog) {
            posthog.capture('products_configuration_error', {
                resort_id: payload.resortId,
                error: error.error,
                missing_url: !HONO_API_URL,
                missing_key: !HONO_API_KEY,
                timestamp: new Date().toISOString()
            })
        }

        return error
    }

    // Create a timeout abort controller
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => {
        timeoutController.abort()
    }, TIMEOUT_DURATION)

    try {
        // Validate the payload against the Zod schema
        const validatedPayload = getProductsSchema.parse(payload)
        console.log("Payload:", validatedPayload)

        const url = new URL(`${HONO_API_URL}/api/cash-desk/products`)
        console.log("Calling API endpoint:", url.toString())

        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            } as HeadersInit,
            body: JSON.stringify(validatedPayload),
            // Combine both the passed signal and timeout signal
            signal: signal
                ? AbortSignal.any([signal, timeoutController.signal])
                : timeoutController.signal,
        }

        // Send the request to the external API
        const apiResponse = await fetch(url, options)
        console.log("API Response Status:", apiResponse.status, apiResponse.statusText)

        if (!apiResponse.ok) {
            let errorMessage: string
            let errorType: "unknown" | "api_key_invalid" | "sales_channel_not_found" | "validation" = "unknown"

            try {
                const errorData = await apiResponse.json() as APIErrorResponse
                console.error("API Error Response:", errorData)
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)

                // Check for specific error types
                if (errorMessage.toLowerCase().includes("invalid api key") ||
                    errorMessage.toLowerCase().includes("api key") ||
                    apiResponse.status === 401 || apiResponse.status === 403) {
                    errorType = "api_key_invalid"
                } else if (errorMessage.toLowerCase().includes("sales channel has not been found") ||
                    errorMessage.toLowerCase().includes("sales channel not found") ||
                    errorMessage.toLowerCase().includes("sales channel")) {
                    errorType = "sales_channel_not_found"
                } else if (apiResponse.status >= 400 && apiResponse.status < 500) {
                    errorType = "validation"
                }
            } catch (parseError) {
                console.error("Failed to parse error response:", parseError)
                errorMessage = `${apiResponse.status} ${apiResponse.statusText}`

                // Still check for auth-related status codes
                if (apiResponse.status === 401 || apiResponse.status === 403) {
                    errorType = "api_key_invalid"
                } else if (apiResponse.status === 500) {
                    // 500 errors might be sales channel issues if we can't parse the response
                    errorType = "sales_channel_not_found"
                }
            }

            // Log specific error types for monitoring
            if (typeof window !== 'undefined' && posthog) {
                if (errorType === "api_key_invalid") {
                    posthog.capture('products_api_key_invalid', {
                        resort_id: payload.resortId,
                        error_message: errorMessage,
                        status_code: apiResponse.status,
                        api_endpoint: url.toString(),
                        timestamp: new Date().toISOString(),
                        severity: 'high'
                    })
                } else if (errorType === "sales_channel_not_found") {
                    posthog.capture('products_sales_channel_not_found', {
                        resort_id: payload.resortId,
                        error_message: errorMessage,
                        status_code: apiResponse.status,
                        api_endpoint: url.toString(),
                        start_date: payload.startDate,
                        timestamp: new Date().toISOString(),
                        severity: 'high' // High severity for configuration issues
                    })
                } else {
                    posthog.capture('products_api_error', {
                        resort_id: payload.resortId,
                        error_message: errorMessage,
                        error_type: errorType,
                        status_code: apiResponse.status,
                        api_endpoint: url.toString(),
                        timestamp: new Date().toISOString()
                    })
                }
            }

            return {
                success: false,
                error: `API request failed (${apiResponse.status}): ${errorMessage}`,
                errorType
            }
        }

        const responseData = await apiResponse.json() as GetProductsAPIReturnType

        // Log successful products fetching
        if (typeof window !== 'undefined' && posthog) {
            posthog.capture('products_fetch_success', {
                resort_id: payload.resortId,
                start_date: payload.startDate,
                catalogs_count: responseData.catalogs?.length || 0,
                products_count: responseData.catalogs?.reduce((total, catalog) => total + (catalog.products?.length || 0), 0) || 0,
                timestamp: new Date().toISOString()
            })
        }

        return { success: true, data: responseData }

    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            console.error("Validation error:", error.errors)

            // Log validation errors
            if (typeof window !== 'undefined' && posthog) {
                posthog.capture('products_validation_error', {
                    resort_id: payload.resortId,
                    error_details: error.errors,
                    timestamp: new Date().toISOString()
                })
            }

            return {
                success: false,
                error: JSON.stringify(error.errors),
                errorType: "validation",
            }
        }

        // Handle abort errors
        if (error instanceof Error && error.name === "AbortError") {
            const errorType = timeoutController.signal.aborted ? ("timeout" as const) : ("aborted" as const)
            const errorResult = {
                success: false as const,
                error: errorType === "timeout" ? "Request timed out after 30 seconds" : "Request was aborted",
                errorType,
            }

            // Log timeout and abort errors
            if (typeof window !== 'undefined' && posthog) {
                posthog.capture('products_request_interrupted', {
                    resort_id: payload.resortId,
                    error_type: errorType,
                    error_message: errorResult.error,
                    timestamp: new Date().toISOString()
                })
            }

            return errorResult
        }

        // For other errors, log and return error with more context
        console.error("Unexpected error during products fetch:", error)

        const errorResult = {
            success: false as const,
            error: error instanceof Error
                ? `${error.name}: ${error.message}`
                : "An unknown error occurred",
            errorType: "unknown" as const,
        }

        // Log unexpected errors
        if (typeof window !== 'undefined' && posthog) {
            posthog.capture('products_unexpected_error', {
                resort_id: payload.resortId,
                error_message: errorResult.error,
                error_name: error instanceof Error ? error.name : 'Unknown',
                timestamp: new Date().toISOString(),
                severity: 'medium'
            })
        }

        return errorResult
    } finally {
        clearTimeout(timeoutId)
    }
} 