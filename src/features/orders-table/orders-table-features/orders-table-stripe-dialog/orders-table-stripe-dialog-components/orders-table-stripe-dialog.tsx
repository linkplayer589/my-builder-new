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

import { getStripeTransaction } from "../orders-table-stripe-dialog-actions/get-stripe-transaction/route"

interface StripeDialogProps {
  orderId: number
  stripePaymentIntentIds?: string[]
  stripeInvoiceId?: string
  stripeInvoiceDatas?: StripeInvoiceData[]
  stripeTransactionDatas?: StripeTransactionDetails[]
  /** Fallback for single payment intent (legacy) */
  stripePaymentIntentId?: string
  stripeTransactionData?: StripeTransactionDetails | null
  /** Optional controlled open state (for mobile) */
  open?: boolean
  /** Optional controlled open state handler (for mobile) */
  onOpenChange?: (open: boolean) => void
  /** Optional custom button label */
  buttonLabel?: string
}

export function StripeDialog({
  orderId,
  stripePaymentIntentIds,
  stripeInvoiceId,
  stripeInvoiceDatas,
  stripeTransactionDatas,
  stripePaymentIntentId: legacyPaymentIntentId,
  stripeTransactionData: legacyTransactionData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  buttonLabel,
}: StripeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

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
  } = useQuery<{
    transactionDatas: StripeTransactionDetails[]
    invoiceDatas: StripeInvoiceData[]
    invoiceId?: string
    paymentIntentIds: string[]
  }>({
    queryKey: ["stripeTransaction", orderId],
    queryFn: async () => {
      try {
        const response = await getStripeTransaction(orderId)

        // Check for explicit failure
        if (!response || typeof response !== 'object') {
          toast.error("Failed to fetch transaction details")
          return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined, paymentIntentIds: [] }
        }

        const anyResp = response as unknown as Record<string, unknown>

        // Check for explicit failure (success: false)
        if (anyResp.success === false) {
          toast.error("Failed to fetch transaction details")
          return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined, paymentIntentIds: [] }
        }

        const transactionDatas = anyResp["stripeTransactionDatas"] as StripeTransactionDetails[] | undefined
        const invoiceDatas = anyResp["stripeInvoiceDatas"] as StripeInvoiceData[] | undefined
        const invoiceId = anyResp["stripeInvoiceId"] as string | undefined
        const paymentIntentIds = anyResp["stripePaymentIntentIds"] as string[] | undefined

        toast.success("Transaction details refreshed")
        return {
          transactionDatas: Array.isArray(transactionDatas) ? transactionDatas : [],
          invoiceDatas: Array.isArray(invoiceDatas) ? invoiceDatas : [],
          invoiceId,
          paymentIntentIds: Array.isArray(paymentIntentIds) ? paymentIntentIds : [],
        }
      } catch (error) {
        const err = error as Error
        toast.error(err.message || "Failed to fetch transaction details")
        return { transactionDatas: [], invoiceDatas: [], invoiceId: undefined, paymentIntentIds: [] }
      }
    },
    enabled: Boolean(open && (paymentIntentIds.length > 0 || stripeInvoiceId)),
    retry: 1,
    staleTime: 30000,
  })

  const displayTransactionDatas = (refetchedData?.transactionDatas as StripeTransactionDetails[] | undefined) || transactionDatas
  const displayInvoiceDatas = (refetchedData?.invoiceDatas as StripeInvoiceData[] | undefined) || stripeInvoiceDatas || []
  const displayInvoiceId = (refetchedData?.invoiceId as string | undefined) || stripeInvoiceId
  const displayPaymentIntentIds = (refetchedData?.paymentIntentIds as string[] | undefined) || paymentIntentIds

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger if not controlled (desktop mode) */}
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex h-8 items-center gap-2 px-2"
          >
            <span className="truncate text-xs">
              {buttonLabel ?? (displayPaymentIntentIds.length > 0
                ? `${displayPaymentIntentIds.length} payment${displayPaymentIntentIds.length > 1 ? 's' : ''}`
                : "View"
              )}
            </span>
          </Button>
        </DialogTrigger>
      )}
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
              {latestInvoiceData?.updatedAt && (
                <div className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date(latestInvoiceData.updatedAt).toLocaleString()}
                </div>
              )}
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

            {/* Main Tabs: Invoice and Payment Intents */}
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
                    const amountDue = invoice.amount_due || 0
                    const amountPaid = invoice.amount_paid || 0
                    const amountRemaining = invoice.amount_remaining || 0
                    const total = invoice.total || 0
                    const lines = invoice.lines?.data || []
                    const currency = String(invoice.currency || "eur").toUpperCase()

                    const renderLineItems = (): ReactNode | null => {
                      if (lines.length === 0) return null
                      return (
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
                      )
                    }

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
                              {invoice.hosted_invoice_url ? (
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
                                  <span className="capitalize text-muted-foreground">{pi.status ? String(pi.status) : "N/A"}</span>
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
                                {pi.description ? (
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Description:</span>
                                    <span className="text-muted-foreground">{String(pi.description)}</span>
                                  </div>
                                ) : null}
                              </div>

                              {/* Latest Charge */}
                              {txData?.charges && txData.charges.length > 0 && (
                                <div className="rounded-lg border p-4 space-y-2">
                                  <h4 className="font-medium">Latest Charge</h4>
                                  {txData.charges.map((charge, idx) => (
                                    <div key={idx} className="space-y-1 text-sm border-t pt-2">
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
                                            href={String(charge.receiptUrl) || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-xs"
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
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
