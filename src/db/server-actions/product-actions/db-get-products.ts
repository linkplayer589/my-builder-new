"use server"

import { db } from "@/db"
import { products, type Product } from "@/db/schema"
import { and, asc, count, desc, eq, sql } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import type { SearchParamsType } from "@/lib/search-params"
import { unstable_cache } from "@/lib/unstable-cache"

// Type definition for product filters
interface ProductFilter {
  value: string | string[];
  type: "number" | "boolean" | "date" | "select" | "text" | "multi-select";
  operator: "iLike" | "notILike" | "eq" | "neq" | "empty" | "notEmpty" | "lt" | "lte" | "gt" | "gte" | "between" | "contains" | "notContains";
  rowId: string;
  id: keyof typeof products;
}

// Valid columns for sorting and filtering (columns in products schema)
const VALID_COLUMNS = new Set(Object.keys(products)) // Get column names from schema

// Allowed filter columns (matching the columns in the schema)
const _VALID_FILTER_COLUMNS = [
  "id",
  "active",
  "titleTranslations",
  "descriptionTranslations",
  "productData",
  "additionalInfo",
  "resortId",
  "createdAt",
  "updatedAt",
] as const

// Helper function for handling localized JSON fields (e.g., titleTranslations)
const getLocalizedField = (fieldName: string, lang: string = "en") =>
  sql.raw(`"${fieldName}"->>'${lang}'`)

const mapSortColumns = (item: { id: string; desc: boolean }) => {
  if (!VALID_COLUMNS.has(item.id)) return desc(products.createdAt)

  // Handle sorting for JSON columns (e.g., titleTranslations)
  if (item.id === "titleTranslations")
    return item.desc
      ? desc(getLocalizedField("title_translations", "en"))
      : asc(getLocalizedField("title_translations", "en"))
  if (item.id === "descriptionTranslations")
    return item.desc
      ? desc(getLocalizedField("description_translations", "en"))
      : asc(getLocalizedField("description_translations", "en"))

  // Default sorting logic for other columns
  const columnMap = {
    id: products.id,
    active: products.active,
    titleTranslations: products.titleTranslations,
    descriptionTranslations: products.descriptionTranslations,
    productData: products.productData,
    additionalInfo: products.additionalInfo,
    resortId: products.resortId,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  } as const

  const column = columnMap[item.id as keyof typeof columnMap]
  if (!column) return item.desc ? desc(products.createdAt) : asc(products.createdAt)
  return item.desc ? desc(column) : asc(column)
}

export async function dbGetProducts(
  input: SearchParamsType & { resortId: number }
): Promise<{ data: Product[]; pageCount: number }> {
  return await unstable_cache(
    async () => {
      console.log("[DB] Getting products by resort ID...", { input })

      try {
        const offset = (input.page - 1) * input.perPage

        // Validate and process filters
        const processedFilters: ProductFilter[] = (input.filters ?? []).map((f) => ({
          ...f,
          id: f.id.replace("devices_", "") as keyof typeof products,
        }))
        
        const advancedWhere = filterColumns({
          table: products,
          filters: processedFilters,
          joinOperator: input.joinOperator ?? "and",
        })

        const where = input.filters?.length
          ? and(eq(products.resortId, input.resortId), advancedWhere)
          : eq(products.resortId, input.resortId)

        // Sorting logic
        let orderBy = [desc(products.createdAt)] // Default sorting by creation date
        if (input.sort.length > 0) {
          try {
            orderBy = input.sort.map(mapSortColumns)
          } catch (err) {
            orderBy = [desc(products.createdAt)] // Fallback to default sorting
          }
        }

        // Fetch data from the database with pagination
        const { data, total } = await db.transaction(async (tx) => {
          const query = tx
            .select()
            .from(products)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy)

          const data = await query

          const total = await tx
            .select({ count: count() })
            .from(products)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (error) {
        console.error("Error fetching products:", error)
        return { data: [], pageCount: 0 }
      }
    },
    [
      `products-${input.resortId}-${JSON.stringify({
        page: input.page,
        perPage: input.perPage,
        filters: input.filters,
        sort: input.sort,
      })}`,
    ],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["products"],
    }
  )()
}
