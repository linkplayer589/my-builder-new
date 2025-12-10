/**
 * API response from swap pass endpoint
 */
export interface SwapPassApiResponse {
    success: boolean
    results?: Array<unknown>
}

/**
 * Response type for swap pass action
 */
export type TSwapPassResponse = {
    success: boolean
    message?: string
    data?: SwapPassApiResponse
}

