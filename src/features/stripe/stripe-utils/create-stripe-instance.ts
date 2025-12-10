import Stripe from "stripe"

export function createStripeInstance(secretKey: string) {
    return new Stripe(secretKey, {
        apiVersion: "2025-02-24.acacia",
        typescript: true,
    })
}