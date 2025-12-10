"use server"

import type { TTestEndpointResponse, TApiResult } from "../resort-config-types/resort-config-types"

/**
 * Test endpoint types
 */
type TTestEndpoint = "kiosk" | "cash-desk" | "web"

/**
 * Endpoint URL mapping
 */
const ENDPOINT_MAP: Record<TTestEndpoint, string> = {
    "kiosk": "/api/kiosk/products",
    "cash-desk": "/api/cash-desk/products",
    "web": "/api/click-and-collect/products",
}

/**
 * Tests a specific endpoint to verify configuration
 *
 * @description
 * Calls the specified endpoint with bustCache=true to ensure fresh data.
 * This is used to verify that the configuration changes are reflected
 * correctly in the API responses.
 *
 * @param endpoint - The endpoint type to test
 * @param resortId - The ID of the resort to test
 * @param startDate - The start date for the test in YYYY-MM-DD format
 * @returns Promise resolving to the API result with test response
 *
 * @example
 * ```typescript
 * const result = await testEndpoint("kiosk", 1, "2025-01-15")
 * if (result.data?.catalogs) {
 *   console.log("Products returned:", result.data.catalogs.length)
 * }
 * ```
 */
export async function testEndpoint(
    endpoint: TTestEndpoint,
    resortId: number,
    startDate: string
): Promise<TApiResult<TTestEndpointResponse>> {
    console.log(`🧪 [API] Testing ${endpoint} endpoint...`, { resortId, startDate })

    try {
        const HONO_API_URL = process.env.HONO_API_URL ?? ""
        const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

        const endpointPath = ENDPOINT_MAP[endpoint]
        const url = new URL(`${HONO_API_URL}${endpointPath}`)
        url.searchParams.set("bustCache", "true")

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            },
            body: JSON.stringify({
                resortId,
                startDate
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { message?: string }
            console.error(`❌ [API] ${endpoint} test failed:`, response.status, errorData)
            return {
                data: null,
                error: errorData.message ?? `Failed to test ${endpoint}: ${response.status}`,
                status: response.status,
            }
        }

        const data = await response.json() as TTestEndpointResponse
        console.log(`✅ [API] ${endpoint} test completed`, {
            catalogCount: data.catalogs?.length ?? 0
        })

        return {
            data: {
                success: true,
                catalogs: data.catalogs ?? [],
            },
            error: null,
            status: response.status,
        }
    } catch (error) {
        console.error(`❌ [API] ${endpoint} test error:`, error)
        return {
            data: null,
            error: error instanceof Error ? error.message : `Failed to test ${endpoint}`,
            status: 500,
        }
    }
}

/**
 * Tests all endpoints simultaneously
 *
 * @description
 * Runs tests for kiosk, cash-desk, and web endpoints in parallel.
 *
 * @param resortId - The ID of the resort to test
 * @param startDate - The start date for the test in YYYY-MM-DD format
 * @returns Promise resolving to results for all three endpoints
 */
export async function testAllEndpoints(
    resortId: number,
    startDate: string
): Promise<{
    kiosk: TApiResult<TTestEndpointResponse>
    cashDesk: TApiResult<TTestEndpointResponse>
    web: TApiResult<TTestEndpointResponse>
}> {
    console.log("🧪 [API] Testing all endpoints...", { resortId, startDate })

    const [kiosk, cashDesk, web] = await Promise.all([
        testEndpoint("kiosk", resortId, startDate),
        testEndpoint("cash-desk", resortId, startDate),
        testEndpoint("web", resortId, startDate),
    ])

    return { kiosk, cashDesk, web }
}

