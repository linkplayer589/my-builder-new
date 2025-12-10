"use client"

import * as React from "react"
import { checkDeviceStatus } from "@/features/validate-lifepass-device/actions/check-device-status"
import { formatDeviceStatusResponse } from "@/features/validate-lifepass-device/functions/format-device-status-response"
import { revalidateOrders } from "@/db/server-actions/order-actions/revalidate-orders"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CreditCard, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import posthog from "posthog-js"

import { type CalculatedOrderPrice } from "@/types/general-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { orderCollectRoute } from "../order-collect-actions/order-collect/orderCollectRoute"
import { fetchOrderRoute, type OrderDetails, type PaymentDetails } from "../order-collect-actions/fetch-order/fetchOrderRoute"
import { debugPaymentStatus } from "../order-collect-actions/debug-payment-status"
import { DeviceIdInput } from "./device-id-input"
import { ProductDetails } from "./product-details"
import { CardReaderPayment } from "./card-reader-payment"

type TDebugResult = {
  success: boolean
  hasInconsistency?: boolean
  hasSyncIssue?: boolean
  hasBackendContradiction?: boolean
  error?: string
  analysis?: {
    reportedAsFullyPaid: boolean
    remainingAmountEuros: number
    calculatedIsFullyPaid: boolean
    isConsistent: boolean
    backendSyncIssue?: { warningMessage?: string | null } | null
    invoiceId?: string | null
  }
} | null

const formSchema = z.object({
  deviceIds: z.array(z.string().min(1, "Device ID is required")),
})

type FormValues = z.infer<typeof formSchema>

interface ClickAndCollectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  calculatedOrderPrice: CalculatedOrderPrice
}

/**
 * JSDoc: Enhanced Click & Collect dialog with order fetching and payment handling
 * Why: Provides complete order collection workflow including payment verification
 * How: Fetches order details, handles payment via card readers, and supports bypass payment
 */
