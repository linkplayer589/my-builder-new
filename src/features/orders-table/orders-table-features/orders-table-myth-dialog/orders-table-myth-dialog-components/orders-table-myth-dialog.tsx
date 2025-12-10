/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ordersTableReturnLifepassApi } from "../../../orders-table-actions/orders-table-return-lifepass-api/route"
// Swap now handled internally by the dialog via process buttons
import { OrdersTableReturnLifepassDialog } from "../../orders-table-return-lifepass-dialog"
import { OrdersTableSwapPassDialog } from "../../orders-table-swap-pass-dialog"
import { getMythOrder } from "../orders-table-myth-dialog-actions/get-myth-order/route"
import { type MythOrderDetails } from "../orders-table-myth-dialog-actions/get-myth-order/types"

export interface MythDialogProps {
  mythOrderSubmissionData: MythOrderDetails
  /** Optional controlled open state (for mobile) */
  open?: boolean
  /** Optional controlled open state handler (for mobile) */
  onOpenChange?: (open: boolean) => void
  /** Optional pre-calculated button status (from order data) */
  buttonStatus?: { text: string; className?: string }
}

// Add a new component for displaying product details
function ProductDetails({
  productId,
  consumerCategoryId,
  hasInsurance,
}: {
  productId: string
  consumerCategoryId: string
  hasInsurance: boolean
}) {
  const { getProductName, getConsumerCategoryName } = useResort()

  const productName = getProductName(productId)
  const categoryName = getConsumerCategoryName(consumerCategoryId)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Product:</span>
        <span className="text-muted-foreground">
          <span className="text-muted-foreground">
            {productName.en ?? "N/A"} - {categoryName.en ?? "N/A"}
            {hasInsurance ? " (Insured)" : " (Not Insured)"}
          </span>
        </span>
      </div>
    </div>
  )
}

interface Device {
  id: string
  deviceCode: string | null
  imei?: string
  dtaCode?: string
  battery?: number
  deviceAllocated?: boolean
  connected?: boolean
  productId?: string
  consumerCategoryId?: string
  insurance?: boolean
}

