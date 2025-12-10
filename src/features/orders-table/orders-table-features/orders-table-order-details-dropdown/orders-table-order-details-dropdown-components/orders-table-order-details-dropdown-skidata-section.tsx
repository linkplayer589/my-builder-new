"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useDevices } from "@/db/server-actions/devices-actions/devices-hooks/use-devices-hook"

import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getSkidataOrder } from "../../orders-table-skidata-dialog/orders-table-skidata-dialog-actions/get-skidata-order/route"
import { ordersTableSkidataCancelOrdersApi } from "../../orders-table-skidata-dialog/orders-table-skidata-dialog-actions/cancel-orders/route"
import { ordersTableSkidataCancelTicketItemApi } from "../../orders-table-skidata-dialog/orders-table-skidata-dialog-actions/cancel-ticket-item/route"
import type { SkidataOrder, SkidataGetOrderResponse, OrderItem, TicketItem, Attribute, Identification } from "@/types/skidata-types"

interface OrdersTableOrderDetailsDropdownSkidataSectionProps {
  order: Order
  getProductName: (id: string) => { en: string; fr: string }
  getConsumerCategoryName: (id: string) => { en: string; fr: string }
}

/**
 * Type guard to check if orderDetails is a SkidataOrder object
 */
function isSkidataOrder(orderDetails: SkidataOrder | string | undefined): orderDetails is SkidataOrder {
  return typeof orderDetails === "object" && orderDetails !== null && "orderId" in orderDetails
}

/**
 * Checks if a ticket is cancelled
 */
function isTicketCancelled(ticket: TicketItem): boolean {
  const ps = (ticket.permissionStatus || "").toLowerCase()
  const ss = (ticket.salesStatus || "").toLowerCase()
  return ps.includes("cancel") || ss.includes("cancel")
}

/**
 * Gets all tickets from a Skidata order response entry
 */
function getAllTicketsFromEntry(entry: SkidataGetOrderResponse): TicketItem[] {
  if (!isSkidataOrder(entry.orderDetails)) return []
  const od = entry.orderDetails
  if (!Array.isArray(od.orderItems)) return []
  return od.orderItems.flatMap((item: OrderItem) => Array.isArray(item.ticketItems) ? item.ticketItems : [])
}

/**
 * Checks if an entry has any active (non-cancelled) tickets
 */
function entryHasActiveTickets(entry: SkidataGetOrderResponse): boolean {
  const allTickets = getAllTicketsFromEntry(entry)
  return allTickets.some((t) => !isTicketCancelled(t))
}

/**
 * Skidata section for order details dropdown
 *
 * @description
 * Displays Skidata order submission data including:
 * - Order information
 * - Seller and price details
 * - Order items with cancel functionality
 * - Ticket details with cancel functionality
 * - Device identifier display
 * - Real-time refresh capability
 */
