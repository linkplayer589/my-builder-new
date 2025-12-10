import { z } from "zod"

/**
 * Address schema for customer billing information
 */
export const customerAddressSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    postal_code: z.string().optional(),
    state: z.string().optional(),
})
export type TCustomerAddress = z.infer<typeof customerAddressSchema>

/**
 * Device/product item for terminal payment
 */
export const terminalPaymentDeviceSchema = z.object({
    productId: z.string(),
    consumerCategoryId: z.string(),
    insurance: z.boolean(),
})
export type TTerminalPaymentDevice = z.infer<typeof terminalPaymentDeviceSchema>

/**
 * Localized text structure for product names/descriptions
 */
export const localizedTextSchema = z.object({
    en: z.string().optional(),
    it: z.string().optional(),
    de: z.string().optional(),
    fr: z.string().optional(),
}).passthrough() // Allow additional language codes
export type TLocalizedText = z.infer<typeof localizedTextSchema>

/**
 * Consumer category data for price categories
 */
export const consumerCategoryDataSchema = z.object({
    name: localizedTextSchema.optional(),
    id: z.string().optional(),
    ageMin: z.number().optional(),
    ageMax: z.number().optional(),
}).passthrough()
export type TConsumerCategoryData = z.infer<typeof consumerCategoryDataSchema>

/**
 * Price category for selected products
 */
export const priceCategorySchema = z.object({
    consumerCategoryId: z.string(),
    consumerCategoryData: consumerCategoryDataSchema.optional(),
}).passthrough()
export type TPriceCategory = z.infer<typeof priceCategorySchema>

/**
 * Selected product details for invoice line items
 * Matches the product catalog structure for accurate invoice descriptions
 */
export const selectedProductSchema = z.object({
    id: z.string(),
    name: localizedTextSchema.optional(),
    description: localizedTextSchema.optional(),
    priceCategories: z.array(priceCategorySchema).optional(),
    validityCategory: z.object({
        id: z.string().optional(),
        unit: localizedTextSchema.optional(),
        value: z.number().optional(),
    }).optional(),
}).passthrough() // Allow additional fields from catalog
export type TSelectedProduct = z.infer<typeof selectedProductSchema>

/**
 * Request payload for create-terminal-payment endpoint
 */
export const createTerminalPaymentSchema = z.object({
    // Required fields
    terminalId: z.string().min(1, "Terminal ID is required"),
    resortId: z.number(),
    orderId: z.number(),
    startDate: z.string(), // ISO date string (yyyy-mm-dd)
    telephone: z.string().min(1, "Telephone is required"),
    name: z.string().min(1, "Name is required"),

    // Required: Either 'devices' or 'products' array
    devices: z.array(terminalPaymentDeviceSchema).min(1, "At least one device is required"),

    // Optional fields
    email: z.string().email().optional(),
    languageCode: z.string().default("en"),
    selectedProducts: z.array(selectedProductSchema).optional(),
    address: customerAddressSchema.optional(),
})
export type TCreateTerminalPaymentRequest = z.infer<typeof createTerminalPaymentSchema>

/**
 * Successful response from create-terminal-payment endpoint
 */
export type TCreateTerminalPaymentResponse = {
    success: true
    invoiceId: string
    paymentIntentId: string
    clientSecret: string
    terminalId: string
    totalAmount: number
    currency: string
    orderId: number
}

/**
 * Error response from create-terminal-payment endpoint
 */
export type TCreateTerminalPaymentErrorResponse = {
    success: false
    error: string
    errorType: "validation" | "unknown" | "timeout" | "aborted" | "config_error" | "terminal_error"
}

/**
 * Combined response type for create-terminal-payment
 */
export type TCreateTerminalPaymentResult =
    | TCreateTerminalPaymentResponse
    | TCreateTerminalPaymentErrorResponse

