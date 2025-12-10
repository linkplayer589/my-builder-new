"use server"

import { z } from "zod"

const cancelOrdersSchema = z.object({
    orderIds: z.array(z.string()).min(1, "At least one order ID is required"),
    resortId: z.number().positive("Resort ID must be positive")
})

type _CancelOrdersSchemaType = z.infer<typeof cancelOrdersSchema>

interface CancellationDetails {
    originalOrderId: string
    cancelationOrderId: string
    cancelationSystemDate: string
    executionId: string
}

interface OrderResponse {
    orderId: string
    success: boolean
    cancellationDetails: CancellationDetails
    orderDetails: Record<string, unknown>
}

export async function cancelSkidataOrder(params: {
    resortId: number
    skidataOrderId: string
}): Promise<{
    data: OrderResponse[] | null
    error: string | null
}> {
    console.log("🔴 [API] Cancelling SkiData order...", { resortId: params.resortId, orderId: params.skidataOrderId })
    try {
        const HONO_API_URL = process.env.HONO_API_URL ?? ""
        const HONO_API_KEY = process.env.HONO_API_KEY

        const url = new URL(`${HONO_API_URL}/api/skidata/cancel-orders`)

        const payload = cancelOrdersSchema.parse({
            resortId: params.resortId,
            orderIds: [params.skidataOrderId],
        })

        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            } as HeadersInit,
            body: JSON.stringify(payload),
        }

        const response = await fetch(url, options)

        if (!response.ok) {
            const error = await response.json() as { message?: string }
            return {
                data: null,
                error: error.message ?? "Failed to cancel order"
            }
        }

        const data = await response.json() as OrderResponse[]

        console.log(data)
        return { data, error: null }
    } catch (error) {
        console.error("Error canceling order:", error)
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error: error.errors[0]?.message ?? "Invalid input data"
            }
        }
        return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to cancel order"
        }
    }
} 