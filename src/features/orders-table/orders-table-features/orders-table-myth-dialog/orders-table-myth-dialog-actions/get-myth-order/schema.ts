import * as z from "zod"

/**
 * Zod schema for validating getMythOrder request payload
 * 
 * @property orderId - The Myth order ID to fetch (must be a number)
 */
export const getMythOrderSchema = z.object({
  orderId: z.number().int().positive(),
})

/**
 * TypeScript type inferred from getMythOrderSchema
 */
export type GetMythOrderSchemaType = z.infer<typeof getMythOrderSchema>

