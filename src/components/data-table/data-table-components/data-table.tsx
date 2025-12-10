import * as React from "react"
import { ClickAndCollectButton } from "@/features/order-collect/order-collect-components/order-collect-button"
import { dbGetOrderSessions } from "@/db/server-actions/order-actions/db-get-order-sessions"
import { ordersTableReturnLifepassApi } from "@/features/orders-table/orders-table-actions/orders-table-return-lifepass-api/route"
// Swapping handled directly inside the dialog now
import { dbToggleTestOrder } from "@/db/server-actions/order-actions/db-toggle-test-order"
import { OrdersTableClientDialog } from "@/features/orders-table/orders-table-features/orders-table-client-dialog"
import { MythDialog } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog"
import { type MythOrderDetails } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/types"
import { OrdersTableSessionsDialog } from "@/features/orders-table/orders-table-features/orders-table-sessions-dialog"
import { OrdersTablePriceDialog } from "@/features/orders-table/orders-table-features/orders-table-price-dialog"
import { OrdersTableReturnLifepassDialog } from "@/features/orders-table/orders-table-features/orders-table-return-lifepass-dialog"
import { SkidataDialog } from "@/features/orders-table/orders-table-features/orders-table-skidata-dialog"
import { StripeDialog } from "@/features/orders-table/orders-table-features/orders-table-stripe-dialog"
import { OrdersTableSwapPassDialog } from "@/features/orders-table/orders-table-features/orders-table-swap-pass-dialog"
import type { JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { type CalculatedOrderPrice } from "@/types/general-types"
import { type StripeTransactionDetails } from "@/types/stripe-types"
import { type OrderPrice } from "@/db/types/skidata-calculated-order-price"
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"

interface DataTableProps<
  TData extends {
    id: string
    testOrder?: boolean | undefined
    sessionIds?: string[]
    resortId: number
    mythOrderSubmissionData?: {
      devices?: { deviceCode?: string }[]
    }
    calculatedOrderPrice?: number | string
    stripeTransactionData?: StripeTransactionDetails | null
    skidataOrderSubmissionData?: {
      orderId: string
      confirmationNumber: string
      asynchronousExecutionToken: {
        executionId: string
      }
    }
  },
> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}

export function DataTable<
  TData extends {
    id: string
    testOrder?: boolean | undefined
    sessionIds?: string[]
    resortId: number
    mythOrderSubmissionData?: { devices?: { deviceCode?: string }[] }
    calculatedOrderPrice?: number | string
    stripeTransactionData?: StripeTransactionDetails | null
    skidataOrderSubmissionData?: {
      orderId: string
      confirmationNumber: string
      asynchronousExecutionToken: {
        executionId: string
      }
    }
  },
