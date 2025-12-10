"use client"

import React, { useState, type ReactNode } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { type StripeTransactionDetails, type StripeInvoice, type StripeInvoiceData } from "@/types/stripe-types"
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

import { stripeRefetchTransactionData } from "../stripe-actions/stripe-refetch-transaction-data"

interface StripeDialogProps {
  orderId: number
  stripePaymentIntentIds?: string[]
  stripeInvoiceId?: string
  stripeTransactionDatas?: StripeTransactionDetails[]
  /** Fallback for single payment intent (legacy) */
  stripePaymentIntentId?: string
  stripeTransactionData?: StripeTransactionDetails | null
}

export function StripeDialog({
  orderId,
  stripePaymentIntentIds,
  stripeInvoiceId,
  stripeTransactionDatas,
  stripePaymentIntentId: legacyPaymentIntentId,
  stripeTransactionData: legacyTransactionData,
}: StripeDialogProps) {
  const [open, setOpen] = useState(false)

  // Normalize data: use new arrays if available, fallback to legacy single values
  const paymentIntentIds = stripePaymentIntentIds && stripePaymentIntentIds.length > 0
    ? stripePaymentIntentIds
    : legacyPaymentIntentId ? [legacyPaymentIntentId] : []

  const transactionDatas = stripeTransactionDatas && stripeTransactionDatas.length > 0
    ? stripeTransactionDatas
    : legacyTransactionData ? [legacyTransactionData] : []

  const {
    data: refetchedData,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["stripeTransaction", orderId],
    queryFn: async () => {
      try {
        console.log("[StripeDialog] Fetching transaction data for orderId:", orderId)
        const response = await stripeRefetchTransactionData(orderId)
        console.log("[StripeDialog] Response from stripeRefetchTransactionData:", response)

        if (!response || typeof response !== 'object') {
          console.error("[StripeDialog] Invalid response type:", typeof response)
          toast.error("Failed to fetch transaction details")
          return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined }
        }

        // Check for explicit failure (success: false with message)
        if (response.success === false && response.message) {
          console.error("[StripeDialog] Failed to fetch transaction details:", response.message)
          toast.error(response.message || "Failed to fetch transaction details")
          return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined }
        }

        // Validate that we have valid transaction data arrays
        const txDatas = response.stripeTransactionDatas
        if (!Array.isArray(txDatas)) {
          console.error("[StripeDialog] stripeTransactionDatas is not an array:", txDatas)
          toast.error("Invalid transaction data format")
          return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined }
        }

        toast.success("Transaction details refreshed")
        return {
          transactionDatas: txDatas,
          invoiceDatas: response.stripeInvoiceDatas || [],
          invoiceId: response.stripeInvoiceId,
          paymentIntentIds: response.stripePaymentIntentIds || [],
        }
      } catch (error) {
        const err = error as Error
        console.error("[StripeDialog] Error in queryFn:", err)
        toast.error(err.message || "Failed to fetch transaction details")
        return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined }
      }
    },
    enabled: Boolean(open && (paymentIntentIds.length > 0 || stripeInvoiceId)),
    retry: 1,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })

  const displayTransactionDatas = refetchedData?.transactionDatas || transactionDatas
  const displayInvoiceDatas = refetchedData?.invoiceDatas || []
  const displayInvoiceId = refetchedData?.invoiceId || stripeInvoiceId
  const displayPaymentIntentIds = refetchedData?.paymentIntentIds || paymentIntentIds

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

  // Get latest invoice data
  const latestInvoiceData = displayInvoiceDatas.length > 0
    ? displayInvoiceDatas[displayInvoiceDatas.length - 1]
    : null
  const latestInvoices: StripeInvoice[] = latestInvoiceData?.invoices || []

  const isLoaded = !isLoading && (displayTransactionDatas.length > 0 || latestInvoices.length > 0)
  const hasData = displayPaymentIntentIds.length > 0 || displayInvoiceId

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex h-8 items-center gap-2 px-2"
        >
          <span className="truncate font-mono text-xs">
            {displayPaymentIntentIds.length > 0 ? (
              <>
                {displayPaymentIntentIds[0]?.slice(0, 4)}...
                {displayPaymentIntentIds[0]?.slice(-4)} {displayPaymentIntentIds.length > 1 && `+${displayPaymentIntentIds.length - 1}`}
                {displayInvoiceId && " • Invoice"}
              </>
            ) : displayInvoiceId ? (
              `Invoice ${displayInvoiceId.slice(0, 8)}...`
            ) : (
              "View Payments"
            )}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Stripe Payment Details</DialogTitle>
        </DialogHeader>

        {!hasData ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No payment intent or invoice data available
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <ReloadIcon className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-end gap-2">
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

            {/* Invoice Section */}
            {displayInvoiceId && latestInvoices.length > 0 && (
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Invoice</h3>
                  {latestInvoiceData?.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                      Updated: {new Date(latestInvoiceData.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {latestInvoices.map((invoice, idx) => {
                  const status = invoice.status
                  const amountDue = invoice.amount_due || 0
                  const amountPaid = invoice.amount_paid || 0
                  const amountRemaining = invoice.amount_remaining || 0
                  const total = invoice.total || 0
                  const lines = invoice.lines?.data || []
                  const currency = String(invoice.currency || "eur").toUpperCase()

                  const renderLineItems = (): ReactNode | null => {
                    if (lines.length === 0) return null
                    return (
                      <div className="space-y-2 border-t pt-2">
                        <h4 className="text-sm font-medium">Line Items ({lines.length})</h4>
                        <div className="max-h-48 space-y-1 overflow-y-auto">
                          {lines.map((line, lineIdx) => {
                            const amount = line.amount || 0
                            const quantity = line.quantity || 1
                            const description = line.description || "N/A"
                            return (
                              <div key={lineIdx} className="flex justify-between rounded bg-background p-2 text-xs">
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
                    )
                  }

                  return (
                    <div key={idx} className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice ID:</span>
                            <span className="font-mono">{String(invoice.id || displayInvoiceId)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`font-medium capitalize ${
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
                          {invoice.hosted_invoice_url ? (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Invoice URL:</span>
                              <a
                                href={invoice.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                View Invoice
                              </a>
                            </div>
                          ) : null}
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
                          {invoice.customer_email ? (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer Email:</span>
                              <span className="text-xs">{invoice.customer_email}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Invoice Line Items */}
                      {renderLineItems()}

                      {/* Status Transitions */}
                      {invoice.status_transitions && (
                        <div className="space-y-1 border-t pt-2 text-xs">
                          <div className="mb-1 font-medium text-muted-foreground">Status Timeline</div>
                          {Object.entries(invoice.status_transitions).map(([key, value]) => {
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
                  )
                })}
              </div>
            )}

            {/* Payment Intents Tabs */}
            {displayPaymentIntentIds.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Payment Intents ({displayPaymentIntentIds.length})</h3>
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
                            <div className="space-y-2 rounded-lg border p-4">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Payment ID:</span>
                                <span className="font-mono text-muted-foreground">{String(pi.id)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Status:</span>
                                <span className="capitalize text-muted-foreground">{typeof pi.status === "string" ? pi.status : "N/A"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Amount:</span>
                                <span className="text-muted-foreground">
                                  {((Number(pi.amount) || 0) / 100).toFixed(2)} {typeof pi.currency === "string" ? pi.currency.toUpperCase() : "N/A"}
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
                              {pi.description ? (
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Description:</span>
                                  <span className="text-muted-foreground">{typeof pi.description === "string" ? pi.description : "N/A"}</span>
                                </div>
                              ) : null}
                            </div>

                            {/* Latest Charge */}
                            {txData?.charges && txData.charges.length > 0 && (
                              <div className="space-y-2 rounded-lg border p-4">
                                <h4 className="font-medium">Latest Charge</h4>
                                {txData.charges.map((charge, idx) => (
                                  <div key={idx} className="space-y-1 border-t pt-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Charge ID:</span>
                                      <span className="font-mono">{String(charge.id)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <span className="capitalize">{String(charge.status)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Amount:</span>
                                      <span>
                                        {((Number(charge.amount) || 0) / 100).toFixed(2)} {String(charge.currency).toUpperCase()}
                                      </span>
                                    </div>
                                    {charge.receiptUrl && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Receipt:</span>
                                        <a
                                          href={String(charge.receiptUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-500 hover:underline"
                                        >
                                          View
                                        </a>
                                      </div>
                                    )}
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
              </div>
            )}

            {/* Transaction History */}
            {displayTransactionDatas.length > 0 && (
              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Transaction History</h3>
                <div className="space-y-2 text-sm">
                  {displayTransactionDatas.map((tx: StripeTransactionDetails, idx: number) => {
                    const txUnknown = tx as unknown as Record<string, unknown>
                    return (
                      <div key={idx} className="flex items-start justify-between border-t py-2 first:border-t-0 first:pt-0">
                        <div className="flex-1">
                          {tx.paymentIntent && (
                            <div className="font-mono text-xs text-muted-foreground">
                              {String((tx.paymentIntent as unknown as Record<string, unknown>).id).slice(0, 12)}...
                            </div>
                          )}
                          {txUnknown.invoiceCreatedAt ? (
                            <div className="text-xs">Invoice created</div>
                          ) : null}
                          {txUnknown.invoiceFinalizedAt ? (
                            <div className="text-xs">Invoice finalized</div>
                          ) : null}
                          {txUnknown.invoicePaymentFailedAt ? (
                            <div className="text-xs text-red-500">Payment failed</div>
                          ) : null}
                          {txUnknown.status ? (
                            <div className="text-xs capitalize text-muted-foreground">{typeof txUnknown.status === "string" ? txUnknown.status : "N/A"}</div>
                          ) : null}
                        </div>
                        <div className="text-right">
                          {txUnknown.amount ? (
                            <div className="text-xs font-medium">
                              {(Number(txUnknown.amount) / 100).toFixed(2)} {String(txUnknown.currency).toUpperCase()}
                            </div>
                          ) : null}
                          {tx.updatedAt && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.updatedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
