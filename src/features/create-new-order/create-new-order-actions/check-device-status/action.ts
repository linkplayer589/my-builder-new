"use server"
import { z } from "zod"

import { type DeviceStatusResponse } from "./types"

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

const deviceStatusSchema = z.object({
    deviceId: z.string(),
})

export async function checkDeviceStatus(
    deviceId: string,
    signal?: AbortSignal
): Promise<
    | { success: true; data: DeviceStatusResponse }
    | { success: false; error: Error; errorType: "unknown" | "timeout" | "aborted" }
    | { success: false; error: z.ZodError; errorType: "validation" }
> {
    console.log("📋 [API] Checking device status...", {
        deviceId: deviceId,
    })
    const HONO_API_URL = process.env.HONO_API_URL
    const HONO_API_KEY = process.env.HONO_API_KEY

    if (!HONO_API_URL || !HONO_API_KEY) {
        return {
            success: false,
            error: new Error("API URL or API KEY is not set"),
            errorType: "unknown",
        }
    }

    try {
        // Validate input
        const validatedData = deviceStatusSchema.parse({ deviceId })

        // Create a timeout abort controller
        const timeoutController = new AbortController()
        const timeoutId = setTimeout(() => {
            timeoutController.abort()
        }, TIMEOUT_DURATION)

        try {
            const response = await fetch(
                `${HONO_API_URL}/api/cash-desk/device-status`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": HONO_API_KEY,
                    },
                    body: JSON.stringify({ deviceId: validatedData.deviceId }),
                    signal: signal
                        ? AbortSignal.any([signal, timeoutController.signal])
                        : timeoutController.signal,
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = (await response.json()) as DeviceStatusResponse
            return { success: true, data }
        } finally {
            clearTimeout(timeoutId)
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error, errorType: "validation" }
        }

        if (error instanceof Error) {
            if (error.name === "AbortError") {
                return {
                    success: false,
                    error: new Error("Request timed out after 30 seconds"),
                    errorType: "timeout",
                }
            }
            return { success: false, error, errorType: "unknown" }
        }

        return {
            success: false,
            error: new Error("An unknown error occurred"),
            errorType: "unknown",
        }
    }
} 