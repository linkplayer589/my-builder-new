"use server"

import { type GetStripeTransactionResponse } from "./types"
import { getStripeTransactionRequestSchema } from "./schema"

export async function getStripeTransaction(
    orderId: number
): Promise<GetStripeTransactionResponse> {
    try {
        // Validate the request
        const validatedRequest = getStripeTransactionRequestSchema.parse({
            orderId,
        })

        const response = await fetch(
            `${process.env.HONO_API_URL}/api/cash-desk/get-stripe-transaction-data`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.HONO_API_KEY ?? "",
                },
                body: JSON.stringify(validatedRequest),
            }
        )

        if (!response.ok) {
            throw new Error("Failed to fetch Stripe transaction data")
        }

        const rawData = (await response.json()) as unknown as Omit<GetStripeTransactionResponse, 'success'>

        // Return data with explicit success flag
        return {
            ...rawData,
            success: true,
        }
    } catch (error) {
        console.error("Error fetching Stripe transaction:", error)
        throw error
    }
}