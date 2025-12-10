"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"

/**
 * Toggle the wasError status of an order
 *
 * @param orderId - The ID of the order to toggle error status
 * @returns Success status and new wasError value
 */
export async function ordersTableToggleErrorAction(orderId: number): Promise<{
  success: boolean
  message: string
  wasError?: boolean
}> {
  try {
    // Get current order
    const [order] = await db
      .select({ wasError: orders.wasError })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Toggle the wasError value
    const newWasErrorValue = !order.wasError

    await db
      .update(orders)
      .set({
        wasError: newWasErrorValue,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Revalidate the orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: newWasErrorValue
        ? "Order marked as having an error"
        : "Order error cleared",
      wasError: newWasErrorValue,
    }
  } catch (error) {
    console.error("Error toggling order error status:", error)
    return {
      success: false,
      message: "Failed to toggle error status",
    }
  }
}

