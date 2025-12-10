"use client"

import * as React from "react"

import { type CalculatedOrderPrice } from "@/types/general-types"
import { Button } from "@/components/ui/button"

import { ClickAndCollectDialog } from "./order-collect-dialog"

interface ClickAndCollectButtonProps {
  orderId: number
  calculatedOrderPrice: CalculatedOrderPrice;
  halfWidth: boolean;
  /**
   * JSDoc: Whether the order has already been collected
   * Why: Prevents duplicate collection by disabling the trigger button
   * How: When true, the button is disabled and the dialog won't open
   */
  isCollected: boolean;


}

export function ClickAndCollectButton({
  orderId,
  calculatedOrderPrice,
  halfWidth,
  isCollected = false
}: ClickAndCollectButtonProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // Guard: do not allow opening the dialog if already collected
          if (isCollected) return
          setOpen(true)
        }}
        disabled={isCollected}
        aria-disabled={isCollected}
        title={isCollected ? "Order already collected" : "Click & Collect"}
        className={`w-full ${halfWidth && 'w-1/4'}`}
      >
        {isCollected ? "Collected" : "Click & Collect"}
      </Button>
      <ClickAndCollectDialog
        open={open}
        onOpenChange={setOpen}
        orderId={orderId}
        calculatedOrderPrice={calculatedOrderPrice}
      />
    </>
  )
}
