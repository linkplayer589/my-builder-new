/**
 * Resort Configuration Feature
 *
 * @description
 * Provides functionality for configuring resort sales channels, viewing Skidata prices,
 * and testing API endpoints. This feature allows admins to:
 * - Stream real-time Skidata pricing data
 * - Configure active products/categories per sales channel
 * - Test API endpoints for kiosk, cash desk, and web
 * - Manage catalog cache
 *
 * @module resort-config
 */

// Components (Client Components - must be imported by client components only)
export { ResortConfigClient } from "./resort-config-components/resort-config-client"

// Note: The following are internal client components used by ResortConfigClient
// They are not exported here to avoid server/client boundary issues
// - ResortConfigLogTerminal
// - ResortConfigPriceTable
// - ResortConfigSalesChannelCard
// - ResortConfigTestSection
// - useSkidataStream (client hook)

// Actions (Server Actions - safe to import from server components)
export { invalidateCatalogCache } from "./resort-config-actions/resort-config-invalidate-cache"
export { testEndpoint, testAllEndpoints } from "./resort-config-actions/resort-config-test-endpoints"
export { updateSalesChannelConfig, batchUpdateSalesChannelConfigs } from "./resort-config-actions/resort-config-update-sales-channel"
export { getSalesChannelsByResortId } from "./resort-config-actions/resort-config-get-sales-channels"

// Types
export type {
    TLocalizedText,
    TSkidataStreamPrice,
    TSkidataStreamRow,
    TSkidataProduct,
    TSkidataConsumer,
    TSkidataMetadata,
    TSkidataStreamEventType,
    TSkidataPriceUpdateEvent,
    TSalesChannelConfigUpdate,
    TConfigurationMatrix,
    TPriceTableData,
    TCacheInvalidationResponse,
    TTestEndpointResponse,
    TApiResult,
    TStreamState,
    TStreamSession,
} from "./resort-config-types/resort-config-types"

