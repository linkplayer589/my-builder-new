import { z } from "zod"

export const calculateOrderPriceSchema = z.object({
    resortId: z.number(),
    startDate: z.string(),
    products: z.array(
        z.object({
            productId: z.string(),
            consumerCategoryId: z.string(),
            insurance: z.boolean().optional(),
        })
    ),
})
export type CalculateOrderPriceSchemaType = z.infer<
    typeof calculateOrderPriceSchema
>

export interface CalculatedPrice {
    basePrice: PriceDetails
    bestPrice: PriceDetails
    success: boolean
}

export interface PriceDetails {
    amountNet: number
    amountGross: number
    currencyCode: string
    taxDetails: TaxDetails
    calculateFromPreviousAmount: boolean
    netPrice: boolean
}

export interface TaxDetails {
    name: string
    taxValue: number
    taxAmount: number
    taxShortName: string
    sortOrder: number
}

export type CalculatedOrderPriceReturn = {
    startDate: string
    daysValidity: number
    cumulatedPrice: CalculatedPrice
    orderItemPrices: OrderItemPrice[]
}

export type OrderItemPrice = {
    productId: string
    consumerCategoryId: string
    productPrice?: CalculatedPrice
    insurancePrice?: CalculatedPrice
    lifepassRentalPrice?: CalculatedPrice
    success: boolean
}

export type CalculateOrderPricePayload = {
    startDate: string
    name: string
    telephone: string
    languageCode: string
    resortId: number
    devices: {
        deviceId: string
        productId: string
        consumerCategoryId: string
        insurance: boolean
    }[]
}