"use server"

import { db } from "@/db"
import { consumerCategories, type ConsumerCategory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from "@/lib/unstable-cache"

export async function dbGetAllConsumerCategoriesByResortId(
    resortId: number
): Promise<ConsumerCategory[]> {

    return await unstable_cache(
        async () => {
            try {
                console.log("[DB] Getting all consumer categories by resort ID...", { resortId })
                const results = await db
                    .select()
                    .from(consumerCategories)
                    .where(eq(consumerCategories.resortId, resortId))
                return results
            } catch (error) {
                console.error('Error fetching consumer categories:', error)
                return []
            }
        },
        [`consumer-categories-${resortId}`],
        {
            revalidate: 3600,
            tags: ["consumer-categories"],
        }
    )()
}