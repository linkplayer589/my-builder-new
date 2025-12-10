"use client"

import { useDeviceValidation } from "@/features/validate-lifepass-device/hooks/useDeviceValidation"
import { InfoIcon, Loader2 } from "lucide-react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface DeviceIdInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DeviceIdInput({
  value,
  onChange,
  placeholder = "Enter device ID...",
  id,
  name,
  ...props
}: DeviceIdInputProps) {
  const { isLoading, validationResult, error } = useDeviceValidation(value)

  const getBorderColor = () => {
    if (isLoading) return "border-gray-300"
    if (error) return "border-red-500"
    if (validationResult?.isValid) return "border-green-500"
    if (validationResult && !validationResult.isValid) return "border-red-500"
    return "border-gray-300"
  }

  return (
    <div className="relative flex items-center">
      <div
        className={`relative flex h-8 w-full items-center rounded-md border ${getBorderColor()}`}
      >
        <input
          {...props}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-full rounded-md bg-transparent px-2 focus:outline-none"
          placeholder={placeholder}
        />
        <div className="absolute right-2 flex items-center">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-gray-400" />
          ) : (
            (validationResult || error) && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <InfoIcon
                    className={`size-4 cursor-help ${
                      validationResult?.isValid
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  {error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : (
                    validationResult && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Device Status</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Device Code</span>
                            <span
                              className={
                                validationResult.criteria.hasDeviceCode
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {validationResult.criteria.hasDeviceCode
                                ? "✓"
                                : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">DTA Code</span>
                            <span
                              className={
                                validationResult.criteria.hasDtaCode
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {validationResult.criteria.hasDtaCode ? "✓" : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Device Available</span>
                            <span
                              className={
                                validationResult.criteria.isNotAllocated
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {validationResult.criteria.isNotAllocated
                                ? "✓"
                                : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Battery Level</span>
                            <span
                              className={
                                validationResult.criteria.hasSufficientBattery
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {validationResult.criteria.hasSufficientBattery
                                ? "✓"
                                : "✗"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </HoverCardContent>
              </HoverCard>
            )
          )}
        </div>
      </div>
    </div>
  )
}
