"use server"

import { z } from "zod"

const searchLifePassKioskSchema = z.object({
  lifepassDeviceId: z.string().min(1),
  resortId: z.number().positive(),
})

export type SearchLifePassKioskPayload = z.infer<
  typeof searchLifePassKioskSchema
>

export type LifePassKioskLocation = {
  kioskId: string
  kioskName: string
  slotNumber: number
  location: string
  status: "occupied" | "empty" | "fault"
  lastUpdated: string
}

export async function skidataSearchLifePassKioskApi(
  payload: SearchLifePassKioskPayload
): Promise<{
  success: boolean
  found: boolean
  location?: LifePassKioskLocation
  message?: string
}> {
  const HONO_API_URL =
    process.env.HONO_API_URL ?? process.env.NEXT_PUBLIC_HONO_API_URL ?? ""
  const HONO_API_KEY =
    process.env.HONO_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? ""

  const parsed = searchLifePassKioskSchema.parse(payload)

  const res = await fetch(`${HONO_API_URL}/api/kiosks/search-lifepass`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": HONO_API_KEY,
    },
    body: JSON.stringify(parsed),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to search kiosks: ${res.statusText}`)
  }

  const data = await res.json()
  return data
}
