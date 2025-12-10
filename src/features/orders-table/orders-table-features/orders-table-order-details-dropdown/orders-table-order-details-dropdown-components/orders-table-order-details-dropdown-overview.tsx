"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"

import { getMythOrder } from "../../orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/route"
import { type MythOrderDetails } from "../../orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/types"
import { OrdersTableOrderDetailsDropdownDeviceCard } from "./orders-table-order-details-dropdown-device-card"

interface TOrderDevice {
  id: string
  deviceCode?: string
  productId?: string
  consumerCategoryId?: string
  insurance?: boolean
  imei?: string
  battery?: number
  dtaCode?: string
  nickname?: string
  connected?: boolean
  deviceAllocated?: boolean
}

interface OrdersTableOrderDetailsDropdownOverviewProps {
  order: Order
  getProductName: (id: string) => { en: string; fr: string }
  getConsumerCategoryName: (id: string) => { en: string; fr: string }
}

/**
 * Overview section for order details dropdown
 *
 * @description
 * Displays high-level order information including:
 * - Order ID, status, and dates
 * - Client details
 * - Order items and pricing
 * - Sales channel information
 */
export function OrdersTableOrderDetailsDropdownOverview({
  order,
  getProductName,
  getConsumerCategoryName,
}: OrdersTableOrderDetailsDropdownOverviewProps) {
  // Fetch current Myth data to compare with original submission
  const { data: currentMythData, refetch, isFetching } = useQuery<MythOrderDetails & { updatedAt?: string }, Error>({
    queryKey: ["mythOrderCurrent", order.mythOrderSubmissionData?.orderId],
    queryFn: async () => {
      if (!order.mythOrderSubmissionData?.orderId) throw new Error("No Myth order ID")

      const response = await getMythOrder(Number(order.mythOrderSubmissionData.orderId))
      if (!response.success || !response.orderDetails) {
        throw new Error("Failed to fetch current order details")
      }

      return {
        ...response.orderDetails,
        updatedAt: response.updatedAt,
      }
    },
    enabled: Boolean(order.mythOrderSubmissionData?.orderId),
    retry: 1,
  })

  // Get original devices from submission
  const originalDevices = (order.mythOrderSubmissionData?.devices || []) as TOrderDevice[]

  // Get current device codes to determine which are returned
  const currentDeviceCodes = new Set(
    (currentMythData?.devices || [])
      .map((d) => (d as TOrderDevice).deviceCode)
      .filter((code): code is string => Boolean(code))
  )

  // Check if device has skidata record
  const hasSkidataRecord = (deviceCode?: string) => {
    if (!deviceCode || !order.skidataOrderSubmissionData) return false
    // Check if this device code appears in any skidata ticket identifications
    return false // Will be implemented when we have the skidata data structure
  }

  // Get all available device codes for swap functionality
  const allDeviceCodes = originalDevices
    .map(d => d.deviceCode)
    .filter((code): code is string => Boolean(code))

  return (
    <div className="space-y-6">
      {/* Order Information */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Order Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-md border p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Order ID:</span>
              <span className="text-muted-foreground">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Order Status:</span>
              <Badge variant="outline" className="capitalize">
                {order.orderStatus.replace(/-/g, " ")}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Payment Status:</span>
              <Badge variant="outline" className="capitalize">
                {order.paymentStatus.replace(/-/g, " ")}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sales Channel:</span>
              <span className="text-muted-foreground">{order.salesChannel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Test Order:</span>
              <Badge variant={order.testOrder ? "destructive" : "outline"}>
                {order.testOrder ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Created At:</span>
              <span className="text-muted-foreground">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
            {order.orderDetails?.startDate && (
              <div className="flex justify-between text-sm">
                <span className="font-medium">Start Date:</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground">
                    {new Date(order.orderDetails.startDate).toLocaleDateString()}
                  </span>
                  <RelativeDayBadge date={new Date(order.orderDetails.startDate)} />
                </div>
              </div>
            )}
            {order.orderDetails?.endDate && (
              <div className="flex justify-between text-sm">
                <span className="font-medium">End Date:</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground">
                    {new Date(order.orderDetails.endDate).toLocaleDateString()}
                  </span>
                  <RelativeDayBadge date={new Date(order.orderDetails.endDate)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Details */}
      {order.clientDetails && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Client Information</h3>
          <div className="rounded-md border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Name:</span>
                  <span className="text-muted-foreground">
                    {order.clientDetails.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Email:</span>
                  <span className="text-muted-foreground">{order.clientDetails.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Mobile:</span>
                  <span className="text-muted-foreground">
                    {order.clientDetails.mobile || "N/A"}
                  </span>
                </div>
                {order.clientDetails.languageCode && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Language:</span>
                    <span className="uppercase text-muted-foreground">
                      {order.clientDetails.languageCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Management Section */}
      {originalDevices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Devices & Passes ({originalDevices.length})
            </h3>
            {order.mythOrderSubmissionData?.orderId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                <ReloadIcon className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {originalDevices.map((device, index) => {
              const isReturned = device.deviceCode
                ? !currentDeviceCodes.has(device.deviceCode)
                : false

              return (
                <OrdersTableOrderDetailsDropdownDeviceCard
                  key={device.id || index}
                  device={device}
                  isReturned={isReturned}
                  hasSkidataRecord={hasSkidataRecord(device.deviceCode)}
                  orderId={order.id}
                  resortId={order.resortId}
                  getProductName={getProductName}
                  getConsumerCategoryName={getConsumerCategoryName}
                  allDeviceCodes={allDeviceCodes}
                  onActionComplete={() => void refetch()}
                />
              )
            })}
          </div>

          {isFetching && (
            <div className="flex items-center justify-center py-4">
              <ReloadIcon className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Pricing Information */}
      {order.calculatedOrderPrice && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Pricing</h3>
          <div className="rounded-md border p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Start Date:</span>
                <span className="text-muted-foreground">
                  {order.calculatedOrderPrice.startDate}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Days Validity:</span>
                <span className="text-muted-foreground">
                  {order.calculatedOrderPrice.daysValidity}
                </span>
              </div>
              {order.calculatedOrderPrice.cumulatedPrice?.bestPrice && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Net Amount:</span>
                    <span className="text-muted-foreground">
                      {order.calculatedOrderPrice.cumulatedPrice.bestPrice.amountNet.toFixed(2)}{" "}
                      {order.calculatedOrderPrice.cumulatedPrice.bestPrice.currencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Gross Amount:</span>
                    <span>
                      {order.calculatedOrderPrice.cumulatedPrice.bestPrice.amountGross.toFixed(2)}{" "}
                      {order.calculatedOrderPrice.cumulatedPrice.bestPrice.currencyCode}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

