import { z } from "zod"

export const getSkidataOrderSchema = z.object({
    resortId: z.number(),
    skidataOrderId: z.string(),
    orderId: z.number(),
})

export type GetSkidataOrderSchemaType = z.infer<typeof getSkidataOrderSchema> 