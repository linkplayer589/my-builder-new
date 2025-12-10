"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Props for OrdersTableClientDialog component
 */
export interface TOrdersTableClientDialogProps {
  clientDetails: {
    name: string
    email: string
    mobile: string
  }
}

/**
 * Dialog component for displaying client details
 * 
 * @param props - Component props
 * @param props.clientDetails - Client information (name, email, mobile)
 * @returns Dialog component with client details
 * 
 * @description
 * Displays client contact information in a dialog.
 * Used in orders table to show customer details for an order.
 * 
 * @example
 * <OrdersTableClientDialog 
 *   clientDetails={{ 
 *     name: "John Doe",
 *     email: "john@example.com",
 *     mobile: "+33 6 12 34 56 78"
 *   }} 
 * />
 */
export function OrdersTableClientDialog({ clientDetails }: TOrdersTableClientDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {clientDetails.email ? clientDetails.email : "Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Name:</span>
                <span className="text-muted-foreground">
                  {clientDetails.name}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Email:</span>
                <span className="text-muted-foreground">
                  {clientDetails.email}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Mobile:</span>
                <span className="text-muted-foreground">
                  {clientDetails.mobile}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

