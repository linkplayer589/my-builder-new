"use client"

interface StripePriceBreakdownProps {
  amount: number
  currency?: string
}

export function StripePriceBreakdown({
  amount,
  currency = "USD",
}: StripePriceBreakdownProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100) // Convert cents to dollars
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Total Amount</p>
      <p className="font-medium">{formatPrice(amount)}</p>
    </div>
  )
}
