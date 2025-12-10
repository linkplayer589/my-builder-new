import { z } from "zod"

/**
 * Schema for return lifepass payload validation
 */
export const returnLifepassSchema = z.object({
  deviceIdsArray: z.array(z.string().min(1)),
})

export type TReturnLifepassInput = z.infer<typeof returnLifepassSchema>

