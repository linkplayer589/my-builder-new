"use server"

import { db } from "@/db"
import { devices, type Device } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Fetch a single device by its 6-digit device code (luhn number)
 */
export async function dbGetDeviceByCode(deviceCode: string): Promise<Device | null> {
  try {
    const rows = await db.select().from(devices).where(eq(devices.luhn, deviceCode)).limit(1)
    return (rows?.[0] as Device) ?? null
  } catch (error) {
    console.error("Failed to fetch device by code:", { deviceCode, error })
    return null
  }
}


