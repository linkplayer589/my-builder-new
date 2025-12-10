import { db } from "@/db"
import { resorts } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function dbGetResortByName(name: string) {
    try {
        const resort = await db.query.resorts.findFirst({
            where: eq(resorts.name, name),
        })
        return resort
    } catch (error) {
        console.error("Error getting resort by name:", error)
        throw error
    }
} 