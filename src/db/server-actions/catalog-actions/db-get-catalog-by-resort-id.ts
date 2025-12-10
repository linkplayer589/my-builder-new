"use server"

import { db } from "@/db"
import { catalogs, type Catalog } from "@/db/schema"
import { and, asc, count, desc, eq, sql, type AnyColumn } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import type { SearchParamsType } from "@/lib/search-params"
import { unstable_cache } from "@/lib/unstable-cache"

// Valid columns for sorting and filtering (columns in catalogs schema)
const VALID_COLUMNS = new Set(Object.keys(catalogs)) // Get column names from the catalogs schema

// Map sort columns for catalogs (similar to products)
const mapSortColumns = (item: { id: string; desc: boolean }) => {
  if (!VALID_COLUMNS.has(item.id)) return desc(catalogs.createdAt)

  // Handle sorting for JSON columns (e.g., productsData)
  if (item.id === "productsData")
    return item.desc
      ? desc(sql.raw(`"${item.id}"->>'price'`)) // Assuming you want to sort by price or another attribute
      : asc(sql.raw(`"${item.id}"->>'price'`))

  // Default sorting logic for other columns
  const columnMap: Record<string, AnyColumn> = {
    id: catalogs.id,
    resortId: catalogs.resortId,
    version: catalogs.version,
    createdAt: catalogs.createdAt,
    updatedAt: catalogs.updatedAt,
  }

  const column = columnMap[item.id] as AnyColumn
  return item.desc ? desc(column) : asc(column)
}

// Main function to get catalogs with pagination, filtering, and sorting
export async function dbGetCatalogs(
  input: SearchParamsType & { resortId: number }
): Promise<{ data: Catalog[]; pageCount: number }> {
  return await unstable_cache(
    async () => {
      console.log("[DB] Getting catalogs for resort ID...", { input })

      try {
        const offset = (input.page - 1) * input.perPage

        // Validate and process filters
        const advancedWhere = filterColumns({
          table: catalogs,
          filters: (input.filters ?? []).map((f) => ({
            ...f,
            id: f.id.replace("catalogs_", "") as keyof typeof catalogs,
          })),
          joinOperator: input.joinOperator ?? "and",
        })

        const where = input.filters?.length
          ? and(eq(catalogs.resortId, input.resortId), advancedWhere)
          : eq(catalogs.resortId, input.resortId)

        // Sorting logic
        let orderBy = [desc(catalogs.createdAt)] // Default sorting by creation date
        if (input.sort.length > 0) {
          try {
            orderBy = input.sort.map(mapSortColumns)
          } catch (error) {
            orderBy = [desc(catalogs.createdAt)] // Fallback to default sorting
          }
        }

        // Fetch data from the database with pagination
        const { data, total } = await db.transaction(async (tx) => {
          const query = tx
            .select()
            .from(catalogs)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy)

          const data = await query

          const total = await tx
            .select({ count: count() })
            .from(catalogs)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (error) {
        console.error("Error fetching catalogs:", error)
        return { data: [], pageCount: 0 }
      }
    },
    [
      `catalogs-${input.resortId}-${JSON.stringify({
        page: input.page,
        perPage: input.perPage,
        filters: input.filters,
        sort: input.sort,
      })}`,
    ],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["catalogs"],
    }
  )()
}
