"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { type StripeTransactionDetails, type StripeInvoiceData } from "@/types/stripe-types"

const stripeRefetchTransactionDataSchema = z.object({
    orderId: z.number(),
})

interface ApiResponse {
    success: boolean
    orderId: number
    orderStatus: string
    stripeInvoiceId?: string
    stripeInvoiceDatas?: StripeInvoiceData[]
    stripePaymentIntentIds: string[]
    stripeTransactionDatas: StripeTransactionDetails[]
    totalTransactionDatas: number
    updatedAt: string
}

export async function stripeRefetchTransactionData(orderId: number) {
    try {
        console.log("[stripeRefetchTransactionData] Starting with orderId:", orderId)

        const { userId } = await auth()
        if (!userId) {
            console.error("[stripeRefetchTransactionData] No user found")
            return {
                success: false,
                message: "Unauthorized",
            }
        }

        const validatedData = stripeRefetchTransactionDataSchema.parse({ orderId })
        console.log("[stripeRefetchTransactionData] Validated data:", validatedData)

        const response = await fetch(
            `${process.env.HONO_API_URL}/api/cash-desk/get-stripe-transaction-data`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.HONO_API_KEY ?? "",
                },
                body: JSON.stringify(validatedData),
            }
        )

        if (!response.ok) {
            console.error("[stripeRefetchTransactionData] API response not OK:", response.status, response.statusText)
            throw new Error("Failed to fetch Stripe transaction data")
        }

        const data = (await response.json()) as ApiResponse
        console.log("[stripeRefetchTransactionData] Raw API response:", data)

        // Validate the response structure
        if (!Array.isArray(data?.stripePaymentIntentIds) || !Array.isArray(data?.stripeTransactionDatas)) {
            console.error("[stripeRefetchTransactionData] Invalid response structure:", {
                hasPaymentIntentIds: Array.isArray(data?.stripePaymentIntentIds),
                hasTransactionDatas: Array.isArray(data?.stripeTransactionDatas),
                paymentIntentIdsLength: data?.stripePaymentIntentIds?.length,
                transactionDatasLength: data?.stripeTransactionDatas?.length,
            })
            throw new Error("Invalid response structure from API")
        }

        return {
            success: true,
            message: "Transaction details found",
            stripeInvoiceId: data.stripeInvoiceId,
            stripeInvoiceDatas: data.stripeInvoiceDatas || [],
            stripePaymentIntentIds: data.stripePaymentIntentIds,
            stripeTransactionDatas: data.stripeTransactionDatas,
            updatedAt: data.updatedAt,
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("[stripeRefetchTransactionData] Validation error:", error.errors)
            return {
                success: false,
                message: "Invalid input data",
            }
        }

        console.error("[stripeRefetchTransactionData] Error:", error)
        return {
            success: false,
            message: "Failed to fetch transaction details",
        }
    }
}