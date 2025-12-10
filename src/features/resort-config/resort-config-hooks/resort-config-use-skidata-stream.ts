"use client"

import { useState, useCallback, useRef } from "react"
import type {
    TStreamSession,
    TStreamState,
    TSkidataMetadata,
    TPriceTableData,
    TSkidataStreamRow,
    TSkidataPriceUpdateEvent,
    TLocalizedText,
} from "../resort-config-types/resort-config-types"
import { getStreamApiConfig } from "../resort-config-actions/resort-config-stream-api-url"

/**
 * Initial empty price data structure
 */
const createEmptyPriceData = (): TPriceTableData => ({
    highSeason: new Map(),
    lowSeason: new Map(),
    highDepot: new Map(),
    lowDepot: new Map(),
})

/**
 * Initial stream session state
 */
const createInitialSession = (): TStreamSession => ({
    state: "idle",
    logs: [],
    metadata: null,
    priceData: createEmptyPriceData(),
    productNames: new Map(),
    consumerNames: new Map(),
    error: null,
    startedAt: null,
    completedAt: null,
})

/**
 * Hook for managing Skidata price streaming via SSE
 *
 * @description
 * Provides functionality to connect to the Skidata price stream endpoint,
 * process incoming events, and manage the streaming state. Uses a
 * ReadableStream reader instead of EventSource to support custom headers.
 *
 * @returns Object containing stream state, control functions, and data
 *
 * @example
 * ```typescript
 * const { session, startStream, stopStream, clearLogs } = useSkidataStream()
 *
 * // Start streaming
 * await startStream()
 *
 * // Access streamed data
 * console.log(session.metadata?.products)
 * console.log(session.priceData.highSeason)
 * ```
 */
