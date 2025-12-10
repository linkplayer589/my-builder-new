"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  BatteryIcon,
  BatteryLowIcon,
  BatteryMediumIcon,
  BatteryWarningIcon,
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  WifiIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react"
import { type ControllerRenderProps } from "react-hook-form"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"

import { useDeviceValidation } from "../create-new-order-hooks/useDeviceValidation"
import { type FORM_SCHEMA_TYPE } from "./create-new-order-page-1-order-form"
import { type ValidationSeverity } from "../create-new-order-actions/check-device-status/types"

interface DeviceIdInputProps
  extends ControllerRenderProps<
    FORM_SCHEMA_TYPE,
    `devices.${number}.deviceId`
  > {
  index: number
  /** Callback fired when Enter key is pressed - used for barcode scanner workflow */
  onEnterPress?: () => void
}

/**
 * Get appropriate icon for severity level
 */
function getSeverityIcon(severity: ValidationSeverity, size = 14) {
  switch (severity) {
    case "success":
      return <CheckCircle2Icon className="text-green-500" style={{ width: size, height: size }} />
    case "warning":
      return <AlertTriangleIcon className="text-amber-500" style={{ width: size, height: size }} />
    case "error":
      return <XCircleIcon className="text-red-500" style={{ width: size, height: size }} />
    default:
      return <InfoIcon className="text-blue-500" style={{ width: size, height: size }} />
  }
}

/**
 * Get appropriate battery icon based on level
 */
function getBatteryIcon(level: number, size = 16) {
  const className = level >= 70 ? "text-green-500" : level >= 50 ? "text-amber-500" : level >= 20 ? "text-orange-500" : "text-red-500"

  if (level >= 70) return <BatteryIcon className={className} style={{ width: size, height: size }} />
  if (level >= 50) return <BatteryMediumIcon className={className} style={{ width: size, height: size }} />
  if (level >= 20) return <BatteryLowIcon className={className} style={{ width: size, height: size }} />
  return <BatteryWarningIcon className={className} style={{ width: size, height: size }} />
}

/**
 * Get severity color classes
 */
function getSeverityClasses(severity: ValidationSeverity): string {
  switch (severity) {
    case "success":
      return "text-green-600 dark:text-green-400"
    case "warning":
      return "text-amber-600 dark:text-amber-400"
    case "error":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-blue-600 dark:text-blue-400"
  }
}

