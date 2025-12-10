"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ordersTableSwapPassApi } from "@/features/orders-table/orders-table-actions/orders-table-swap-pass-api/route"
import { ordersTableCreateSkipassApi } from "@/features/orders-table/orders-table-actions/orders-table-create-skipass-api/route"
import { ordersTableCancelSkipassApi } from "@/features/orders-table/orders-table-actions/orders-table-cancel-skipass-api/route"
// import { ordersTableGetSkidataOrderApi } from "@/features/orders-table/orders-table-actions/orders-table-get-skidata-order-api/route"
// import type { TSkidataOrderResponse } from "@/features/orders-table/orders-table-actions/orders-table-get-skidata-order-api/types"
// import { getMythOrder } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog/orders-table-myth-dialog-actions/get-myth-order/route"
// import { dbGetDeviceByCode } from "@/db/server-actions/devices-actions/db-get-device-by-code"

/**
 * Extract the most useful error message from Myth swap API response
 * Prioritizes the detailed error message from the nested response object
 */
function formatMythSwapError(data: unknown): { summary: string; detail: string | null } {
  if (!data || typeof data !== "object") return { summary: "Unknown error", detail: null }

  const root = data as Record<string, unknown>
  const error = root["error"]
  const message = root["message"]
  const details = root["details"] as Record<string, unknown> | undefined

  // Try to get the detailed error from the nested response
  let detailMessage: string | null = null
  if (details && typeof details === "object") {
    const response = details["response"] as Record<string, unknown> | undefined
    if (response && typeof response === "object") {
      const detail = response["detail"]
      if (typeof detail === "string") {
        detailMessage = detail
      }
    }
  }

  // Build summary
  const parts: string[] = []
  if (typeof error === "string") parts.push(error.replace(/_/g, " "))
  if (typeof message === "string" && message !== "Bad Request") parts.push(message)

  const summary = parts.length ? parts.join(": ") : "Unknown error"

  return { summary, detail: detailMessage }
}

/**
 * Props for OrdersTableSwapPassDialog component
 */
interface TOrdersTableSwapPassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  resortId: number
  deviceCodes: string[]
  /**
   * When provided, pre-fills the Old Pass field and makes it read-only.
   * If not provided, a dropdown of available device codes is shown instead.
   */
  defaultOldPassId?: string
  /**
   * Optional mapping of device code to product metadata (for creating skipass)
   */
  deviceDetailsByCode?: Record<string, { productId: string; consumerCategoryId: string }>
  /**
   * Previous Skidata order id we are cancelling from
   */
  previousSkidataOrderId?: string
}

type TPassStatus = {
  /** Pass is on Myth (device assigned to a Myth order) */
  onMyth: boolean | null
  /** Skipass/Skidata order active for this pass */
  skipassActive: boolean | null
  /** This is the active pass after swap */
  activePass: boolean | null
}

function StatusRow({ label, state }: { label: string; state: boolean | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      {state === true ? (
        <CheckCircle2 className="size-4 text-green-600" />
      ) : state === false ? (
        <XCircle className="size-4 text-red-600" />
      ) : (
        <HelpCircle className="size-4 text-muted-foreground" />
      )}
    </div>
  )
}

