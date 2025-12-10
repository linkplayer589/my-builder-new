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

export async function ordersTableSkidataCancelTicketItemApi(payload: CancelTicketItemPayload): Promise<{ success: boolean; [key: string]: unknown }> {
  const HONO_API_URL = process.env.HONO_API_URL ?? process.env.NEXT_PUBLIC_HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? ""

  const parsed = cancelTicketItemSchema.parse(payload)
  console.log("[SkidataCancelTicket] Request:", JSON.stringify(parsed, null, 2))

  const res = await fetch(`${HONO_API_URL}/api/skidata/cancel-ticket-item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": HONO_API_KEY,
    },
    body: JSON.stringify(parsed),
    cache: "no-store",
  })

  try {
    const data = (await res.json()) as { success: boolean; [key: string]: unknown }
    console.log("[SkidataCancelTicket] Response:", JSON.stringify({ status: res.status, ok: res.ok, data }, null, 2))
    return data
  } catch {
    const text = await res.text().catch(() => "")
    console.error("[SkidataCancelTicket] Non-JSON response:", text)
    throw new Error(text || "Failed to cancel ticket")
  }
}


