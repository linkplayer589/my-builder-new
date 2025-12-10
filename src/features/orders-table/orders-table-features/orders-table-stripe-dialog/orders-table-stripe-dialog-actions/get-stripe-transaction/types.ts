import { type StripeTransactionDetails } from "@/types/stripe-types"

export interface GetStripeTransactionResponse {
    success: boolean
    orderId: number
    orderStatus: string
    stripePaymentIntentId: string
    stripeTransactionData: StripeTransactionDetails
    updatedAt: string
}

export interface GetStripeTransactionRequest {
    orderId: number
} 