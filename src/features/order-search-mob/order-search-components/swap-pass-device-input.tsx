"use client"

import * as React from "react"
import { InfoIcon, Loader2Icon } from "lucide-react"
import { type ControllerRenderProps, type FieldValues, type FieldPath } from "react-hook-form"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useDeviceValidation } from "../../create-new-order/create-new-order-hooks/useDeviceValidation"

interface DeviceIdInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerRenderProps<TFieldValues, TName>, 'name'> {
  index: number
  name?: string
}

export function SwapPassDeviceIdInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  value,
  onChange,
  ...props
}: DeviceIdInputProps<TFieldValues, TName>) {
  const { isLoading, validationResult, error } = useDeviceValidation(value)

  const [isOpen, setIsOpen] = React.useState(false)

  const getBorderColor = () => {
    if (isLoading) return "border-gray-300"
    if (error) return "border-red-500"
    if (validationResult?.isValid) return "border-green-500"
    if (validationResult && !validationResult.isValid) return "border-red-500"
    return "border-gray-300"
  }

  const toggleOpen = () => setIsOpen(!isOpen)
  const closeCard = () => setIsOpen(false)

  // ⬇️ coalesce value to an empty string to prevent undefined
  const safeValue = value ?? ""

  return (
    <div className="relative flex w-full items-center">
      <div
        className={`relative flex h-10 w-full items-center rounded-md border ${getBorderColor()}`}
      >
        <input
          {...props}
          value={safeValue}
          onChange={onChange}
          className="size-full rounded-md bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        <div className="absolute right-2 flex items-center">
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin text-gray-400" />
          ) : (validationResult || error) ? (
            <HoverCard open={isOpen} onOpenChange={setIsOpen}>
              <HoverCardTrigger asChild>
                <InfoIcon
                  className={`size-4 cursor-pointer ${
                    validationResult?.isValid ? "text-green-500" : "text-red-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    toggleOpen()
                  }}
                />
              </HoverCardTrigger>
              {isOpen && (
                <HoverCardContent className="w-80" onClick={closeCard}>
                  {error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : (
                    validationResult && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Device Status</h4>
                        <div className="space-y-1">
                          <StatusRow
                            label="Device Code"
                            valid={validationResult.criteria.hasDeviceCode}
                          />
                          <StatusRow
                            label="DTA Code"
                            valid={validationResult.criteria.hasDtaCode}
                          />
                          <StatusRow
                            label="Device Available"
                            valid={validationResult.criteria.isNotAllocated}
                          />
                          <StatusRow
                            label="Battery Level"
                            valid={validationResult.criteria.hasSufficientBattery}
                          />
                        </div>
                      </div>
                    )
                  )}
                </HoverCardContent>
              )}
            </HoverCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className={valid ? "text-green-500" : "text-red-500"}>
        {valid ? "✓" : "✗"}
      </span>
    </div>
  )
}
