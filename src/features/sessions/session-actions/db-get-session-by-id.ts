"use server"

import { db } from "@/db"
import { sessions, apiKeys, orders } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

/**
 * Serialized session data for client-side consumption
 * Matches the JoinedSession type from db-get-sessions.ts
 */
export type SessionById = {
    sessions: {
        id: number
        createdAt: string // ISO string
        lastActivityAt: string | null // ISO string or null
        status: string | null
        sessionLabel: string | null
        sessionLog: unknown // Safely serialized object
        connectionInfo: unknown // Safely serialized object
        apikeyId: number | null
    }
    api_keys: {
        id: number
        apiKey: string | null
        scope: string | null
        notes: string | null
        enabled: boolean | null
        createdBy: string | null
        createdAt: string // ISO string
    } | null
    orderId: number | null
}

/**
 * Safely serialize an object to prevent circular references and stack overflow
 * Converts Date objects to ISO strings and handles nested objects
 */
function safeSerialize(obj: unknown, depth = 0): unknown {
    // Prevent infinite recursion (max depth of 10)
    if (depth > 10) {
        return '[Max Depth Reached]'
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
        return obj.map(item => safeSerialize(item, depth + 1))
    }

    // Handle objects
    if (typeof obj === 'object') {
        try {
            const result: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(obj)) {
                result[key] = safeSerialize(value, depth + 1)
            }
            return result
        } catch (error) {
            // If serialization fails, return a placeholder
            console.warn('[DB] Failed to serialize object:', error)
            return '[Serialization Error]'
        }
    }

    // Handle primitives
    return obj
}

/**
 * Get a single session by ID with all related data
 *
 * @param sessionId - The ID of the session to fetch
 * @returns The session data or null if not found
 */
export async function dbGetSessionById(sessionId: number): Promise<{
    success: true
    data: SessionById
} | {
    success: false
    error: string
}> {
    console.log("[DB] Getting session by ID:", sessionId)

    try {
        const result = await db
            .select()
            .from(sessions)
            .leftJoin(apiKeys, eq(sessions.apikeyId, apiKeys.id))
            .where(eq(sessions.id, sessionId))
            .limit(1)

        if (result.length === 0) {
            return {
                success: false,
                error: `Session with ID ${sessionId} not found`,
            }
        }

        const session = result[0]!

        // Find order that contains this session ID
        let orderId: number | null = null

        // Try to extract orderId from sessionLog first
        try {
            const sessionLog = session.sessions.sessionLog
            if (sessionLog && typeof sessionLog === 'object' && 'orderId' in sessionLog) {
                const orderIdValue = (sessionLog as { orderId?: unknown }).orderId
                if (typeof orderIdValue === 'number') {
                    orderId = orderIdValue
                } else if (typeof orderIdValue === 'string') {
                    const parsed = Number.parseInt(orderIdValue, 10)
                    if (!Number.isNaN(parsed)) {
                        orderId = parsed
                    }
                }
            }
        } catch (error) {
            console.warn('[DB] Failed to extract orderId from sessionLog:', error)
        }

        // If not found in sessionLog, query orders table
        if (orderId === null) {
            const ordersWithSession = await db
                .select({ id: orders.id })
                .from(orders)
                .where(sql`${orders.sessionIds} @> ARRAY[${sessionId}]::integer[]`)
                .limit(1)

            if (ordersWithSession.length > 0) {
                orderId = ordersWithSession[0]!.id
            }
        }

        // Serialize dates and objects
        let createdAt: string
        if (session.sessions.createdAt instanceof Date) {
            createdAt = session.sessions.createdAt.toISOString()
        } else if (typeof session.sessions.createdAt === 'string') {
            createdAt = session.sessions.createdAt
        } else {
            createdAt = new Date(session.sessions.createdAt as unknown as string | number).toISOString()
        }

        let lastActivityAt: string | null
        if (session.sessions.lastActivityAt === null) {
            lastActivityAt = null
        } else if (session.sessions.lastActivityAt instanceof Date) {
            lastActivityAt = session.sessions.lastActivityAt.toISOString()
        } else if (typeof session.sessions.lastActivityAt === 'string') {
            lastActivityAt = session.sessions.lastActivityAt
        } else {
            lastActivityAt = new Date(session.sessions.lastActivityAt as unknown as string | number).toISOString()
        }

        let apiKeyCreatedAt: string | undefined
        if (session.api_keys) {
            if (session.api_keys.createdAt instanceof Date) {
                apiKeyCreatedAt = session.api_keys.createdAt.toISOString()
            } else if (typeof session.api_keys.createdAt === 'string') {
                apiKeyCreatedAt = session.api_keys.createdAt
            } else {
                apiKeyCreatedAt = new Date(session.api_keys.createdAt as unknown as string | number).toISOString()
            }
        }

        const serializedSession: SessionById = {
            sessions: {
                ...session.sessions,
                createdAt,
                lastActivityAt,
                sessionLog: safeSerialize(session.sessions.sessionLog),
                connectionInfo: safeSerialize(session.sessions.connectionInfo),
            },
            api_keys: session.api_keys ? {
                ...session.api_keys,
                createdAt: apiKeyCreatedAt!,
            } : null,
            orderId,
        }

        console.log("[DB] Found session:", sessionId)
        return {
            success: true,
            data: serializedSession,
        }
    } catch (err) {
        console.error('Error fetching session:', err)
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error occurred',
        }
    }
}

