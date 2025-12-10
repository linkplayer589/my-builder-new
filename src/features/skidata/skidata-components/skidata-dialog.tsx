import { useState } from "react"
import { toast } from "sonner"
import { useDevices } from "@/db/server-actions/devices-actions/devices-hooks/use-devices-hook"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getSkidataOrder } from "../skidata-actions/get-skidata-order"
import { skidataCancelOrdersApi } from "../skidata-actions/cancel-orders"
import { skidataCancelTicketItemApi } from "../skidata-actions/cancel-ticket-item"
type TOrderIdOnly = { orderId: string }

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
}

export function SkidataDialog({
  skidataOrderSubmissionData,
  resortId,
  orderId,
}: SkidataDialogProps) {
  const [open, setOpen] = useState(false)
  const { getProductName, getConsumerCategoryName } = useResort()
  const { serialMap } = useDevices()

  const {
    data: orderData,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["skidataOrder", skidataOrderSubmissionData.orderId],
    queryFn: () =>
      getSkidataOrder(resortId, skidataOrderSubmissionData.orderId, orderId),
    enabled: open,
  })

  async function handleCancelOrder(orderIdToCancel: string) {
    try {
      const res = await skidataCancelOrdersApi({ orderIds: [orderIdToCancel], resortId })
      if (res?.success) {
        toast.success("Order cancelled")
        await refetch()
      } else {
        toast.error("Failed to cancel order")
      }
    } catch {
      toast.error("Failed to cancel order")
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
      const res = await skidataCancelTicketItemApi({
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
      }
    } catch {
      toast.error("Failed to cancel ticket")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Submitted</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto py-4 sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Skidata Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="orderData">
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
                              <div className="mt-2 flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelOrder((entry.orderDetails as unknown as TOrderIdOnly).orderId)}
                                  disabled={isFetching}
                                >
                                  Cancel Order
                                </Button>
                              </div>
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
                              {entry.orderDetails.orderItems.map((item) => (
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
                                        {item.ticketItems.map((ticket) => (
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
                                                      {ticket.attributes?.find((attr) => attr.key === "dta-validity-end")?.value
                                                        ? new Date(
                                                            ticket.attributes.find((attr) => attr.key === "dta-validity-end")!.value
                                                          ).toLocaleString()
                                                        : "N/A"}
                                                    </span>
                                                    {ticket.attributes?.find((attr) => attr.key === "dta-validity-end")?.value && (
                                                      <RelativeDayBadge
                                                        date={ticket.attributes.find((attr) => attr.key === "dta-validity-end")!.value}
                                                      />
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              {ticket.identifications && ticket.identifications.length > 0 && (
                                                <div className="col-span-2 mt-2 space-y-1 border-t pt-2">
                                                  <span className="text-sm font-medium">Device Identifiers:</span>
                                                  {ticket.identifications.map((id, index) => {
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
                                              <div className="col-span-2 mt-2 flex justify-end">
                                                  <Button
                                                  variant="outline"
                                                  size="sm"
                                                    onClick={() => handleCancelTicketItem({
                                                      orderId: (entry.orderDetails as unknown as TOrderIdOnly).orderId,
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
