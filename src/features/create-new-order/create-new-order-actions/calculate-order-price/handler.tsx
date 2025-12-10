"use server"

import type { ZodIssue } from "zod" // Ensure Zod is imported correctly

import type {
  CalculatedOrderPriceReturn,
  CalculateOrderPriceSchemaType,
} from "./types"

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

export async function calculateOrderPrice(
  orderData: CalculateOrderPriceSchemaType,
  signal?: AbortSignal
): Promise<
  | { success: true; data: CalculatedOrderPriceReturn }
  | {
      success: false
      error: Error
      errorType: "unknown" | "timeout" | "aborted"
    }
  | { success: false; error: ZodIssue[]; errorType: "validation" }
> {
  console.log("💰 [API] Calculating order price...", {
    resortId: orderData.resortId,
  })
  const startTime = performance.now()
  console.log("Starting price calculation at:", new Date().toISOString())
  console.log("Fetching Price For:", orderData)

  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY

  if (!HONO_API_URL || !HONO_API_KEY) {
    console.error("API configuration missing")
    return {
      success: false,
      error: new Error("API URL or API KEY is not set"),
      errorType: "unknown",
    }
  }

  // Create a timeout abort controller
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timeoutController.abort()
  }, TIMEOUT_DURATION)

  try {
    const url = new URL(
      `${HONO_API_URL}/api/click-and-collect/calculate-order-price`
    )
    console.log("Calling API endpoint:", url.toString())

    const fetchStartTime = performance.now()
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      },
      body: JSON.stringify(orderData),
      // Combine both the passed signal and timeout signal
      signal: signal
        ? AbortSignal.any([signal, timeoutController.signal])
        : timeoutController.signal,
    }

    const apiResponse = await fetch(url.toString(), options)
    const fetchEndTime = performance.now()
    console.log(
      `Fetch completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`
    )

    const jsonStartTime = performance.now()
    const responseData = (await apiResponse.json()) as
      | CalculatedOrderPriceReturn
      | ZodIssue[]
    const jsonEndTime = performance.now()
    console.log(
      `JSON parsing completed in ${(jsonEndTime - jsonStartTime).toFixed(2)}ms`
    )

    if (!apiResponse.ok) {
      console.error("Failed to calculate order price:", responseData)

      if (apiResponse.status === 400 && Array.isArray(responseData)) {
        return { success: false, error: responseData, errorType: "validation" }
      }

      const errorMessage = Array.isArray(responseData)
        ? "Validation errors occurred"
        : (responseData as { message?: string }).message ||
          apiResponse.statusText
      return {
        success: false,
        error: new Error(errorMessage),
        errorType: "unknown",
      }
    }

    const endTime = performance.now()
    console.log(`Total execution time: ${(endTime - startTime).toFixed(2)}ms`)
    return { success: true, data: responseData as CalculatedOrderPriceReturn }
  } catch (error) {
    const endTime = performance.now()
    console.error("Error calculating order price:", error)
    console.log(`Failed execution time: ${(endTime - startTime).toFixed(2)}ms`)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: new Error(
            timeoutController.signal.aborted
              ? "Request timed out after 30 seconds"
              : "Request was aborted"
          ),
          errorType: timeoutController.signal.aborted ? "timeout" : "aborted",
        }
      }
      return {
        success: false,
        error,
        errorType: "unknown",
      }
    }

    return {
      success: false,
      error: new Error("An unknown error occurred."),
      errorType: "unknown",
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
