"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

import { getSkidataOrderSchema, type GetSkidataOrderSchemaType as _GetSkidataOrderSchemaType } from "./schema"
import { type SkidataOrderResponse } from "./types"

export async function getSkidataOrder(
    resortId: number,
    skidataOrderId: string,
    orderId: number
): Promise<SkidataOrderResponse> {
    try {
        console.log("[getSkidataOrder] Starting with:", { resortId, skidataOrderId, orderId })

        const { userId } = await auth()
        if (!userId) {
            console.error("[getSkidataOrder] No user found")
            throw new Error("Unauthorized")
        }

        const validatedData = getSkidataOrderSchema.parse({ resortId, skidataOrderId, orderId })
        console.log("[getSkidataOrder] Validated data:", validatedData)

        const response = await fetch(`${process.env.HONO_API_URL}/api/skidata/get-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.HONO_API_KEY ?? "",
            },
            body: JSON.stringify(validatedData),
        })

        if (!response.ok) {
            console.error("[getSkidataOrder] API response not OK:", response.status, response.statusText)
            throw new Error("Failed to fetch Skidata order")
        }

        const data = (await response.json()) as unknown
        console.log("[getSkidataOrder] Raw API response:", data)

        if (!Array.isArray(data)) {
            console.error("[getSkidataOrder] Invalid response format (expected array)")
            throw new Error("Invalid response format")
        }

        return data as SkidataOrderResponse
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("[getSkidataOrder] Validation error:", error.errors)
            throw new Error(`Validation error: ${error.message}`)
        }

        console.error("[getSkidataOrder] Error:", error)
        throw error
    }
}