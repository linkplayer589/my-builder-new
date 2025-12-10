import { z } from "zod"

/**
 * Schema for get Skidata order payload validation
 */
export const getSkidataOrderSchema = z.object({
    resortId: z.number().int().positive(),
    skidataOrderId: z.string().min(1),
})

export type TGetSkidataOrderInput = z.infer<typeof getSkidataOrderSchema>