export function OrdersTableSwapPassDialog({
  open,
  onOpenChange,
  orderId,
  resortId,
  deviceCodes,
  defaultOldPassId,
  deviceDetailsByCode: _deviceDetailsByCode,
  previousSkidataOrderId: _previousSkidataOrderId,
}: TOrdersTableSwapPassDialogProps) {
  const [oldPassId, setOldPassId] = React.useState("")
  const [newPassId, setNewPassId] = React.useState("")

  const [oldStatus, setOldStatus] = React.useState<TPassStatus>({
    onMyth: null,
    skipassActive: null,
    activePass: null,
  })
  const [newStatus, setNewStatus] = React.useState<TPassStatus>({
    onMyth: null,
    skipassActive: null,
    activePass: null,
  })

  const [isProc1Loading, setIsProc1Loading] = React.useState(false)
  const [isProc2Loading, setIsProc2Loading] = React.useState(false)
  const [isProc3Loading, setIsProc3Loading] = React.useState(false)
  const [proc1Error, setProc1Error] = React.useState<string | null>(null)
  const [proc1ErrorObj, setProc1ErrorObj] = React.useState<Record<string, unknown> | null>(null)

  // Live data placeholders (disabled for now to avoid noise)

  // We intentionally do NOT derive the Skidata order id from the create step.
  // Cancellation targets the previous Skidata order id that the old pass belongs to.

  // Initialize defaults when dialog opens
  React.useEffect(() => {
    if (!open) return
    const fallbackOld = deviceCodes.length === 1 ? (deviceCodes[0] ?? "") : ""
    const presetOld: string = defaultOldPassId ?? fallbackOld
    setOldPassId(presetOld)
    setNewPassId("")
    setOldStatus({ onMyth: null, skipassActive: null, activePass: null })
    setNewStatus({ onMyth: null, skipassActive: null, activePass: null })
    setIsProc1Loading(false)
    setIsProc2Loading(false)
    setIsProc3Loading(false)
  }, [open, defaultOldPassId, deviceCodes])

  // Initial and device info fetches are temporarily disabled while we finalize the flow

  /** Process 1: Swap pass on Myth */
  const handleProcess1SwapOnMyth = async () => {
    if (!oldPassId || !newPassId) return
    try {
      setIsProc1Loading(true)
      setProc1Error(null)
      const result = await ordersTableSwapPassApi(orderId, oldPassId, newPassId, resortId, false)
      if (result.success) {
        toast.success(result.message ?? "Pass swapped on Myth")
        // Optimistic status updates based on known effects of the swap
        setOldStatus((prev) => ({ ...prev, onMyth: false, activePass: false }))
        setNewStatus((prev) => ({ ...prev, onMyth: true, activePass: true }))
        setProc1Error(null)
        setProc1ErrorObj(null)
        // Optionally refetch Myth order here if desired
      } else {
        const { summary, detail } = formatMythSwapError(result.data)
        // Show the detailed error message if available, otherwise the summary
        const displayError = detail || summary
        setProc1Error(displayError)
        try {
          const obj = result.data as unknown as Record<string, unknown>
          if (obj && typeof obj === 'object') setProc1ErrorObj(obj)
        } catch {}
        toast.error("Myth swap failed", {
          description: displayError,
        })
      }
    } catch (error) {
      console.error("Error swapping pass on Myth:", error)
      const errorText = error instanceof Error ? error.message : "Unknown error"
      setProc1Error(errorText)
      setProc1ErrorObj(null)
      toast.error("Myth swap failed", { description: errorText })
    } finally {
      setIsProc1Loading(false)
    }
  }

  /** Process 2: Create new skipass on the new device */
  const handleProcess2CreateSkipass = async () => {
    if (!oldPassId || !newPassId) return
    try {
      setIsProc2Loading(true)
      const result = await ordersTableCreateSkipassApi(
        orderId,
        oldPassId,
        newPassId
      )
      if (result.success) {
        toast.success(result.message ?? "Created new skipass")
        setNewStatus((prev) => ({ ...prev, skipassActive: true }))
        // Optionally refetch Skidata orders here if desired
      } else {
        toast.error(result.message ?? "Failed to create skipass")
      }
    } catch (error) {
      console.error("Error creating skipass:", error)
      toast.error("Failed to create skipass")
    } finally {
      setIsProc2Loading(false)
    }
  }

  /** Process 3: Cancel old skipass on the old device */
  const handleProcess3CancelOldSkipass = async () => {
    if (!oldPassId) return
    try {
      setIsProc3Loading(true)
      // Let the server resolve the correct Skidata order from either previousSkidataOrderId or the admin order id
      const result = await ordersTableCancelSkipassApi(
        Number(orderId),
        Number(oldPassId)
      )
      if (result.success) {
        toast.success(result.message ?? "Cancelled old skipass")
        setOldStatus((prev) => ({ ...prev, skipassActive: false }))
      } else {
        toast.error(result.message ?? "Failed to cancel old skipass")
      }
    } catch (error) {
      console.error("Error cancelling skipass:", error)
      toast.error("Failed to cancel old skipass")
    } finally {
      setIsProc3Loading(false)
    }
  }

  const renderOldPassSelector = () => {
    if (defaultOldPassId) {
      return (
        <Input id="oldPassId" value={oldPassId} disabled readOnly className="bg-muted/50" />
      )
    }
    return (
      <Select value={oldPassId} onValueChange={setOldPassId}>
        <SelectTrigger>
          <SelectValue placeholder="Select a pass to swap" />
        </SelectTrigger>
        <SelectContent>
          {deviceCodes.map((code) => (
            <SelectItem key={code} value={code}>
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap Pass</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2 md:grid-cols-2">
          {/* Left: Old Pass */}
          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassId">Old Pass ID</Label>
              {renderOldPassSelector()}
            </div>
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-semibold">Status</h4>
              <div className="space-y-1">
                <StatusRow label="On Myth" state={oldStatus.onMyth} />
                <StatusRow label="Skipass Active" state={oldStatus.skipassActive} />
                <StatusRow label="Active Pass" state={oldStatus.activePass} />
              </div>
            </div>
          </div>

          {/* Right: New Pass */}
          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-2">
              <Label htmlFor="newPassId">New Pass ID</Label>
              <Input
                id="newPassId"
                value={newPassId}
                onChange={(e) => setNewPassId(e.target.value)}
                placeholder="Enter new pass ID..."
              />
            </div>
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-semibold">Status</h4>
              <div className="space-y-1">
                <StatusRow label="On Myth" state={newStatus.onMyth} />
                <StatusRow label="Skipass Active" state={newStatus.skipassActive} />
                <StatusRow label="Active Pass" state={newStatus.activePass} />
              </div>
            </div>
          </div>
        </div>

        {proc1Error && (
          <Alert variant="destructive" className="mb-2 border-2 border-red-500">
            <AlertTriangle className="size-5" />
            <div className="ml-2">
              <div className="font-semibold">Swap Failed</div>
              <AlertDescription className="mt-1 font-medium">{proc1Error}</AlertDescription>
            </div>
          </Alert>
        )}
        {proc1ErrorObj && (
          <details className="mb-2 rounded-md border bg-muted/30">
            <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Show technical details
            </summary>
            <div className="overflow-auto border-t p-2 text-xs">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(proc1ErrorObj, null, 2)}</pre>
            </div>
          </details>
        )}

        {/* Guidance */}
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            If the device has already been used at the gate, cancellation might not be possible and may
            require transfer at the LTH desk.
          </AlertDescription>
        </Alert>

        {/* Processes */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            onClick={handleProcess1SwapOnMyth}
            disabled={!oldPassId || !newPassId || isProc1Loading}
            aria-busy={isProc1Loading}
          >
            {isProc1Loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            1) Swap on Myth
          </Button>
          <Button
            variant="secondary"
            onClick={handleProcess2CreateSkipass}
            disabled={!oldPassId || !newPassId || isProc2Loading}
            aria-busy={isProc2Loading}
          >
            {isProc2Loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            2) Create new skipass
          </Button>
          <Button
            variant="outline"
            onClick={handleProcess3CancelOldSkipass}
            disabled={!oldPassId || isProc3Loading}
            aria-busy={isProc3Loading}
          >
            {isProc3Loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            3) Cancel old skipass
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
