/**
 * Resort & Sales Channel Configuration Types
 *
 * @description
 * Type definitions for the resort configuration feature including SSE stream types,
 * configuration matrix types, and API response types.
 */

import type { SalesChannel, Resort } from "@/db/schema"

// ============================================================================
// Localization Types
// ============================================================================

/**
 * Localized text object for multi-language support
 */
export type TLocalizedText = {
    en?: string
    de?: string
    it?: string
    fr?: string
    [key: string]: string | undefined
}

// ============================================================================
// SSE Stream Types
// ============================================================================

/**
 * Individual price data from the Skidata stream
 */
export type TSkidataStreamPrice = {
    /** Skidata product identifier */
    productId: string
    /** Price value or error code string */
    value: number | string
}

/**
 * Price row data from the Skidata stream
 */
export type TSkidataStreamRow = {
    /** Season scenario type */
    scenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"
    /** Consumer category identifier */
    consumerCategoryId: string
    /** Display name of the consumer category */
    consumerCategoryName: string
    /** Array of prices for each product */
    prices: TSkidataStreamPrice[]
}

/**
 * Product metadata from the Skidata stream
 */
export type TSkidataProduct = {
    /** Product identifier */
    id: string
    /** Localized product name */
    name: {
        en?: string
        de?: string
        [key: string]: string | undefined
    }
}

/**
 * Consumer category metadata from the Skidata stream
 */
export type TSkidataConsumer = {
    /** Consumer category identifier */
    id: string
    /** Localized consumer category name */
    name: {
        en?: string
        de?: string
        [key: string]: string | undefined
    }
}

/**
 * Metadata from the Skidata stream containing all products and consumers
 */
export type TSkidataMetadata = {
    /** Array of all available products */
    products: TSkidataProduct[]
    /** Array of all available consumer categories */
    consumers: TSkidataConsumer[]
}

/**
 * SSE event types from the Skidata price stream
 */
export type TSkidataStreamEventType =
    | "log"
    | "metadata"
    | "scenario-start"
    | "prices"
    | "price-update"
    | "done"
    | "error"

/**
 * Individual price update event data (cell-by-cell updates)
 */
export type TSkidataPriceUpdateEvent = {
    /** Season scenario type */
    scenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"
    /** Consumer category identifier */
    consumerCategoryId: string
    /** Localized name of the consumer category */
    consumerCategoryName: TLocalizedText | string
    /** Product identifier */
    productId: string
    /** Localized name of the product */
    productName: TLocalizedText | string
    /** Validity category ID (optional) */
    validityCategoryId?: string
    /** Price value or error code */
    value: number | string
}

/**
 * SSE event data structure
 */
export type TSkidataStreamEvent = {
    /** Type of the event */
    type: TSkidataStreamEventType
    /** Event payload data */
    data: unknown
}

/**
 * Log event data
 */
export type TSkidataLogEvent = {
    type: "log"
    message: string
    timestamp?: string
}

/**
 * Metadata event data
 */
export type TSkidataMetadataEvent = {
    type: "metadata"
    metadata: TSkidataMetadata
}

/**
 * Scenario start event data
 */
export type TSkidataScenarioStartEvent = {
    type: "scenario-start"
    scenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"
}

/**
 * Prices event data
 */
export type TSkidataPricesEvent = {
    type: "prices"
    rows: TSkidataStreamRow[]
}

/**
 * Done event data
 */
export type TSkidataDoneEvent = {
    type: "done"
    success: boolean
}

/**
 * Error event data
 */
export type TSkidataErrorEvent = {
    type: "error"
    error: string
}

// ============================================================================
// Configuration Matrix Types
// ============================================================================

/**
 * Sales channel configuration update payload
 */
export type TSalesChannelConfigUpdate = {
    /** Sales channel ID to update */
    id: number
    /** Array of active product IDs */
    activeProductIds: string[]
    /** Array of active consumer category IDs */
    activeConsumerCategoryIds: string[]
}

/**
 * Configuration matrix state for a sales channel
 */
export type TConfigurationMatrix = {
    /** Sales channel data */
    salesChannel: SalesChannel
    /** Selected product IDs */
    selectedProductIds: Set<string>
    /** Selected consumer category IDs */
    selectedConsumerCategoryIds: Set<string>
    /** Whether the configuration has changed */
    isDirty: boolean
}

