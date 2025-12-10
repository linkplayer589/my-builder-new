"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useResort } from "@/features/resorts"
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

import { _toLocalDateString } from "@/lib/date-functions"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { type OrderDataType } from "./create-new-order-sheet"
import { type CalculatedOrderPriceReturn } from "../create-new-order-actions/calculate-order-price/types"
import { createOrderIntent } from "../create-new-order-actions/create-order-intent/handler"
import { type Catalog, type Product } from "../create-new-order-actions/get-products/types"
import { useCashDeskTerminalPayment, type TTerminalPaymentStatus } from "../create-new-order-hooks/useCashDeskTerminalPayment"

type Props = {
  orderId: number | undefined
  setOrderId: React.Dispatch<React.SetStateAction<number | undefined>>
  calculatedOrderPrice: CalculatedOrderPriceReturn | null
  orderData: OrderDataType | undefined
  catalog?: Catalog
  prevPage: () => void
  nextPage: () => void
  bypassPayment?: boolean
  setBypassPayment?: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Tracks order creation state to prevent duplicate order creation.
 * IMPORTANT: This is keyed by a hash of the order data to ensure
 * a new order is created for each unique order flow.
 */
const orderCreationTracker = {
  isCreating: false,
  orderId: undefined as number | undefined,
  orderDataHash: undefined as string | undefined,
}

/**
 * Generate a simple hash of order data to detect new order flows
 */
function generateOrderDataHash(orderData: OrderDataType | undefined): string | undefined {
  if (!orderData) return undefined
  // Create a hash based on devices and start date to uniquely identify this order
  const deviceIds = orderData.devices.map(d => d.deviceId).sort().join(",")
  const startDate = orderData.startDate.toISOString()
  return `${orderData.resortId}-${startDate}-${deviceIds}`
}

/**
 * Generate a unique component instance ID for logging
 */
function generateComponentId(): string {
  return `payment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

/**
 * Log IDs summary for debugging payment flow
 */
function logPaymentFlowIds(
  componentId: string,
  context: string,
  ids: {
    orderId?: number
    invoiceId?: string
    paymentIntentId?: string
    terminalId?: string
    orderDataHash?: string
  }
) {
  console.log(`🔗 [${componentId}] ${context}:`)
  console.log(`   ├─ Order ID: ${ids.orderId ?? "(not set)"}`)
  console.log(`   ├─ Invoice ID: ${ids.invoiceId ?? "(not set)"}`)
  console.log(`   ├─ PaymentIntent ID: ${ids.paymentIntentId ?? "(not set)"}`)
  console.log(`   ├─ Terminal ID: ${ids.terminalId ?? "(not set)"}`)
  console.log(`   └─ Order Hash: ${ids.orderDataHash?.substring(0, 30) ?? "(not set)"}...`)
}

/**
 * Get user-friendly status message for the current payment state
 */
function getStatusMessage(status: TTerminalPaymentStatus, pollAttempts?: number, maxPollAttempts?: number): string {
  switch (status) {
    case "idle":
      return "Initializing payment..."
    case "creating":
      return "Creating payment on terminal..."
    case "processing":
      return "Please present your card on the terminal"
    case "polling":
      if (pollAttempts !== undefined && maxPollAttempts !== undefined) {
        return `Waiting for payment confirmation... (${pollAttempts}/${maxPollAttempts})`
      }
      return "Waiting for payment confirmation..."
    case "succeeded":
      return "Payment successful!"
    case "failed":
      return "Payment failed"
    case "timeout":
      return "Payment verification timed out"
    case "canceled":
      return "Payment was canceled"
    default:
      return "Processing..."
  }
}

/**
 * Get status icon for the current payment state
 */
function getStatusIcon(status: TTerminalPaymentStatus) {
  switch (status) {
    case "succeeded":
      return <CheckCircle className="size-12 text-green-500" />
    case "failed":
    case "timeout":
    case "canceled":
      return <AlertCircle className="size-12 text-red-500" />
    case "processing":
      return <CreditCard className="size-12 animate-pulse text-primary" />
    default:
      return <Loader2 className="size-12 animate-spin text-primary" />
  }
}

export function OrderPayment({
  orderId,
  setOrderId,
  calculatedOrderPrice,
  orderData,
  catalog,
  prevPage,
  nextPage,
  bypassPayment = false,
  setBypassPayment,
}: Props) {
  const { resortId, selectedCardReader, cardReadersResponse } = useResort()
  const selectedTerminalId = selectedCardReader?.id

  const {
    state: paymentState,
    createPayment,
    pollPaymentStatus,
    retryPayment,
    cancel,
    reset: resetPaymentState,
  } = useCashDeskTerminalPayment()

  const [retryAttempts, setRetryAttempts] = useState(0)
  const processRef = useRef({
    mounted: false,
    isProcessing: false,
    hasStartedPayment: false,
    paymentInProgress: false, // Track if payment flow is active
  })

  // Component instance ID for logging
  const componentIdRef = useRef(generateComponentId())
  const componentId = componentIdRef.current

  // Log component mount with all relevant IDs
  React.useEffect(() => {
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`📱 [${componentId}] OrderPayment MOUNTED`)
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
    logPaymentFlowIds(componentId, "Initial Props", {
      orderId,
      terminalId: selectedTerminalId,
      orderDataHash: generateOrderDataHash(orderData),
    })
    console.log(`📦 Order Data Present: ${!!orderData}`)
    console.log(`💰 Calculated Price Present: ${!!calculatedOrderPrice}`)
    console.log(`🔄 Bypass Payment: ${bypassPayment}`)
    console.log("═══════════════════════════════════════════════════════════════")

    return () => {
      console.log(`📱 [${componentId}] OrderPayment UNMOUNTED`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Validate required data - but DON'T navigate away during payment
  useEffect(() => {
    // Skip validation if payment is already in progress to prevent race condition
    if (processRef.current.paymentInProgress) {
      console.log("⚠️ Skipping validation - payment in progress")
      return
    }

    if (!calculatedOrderPrice || !orderData) {
      console.log("Missing required data:", { calculatedOrderPrice, orderData })
      prevPage()
    }
  }, [calculatedOrderPrice, orderData, prevPage])

  // Generate hash for current order data to detect new orders
  const currentOrderHash = React.useMemo(
    () => generateOrderDataHash(orderData),
    [orderData]
  )

  // Helper to generate order payload
  const getOrderPayload = useCallback(() => {
    if (!orderData) return null
    return {
      resortId: orderData.resortId,
      startDate: _toLocalDateString(orderData.startDate),
      products: orderData.devices.map((device) => ({
        deviceId: device.deviceId,
        productId: device.productId,
        consumerCategoryId: device.consumerCategoryId,
        insurance: device.insurance,
      })),
    }
  }, [orderData])

  /**
   * Create order intent and initiate terminal payment
   */
  const createOrderAndPayment = useCallback(async () => {
    // Mark payment as in progress to prevent validation race condition
    processRef.current.paymentInProgress = true

    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`🚀 [${componentId}] createOrderAndPayment STARTED`)
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`)

    // Check if this is a new order (different hash)
    const isNewOrder = currentOrderHash !== orderCreationTracker.orderDataHash

    console.log(`📊 Order State Check:`)
    console.log(`   ├─ Current Order Hash: ${currentOrderHash?.substring(0, 30)}...`)
    console.log(`   ├─ Tracked Order Hash: ${orderCreationTracker.orderDataHash?.substring(0, 30) || "(none)"}...`)
    console.log(`   ├─ Is New Order: ${isNewOrder}`)
    console.log(`   ├─ Tracker Creating: ${orderCreationTracker.isCreating}`)
    console.log(`   └─ Tracked Order ID: ${orderCreationTracker.orderId || "(none)"}`)

    if (isNewOrder) {
      // Reset tracker for new order
      console.log(`🔄 [${componentId}] NEW ORDER DETECTED - Resetting tracker`)
      orderCreationTracker.isCreating = false
      orderCreationTracker.orderId = undefined
      orderCreationTracker.orderDataHash = currentOrderHash
      resetPaymentState()
    }

    // Check global tracker first
    if (orderCreationTracker.isCreating) {
      console.log(`⏳ [${componentId}] Order creation ALREADY IN PROGRESS - skipping`)
      return
    }

    // If we already have an orderId for THIS order, skip order creation
    let currentOrderId = orderId
    if (orderCreationTracker.orderId && !isNewOrder) {
      console.log(`✅ [${componentId}] Using EXISTING orderId: ${orderCreationTracker.orderId}`)
      currentOrderId = orderCreationTracker.orderId
      setOrderId(orderCreationTracker.orderId)
    } else {
      // Create the order intent
      orderCreationTracker.isCreating = true

      try {
        const payload = getOrderPayload()
        if (!payload) {
          console.error(`❌ [${componentId}] No payload available for order creation`)
          processRef.current.paymentInProgress = false
          return
        }

        console.log(`📝 [${componentId}] Creating order intent...`)
        console.log(`   ├─ Resort ID: ${payload.resortId}`)
        console.log(`   ├─ Start Date: ${payload.startDate}`)
        console.log(`   └─ Products: ${payload.products.length}`)

        const orderResult = await createOrderIntent(payload)

        if (!orderResult.success) {
          console.error(`❌ [${componentId}] Failed to create order intent:`, orderResult.error)
          processRef.current.paymentInProgress = false
          return
        }

        const newOrderId = Number(orderResult.data.id)
        console.log("═══════════════════════════════════════════════════════════════")
        console.log(`✅ [${componentId}] ORDER INTENT CREATED`)
        console.log(`   └─ NEW Order ID: ${newOrderId}`)
        console.log("═══════════════════════════════════════════════════════════════")

        orderCreationTracker.orderId = newOrderId
        orderCreationTracker.orderDataHash = currentOrderHash
        setOrderId(newOrderId)
        currentOrderId = newOrderId
      } finally {
        orderCreationTracker.isCreating = false
      }
    }

    // Handle bypass payment
    if (bypassPayment) {
      console.log(`🔄 [${componentId}] BYPASS PAYMENT enabled - proceeding to submission`)
      console.log(`   └─ Order ID: ${currentOrderId}`)
      nextPage()
      return
    }

    // Check if terminal is available
    if (!selectedTerminalId || !calculatedOrderPrice || !orderData || !currentOrderId) {
      console.log(`⚠️ [${componentId}] MISSING REQUIRED DATA for terminal payment:`)
      console.log(`   ├─ Terminal ID: ${selectedTerminalId || "❌ MISSING"}`)
      console.log(`   ├─ Calculated Price: ${calculatedOrderPrice ? "✅" : "❌ MISSING"}`)
      console.log(`   ├─ Order Data: ${orderData ? "✅" : "❌ MISSING"}`)
      console.log(`   └─ Order ID: ${currentOrderId || "❌ MISSING"}`)
      processRef.current.paymentInProgress = false
      return
    }

    // Build selectedProducts from catalog for invoice line items
    const selectedProducts = catalog?.products
      .filter((product: Product) =>
        orderData.devices.some((device) => device.productId === product.id)
      )
      .map((product: Product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        priceCategories: product.priceCategories?.map((pc) => ({
          consumerCategoryId: pc.consumerCategoryId,
          consumerCategoryData: pc.consumerCategoryData,
        })),
        validityCategory: product.validityCategory,
      }))

    // Create terminal payment
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`💳 [${componentId}] CREATING TERMINAL PAYMENT`)
    console.log("═══════════════════════════════════════════════════════════════")
    logPaymentFlowIds(componentId, "BEFORE createPayment", {
      orderId: currentOrderId,
      terminalId: selectedTerminalId,
      orderDataHash: currentOrderHash,
    })

    const paymentResult = await createPayment({
      terminalId: selectedTerminalId,
      resortId: orderData.resortId,
      orderId: currentOrderId,
      startDate: _toLocalDateString(orderData.startDate),
      telephone: orderData.telephone,
      name: orderData.name,
      email: orderData.email || undefined,
      languageCode: orderData.languageCode,
      devices: orderData.devices.map((device) => ({
        productId: device.productId,
        consumerCategoryId: device.consumerCategoryId,
        insurance: device.insurance,
      })),
      selectedProducts,
    })

    if (!paymentResult.success || !paymentResult.invoiceId) {
      console.error(`❌ [${componentId}] Failed to create terminal payment:`, paymentResult.error)
      processRef.current.paymentInProgress = false
      return
    }

    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`✅ [${componentId}] TERMINAL PAYMENT CREATED`)
    console.log("═══════════════════════════════════════════════════════════════")
    logPaymentFlowIds(componentId, "AFTER createPayment", {
      orderId: currentOrderId,
      invoiceId: paymentResult.invoiceId,
      paymentIntentId: paymentResult.paymentIntentId,
      terminalId: selectedTerminalId,
    })
    console.log(`💰 Amount: ${paymentResult.totalAmount} cents (${((paymentResult.totalAmount || 0) / 100).toFixed(2)} ${paymentResult.currency?.toUpperCase()})`)
    console.log("═══════════════════════════════════════════════════════════════")

    // Start polling for payment status
    console.log(`🔄 [${componentId}] Starting payment status polling...`)
    console.log(`   ├─ Invoice ID to poll: ${paymentResult.invoiceId}`)
    console.log(`   ├─ Resort ID: ${orderData.resortId}`)
    console.log(`   ├─ Max attempts: 60`)
    console.log(`   └─ Interval: 2000ms (2 min total)`)

    const pollResult = await pollPaymentStatus(
      orderData.resortId,
      paymentResult.invoiceId,
      60, // max 60 attempts
      2000 // 2 seconds interval (total 2 minutes)
    )

    if (pollResult.success && pollResult.status === "succeeded") {
      console.log("═══════════════════════════════════════════════════════════════")
      console.log(`✅ [${componentId}] PAYMENT SUCCEEDED - Proceeding to submission`)
      console.log("═══════════════════════════════════════════════════════════════")
      logPaymentFlowIds(componentId, "PAYMENT SUCCESS", {
        orderId: currentOrderId,
        invoiceId: paymentResult.invoiceId,
        paymentIntentId: paymentResult.paymentIntentId,
        terminalId: selectedTerminalId,
      })
      processRef.current.paymentInProgress = false
      nextPage()
    } else {
      console.log(`⚠️ [${componentId}] Polling ended with status: ${pollResult.status}`)
      if (pollResult.error) {
        console.log(`   └─ Error: ${pollResult.error}`)
      }
      // Payment flow ended (failed/timeout) - allow cleanup
      processRef.current.paymentInProgress = false
    }
  }, [
    componentId,
    currentOrderHash,
    orderId,
    setOrderId,
    getOrderPayload,
    bypassPayment,
    selectedTerminalId,
    calculatedOrderPrice,
    orderData,
    catalog,
    createPayment,
    pollPaymentStatus,
    nextPage,
    resetPaymentState,
  ])

  // Cleanup on unmount - but DON'T cancel active terminal payments
  useEffect(() => {
    return () => {
      orderCreationTracker.isCreating = false
      // Only cancel if we're NOT in the middle of an active payment
      // This prevents race conditions where unmount cancels a terminal payment
      if (!processRef.current.paymentInProgress) {
        console.log("🧹 [Cleanup] Component unmounting, canceling idle payment state")
        cancel()
      } else {
        console.log("⚠️ [Cleanup] Component unmounting but payment in progress - NOT canceling")
      }
    }
  }, [cancel])

  // Initiate order creation if needed
  useEffect(() => {
    if (processRef.current.mounted) return
    processRef.current.mounted = true
    void createOrderAndPayment()
  }, [createOrderAndPayment])

  // Handle bypass payment state changes
  useEffect(() => {
    if (bypassPayment && paymentState.status !== "succeeded") {
      // Wait for orderId to be set before proceeding
      if (!orderId) {
        console.log("⏳ [Bypass] Waiting for order intent to be created...")
        return
      }
      console.log("✅ [Bypass] Order intent exists, proceeding with bypass", { orderId })
      nextPage()
    }
  }, [bypassPayment, paymentState.status, nextPage, orderId])

  /**
   * Handle retry payment
   */
  const handleRetryPayment = useCallback(async () => {
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`🔄 [${componentId}] RETRY PAYMENT REQUESTED`)
    console.log("═══════════════════════════════════════════════════════════════")
    console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
    console.log(`📊 Retry attempt: ${retryAttempts + 1}`)
    logPaymentFlowIds(componentId, "BEFORE retry", {
      orderId,
      invoiceId: paymentState.invoiceId,
      paymentIntentId: paymentState.paymentIntentId,
      terminalId: selectedTerminalId,
    })

    if (!orderId || !selectedTerminalId) {
      console.error(`❌ [${componentId}] Missing required data for retry:`)
      console.log(`   ├─ Order ID: ${orderId || "❌ MISSING"}`)
      console.log(`   └─ Terminal ID: ${selectedTerminalId || "❌ MISSING"}`)
      return
    }

    setRetryAttempts((prev) => prev + 1)

    const retryResult = await retryPayment({
      terminalId: selectedTerminalId,
      orderId,
      invoiceId: paymentState.invoiceId,
    })

    if (!retryResult.success) {
      console.error(`❌ [${componentId}] Retry FAILED:`, retryResult.error)
      return
    }

    console.log(`✅ [${componentId}] Retry initiated, starting polling...`)
    logPaymentFlowIds(componentId, "AFTER retry", {
      orderId,
      invoiceId: paymentState.invoiceId,
      paymentIntentId: retryResult.paymentIntentId,
      terminalId: selectedTerminalId,
    })

    // If retry succeeded, start polling again
    if (paymentState.invoiceId && orderData) {
      const pollResult = await pollPaymentStatus(
        orderData.resortId,
        paymentState.invoiceId,
        60,
        2000
      )

      if (pollResult.success && pollResult.status === "succeeded") {
        console.log(`✅ [${componentId}] Retry payment SUCCEEDED`)
        nextPage()
      }
    }
  }, [componentId, orderId, selectedTerminalId, retryAttempts, retryPayment, paymentState.invoiceId, paymentState.paymentIntentId, orderData, pollPaymentStatus, nextPage])

  // Show terminal warning but allow bypass payment
  const showTerminalWarning = !selectedTerminalId
  const hasApiKeyError =
    cardReadersResponse &&
    !cardReadersResponse.success &&
    cardReadersResponse.errorType === "api_key_invalid"

  // Calculate progress percentage for polling
  const progressPercentage = React.useMemo(() => {
    if (paymentState.status === "polling" && paymentState.pollAttempts !== undefined && paymentState.maxPollAttempts !== undefined) {
      return (paymentState.pollAttempts / paymentState.maxPollAttempts) * 100
    }
    if (paymentState.status === "succeeded") return 100
    if (paymentState.status === "creating") return 10
    if (paymentState.status === "processing") return 25
    return 0
  }, [paymentState])

  // Success state - proceed immediately
  if (paymentState.status === "succeeded") {
    return null
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      {/* Terminal Warning */}
      {showTerminalWarning && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircle className="size-4" />
          <AlertTitle>
            {hasApiKeyError
              ? "Payment Terminal Unavailable"
              : "No Payment Terminal Selected"}
          </AlertTitle>
          <AlertDescription>
            {hasApiKeyError
              ? "Invalid API key configured for this resort. Payment processing is currently unavailable."
              : "No payment terminal is available. You can bypass payment to continue."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Payment Status Display */}
      <div className="flex flex-col items-center gap-4 text-center">
        {getStatusIcon(paymentState.status)}

        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            {getStatusMessage(
              paymentState.status,
              paymentState.pollAttempts,
              paymentState.maxPollAttempts
            )}
          </h2>

          {paymentState.status === "processing" && (
            <p className="text-sm text-muted-foreground">
              The payment is being processed on the terminal
            </p>
          )}

          {paymentState.totalAmount && paymentState.currency && (
            <p className="text-lg font-medium text-primary">
              Amount: {paymentState.currency.toUpperCase()} {(paymentState.totalAmount / 100).toFixed(2)}
            </p>
          )}
        </div>

        {/* Progress Bar for polling */}
        {(paymentState.status === "polling" || paymentState.status === "processing" || paymentState.status === "creating") && (
          <div className="w-full max-w-xs">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Error Display */}
        {paymentState.error && (
          <Alert variant="destructive" className="max-w-sm">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{paymentState.error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {/* Bypass Payment Button */}
        {setBypassPayment && (
          paymentState.status === "idle" ||
          paymentState.status === "creating" ||
          paymentState.status === "processing" ||
          paymentState.status === "polling" ||
          paymentState.status === "failed" ||
          paymentState.status === "timeout"
        ) && (
          <Button
            onClick={() => setBypassPayment(!bypassPayment)}
            variant={bypassPayment ? "default" : "outline"}
            className="w-full"
          >
            {bypassPayment ? "✓ Payment Bypassed" : "Bypass Payment"}
          </Button>
        )}

        {/* Retry Button (for failed/timeout states) */}
        {(paymentState.status === "failed" || paymentState.status === "timeout") && selectedTerminalId && (
          <Button
            onClick={handleRetryPayment}
            disabled={retryAttempts >= 3}
            className="w-full"
          >
            <RefreshCw className="mr-2 size-4" />
            {retryAttempts > 0
              ? `Retry Payment (Attempt ${retryAttempts + 1})`
              : "Retry Payment"}
          </Button>
        )}

        {/* Cancel/Go Back Button */}
        <Button
          onClick={() => {
            cancel()
            prevPage()
          }}
          variant="outline"
          className="w-full"
        >
          {paymentState.status === "failed" || paymentState.status === "timeout"
            ? "Go Back"
            : "Cancel"}
        </Button>
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-xs text-muted-foreground text-left max-w-sm">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-[10px]">
              {JSON.stringify(
                {
                  orderId,
                  terminalId: selectedTerminalId,
                  paymentState: {
                    status: paymentState.status,
                    invoiceId: paymentState.invoiceId,
                    paymentIntentId: paymentState.paymentIntentId,
                    pollAttempts: paymentState.pollAttempts,
                  },
                  retryAttempts,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
