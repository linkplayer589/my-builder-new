/**
 * JSDoc: Export file for fetch order functionality
 * Why: Provides clean import path for order fetching capabilities
 * How: Re-exports types and functions from fetchOrderRoute
 */
export {
  fetchOrderRoute,
  type OrderDetails,
  type PaymentDetails,
  type FetchOrderResponse,
  type FetchOrderError
} from './fetchOrderRoute'
