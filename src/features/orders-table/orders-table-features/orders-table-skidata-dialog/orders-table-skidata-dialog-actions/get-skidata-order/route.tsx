"use server"

import { z } from "zod"

import { getSkidataOrderSchema, type GetSkidataOrderSchemaType as _GetSkidataOrderSchemaType } from "./schema"
import { type SkidataOrderResponse } from "./types"

export async function getSkidataOrder(
  resortId: number,
  skidataOrderId: string,
  orderId: number
): Promise<SkidataOrderResponse> {
  console.log("🔍 [API] Fetching SkiData order...", {
    resortId,
    skidataOrderId,
    orderId,
  })
  const HONO_API_URL = process.env.HONO_API_URL ?? ""
  const HONO_API_KEY = process.env.HONO_API_KEY ?? ""

  try {
    const payload = { resortId, skidataOrderId, orderId }
    getSkidataOrderSchema.parse(payload)

    const response = await fetch(`${HONO_API_URL}/api/skidata/get-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": HONO_API_KEY,
      } as const,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error("Failed to fetch Skidata order", response)
      throw new Error("Failed to fetch Skidata order")
    }

    const data = (await response.json()) as unknown
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format")
    }

    return data as SkidataOrderResponse
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`)
    }
    throw error
  }
}
