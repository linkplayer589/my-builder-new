"use client"

import { type StripeTransactionDetails } from "@/types/stripe-types"
import { Separator } from "@/components/ui/separator"

interface StripePaymentStatusProps {
  paymentIntent: string | null
  transactionData: StripeTransactionDetails | null
}

export function StripePaymentStatus({
  paymentIntent: _paymentIntent,
  transactionData,
}: StripePaymentStatusProps) {
  const status = transactionData?.paymentIntent?.status || "N/A"
  
  // Safely check if any charges are refunded
  const isRefunded = transactionData?.charges?.some(
    (charge) => charge.refunded
  ) || false

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Payment Status</p>
        <p className="font-medium capitalize">{status}</p>
      </div>
      {isRefunded && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Refund Status</p>
            <p className="font-medium text-red-500">Refunded</p>
          </div>
        </>
      )}
    </div>
  )
}
