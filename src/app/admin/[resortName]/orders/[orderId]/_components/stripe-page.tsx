"use client"

import { useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { type StripeTransactionDetails } from "@/types/stripe-types"
import { Button } from "@/components/ui/button"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStripeTransaction } from "@/features/orders-table/orders-table-features/orders-table-stripe-dialog/orders-table-stripe-dialog-actions/get-stripe-transaction/route"


interface StripePageProps {
    orderId: number
    stripePaymentIntentId: string
    stripeTransactionData: StripeTransactionDetails | null
}

export function StripePage({
    orderId,
    stripePaymentIntentId,
    stripeTransactionData,
}: StripePageProps) {
    const [open, _setOpen] = useState(false)

    const {
        data: transactionData,
        refetch,
        isLoading,
        isFetching,
    } = useQuery<StripeTransactionDetails | null>({
        queryKey: ["stripeTransaction", orderId],
        queryFn: async () => {
            try {
                const response = await getStripeTransaction(orderId)

                // Check for explicit failure
                if (!response || typeof response !== 'object') {
                    toast.error("Failed to fetch transaction details")
                    return null
                }

                const anyResp = response as unknown as Record<string, unknown>

                // Check for explicit failure (success: false)
                if (anyResp.success === false) {
                    toast.error("Failed to fetch transaction details")
                    return null
                }

                const single = anyResp["stripeTransactionData"] as StripeTransactionDetails | undefined
                const multi = anyResp["stripeTransactionDatas"] as StripeTransactionDetails[] | undefined
                const detail = single ?? (Array.isArray(multi) ? multi[0] : undefined)
                if (!detail) {
                    toast.error("No transaction details found")
                    return null
                }
                toast.success("Transaction details refreshed")
                return detail
            } catch (error) {
                const err = error as Error
                toast.error(err.message || "Failed to fetch transaction details")
                return null
            }
        },
        enabled: open,
        retry: 1,
    })

    const displayData = transactionData || stripeTransactionData

    const isValidData =
        displayData &&
        displayData.paymentIntent?.id &&
        typeof displayData.paymentIntent.amount === "number"

    return (
        <div className="container mx-auto">


            <div className="mb-4 flex items-center justify-end gap-2">
                {displayData?.updatedAt && (
                    <div className="text-sm text-muted-foreground">
                        Last updated: <RelativeDayBadge date={new Date(displayData.updatedAt)} />
                    </div>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2"
                    disabled={isFetching}
                >
                    <ReloadIcon className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                        href={`https://dashboard.stripe.com/payments/${stripePaymentIntentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="size-4" />
                        View in Stripe
                    </a>
                </Button>
            </div>

            {!displayData || isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <ReloadIcon className="size-6 animate-spin" />
                </div>
            ) : !isValidData ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <p className="text-sm text-destructive">Invalid or missing transaction data</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            ) : (
                <Tabs defaultValue="payment">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="payment">Payment Intent</TabsTrigger>
                        <TabsTrigger value="customer">Customer</TabsTrigger>
                        <TabsTrigger value="charges">Charges</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payment" className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <div className="space-y-2">
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Payment ID:</span>
                                    <span className="mt-1 font-mono text-muted-foreground md:mt-0">
                                        {displayData.paymentIntent.id}
                                    </span>
                                </div>
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span className="mt-1 capitalize text-muted-foreground md:mt-0">
                                        {displayData.paymentIntent.status}
                                    </span>
                                </div>
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Amount:</span>
                                    <span className="mt-1 text-muted-foreground md:mt-0">
                                        {(displayData.paymentIntent.amount / 100).toFixed(2)}{" "}
                                        {displayData.paymentIntent.currency.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="mt-1 capitalize text-muted-foreground md:mt-0">
                                        {displayData.paymentIntent.payment_method_types?.join(", ") || "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Description:</span>
                                    <span className="mt-1 text-muted-foreground md:mt-0">
                                        {displayData.paymentIntent.description || "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                    <span className="font-medium">Created:</span>
                                    <span className="mt-1 text-muted-foreground md:mt-0">
                                        {new Date(displayData.paymentIntent.created * 1000).toLocaleString()}
                                    </span>
                                </div>
                                {displayData.paymentIntent.canceled_at && (
                                    <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                        <span className="font-medium">Canceled At:</span>
                                        <span className="mt-1 text-muted-foreground md:mt-0">
                                            {new Date(displayData.paymentIntent.canceled_at * 1000).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {displayData.paymentIntent.cancellation_reason && (
                                    <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                        <span className="font-medium">Cancellation Reason:</span>
                                        <span className="mt-1 capitalize text-muted-foreground md:mt-0">
                                            {displayData.paymentIntent.cancellation_reason}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>


                        {displayData.paymentIntent.last_payment_error && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                                <h4 className="mb-2 font-medium text-destructive">Last Payment Error</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Code:</span>
                                        <span className="text-muted-foreground">
                                            {displayData.paymentIntent.last_payment_error.code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Message:</span>
                                        <span className="text-muted-foreground">
                                            {displayData.paymentIntent.last_payment_error.message}
                                        </span>
                                    </div>
                                    {displayData.paymentIntent.last_payment_error.decline_code && (
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Decline Code:</span>
                                            <span className="text-muted-foreground">
                                                {displayData.paymentIntent.last_payment_error.decline_code}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {displayData.paymentIntent.latest_charge && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-medium">Latest Charge Details</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Payment Method:</span>
                                        <span className="capitalize text-muted-foreground">
                                            {(typeof displayData.paymentIntent.latest_charge !== "string" &&
                                                displayData.paymentIntent.latest_charge
                                                    ?.payment_method_details?.type) ||
                                                "N/A"}
                                        </span>
                                    </div>
                                    {typeof displayData.paymentIntent.latest_charge !== "string" &&
                                        displayData.paymentIntent.latest_charge
                                            ?.payment_method_details?.type === "card" && (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Card Brand:</span>
                                                    <span className="capitalize text-muted-foreground">
                                                        {
                                                            displayData.paymentIntent.latest_charge.payment_method_details
                                                                .card?.brand
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Last 4:</span>
                                                    <span className="font-mono text-muted-foreground">
                                                        ****{" "}
                                                        {
                                                            displayData.paymentIntent.latest_charge.payment_method_details
                                                                .card?.last4
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Expiry:</span>
                                                    <span className="text-muted-foreground">
                                                        {
                                                            displayData.paymentIntent.latest_charge.payment_method_details
                                                                .card?.exp_month
                                                        }
                                                        /
                                                        {
                                                            displayData.paymentIntent.latest_charge.payment_method_details
                                                                .card?.exp_year
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">3D Secure:</span>
                                                    <span className="capitalize text-muted-foreground">
                                                        {displayData.paymentIntent.latest_charge
                                                            .payment_method_details.card?.three_d_secure?.result ||
                                                            "Not Required"}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="customer" className="space-y-4">
                        {displayData.customer && (
                            <div className="rounded-lg border p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Customer ID:</span>
                                        <span className="font-mono text-muted-foreground">
                                            {displayData.customer.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Name:</span>
                                        <span className="text-muted-foreground">
                                            {displayData.customer.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Email:</span>
                                        <span className="text-muted-foreground">
                                            {displayData.customer.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Phone:</span>
                                        <span className="text-muted-foreground">
                                            {displayData.customer.phone}
                                        </span>
                                    </div>
                                    {displayData.customer.address && (
                                        <div className="space-y-1 rounded border p-2">
                                            <h4 className="text-sm font-medium">Address</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div>{displayData.customer.address.line1}</div>
                                                {displayData.customer.address.line2 && (
                                                    <div>{displayData.customer.address.line2}</div>
                                                )}
                                                <div>
                                                    {displayData.customer.address.city},{" "}
                                                    {displayData.customer.address.postal_code}
                                                </div>
                                                <div>{displayData.customer.address.country}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="charges" className="space-y-4">
                        {displayData.charges.map((charge) => (
                            <div key={charge.id} className="rounded-lg border p-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            {[
                                                { label: "Charge ID:", value: charge.id, mono: true },
                                                { label: "Status:", value: charge.status, capitalize: true },
                                                {
                                                    label: "Amount:",
                                                    value: `${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`,
                                                },
                                                {
                                                    label: "Created:",
                                                    value: new Date(charge.created).toLocaleString(),
                                                },
                                            ].map(({ label, value, mono, capitalize }, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col text-sm md:flex-row md:justify-between"
                                                >
                                                    <span className="font-medium">{label}</span>
                                                    <span
                                                        className={`${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""
                                                            } mt-1 text-muted-foreground md:mt-0`}
                                                    >
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            {[
                                                { label: "Paid:", value: charge.paid ? "Yes" : "No" },
                                                { label: "Refunded:", value: charge.refunded ? "Yes" : "No" },
                                                { label: "Captured:", value: charge.captured ? "Yes" : "No" },
                                            ].map(({ label, value }, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col text-sm md:flex-row md:justify-between"
                                                >
                                                    <span className="font-medium">{label}</span>
                                                    <span className="mt-1 text-muted-foreground md:mt-0">{value}</span>
                                                </div>
                                            ))}

                                            {charge.receiptUrl && (
                                                <div className="flex flex-col text-sm md:flex-row md:justify-between">
                                                    <span className="font-medium">Receipt:</span>
                                                    <a
                                                        href={charge.receiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 text-blue-500 hover:underline md:mt-0"
                                                    >
                                                        View Receipt
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {charge.balanceTransaction && (
                                        <div className="space-y-2 rounded border p-2">
                                            <h4 className="text-sm font-medium">Balance Transaction</h4>
                                            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                                <div className="space-y-1">
                                                    {[
                                                        {
                                                            label: "Amount:",
                                                            value: `${(charge.balanceTransaction.amount / 100).toFixed(
                                                                2
                                                            )} ${charge.currency.toUpperCase()}`,
                                                        },
                                                        {
                                                            label: "Fee:",
                                                            value: `${(charge.balanceTransaction.fee / 100).toFixed(
                                                                2
                                                            )} ${charge.currency.toUpperCase()}`,
                                                        },
                                                        {
                                                            label: "Net:",
                                                            value: `${(charge.balanceTransaction.net / 100).toFixed(
                                                                2
                                                            )} ${charge.currency.toUpperCase()}`,
                                                            fontMedium: true,
                                                        },
                                                    ].map(({ label, value, fontMedium }, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex flex-col md:flex-row md:justify-between ${fontMedium ? "font-medium" : ""
                                                                }`}
                                                        >
                                                            <span className="text-muted-foreground">{label}</span>
                                                            <span className="mt-1 md:mt-0">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-1">
                                                    {charge.balanceTransaction.feeDetails.map((fee, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col text-sm md:flex-row md:justify-between"
                                                        >
                                                            <span className="text-muted-foreground">{fee.description}:</span>
                                                            <span className="mt-1 md:mt-0">
                                                                {(fee.amount / 100).toFixed(2)} {fee.currency.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                </Tabs>
            )}
        </div>
    )
}
