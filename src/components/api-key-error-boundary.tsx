"use client"

import React from "react"
import { AlertCircle, Key, RefreshCw, ShoppingCart } from "lucide-react"
import posthog from "posthog-js"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ApiKeyErrorBoundaryProps {
  error?: string
  errorType?:
    | "api_key_invalid"
    | "validation"
    | "unknown"
    | "timeout"
    | "aborted"
    | "sales_channel_not_found"
  onRetry?: () => void
  children?: React.ReactNode
  className?: string
  context?: string // Additional context for logging (e.g., "terminal_selector", "payment_flow", "product_catalog")
}

/**
 * Component that displays appropriate error messages for API key validation issues
 * Provides user-friendly fallback UI when Stripe API keys are invalid or missing
 * Includes PostHog logging for monitoring and debugging API key issues
 */
export function ApiKeyErrorBoundary({
  error,
  errorType,
  onRetry,
  children,
  className = "",
  context = "unknown",
}: ApiKeyErrorBoundaryProps) {
  // Log error display to PostHog for monitoring
  React.useEffect(() => {
    if (error && errorType && typeof window !== "undefined" && posthog) {
      posthog.capture("api_error_displayed_to_user", {
        error_message: error,
        error_type: errorType,
        context: context,
        timestamp: new Date().toISOString(),
        severity:
          errorType === "api_key_invalid" ||
          errorType === "sales_channel_not_found"
            ? "high"
            : "medium",
      })
    }
  }, [error, errorType, context])

  // If no error, render children normally
  if (!error || !errorType) {
    return <>{children}</>
  }

  // Handle retry button clicks with logging
  const handleRetry = () => {
    if (typeof window !== "undefined" && posthog) {
      posthog.capture("api_error_retry_attempted", {
        error_type: errorType,
        context: context,
        timestamp: new Date().toISOString(),
      })
    }
    onRetry?.()
  }

  // Handle API key validation errors specifically
  if (errorType === "api_key_invalid") {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <Key className="size-4" />
          <AlertTitle>Invalid API Configuration</AlertTitle>
          <AlertDescription>
            The Stripe API key configured for this resort is invalid or has
            expired. Payment processing and terminal access are currently
            unavailable.
            <br />
            <strong>
              Please contact your system administrator to update the API
              settings.
            </strong>
          </AlertDescription>
        </Alert>

        {onRetry && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Handle sales channel configuration errors
  if (errorType === "sales_channel_not_found") {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <ShoppingCart className="size-4" />
          <AlertTitle>Sales Channel Not Configured</AlertTitle>
          <AlertDescription>
            No sales channel has been configured for this resort. Product
            catalogs and pricing information are currently unavailable.
            <br />
            <strong>
              Please contact your system administrator to configure the sales
              channel settings.
            </strong>
          </AlertDescription>
        </Alert>

        {onRetry && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Handle other validation errors
  if (errorType === "validation") {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            There&apos;s an issue with the current resort configuration: {error}
            <br />
            Please check the settings or contact your administrator.
          </AlertDescription>
        </Alert>

        {onRetry && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Handle timeout and connection errors
  if (errorType === "timeout" || errorType === "aborted") {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {errorType === "timeout"
              ? "The request timed out. Please check your internet connection and try again."
              : "The request was interrupted. Please try again."}
          </AlertDescription>
        </Alert>

        {onRetry && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Handle unknown errors
  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Unexpected Error</AlertTitle>
        <AlertDescription>
          An unexpected error occurred: {error}
          <br />
          Please try again or contact support if the problem persists.
        </AlertDescription>
      </Alert>

      {onRetry && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
