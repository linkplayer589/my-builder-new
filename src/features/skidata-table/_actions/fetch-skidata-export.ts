"use server"

import type { TicketItem, SkiDataExportResponse } from "../_types/skidata"

type FetchSkidataExportParams = {
    resortId: number
    startDateTime: string
    endDateTime: string
    languageCode: string
    sort?: {
        field: keyof TicketItem
        order: "asc" | "desc"
    }
}

type payloadShape = {
    resortId: number
    startDateTime: string
    endDateTime: string
    languageCode: string
}

export async function fetchSkidataExport(params: FetchSkidataExportParams): Promise<{
    data: SkiDataExportResponse | null
    error: string | null
}> {
    console.log("📊 [API] Fetching SkiData export...", { params })
    try {
        const HONO_API_URL = process.env.HONO_API_URL ?? ""
        const HONO_API_KEY = process.env.HONO_API_KEY

        const url = new URL(`${HONO_API_URL}/api/skidata/create-orders-export`)

        const payload: payloadShape = {
            resortId: params.resortId,
            startDateTime: params.startDateTime,
            endDateTime: params.endDateTime,
            languageCode: params.languageCode,
        }


        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": HONO_API_KEY,
            } as HeadersInit,
            body: JSON.stringify(payload),
        }

        const response = await fetch(url, options)

        if (!response.ok) {
            const error = await response.json() as { message?: string }
            return {
                data: null,
                error: error.message ?? "Failed to fetch SkiData report"
            }
        }


        const data = await response.json() as SkiDataExportResponse


        // Apply sorting if specified
        if (params.sort) {
            data.ticketItems.sort((a, b) => {
                const aVal = a[params.sort!.field] ?? ''
                const bVal = b[params.sort!.field] ?? ''
                const order = params.sort!.order === "asc" ? 1 : -1
                return aVal < bVal ? -order : order
            })
        }

        return { data, error: null }
    } catch (error) {
        console.error("Error fetching SkiData report:", error)
        return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to fetch SkiData report"
        }
    }
}