export function OrdersTableOrderDetailsDropdownSkidataSection({
  order,
  getProductName,
  getConsumerCategoryName,
}: OrdersTableOrderDetailsDropdownSkidataSectionProps) {
  const skidataOrderSubmissionData = order.skidataOrderSubmissionData
  const { serialMap } = useDevices()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [errorObj, setErrorObj] = React.useState<Record<string, unknown> | null>(null)

  // Track if this is a manual refetch vs initial load
  const isManualRefetch = React.useRef(false)

  const { data: orderData, refetch, isLoading, isFetching } = useQuery({
    queryKey: ["skidataOrder", skidataOrderSubmissionData?.orderId],
    queryFn: async () => {
      try {
        const response = await getSkidataOrder(
          order.resortId,
          skidataOrderSubmissionData!.orderId,
          order.id
        )
        if (Array.isArray(response)) {
          if (isManualRefetch.current) {
            toast.success("Skidata details refreshed")
            isManualRefetch.current = false
          }
          return response
        }
        return [] as unknown as typeof response
      } catch (error) {
        toast.error("Failed to refresh Skidata details")
        throw error
      }
    },
    enabled: Boolean(skidataOrderSubmissionData?.orderId),
    retry: 1,
  })

  if (!skidataOrderSubmissionData) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">No Skidata data available for this order</p>
      </div>
    )
  }

  const handleRefresh = () => {
    isManualRefetch.current = true
    void refetch()
  }

  async function handleCancelOrder(orderIdToCancel: string) {
    try {
      setErrorMsg(null)
      setErrorObj(null)
      const res = await ordersTableSkidataCancelOrdersApi({ orderIds: [orderIdToCancel], resortId: order.resortId })
      if (res?.success) {
        toast.success("Order cancelled")
        await refetch()
      } else {
        toast.error("Failed to cancel order")
        setErrorMsg("Skidata cancel order failed")
        setErrorObj(res as Record<string, unknown>)
      }
    } catch (e) {
      toast.error("Failed to cancel order")
      setErrorMsg(e instanceof Error ? e.message : "Unknown error")
      setErrorObj(null)
    }
  }

  async function handleCancelTicketItem(args: {
    orderId: string
    orderItemId: string
    ticketItemId: string
    productId: string
    consumerCategoryId: string
  }) {
    try {
      setErrorMsg(null)
      setErrorObj(null)
      const res = await ordersTableSkidataCancelTicketItemApi({
        orderId: args.orderId,
        orderItemId: args.orderItemId,
        ticketItemIdList: [args.ticketItemId],
        cancelationDate: new Date().toISOString(),
        resortId: order.resortId,
        productId: args.productId,
        consumerCategoryId: args.consumerCategoryId,
      })
      if (res?.success) {
        toast.success("Ticket cancelled")
        await refetch()
      } else {
        toast.error("Failed to cancel ticket")
        setErrorMsg(`Skidata cancel ticket failed (ticketId=${args.ticketItemId})`)
        setErrorObj(res as Record<string, unknown>)
      }
    } catch (e) {
      toast.error("Failed to cancel ticket")
      setErrorMsg(e instanceof Error ? e.message : "Unknown error")
      setErrorObj(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {errorMsg && (
        <>
          <Alert variant="destructive">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
          {errorObj && (
            <div className="overflow-auto rounded-md border bg-muted/30 p-2 text-xs">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(errorObj, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skidata Order Details</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {Array.isArray(orderData)
              ? (() => {
                  const ts = orderData
                    .map((o) => (typeof o.updatedAt === "string" ? new Date(o.updatedAt).getTime() : 0))
                    .filter((t) => t > 0)
                    .sort((a, b) => b - a)[0]
                  return ts ? new Date(ts).toLocaleString() : "N/A"
                })()
              : "N/A"}
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
      ) : Array.isArray(orderData) && orderData.length > 0 ? (
        <Tabs defaultValue={orderData[0]?.skidataOrderId ?? ""}>
          <TabsList className="w-full overflow-x-auto">
            {orderData.map((entry, idx) => (
              <TabsTrigger key={entry.skidataOrderId + idx} value={entry.skidataOrderId}>
                Submission {idx + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {orderData.map((entry, idx) => (
            <TabsContent key={entry.skidataOrderId + "-content-" + idx} value={entry.skidataOrderId} className="space-y-4">
              {entry.success && entry.orderDetails && isSkidataOrder(entry.orderDetails) ? (
                <>
                  {/* Order Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-md border p-4">
                      <h4 className="font-medium">Order Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order ID:</span>
                          <span>{entry.orderDetails.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span>{new Date(entry.orderDetails.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">System Date:</span>
                          <span>{new Date(entry.orderDetails.systemDate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confirmation:</span>
                          <span>{entry.orderDetails.confirmationNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-md border p-4">
                      <h4 className="font-medium">Seller & Price Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Channel:</span>
                          <span>{entry.orderDetails.seller.saleschannelShortName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">POS Name:</span>
                          <span>{entry.orderDetails.seller.pointOfSaleName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">POS Type:</span>
                          <span>{entry.orderDetails.seller.posType}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span>
                            {entry.orderDetails.totalPrice.amountGross} {entry.orderDetails.totalPrice.currencyCode}
                          </span>
                        </div>
                      </div>
                      {/* Cancel Order Button */}
                      {entryHasActiveTickets(entry) ? (
                        <div className="mt-2 flex justify-end">
                          <Button
                            className="bg-green-600 text-white hover:bg-green-700"
                            size="sm"
                            onClick={() => handleCancelOrder(entry.orderDetails.orderId)}
                            disabled={isFetching}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 flex justify-end">
                          <span className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">All tickets cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Order Items</h4>
                      <span className="text-sm text-muted-foreground">
                        {entry.orderDetails.orderItems.length} items
                      </span>
                    </div>
                    <div className="space-y-3">
                      {entry.orderDetails.orderItems.map((item: OrderItem) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="grid grid-cols-2 gap-x-8 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Item ID:</span>
                                <span className="font-mono">{item.id}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Product ID:</span>
                                  <span className="font-mono">{item.productId} ({getProductName(item.productId).en})</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Consumer Category:</span>
                                  <span className="font-mono">{item.consumerCategoryId} ({getConsumerCategoryName(item.consumerCategoryId).en})</span>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span>{item.salesStatus}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span>{item.amountGross}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span>{item.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Depot Ticket:</span>
                                <span>{item.isDepotTicket ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Valid From:</span>
                                <div className="flex items-center gap-2">
                                  <span>{new Date(item.validFrom).toLocaleString()}</span>
                                  <RelativeDayBadge date={item.validFrom} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tickets */}
                          {item.ticketItems.length > 0 && (
                            <div className="mt-4 space-y-2 border-t pt-4">
                              <h5 className="text-sm font-medium">Tickets ({item.ticketItems.length})</h5>
                              <div className="grid gap-2">
                                {item.ticketItems.map((ticket: TicketItem) => (
                                  <div key={ticket.id} className="rounded border bg-muted/30 p-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Serial:</span>
                                          <span>{ticket.permissionSerialNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Permission ID:</span>
                                          <span>{ticket.permissionId}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span>{ticket.permissionStatus}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Valid Until:</span>
                                          <div className="flex items-center gap-2">
                                            <span>
                                              {ticket.attributes?.find((attr: Attribute) => attr.key === "dta-validity-end")?.value
                                                ? new Date(
                                                    ticket.attributes.find((attr: Attribute) => attr.key === "dta-validity-end")!.value
                                                  ).toLocaleString()
                                                : "N/A"}
                                            </span>
                                            {ticket.attributes?.find((attr: Attribute) => attr.key === "dta-validity-end")?.value && (
                                              <RelativeDayBadge
                                                date={ticket.attributes.find((attr: Attribute) => attr.key === "dta-validity-end")!.value}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {/* Device Identifiers */}
                                      {ticket.identifications && ticket.identifications.length > 0 && (
                                        <div className="col-span-2 mt-2 space-y-1 border-t pt-2">
                                          <span className="text-sm font-medium">Device Identifiers:</span>
                                          {ticket.identifications.map((id: Identification, index: number) => {
                                            const device = serialMap.get(id.serialNumber)
                                            return (
                                              <div key={index} className="flex items-center gap-2 text-sm">
                                                {device ? (
                                                  <span className="font-mono">Device {device.id}</span>
                                                ) : (
                                                  <span className="font-mono text-muted-foreground">No Device</span>
                                                )}
                                                <span className="text-muted-foreground">→</span>
                                                <span className="font-mono">DTA: {id.serialNumber}</span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      {/* Cancel Ticket Button */}
                                      {!isTicketCancelled(ticket) && (
                                        <div className="col-span-2 mt-2 flex justify-end">
                                          <Button
                                            className="bg-green-600 text-white hover:bg-green-700"
                                            size="sm"
                                            onClick={() => handleCancelTicketItem({
                                              orderId: entry.orderDetails.orderId,
                                              orderItemId: item.id,
                                              ticketItemId: ticket.id,
                                              productId: item.productId,
                                              consumerCategoryId: item.consumerCategoryId,
                                            })}
                                            disabled={isFetching}
                                          >
                                            Cancel Ticket
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  Submission {idx + 1} ({entry.skidataOrderId}) returned no details: {entry.error ?? "Unknown error"}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          No Skidata order data available
        </div>
      )}
    </div>
  )
}
