"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { asc, count, desc, inArray, and, eq, sql, gte, lte } from "drizzle-orm"
import type { SearchParamsType } from "@/lib/search-params"
import { filterColumns } from "@/lib/filter-columns"

const VALID_COLUMNS = new Set(Object.keys(orders))
const NESTED_FIELDS = new Map([
    ['startDate', 'orderDetails'],
])

/**
 * Input parameters for fetching orders
 */
interface DbGetOrdersInput extends SearchParamsType {
    /** Resort ID to filter orders by */
    resortId: number
    /** Optional start date for filtering by createdAt */
    from?: Date
    /** Optional end date for filtering by createdAt */
    to?: Date
}

/**
 * Fetch orders from the database with pagination, filtering, sorting, and date range
 *
 * Note: Caching is disabled because order data with JSON fields exceeds
 * the 2MB Next.js cache limit. Database queries are still efficient.
 *
 * @param input - Query parameters including resortId, pagination, filters, and optional date range
 * @returns Object containing order data and page count
 */
export async function dbGetOrders(input: DbGetOrdersInput) {
    console.log("[DB] Getting orders...", {
        ...input,
        from: input.from?.toISOString(),
        to: input.to?.toISOString(),
    })
    try {
        const offset = (input.page - 1) * input.perPage

        const advancedWhere = filterColumns({
            table: orders,
            filters: input.filters ?? [],
            joinOperator: input.joinOperator ?? "and",
        })

        // Build date range conditions if provided
        const dateConditions = [
            input.from ? gte(orders.createdAt, input.from) : undefined,
            input.to ? lte(orders.createdAt, input.to) : undefined,
        ].filter(Boolean)

        const where = input.filters?.length
            ? and(
                eq(orders.resortId, input.resortId),
                advancedWhere,
                ...dateConditions
            )
            : and(
                eq(orders.resortId, input.resortId),
                input.status.length > 0 ? inArray(orders.status, input.status) : undefined,
                ...dateConditions
            )

        let orderBy = [desc(orders.createdAt)]
        if (input.sort.length > 0) {
            try {
                orderBy = input.sort.map((item) => {
                    const parentField = NESTED_FIELDS.get(item.id)
                    if (parentField) {
                        const orderSql = sql.raw(`"order_details"->>'startDate'`)
                        return item.desc ? desc(orderSql) : asc(orderSql)
                    }

                    if (!VALID_COLUMNS.has(item.id)) {
                        return desc(orders.createdAt)
                    }

                    return item.desc
                        ? desc(orders[item.id])
                        : asc(orders[item.id])
                })
            } catch (error) {
                orderBy = [desc(orders.createdAt)]
            }
        }

        const { data, total } = await db.transaction(async (tx) => {
            const query = tx
                .select()
                .from(orders)
                .limit(input.perPage)
                .offset(offset)
                .where(where)
                .orderBy(...orderBy)

            const data = await query

            const total = await tx
                .select({
                    count: count(),
                })
                .from(orders)
                .where(where)
                .execute()
                .then((res) => res[0]?.count ?? 0)

            return {
                data,
                total,
            }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }

    } catch (err) {
        console.error('Error fetching orders:', err)
        return { data: [], pageCount: 0 }
    }
}
