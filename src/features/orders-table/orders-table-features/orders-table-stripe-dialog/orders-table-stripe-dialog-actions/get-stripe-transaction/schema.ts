import { z } from "zod"

export const getStripeTransactionRequestSchema = z.object({
    orderId: z.number(),
})

export const getStripeTransactionResponseSchema = z.object({
    success: z.boolean(),
    orderId: z.number(),
    orderStatus: z.string(),
    stripePaymentIntentId: z.string(),
    stripeTransactionData: z.any(),
    updatedAt: z.string(),
}) 