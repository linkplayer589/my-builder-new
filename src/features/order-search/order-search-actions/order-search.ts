"use server"

import { z } from "zod"
import { db } from "@/db"
import { type Order, orders } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"

const OrderSearchSchema = z.object({
    searchType: z.enum(["orderNumber", "deviceId", "phoneNumber"]),
    searchValue: z.string().min(1),
})

type OrderSearchType = z.infer<typeof OrderSearchSchema>

export async function orderSearch(data: OrderSearchType) {
    console.log("[DB] Searching order...", { searchType: data.searchType, searchValue: data.searchValue })
    try {
        const validatedData = OrderSearchSchema.parse(data)
        console.log(`[SearchOrder] Input validation passed`)

        // Set up timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        try {
            let result: Order[]
            switch (validatedData.searchType) {
                case "orderNumber":
                    console.log(`[SearchOrder] Searching by order ID: ${validatedData.searchValue}`)
                    result = await db.select().from(orders)
                        .where(eq(orders.id, parseInt(validatedData.searchValue)))
                        .orderBy(desc(orders.id))

                    break

                case "deviceId":
                    console.log(`[SearchOrder] Searching by lifepass ID: ${validatedData.searchValue}`)
                    result = await db.select().from(orders)
                        .where(sql`orders.myth_order_submission_data->>'devices' IS NOT NULL 
                            AND orders.myth_order_submission_data::json->>'devices' LIKE ${`%"deviceCode":"${validatedData.searchValue}"%`}`)
                        .orderBy(desc(orders.id))

                    break

                case "phoneNumber":
                    console.log(`[SearchOrder] Searching by phone: ${validatedData.searchValue}`)
                    result = await db.select().from(orders)
                        .where(sql`orders.client_details->>'mobile' LIKE ${`%${validatedData.searchValue}%`}`)
                        .orderBy(desc(orders.id))

                    break
                default: {
                    // This case should never be reached since we validate with zod schema
                    const exhaustiveCheck: never = validatedData.searchType
                    console.log(`[SearchOrder] Invalid search type: ${String(exhaustiveCheck)}`)
                    return {
                        success: false,
                        message: "Invalid search type",
                    }
                }
            }

            clearTimeout(timeoutId)

            if (result && result.length > 0) {
                return {
                    success: true,
                    message: `Found ${result.length} order(s)`,
                    data: result,
                }
            }

            console.log(`[SearchOrder] No orders found`)
            return {
                success: false,
                message: "No orders found",
            }
        } catch (dbError) {
            if (dbError instanceof Error && dbError.message === "Database query timeout") {
                console.log(`[SearchOrder] Database query timeout`)
                return {
                    success: false,
                    message: "The search took too long. Please try again."
                }
            }
            throw dbError
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`[SearchOrder] Validation error:`, error.errors)
            return {
                success: false,
                message: "Invalid search data",
            }
        }

        if (error instanceof Error) {
            console.error("[SearchOrder] Unexpected error:", error.message)
        } else {
            console.error("[SearchOrder] Unexpected error:", error)
        }

        return {
            success: false,
            message: "An error occurred while searching",
        }
    }
} 