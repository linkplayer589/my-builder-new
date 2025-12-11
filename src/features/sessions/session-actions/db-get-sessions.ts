"use server"

import { db } from "@/db"
import { apiKeys, orders, sessions } from "@/db/schema"
import { asc, count, desc, eq, sql, type AnyColumn } from "drizzle-orm"

import { filterColumns } from "@/lib/filter-columns"
import type { SearchParamsType } from "@/lib/search-params"

const VALID_COLUMNS = new Set(Object.keys(sessions))

/**
 * Serialized session data for client-side consumption
 * Dates are serialized as ISO strings to prevent stack overflow during Next.js serialization
 */
export type JoinedSession = {
  sessions: {
    id: number
    createdAt: string // ISO string
    lastActivityAt: string | null // ISO string or null
    status: string
    sessionLabel: string | null
    sessionLog: unknown // Safely serialized object
    connectionInfo: unknown // Safely serialized object
    apikeyId: number | null
  }
  api_keys: {
    id: number
    apiKey: string
    scope: string
    notes: string
    enabled: boolean
    createdBy: string
    createdAt: string // ISO string
  } | null
  orderId: number | null
}

type SessionFilter = {
  value: string | string[]
  type: "number" | "boolean" | "date" | "text" | "multi-select"
  operator:
    | "eq"
    | "iLike"
    | "notILike"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "neq"
    | "contains"
    | "notContains"
    | "between"
    | "empty"
    | "notEmpty"
  rowId: string
  id: keyof typeof sessions
}

/**
 * Get sessions with pagination, filtering, and sorting
 *
 * @description
 * Uses Next.js 16 "use cache" directive with custom cache configuration.
 * Note: For very large page sizes (>100), cache may be skipped due to size limits.
 */
