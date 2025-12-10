"use client"

import React from "react"
import type { ZodIssue } from "zod"
import { AlertCircle, ChevronDown, ExternalLink, PlusCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { type OrderDataType } from "./create-new-order-sheet"
import { retrieveOrder } from "../create-new-order-actions/retrieve-order/handler"
import { submitOrder, type SubmitOrderError } from "../create-new-order-actions/submit-order/handler"
import { createOrderIntent } from "../create-new-order-actions/create-order-intent/handler"
import { _toLocalDateString } from "@/lib/date-functions"
import { dbGetSessionById, type SessionById } from "@/features/sessions/session-actions/db-get-session-by-id"
import { SessionLogsPanel } from "@/features/sessions/session-components/session-logs-panel"
import type { JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"

type Props = {
  orderData: OrderDataType | undefined
  orderId: number | undefined
  setOrderId?: React.Dispatch<React.SetStateAction<number | undefined>>
  resortId: number
  bypassPayment?: boolean
}

export function OrderSubmission({ orderData, orderId, setOrderId, resortId, bypassPayment = false }: Props) {
  const [orderSubmitted, setOrderSubmitted] = React.useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = React.useState(false)
  const [submissionError, setSubmissionError] = React.useState<SubmitOrderError | null>(
    null
  )
  const [validationErrors, setValidationErrors] = React.useState<
    ZodIssue[] | null
  >(null)
  const [retryCount, setRetryCount] = React.useState(0)
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)
  const [errorDetailsOpen, setErrorDetailsOpen] = React.useState(false)
  const [editedDevices, setEditedDevices] = React.useState<
    OrderDataType["devices"] | null
  >(null)
  const [showDeviceEditor, setShowDeviceEditor] = React.useState(false)
  const hasSubmitted = React.useRef(false)

  // Session debugging state
  const [errorSessionId, setErrorSessionId] = React.useState<number | null>(null)
  const [sessionData, setSessionData] = React.useState<SessionById | null>(null)
  const [isLoadingSession, setIsLoadingSession] = React.useState(false)
  const [showSessionDialog, setShowSessionDialog] = React.useState(false)

  // New order intent state
  const [isCreatingNewIntent, setIsCreatingNewIntent] = React.useState(false)

  // Initialize edited devices from orderData when it changes
  React.useEffect(() => {
    if (orderData?.devices) {
      setEditedDevices([...orderData.devices])
    }
  }, [orderData?.devices])

  /**
   * Check if device IDs have been changed from original
   */
  const hasDeviceIdsChanged = React.useMemo(() => {
    if (!orderData?.devices || !editedDevices) return false
    return orderData.devices.some(
      (originalDevice, index) =>
        originalDevice.deviceId !== editedDevices[index]?.deviceId
    )
  }, [orderData?.devices, editedDevices])

  /**
   * Check if device count has changed from original
   * This indicates a resubmit is needed
   */
  const hasDeviceCountChanged = React.useMemo(() => {
    if (!orderData?.devices || !editedDevices) return false
    return orderData.devices.length !== editedDevices.length
  }, [orderData?.devices, editedDevices])

  /**
   * Get current devices to use for submission (edited or original)
   */
  const currentDevices = editedDevices || orderData?.devices || []

  const submit = React.useCallback(async () => {
    if (!orderData || !orderId || isSubmitting) {
      console.log(
        "Submission conditions not met or already submitting."
      )
      return
    }

    // Resubmit if device IDs changed OR device count changed
    const shouldResubmit = hasDeviceIdsChanged || hasDeviceCountChanged
    const devicesToSubmit = editedDevices || orderData.devices

    console.log("Submitting order...", {
      orderId,
      retryCount,
      resubmit: shouldResubmit,
      deviceIdsChanged: hasDeviceIdsChanged,
      deviceCountChanged: hasDeviceCountChanged,
      originalDeviceCount: orderData.devices.length,
      newDeviceCount: devicesToSubmit.length,
    })
    setIsSubmitting(true)
    setSubmissionError(null)
    setValidationErrors(null)
    setErrorSessionId(null)

    try {
      // Create order data with edited devices
      const orderDataToSubmit: OrderDataType = {
        ...orderData,
        devices: devicesToSubmit,
      }

      const result = await submitOrder(
        orderId,
        orderDataToSubmit,
        bypassPayment,
        shouldResubmit
      )

      if (result.success) {
        setOrderSubmitted(true)
        setSubmissionError(null)
        setValidationErrors(null)
        setErrorSessionId(null)
        hasSubmitted.current = true
        console.log("Order submitted successfully.")
      } else {
        // Capture sessionId from error response for debugging
        if (result.sessionId) {
          console.log("Error sessionId:", result.sessionId)
          setErrorSessionId(result.sessionId)
        }

        if (result.errorType === "unknown") {
          console.error("Order submission error:", result.error)
          setSubmissionError(result.error || null)
          hasSubmitted.current = false
        } else if (result.errorType === "validation") {
          console.error("Order submission validation errors:", result.error)
          setValidationErrors(result.error || null)
          hasSubmitted.current = false
        } else {
          console.error("Unknown error type:", result)
          setSubmissionError(new Error("Unknown error occurred") as SubmitOrderError)
          hasSubmitted.current = false
        }
      }
    } catch (error) {
      console.error("Unexpected error during submission:", error)
      setSubmissionError(
        error instanceof Error ? error as SubmitOrderError : new Error("Unknown error") as SubmitOrderError
      )
      hasSubmitted.current = false
    } finally {
      setIsSubmitting(false)
    }
  }, [
    orderData,
    orderId,
    isSubmitting,
    bypassPayment,
    retryCount,
    editedDevices,
    hasDeviceIdsChanged,
    hasDeviceCountChanged,
  ])

  const effectRan = React.useRef(false)

  React.useEffect(() => {
    let mounted = true

    if (
      orderData &&
      orderId &&
      !orderSubmitted &&
      !isSubmitting &&
      !effectRan.current
    ) {
      console.log("Ready to submit order...")
      effectRan.current = true

      const submitOrder = async () => {
        if (mounted) {
          await submit()
        }
      }

      void submitOrder()
    }

    return () => {
      mounted = false
    }
  }, [orderData, orderId, orderSubmitted, submit, isSubmitting])

  /**
   * Handle retry submission
   * Resets error states and increments retry count
   */
  const handleRetrySubmission = React.useCallback(() => {
    console.log("Retrying order submission...", { retryCount: retryCount + 1 })
    setRetryCount((prev) => prev + 1)
    hasSubmitted.current = false
    effectRan.current = false
    setOrderSubmitted(false)
    setPaymentConfirmed(false)
    setSubmissionError(null)
    setValidationErrors(null)
    setErrorDetailsOpen(false)

    // Trigger resubmission
    void submit()
  }, [retryCount, submit])

  /**
   * Handle device ID change
   */
  const handleDeviceIdChange = React.useCallback(
    (index: number, newDeviceId: string) => {
      if (!editedDevices) return
      const currentDevice = editedDevices[index]
      if (!currentDevice) return
      const updated = [...editedDevices]
      updated[index] = { ...currentDevice, deviceId: newDeviceId }
      setEditedDevices(updated)
    },
    [editedDevices]
  )

  /**
   * Reset device IDs to original values
   */
  const handleResetDeviceIds = React.useCallback(() => {
    if (orderData?.devices) {
      setEditedDevices([...orderData.devices])
    }
  }, [orderData?.devices])

  /**
   * View session logs for debugging errors
   */
  const handleViewSession = React.useCallback(async () => {
    if (!errorSessionId) return

    setIsLoadingSession(true)
    try {
      const result = await dbGetSessionById(errorSessionId)
      if (result.success) {
        setSessionData(result.data)
        setShowSessionDialog(true)
      } else {
        console.error("Failed to load session:", result.error)
      }
    } catch (error) {
      console.error("Error loading session:", error)
    } finally {
      setIsLoadingSession(false)
    }
  }, [errorSessionId])

  /**
   * Create a new order intent (fresh order)
   * Used when the current order is in a bad state
   */
  const handleCreateNewOrderIntent = React.useCallback(async () => {
    if (!orderData || !setOrderId) {
      console.error("Cannot create new order intent: missing orderData or setOrderId")
      return
    }

    setIsCreatingNewIntent(true)
    try {
      const payload = {
        resortId: orderData.resortId,
        startDate: _toLocalDateString(orderData.startDate),
        products: orderData.devices.map((device) => ({
          deviceId: device.deviceId,
          productId: device.productId,
          consumerCategoryId: device.consumerCategoryId,
          insurance: device.insurance,
        })),
      }

      console.log("📝 [Order] Creating new order intent:", payload)
      const result = await createOrderIntent(payload)

      if (result.success) {
        const newOrderId = Number(result.data.id)
        console.log("✅ [Order] New order intent created:", newOrderId)
        setOrderId(newOrderId)

        // Reset error states and retry submission with new order
        setSubmissionError(null)
        setValidationErrors(null)
        setErrorSessionId(null)
        setRetryCount(0)
        hasSubmitted.current = false
        effectRan.current = false
        setOrderSubmitted(false)

        // Trigger submission with new order
        // Note: The useEffect will pick up the new orderId and submit
      } else {
        console.error("❌ [Order] Failed to create new order intent:", result.error)
        setSubmissionError(new Error(result.error) as SubmitOrderError)
      }
    } catch (error) {
      console.error("❌ [Order] Error creating new order intent:", error)
      setSubmissionError(
        error instanceof Error ? error as SubmitOrderError : new Error("Failed to create new order intent") as SubmitOrderError
      )
    } finally {
      setIsCreatingNewIntent(false)
    }
  }, [orderData, setOrderId])

  const confirmSubmissionSuccess = async () => {
    if (isButtonDisabled || isConfirming) return

    console.log("Confirming payment status...")
    setIsConfirming(true)

    try {
      if (!orderId) {
        throw new Error("Order ID is required")
      }

      const result = await retrieveOrder({
        orderId: orderId.toString(),
        transactionId: "payment-confirmed",
      })

      if (result.success) {
        console.log("Payment confirmed successfully.")
        setPaymentConfirmed(true)
      } else {
        const errorMessage =
          "error" in result ? result.error : "Unknown error occurred"
        console.log("Payment confirmation failed:", errorMessage)
        setSubmissionError(new Error(errorMessage))
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
      setSubmissionError(
        error instanceof Error ? error : new Error("Unknown error")
      )
    } finally {
      setIsConfirming(false)
      setIsButtonDisabled(true)
      setTimeout(() => {
        setIsButtonDisabled(false)
      }, 3000)
    }
  }

  /**
   * Format error message for display
   */
  const getErrorMessage = (error: Error | ZodIssue[] | null): string => {
    if (!error) return "Unknown error occurred"

    if (Array.isArray(error)) {
      if (error.length === 0) return "Validation error occurred"
      const firstIssue = error[0]
      if (error.length === 1 && firstIssue) {
        return `Validation error in ${firstIssue.path.join(".")}: ${firstIssue.message}`
      }
      return `${error.length} validation errors occurred`
    }

    return error.message || "An error occurred during submission"
  }

  /**
   * Check if there are any errors to display
   */
  const hasError = submissionError !== null || validationErrors !== null

  // CRITICAL: Show error if orderId is missing (order intent was never created)
  if (!orderId) {
    return (
      <div className="flex h-full items-center justify-center p-4 sm:p-6">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5" />
                Order Not Created
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Missing Order</AlertTitle>
                <AlertDescription>
                  The order intent was not created. This can happen if the payment
                  page was bypassed too quickly or if there was a network error.
                  Please go back and try again.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Order data exists: {orderData ? "Yes" : "No"}
                <br />
                Device count: {orderData?.devices?.length ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (orderSubmitted && paymentConfirmed && orderId) {
    return (
      <div className="container mx-auto max-w-7xl space-y-8 py-8">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="text-4xl font-bold">Order {orderId} Confirmed!</h1>
          <div className="text-2xl">Thank you for your purchase!</div>
          <div className="text-6xl">🎉</div>

          <div className="flex flex-col items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Submission Status</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-green-600">✓</span>
                <span>Stripe Payment Processed</span>
              </div>
              {orderData?.skidataOrderSubmissionData && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-green-600">✓</span>
                  <span>Skidata Order Created</span>
                </div>
              )}
              {orderData?.mythOrderSubmissionData && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-green-600">✓</span>
                  <span>Myth Order Created</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-6">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Order Submission</h1>
        </div>

        {/* Loading States */}
        {isSubmitting && (
          <div className="flex items-center justify-center gap-3 rounded-lg border bg-card p-6">
            <Spinner className="size-6 animate-spin" />
            <span className="text-lg">
              {retryCount > 0
                ? `Retrying submission (Attempt ${retryCount + 1})...`
                : "Submitting order..."}
            </span>
          </div>
        )}

        {isConfirming && (
          <div className="flex items-center justify-center gap-3 rounded-lg border bg-card p-6">
            <Spinner className="size-6 animate-spin" />
            <span className="text-lg">Confirming submission...</span>
          </div>
        )}

        {/* Success Message */}
        {orderSubmitted && !paymentConfirmed && !hasError && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="size-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Order Submitted Successfully
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Order submitted successfully. Waiting for submission confirmation...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {hasError && !isSubmitting && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5" />
                {orderSubmitted
                  ? "Payment Confirmation Failed"
                  : "Order Submission Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Error Message */}
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(submissionError || validationErrors)}
                </AlertDescription>
              </Alert>

              {/* Collapsible Detailed Error Information */}
              <Collapsible
                open={errorDetailsOpen}
                onOpenChange={setErrorDetailsOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    <span>View Detailed Error Information</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        errorDetailsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  <div className="rounded-md border bg-muted p-4">
                    {submissionError && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Error Message:</h4>
                        <pre className="overflow-auto rounded bg-background p-2 text-sm">
                          {submissionError.message}
                        </pre>
                        {submissionError.stack && (
                          <>
                            <h4 className="font-semibold">Stack Trace:</h4>
                            <pre className="max-h-40 overflow-auto rounded bg-background p-2 text-xs">
                              {submissionError.stack}
                            </pre>
                          </>
                        )}
                      </div>
                    )}
                    {validationErrors && validationErrors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          Validation Errors ({validationErrors.length}):
                        </h4>
                        <ul className="space-y-1">
                          {validationErrors.map((issue, index) => (
                            <li
                              key={index}
                              className="rounded bg-background p-2 text-sm"
                            >
                              <span className="font-medium">
                                {issue.path.length > 0
                                  ? issue.path.join(".")
                                  : "root"}
                              </span>
                              : {issue.message}
                              {issue.code && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Code: {issue.code})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Device ID Editor */}
              {orderData && (
                <Collapsible
                  open={showDeviceEditor}
                  onOpenChange={setShowDeviceEditor}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      type="button"
                    >
                      <span>
                        Edit Device IDs{" "}
                        {(hasDeviceIdsChanged || hasDeviceCountChanged) &&
                          "(Modified)"}
                      </span>
                      <ChevronDown
                        className={`size-4 transition-transform ${
                          showDeviceEditor ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-4">
                    <div className="rounded-md border bg-muted p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Device IDs (Pass IDs)
                        </Label>
                        {hasDeviceIdsChanged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetDeviceIds}
                            type="button"
                          >
                            Reset to Original
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {currentDevices.map((device, index) => (
                          <div key={index} className="space-y-1">
                            <Label htmlFor={`device-${index}`} className="text-xs">
                              Pass {index + 1} Device ID
                            </Label>
                            <Input
                              id={`device-${index}`}
                              value={device.deviceId}
                              onChange={(e) =>
                                handleDeviceIdChange(index, e.target.value)
                              }
                              placeholder="Enter device ID"
                              className="font-mono"
                            />
                            <div className="text-xs text-muted-foreground">
                              Product: {device.productId} | Category:{" "}
                              {device.consumerCategoryId} | Insurance:{" "}
                              {device.insurance ? "Yes" : "No"}
                            </div>
                          </div>
                        ))}
                      </div>
                      {(hasDeviceIdsChanged || hasDeviceCountChanged) && editedDevices && (
                        <Alert className="mt-3 border-blue-200 bg-blue-50">
                          <AlertCircle className="size-4 text-blue-600" />
                          <AlertDescription className="text-blue-700">
                            {hasDeviceCountChanged
                              ? `Device count changed from ${orderData.devices.length} to ${editedDevices.length}. This will trigger a resubmit with the new devices.`
                              : "Device IDs have been modified. This will trigger a resubmit with the new device IDs."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Session Link (when sessionId is available) */}
              {errorSessionId && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Debug Session Available
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        (ID: {errorSessionId})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewSession}
                      disabled={isLoadingSession}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                    >
                      {isLoadingSession ? (
                        <>
                          <Spinner className="mr-1 size-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-1 size-3" />
                          View Session Logs
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Primary Actions Row */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleRetrySubmission}
                    disabled={isSubmitting || isCreatingNewIntent}
                    className="flex-1"
                    size="lg"
                  >
                    <RefreshCw
                      className={`mr-2 size-4 ${
                        isSubmitting ? "animate-spin" : ""
                      }`}
                    />
                    {retryCount > 0
                      ? `Retry Submission (Attempt ${retryCount + 1})`
                      : hasDeviceIdsChanged || hasDeviceCountChanged
                        ? "Resubmit with New Devices"
                        : "Retry Submission"}
                  </Button>
                  <Button
                    onClick={() => {
                      setSubmissionError(null)
                      setValidationErrors(null)
                      setErrorDetailsOpen(false)
                      setErrorSessionId(null)
                    }}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Dismiss
                  </Button>
                </div>

                {/* Create New Order Intent Button */}
                {setOrderId && (
                  <Button
                    onClick={handleCreateNewOrderIntent}
                    disabled={isSubmitting || isCreatingNewIntent}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    {isCreatingNewIntent ? (
                      <>
                        <Spinner className="mr-2 size-4 animate-spin" />
                        Creating New Order...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 size-4" />
                        Create New Order Intent
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verify Button (only when order submitted successfully) */}
        {orderSubmitted && !paymentConfirmed && !hasError && (
          <div className="flex justify-center">
            <Button
              onClick={confirmSubmissionSuccess}
              disabled={isButtonDisabled || isConfirming}
              size="lg"
              className="px-8 py-6 text-lg"
            >
              {isConfirming ? (
                <>
                  <Spinner className="mr-2 size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Order Submission"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Session Logs Panel (Sheet) */}
      {sessionData && (
        <SessionLogsPanel
          session={sessionData as JoinedSession}
          open={showSessionDialog}
          onOpenChange={setShowSessionDialog}
        />
      )}
    </div>
  )
}
