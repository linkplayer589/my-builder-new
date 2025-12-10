import { z } from "zod"

/**
 * Schema for Myth-only swap payload (HONO route: /api/cash-desk/swap-active-lifepass)
 */
export const swapPassSchema = z.object({
  orderId: z.number().int().positive(),
  resortId: z.number().int().positive(),
  oldPassId: z.string().min(1),
  newPassId: z.string().min(1),
})

export type TSwapPassInput = z.infer<typeof swapPassSchema>

