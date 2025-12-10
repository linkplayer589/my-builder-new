import { z } from "zod"

/**
 * Minimal cancel schema (HONO: /api/cash-desk/cancel-skipass)
 * Cancels ticket(s) for the old pass on an existing Skidata order
 */
export const cancelSkipassSchema = z.object({
  orderId: z.number().int().positive(), // Accept string or numeric order id
  deviceId: z.number().int().positive(), // Old device code (6-digit)
})

export type TCancelSkipassInput = z.infer<typeof cancelSkipassSchema>


