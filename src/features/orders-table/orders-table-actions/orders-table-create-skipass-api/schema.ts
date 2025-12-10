import { z } from "zod"

/**
 * Schema for creating a new skipass on a device (HONO: /api/cash-desk/create-skipass)
 * Minimal payload for new Skidata order creation
 */
export const createSkipassSchema = z.object({
  orderId: z.number().int().positive(),
  oldPassId: z.string().min(1),
  newPassId: z.string().min(1),
})

export type TCreateSkipassInput = z.infer<typeof createSkipassSchema>


