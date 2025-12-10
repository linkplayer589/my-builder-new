"use server"

import { revalidateTag } from "next/cache"
import { unstable_cache } from "@/lib/unstable-cache"
import type { CardReadersResponse } from "./types"
import posthog from "posthog-js"

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

/**
 * Revalidates the card readers cache to force fresh API fetch
 * Call this before refreshing to ensure cache bypass
 */
export async function revalidateCardReadersCache() {
  revalidateTag("card-readers", "default")
}

export type GetCardReadersError = {
    success: false
    error: string
    errorType: "unknown" | "timeout" | "aborted" | "validation" | "api_key_invalid"
}

export async function getCardReaders(
    resortId: number,
    signal?: AbortSignal
): Promise<CardReadersResponse | GetCardReadersError> {
    return await unstable_cache(
        async () => {
            console.log("[API] Fetching card readers for resort:", resortId)

            // Log the start of card reader fetching process
            if (typeof window !== 'undefined' && posthog) {
                posthog.capture('card_readers_fetch_started', {
                    resort_id: resortId,
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
                    posthog.capture('card_readers_configuration_error', {
                        resort_id: resortId,
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
                const url = new URL(`${HONO_API_URL}/api/cash-desk/card-readers/${resortId}`)
                console.log("Calling API endpoint:", url.toString())

                const options: RequestInit = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": HONO_API_KEY,
                    },
                    signal: signal
                        ? AbortSignal.any([signal, timeoutController.signal])
                        : timeoutController.signal,
                }

                const response = await fetch(url, options)
                console.log("Response status:", response.status, response.statusText)

                if (!response.ok) {
                    let errorMessage: string
                    let errorType: "unknown" | "api_key_invalid" | "validation" = "unknown"

                    try {
                        const errorData = await response.json() as { message?: string; error?: string }
                        console.error("API Error Response:", errorData)
                        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)

                        // Check if this is an API key validation error
                        if (errorMessage.toLowerCase().includes("invalid api key") ||
                            errorMessage.toLowerCase().includes("api key") ||
                            response.status === 401 || response.status === 403) {
                            errorType = "api_key_invalid"
                        } else if (response.status >= 400 && response.status < 500) {
                            errorType = "validation"
                        }
                    } catch (parseError) {
                        console.error("Failed to parse error response:", parseError)
                        errorMessage = `${response.status} ${response.statusText}`

                        // Still check for auth-related status codes
                        if (response.status === 401 || response.status === 403) {
                            errorType = "api_key_invalid"
                        }
                    }

                    // Log API key validation errors specifically for monitoring
                    if (typeof window !== 'undefined' && posthog) {
                        if (errorType === "api_key_invalid") {
                            posthog.capture('card_readers_api_key_invalid', {
                                resort_id: resortId,
                                error_message: errorMessage,
                                status_code: response.status,
                                api_endpoint: url.toString(),
                                timestamp: new Date().toISOString(),
                                severity: 'high' // High severity for API key issues
                            })
                        } else {
                            posthog.capture('card_readers_api_error', {
                                resort_id: resortId,
                                error_message: errorMessage,
                                error_type: errorType,
                                status_code: response.status,
                                api_endpoint: url.toString(),
                                timestamp: new Date().toISOString()
                            })
                        }
                    }

                    return {
                        success: false as const,
                        error: errorMessage,
                        errorType,
                    }
                }

                const data = await response.json() as CardReadersResponse

                // Log successful card reader fetching
                if (typeof window !== 'undefined' && posthog) {
                    posthog.capture('card_readers_fetch_success', {
                        resort_id: resortId,
                        card_readers_count: data.data?.length || 0,
                        has_metadata: !!data.metadata,
                        timestamp: new Date().toISOString()
                    })
                }

                return data
            } catch (error) {
                console.error("Error fetching card readers:", error)

                if (error instanceof Error && error.name === "AbortError") {
                    const errorType = timeoutController.signal.aborted ? ("timeout" as const) : ("aborted" as const)
                    const errorResult = {
                        success: false as const,
                        error: errorType === "timeout" ? "Request timed out after 30 seconds" : "Request was aborted",
                        errorType,
                    }

                    // Log timeout and abort errors
                    if (typeof window !== 'undefined' && posthog) {
                        posthog.capture('card_readers_request_interrupted', {
                            resort_id: resortId,
                            error_type: errorType,
                            error_message: errorResult.error,
                            timestamp: new Date().toISOString()
                        })
                    }

                    return errorResult
                }

                const errorResult = {
                    success: false as const,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                    errorType: "unknown" as const,
                }

                // Log unexpected errors
                if (typeof window !== 'undefined' && posthog) {
                    posthog.capture('card_readers_unexpected_error', {
                        resort_id: resortId,
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
        },
        [`card-readers-${resortId}`],
        {
            revalidate: 3600,
            tags: ["card-readers"],
        }
    )()
}