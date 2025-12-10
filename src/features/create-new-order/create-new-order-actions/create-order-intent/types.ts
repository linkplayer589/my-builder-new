export type CreateOrderIntentSchemaType = {
    resortId: number
    startDate: string
    products: {
        deviceId: string
        productId: string
        consumerCategoryId: string
        insurance: boolean
    }[]
}

export type CreateOrderIntentResponse = {
    id: string
    status: string
    createdAt: string
    updatedAt: string
}
