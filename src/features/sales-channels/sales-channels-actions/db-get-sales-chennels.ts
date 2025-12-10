"use server"

import { db } from "@/db"
import { salesChannels, type SalesChannel } from "@/db/schema"
import { and, asc, count, desc, eq, sql } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import { unstable_cache } from "@/lib/unstable-cache"

// Valid columns for sorting and filtering (columns in salesChannels schema)
const VALID_COLUMNS = new Set(Object.keys(salesChannels)) // Get column names from schema

// Allowed filter columns (matching the columns in the schema)
const _VALID_FILTER_COLUMNS = [
  "id",
  "resortId",
  "name",
  "type",
  "activeProductIds",
  "activeConsumerCategoryIds",
  "lifepassPrice",
  "insurancePrice",
  "depotTickets",
  "createdAt",
  "updatedAt",
] as const

// Helper function for sorting
const mapSortColumns = (item: { id: string; desc: boolean }) => {
  if (!VALID_COLUMNS.has(item.id)) return desc(salesChannels.createdAt)

  // Sorting logic for JSON columns (e.g., lifepassPrice, insurancePrice)
  if (item.id === "lifepassPrice" || item.id === "insurancePrice") {
    return item.desc
      ? desc(sql.raw(`"${item.id}"->>'price'`)) // Example: sort by price in the JSON column
      : asc(sql.raw(`"${item.id}"->>'price'`))
  }

  // Default sorting logic for other columns
  const columnMap = {
    id: salesChannels.id,
    resortId: salesChannels.resortId,
    name: salesChannels.name,
    type: salesChannels.type,
    activeProductIds: salesChannels.activeProductIds,
    activeConsumerCategoryIds: salesChannels.activeConsumerCategoryIds,
    depotTickets: salesChannels.depotTickets,
    createdAt: salesChannels.createdAt,
    updatedAt: salesChannels.updatedAt,
  } as const

  const column = columnMap[item.id as keyof typeof columnMap]
  if (!column) return item.desc ? desc(salesChannels.createdAt) : asc(salesChannels.createdAt)
  return item.desc ? desc(column) : asc(column)
}

// Type definition for sales channel filters
interface SalesChannelFilter {
  value: string | string[];
  type: "number" | "boolean" | "date" | "select" | "text" | "multi-select";
  operator: "iLike" | "notILike" | "eq" | "neq" | "empty" | "notEmpty" | "lt" | "lte" | "gt" | "gte" | "between" | "contains" | "notContains";
  rowId: string;
  id: keyof typeof salesChannels;
}

// Main function to get sales channels with pagination, filtering, and sorting
export async function dbGetSalesChannels(input: {
  resortId: number
  filters: SalesChannelFilter[] // Filters for sales channels (e.g., by name, type)
  sort: { id: string; desc: boolean }[] // Sorting configuration
  page: number
  perPage: number
  joinOperator?: "and" | "or" // Optional joinOperator for filterColumns
}): Promise<{ data: SalesChannel[]; pageCount: number }> {
  return await unstable_cache(
    async () => {
      console.log("[DB] Getting sales channels...", { input })

      try {
        const offset = (input.page - 1) * input.perPage

        // Validate and process filters
        const processedFilters: SalesChannelFilter[] = (input.filters ?? []).map((f) => ({
          ...f,
          id: f.id.replace(
            "sales_channels_",
            ""
          ) as keyof typeof salesChannels,
        }))
        
        const advancedWhere = filterColumns({
          table: salesChannels,
          filters: processedFilters,
          joinOperator: input.joinOperator ?? "and",
        })

        const where = input.filters?.length
          ? and(eq(salesChannels.resortId, input.resortId), advancedWhere)
          : eq(salesChannels.resortId, input.resortId)

        // Sorting logic
        let orderBy = [desc(salesChannels.createdAt)] // Default sorting by creation date
        if (input.sort.length > 0) {
          try {
            orderBy = input.sort.map(mapSortColumns)
          } catch (err) {
            orderBy = [desc(salesChannels.createdAt)] // Fallback to default sorting
          }
        }

        // Fetch data from the database with pagination
        const { data, total } = await db.transaction(async (tx) => {
          const query = tx
            .select()
            .from(salesChannels)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy)

          const data = await query

          const total = await tx
            .select({ count: count() })
            .from(salesChannels)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (error) {
        console.error("Error fetching sales channels:", error)
        return { data: [], pageCount: 0 }
      }
    },
    [
      `sales-channels-${input.resortId}-${JSON.stringify({
        page: input.page,
        perPage: input.perPage,
        filters: input.filters,
        sort: input.sort,
      })}`,
    ],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["sales-channels"],
    }
  )()
}
