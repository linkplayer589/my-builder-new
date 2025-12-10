"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useResort } from "@/features/resorts"

import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { getMythOrder } from "../../orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/route"
import { type MythOrderDetails } from "../../orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/types"
import { ordersTableReturnLifepassApi } from "../../../orders-table-actions/orders-table-return-lifepass-api/route"
import { OrdersTableReturnLifepassDialog } from "../../orders-table-return-lifepass-dialog"
import { OrdersTableSwapPassDialog } from "../../orders-table-swap-pass-dialog"

interface OrdersTableOrderDetailsDropdownMythSectionProps {
  order: Order
  getProductName: (id: string) => { en: string; fr: string }
  getConsumerCategoryName: (id: string) => { en: string; fr: string }
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

/**
 * Product details display component
 */
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
          {productName.en ?? "N/A"} - {categoryName.en ?? "N/A"}
          {hasInsurance ? " (Insured)" : " (Not Insured)"}
        </span>
      </div>
    </div>
  )
}

/**
 * Device actions component with swap and return functionality
 */
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
  const [isSwapOpen, setIsSwapOpen] = React.useState(false)
  const [isReturnOpen, setIsReturnOpen] = React.useState(false)

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

/**
 * Myth section for order details dropdown
 *
 * @description
 * Displays Myth order submission data including:
 * - Order ID, group ID, auth code
 * - Contact details
 * - Device information with swap/return actions
 * - Registration details with QR code
 * - Real-time refresh capability
 * - Return all devices functionality
 */
export function OrdersTableOrderDetailsDropdownMythSection({
  order,
  getProductName,
  getConsumerCategoryName,
}: OrdersTableOrderDetailsDropdownMythSectionProps) {
  const { resortId } = useResort()
  const mythOrderSubmissionData = order.mythOrderSubmissionData
  const [showReturnAllConfirm, setShowReturnAllConfirm] = React.useState(false)

  // Track if this is a manual refetch vs initial load
  const isManualRefetch = React.useRef(false)

  const query = useQuery<MythOrderDetails & { updatedAt?: string }, Error>({
    queryKey: ["mythOrder", mythOrderSubmissionData?.orderId],
    queryFn: async () => {
      try {
        const response = await getMythOrder(Number(mythOrderSubmissionData!.orderId))
        if (!response.success) {
          const errorResponse = response as unknown as {
            success: false
            error: string
          }
          const errorMessage = errorResponse.error || "Failed to fetch order details"
          throw new Error(errorMessage)
        }

        if (!response.orderDetails) {
          throw new Error("No order details in response")
        }

        if (isManualRefetch.current) {
          toast.success("Order details refreshed")
          isManualRefetch.current = false
        }

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
    enabled: Boolean(mythOrderSubmissionData?.orderId),
    retry: 1,
  })

  const { data: orderData, refetch, isLoading, isFetching, error } = query
  const displayData = orderData || mythOrderSubmissionData

  if (!mythOrderSubmissionData) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">No Myth data available for this order</p>
      </div>
    )
  }

  const handleRefresh = () => {
    isManualRefetch.current = true
    void refetch()
  }

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
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Myth Order Details</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated:{" "}
            {orderData?.updatedAt ? new Date(orderData.updatedAt).toLocaleString() : "N/A"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
            disabled={isFetching}
          >
            <ReloadIcon className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
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
          {/* Order Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-md border p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Order ID:</span>
                <span className="text-muted-foreground">{displayData?.orderId || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Group ID:</span>
                <span className="text-muted-foreground">{displayData?.groupId || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Auth Code:</span>
                <span className="text-muted-foreground">{displayData?.authCode || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Status:</span>
                <span className="text-muted-foreground">{displayData?.status || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">From:</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground">
                    {displayData?.from ? new Date(displayData.from).toLocaleDateString() : "N/A"}
                  </span>
                  {displayData?.from && <RelativeDayBadge date={new Date(displayData.from)} />}
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">To:</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground">
                    {displayData?.to ? new Date(displayData.to).toLocaleDateString() : "N/A"}
                  </span>
                  {displayData?.to && <RelativeDayBadge date={new Date(displayData.to)} />}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          {displayData?.contactDetails && (
            <div className="space-y-2">
              <h4 className="font-medium">Contact Details</h4>
              <div className="rounded-md border p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Name:</span>
                    <span className="text-muted-foreground">
                      {displayData.contactDetails.contactName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">
                      {displayData.contactDetails.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Phone:</span>
                    <span className="text-muted-foreground">
                      {displayData.contactDetails.telephone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Devices with Actions */}
          {displayData?.devices && displayData.devices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Devices ({displayData.devices.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReturnAllConfirm(true)}
                  disabled={!displayData?.devices?.some((d) => d.deviceCode)}
                >
                  Return All Devices
                </Button>
              </div>
              <div className="space-y-2">
                {displayData.devices.map((device: Device) => (
                  <div key={device.id} className="rounded-md border p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Device Code:</span>
                          <span className="text-muted-foreground">
                            {device?.deviceCode || "No device assigned"}
                          </span>
                        </div>
                        <ProductDetails
                          productId={device?.productId || ""}
                          consumerCategoryId={device?.consumerCategoryId || ""}
                          hasInsurance={device?.insurance || false}
                        />
                      </div>
                      {device?.deviceCode && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">IMEI:</span>
                            <span className="text-muted-foreground">{device?.imei || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">DTA Code:</span>
                            <span className="text-muted-foreground">
                              {device?.dtaCode || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Battery:</span>
                            <span className="text-muted-foreground">{device?.battery || 0}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Status:</span>
                            <span className="text-muted-foreground">
                              {device?.deviceAllocated ? "Allocated" : "Not Allocated"}{" "}
                              • {device?.connected ? "Connected" : "Disconnected"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Device Actions */}
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
          )}

          {/* Registration */}
          {displayData?.registrationUrl && (
            <div className="space-y-2">
              <h4 className="font-medium">Registration</h4>
              <div className="rounded-md border p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">URL:</span>
                  <a
                    href={displayData.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open Registration
                  </a>
                </div>
                <div className="mt-4 flex justify-center">
                  {displayData?.registrationUrlBase64QrCode ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayData.registrationUrlBase64QrCode}
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
          )}
        </div>
      )}

      {/* Return All Confirmation Dialog */}
      <Dialog open={showReturnAllConfirm} onOpenChange={setShowReturnAllConfirm}>
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
    </div>
  )
}
