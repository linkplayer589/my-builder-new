"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle, Loader2, ArrowLeft, BatteryIcon, BatteryLowIcon, BatteryMediumIcon, BatteryWarningIcon, WifiIcon, WifiOffIcon } from "lucide-react"
import { toast } from "sonner"
import { type Order } from "@/db/schema"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ordersTableSwapPassApi } from "@/features/orders-table/orders-table-actions/orders-table-swap-pass-api/route"
import { ordersTableCreateSkipassApi } from "@/features/orders-table/orders-table-actions/orders-table-create-skipass-api/route"
import { ordersTableCancelSkipassApi } from "@/features/orders-table/orders-table-actions/orders-table-cancel-skipass-api/route"
import { SwapPassDeviceIdInput } from "./swap-pass-device-input"
import { useResort } from "@/features/resorts"
import { useDeviceValidation } from "@/features/create-new-order/create-new-order-hooks/useDeviceValidation"
import { dbFindOrdersByDeviceCode, type TOrderByDeviceResult } from "@/db/server-actions/order-actions/db-find-orders-by-device-code"
import { MythDialog } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog"

type TPassStatus = {
  onMyth: boolean | null
  skipassActive: boolean | null
  activePass: boolean | null
}

function StatusIndicator({ state, label }: { state: boolean | null; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background p-3.5 shadow-sm">
      <span className="text-sm font-medium">{label}</span>
      {state === true ? (
        <CheckCircle2 className="size-5 text-green-600" />
      ) : state === false ? (
        <XCircle className="size-5 text-red-600" />
      ) : (
        <HelpCircle className="size-5 text-muted-foreground" />
      )}
    </div>
  )
}

/**
 * Get appropriate battery icon based on level
 */
function getBatteryIcon(level: number) {
  const className = level >= 70 ? "text-green-500" : level >= 50 ? "text-amber-500" : level >= 20 ? "text-orange-500" : "text-red-500"
  const size = 16

  if (level >= 70) return <BatteryIcon className={className} style={{ width: size, height: size }} />
  if (level >= 50) return <BatteryMediumIcon className={className} style={{ width: size, height: size }} />
  if (level >= 20) return <BatteryLowIcon className={className} style={{ width: size, height: size }} />
  return <BatteryWarningIcon className={className} style={{ width: size, height: size }} />
}

/**
 * Hook to find orders containing a specific device code
 */
function useDeviceAllocation(deviceCode: string) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [allocatedOrders, setAllocatedOrders] = React.useState<TOrderByDeviceResult[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!deviceCode || deviceCode.length < 3) {
      setAllocatedOrders([])
      return
    }

    const fetchAllocation = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const orders = await dbFindOrdersByDeviceCode(deviceCode)
        setAllocatedOrders(orders)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check allocation")
        setAllocatedOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => void fetchAllocation(), 600)
    return () => clearTimeout(timeoutId)
  }, [deviceCode])

  return { isLoading, allocatedOrders, error }
}

/**
 * Device status card showing live device info from API
 */
