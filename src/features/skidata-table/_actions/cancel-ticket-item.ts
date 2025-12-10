"use server"

import { z } from "zod"

const cancelTicketItemSchema = z.object({
    orderId: z.string(),
    orderItemId: z.string(),
    ticketItemIdList: z.array(z.string()),
    cancelationDate: z.string(),
    resortId: z.number(),
    productId: z.string(),
    consumerCategoryId: z.string()
})

type CancelTicketItemSchemaType = z.infer<typeof cancelTicketItemSchema>

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

export async function cancelTicketItem(params: CancelTicketItemSchemaType): Promise<{
    data: OrderResponse[] | null
    error: string | null
}> {
    console.log("🎫 [API] Cancelling ticket item...", { orderId: params.orderId, ticketItems: params.ticketItemIdList.length })
    try {
        const HONO_API_URL = process.env.HONO_API_URL ?? ""
        const HONO_API_KEY = process.env.HONO_API_KEY

        const url = new URL(`${HONO_API_URL}/api/skidata/cancel-ticket-item`)

        const payload = cancelTicketItemSchema.parse(params)

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
                error: error.message ?? "Failed to cancel ticket item"
            }
        }

        const data = await response.json() as OrderResponse[]
        return { data, error: null }
    } catch (error) {
        console.error("Error canceling ticket item:", error)
        if (error instanceof z.ZodError) {
            return {
                data: null,
                error: error.errors[0]?.message ?? "Invalid input data"
            }
        }
        return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to cancel ticket item"
        }
    }
} 