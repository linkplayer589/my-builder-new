"use client"

import React from "react"
import { PlusIcon, XIcon } from "lucide-react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  type Control,
} from "react-hook-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { type Catalog, type Product, type priceCategory } from "../create-new-order-actions/get-products/types"
import type { FORM_SCHEMA_TYPE } from "./create-new-order-page-1-order-form"
import { DeviceIdInput } from "./create-new-order-device-id-input"

interface Props {
  control: Control<FORM_SCHEMA_TYPE>
  devices: FORM_SCHEMA_TYPE["devices"]
  resortCatalog: Catalog
}

export const DevicesArray = ({ control, resortCatalog, devices: _devices }: Props) => {
  const { setValue, getValues } = useFormContext<FORM_SCHEMA_TYPE>()
  const { fields, append, remove } = useFieldArray({
    name: "devices",
    control: control,
  })

  const [showWarningDialog, setShowWarningDialog] = React.useState(false)
  const [_warningMessage, _setWarningMessage] = React.useState("")
  const [_continueCallback, _setContinueCallback] = React.useState<() => void>(
    () => { }
  )

  // Track which device input to focus after adding a new one
  const [pendingFocusIndex, setPendingFocusIndex] = React.useState<number | null>(null)

  /**
   * Focus on a device input field by index
   * Used after adding a new device to enable continuous barcode scanning
   */
  const focusDeviceInput = React.useCallback((index: number) => {
    // Small delay to ensure the DOM has updated with the new input
    setTimeout(() => {
      const input = document.getElementById(`device-${index}-id`) as HTMLInputElement | null
      if (input) {
        input.focus()
      }
    }, 50)
  }, [])

  // Effect to handle focusing on newly added device inputs
  React.useEffect(() => {
    if (pendingFocusIndex !== null) {
      focusDeviceInput(pendingFocusIndex)
      setPendingFocusIndex(null)
    }
  }, [pendingFocusIndex, focusDeviceInput])

  /**
   * Handle Enter key press in device ID input - adds a new device for barcode scanner workflow
   * This enables continuous scanning: scan a barcode, press Enter (auto-sent by scanner),
   * new device is added and focused, ready for the next scan
   */
  const handleDeviceEnterPress = React.useCallback((currentIndex: number) => {
    const currentDeviceId = getValues(`devices.${currentIndex}.deviceId`)

    // Only add a new device if the current one has a device ID
    if (currentDeviceId && currentDeviceId.trim() !== "") {
      append({
        deviceId: "",
        productId: "",
        consumerCategoryId: "",
        insurance: false,
      })
      // Set the pending focus to the new device (will be at the end of the array)
      setPendingFocusIndex(fields.length)
    }
  }, [append, fields.length, getValues])

  const handleValidityChange = (validityCategoryId: string, index: number) => {
    const selectedProduct = resortCatalog.products.find(
      (product: Product) => product.validityCategory.id === validityCategoryId
    )
    if (selectedProduct) {
      setValue(`devices.${index}.productId`, selectedProduct.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground sm:text-sm">Devices</p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {fields.length === 0 ? "No devices added yet" : `${fields.length} device${fields.length > 1 ? 's' : ''} added`}
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            append({
              deviceId: "",
              productId: "",
              consumerCategoryId: "",
              insurance: false,
            })
          }
          size="sm"
          variant="outline"
          className="h-8 shrink-0 gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
          aria-label="Add new device"
        >
          <PlusIcon className="size-3 sm:size-4" />
          <span className="hidden sm:inline">Add Device</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Devices List */}
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center sm:py-8">
          <p className="text-xs text-muted-foreground sm:text-sm">No devices added yet</p>
          <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Click &ldquo;Add Device&rdquo; to get started</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {fields.map((field, i) => {
            const currentValues = getValues(`devices.${i}`)

            return (
              <div
                key={field.id}
                className="relative w-full space-y-4 rounded-lg border border-border bg-background/50 p-4"
              >
                {/* Remove Button - Top Right */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(i)}
                  aria-label={`Remove device ${i + 1}`}
                >
                  <XIcon className="size-4" />
                </Button>

                {/* Device ID Section */}
                <div className="w-full space-y-2 pr-10">
                  <label htmlFor={`device-${i}-id`} className="text-sm font-medium text-muted-foreground">Device ID</label>
                  <div className="flex w-full items-center gap-2">
                    <span className="shrink-0 text-sm font-medium text-foreground">LifePass</span>
                    <Controller
                      name={`devices.${i}.deviceId`}
                      control={control}
                      render={({ field }) => (
                        <DeviceIdInput
                          {...field}
                          index={i}
                          onEnterPress={() => handleDeviceEnterPress(i)}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Duration Selector */}
                <div className="w-full space-y-2">
                  <label htmlFor={`device-${i}-duration`} className="text-sm font-medium text-muted-foreground">Duration</label>
                  <Controller
                    name={`devices.${i}.productId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleValidityChange(value, i)
                        }}
                      >
                        <SelectTrigger id={`device-${i}-duration`} className="h-10 w-full" aria-label={`Select duration for device ${i + 1}`}>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {resortCatalog?.products.map((product: Product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id}
                            >
                              {product.validityCategory.value}{" "}
                              {product.validityCategory.unit.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Consumer Category Selector */}
                {currentValues.productId && (
                  <div className="w-full space-y-2">
                    <label htmlFor={`device-${i}-category`} className="text-sm font-medium text-muted-foreground">Category</label>
                    <Controller
                      name={`devices.${i}.consumerCategoryId`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger id={`device-${i}-category`} className="h-10 w-full" aria-label={`Select category for device ${i + 1}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {resortCatalog.products
                              .find(
                                (product: Product) =>
                                  product.id === currentValues.productId
                              )
                              ?.priceCategories?.map((priceCategory: priceCategory) => (
                                <SelectItem
                                  key={priceCategory.consumerCategoryId}
                                  value={priceCategory.consumerCategoryId}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm">
                                      {priceCategory.consumerCategoryData.name?.en}{" "}
                                      <span className="text-muted-foreground">
                                        ({priceCategory.consumerCategoryData.ageMin}-
                                        {priceCategory.consumerCategoryData.ageMax})
                                      </span>
                                    </span>
                                    <span className="text-sm font-semibold">
                                      €{priceCategory.price?.basePrice.amountGross}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}

                {/* Insurance Toggle - Bottom */}
                <div className="flex w-full items-center gap-2 border-t border-border pt-4">
                  <label htmlFor={`device-${i}-insurance`} className="text-sm font-medium text-foreground">Insurance</label>
                  <Controller
                    name={`devices.${i}.insurance`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id={`device-${i}-insurance`}
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        aria-label={`Toggle insurance for device ${i + 1}`}
                      />
                    )}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning: Unsuitable Device</AlertDialogTitle>
            <AlertDialogDescription>{_warningMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                _continueCallback()
                setShowWarningDialog(false)
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
