/**
 * JSDoc: Export file for click-and-collect payment capture functionality
 * Why: Provides clean import path for the dedicated click-and-collect payment capture
 * How: Re-exports types and functions from captureClickCollectPayment
 */
export {
  captureClickCollectPayment,
  type ClickAndCollectCapturePaymentRequest,
  type ClickAndCollectCapturePaymentResponse,
  type ClickAndCollectCapturePaymentError
} from './captureClickCollectPayment'
