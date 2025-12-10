"use server"

import { db } from "@/db"
import { sessions, apiKeys } from "@/db/schema"
import { inArray, eq, desc } from "drizzle-orm"
import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"

/**
 * Safely serialize an object to prevent circular references and stack overflow
 * Converts Date objects to ISO strings and handles nested objects
 */
const safeSerialize = (obj: unknown, depth = 0): unknown => {
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
 * Fetches order sessions from the database
 *
 * @param sessionIds - Array of session IDs to fetch
 * @returns Array of joined session data with API key information
 * @throws Returns empty array on error
 *
 * @description
 * Retrieves sessions associated with an order and joins with API key data.
 * Used to display session history and details in order dialogs.
 * Dates are serialized as ISO strings to prevent stack overflow during Next.js serialization.
 */
export async function dbGetOrderSessions(sessionIds: number[]): Promise<JoinedSession[]> {
    console.log("[DB] Getting order sessions...", { sessionIds })

    try {
        if (!sessionIds?.length) return []

        const data = await db
            .select()
            .from(sessions)
            .leftJoin(apiKeys, eq(sessions.apikeyId, apiKeys.id))
            .where(inArray(sessions.id, sessionIds))
            .orderBy(desc(sessions.createdAt))

        // Filter and serialize the data
        return data
            .filter(
                (session): session is typeof data[0] =>
                    session.sessions.createdAt !== null &&
                    session.sessions.status !== null
            )
            .map(session => {
                // Ensure createdAt is always a string
                let createdAt: string
                if (session.sessions.createdAt instanceof Date) {
                    createdAt = session.sessions.createdAt.toISOString()
                } else if (typeof session.sessions.createdAt === 'string') {
                    createdAt = session.sessions.createdAt
                } else {
                    // Fallback: try to convert to Date then to string
                    createdAt = new Date(session.sessions.createdAt as unknown as string | number).toISOString()
                }

                // Ensure lastActivityAt is string or null
                let lastActivityAt: string | null
                if (session.sessions.lastActivityAt === null) {
                    lastActivityAt = null
                } else if (session.sessions.lastActivityAt instanceof Date) {
                    lastActivityAt = session.sessions.lastActivityAt.toISOString()
                } else if (typeof session.sessions.lastActivityAt === 'string') {
                    lastActivityAt = session.sessions.lastActivityAt
                } else {
                    // Fallback: try to convert to Date then to string
                    lastActivityAt = new Date(session.sessions.lastActivityAt as unknown as string | number).toISOString()
                }

                // Ensure api_keys createdAt is always a string
                let apiKeyCreatedAt: string | undefined
                if (session.api_keys) {
                    if (session.api_keys.createdAt instanceof Date) {
                        apiKeyCreatedAt = session.api_keys.createdAt.toISOString()
                    } else if (typeof session.api_keys.createdAt === 'string') {
                        apiKeyCreatedAt = session.api_keys.createdAt
                    } else {
                        // Fallback: try to convert to Date then to string
                        apiKeyCreatedAt = new Date(session.api_keys.createdAt as unknown as string | number).toISOString()
                    }
                }

                return {
                    sessions: {
                        ...session.sessions,
                        createdAt,
                        lastActivityAt,
                        status: session.sessions.status!, // We filtered for non-null status above
                        sessionLog: safeSerialize(session.sessions.sessionLog),
                        connectionInfo: safeSerialize(session.sessions.connectionInfo),
                    },
                    api_keys: session.api_keys ? {
                        id: session.api_keys.id,
                        apiKey: session.api_keys.apiKey!,
                        scope: session.api_keys.scope!,
                        notes: session.api_keys.notes!,
                        enabled: session.api_keys.enabled!,
                        createdBy: session.api_keys.createdBy!,
                        createdAt: apiKeyCreatedAt!,
                    } : null,
                    orderId: null, // Order sessions don't have orderId in this context
                }
            })
    } catch (err) {
        console.error("Error fetching order sessions:", err)
        return []
    }
}

