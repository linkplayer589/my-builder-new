/**
 * API response for cancel skipass endpoint
 */
export interface CancelSkipassApiResponse {
  success: boolean
  results?: Array<unknown>
}

/**
 * Response type for cancel skipass action
 */
export type TCancelSkipassResponse = {
  success: boolean
  message?: string
  data?: CancelSkipassApiResponse
}



