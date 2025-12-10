import { type Order } from '@/db/schema'
import { z } from 'zod'

export const _cashDeskSubmitOrderSchema = z.object({
    orderId: z.number(),
    resortId: z.number(),
    telephone: z.string(),
    startDate: z.string(),
    name: z.string(),
    email: z.string().optional(),
    languageCode: z.string(),
    devices: z.array(
        z.object({
            deviceId: z.string(),
            productId: z.string(),
            consumerCategoryId: z.string(),
            insurance: z.boolean(),
        })
    ),
    /**
     * JSDoc: Allow resubmission of orders with different devices.
     * When true, bypasses device count validation and creates new Skidata/Myth orders.
     * Used for resubmitting cancelled orders or orders with different device configurations.
     */
    resubmit: z.boolean().optional().default(false),
    /**
     * JSDoc: Bypass payment processing for cash desk orders.
     * When true, sets paymentStatus to 'payment-bypassed' indicating payment was handled offline.
     * Used for cash desk transactions where payment is processed manually.
     */
    paymentBypassed: z.boolean().optional().default(false),
})
export type CashDeskSubmitOrderSchemaType = z.infer<typeof _cashDeskSubmitOrderSchema>

export type CashDeskSubmitOrderReturn = Order