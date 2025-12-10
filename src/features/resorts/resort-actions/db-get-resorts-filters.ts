"use server"

import { db } from "@/db"
import { resorts } from "@/db/schema"
import { asc, desc, count } from "drizzle-orm"
import { unstable_cache } from "@/lib/unstable-cache"
import type { ResortsSearchParamsType } from "@/lib/resorts-params"
import { filterColumns } from "@/lib/filter-columns"

// Define valid columns for sorting - only include actual schema columns
const VALID_COLUMNS = new Set<keyof typeof resorts._.columns>([
  'id',
  'name', 
  'config',
  'stripeSecretKey',
  'stripeWebhookSecret',
  'createdAt',
  'updatedAt'
])

export async function dbGetResorts(
  input: ResortsSearchParamsType
) {
  return await unstable_cache(
    async () => {
      console.log("[DB] Getting resorts...", { input })
      try {
        const offset = (input.page - 1) * input.perPage

        // Build advanced filter clause
        const advancedWhere = filterColumns({
          table: resorts,
          filters: input.filters,
          joinOperator: input.joinOperator,
        })

        // Apply only the advanced filter clause, without filtering by countryId
        const whereClause = advancedWhere

        // Create column mapping for type safety with explicit typing
        // Only include columns that actually exist in the resorts schema
        const columnMap = {
          id: resorts.id,
          name: resorts.name,
          config: resorts.config,
          stripeSecretKey: resorts.stripeSecretKey,
          stripeWebhookSecret: resorts.stripeWebhookSecret,
          createdAt: resorts.createdAt,
          updatedAt: resorts.updatedAt,
        } as const

        // Default ordering by name
        let orderBy = [asc(resorts.name)]
        if (input.sort.length > 0) {
          orderBy = input.sort.map((item) => {
            const columnKey = item.id
            if (!VALID_COLUMNS.has(columnKey)) {
              return asc(resorts.name)
            }

            const column = columnMap[columnKey]
            if (!column) return asc(resorts.name)
            return item.desc ? desc(column) : asc(column)
          })
        }

        // Execute paginated query and count in a transaction
        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(resorts)
            .where(whereClause)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset)

          const result = await tx
            .select({ count: count() })
            .from(resorts)
            .where(whereClause)
            .execute()

          const rawCount = result?.[0]?.count ?? 0

          return { data, total: Number(rawCount) }
        })
        console.log(data)

        // Calculate total pages
        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (err) {
        console.error("Error fetching resorts:", err)
        return { data: [] as typeof resorts.$inferSelect[], pageCount: 0 }
      }
    },
    // Cache key includes all relevant params
    [`resorts-${JSON.stringify(input)}`],
    {
      revalidate: 10000, // 10 seconds
      tags: ["resorts"],
    }
  )()
}
