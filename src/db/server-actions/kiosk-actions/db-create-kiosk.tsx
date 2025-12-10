"use server"

import { db } from "@/db"
import { kiosks, NewKioskSchema, type NewKiosk } from "@/db/schema"
import { revalidateTag } from "next/cache"

export async function createKioskHandler(data: NewKiosk) {
    try {
        // Validate data using Zod schema
        const validatedData = NewKioskSchema.parse(data)

        // Insert the new kiosk into the database
        await db.insert(kiosks).values({
            id: validatedData.id,
            name: validatedData.name,
            type: validatedData.type,
            kioskContentIds: (validatedData.kioskContentIds ?? []).map((s) => Number(String(s).trim())),  // Convert content IDs to numbers
            location: validatedData.location,
            resortId: validatedData.resortId,
        })

        revalidateTag("kiosks", "max")  // Revalidate the cache for kiosks
        return validatedData
    } catch (error) {
        console.error("Error creating kiosk:", error)
        throw new Error("Failed to create kiosk")
    }
}
