"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { stripeRefetchTransactionData } from "@/features/stripe/stripe-actions/stripe-refetch-transaction-data"
import { type StripeTransactionDetails, type StripeInvoice, type StripeInvoiceData } from "@/types/stripe-types"

interface OrdersTableOrderDetailsDropdownStripeSectionProps {
  order: Order
}

/**
 * Stripe payment section for order details dropdown
 *
 * @description
 * Displays Stripe payment information including:
 * - Invoice display with line items
 * - Payment intent tabs for multiple payments
 * - Charge details
 * - External links to Stripe dashboard
 * - Real-time refresh capability
 */
export function OrdersTableOrderDetailsDropdownStripeSection({
  order,
}: OrdersTableOrderDetailsDropdownStripeSectionProps) {
  // Normalize data
  const paymentIntentIds = order.stripePaymentIntentIds ?? []
  const invoiceId = order.stripeInvoiceId
  const initialTransactionDatas = order.stripeTransactionDatas ?? []
  const initialInvoiceDatas = order.stripeInvoiceDatas ?? []

  // Track if this is a manual refetch vs initial load
  const isManualRefetch = React.useRef(false)

  // Fetch fresh Stripe data
  const { data: refetchedData, refetch, isLoading, isFetching } = useQuery<{
    transactionDatas: StripeTransactionDetails[]
    invoiceDatas: StripeInvoiceData[]
    invoiceId?: string
    paymentIntentIds: string[]
    updatedAt?: string
  }>({
    queryKey: ["stripeTransaction", order.id],
    queryFn: async () => {
      const response = await stripeRefetchTransactionData(order.id)
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch Stripe data")
      }

      if (isManualRefetch.current) {
        toast.success("Stripe details refreshed")
        isManualRefetch.current = false
      }

      const anyResp = response as unknown as Record<string, unknown>
      return {
        transactionDatas: (anyResp["stripeTransactionDatas"] as StripeTransactionDetails[] | undefined) ?? [],
        invoiceDatas: (anyResp["stripeInvoiceDatas"] as StripeInvoiceData[] | undefined) ?? [],
        invoiceId: anyResp["stripeInvoiceId"] as string | undefined,
        paymentIntentIds: (anyResp["stripePaymentIntentIds"] as string[] | undefined) ?? [],
        updatedAt: anyResp["updatedAt"] as string | undefined,
      }
    },
    enabled: paymentIntentIds.length > 0 || Boolean(invoiceId),
    retry: 1,
  })

  const handleRefresh = () => {
    isManualRefetch.current = true
    void refetch()
  }

  // Use fetched data if available, otherwise fall back to order data
  const displayTransactionDatas = refetchedData?.transactionDatas ?? initialTransactionDatas
  const displayInvoiceDatas = refetchedData?.invoiceDatas ?? initialInvoiceDatas
  const displayInvoiceId = refetchedData?.invoiceId ?? invoiceId
  const displayPaymentIntentIds = refetchedData?.paymentIntentIds ?? paymentIntentIds

  // Get latest invoice data
  const latestInvoiceData = displayInvoiceDatas.length > 0
    ? displayInvoiceDatas[displayInvoiceDatas.length - 1]
    : null
  const latestInvoices: StripeInvoice[] = latestInvoiceData?.invoices || []

  // Extract payment intent data from transaction datas
  const paymentIntentDataMap = new Map<string, StripeTransactionDetails>()
  displayTransactionDatas.forEach((tx: StripeTransactionDetails) => {
    if (tx.paymentIntent && typeof tx.paymentIntent === "object") {
      const piId = (tx.paymentIntent as unknown as Record<string, unknown>).id
      if (typeof piId === "string" && !paymentIntentDataMap.has(piId)) {
        paymentIntentDataMap.set(piId, tx)
      }
    }
  })

  const hasData = displayPaymentIntentIds.length > 0 || displayInvoiceId

  if (!hasData) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">No Stripe payment data available for this order</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stripe Payment Details</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {refetchedData?.updatedAt ? new Date(refetchedData.updatedAt).toLocaleString() : "N/A"}
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
          {displayInvoiceId && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={`https://dashboard.stripe.com/invoices/${displayInvoiceId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                View Invoice
              </a>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <ReloadIcon className="size-6 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue={displayInvoiceId ? "invoice" : "payments"}>
          <TabsList className="grid w-full grid-cols-2">
            {displayInvoiceId && latestInvoices.length > 0 && (
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
            )}
            {displayPaymentIntentIds.length > 0 && (
              <TabsTrigger value="payments">
                Payments ({displayPaymentIntentIds.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Invoice Tab */}
          {displayInvoiceId && latestInvoices.length > 0 && (
            <TabsContent value="invoice" className="space-y-4">
              {latestInvoices.map((invoice, idx) => {
                const status = invoice.status
                const amountPaid = invoice.amount_paid || 0
                const amountRemaining = invoice.amount_remaining || 0
                const total = invoice.total || 0
                const lines = invoice.lines?.data || []
                const currency = String(invoice.currency || "eur").toUpperCase()

                return (
                  <div key={idx} className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice ID:</span>
                            <span className="font-mono">{String(invoice.id || displayInvoiceId)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`capitalize font-medium ${
                              status === "paid" ? "text-green-600" :
                              status === "open" ? "text-yellow-600" :
                              status === "void" ? "text-red-600" : ""
                            }`}>
                              {status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Number:</span>
                            <span>{String(invoice.number || "N/A")}</span>
                          </div>
                          {invoice.hosted_invoice_url && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Invoice URL:</span>
                              <a
                                href={invoice.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-xs"
                              >
                                View Invoice
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">
                              {(total / 100).toFixed(2)} {currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount Paid:</span>
                            <span className="text-green-600">
                              {(amountPaid / 100).toFixed(2)} {currency}
                            </span>
                          </div>
                          {amountRemaining > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount Remaining:</span>
                              <span className="text-yellow-600">
                                {(amountRemaining / 100).toFixed(2)} {currency}
                              </span>
                            </div>
                          )}
                          {invoice.customer_email && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer Email:</span>
                              <span className="text-xs">{invoice.customer_email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Invoice Line Items */}
                      {lines.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <h4 className="text-sm font-medium">Line Items ({lines.length})</h4>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {lines.map((line, lineIdx) => {
                              const amount = line.amount || 0
                              const quantity = line.quantity || 1
                              const description = line.description || "N/A"
                              return (
                                <div key={lineIdx} className="flex justify-between text-xs p-2 bg-background rounded">
                                  <div className="flex-1">
                                    <div className="font-medium">{description}</div>
                                    <div className="text-muted-foreground">Qty: {quantity}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{(amount / 100).toFixed(2)} {currency}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Status Transitions */}
                      {invoice.status_transitions && (
                        <div className="space-y-1 pt-2 border-t text-xs">
                          <div className="font-medium text-muted-foreground mb-1">Status Timeline</div>
                          {Object.entries(invoice.status_transitions as Record<string, unknown>).map(([key, value]) => {
                            if (!value) return null
                            return (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                                <span>{new Date(Number(value) * 1000).toLocaleString()}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          )}

          {/* Payment Intents Tab */}
          {displayPaymentIntentIds.length > 0 && (
            <TabsContent value="payments" className="space-y-4">
              <Tabs defaultValue={displayPaymentIntentIds[0]}>
                <TabsList className="w-full overflow-x-auto">
                  {displayPaymentIntentIds.map((piId: string) => (
                    <TabsTrigger key={piId} value={piId} className="text-xs">
                      {piId.slice(0, 8)}...{piId.slice(-4)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {displayPaymentIntentIds.map((piId: string) => {
                  const txData = paymentIntentDataMap.get(piId)
                  const pi = txData?.paymentIntent as Record<string, unknown> | undefined

                  return (
                    <TabsContent key={piId} value={piId} className="space-y-4">
                      {pi ? (
                        <>
                          {/* Payment Intent Details */}
                          <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Payment ID:</span>
                              <span className="font-mono text-muted-foreground">{String(pi.id)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Status:</span>
                              <Badge variant="outline" className="capitalize">
                                {pi.status ? String(pi.status) : "N/A"}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Amount:</span>
                              <span className="text-muted-foreground">
                                {((Number(pi.amount) || 0) / 100).toFixed(2)} {pi.currency ? String(pi.currency).toUpperCase() : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Payment Method:</span>
                              <span className="capitalize text-muted-foreground">
                                {Array.isArray(pi.payment_method_types) ? pi.payment_method_types.join(", ") : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Created:</span>
                              <span className="text-muted-foreground">
                                {new Date(((Number(pi.created) || 0) * 1000)).toLocaleString()}
                              </span>
                            </div>
                            {pi.description && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Description:</span>
                                <span className="text-muted-foreground">{String(pi.description)}</span>
                              </div>
                            )}
                          </div>

                          {/* Latest Charge */}
                          {txData?.charges && txData.charges.length > 0 && (
                            <div className="rounded-lg border p-4 space-y-2">
                              <h4 className="font-medium">Charges ({txData.charges.length})</h4>
                              {txData.charges.map((charge, idx) => (
                                <div key={idx} className="space-y-2 text-sm border-t pt-2">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Charge ID:</span>
                                        <span className="font-mono text-xs">{String(charge.id)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant="outline" className="capitalize">
                                          {String(charge.status)}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span>
                                          {((Number(charge.amount) || 0) / 100).toFixed(2)} {String(charge.currency).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paid:</span>
                                        <Badge variant={charge.paid ? "default" : "outline"}>
                                          {charge.paid ? "Yes" : "No"}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Refunded:</span>
                                        <Badge variant={charge.refunded ? "destructive" : "outline"}>
                                          {charge.refunded ? "Yes" : "No"}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Captured:</span>
                                        <Badge variant={charge.captured ? "default" : "outline"}>
                                          {charge.captured ? "Yes" : "No"}
                                        </Badge>
                                      </div>
                                      {charge.receiptUrl && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Receipt:</span>
                                          <a
                                            href={String(charge.receiptUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-xs"
                                          >
                                            View
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* View in Stripe Link */}
                          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                            <a
                              href={`https://dashboard.stripe.com/payments/${piId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4" />
                              View in Stripe Dashboard
                            </a>
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                          No details available for this payment intent
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}
