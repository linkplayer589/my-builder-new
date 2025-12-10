"use server"

import { revalidateTag } from "next/cache"

/**
 * Revalidate products cache
 * Called when products data needs to be refreshed
 */
export async function revalidateProducts() {
  console.log("🔄 [API] Revalidating products cache...")
  revalidateTag("products", "max")
}

