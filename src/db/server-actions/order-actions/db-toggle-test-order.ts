"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getErrorMessage } from "@/lib/handle-error"

/**
 * Input type for toggling test order status
 */
type TToggleTestOrderInput = {
    id: number
    testOrder: boolean
}

/**
 * Response type for toggle test order action
 */
type TToggleTestOrderResponse = {
    data: typeof orders.$inferSelect | null
    error: string | null
}

/**
 * Toggles the test order flag for an order
 *
 * @param input - Object containing order ID and new test order status
 * @returns Object with updated order data or error message
 *
 * @description
 * Updates the testOrder boolean field for a specific order in the database.
 * Revalidates the orders cache after successful update.
 * Used to mark orders as test orders for filtering and reporting purposes.
 */
export async function dbToggleTestOrder(
    input: TToggleTestOrderInput
): Promise<TToggleTestOrderResponse> {
    console.log("[DB] Toggling test order...", { input })
    unstable_noStore()

    try {
        const updatedOrder = await db
            .update(orders)
            .set({
                testOrder: input.testOrder,
            })
            .where(eq(orders.id, input.id))
            .returning()

        if (!updatedOrder.length || !updatedOrder[0]) {
            throw new Error('Order not found')
        }

        console.log("Updated order:", updatedOrder)

        // Revalidate after successful update
        revalidateTag("orders", "max")

        return {
            data: updatedOrder[0],
            error: null,
        }
    } catch (err) {
        console.error('Error toggling test order:', err)
        return {
            data: null,
            error: getErrorMessage(err),
        }
    }
}

