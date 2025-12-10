// types.ts
import { z } from 'zod'
import { type Resort } from '@/db/schema'  // Your Drizzle schema type for Resort

// Zod schema for creating a resort with optional config and id
export const _createResortSchema = z.object({
  id: z.number().int().positive().optional(),  // Add ID as optional, assuming it can be auto-generated
  name: z.string().min(1, 'Resort name is required'),
  config: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
})

export type CreateResortSchemaType = z.infer<typeof _createResortSchema>
export type CreateResortReturnType = Resort
