"use server"

import { revalidateTag } from "next/cache"
import { unstable_cache } from "@/lib/unstable-cache"

export type CardReader = {
  id: string
  label: string
  status: string
}

export type CardReadersResponse = {
  success: boolean
  data: CardReader[]
}

type APIErrorResponse = {
  message?: string
  error?: string
  [key: string]: unknown
}

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

/**
 * Revalidates the card readers cache to force fresh API fetch
 * Call this before refreshing to ensure cache bypass
 */
export async function revalidateCardReadersCache() {
  revalidateTag("card-readers", "default")
}

export const getCardReaders = unstable_cache(
  async (
    resortId: number,
    signal?: AbortSignal
  ): Promise<
    | { success: true; data: CardReader[] }
    | {
        success: false
        error: string
        errorType: "validation" | "unknown" | "timeout" | "aborted"
      }
  > => {
    console.log("[API]Fetching card readers for resort:", resortId)
    const HONO_API_URL = process.env.HONO_API_URL ?? ""
    const HONO_API_KEY = process.env.HONO_API_KEY

    if (!HONO_API_URL || !HONO_API_KEY) {
      return {
        success: false,
        error: "API URL or API KEY is not set",
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
        `${HONO_API_URL}/api/cash-desk/card-readers/${resortId}`
      )
      console.log("Calling API endpoint:", url.toString())

      const options: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HONO_API_KEY,
        },
        // Combine both the passed signal and timeout signal
        signal: signal
          ? AbortSignal.any([signal, timeoutController.signal])
          : timeoutController.signal,
      }

      const response = await fetch(url, options)
      console.log("Response status:", response.status, response.statusText)

      if (!response.ok) {
        let errorMessage: string
        try {
          const errorData = (await response.json()) as APIErrorResponse
          console.error("API Error Response:", errorData)
          errorMessage =
            errorData.message || errorData.error || JSON.stringify(errorData)
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorMessage = `${response.status} ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      const data = (await response.json()) as CardReadersResponse
      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Error fetching card readers:", error)

      // Handle abort errors
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: timeoutController.signal.aborted
            ? "Request timed out after 30 seconds"
            : "Request was aborted",
          errorType: timeoutController.signal.aborted ? "timeout" : "aborted",
        }
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        errorType: "unknown",
      }
    } finally {
      clearTimeout(timeoutId)
    }
  },
  ["card-readers"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["card-readers"],
  }
)