export function useSkidataStream() {
    const [session, setSession] = useState<TStreamSession>(createInitialSession)
    const abortControllerRef = useRef<AbortController | null>(null)

    /**
     * Adds a log message to the session
     */
    const addLog = useCallback((message: string) => {
        setSession(prev => ({
            ...prev,
            logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`],
        }))
    }, [])

    /**
     * Updates the stream state
     */
    const setState = useCallback((state: TStreamState) => {
        setSession(prev => ({ ...prev, state }))
    }, [])

    /**
     * Sets metadata from the stream
     */
    const setMetadata = useCallback((metadata: TSkidataMetadata) => {
        setSession(prev => ({ ...prev, metadata }))
    }, [])

    /**
     * Normalizes a name value to TLocalizedText
     */
    const normalizeToLocalizedText = (name: TLocalizedText | string | undefined): TLocalizedText => {
        if (!name) return {}
        if (typeof name === "string") return { en: name }
        return name
    }

    /**
     * Processes a single price update (cell-by-cell real-time updates)
     * Creates new Map instances to trigger React re-renders
     */
    const processPriceUpdate = useCallback((update: TSkidataPriceUpdateEvent) => {
        setSession(prev => {
            // Create completely new Maps to ensure React detects the change
            const newPriceData: TPriceTableData = {
                highSeason: new Map(prev.priceData.highSeason),
                lowSeason: new Map(prev.priceData.lowSeason),
                highDepot: new Map(prev.priceData.highDepot),
                lowDepot: new Map(prev.priceData.lowDepot),
            }

            // Update name maps with new names from the stream
            const newProductNames = new Map(prev.productNames)
            const newConsumerNames = new Map(prev.consumerNames)

            // Store product name if provided
            if (update.productName && update.productId) {
                newProductNames.set(update.productId, normalizeToLocalizedText(update.productName))
            }

            // Store consumer category name if provided
            if (update.consumerCategoryName && update.consumerCategoryId) {
                newConsumerNames.set(update.consumerCategoryId, normalizeToLocalizedText(update.consumerCategoryName))
            }

            // Get the target map for this scenario
            let targetMap: Map<string, Map<string, number | string>>
            switch (update.scenario) {
                case "HIGH":
                    targetMap = newPriceData.highSeason
                    break
                case "LOW":
                    targetMap = newPriceData.lowSeason
                    break
                case "HIGH-DEPOT":
                    targetMap = newPriceData.highDepot
                    break
                case "LOW-DEPOT":
                    targetMap = newPriceData.lowDepot
                    break
                default:
                    return prev
            }

            // Create a new category map (or copy existing)
            const existingCategoryMap = targetMap.get(update.consumerCategoryId)
            const newCategoryMap = existingCategoryMap
                ? new Map(existingCategoryMap)
                : new Map<string, number | string>()

            // Update the single price cell
            newCategoryMap.set(update.productId, update.value)

            // Set the new category map
            targetMap.set(update.consumerCategoryId, newCategoryMap)

            return {
                ...prev,
                priceData: newPriceData,
                productNames: newProductNames,
                consumerNames: newConsumerNames,
            }
        })
    }, [])

    /**
     * Processes price rows and updates the price data structure (batch updates)
     * Creates new Map instances to trigger React re-renders
     */
    const processPriceRows = useCallback((rows: TSkidataStreamRow[]) => {
        setSession(prev => {
            // Create completely new Maps to ensure React detects the change
            const newPriceData: TPriceTableData = {
                highSeason: new Map(prev.priceData.highSeason),
                lowSeason: new Map(prev.priceData.lowSeason),
                highDepot: new Map(prev.priceData.highDepot),
                lowDepot: new Map(prev.priceData.lowDepot),
            }

            for (const row of rows) {
                // Get the target map for this scenario
                let targetMap: Map<string, Map<string, number | string>>
                switch (row.scenario) {
                    case "HIGH":
                        targetMap = newPriceData.highSeason
                        break
                    case "LOW":
                        targetMap = newPriceData.lowSeason
                        break
                    case "HIGH-DEPOT":
                        targetMap = newPriceData.highDepot
                        break
                    case "LOW-DEPOT":
                        targetMap = newPriceData.lowDepot
                        break
                    default:
                        continue
                }

                // Create a new category map (or copy existing)
                const existingCategoryMap = targetMap.get(row.consumerCategoryId)
                const newCategoryMap = existingCategoryMap
                    ? new Map(existingCategoryMap)
                    : new Map<string, number | string>()

                // Add prices for each product
                for (const price of row.prices) {
                    newCategoryMap.set(price.productId, price.value)
                }

                // Set the new category map
                targetMap.set(row.consumerCategoryId, newCategoryMap)
            }

            return { ...prev, priceData: newPriceData }
        })
    }, [])

    /**
     * Ref to track the current event type for multi-line SSE parsing
     */
    const currentEventRef = useRef<string>("message")

    /**
     * Parses SSE lines and returns the event type and data
     * Handles standard SSE format:
     *   event: eventName
     *   data: jsonData
     */
    const parseSSELine = (line: string): { event: string; data: unknown } | null => {
        const trimmed = line.trim()

        // Handle event type line
        if (trimmed.startsWith("event:") || trimmed.startsWith("event :")) {
            const eventName = trimmed.replace(/^event\s*:\s*/, "").trim()
            currentEventRef.current = eventName
            return null // Event line doesn't contain data
        }

        // Handle data line
        if (trimmed.startsWith("data:") || trimmed.startsWith("data :")) {
            try {
                const jsonStr = trimmed.replace(/^data\s*:\s*/, "").trim()
                const parsed = JSON.parse(jsonStr)
                const eventType = currentEventRef.current

                // Reset event type for next message
                currentEventRef.current = "message"

                // Use event from the `event:` line, or fall back to `type` in data
                return { event: eventType !== "message" ? eventType : (parsed.type ?? "unknown"), data: parsed }
            } catch {
                return null
            }
        }

        return null
    }

    /**
     * Starts the Skidata price stream
     */
    const startStream = useCallback(async () => {
        // Reset state
        setSession({
            state: "connecting",
            logs: [],
            metadata: null,
            priceData: createEmptyPriceData(),
            productNames: new Map(),
            consumerNames: new Map(),
            error: null,
            startedAt: new Date(),
            completedAt: null,
        })

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController()
        const { signal } = abortControllerRef.current

        try {
            addLog("Connecting to Skidata price stream...")

            // Get API configuration from server
            const { apiUrl, apiKey } = await getStreamApiConfig()

            if (!apiUrl || !apiKey) {
                throw new Error("API configuration not available")
            }

            const response = await fetch(
                `${apiUrl}/api/script/generate-skidata-prices-stream`,
                {
                    method: "GET",
                    headers: {
                        "x-api-key": apiKey,
                        "Accept": "text/event-stream",
                    },
                    signal,
                }
            )

            if (!response.ok) {
                throw new Error(`Stream connection failed: ${response.status} ${response.statusText}`)
            }

            setState("streaming")
            addLog("Connected! Receiving price data...")

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error("Unable to read response stream")
            }

            const decoder = new TextDecoder()
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    addLog("Stream completed")
                    setState("done")
                    setSession(prev => ({ ...prev, completedAt: new Date() }))
                    break
                }

                // Decode the chunk and add to buffer
                buffer += decoder.decode(value, { stream: true })

                // Process complete lines
                const lines = buffer.split("\n")
                buffer = lines.pop() ?? "" // Keep incomplete line in buffer

                for (const line of lines) {
                    const parsed = parseSSELine(line)
                    if (!parsed) continue

                    switch (parsed.event) {
                        case "log": {
                            const logData = parsed.data as { message?: string }
                            if (logData.message) {
                                addLog(logData.message)
                            }
                            break
                        }
                        case "metadata": {
                            const metaData = parsed.data as { metadata?: TSkidataMetadata }
                            if (metaData.metadata) {
                                setMetadata(metaData.metadata)
                                addLog(`Received metadata: ${metaData.metadata.products?.length ?? 0} products, ${metaData.metadata.consumers?.length ?? 0} categories`)
                            }
                            break
                        }
                        case "scenario-start": {
                            const scenarioData = parsed.data as { scenario?: string }
                            if (scenarioData.scenario) {
                                addLog(`Processing scenario: ${scenarioData.scenario}`)
                            }
                            break
                        }
                        case "prices": {
                            const pricesData = parsed.data as { rows?: TSkidataStreamRow[] }
                            if (pricesData.rows) {
                                processPriceRows(pricesData.rows)
                                addLog(`Received ${pricesData.rows.length} price rows`)
                            }
                            break
                        }
                        case "price-update": {
                            // Real-time cell-by-cell update
                            const updateData = parsed.data as TSkidataPriceUpdateEvent
                            if (updateData.scenario && updateData.productId && updateData.consumerCategoryId) {
                                processPriceUpdate(updateData)
                            }
                            break
                        }
                        case "done": {
                            addLog("Stream finished successfully")
                            setState("done")
                            setSession(prev => ({ ...prev, completedAt: new Date() }))
                            break
                        }
                        case "error": {
                            const errorData = parsed.data as { error?: string }
                            const errorMsg = errorData.error ?? "Unknown stream error"
                            addLog(`Error: ${errorMsg}`)
                            setSession(prev => ({
                                ...prev,
                                state: "error",
                                error: errorMsg,
                                completedAt: new Date(),
                            }))
                            break
                        }
                    }
                }
            }
        } catch (error) {
            if (signal.aborted) {
                addLog("Stream cancelled by user")
                setState("idle")
            } else {
                const errorMsg = error instanceof Error ? error.message : "Unknown error"
                addLog(`Error: ${errorMsg}`)
                setSession(prev => ({
                    ...prev,
                    state: "error",
                    error: errorMsg,
                    completedAt: new Date(),
                }))
            }
        }
    }, [addLog, setState, setMetadata, processPriceRows, processPriceUpdate])

    /**
     * Stops the current stream
     */
    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [])

    /**
     * Clears the log messages
     */
    const clearLogs = useCallback(() => {
        setSession(prev => ({ ...prev, logs: [] }))
    }, [])

    /**
     * Resets the entire session to initial state
     */
    const resetSession = useCallback(() => {
        stopStream()
        setSession(createInitialSession())
    }, [stopStream])

    return {
        session,
        startStream,
        stopStream,
        clearLogs,
        resetSession,
        isStreaming: session.state === "streaming" || session.state === "connecting",
    }
}

