"use server"

import { db } from "@/db"
import { kiosks } from "@/db/schema"
import { asc, desc, and, eq, count, type AnyColumn } from "drizzle-orm"
import { unstable_cache } from "@/lib/unstable-cache"
import type { KioskSearchParamsType } from "@/lib/kiosks-params"
import { filterColumns } from "@/lib/filter-columns"

// Define valid columns for sorting
const VALID_COLUMNS = new Set<keyof typeof kiosks>(Object.keys(kiosks) as (keyof typeof kiosks)[])

export async function dbGetKiosks(
  input: KioskSearchParamsType & { resortId: number }
) {
  return await unstable_cache(
    async () => {
      console.log("[DB] Getting kiosks...", { input })
      try {
        const offset = (input.page - 1) * input.perPage

        // Build advanced filter clause
        const advancedWhere = filterColumns({
          table: kiosks,
          filters: input.filters,
          joinOperator: input.joinOperator,
        })

        // Always filter by resortId plus any advanced filters
        const whereClause = input.filters.length
          ? and(eq(kiosks.resortId, input.resortId), advancedWhere)
          : eq(kiosks.resortId, input.resortId)

        // Default ordering by name
        let orderBy = [asc(kiosks.name)]
        if (input.sort.length > 0) {
          orderBy = input.sort.map((item) => {
            if (!VALID_COLUMNS.has(item.id as keyof typeof kiosks)) {
              return asc(kiosks.name)
            }
            const column = kiosks[item.id as keyof typeof kiosks] as AnyColumn
            if (!column) return asc(kiosks.name)
            return item.desc ? desc(column) : asc(column)
          })
        }

        // Execute paginated query and count in a transaction
        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(kiosks)
            .where(whereClause)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset)

          const result = await tx
            .select({ count: count() })
            .from(kiosks)
            .where(whereClause)
            .execute()

          const rawCount = result?.[0]?.count ?? 0

          return { data, total: Number(rawCount) }
        })

        // Calculate total pages
        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (err) {
        console.error("Error fetching kiosks:", err)
        return { data: [] as typeof kiosks.$inferSelect[], pageCount: 0 }
      }
    },
    // Cache key includes all relevant params
    [`kiosks-${input.resortId}-${JSON.stringify(input)}`],
    {
      revalidate: 10000, // 10 seconds
      tags: ["kiosks"],
    }
  )()
}