// ============================================================================
// Price Table Types
// ============================================================================

/**
 * Organized price data for display
 */
export type TPriceTableData = {
    /** HIGH season prices grouped by consumer category */
    highSeason: Map<string, Map<string, number | string>>
    /** LOW season prices grouped by consumer category */
    lowSeason: Map<string, Map<string, number | string>>
    /** HIGH-DEPOT season prices grouped by consumer category */
    highDepot: Map<string, Map<string, number | string>>
    /** LOW-DEPOT season prices grouped by consumer category */
    lowDepot: Map<string, Map<string, number | string>>
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Cache invalidation response
 */
export type TCacheInvalidationResponse = {
    success: boolean
    message?: string
    error?: string
}

/**
 * Test endpoint response
 */
export type TTestEndpointResponse = {
    success: boolean
    catalogs?: unknown[]
    error?: string
}

/**
 * API call result wrapper
 */
export type TApiResult<T> = {
    data: T | null
    error: string | null
    status: number
}

// ============================================================================
// Stream State Types
// ============================================================================

/**
 * Stream connection state
 */
export type TStreamState =
    | "idle"
    | "connecting"
    | "streaming"
    | "done"
    | "error"

/**
 * Complete stream session state
 */
export type TStreamSession = {
    /** Current connection state */
    state: TStreamState
    /** Log messages from the stream */
    logs: string[]
    /** Metadata from the stream */
    metadata: TSkidataMetadata | null
    /** Price data organized by scenario */
    priceData: TPriceTableData
    /** Product names received from stream (productId -> localized name) */
    productNames: Map<string, TLocalizedText>
    /** Consumer names received from stream (consumerId -> localized name) */
    consumerNames: Map<string, TLocalizedText>
    /** Error message if any */
    error: string | null
    /** Timestamp when streaming started */
    startedAt: Date | null
    /** Timestamp when streaming completed */
    completedAt: Date | null
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the resort selector component
 */
export type TResortSelectorProps = {
    /** Array of available resorts */
    resorts: Resort[]
    /** Currently selected resort */
    selectedResort: Resort | null
    /** Callback when resort selection changes */
    onSelect: (resort: Resort) => void
    /** Whether the selector is disabled */
    disabled?: boolean
}

/**
 * Props for the sales channel card component
 */
export type TSalesChannelCardProps = {
    /** Sales channel data */
    salesChannel: SalesChannel
    /** Available products from metadata */
    products: TSkidataProduct[]
    /** Available consumer categories from metadata */
    consumers: TSkidataConsumer[]
    /** Callback when configuration changes */
    onChange: (update: TSalesChannelConfigUpdate) => void
    /** Whether the card is in loading state */
    isLoading?: boolean
}

/**
 * Props for the price table component
 */
export type TPriceTableProps = {
    /** Price data to display */
    priceData: TPriceTableData
    /** Products for column headers */
    products: TSkidataProduct[]
    /** Consumer categories for row headers */
    consumers: TSkidataConsumer[]
    /** Product names received from stream (productId -> localized name) */
    productNames: Map<string, TLocalizedText>
    /** Consumer names received from stream (consumerId -> localized name) */
    consumerNames: Map<string, TLocalizedText>
    /** Currently active scenario tab */
    activeScenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"
    /** Callback when scenario tab changes */
    onScenarioChange: (scenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT") => void
}

/**
 * Props for the test results display component
 */
export type TTestResultsProps = {
    /** Test endpoint type */
    endpoint: "kiosk" | "cash-desk" | "web"
    /** Response data */
    response: TTestEndpointResponse | null
    /** Whether the test is loading */
    isLoading: boolean
    /** Error message if any */
    error: string | null
}

/**
 * Props for the log terminal component
 */
export type TLogTerminalProps = {
    /** Array of log messages */
    logs: string[]
    /** Whether the terminal should auto-scroll */
    autoScroll?: boolean
    /** Maximum height of the terminal */
    maxHeight?: string
}

// ============================================================================
// Re-exports
// ============================================================================

export type { Resort, SalesChannel }

