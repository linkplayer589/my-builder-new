"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useDevices } from "@/db/server-actions/devices-actions/devices-hooks/use-devices-hook"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type SkidataOrderSubmission, type OrderItem, type TicketItem, type Attribute, type Identification } from "@/types/skidata-types"

import { getSkidataOrder } from "../orders-table-skidata-dialog-actions/get-skidata-order/route"
import { ordersTableSkidataCancelOrdersApi } from "../orders-table-skidata-dialog-actions/cancel-orders/route"
import { ordersTableSkidataCancelTicketItemApi } from "../orders-table-skidata-dialog-actions/cancel-ticket-item/route"
import type { SkidataGetOrderResponse, SkidataOrder } from "@/types/skidata-types"

/**
 * Type guard to check if orderDetails is a SkidataOrder object
 */
function isSkidataOrder(orderDetails: SkidataOrder | string | undefined): orderDetails is SkidataOrder {
  return typeof orderDetails === "object" && orderDetails !== null && "orderId" in orderDetails
}

export interface SkidataDialogProps {
  resortId: number
  skidataOrderSubmissionData: {
    orderId: string
    confirmationNumber: string
    asynchronousExecutionToken: {
      executionId: string
    }
  }
  orderId: number
  /** Optional pre-calculated button status (from order data) */
  buttonStatus?: { text: string; className?: string }
}