export function DeviceIdInput({
  value,
  onChange,
  index,
  onEnterPress,
  ...props
}: DeviceIdInputProps) {
  const { isLoading, validationResult, error } = useDeviceValidation(value)

  const [isOpen, setIsOpen] = React.useState(false)

  /**
   * Handle keydown events - triggers onEnterPress for barcode scanner workflow
   * When Enter is pressed (commonly sent by barcode scanners after scan),
   * add a new device entry to allow continuous scanning
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent form submission
      onEnterPress?.()
    }
  }

  const getBorderColor = () => {
    if (isLoading) return "border-gray-300"
    if (error) return "border-red-500"
    if (!validationResult) return "border-gray-300"
    if (validationResult.hasErrors) return "border-red-500"
    if (validationResult.hasWarnings) return "border-amber-500"
    if (validationResult.isValid) return "border-green-500"
    return "border-gray-300"
  }

  const getStatusIcon = () => {
    if (isLoading) return <Loader2Icon className="size-4 animate-spin text-gray-400" />
    if (error) return <XCircleIcon className="size-4 text-red-500" />
    if (!validationResult) return null
    if (validationResult.hasErrors) return <XCircleIcon className="size-4 text-red-500" />
    if (validationResult.hasWarnings) return <AlertTriangleIcon className="size-4 text-amber-500" />
    return <CheckCircle2Icon className="size-4 text-green-500" />
  }

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      <div
        className={`relative flex h-9 min-w-0 flex-1 items-center rounded-md border-2 transition-colors ${getBorderColor()}`}
      >
        <input
          {...props}
          id={`device-${index}-id`}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter device ID"
          className="h-full min-w-0 flex-1 rounded-md bg-transparent px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          aria-label={`Device ID for device ${index + 1}`}
        />
        <div className="absolute right-2 flex shrink-0 items-center gap-1">
          {/* Quick battery indicator when valid */}
          {validationResult && !error && !isLoading && (
            <span className="flex items-center gap-0.5 text-xs">
              {getBatteryIcon(validationResult.deviceData.battery, 14)}
              <span className={getSeverityClasses(validationResult.criteria.hasSufficientBattery.severity)}>
                {validationResult.deviceData.battery}%
              </span>
            </span>
          )}

          {/* Status icon with hover card */}
          {(isLoading || validationResult || error) && (
            <HoverCard open={isOpen} onOpenChange={setIsOpen}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleOpen()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleOpen()
                    }
                  }}
                  aria-label="View device status details"
                >
                  {getStatusIcon()}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-96 p-0" align="end">
                {error ? (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircleIcon className="size-5" />
                      <span className="font-semibold">Error</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                  </div>
                ) : validationResult ? (
                  <div className="divide-y">
                    {/* Header with overall status */}
                    <div className={`p-3 ${
                      validationResult.hasErrors
                        ? "bg-red-50 dark:bg-red-950"
                        : validationResult.hasWarnings
                          ? "bg-amber-50 dark:bg-amber-950"
                          : "bg-green-50 dark:bg-green-950"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {validationResult.hasErrors ? (
                            <XCircleIcon className="size-5 text-red-600" />
                          ) : validationResult.hasWarnings ? (
                            <AlertTriangleIcon className="size-5 text-amber-600" />
                          ) : (
                            <CheckCircle2Icon className="size-5 text-green-600" />
                          )}
                          <span className="font-semibold">
                            Device {validationResult.deviceData.deviceCode}
                          </span>
                        </div>
                        <Badge
                          variant={validationResult.hasErrors ? "destructive" : validationResult.hasWarnings ? "outline" : "default"}
                          className={validationResult.hasWarnings && !validationResult.hasErrors ? "border-amber-500 bg-amber-100 text-amber-700" : ""}
                        >
                          {validationResult.hasErrors
                            ? "Not Suitable"
                            : validationResult.hasWarnings
                              ? "Has Warnings"
                              : "Ready"}
                        </Badge>
                      </div>

                      {/* Connection status bar */}
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className={`flex items-center gap-1 ${validationResult.deviceData.connected ? "text-green-600" : "text-gray-500"}`}>
                          {validationResult.deviceData.connected ? (
                            <WifiIcon className="size-4" />
                          ) : (
                            <WifiOffIcon className="size-4" />
                          )}
                          {validationResult.deviceData.connected ? "Online" : "Offline"}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {validationResult.criteria.hasRecentConnection.value}
                        </span>
                      </div>
                    </div>

                    {/* Errors section */}
                    {validationResult.summary.errors.length > 0 && (
                      <div className="bg-red-50/50 p-3 dark:bg-red-950/50">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-red-700 dark:text-red-400">
                          <XCircleIcon className="size-3.5" />
                          Errors ({validationResult.summary.errors.length})
                        </div>
                        <ul className="space-y-1">
                          {validationResult.summary.errors.map((err, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                              <span className="mt-0.5">•</span>
                              <span>{err}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings section */}
                    {validationResult.summary.warnings.length > 0 && (
                      <div className="bg-amber-50/50 p-3 dark:bg-amber-950/50">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
                          <AlertTriangleIcon className="size-3.5" />
                          Warnings ({validationResult.summary.warnings.length})
                        </div>
                        <ul className="space-y-1">
                          {validationResult.summary.warnings.map((warn, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                              <span className="mt-0.5">•</span>
                              <span>{warn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed criteria */}
                    <div className="p-3">
                      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Device Details
                      </div>
                      <div className="space-y-2">
                        {Object.entries(validationResult.criteria).map(([key, criterion]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(criterion.severity, 14)}
                              <span className="text-muted-foreground">{criterion.label}</span>
                            </div>
                            <span className={`font-medium ${getSeverityClasses(criterion.severity)}`}>
                              {typeof criterion.value === "boolean"
                                ? criterion.value ? "Yes" : "No"
                                : criterion.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Device info footer */}
                    <div className="bg-muted/50 p-3">
                      <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Technical Info
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">IMEI:</span>
                          <span className="ml-1 font-mono">{validationResult.deviceData.imei}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">DTA:</span>
                          <span className="ml-1 font-mono text-[10px]">
                            {validationResult.deviceData.dtaCode || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </div>
    </div>
  )
}