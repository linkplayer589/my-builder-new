"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getOrderById(orderId: number) {
    try {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        })

        return order
    } catch (error) {
        console.error("Error fetching order:", error)
        throw new Error("Failed to fetch order")
    }
} 