export function SkidataDialog({
  skidataOrderSubmissionData,
  resortId,
  orderId,
  buttonStatus: providedButtonStatus,
}: SkidataDialogProps) {
  const [open, setOpen] = useState(false)
  const { getProductName, getConsumerCategoryName } = useResort()
  const { serialMap } = useDevices()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errorObj, setErrorObj] = useState<Record<string, unknown> | null>(null)
  const queryClient = useQueryClient()

  const {
    data: orderData,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["skidataOrder", skidataOrderSubmissionData.orderId],
    queryFn: () =>
      getSkidataOrder(resortId, skidataOrderSubmissionData.orderId, orderId),
    enabled: open, // Only fetch when dialog is open
    staleTime: Infinity, // Keep cached data fresh forever
  })

  // Get cached data for button status (before dialog opens)
  const cachedOrderData = queryClient.getQueryData<typeof orderData>([
    "skidataOrder",
    skidataOrderSubmissionData.orderId,
  ])
  // Use fetched data if available, otherwise use cached data
  const orderDataForStatus = orderData ?? cachedOrderData

  async function handleCancelOrder(orderIdToCancel: string) {
    try {
      setErrorMsg(null); setErrorObj(null)
      const res = await ordersTableSkidataCancelOrdersApi({ orderIds: [orderIdToCancel], resortId })
      if (res?.success) {
        toast.success("Order cancelled")
        await refetch()
      } else {
        toast.error("Failed to cancel order")
        setErrorMsg("Skidata cancel order failed")
        setErrorObj(res as Record<string, unknown>)
        console.error("[UI] Skidata cancel order failed:", res)
      }
    } catch (e) {
      toast.error("Failed to cancel order")
      setErrorMsg(e instanceof Error ? e.message : "Unknown error")
      setErrorObj(null)
      console.error("[UI] Skidata cancel order error:", e)
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
      setErrorMsg(null); setErrorObj(null)
      const res = await ordersTableSkidataCancelTicketItemApi({
        orderId: args.orderId,
        orderItemId: args.orderItemId,
        ticketItemIdList: [args.ticketItemId],
        cancelationDate: new Date().toISOString(),
        resortId,
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
        console.error("[UI] Skidata cancel ticket failed:", res)
      }
    } catch (e) {
      toast.error("Failed to cancel ticket")
      setErrorMsg(e instanceof Error ? e.message : "Unknown error")
      setErrorObj(null)
      console.error("[UI] Skidata cancel ticket error:", e)
    }
  }

  /**
   * Checks if a ticket is cancelled (for UI display purposes)
   */
  function isTicketCancelled(ticket: TicketItem): boolean {
    const ps = (ticket.permissionStatus || "").toLowerCase()
    const ss = (ticket.salesStatus || "").toLowerCase()
    return ps.includes("cancel") || ss.includes("cancel")
  }

  /**
   * Checks if a ticket is active (not cancelled)
   * Active statuses include: "Issued", "BookedAndTransferred", "Booked", etc.
   */
  function isTicketActive(ticket: TicketItem): boolean {
    return !isTicketCancelled(ticket)
  }

  /**
   * Checks if a ticket is past its end date (dta-validity-end)
   * A ticket is past end date if the end date is BEFORE today (not including today)
   */
  function isTicketPastEndDate(ticket: TicketItem): boolean {
    const endDateAttr = ticket.attributes?.find((attr: Attribute) => attr.key === "dta-validity-end")
    if (!endDateAttr?.value) return false
    try {
      const endDate = new Date(endDateAttr.value)
      if (isNaN(endDate.getTime())) return false

      // Compare dates only (ignore time) - ticket is valid for the entire end date day
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endDateOnly = new Date(endDate)
      endDateOnly.setHours(23, 59, 59, 999) // End of the valid day

      return today.getTime() > endDateOnly.getTime()
    } catch {
      return false
    }
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
   * Used for showing Cancel Order button
   */
  function entryHasActiveTickets(entry: SkidataGetOrderResponse): boolean {
    const allTickets = getAllTicketsFromEntry(entry)
    return allTickets.some((t) => !isTicketCancelled(t))
  }

  /**
   * Calculates button status from fetched/cached data
   *
   * Status logic:
   * - Active (Green): At least one ticket is BookedAndTransferred AND Valid Until date is in the future
   * - Completed (Default): All tickets are BookedAndTransferred AND all Valid Until dates are in the past
   * - Cancelled (Red): All tickets are CanceledAndTransferred
   * - See Details (Yellow): Any other outcome
   */
  function calculateButtonStatus(data: typeof orderDataForStatus): { text: string; className: string | undefined } {
    if (!Array.isArray(data)) {
      return { text: "No Data", className: undefined }
    }

    // Collect all tickets from all successful entries
    const allTickets: TicketItem[] = []
    for (const entry of data) {
      if (entry.success && typeof entry.orderDetails === "object") {
        allTickets.push(...getAllTicketsFromEntry(entry))
      }
    }

    // If no tickets found, show "No Data"
    if (allTickets.length === 0) {
      return { text: "No Data", className: undefined }
    }

    // Check if ALL tickets are cancelled -> Cancelled (Red)
    const allCanceled = allTickets.every((t) => isTicketCancelled(t))
    if (allCanceled) {
      return { text: "Cancelled", className: "bg-red-600 text-white hover:bg-red-700" }
    }

    // Check for active tickets (not cancelled with future/today Valid Until date)
    const hasActiveTicket = allTickets.some(
      (t) => isTicketActive(t) && !isTicketPastEndDate(t)
    )

    // If at least one ticket is active -> Active (Green)
    if (hasActiveTicket) {
      return { text: "Active", className: "bg-green-600 text-white hover:bg-green-700" }
    }

    // Check if all non-cancelled tickets are past end date -> Completed (Default)
    const allActiveTickets = allTickets.filter((t) => isTicketActive(t))
    const allPastEndDate = allActiveTickets.length > 0 && allActiveTickets.every((t) => isTicketPastEndDate(t))

    if (allPastEndDate) {
      return { text: "Completed", className: undefined }
    }

    // Any other outcome -> See Details (Yellow)
    return { text: "See Details", className: "bg-yellow-500 text-white hover:bg-yellow-600" }
  }

  // Use provided button status if available, otherwise calculate from fetched/cached data
  const triggerStatus = providedButtonStatus ?? calculateButtonStatus(orderDataForStatus)

  const triggerClassName = triggerStatus.className
  const triggerText = triggerStatus.text

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerClassName ? (
          <Button className={triggerClassName}>{triggerText}</Button>
        ) : (
          <Button variant="outline">{triggerText}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto py-4 sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Skidata Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="orderData">
          {errorMsg && (
            <>
              <Alert variant="destructive" className="mb-2">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
              {errorObj && (
                <div className="mb-2 overflow-auto rounded-md border bg-muted/30 p-2 text-xs">
                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(errorObj, null, 2)}</pre>
                </div>
              )}
            </>
          )}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orderData">Order Data</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
          </TabsList>

          <TabsContent value="orderData" className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm text-muted-foreground">
                {(() => {
                  if (!Array.isArray(orderData)) return "N/A"
                  const times = orderData
                    .map((o) => (typeof o.updatedAt === "string" ? new Date(o.updatedAt).getTime() : 0))
                    .filter((t) => t > 0)
                    .sort((a, b) => b - a)
                  const ts = times[0]
                  return ts ? new Date(ts).toLocaleString() : "N/A"
                })()}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
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
            ) : Array.isArray(orderData) ? (
              <div className="space-y-6">
                {/* Nested tabs per submission */}
                <Tabs defaultValue={orderData[0]?.skidataOrderId ?? ""}>
                  <TabsList className="w-full overflow-x-auto">
                    {orderData.map((entry, idx) => (
                      <TabsTrigger key={entry.skidataOrderId + idx} value={entry.skidataOrderId}>
                        {`Submission ${idx + 1}`}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {orderData.map((entry, idx) => (
                    <TabsContent key={entry.skidataOrderId + "-content-" + idx} value={entry.skidataOrderId} className="space-y-6">
                      {entry.success && entry.orderDetails && typeof entry.orderDetails === "object" ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold">Order Information</h3>
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

                            <div className="space-y-2">
                              <h3 className="font-semibold">Seller & Price Details</h3>
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
                              {(() => {
                                const hasActive = entryHasActiveTickets(entry)
                                if (!hasActive) {
                                  return (
                                    <div className="mt-2 flex justify-end">
                                      <span className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">All tickets cancelled</span>
                                    </div>
                                  )
                                }
                                if (!isSkidataOrder(entry.orderDetails)) return null
                                const orderDetails = entry.orderDetails
                                return (
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      className="bg-green-600 text-white hover:bg-green-700"
                                      size="sm"
                                      onClick={() => handleCancelOrder(orderDetails.orderId)}
                                      disabled={isFetching}
                                    >
                                      Cancel Order
                                    </Button>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">Order Items</h3>
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

                                  {item.ticketItems.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium">Tickets ({item.ticketItems.length})</h4>
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
                                                        date={
                                                          ticket.attributes.find((attr: Attribute) => attr.key === "dta-validity-end")!.value
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              {ticket.identifications &&
                                                ticket.identifications.length > 0 && (
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
                                              {!isTicketCancelled(ticket) && (
                                                <div className="col-span-2 mt-2 flex justify-end">
                                                  {isSkidataOrder(entry.orderDetails) && (() => {
                                                    const orderDetails = entry.orderDetails
                                                    return (
                                                      <Button
                                                        className="bg-green-600 text-white hover:bg-green-700"
                                                        size="sm"
                                                        onClick={() => handleCancelTicketItem({
                                                          orderId: orderDetails.orderId,
                                                          orderItemId: item.id,
                                                          ticketItemId: ticket.id,
                                                          productId: item.productId,
                                                          consumerCategoryId: item.consumerCategoryId,
                                                        })}
                                                        disabled={isFetching}
                                                      >
                                                        Cancel Ticket
                                                      </Button>
                                                    )
                                                  })()}
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
                          {`Submission ${idx + 1} (${entry.skidataOrderId}) returned no details: ${entry.error ?? "Unknown error"}`}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="submission">
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Order ID:</span>
                    <span className="text-muted-foreground">
                      {skidataOrderSubmissionData.orderId}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Confirmation Number:</span>
                    <span className="text-muted-foreground">
                      {skidataOrderSubmissionData.confirmationNumber}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Execution ID:</span>
                    <span className="text-muted-foreground">
                      {
                        skidataOrderSubmissionData.asynchronousExecutionToken
                          .executionId
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
