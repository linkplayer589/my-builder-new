"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Props for OrdersTableReturnLifepassDialog component
 */
interface TOrdersTableReturnLifepassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReturn: (deviceIds: string[]) => Promise<void>
  deviceCodes: string[]
}

/**
 * Dialog component for returning lifepass devices
 * 
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.onOpenChange - Callback when dialog open state changes
 * @param props.onReturn - Callback to execute the return operation
 * @param props.deviceCodes - List of device codes available for return
 * @returns Dialog component with return form
 * 
 * @description
 * Provides a form to select and return one or more lifepass devices.
 * Shows loading state during the return operation.
 * Resets form after successful return.
 * 
 * @example
 * <OrdersTableReturnLifepassDialog 
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onReturn={handleReturn}
 *   deviceCodes={["DEVICE123", "DEVICE456"]}
 * />
 */
export function OrdersTableReturnLifepassDialog({
  open,
  onOpenChange,
  onReturn,
  deviceCodes,
}: TOrdersTableReturnLifepassDialogProps) {
  const [selectedDevices, setSelectedDevices] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const handleReturn = async () => {
    if (selectedDevices.length === 0) return

    setIsLoading(true)
    try {
      await onReturn(selectedDevices)
      setSelectedDevices([])
    } catch (error) {
      toast.error("Failed to return lifepass")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Lifepass</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Passes to Return</Label>
            <Select
              value={selectedDevices.join(",")}
              onValueChange={(value) =>
                setSelectedDevices(value.split(",").filter(Boolean))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select passes to return" />
              </SelectTrigger>
              <SelectContent>
                {deviceCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReturn}
            disabled={selectedDevices.length === 0 || isLoading}
            variant="destructive"
          >
            {isLoading ? "Returning..." : "Return Selected Passes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

