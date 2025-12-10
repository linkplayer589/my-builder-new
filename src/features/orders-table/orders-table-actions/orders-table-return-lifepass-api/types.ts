/**
 * API response from return lifepass endpoint
 */
export interface ReturnLifepassApiResponse {
  success: boolean
  results: Array<unknown>
}

/**
 * Response type for return lifepass action
 */
export type TReturnLifepassResponse = {
  success: boolean
  message?: string
  data?: ReturnLifepassApiResponse
}

