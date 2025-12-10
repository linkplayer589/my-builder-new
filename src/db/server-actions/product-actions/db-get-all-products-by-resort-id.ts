"use server"

import { db } from "@/db"
import { products, type Product } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from "@/lib/unstable-cache"

export async function dbGetAllProductsByResortId(
    resortId: number
): Promise<Product[]> {
    return await unstable_cache(
        async () => {
            console.log("[DB] Getting all products by resort ID...", { resortId })
            try {
                const results = await db
                    .select()
                    .from(products)
                    .where(eq(products.resortId, resortId))
                return results
            } catch (error) {
                console.error('Error fetching products:', error)
                return []
            }
        },
        [`products-${resortId}`],
        {
            revalidate: 3600,
            tags: ["products"],
        }
    )()
}

