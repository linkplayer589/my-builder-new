"use client"

import { useDevices } from "@/db/server-actions/devices-actions/devices-hooks/use-devices-hook"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSkidataOrder } from "@/features/skidata/skidata-actions/get-skidata-order"

export interface SkidataPageProps {
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

export function SkidataPage({
    skidataOrderSubmissionData,
    resortId,
    orderId,
}: SkidataPageProps) {
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
        enabled: true,
    })

    return (
        <div className="container mx-auto">
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
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Order Information</h3>
                                                        <div className="space-y-1 text-sm">
                                                            {[
                                                                { label: "Order ID:", value: entry.orderDetails.orderId },
                                                                { label: "Date:", value: new Date(entry.orderDetails.date).toLocaleString() },
                                                                { label: "System Date:", value: new Date(entry.orderDetails.systemDate).toLocaleString() },
                                                                { label: "Confirmation:", value: entry.orderDetails.confirmationNumber },
                                                            ].map(({ label, value }, idx2) => (
                                                                <div key={idx2} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                                                    <span className="text-muted-foreground">{label}</span>
                                                                    <span className="mt-1 break-words lg:mt-0">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Seller & Price Details</h3>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                                <span className="text-muted-foreground">Channel:</span>
                                                                <span className="mt-1 break-words md:mt-0">{entry.orderDetails.seller.saleschannelShortName}</span>
                                                            </div>
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                                <span className="text-muted-foreground">POS Name:</span>
                                                                <span className="mt-1 break-words md:mt-0">{entry.orderDetails.seller.pointOfSaleName}</span>
                                                            </div>
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                                <span className="text-muted-foreground">POS Type:</span>
                                                                <span className="mt-1 break-words md:mt-0">{entry.orderDetails.seller.posType}</span>
                                                            </div>
                                                            <div className="flex flex-col font-medium md:flex-row md:items-center md:justify-between">
                                                                <span className="text-muted-foreground">Total Amount:</span>
                                                                <span className="mt-1 break-words md:mt-0">{entry.orderDetails.totalPrice.amountGross} {entry.orderDetails.totalPrice.currencyCode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold">Order Items</h3>
                                                        <span className="text-sm text-muted-foreground">{entry.orderDetails.orderItems.length} items</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {entry.orderDetails.orderItems.map((item) => (
                                                            <div key={item.id} className="rounded-lg border p-4">
                                                                <div className="grid grid-cols-1 gap-x-8 text-sm md:grid-cols-2">
                                                                    <div className="space-y-2">
                                                                        <div className="flex flex-col md:flex-row md:justify-between">
                                                                            <span className="text-muted-foreground">Item ID:</span>
                                                                            <span className="mt-1 font-mono md:mt-0">{item.id}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                                                <span className="text-muted-foreground">Product ID:</span>
                                                                                <span className="mt-1 font-mono md:mt-0">{item.productId} ({getProductName(item.productId).en})</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                                                <span className="text-muted-foreground">Consumer Category:</span>
                                                                                <span className="mt-1 font-mono md:mt-0">{item.consumerCategoryId} ({getConsumerCategoryName(item.consumerCategoryId).en})</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col md:flex-row md:justify-between">
                                                                            <span className="text-muted-foreground">Status:</span>
                                                                            <span className="mt-1 md:mt-0">{item.salesStatus}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex flex-col md:flex-row md:justify-between">
                                                                            <span className="text-muted-foreground">Price:</span>
                                                                            <span className="mt-1 md:mt-0">{item.amountGross}</span>
                                                                        </div>
                                                                        <div className="flex flex-col md:flex-row md:justify-between">
                                                                            <span className="text-muted-foreground">Quantity:</span>
                                                                            <span className="mt-1 md:mt-0">{item.quantity}</span>
                                                                        </div>
                                                                        <div className="flex flex-col md:flex-row md:justify-between">
                                                                            <span className="text-muted-foreground">Depot Ticket:</span>
                                                                            <span className="mt-1 md:mt-0">{item.isDepotTicket ? "Yes" : "No"}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                            <span className="text-muted-foreground">Valid From:</span>
                                                                            <div className="mt-1 flex items-center gap-2 md:mt-0">
                                                                                <span>{new Date(item.validFrom).toLocaleString()}</span>
                                                                                <RelativeDayBadge date={item.validFrom} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {item.ticketItems.length > 0 && (
                                                                    <div className="mt-4 space-y-2">
                                                                        <h4 className="text-sm font-medium">Tickets ({item.ticketItems.length})</h4>
                                                                        <div className="grid gap-2">
                                                                            {item.ticketItems.map((ticket) => (
                                                                                <div key={ticket.id} className="rounded border bg-muted/30 p-2">
                                                                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                                                        <div className="space-y-1">
                                                                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                                                                <span className="text-muted-foreground">Serial:</span>
                                                                                                <span className="mt-1 md:mt-0">{ticket.permissionSerialNumber}</span>
                                                                                            </div>
                                                                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                                                                <span className="text-muted-foreground">Permission ID:</span>
                                                                                                <span className="mt-1 md:mt-0">{ticket.permissionId}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                                                                <span className="text-muted-foreground">Status:</span>
                                                                                                <span className="mt-1 md:mt-0">{ticket.permissionStatus}</span>
                                                                                            </div>
                                                                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                                                <span className="text-muted-foreground">Valid Until:</span>
                                                                                                <div className="mt-1 flex items-center gap-2 md:mt-0">
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

                                                                                            {ticket.identifications && ticket.identifications.length > 0 && (
                                                                                                <div className="col-span-1 mt-2 space-y-1 border-t pt-2 md:col-span-2">
                                                                                                    <span className="text-sm font-medium">Device Identifiers:</span>
                                                                                                    {ticket.identifications.map((id, index) => {
                                                                                                        const device = serialMap.get(id.serialNumber);
                                                                                                        return (
                                                                                                            <div key={index} className="flex flex-col text-sm md:flex-row md:items-center md:gap-2">
                                                                                                                {device ? (
                                                                                                                    <span className="font-mono">{`Device ${device.id}`}</span>
                                                                                                                ) : (
                                                                                                                    <span className="font-mono text-muted-foreground">No Device</span>
                                                                                                                )}
                                                                                                                <span className="text-muted-foreground">→</span>
                                                                                                                <span className="font-mono">DTA: {id.serialNumber}</span>
                                                                                                            </div>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            )}
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
        </div>
    )
}
