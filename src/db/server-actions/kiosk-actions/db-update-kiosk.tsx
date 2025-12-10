"use server"

import { db } from "@/db"
import { kiosks, NewKioskSchema, type NewKiosk } from "@/db/schema"
import { revalidateTag } from "next/cache"
import { eq } from "drizzle-orm"

export async function updateKioskHandler(data: NewKiosk) {
    try {
        // Ensure the location is serialized into a string if it's an object
        const serializedLocation = typeof data.location === "object"
            ? JSON.stringify(data.location)
            : data.location

        // Validate the incoming data using Zod
        const validatedData = NewKioskSchema.parse({
            ...data,
            location: serializedLocation, // Pass the serialized location
        })

        // Update the kiosk in the database by matching the id
        await db.update(kiosks)
            .set({
                name: validatedData.name,
                type: validatedData.type,
                kioskContentIds: validatedData.kioskContentIds.map((s) => Number(String(s).trim())),
                location: validatedData.location,
                resortId: validatedData.resortId,
            })
            .where(eq(kiosks.id, validatedData.id))

        revalidateTag("kiosks", "max") // Revalidate the cache for kiosks

        // Return the updated data
        return validatedData
    } catch (error) {
        console.error("Error updating kiosk:", error)
        throw new Error("Failed to update kiosk")
    }
}
