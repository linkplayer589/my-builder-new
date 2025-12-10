"use server"

import { db } from "@/db"
import { orders, type Order } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"

/**
 * Update an order by ID
 *
 * @param orderId - The ID of the order to update
 * @param data - Partial order data to update
 * @returns Updated order or null if not found
 */
export async function dbUpdateOrder(
  orderId: number,
  data: Partial<Omit<Order, "id" | "createdAt">>
): Promise<{
  success: boolean
  message: string
  order?: Order
}> {
  try {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning()

    if (!updatedOrder) {
      return {
        success: false,
        message: "Order not found",
      }
    }

    // Revalidate orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    }
  } catch (error) {
    console.error("Error updating order:", error)
    return {
      success: false,
      message: "Failed to update order",
    }
  }
}

/**
 * Update order notes
 *
 * @param orderId - The ID of the order
 * @param notes - The notes to set
 * @returns Success status
 */
export async function dbUpdateOrderNotes(
  orderId: number,
  notes: unknown[]
): Promise<{
  success: boolean
  message: string
}> {
  try {
    await db
      .update(orders)
      .set({
        notes: notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Revalidate orders cache
    revalidateTag("orders")

    return {
      success: true,
      message: "Notes updated successfully",
    }
  } catch (error) {
    console.error("Error updating order notes:", error)
    return {
      success: false,
      message: "Failed to update notes",
    }
  }
}

/**
 * Toggle test order status
 *
 * @param orderId - The ID of the order
 * @returns Success status and new testOrder value
 */
export async function dbToggleTestOrder(orderId: number): Promise<{
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
      .set({
        testOrder: newTestOrderValue,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Revalidate orders cache
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

