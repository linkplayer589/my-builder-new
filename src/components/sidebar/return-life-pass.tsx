// ReturnLifepassButton.tsx
"use client"

import * as React from "react"
import { ordersTableReturnLifepassApi } from "@/features/orders-table/orders-table-actions/orders-table-return-lifepass-api/route"
import { OrdersTableReturnLifepassDialog } from "@/features/orders-table/orders-table-features/orders-table-return-lifepass-dialog"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface ReturnLifepassButtonProps {
  deviceCodes: string[]
}

export const ReturnLifepassButton: React.FC<ReturnLifepassButtonProps> = ({
  deviceCodes,
}) => {
  const [showDialog, setShowDialog] = React.useState(false)

  const handleReturnLifepass = async (deviceIds: string[]) => {
    try {
      const result = await ordersTableReturnLifepassApi(deviceIds)

      if (result.success) {
        toast.success(result.message ?? "Successfully returned lifepass(es)", {
          duration: 5000,
        })
        setShowDialog(false)
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
  }

  return (
    <div>
      {/* Button to trigger the return lifepass dialog */}
      <Button
        variant="outline"
        className="w-[44%] text-xs"
        onClick={() => setShowDialog(true)}
      >
        Return Lifepass
      </Button>

      {/* ReturnLifepassDialog triggered by the button */}
      {showDialog && (
        <OrdersTableReturnLifepassDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onReturn={handleReturnLifepass}
          deviceCodes={deviceCodes}
        />
      )}
    </div>
  )
}
