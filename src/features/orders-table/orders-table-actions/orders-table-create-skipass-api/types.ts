/**
 * API response for create skipass endpoint
 */
export interface CreateSkipassApiResponse {
  success: boolean
  results?: Array<unknown>
}

/**
 * Response type for create skipass action
 */
export type TCreateSkipassResponse = {
  success: boolean
  message?: string
  data?: CreateSkipassApiResponse
}