>({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  const [showSessionsDialog, setShowSessionsDialog] = React.useState(false)
  const [showSwapPassDialog, setShowSwapPassDialog] = React.useState(false)
  const [showReturnLifepassDialog, setShowReturnLifepassDialog] =
    React.useState(false)
  const [sessions, setSessions] = React.useState<JoinedSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(false)

  const handleViewSessions = React.useCallback(async (row: Row<TData>) => {
    if (!row.original.sessionIds?.length) return

    setIsLoadingSessions(true)
    try {
      // Convert string[] to number[] for the API
      const sessionIds = row.original.sessionIds.map(id => Number(id))
      const data = await dbGetOrderSessions(sessionIds)
      setSessions(data)
      setShowSessionsDialog(true)
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  // Swap handled inside dialog (process buttons)

  const handleReturnLifepass = React.useCallback(
    async (deviceIds: string[]) => {
      try {
        const result = await ordersTableReturnLifepassApi(deviceIds)

        if (result.success) {
          toast.success(
            result.message ?? "Successfully returned lifepass(es)",
            {
              duration: 5000,
            }
          )
          setShowReturnLifepassDialog(false)
        } else {
          toast.error(result.message ?? "Failed to return lifepass", {
            duration: 5000,
            description:
              "Please try again or contact support if the issue persists.",
          })
        }
      } catch (error) {
        console.error("Error returning lifepass:", error)
        toast.error("An unexpected error occurred", {
          duration: 5000,
          description:
            "Please try again or contact support if the issue persists.",
        })
      }
    },
    []
  )

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobile(isMobile)

      // If switching from mobile to desktop, close the expanded row
      if (!isMobile) {
        setExpandedRow(null)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleRowExpansion = (rowId: string) => {
    if (isMobile) {
      setExpandedRow((prev) => (prev === rowId ? null : rowId))
    }
  }


  const LABELS = {
    clientDetails: "Client Details",
    mythOrderSubmissionData: "Myth Order Submission",
    skidataOrderSubmissionData: "Skidata Order Submission",
    orderDetails: "Order Details",
    calculatedOrderPrice: "Calculated Order Price",
    salesChannel: "Sales Channel",
    testOrder: "Test Order",
    stripePaymentIntentId: "Stripe Payment Intent",
    id: "Order ID",
    status: "Status",
    createdAt: "Created At",
  };

  function getLabel(key: string): string {
    // Fallback: Capitalize and split camelCase as a last resort
    if (LABELS[key as keyof typeof LABELS]) return LABELS[key as keyof typeof LABELS];
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str: string) => str.toUpperCase());
  }

  function renderValue(key: string, value: unknown, row: Row<TData>): React.ReactNode {
    const orderId = row?.original?.id;
    const resortId = row?.original?.resortId;
    const calculatedOrderPrice = row?.original?.calculatedOrderPrice;
    const stripeTransactionData = row?.original?.stripeTransactionData;

    switch (key) {
      case "clientDetails":
        return (
          <div className="flex flex-col items-start justify-center">
            <strong className="mb-2 ml-1">{getLabel(key)}:</strong>
            <OrdersTableClientDialog clientDetails={value as { name: string; email: string; mobile: string }} />
          </div>
        );

      case "mythOrderSubmissionData":
        return (
          <div className="flex w-full flex-row items-center justify-between overflow-hidden">
            <strong>{getLabel(key).replace(/ Submission$/, "")}:</strong>
            <MythDialog mythOrderSubmissionData={value as MythOrderDetails} />
          </div>
        );

      case "skidataOrderSubmissionData": {
        const data = row?.original?.skidataOrderSubmissionData;
        if (!data) return null;
        return (
          <div className="flex w-full flex-row items-center justify-between">
            <strong>{getLabel(key)}:</strong>
            <SkidataDialog
              skidataOrderSubmissionData={data as {
                orderId: string;
                confirmationNumber: string;
                asynchronousExecutionToken: {
                  executionId: string;
                };
              }}
              resortId={Number(resortId)}
              orderId={Number(orderId)}
            />
          </div>
        );
      }

      case "orderDetails":
        if (typeof value === "object" && value !== null && "startDate" in (value as Record<string, unknown>)) {
          const orderDetails = value as Record<string, unknown>;
          const startDate = orderDetails.startDate ? new Date(orderDetails.startDate as string | number | Date) : null;
          return (
            <div className="flex flex-row gap-1">
              <strong className="mr-2 shrink-0">{getLabel(key)}:</strong>
              <span>{startDate ? startDate.toISOString().split("T")[0] : "N/A"}</span>
              {startDate && <RelativeDayBadge date={startDate} />}
            </div>
          );
        }
        return null;

      case "calculatedOrderPrice":
        return (
          <div className="flex w-full flex-row items-center justify-between">
            <strong>{getLabel(key)}:</strong>
            <OrdersTablePriceDialog priceObject={value as OrderPrice} />
          </div>
        );

      case "salesChannel":
        if (value === "click-and-collect" && orderId && calculatedOrderPrice) {
          return (
            <div className="flex w-full flex-row items-center justify-between">
              <strong>{getLabel(key)}:</strong>
              <ClickAndCollectButton
                orderId={Number(orderId)}
                calculatedOrderPrice={calculatedOrderPrice as unknown as CalculatedOrderPrice}
                halfWidth={false}
                isCollected={Boolean(row.original.mythOrderSubmissionData?.devices?.length) ||
                  Boolean(row.original.skidataOrderSubmissionData)}
              />
            </div>
          );
        }
        return (
          <div className="flex w-full flex-row items-center justify-between">
            <strong>{getLabel(key)}:</strong>
            <div>{String(value)}</div>
          </div>
        );

      case "testOrder":
        return (
          <div className="flex w-full flex-row items-center justify-between">
            <strong>{getLabel(key)}:</strong>
            <Badge variant={(value as boolean) ? "destructive" : "outline"} className="capitalize">
              {(value as boolean) ? "Yes" : "No"}
            </Badge>
          </div>
        );

      case "stripePaymentIntentId":
        if (!value) {
          return (
            <div className="flex w-full flex-row items-center justify-between">
              <strong>{getLabel(key)}:</strong>
              <span>N/A</span>
            </div>
          );
        }
        return (
          <div className="flex w-full flex-row items-center justify-between">
            <strong>{getLabel(key)}:</strong>
            <StripeDialog
              orderId={Number(orderId)}
              stripePaymentIntentId={value as string}
              stripeTransactionData={stripeTransactionData as StripeTransactionDetails | null}
            />
          </div>
        );

      case "id":
      case "status":
      case "createdAt":
        return (
          <div className="flex w-full flex-row justify-between p-1">
            <strong className="mr-2 shrink-0">{getLabel(key)}:</strong>
            <span className="grow text-right">{String(value)}</span>
          </div>
        );

      default:
        return <div className="flex w-full flex-row justify-between p-1">
          <strong className="mr-2 shrink-0">{key}:</strong>
          <span className="grow text-right">{String(value)}</span>
        </div>;
    }
  }


  return (
    <div className={className} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() => toggleRowExpansion(row.id)} // Toggle expansion on click
                    className="cursor-pointer"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Render expanded row  */}
                  {expandedRow === row.id && (
                    <>
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length}>
                          <div className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <span className="text-base font-bold">
                                Actions
                              </span>
                              <div>
                                {/* Action buttons  */}
                                <div className="">
                                  <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      onClick={() => {
                                        window.open(
                                          `/admin/orders/${row.original.id}`,
                                          "_blank"
                                        )
                                      }}
                                    >
                                      View Order Details
                                    </Button>
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      onClick={() => {
                                        void dbToggleTestOrder({
                                          id: Number(row.original.id),
                                          testOrder: !row.original.testOrder,
                                        })
                                      }}
                                    >
                                      {row.original.testOrder
                                        ? "Mark as Real Order"
                                        : "Mark as Test Order"}
                                    </Button>
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      disabled={
                                        !row.original.sessionIds?.length ||
                                        isLoadingSessions
                                      }
                                      onClick={() =>
                                        void handleViewSessions(row)
                                      }
                                    >
                                      {isLoadingSessions
                                        ? "Loading..."
                                        : "View Sessions"}
                                    </Button>
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      onClick={() =>
                                        setShowSwapPassDialog(true)
                                      }
                                    >
                                      Swap Pass
                                    </Button>
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      onClick={() =>
                                        setShowReturnLifepassDialog(true)
                                      }
                                    >
                                      Return Lifepass
                                    </Button>
                                    <Button
                                      className="w-[44%] text-xs"
                                      variant="outline"
                                      onClick={() => {
                                        window.open(
                                          `https://mtech-api.jordangigg.workers.dev/api/orders/${row.original.id}/receipt`,
                                          "_blank"
                                        )
                                      }}
                                    >
                                      Download Receipt
                                    </Button>
                                  </div>
                                </div>
                                {showSessionsDialog && (
                                  <OrdersTableSessionsDialog
                                    open={showSessionsDialog}
                                    onOpenChange={setShowSessionsDialog}
                                    sessions={sessions}
                                    isLoading={isLoadingSessions}
                                  />
                                )}
                                {showSwapPassDialog && (
                                  <OrdersTableSwapPassDialog
                                    open={showSwapPassDialog}
                                    onOpenChange={setShowSwapPassDialog}
                                    orderId={Number(row.original.id)}
                                    resortId={row.original.resortId}
                                    deviceCodes={
                                      row.original.mythOrderSubmissionData?.devices
                                        ?.flatMap(
                                          (device: { deviceCode?: string }) =>
                                            device.deviceCode
                                        )
                                        .filter(
                                          (code): code is string =>
                                            code !== undefined
                                        ) ?? []
                                    }
                                    deviceDetailsByCode={(() => {
                                      const devices = row.original.mythOrderSubmissionData?.devices as Array<{ deviceCode?: string; productId?: string; consumerCategoryId?: string }> | undefined
                                      const map: Record<string, { productId: string; consumerCategoryId: string }> = {}
                                      devices?.forEach((d) => {
                                        if (d?.deviceCode && d?.productId && d?.consumerCategoryId) {
                                          map[d.deviceCode] = { productId: d.productId, consumerCategoryId: d.consumerCategoryId }
                                        }
                                      })
                                      return map
                                    })()}
                                    previousSkidataOrderId={(() => {
                                      const skidata = row.original.skidataOrderSubmissionData as { orderId?: string } | undefined
                                      return skidata?.orderId
                                    })()}
                                    defaultOldPassId={(() => {
                                      const codes =
                                        row.original.mythOrderSubmissionData?.devices
                                          ?.flatMap(
                                            (device: { deviceCode?: string }) =>
                                              device.deviceCode
                                          )
                                          .filter(
                                            (code): code is string =>
                                              code !== undefined
                                          ) ?? []
                                      return codes.length === 1 ? codes[0] : undefined
                                    })()}
                                  />
                                )}
                                {showReturnLifepassDialog && (
                                  <OrdersTableReturnLifepassDialog
                                    open={showReturnLifepassDialog}
                                    onOpenChange={(open: boolean) =>
                                      setShowReturnLifepassDialog(open)
                                    }
                                    onReturn={(deviceCodes: string[]) =>
                                      handleReturnLifepass(deviceCodes)
                                    }
                                    deviceCodes={
                                      row.original.mythOrderSubmissionData?.devices
                                        ?.flatMap(
                                          (device: { deviceCode?: string }) =>
                                            device.deviceCode
                                        )
                                        .filter(
                                          (code): code is string =>
                                            code !== undefined
                                        ) ?? []
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length}>
                          <div className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              {Object.entries(row.original)
                                .filter(([key, value]) => {
                                  // Only include keys that are defined in the `renderValue` function
                                  return (
                                    [
                                      "id",
                                      "status",
                                      "clientDetails",
                                      "salesChannel",
                                      "orderDetails",
                                      "calculatedOrderPrice",
                                      "stripePaymentIntentId",
                                      "skidataOrderSubmissionData",
                                      "mythOrderSubmissionData",
                                      "testOrder",
                                      "createdAt",
                                    ].includes(key) &&
                                    value !== null &&
                                    value !== undefined
                                  ) // Filter out empty or null values
                                })
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="mb-4 flex max-w-full flex-wrap justify-between overflow-hidden rounded-md border border-gray-300 p-4"
                                  >
                                    {/* Render value  */}
                                    {renderValue(key, value, row)}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
