import { type MythOrderDetails, type MythGetOrderResponse } from "@/types/myth-types"

/**
 * Response type for getMythOrder API call
 * Extends the base MythGetOrderResponse from types
 */
export type MythOrderResponse = MythGetOrderResponse

/**
 * Re-export MythOrderDetails for convenience
 */
export type { MythOrderDetails }

