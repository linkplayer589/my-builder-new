"use server"

import { revalidateTag } from "next/cache"

/**
 * Revalidate orders cache
 *
 * @description
 * Invalidates the "orders" cache tag, forcing Next.js to refetch
 * fresh data on the next request.
 */
export async function revalidateOrders() {
    console.log("🔄 [API] Revalidating orders cache...")
    revalidateTag("orders", "max")
}