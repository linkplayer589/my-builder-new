"use client"

import * as React from "react"
import { useResort } from "@/features/resorts"
import { CreditCard, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import posthog from "posthog-js"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { captureClickCollectPayment } from "../order-collect-actions/capture-click-collect-payment"
import { fetchOrderRoute } from "../order-collect-actions/fetch-order"

interface CardReaderPaymentProps {
  orderId: number
  remainingAmountCents: number
  currency: string
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
}

/**
 * JSDoc: Component for processing payments via card readers
 * Why: Allows staff to process remaining balance payments using physical card readers
 * How: Fetches available card readers and processes payment through selected terminal
 */
export function CardReaderPayment({
  orderId,
  remainingAmountCents,
  currency,
  onPaymentSuccess,
  onPaymentError,
}: CardReaderPaymentProps) {
  const {
    cardReaders,
    cardReadersLoading: isLoadingReaders,
    selectedCardReader,
    setSelectedCardReader,
    refreshCardReaders,
    cardReadersResponse
  } = useResort()

  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  const [retryCount, setRetryCount] = React.useState(0)

  /**
   * JSDoc: Handle retry functionality using the useResort hook
   * Why: Reuse existing card reader logic and state management from useResort
   * How: Calls refreshCardReaders and updates retry count for UI feedback
   */
  const handleRefresh = React.useCallback(async (isRetry = false) => {
    setError("")

    const currentRetry = isRetry ? retryCount + 1 : 0
    if (isRetry) {
      setRetryCount(currentRetry)
    }

    console.log("🔍 [CardReader] Refreshing card readers...", {
      orderId,
      isRetry,
      retryAttempt: currentRetry
    })

    // Log card reader refresh initiation
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('card_reader_payment_refresh_readers', {
        order_id: orderId,
        amount_cents: remainingAmountCents,
        currency,
        is_retry: isRetry,
        retry_count: currentRetry,
        timestamp: new Date().toISOString()
      })
    }

    try {
      await refreshCardReaders()

      // Show success message if this was a retry and readers were found
      if (isRetry && cardReaders && cardReaders.length > 0) {
        toast.success(
          `Found ${cardReaders.length} card reader${cardReaders.length !== 1 ? 's' : ''} available!`
        )
      }

      // Log successful reader refresh
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('card_reader_payment_readers_refreshed', {
          order_id: orderId,
          total_readers: cardReaders?.length || 0,
          is_retry: isRetry,
          retry_count: currentRetry,
          timestamp: new Date().toISOString()
        })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to refresh card readers"
      setError(errorMsg)

      // Log refresh errors
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('card_reader_payment_refresh_error', {
          order_id: orderId,
          error_message: errorMsg,
          is_retry: isRetry,
          retry_count: currentRetry,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }
    }
  }, [orderId, remainingAmountCents, currency, retryCount, cardReaders, refreshCardReaders])

  /**
   * JSDoc: Verify that the invoice is fully settled after payment capture
   * Why: Ensure payment was successful and order is now fully paid before proceeding
   * How: Polls the fetchOrderRoute API to check if payment status shows fully paid
   */
  const verifyPaymentSettled = React.useCallback(async (transactionId?: string): Promise<boolean> => {
    console.log("🔍 [CardReader] Verifying payment is fully settled...", { orderId, transactionId })

    setIsVerifyingPayment(true)

    // Log payment verification start
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('click_collect_payment_verification_started', {
        order_id: orderId,
        transaction_id: transactionId,
        timestamp: new Date().toISOString()
      })
    }

    const maxAttempts = 5
    const checkInterval = 3000 // 3 seconds between checks

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Wait before checking (except first attempt)
          if (attempt > 1) {
            console.log(`🔍 [CardReader] Waiting ${checkInterval/1000}s before next check...`)
            await new Promise(resolve => setTimeout(resolve, checkInterval))
          }

          console.log(`🔍 [CardReader] Payment verification attempt ${attempt}/${maxAttempts}`)

          // Show progress for longer verification processes
          if (attempt > 2) {
            toast.info(`Verifying payment settlement... (attempt ${attempt}/${maxAttempts})`)
          }

          const result = await fetchOrderRoute(orderId)

          if (result.success) {
            const { isFullyPaid, remainingAmountCents: remaining } = result.data.payment

            console.log(`🔍 [CardReader] Payment status: fully paid = ${isFullyPaid}, remaining = ${remaining}`)

            if (isFullyPaid) {
              // Log successful verification
              if (typeof window !== 'undefined' && posthog) {
                posthog.capture('click_collect_payment_verification_success', {
                  order_id: orderId,
                  transaction_id: transactionId,
                  attempts_needed: attempt,
                  timestamp: new Date().toISOString()
                })
              }

              toast.success("✅ Payment successfully processed and settled! Order is now fully paid.")
              onPaymentSuccess()
              return true
            }

            // If not the last attempt, continue checking
            if (attempt < maxAttempts) {
              console.log(`🔍 [CardReader] Payment not yet settled, will retry...`)
            }
          } else {
            console.warn(`🔍 [CardReader] Failed to fetch order on attempt ${attempt}:`, result.error)
          }
        } catch (attemptError) {
          console.error(`🔍 [CardReader] Verification attempt ${attempt} failed:`, attemptError)
          // Continue to next attempt unless this is the last one
        }
      }

      // If we get here, all attempts failed
      const totalWaitTime = (maxAttempts - 1) * (checkInterval / 1000)
      const errorMsg = `Payment was captured but settlement verification timed out after ${totalWaitTime} seconds. The payment may still be processing. Please refresh the order or check status manually.`

      // Log verification timeout
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('click_collect_payment_verification_timeout', {
          order_id: orderId,
          transaction_id: transactionId,
          max_attempts: maxAttempts,
          total_wait_time_seconds: totalWaitTime,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }

      setError(errorMsg)
      onPaymentError(errorMsg)
      return false

    } catch (globalError) {
      console.error("🔍 [CardReader] Verification process failed:", globalError)

      const errorMsg = "Unable to verify payment status. Please check order manually."

      // Log verification error
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('click_collect_payment_verification_error', {
          order_id: orderId,
          transaction_id: transactionId,
          error_message: globalError instanceof Error ? globalError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          severity: 'medium'
        })
      }

      setError(errorMsg)
      onPaymentError(errorMsg)
      return false
    } finally {
      // Always reset the loading state
      console.log("🔍 [CardReader] Verification process completed, resetting loading state")
      setIsVerifyingPayment(false)
    }
  }, [orderId, onPaymentSuccess, onPaymentError])

  /**
   * JSDoc: Captures remaining balance payment through selected card reader
   * Why: Processes outstanding balance for click-and-collect orders using dedicated endpoint
   * How: Uses specialized click-and-collect capture payment API with orderId and readerId
   */
  const processPayment = async () => {
    if (!selectedCardReader) {
      setError("Please select a card reader")
      return
    }

    setIsProcessingPayment(true)
    setError("")

    console.log("💳 [CardReader] Capturing click-and-collect payment...", {
      readerId: selectedCardReader.id,
      orderId,
      amount: remainingAmountCents,
    })

    // Log payment capture start
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('click_collect_payment_capture_started', {
        order_id: orderId,
        reader_id: selectedCardReader.id,
        amount_cents: remainingAmountCents,
        currency,
        timestamp: new Date().toISOString()
      })
    }

    try {
      // Add overall timeout to prevent hanging forever
      const paymentTimeout = 60000 // 60 seconds total timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Payment process timed out")), paymentTimeout)
      })

      await Promise.race([
        (async () => {
          const latest = await fetchOrderRoute(orderId)
          const result = await captureClickCollectPayment({
            orderId: orderId,
            orderNumber: orderId,
            readerId: selectedCardReader.id,
            amountCents: remainingAmountCents,
            currency,
            invoiceId: latest.success ? latest.data.payment.invoiceId : undefined,
            stripeInvoiceId: latest.success ? latest.data.payment.invoiceId : undefined,
            paymentIntentId: latest.success ? latest.data.payment.paymentIntentId : undefined
          })

          if (!result.success) {
            throw new Error('error' in result ? result.error : "Payment processing failed")
          }

          // Log successful payment capture
          if (typeof window !== 'undefined' && posthog) {
            posthog.capture('click_collect_payment_capture_success', {
              order_id: orderId,
              reader_id: selectedCardReader.id,
              amount_cents: remainingAmountCents,
              currency,
              transaction_id: result.transactionId,
              timestamp: new Date().toISOString()
            })
          }

          // Show intermediate status - payment captured, now verifying settlement
          toast.success("Payment captured on terminal, verifying settlement...")

          // Verify that the invoice is now fully settled
          await verifyPaymentSettled(result.transactionId)
        })(),
        timeoutPromise
      ])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment failed"
      setError(errorMsg)
      onPaymentError(errorMsg)

      // Log payment capture failures
      if (typeof window !== 'undefined' && posthog) {
        posthog.capture('click_collect_payment_capture_failed', {
          order_id: orderId,
          reader_id: selectedCardReader.id,
          amount_cents: remainingAmountCents,
          currency,
          error_message: errorMsg,
          timestamp: new Date().toISOString(),
          severity: 'high'
        })
      }

      console.error("Payment processing error:", err)
    } finally {
      // Always reset loading states
      console.log("💳 [CardReader] Resetting payment processing states")
      setIsProcessingPayment(false)
      setIsVerifyingPayment(false)
    }
  }

  if (isLoadingReaders) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading card readers...</span>
      </div>
    )
  }

  // Handle API errors using the same logic as terminal selector
  if (cardReadersResponse && !cardReadersResponse.success) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Card Readers</AlertTitle>
        <AlertDescription className="space-y-3">
          <div>{cardReadersResponse.error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh(true)}
            disabled={isLoadingReaders}
            className="flex items-center gap-2"
          >
            {isLoadingReaders ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry {retryCount > 0 ? `(${retryCount})` : ''}
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Show local error if any
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Payment Processing Error</AlertTitle>
        <AlertDescription className="space-y-3">
          <div>{error}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                // Retry the payment
                setError("")
                void (async () => {
                  await processPayment()
                })()
              }}
              disabled={isProcessingPayment || isVerifyingPayment}
            >
              Retry Payment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh(true)}
              disabled={isProcessingPayment || isVerifyingPayment}
            >
              Refresh Readers
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!cardReaders || cardReaders.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Card Readers Available</AlertTitle>
        <AlertDescription className="space-y-3">
          <div>
            There are no card readers available at this time.
            This could be due to network issues or all readers being offline.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh(true)}
              disabled={isLoadingReaders}
              className="flex items-center gap-2"
            >
              {isLoadingReaders ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Check Again {retryCount > 0 ? `(${retryCount})` : ''}
                </>
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Alternatively, use the bypass payment option to proceed without payment.
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Card Reader Payment</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRefresh(true)}
          disabled={isLoadingReaders}
          className="flex items-center gap-1 text-xs"
          title="Refresh card readers list"
        >
          {isLoadingReaders ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Remaining balance: <span className="font-semibold text-foreground">
          {formatAmount(remainingAmountCents, currency)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Select Card Reader</label>
          <span className="text-xs text-muted-foreground">
            {cardReaders.length} reader{cardReaders.length !== 1 ? 's' : ''} available
            {retryCount > 0 && ` (refreshed ${retryCount}x)`}
          </span>
        </div>
        <Select
          value={selectedCardReader?.id || ""}
          onValueChange={(id) => {
            const reader = cardReaders.find((r) => r.id === id)
            if (reader) setSelectedCardReader(reader)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a card reader..." />
          </SelectTrigger>
          <SelectContent>
            {cardReaders.map((reader) => (
              <SelectItem key={reader.id} value={reader.id}>
                {reader.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Button
          onClick={processPayment}
          disabled={!selectedCardReader || isProcessingPayment || isVerifyingPayment}
          className="w-full"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : isVerifyingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Settlement...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Process Payment ({formatAmount(remainingAmountCents, currency)})
            </>
          )}
        </Button>

        {/* Emergency reset button if payment gets stuck */}
        {(isProcessingPayment || isVerifyingPayment) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("🛑 [CardReader] Emergency reset of payment states")
              setIsProcessingPayment(false)
              setIsVerifyingPayment(false)
              setError("")
              toast.info("Payment process cancelled. You can try again or use the manual refresh option.")

              // Log emergency reset
              if (typeof window !== 'undefined' && posthog) {
                posthog.capture('click_collect_payment_emergency_reset', {
                  order_id: orderId,
                  was_processing: isProcessingPayment,
                  was_verifying: isVerifyingPayment,
                  timestamp: new Date().toISOString()
                })
              }
            }}
            className="w-full text-xs"
          >
            Cancel Payment Process
          </Button>
        )}
      </div>
    </div>
  )
}
