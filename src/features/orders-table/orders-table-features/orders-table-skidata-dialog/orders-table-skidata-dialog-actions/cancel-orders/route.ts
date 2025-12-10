"use server"

import { z } from "zod"

const cancelOrdersSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  resortId: z.number().positive(),
})

export type CancelOrdersPayload = z.infer<typeof cancelOrdersSchema>

export async function ordersTableSkidataCancelOrdersApi(payload: CancelOrdersPayload): Promise<{ success: boolean; [key: string]: unknown }> {
  const HONO_API_URL = process.env.HONO_API_URL ?? process.env.NEXT_PUBLIC_HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? ""

  const parsed = cancelOrdersSchema.parse(payload)
  console.log("[SkidataCancelOrders] Request:", JSON.stringify(parsed, null, 2))

  const res = await fetch(`${HONO_API_URL}/api/skidata/cancel-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": HONO_API_KEY,
    },
    body: JSON.stringify(parsed),
    cache: "no-store",
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    const text = await res.text().catch(() => "")
    console.error("[SkidataCancelOrders] Non-JSON response:", text)
    throw new Error(text || "Failed to cancel orders")
  }

  // Handle array response from Hono API
  // The API returns an array with objects containing { success: boolean, orderId, ... }
  if (Array.isArray(data) && data.length > 0) {
    const firstResult = data[0] as { success?: boolean; orderId?: string; [key: string]: unknown }
    const success = firstResult?.success === true && res.ok
    console.log("[SkidataCancelOrders] Response:", JSON.stringify({ status: res.status, ok: res.ok, success, dataLength: data.length }, null, 2))
    return { success, data, orderId: firstResult?.orderId }
  }

  // Fallback to single object response
  const singleData = data as { success: boolean; [key: string]: unknown }
  const success = singleData?.success === true && res.ok
  console.log("[SkidataCancelOrders] Response:", JSON.stringify({ status: res.status, ok: res.ok, success, data: singleData }, null, 2))
  const { success: _, ...rest } = singleData
  return { success, ...rest }
}