function DeviceActions({
  device,
  onSuccess,
  orderId,
  resortId,
}: {
  device: Device
  onSuccess: () => void
  orderId: number
  resortId: number
}) {
  const [isSwapOpen, setIsSwapOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  // Swap handled in dialog (process buttons)

  const handleReturn = async (deviceIds: string[]) => {
    try {
      const result = await ordersTableReturnLifepassApi(deviceIds)
      if (result.success) {
        toast.success(result.message)
        setIsReturnOpen(false)
        onSuccess()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to return lifepass")
    }
  }

  const deviceCodes = [device.deviceCode].filter(
    (code): code is string => code !== null
  )

  return (
    <div className="mt-2 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSwapOpen(true)}
        disabled={!device.deviceCode}
      >
        Swap Pass
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsReturnOpen(true)}
        disabled={!device.deviceCode}
      >
        Return Pass
      </Button>

      <OrdersTableSwapPassDialog
        open={isSwapOpen}
        onOpenChange={setIsSwapOpen}
        orderId={orderId}
        resortId={resortId}
        deviceCodes={deviceCodes}
        deviceDetailsByCode={(() => {
          const devices = (deviceCodes || []).map((code) => {
            const match = (typeof device === 'object' && device.deviceCode === code) ? device : undefined
            return match ? { code, productId: match.productId, consumerCategoryId: match.consumerCategoryId } : undefined
          }).filter(Boolean) as Array<{ code: string; productId?: string; consumerCategoryId?: string }>
          const map: Record<string, { productId: string; consumerCategoryId: string }> = {}
          devices.forEach((d) => {
            if (d.productId && d.consumerCategoryId) {
              map[d.code] = { productId: d.productId, consumerCategoryId: d.consumerCategoryId }
            }
          })
          return map
        })()}
        previousSkidataOrderId={undefined}
        defaultOldPassId={device.deviceCode ?? undefined}
      />
      <OrdersTableReturnLifepassDialog
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        onReturn={handleReturn}
        deviceCodes={deviceCodes}
      />
    </div>
  )
}

export function MythDialog({
  mythOrderSubmissionData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  buttonStatus: providedButtonStatus,
}: MythDialogProps) {
  const { resortId } = useResort()
  const queryClient = useQueryClient()

  const [internalOpen, setInternalOpen] = useState(false)
  const [showReturnAllConfirm, setShowReturnAllConfirm] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const query = useQuery<MythOrderDetails & { updatedAt?: string }, Error>({
    queryKey: ["mythOrder", mythOrderSubmissionData.orderId],
    queryFn: async () => {
      try {
        const response = await getMythOrder(
          Number(mythOrderSubmissionData.orderId)
        )
        if (!response.success) {
          const errorResponse = response as unknown as {
            success: false
            error: string
            meta?: unknown
          }
          const errorMessage =
            errorResponse.error || "Failed to fetch order details"
          toast.error(errorMessage)
          throw new Error(errorMessage)
        }

        if (!response.orderDetails) {
          throw new Error("No order details in response")
        }

        toast.success("Order details refreshed")
        return {
          ...response.orderDetails,
          updatedAt: response.updatedAt,
        }
      } catch (err) {
        const error = err as Error
        const errorMessage = error?.message || "Failed to fetch order details"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    enabled: open,
    retry: 1,
    staleTime: Infinity, // Keep cached data fresh forever
  })

  const { data: orderData, refetch, isLoading, isFetching, error } = query

  // Get cached data for button status (before dialog opens)
  const cachedOrderData = queryClient.getQueryData<MythOrderDetails & { updatedAt?: string }>([
    "mythOrder",
    mythOrderSubmissionData.orderId,
  ])

  // Use fetched data if available, otherwise use cached data, then fall back to initial prop data
  const displayData = orderData ?? cachedOrderData ?? mythOrderSubmissionData

  // Determine button status based on active passes and end date
  // Check if there are active devices (devices with deviceCode AND deviceAllocated: true)
  // A device with deviceCode but deviceAllocated: false means it's been returned
  // More robust check: ensure devices array exists, has items, and at least one has a valid deviceCode AND is allocated
  const hasActivePasses = Array.isArray(displayData?.devices) && displayData.devices.length > 0
    ? displayData.devices.some((device) => {
        const deviceCode = device?.deviceCode
        const isAllocated = device?.deviceAllocated === true
        const hasValidDeviceCode = deviceCode !== null && deviceCode !== undefined && String(deviceCode).trim() !== ""
        // Device is active only if it has a valid deviceCode AND is allocated
        return hasValidDeviceCode && isAllocated
      })
    : false
  const endDate = displayData?.to ? new Date(displayData.to) : null
  // Compare dates properly - order is overdue only if current time is strictly past the end date/time
  // Only mark as past if the date is valid and current time exceeds it
  const isPastEndDate = endDate && !isNaN(endDate.getTime())
    ? new Date().getTime() > endDate.getTime()
    : false

  const getMythButtonStatus = () => {
    // If no active devices (empty array or no devices with deviceCode), show "Returned"
    if (!hasActivePasses) {
      return { text: "Returned", className: undefined }
    }
    // If has active passes and past end date, show "OVERDUE"
    if (hasActivePasses && isPastEndDate) {
      return { text: "OVERDUE", className: "bg-yellow-500 text-white hover:bg-yellow-600" }
    }
    // If has active passes and before end date, show "Active"
    if (hasActivePasses && !isPastEndDate) {
      return { text: "Active", className: "bg-green-600 text-white hover:bg-green-700" }
    }
    return { text: "Submitted", className: undefined }
  }

  // Use provided button status if available, otherwise calculate from data
  const mythButtonStatus = providedButtonStatus ?? getMythButtonStatus()

  const handleReturnAll = async () => {
    if (!displayData?.devices) {
      toast.error("No devices available")
      return
    }

    const deviceCodes = displayData.devices
      .map((device: { deviceCode?: string | null }) => device?.deviceCode)
      .filter((code): code is string => code !== null && code !== undefined)

    if (deviceCodes.length === 0) {
      toast.error("No devices to return")
      return
    }

    try {
      const result = await ordersTableReturnLifepassApi(deviceCodes)
      if (result.success) {
        toast.success(result.message)
        void refetch()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to return lifepasses")
    } finally {
      setShowReturnAllConfirm(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Only show trigger if not controlled (desktop mode) */}
        {controlledOpen === undefined && (
          <DialogTrigger asChild>
            {mythButtonStatus.className ? (
              <Button className={mythButtonStatus.className}>{mythButtonStatus.text}</Button>
            ) : (
              <Button variant="outline">{mythButtonStatus.text}</Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Myth Details</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="orderData">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orderData">Order Data</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
            </TabsList>

            <TabsContent value="orderData" className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {orderData?.updatedAt
                    ? new Date(orderData.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await refetch()
                    } catch (error) {
                      toast.error("Failed to refresh order details")
                    }
                  }}
                  className="gap-2"
                  disabled={isFetching}
                >
                  <ReloadIcon
                    className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <ReloadIcon className="size-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Order ID:</span>
                      <span className="text-muted-foreground">
                        {displayData?.orderId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Group ID:</span>
                      <span className="text-muted-foreground">
                        {displayData?.groupId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Auth Code:</span>
                      <span className="text-muted-foreground">
                        {displayData?.authCode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Status:</span>
                      <span className="text-muted-foreground">
                        {displayData?.status || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">From:</span>
                      <span className="text-muted-foreground">
                        <RelativeDayBadge
                          date={
                            displayData?.from
                              ? new Date(displayData.from)
                              : new Date()
                          }
                        />
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">To:</span>
                      <span className="text-muted-foreground">
                        <RelativeDayBadge
                          date={
                            displayData?.to
                              ? new Date(displayData.to)
                              : new Date()
                          }
                        />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Contact Details</h4>
                    <div className="space-y-2 rounded-md border p-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">
                          {displayData?.contactDetails?.telephone || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Email:</span>
                        <span className="text-muted-foreground">
                          {displayData?.contactDetails?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Contact Name:</span>
                        <span className="text-muted-foreground">
                          {displayData?.contactDetails?.contactName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Devices</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReturnAllConfirm(true)}
                        disabled={
                          !displayData?.devices?.some((d) => d.deviceCode)
                        }
                      >
                        Return All Devices
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {(displayData?.devices || []).map((device) => (
                        <div
                          key={device.id}
                          className="space-y-2 rounded-md border p-4"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Device Code:</span>
                            <span className="text-muted-foreground">
                              {device?.deviceCode || "No device assigned"}
                            </span>
                          </div>
                          <ProductDetails
                            productId={device?.productId || ""}
                            consumerCategoryId={
                              device?.consumerCategoryId || ""
                            }
                            hasInsurance={device?.insurance || false}
                          />
                          {device?.deviceCode ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">IMEI:</span>
                                <span className="text-muted-foreground">
                                  {device?.imei || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">DTA Code:</span>
                                <span className="text-muted-foreground">
                                  {device?.dtaCode || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Battery:</span>
                                <span className="text-muted-foreground">
                                  {device?.battery || 0}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Status:</span>
                                <span className="text-muted-foreground">
                                  {device?.deviceAllocated
                                    ? "Allocated"
                                    : "Not Allocated"}{" "}
                                  •{" "}
                                  {device?.connected
                                    ? "Connected"
                                    : "Disconnected"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm italic text-muted-foreground">
                              No device details available
                            </div>
                          )}
                          <DeviceActions
                            device={device}
                            onSuccess={refetch}
                            orderId={Number(displayData?.orderId) || 0}
                            resortId={resortId}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Registration</h4>
                    <div className="space-y-2 rounded-md border p-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">URL:</span>
                        <a
                          href={displayData?.registrationUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Open Registration
                        </a>
                      </div>
                      <div className="flex justify-center p-4">
                        {displayData?.registrationUrlBase64QrCode ? (
                          <img
                            src={displayData?.registrationUrlBase64QrCode || ""}
                            alt="Registration QR Code"
                            className="max-w-[200px]"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            QR Code not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {mythOrderSubmissionData?.updatedAt ? (
                    <RelativeDayBadge
                      date={new Date(mythOrderSubmissionData.updatedAt)}
                    />
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Order ID:</span>
                    <span className="text-muted-foreground">
                      {mythOrderSubmissionData.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Group ID:</span>
                    <span className="text-muted-foreground">
                      {mythOrderSubmissionData.groupId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Auth Code:</span>
                    <span className="text-muted-foreground">
                      {mythOrderSubmissionData.authCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Status:</span>
                    <span className="text-muted-foreground">
                      {mythOrderSubmissionData.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">From:</span>
                    <span className="text-muted-foreground">
                      <RelativeDayBadge
                        date={
                          mythOrderSubmissionData?.from
                            ? new Date(mythOrderSubmissionData.from)
                            : new Date()
                        }
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">To:</span>
                    <span className="text-muted-foreground">
                      <RelativeDayBadge
                        date={
                          mythOrderSubmissionData?.to
                            ? new Date(mythOrderSubmissionData.to)
                            : new Date()
                        }
                      />
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Contact Details</h4>
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Phone:</span>
                      <span className="text-muted-foreground">
                        {mythOrderSubmissionData?.contactDetails?.telephone ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">
                        {mythOrderSubmissionData?.contactDetails?.email ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Contact Name:</span>
                      <span className="text-muted-foreground">
                        {mythOrderSubmissionData?.contactDetails?.contactName ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Devices</h4>
                  <div className="space-y-4">
                    {(mythOrderSubmissionData?.devices || []).map((device) => (
                      <div
                        key={device.id}
                        className="space-y-2 rounded-md border p-4"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Device Code:</span>
                          <span className="text-muted-foreground">
                            {device?.deviceCode || "No device assigned"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">IMEI:</span>
                          <span className="text-muted-foreground">
                            {device?.imei || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">DTA Code:</span>
                          <span className="text-muted-foreground">
                            {device?.dtaCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Battery:</span>
                          <span className="text-muted-foreground">
                            {device?.battery || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Status:</span>
                          <span className="text-muted-foreground">
                            {device?.deviceAllocated
                              ? "Allocated"
                              : "Not Allocated"}{" "}
                            • {device?.connected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        <ProductDetails
                          productId={device?.productId || ""}
                          consumerCategoryId={device?.consumerCategoryId || ""}
                          hasInsurance={device?.insurance || false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Registration</h4>
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">URL:</span>
                      <a
                        href={mythOrderSubmissionData.registrationUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Open Registration
                      </a>
                    </div>
                    <div className="flex justify-center p-4">
                      {mythOrderSubmissionData?.registrationUrlBase64QrCode ? (
                        <img
                          src={
                            mythOrderSubmissionData?.registrationUrlBase64QrCode ||
                            ""
                          }
                          alt="Registration QR Code"
                          className="max-w-[200px]"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          QR Code not available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showReturnAllConfirm}
        onOpenChange={setShowReturnAllConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Return All Passes</DialogTitle>
            <DialogDescription>
              Are you sure you want to return all passes for this order? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button variant="destructive" onClick={handleReturnAll}>
              Return All
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReturnAllConfirm(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