export async function dbGetSessions(input: SearchParamsType) {
  "use cache"
  //   console.log("[DB] Getting sessions...", { input })
  try {
    const offset = (input.page - 1) * input.perPage

    const advancedWhere = filterColumns({
      table: sessions,
      filters: (input.filters ?? []).map((f) => ({
        ...f,
        id: f.id.replace("sessions_", "") as keyof typeof sessions,
      })) as SessionFilter[],
      joinOperator: input.joinOperator ?? "and",
    })

    let orderBy = [desc(sessions.createdAt)]
    if (input.sort.length > 0) {
      try {
        const validSorts = input.sort
          .filter((item) => {
            const columnName = item.id.replace("sessions_", "")
            return VALID_COLUMNS.has(columnName)
          })
          .map((item) => {
            const columnName = item.id.replace(
              "sessions_",
              ""
            ) as keyof typeof sessions
            const column = sessions[columnName] as AnyColumn
            return item.desc ? desc(column) : asc(column)
          })

        orderBy =
          validSorts.length > 0 ? validSorts : [desc(sessions.createdAt)]
      } catch (error) {
        console.error("Error processing sort:", error)
        orderBy = [desc(sessions.createdAt)]
      }
    }

    const { data, total } = await db.transaction(async (tx) => {
      const query = tx
        .select()
        .from(sessions)
        .leftJoin(apiKeys, eq(sessions.apikeyId, apiKeys.id))
        .limit(input.perPage)
        .offset(offset)
        .where(advancedWhere)
        .orderBy(...orderBy)

      const data = await query

      // Find orders that contain each session ID in their sessionIds array
      const sessionIds = data.map((s) => s.sessions.id)
      const orderIdMap = new Map<number, number | null>()

      if (sessionIds.length > 0) {
        // Query orders where sessionIds array overlaps with our session IDs array
        // Using PostgreSQL array overlap operator (&&) to find orders containing any session ID
        // Format: ARRAY[1,2,3] for PostgreSQL array literal
        const sessionIdsArrayLiteral = `ARRAY[${sessionIds.join(",")}]`
        const ordersWithSessions = await tx
          .select({
            id: orders.id,
            sessionIds: orders.sessionIds,
          })
          .from(orders)
          .where(
            sql`${orders.sessionIds} && ${sql.raw(sessionIdsArrayLiteral)}`
          )

        // Create a map: sessionId -> orderId (taking first order if multiple)
        for (const order of ordersWithSessions) {
          if (order.sessionIds) {
            for (const sessionId of order.sessionIds) {
              if (
                sessionIds.includes(sessionId) &&
                !orderIdMap.has(sessionId)
              ) {
                orderIdMap.set(sessionId, order.id)
              }
            }
          }
        }
      }

      /**
       * Safely serialize an object to prevent circular references and stack overflow
       * Converts Date objects to ISO strings and handles nested objects
       */
      const safeSerialize = (obj: unknown, depth = 0): unknown => {
        // Prevent infinite recursion (max depth of 10)
        if (depth > 10) {
          return "[Max Depth Reached]"
        }

        if (obj === null || obj === undefined) {
          return obj
        }

        // Handle Date objects
        if (obj instanceof Date) {
          return obj.toISOString()
        }

        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map((item) => safeSerialize(item, depth + 1))
        }

        // Handle objects
        if (typeof obj === "object") {
          try {
            const result: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(obj)) {
              result[key] = safeSerialize(value, depth + 1)
            }
            return result
          } catch (error) {
            // If serialization fails, return a placeholder
            console.warn("[DB] Failed to serialize object:", error)
            return "[Serialization Error]"
          }
        }

        // Handle primitives
        return obj
      }

      // Add orderId to each session and serialize for client
      // First check if orderId exists in sessionLog, then fall back to orders table lookup
      const dataWithOrderIds = data.map((session) => {
        // Try to extract orderId from sessionLog first
        let orderIdFromLog: number | null = null
        try {
          const sessionLog = session.sessions.sessionLog
          if (
            sessionLog &&
            typeof sessionLog === "object" &&
            "orderId" in sessionLog
          ) {
            const orderIdValue = (sessionLog as { orderId?: unknown }).orderId
            if (typeof orderIdValue === "number") {
              orderIdFromLog = orderIdValue
            } else if (typeof orderIdValue === "string") {
              const parsed = Number.parseInt(orderIdValue, 10)
              if (!Number.isNaN(parsed)) {
                orderIdFromLog = parsed
              }
            }
          }
        } catch (error) {
          // Silently fail if sessionLog parsing fails
          console.warn("[DB] Failed to extract orderId from sessionLog:", error)
        }

        // Use orderId from sessionLog if available, otherwise use the orders table lookup
        const orderId =
          orderIdFromLog ?? orderIdMap.get(session.sessions.id) ?? null

        // Serialize the session data for safe client-side transfer
        // Convert Date objects to ISO strings and safely serialize nested objects

        // Ensure createdAt is always a string
        let createdAt: string
        if (session.sessions.createdAt instanceof Date) {
          createdAt = session.sessions.createdAt.toISOString()
        } else if (typeof session.sessions.createdAt === "string") {
          createdAt = session.sessions.createdAt
        } else {
          // Fallback: try to convert to Date then to string
          createdAt = new Date(
            session.sessions.createdAt as unknown as string | number
          ).toISOString()
        }

        // Ensure lastActivityAt is string or null
        let lastActivityAt: string | null
        if (session.sessions.lastActivityAt === null) {
          lastActivityAt = null
        } else if (session.sessions.lastActivityAt instanceof Date) {
          lastActivityAt = session.sessions.lastActivityAt.toISOString()
        } else if (typeof session.sessions.lastActivityAt === "string") {
          lastActivityAt = session.sessions.lastActivityAt
        } else {
          // Fallback: try to convert to Date then to string
          lastActivityAt = new Date(
            session.sessions.lastActivityAt as unknown as string | number
          ).toISOString()
        }

        // Ensure api_keys createdAt is always a string
        let apiKeyCreatedAt: string | undefined
        if (session.api_keys) {
          if (session.api_keys.createdAt instanceof Date) {
            apiKeyCreatedAt = session.api_keys.createdAt.toISOString()
          } else if (typeof session.api_keys.createdAt === "string") {
            apiKeyCreatedAt = session.api_keys.createdAt
          } else {
            // Fallback: try to convert to Date then to string
            apiKeyCreatedAt = new Date(
              session.api_keys.createdAt as unknown as string | number
            ).toISOString()
          }
        }

        return {
          sessions: {
            ...session.sessions,
            createdAt,
            lastActivityAt,
            sessionLog: safeSerialize(session.sessions.sessionLog),
            connectionInfo: safeSerialize(session.sessions.connectionInfo),
          },
          api_keys: session.api_keys
            ? {
                ...session.api_keys,
                createdAt: apiKeyCreatedAt!,
              }
            : null,
          orderId,
        }
      })

      const total = await tx
        .select({
          count: count(),
        })
        .from(sessions)
        .where(advancedWhere)
        .execute()
        .then((res) => res[0]?.count ?? 0)

      return {
        data: dataWithOrderIds,
        total,
      }
    })

    const pageCount = Math.ceil(total / input.perPage)
    console.log(`[DB] Found ${total} sessions (${pageCount} pages)`)
    return { data, pageCount }
  } catch (err) {
    console.error("Error fetching sessions:", err)
    console.error("Error details:", {
      name: err instanceof Error ? err.name : "Unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return { data: [], pageCount: 0 }
  }
}