function DeviceStatusCard({
  deviceCode,
  isLoading,
  validationResult,
  error,
  allocatedOrders,
  allocationLoading,
  currentOrderId,
  onViewMythOrder,
}: {
  deviceCode: string
  isLoading: boolean
  validationResult: ReturnType<typeof useDeviceValidation>["validationResult"]
  error: string | null
  allocatedOrders?: TOrderByDeviceResult[]
  allocationLoading?: boolean
  currentOrderId?: number
  onViewMythOrder?: (order: TOrderByDeviceResult) => void
}) {
  if (!deviceCode) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Checking device status...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30">
        <XCircle className="size-4" />
        <span>{error}</span>
      </div>
    )
  }

  if (!validationResult) return null

  const { deviceData, criteria } = validationResult

  // Filter out current order AND orders where device is not actually allocated (returned)
  // Only show orders where deviceInfo exists AND deviceAllocated is true
  const otherAllocatedOrders = allocatedOrders?.filter(
    o => o.id !== currentOrderId && o.deviceInfo?.deviceAllocated === true
  ) ?? []

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      {/* Header with device code and connection status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Device Status</span>
        <div className="flex items-center gap-2">
          {deviceData.connected ? (
            <WifiIcon className="size-4 text-green-500" />
          ) : (
            <WifiOffIcon className="size-4 text-gray-400" />
          )}
          <span className="flex items-center gap-1 text-xs">
            {getBatteryIcon(deviceData.battery)}
            <span className={deviceData.battery >= 50 ? "text-green-600" : deviceData.battery >= 20 ? "text-amber-600" : "text-red-600"}>
              {deviceData.battery}%
            </span>
          </span>
        </div>
      </div>

      {/* Status rows */}
      <div className="grid gap-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Allocated</span>
          <div className="flex items-center gap-1.5">
            {allocationLoading ? (
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
            ) : criteria.isNotAllocated.passed ? (
              <>
                <span className="text-green-600">Available</span>
                <CheckCircle2 className="size-4 text-green-600" />
              </>
            ) : (
              <>
                <span className="text-red-600">In Use</span>
                <XCircle className="size-4 text-red-600" />
              </>
            )}
          </div>
        </div>

        {/* Warning if device is allocated (live API) but not found in any of our orders */}
        {!criteria.isNotAllocated.passed && otherAllocatedOrders.length === 0 && (
          <div className="rounded-md border border-red-300 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
              <XCircle className="size-3" />
              Device allocated outside our system
            </div>
            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
              This device is marked as &quot;In Use&quot; in Myth but no matching order was found in our database.
              It may be allocated to an order created directly in Myth or from another system.
            </p>
          </div>
        )}

        {/* Show where the device is allocated */}
        {otherAllocatedOrders.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3" />
                Found in {otherAllocatedOrders.length} order{otherAllocatedOrders.length > 1 ? "s" : ""}
              </div>
              <span className="text-[9px] italic text-muted-foreground">
                (click to verify live status)
              </span>
            </div>
            <div className="space-y-2">
              {otherAllocatedOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="rounded border border-amber-300/50 bg-white/50 p-1.5 dark:bg-black/20"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onViewMythOrder?.(order)}
                      className="font-mono text-xs font-bold text-blue-600 underline decoration-dotted hover:text-blue-800 hover:decoration-solid dark:text-blue-400 dark:hover:text-blue-300"
                      disabled={!order.mythOrderSubmissionData}
                      title={order.mythOrderSubmissionData ? "Click to view live Myth details" : "No Myth data available"}
                    >
                      Order #{order.id} →
                    </button>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="h-4 px-1 text-[10px] font-normal"
                      >
                        {order.orderStatus}
                      </Badge>
                      {order.deviceInfo?.deviceAllocated ? (
                        <Badge
                          variant="outline"
                          className="h-4 border-amber-500 bg-amber-100 px-1 text-[10px] font-normal text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          title="Status from stored data - click order to verify"
                        >
                          Allocated?
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal text-green-600">
                          Returned
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Order details */}
                  <div className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-muted-foreground">
                    {order.mythFrom && order.mythTo && (
                      <span>
                        {new Date(order.mythFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        {" → "}
                        {new Date(order.mythTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                    {order.clientEmail && (
                      <span className="truncate text-right">
                        {order.clientEmail}
                      </span>
                    )}
                  </div>
                  {order.mythOrderId && (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      Myth: {order.mythOrderId}
                    </div>
                  )}
                </div>
              ))}
              {otherAllocatedOrders.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{otherAllocatedOrders.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">DTA Code</span>
          <span className={`font-mono text-xs ${criteria.hasDtaCode.passed ? "text-foreground" : "text-red-600"}`}>
            {deviceData.dtaCode || "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Seen</span>
          <span className="text-xs">{criteria.hasRecentConnection.value}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Extract the most useful error message from Myth swap API response
 * Prioritizes the detailed error message from the nested response object
 */
function formatMythSwapError(data: unknown): { summary: string; detail: string | null } {
  if (!data || typeof data !== "object") return { summary: "Unknown error", detail: null }

  const root = data as Record<string, unknown>
  const error = root["error"]
  const message = root["message"]
  const details = root["details"] as Record<string, unknown> | undefined

  // Try to get the detailed error from the nested response
  let detailMessage: string | null = null
  if (details && typeof details === "object") {
    const response = details["response"] as Record<string, unknown> | undefined
    if (response && typeof response === "object") {
      const detail = response["detail"]
      if (typeof detail === "string") {
        detailMessage = detail
      }
    }
  }

  // Build summary
  const parts: string[] = []
  if (typeof error === "string") parts.push(error.replace(/_/g, " "))
  if (typeof message === "string" && message !== "Bad Request") parts.push(message)

  const summary = parts.length ? parts.join(": ") : "Unknown error"

  return { summary, detail: detailMessage }
}

interface SwapPassProcessProps {
  order: Order
  oldPassId: string
  onBack: () => void
}

export function SwapPassProcess({ order, oldPassId, onBack }: SwapPassProcessProps) {
  const { resort } = useResort()
  const activeResortId = typeof resort?.id === "number" ? resort.id : order.resortId
  const [newPassId, setNewPassId] = React.useState("")
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | "complete">(1)

  // Find the device to get the displayable deviceCode (6-digit code)
  const oldDevice = order.mythOrderSubmissionData?.devices?.find(d => d.deviceId === oldPassId)
  const oldPassDisplayCode = oldDevice?.deviceCode || oldPassId

  // Device validation for both old and new passes
  const oldDeviceValidation = useDeviceValidation(oldPassDisplayCode)
  const newDeviceValidation = useDeviceValidation(newPassId)

  // Check where devices are allocated in our database
  const oldDeviceAllocation = useDeviceAllocation(oldPassDisplayCode)
  const newDeviceAllocation = useDeviceAllocation(newPassId)

  // State for viewing Myth order details from the "Found in orders" section
  const [selectedMythOrder, setSelectedMythOrder] = React.useState<TOrderByDeviceResult | null>(null)
  const [isMythDialogOpen, setIsMythDialogOpen] = React.useState(false)

  const handleViewMythOrder = React.useCallback((orderResult: TOrderByDeviceResult) => {
    if (orderResult.mythOrderSubmissionData) {
      setSelectedMythOrder(orderResult)
      setIsMythDialogOpen(true)
    }
  }, [])

  const [oldStatus, setOldStatus] = React.useState<TPassStatus>({
    onMyth: null,
    skipassActive: null,
    activePass: null,
  })
  const [newStatus, setNewStatus] = React.useState<TPassStatus>({
    onMyth: null,
    skipassActive: null,
    activePass: null,
  })

  const [isProcessing, setIsProcessing] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [errorDetails, setErrorDetails] = React.useState<Record<string, unknown> | null>(null)

  const formatDate = (date: Date | null) => {
    if (!date) return "No date"
    return new Date(date).toLocaleDateString()
  }

  const formatPrice = (order: Order) => {
    if (!order.calculatedOrderPrice) return "No price"
    const totalPrice = order.calculatedOrderPrice.cumulatedPrice?.bestPrice?.amountGross
    if (totalPrice === undefined) return "No price"
    return `$${totalPrice.toFixed(2)}`
  }

  /** Step 1: Swap on Myth system */
  const handleStep1 = async () => {
    if (!newPassId) {
      toast.error("Please enter a new pass ID")
      return
    }

    setIsProcessing(true)
    setErrorMsg(null)
    setErrorDetails(null)

    try {
      // Use the 6-digit deviceCode (not the hex deviceId) for the API call
      const result = await ordersTableSwapPassApi(
        order.id,
        oldPassDisplayCode,
        newPassId,
        activeResortId,
        false
      )

      if (result.success) {
        toast.success("✓ Pass swapped on Myth")
        setOldStatus({ onMyth: false, skipassActive: null, activePass: false })
        setNewStatus({ onMyth: true, skipassActive: null, activePass: true })
        setCurrentStep(2)
      } else {
        const { summary, detail } = formatMythSwapError(result.data)
        // Show the detailed error message if available, otherwise the summary
        const displayError = detail || summary
        setErrorMsg(displayError)
        try {
          const obj = result.data as unknown as Record<string, unknown>
          if (obj && typeof obj === 'object') setErrorDetails(obj)
        } catch {}
        toast.error("Myth swap failed", { description: displayError })
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Unknown error"
      setErrorMsg(errorText)
      toast.error("Myth swap failed", { description: errorText })
    } finally {
      setIsProcessing(false)
    }
  }

  /** Step 2: Create new skipass */
  const handleStep2 = async () => {
    setIsProcessing(true)
    setErrorMsg(null)

    try {
      // Use the 6-digit deviceCode (not the hex deviceId) for the API call
      const result = await ordersTableCreateSkipassApi(order.id, oldPassDisplayCode, newPassId)

      if (result.success) {
        toast.success("✓ New skipass created")
        setNewStatus(prev => ({ ...prev, skipassActive: true }))
        setCurrentStep(3)
      } else {
        toast.error(result.message ?? "Failed to create skipass")
        setErrorMsg(result.message ?? "Failed to create skipass")
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Unknown error"
      setErrorMsg(errorText)
      toast.error("Failed to create skipass", { description: errorText })
    } finally {
      setIsProcessing(false)
    }
  }

  /** Step 3: Cancel old skipass */
  const handleStep3 = async () => {
    setIsProcessing(true)
    setErrorMsg(null)

    try {
      // Use the 6-digit deviceCode (not the hex deviceId) for the API call
      const result = await ordersTableCancelSkipassApi(
        Number(order.id),
        Number(oldPassDisplayCode)
      )

      if (result.success) {
        toast.success("✓ Old skipass cancelled")
        setOldStatus(prev => ({ ...prev, skipassActive: false }))
        setCurrentStep("complete")
      } else {
        toast.error(result.message ?? "Failed to cancel old skipass")
        setErrorMsg(result.message ?? "Failed to cancel old skipass")
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Unknown error"
      setErrorMsg(errorText)
      toast.error("Failed to cancel old skipass", { description: errorText })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStepAction = () => {
    if (currentStep === 1) return handleStep1
    if (currentStep === 2) return handleStep2
    if (currentStep === 3) return handleStep3
    return () => {}
  }

  const getStepText = () => {
    if (currentStep === 1) return "Swap on Myth"
    if (currentStep === 2) return "Create New Skipass"
    if (currentStep === 3) return "Cancel Old Skipass"
    return "Complete"
  }

  const canProceed = () => {
    if (currentStep === 1) return newPassId.length > 0
    return true
  }

  return (
    <div className="space-y-5 pb-6 sm:space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-sm sm:text-base"
      >
        <ArrowLeft className="size-4 sm:size-5" />
        Back to Results
      </Button>

      {/* Order Info Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 sm:pb-4">
          <CardTitle className="text-base font-bold sm:text-lg">
            Order #{order.id}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {order.clientDetails?.name || "No name"} • {formatDate(order.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5 text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Order Status:</span>
            <Badge variant="secondary" className="text-xs capitalize sm:text-sm">
              {order.orderStatus || "N/A"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant="outline" className="text-xs capitalize sm:text-sm">
              {order.paymentStatus || "N/A"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-bold">{formatPrice(order)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Channel:</span>
            <span className="capitalize">{order.salesChannel}</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between px-2 py-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors sm:size-11 ${
                  currentStep === "complete" || (typeof currentStep === "number" && step < currentStep)
                    ? "border-green-600 bg-green-600 text-white"
                    : currentStep === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                {currentStep === "complete" || (typeof currentStep === "number" && step < currentStep) ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  step
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {step === 1 ? "Myth" : step === 2 ? "Create" : "Cancel"}
              </span>
            </div>
            {step < 3 && (
              <div
                className={`h-0.5 flex-1 transition-colors ${
                  currentStep === "complete" || (typeof currentStep === "number" && step < currentStep)
                    ? "bg-green-600"
                    : "bg-muted-foreground/30"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Pass IDs - Stacked with Arrow */}
      <div className="space-y-4">
        {/* Old Pass */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold sm:text-lg">Old Pass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <span className="font-mono text-lg font-bold sm:text-base">{oldPassDisplayCode}</span>
            </div>
            <DeviceStatusCard
              deviceCode={oldPassDisplayCode}
              isLoading={oldDeviceValidation.isLoading}
              validationResult={oldDeviceValidation.validationResult}
              error={oldDeviceValidation.error}
              allocatedOrders={oldDeviceAllocation.allocatedOrders}
              allocationLoading={oldDeviceAllocation.isLoading}
              currentOrderId={order.id}
              onViewMythOrder={handleViewMythOrder}
            />
            <StatusIndicator state={oldStatus.onMyth} label="On Myth" />
            <StatusIndicator state={oldStatus.skipassActive} label="Skipass Active" />
            <StatusIndicator state={oldStatus.activePass} label="Active Pass" />
          </CardContent>
        </Card>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-muted-foreground">→</div>
            <div className="text-xs font-medium text-muted-foreground">Swap</div>
          </div>
        </div>

        {/* New Pass */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold sm:text-lg">New Pass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentStep === 1 ? (
              <div className="space-y-2">
                <Label htmlFor="newPassId" className="text-sm font-semibold">
                  Enter New Pass ID
                </Label>
                <SwapPassDeviceIdInput
                  index={0}
                  value={newPassId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassId(e.target.value)}
                  onBlur={() => {}}
                  ref={() => {}}
                  name="newPassId"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-center">
                <span className="font-mono text-lg font-bold sm:text-base">{newPassId}</span>
              </div>
            )}
            {newPassId && (
              <DeviceStatusCard
                deviceCode={newPassId}
                isLoading={newDeviceValidation.isLoading}
                validationResult={newDeviceValidation.validationResult}
                error={newDeviceValidation.error}
                allocatedOrders={newDeviceAllocation.allocatedOrders}
                allocationLoading={newDeviceAllocation.isLoading}
                currentOrderId={order.id}
                onViewMythOrder={handleViewMythOrder}
              />
            )}
            <StatusIndicator state={newStatus.onMyth} label="On Myth" />
            <StatusIndicator state={newStatus.skipassActive} label="Skipass Active" />
            <StatusIndicator state={newStatus.activePass} label="Active Pass" />
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive" className="border-2 border-red-500">
          <AlertTriangle className="size-5" />
          <div className="ml-2">
            <div className="font-semibold">Swap Failed</div>
            <AlertDescription className="mt-1 text-sm font-medium">{errorMsg}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Error Details (collapsible) */}
      {errorDetails && (
        <details className="rounded-md border bg-muted/30">
          <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
            Show technical details
          </summary>
          <div className="overflow-auto border-t p-2 text-xs">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(errorDetails, null, 2)}</pre>
          </div>
        </details>
      )}

      {/* Warning Alert */}
      <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertTriangle className="size-4 text-yellow-600" />
        <AlertDescription className="text-xs text-yellow-900 dark:text-yellow-100">
          If the device has been used at the gate, cancellation may not be possible and could require transfer at the desk.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      {currentStep !== "complete" ? (
        <div className="space-y-3 pt-2">
          <Button
            className="h-12 w-full text-base font-semibold sm:h-11"
            size="lg"
            onClick={getStepAction()}
            disabled={!canProceed() || isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 size-5 animate-spin" />}
            Step {currentStep}: {getStepText()}
          </Button>

          {typeof currentStep === "number" && currentStep > 1 && (
            <p className="text-center text-sm text-muted-foreground">
              Step {currentStep - 1} completed successfully
            </p>
          )}
        </div>
      ) : (
        <Card className="border-green-500/50 bg-green-50 shadow-md dark:bg-green-950/20">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="size-16 text-green-600" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Swap Complete!</h3>
              <p className="mt-2 text-base text-green-700 dark:text-green-300">
                Pass has been successfully swapped
              </p>
            </div>
            <Button className="mt-2 h-12 w-full px-8 text-base" onClick={onBack} size="lg">
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Myth Dialog for viewing order details from "Found in orders" section */}
      {selectedMythOrder?.mythOrderSubmissionData && (
        <MythDialog
          mythOrderSubmissionData={selectedMythOrder.mythOrderSubmissionData}
          open={isMythDialogOpen}
          onOpenChange={setIsMythDialogOpen}
        />
      )}
    </div>
  )
}

