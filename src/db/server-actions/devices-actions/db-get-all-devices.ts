"use server"

import { db } from "@/db"
import { devices, type Device } from "@/db/schema"

export async function dbGetAllDevices() {
    console.log("[DB] Fetching All Devices...")
    try {
        const allDevices = await db.select().from(devices)
        console.log(`Fetched ${allDevices.length} devices`)
        return allDevices as Device[]
    } catch (error) {
        console.error("Failed to fetch devices:", error)
        return []
    }
} 