"use server"

import { z } from "zod"

const cancelOrdersSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  resortId: z.number().positive(),
})

export type CancelOrdersPayload = z.infer<typeof cancelOrdersSchema>

export async function skidataCancelOrdersApi(payload: CancelOrdersPayload): Promise<{ success: boolean; [key: string]: unknown }> {
  const HONO_API_URL = process.env.HONO_API_URL ?? process.env.NEXT_PUBLIC_HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? ""

  const parsed = cancelOrdersSchema.parse(payload)

  const res = await fetch(`${HONO_API_URL}/api/skidata/cancel-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": HONO_API_KEY,
    },
    body: JSON.stringify(parsed),
    cache: "no-store",
  })

  const data = (await res.json()) as unknown as { success: boolean; [key: string]: unknown }
  return data
}