export function ClickAndCollectDialog({
  open,
  onOpenChange,
  orderId,
  calculatedOrderPrice,
}: ClickAndCollectDialogProps) {
  // Helper: resolve translated reason object to a displayable string
  const resolveBlockReasonText = React.useCallback((reason: unknown): string | undefined => {
    if (!reason) return undefined
    if (typeof reason === 'string') return reason
    if (typeof reason === 'object') {
      const map = reason as Record<string, unknown>
      // Determine preferred locale from browser (fallback to 'en')
      const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en'
      const langBase = browserLang?.split('-')?.[0] || 'en'
      const candidates = [browserLang, langBase, 'en', 'en-GB', 'en-US', 'it', 'de', 'fr', 'zh']
      for (const key of candidates) {
        const val = map[key]
        if (typeof val === 'string' && val.trim().length > 0) return val
      }
      // Fallback: first string value found
      for (const val of Object.values(map)) {
        if (typeof val === 'string' && val.trim().length > 0) return val
      }
    }
    return undefined
  }, [])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [warningMessage, setWarningMessage] = React.useState("")
  const [isFetchingOrder, setIsFetchingOrder] = React.useState(true)
  const [orderDetails, setOrderDetails] = React.useState<OrderDetails | null>(null)
  const [paymentDetails, setPaymentDetails] = React.useState<PaymentDetails | null>(null)
  const [fetchError, setFetchError] = React.useState<string>("")
  const [showBypassConfirm, setShowBypassConfirm] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("details")
  const [isRefreshingOrder, setIsRefreshingOrder] = React.useState(false)
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null)
  const [isDebuggingPayment, setIsDebuggingPayment] = React.useState(false)
  const [debugResults, setDebugResults] = React.useState<TDebugResult>(null)
  const [isCollectEarly, setIsCollectEarly] = React.useState(false)
  const [showEarlyCollectConfirm, setShowEarlyCollectConfirm] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceIds: Array(calculatedOrderPrice.orderItemPrices.length).fill(""),
    },
  })

  /**
   * JSDoc: Fetch order details when dialog opens
   * Why: Need to verify order status and payment before allowing collection
   * How: Calls fetchOrderRoute API and updates local state with results
   */
  React.useEffect(() => {
    if (open && orderId) {
      const fetchOrder = async () => {
        setIsFetchingOrder(true)
        setFetchError("")

        console.log("🔍 [Dialog] Fetching order details...", { orderId })

        // Log dialog fetch initiation
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('order_collection_dialog_opened', {
            order_id: orderId,
            timestamp: new Date().toISOString()
          })
        }

        try {
          const result = await fetchOrderRoute(orderId)

          if (result.success) {
            setOrderDetails(result.data.order)
            setPaymentDetails(result.data.payment)
            setLastRefreshed(new Date())

            // Set initial tab based on payment status
            if (!result.data.payment.isFullyPaid) {
              setActiveTab("payment")
            }

            console.log("✅ [Dialog] Order details loaded", {
              orderId,
              isFullyPaid: result.data.payment.isFullyPaid,
              remainingAmount: result.data.payment.remainingAmountCents,
            })

            // Log successful order fetch in dialog
            if (typeof window !== 'undefined' && posthog) {
              posthog.capture('order_collection_dialog_order_loaded', {
                order_id: orderId,
                is_fully_paid: result.data.payment.isFullyPaid,
                remaining_amount_cents: result.data.payment.remainingAmountCents,
                order_status: result.data.order.status,
                payment_status: result.data.order.paymentStatus,
                timestamp: new Date().toISOString()
              })
            }
          } else {
            setFetchError(result.error)
            console.error("❌ [Dialog] Failed to fetch order:", result.error)

            // Log order fetch failures in dialog
            if (typeof window !== 'undefined' && posthog) {
              posthog.capture('order_collection_dialog_fetch_failed', {
                order_id: orderId,
                error_message: result.error,
                error_type: result.errorType,
                timestamp: new Date().toISOString(),
                severity: 'medium'
              })
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error"
          setFetchError(errorMsg)
          console.error("❌ [Dialog] Unexpected error fetching order:", error)

          // Log unexpected errors in dialog
          if (typeof window !== 'undefined' && posthog) {
            posthog.capture('order_collection_dialog_unexpected_error', {
              order_id: orderId,
              error_message: errorMsg,
              timestamp: new Date().toISOString(),
              severity: 'medium'
            })
          }
        } finally {
          setIsFetchingOrder(false)
        }
      }

      void fetchOrder()
    }
  }, [open, orderId])

  /**
   * JSDoc: Manually refresh order details and payment status
   * Why: Allow checking for payment updates made outside this dialog
   * How: Re-fetches order details and updates local state, with loading indicator
   */
  const handleRefreshOrder = React.useCallback(async () => {
    if (!orderId || isRefreshingOrder) return

    setIsRefreshingOrder(true)
    console.log("🔄 [Dialog] Manually refreshing order details...", { orderId })

    // Log manual order refresh
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_manual_refresh', {
        order_id: orderId,
        timestamp: new Date().toISOString()
      })
    }

    try {
      const result = await fetchOrderRoute(orderId)

      if (result.success) {
        const wasFullyPaid = paymentDetails?.isFullyPaid
        const isNowFullyPaid = result.data.payment.isFullyPaid

        setOrderDetails(result.data.order)
        setPaymentDetails(result.data.payment)
        setFetchError("")
        setLastRefreshed(new Date())

        // Show success message if payment status changed to fully paid
        if (!wasFullyPaid && isNowFullyPaid) {
          toast.success("Payment status updated - Order is now fully paid!")
          setActiveTab("details") // Switch to collection tab
        } else if (isNowFullyPaid) {
          toast.success("Order details refreshed - Payment is complete")
        } else {
          toast.success("Order details refreshed")
        }

        // Log successful refresh
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('order_collection_manual_refresh_success', {
            order_id: orderId,
            payment_status_changed: wasFullyPaid !== isNowFullyPaid,
            is_fully_paid: isNowFullyPaid,
            remaining_amount_cents: result.data.payment.remainingAmountCents,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setFetchError(result.error)
        toast.error(`Failed to refresh order: ${result.error}`)

        // Log refresh failure
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('order_collection_manual_refresh_failed', {
            order_id: orderId,
            error_message: result.error,
            error_type: result.errorType,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          })
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setFetchError(errorMsg)
      toast.error(`Failed to refresh order: ${errorMsg}`)

      // Log refresh error
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_manual_refresh_error', {
          order_id: orderId,
          error_message: errorMsg,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }
    } finally {
      setIsRefreshingOrder(false)
    }
  }, [orderId, paymentDetails?.isFullyPaid, isRefreshingOrder])

  /**
   * JSDoc: Debug payment status for troubleshooting payment detection issues
   * Why: Allows administrators to manually validate payment status when inconsistencies occur
   * How: Runs detailed payment status analysis and displays results
   */
  const handleDebugPaymentStatus = React.useCallback(async () => {
    if (!orderId || isDebuggingPayment) return

    setIsDebuggingPayment(true)
    console.log("🔍 [Dialog] Running payment status debug analysis...", { orderId })

    // Log debug initiation
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_debug_payment_initiated', {
        order_id: orderId,
        timestamp: new Date().toISOString()
      })
    }

    try {
      const result = await debugPaymentStatus(orderId)

      setDebugResults(result)

      if (result.success && result.hasBackendContradiction) {
        toast.error(`🚨 CRITICAL: Backend API contradiction detected! Reports paid=true with outstanding balance.`)
      } else if (result.success && result.hasInconsistency) {
        toast.error(`🚨 Payment status inconsistency detected! See console for details.`)
      } else if (result.success && result.hasSyncIssue) {
        toast.warning(`⚠️ Backend-Stripe sync issue detected! Backend reports fully paid but verify Stripe invoice.`)
      } else if (result.success) {
        toast.success(`✅ Payment status validation passed - no issues detected.`)
      } else {
        toast.error(`❌ Debug failed: ${result.error}`)
      }

      // Log debug completion
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_debug_payment_completed', {
          order_id: orderId,
          debug_success: result.success,
          has_inconsistency: result.success ? result.hasInconsistency : false,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Debug failed"
      console.error("🚨 [Dialog] Debug payment status error:", error)
      toast.error(`Debug error: ${errorMsg}`)

      // Log debug errors
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_debug_payment_error', {
          order_id: orderId,
          error_message: errorMsg,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }
    } finally {
      setIsDebuggingPayment(false)
    }
  }, [orderId, isDebuggingPayment])

  /**
   * JSDoc: Handle successful card reader payment
   * Why: Update payment status and allow proceeding to collection
   * How: Uses the manual refresh function to update order status
   */
  const handlePaymentSuccess = () => {
    console.log("💳 [Dialog] Payment successful, refreshing order...")

    // Log payment success
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_payment_completed', {
        order_id: orderId,
        timestamp: new Date().toISOString()
      })
    }

    // Use the manual refresh function to update order details
    void handleRefreshOrder()
  }

  /**
   * JSDoc: Handle card reader payment errors
   * Why: Show error messages and log failures
   * How: Displays toast error and logs to PostHog
   */
  const handlePaymentError = (error: string) => {
    console.error("💳 [Dialog] Payment failed:", error)
    toast.error(`Payment failed: ${error}`)

    // Log payment errors
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_payment_failed', {
        order_id: orderId,
        error_message: error,
        timestamp: new Date().toISOString(),
        severity: 'high'
      })
    }
  }

  /**
   * JSDoc: Handle bypass payment confirmation
   * Why: Allow admin users to proceed with collection even when payment is incomplete
   * How: Shows confirmation dialog and logs bypass action
   */
  const handleBypassPayment = () => {
    console.log("⚠️ [Dialog] Initiating payment bypass...")

    // Log bypass payment initiation
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_bypass_payment_initiated', {
        order_id: orderId,
        remaining_amount_cents: paymentDetails?.remainingAmountCents || 0,
        timestamp: new Date().toISOString(),
        severity: 'high' // High severity for payment bypasses
      })
    }

    setShowBypassConfirm(true)
  }

  /**
   * JSDoc: Handle early collection confirmation
   * Why: Allow admin users to collect orders before the scheduled collection time
   * How: Shows confirmation dialog and enables early collection mode
   */
  const handleCollectEarly = () => {
    console.log("⏰ [Dialog] Initiating early collection...")

    // Log early collection initiation
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('order_collection_early_pickup_initiated', {
        order_id: orderId,
        can_collect: orderDetails?.canCollect ?? true,
        block_reason: orderDetails?.blockReason ?? null,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      })
    }

    setShowEarlyCollectConfirm(true)
  }

  const handleSubmit = async (ignoreWarnings = false, bypassPayment = false, earlyPickup = false) => {
    const data = form.getValues()

    // Pre-submission order status check (unless bypassing payment)
    if (!bypassPayment) {
      console.log("🔄 [Dialog] Pre-submission order status check...")

      // Show that we're checking the order status
      toast.info("Checking latest order status before submission...")

      try {
        const refreshResult = await fetchOrderRoute(orderId)

        if (refreshResult.success) {
          const wasFullyPaid = paymentDetails?.isFullyPaid
          const isNowFullyPaid = refreshResult.data.payment.isFullyPaid

          // Update local state with latest order details
          setOrderDetails(refreshResult.data.order)
          setPaymentDetails(refreshResult.data.payment)
          setLastRefreshed(new Date())

          // If payment status changed to fully paid, show success message
          if (!wasFullyPaid && isNowFullyPaid) {
            toast.success("✅ Payment status updated - Order is now fully paid!")
          } else if (isNowFullyPaid) {
            toast.success("✅ Order status verified - Payment is complete, proceeding with submission")
          }

          // If still not fully paid and not bypassing, prevent submission
          if (!isNowFullyPaid) {
            toast.error(`❌ Payment incomplete: ${formatAmount(refreshResult.data.payment.remainingAmountCents)} remaining. Please complete payment or use bypass option.`)

            // Log prevented submission due to payment
            if (typeof window !== 'undefined' && posthog) {
              posthog.capture('order_collection_submission_prevented_payment', {
                order_id: orderId,
                remaining_amount_cents: refreshResult.data.payment.remainingAmountCents,
                timestamp: new Date().toISOString()
              })
            }

            return
          }

          // Log pre-submission check success
          if (typeof window !== 'undefined' && posthog) {
            posthog.capture('order_collection_pre_submission_check_success', {
              order_id: orderId,
              payment_status_changed: wasFullyPaid !== isNowFullyPaid,
              is_fully_paid: isNowFullyPaid,
              timestamp: new Date().toISOString()
            })
          }
        } else {
          // If refresh failed, still allow submission with warning
          console.warn("🔄 [Dialog] Pre-submission check failed, proceeding anyway:", refreshResult.error)
          toast.warning("Unable to verify payment status, proceeding with submission...")
        }
      } catch (error) {
        console.warn("🔄 [Dialog] Pre-submission check error, proceeding anyway:", error)
        toast.warning("Unable to verify payment status, proceeding with submission...")
      }
    }

    if (!ignoreWarnings) {
      // Check each device's validation status
      const validationResults = await Promise.all(
        data.deviceIds.map(async (deviceId) => {
          const result = await checkDeviceStatus(deviceId)
          if (!result.success)
            return {
              deviceId,
              isValid: false,
              message: "Failed to validate device",
            }
          const validation = formatDeviceStatusResponse(result.data)
          return {
            deviceId,
            isValid: validation.isValid,
            message: validation.message,
          }
        })
      )

      const invalidDevices = validationResults.filter(
        (result) => !result.isValid
      )
      if (invalidDevices.length > 0) {
        const messages = invalidDevices
          .map((device) => device.message)
          .filter(Boolean)
          .join("\n")
        setWarningMessage(messages)
        setShowWarning(true)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const deviceIds = Object.values(data.deviceIds).map((value) =>
        value.toString()
      )

      console.log("📝 [Dialog] Submitting collection with options:", {
        orderId,
        deviceCount: deviceIds.length,
        bypassPayment,
        ignoreWarnings,
      })

      // Log submission attempt with bypass status
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_submission_attempt', {
          order_id: orderId,
          device_count: deviceIds.length,
          bypass_payment: bypassPayment,
          early_pickup: earlyPickup,
          ignore_warnings: ignoreWarnings,
          timestamp: new Date().toISOString()
        })
      }

      const result = await orderCollectRoute(orderId, deviceIds, bypassPayment, earlyPickup)

      if (result.success) {
        const successMessage = result.message ?? "Order submitted successfully"
        toast.success(successMessage)

        // Log successful submission
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('order_collection_submission_success', {
            order_id: orderId,
            device_count: deviceIds.length,
            bypass_payment: bypassPayment,
            early_pickup: earlyPickup,
            timestamp: new Date().toISOString()
          })
        }

        await revalidateOrders()
        await queryClient.invalidateQueries({ queryKey: ["orders"] })
        onOpenChange(false)
      } else {
        const errorMessage = result.message ?? "Failed to submit order"
        toast.error(errorMessage)

        // Log submission failures
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('order_collection_submission_failed', {
            order_id: orderId,
            device_count: deviceIds.length,
            bypass_payment: bypassPayment,
            early_pickup: earlyPickup,
            error_message: errorMessage,
            timestamp: new Date().toISOString(),
            severity: 'medium'
          })
        }
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      const errorMessage = "An unexpected error occurred"
      toast.error(errorMessage)

      // Log unexpected submission errors
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('order_collection_submission_unexpected_error', {
          order_id: orderId,
          bypass_payment: bypassPayment,
          early_pickup: earlyPickup,
          error_message: error instanceof Error ? error.message : errorMessage,
          error_name: error instanceof Error ? error.name : 'Unknown',
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }
    } finally {
      setIsSubmitting(false)
      setShowWarning(false)
      setShowBypassConfirm(false)
      setShowEarlyCollectConfirm(false)
    }
  }

  const onSubmit = async (_data: FormValues) => {
    await handleSubmit(false, false, isCollectEarly)
  }

  // Show loading state while fetching order details
  if (isFetchingOrder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Loading Order Details</DialogTitle>
            <DialogDescription>
              Fetching order information and payment status...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show error state if order fetch failed
  if (fetchError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Error Loading Order</DialogTitle>
            <DialogDescription>
              Unable to load order details for collection.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const formatAmount = (cents: number, currency: string = "EUR") => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>Click & Collect Order #{orderId}</DialogTitle>
          <DialogDescription>
                {paymentDetails?.isFullyPaid
                  ? "Complete the collection by assigning device IDs."
                  : "Process payment and complete collection."}
          </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDebugPaymentStatus}
                disabled={isDebuggingPayment || isFetchingOrder}
                className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700"
                title="Debug payment status (Admin)"
              >
                {isDebuggingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Debug
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshOrder}
                disabled={isRefreshingOrder || isFetchingOrder}
                className="flex items-center gap-2 text-sm"
                title="Refresh order details and payment status"
              >
                {isRefreshingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Payment Status Banner */}
        {paymentDetails && (
          <div className="space-y-2">
            <div className={`flex items-center justify-between gap-2 p-3 rounded-lg ${
              paymentDetails.isFullyPaid
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                {paymentDetails.isFullyPaid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <div className="space-y-1">
                  <span className="text-sm font-medium">
                    {paymentDetails.isFullyPaid
                      ? "Payment Complete"
                      : `Outstanding: ${formatAmount(paymentDetails.remainingAmountCents)}`}
                  </span>
                  {orderDetails?.canCollect === false && (
                    <div className="text-xs">
                      Reason: {resolveBlockReasonText(orderDetails.blockReason) ?? 'Collection is currently unavailable'}
                    </div>
                  )}
                  <div className="text-xs opacity-80">
                    Invoice: {paymentDetails.invoiceId} | Status: {paymentDetails.invoiceStatus}
                    {paymentDetails.paymentIntentId && ` | PI: ${paymentDetails.paymentIntentId}`}
                  </div>
                </div>
              </div>
              {lastRefreshed && (
                <span className="text-xs opacity-70">
                  Updated {new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }).format(lastRefreshed)}
                </span>
              )}
            </div>

            {/* Debug Results Display */}
            {debugResults && (
              <div className={`p-3 rounded-lg text-xs ${
                debugResults.success && (debugResults.hasBackendContradiction || debugResults.hasInconsistency)
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : debugResults.success && debugResults.hasSyncIssue
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : debugResults.success
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                <div className="font-medium mb-1">
                  🔍 Debug Analysis
                  {debugResults.success && debugResults.hasBackendContradiction && ' - 🚨 BACKEND CONTRADICTION'}
                  {debugResults.success && debugResults.hasInconsistency && ' - INCONSISTENCY DETECTED'}
                  {debugResults.success && debugResults.hasSyncIssue && !debugResults.hasBackendContradiction && ' - SYNC ISSUE DETECTED'}
                </div>
                {debugResults.success && debugResults.analysis && (
                  <div className="space-y-1">
                    <div>Backend reports: paid = {String(debugResults.analysis.reportedAsFullyPaid)}</div>
                    <div>Backend reports: remaining = €{debugResults.analysis.remainingAmountEuros}</div>
                    <div>Calculated: isFullyPaid = {String(debugResults.analysis.calculatedIsFullyPaid)}</div>
                    <div>Status consistent: {String(debugResults.analysis.isConsistent)}</div>

                    {debugResults.analysis.backendSyncIssue?.warningMessage && (
                      <div className={`p-2 rounded mt-2 ${
                        debugResults.hasBackendContradiction
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {debugResults.analysis.backendSyncIssue.warningMessage}
                      </div>
                    )}

                    {debugResults.hasBackendContradiction && (
                      <div className="bg-red-100 text-red-800 p-2 rounded mt-2 font-medium">
                        🚨 CRITICAL: Backend API returns contradictory data!<br/>
                        Cannot report paid=true with remaining balance {'>'}€0
                      </div>
                    )}

                    <div className="text-xs opacity-70 mt-1">
                      See console for full analysis. Invoice: {debugResults.analysis.invoiceId}
                    </div>
                  </div>
                )}
                {!debugResults.success && (
                  <div className="text-red-600">Debug failed: {debugResults.error}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Warning Alert for Device Validation */}
        {showWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Device Validation Warning</AlertTitle>
            <AlertDescription className="mt-2 whitespace-pre-line">
              {warningMessage}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleSubmit(true, false, isCollectEarly)}
                  disabled={isSubmitting}
                >
                  Continue Anyway
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowWarning(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Bypass Payment Confirmation */}
        {showBypassConfirm && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Confirm Payment Bypass</AlertTitle>
            <AlertDescription className="mt-2">
              You are about to submit this order without full payment.
              Outstanding amount: {paymentDetails && formatAmount(paymentDetails.remainingAmountCents)}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleSubmit(false, true, isCollectEarly)}
                  disabled={isSubmitting}
                >
                  Bypass Payment & Submit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBypassConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Early Collection Confirmation */}
        {showEarlyCollectConfirm && (
          <Alert variant="default" className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="size-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Confirm Early Collection</AlertTitle>
            <AlertDescription className="mt-2 text-yellow-700">
              You are about to collect this order before its scheduled collection time.
              {orderDetails?.blockReason && (
                <div className="mt-2 text-sm">
                  <strong>Reason:</strong> {orderDetails.blockReason}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    setIsCollectEarly(true)
                    setShowEarlyCollectConfirm(false)
                    setActiveTab("details")
                    toast.success("Early collection enabled - You can now proceed with collection")
                  }}
                  disabled={isSubmitting}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Enable Early Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEarlyCollectConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="payment"
              disabled={paymentDetails?.isFullyPaid}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2"
              disabled={!paymentDetails?.isFullyPaid}
              title={!paymentDetails?.isFullyPaid ? 'Complete payment to proceed' : undefined}
            >
              Device Assignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4">
            {paymentDetails && !paymentDetails.isFullyPaid && orderDetails && (
              <CardReaderPayment
                orderId={orderId}
                remainingAmountCents={paymentDetails.remainingAmountCents}
                currency="EUR"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}

            {/* Bypass Payment Section */}
            {paymentDetails && !paymentDetails.isFullyPaid && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Admin Override Options:
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBypassPayment}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Bypass Payment & Proceed
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Early Collection Warning */}
             {isCollectEarly && orderDetails?.canCollect === false && (
              <Alert variant="default" className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="size-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Early Collection Enabled</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  This order is being collected before its scheduled time.
                   {orderDetails?.blockReason && (
                    <div className="mt-1 text-sm">
                       <strong>Original reason:</strong> {resolveBlockReasonText(orderDetails.blockReason)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Collect Early Button (shown when canCollect is false) */}
             {orderDetails?.canCollect === false && !isCollectEarly && (
              <Alert variant="default" className="border-blue-200 bg-blue-50">
                <AlertTriangle className="size-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Collection Not Yet Available</AlertTitle>
                <AlertDescription className="text-blue-700">
                   {resolveBlockReasonText(orderDetails.blockReason) ?? 'This order is not yet available for collection.'}
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCollectEarly}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Collect Early
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {calculatedOrderPrice.orderItemPrices.map((orderItem, index) => (
                <div key={index} className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`deviceIds.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Device ID {index + 1}
                          {": "}
                          <ProductDetails
                            productId={orderItem.productId}
                            consumerCategoryId={orderItem.consumerCategoryId}
                            hasInsurance={
                              orderItem.insurancePrice?.bestPrice
                                ?.amountGross !== undefined &&
                              orderItem.insurancePrice.bestPrice.amountGross > 0
                            }
                          />
                        </FormLabel>
                        <FormControl>
                          <DeviceIdInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

                <DialogFooter className="gap-2">
                  {/* Show bypass option if payment not complete */}
                  {paymentDetails && !paymentDetails.isFullyPaid && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleBypassPayment}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Bypass Payment
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (!paymentDetails?.isFullyPaid) ||
                      (orderDetails?.canCollect === false && !isCollectEarly)
                    }
                    className="flex items-center gap-2"
                    title={
                      orderDetails?.canCollect === false && !isCollectEarly
                        ? (orderDetails?.blockReason ?? 'Collection is not yet available')
                        : undefined
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Submit Collection
                      </>
                    )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
