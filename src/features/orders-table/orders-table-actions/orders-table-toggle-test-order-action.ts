"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"

/**
 * Toggle the testOrder status for an order
 *
 * @param orderId - The ID of the order to toggle
 * @returns Success status and new testOrder value
 */
export async function ordersTableToggleTestOrderAction(orderId: number): Promise<{
  success: boolean
  message: string
  testOrder?: boolean
}> {
  try {
    // Get current order
    const [order] = await db
      .select({ testOrder: orders.testOrder })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Toggle the testOrder value
    const newTestOrderValue = !order.testOrder

    await db
      .update(orders)
      .set({ testOrder: newTestOrderValue, updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    // Revalidate the orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: newTestOrderValue
        ? "Order marked as test order"
        : "Order marked as live order",
      testOrder: newTestOrderValue,
    }
  } catch (error) {
    console.error("Error toggling test order:", error)
    return {
      success: false,
      message: "Failed to toggle test order status",
    }
  }
}

