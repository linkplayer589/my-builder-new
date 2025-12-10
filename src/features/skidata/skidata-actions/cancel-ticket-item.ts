"use server"

import { z } from "zod"

const cancelTicketItemSchema = z.object({
  orderId: z.string(),
  orderItemId: z.string(),
  ticketItemIdList: z.array(z.string()).min(1),
  cancelationDate: z.string(),
  resortId: z.number().positive(),
  productId: z.string(),
  consumerCategoryId: z.string(),
})

export type CancelTicketItemPayload = z.infer<typeof cancelTicketItemSchema>

export async function skidataCancelTicketItemApi(payload: CancelTicketItemPayload): Promise<{ success: boolean; [key: string]: unknown }> {
  const HONO_API_URL = process.env.HONO_API_URL ?? process.env.NEXT_PUBLIC_HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? ""

  const parsed = cancelTicketItemSchema.parse(payload)

  const res = await fetch(`${HONO_API_URL}/api/skidata/cancel-ticket-item`, {
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



