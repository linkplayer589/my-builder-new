"use client"

import * as React from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { AlertCircle, Battery, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { ordersTableReturnLifepassApi } from "../../../orders-table-actions/orders-table-return-lifepass-api/route"
import { ordersTableSwapPassApi } from "../../../orders-table-actions/orders-table-swap-pass-api/route"

interface TDevice {
  id: string
  deviceCode?: string
  productId?: string
  consumerCategoryId?: string
  insurance?: boolean
  imei?: string
  battery?: number
  dtaCode?: string
  nickname?: string
  connected?: boolean
  deviceAllocated?: boolean
}

interface TOrdersTableOrderDetailsDropdownDeviceCardProps {
  device: TDevice
  isReturned: boolean
  hasSkidataRecord: boolean
  orderId: number
  resortId: number
  getProductName: (id: string) => { en: string; fr: string }
  getConsumerCategoryName: (id: string) => { en: string; fr: string }
  allDeviceCodes: string[]
  onActionComplete: () => void
}

/**
 * Device card component for order details dropdown overview
 *
 * @description
 * Displays comprehensive device information for staff diagnostic purposes.
 * Shows device status, allows returning and swapping passes.
 */
export function OrdersTableOrderDetailsDropdownDeviceCard({
  device,
  isReturned,
  hasSkidataRecord,
  orderId,
  resortId,
  getProductName,
  getConsumerCategoryName,
  allDeviceCodes,
  onActionComplete,
}: TOrdersTableOrderDetailsDropdownDeviceCardProps) {
  const [isReturning, setIsReturning] = React.useState(false)
  const [isSwapping, setIsSwapping] = React.useState(false)
  const [newDeviceCode, setNewDeviceCode] = React.useState("")

  const handleReturnPass = async () => {
    if (!device.deviceCode) return

    setIsReturning(true)
    try {
      const result = await ordersTableReturnLifepassApi([device.deviceCode])

      if (result.success) {
        toast.success(result.message ?? "Successfully returned pass")
        onActionComplete()
      } else {
        toast.error(result.message ?? "Failed to return pass")
      }
    } catch (error) {
      console.error("Error returning pass:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsReturning(false)
    }
  }

  const handleSwapPass = async () => {
    if (!device.deviceCode || !newDeviceCode) return

    setIsSwapping(true)
    try {
      const result = await ordersTableSwapPassApi(
        orderId,
        device.deviceCode,
        newDeviceCode,
        resortId,
        hasSkidataRecord
      )

      if (result.success) {
        toast.success("Pass swapped successfully")
        setNewDeviceCode("")
        onActionComplete()
      } else {
        toast.error(result.message || "Failed to swap pass")
      }
    } catch (error) {
      console.error("Error swapping pass:", error)
      toast.error("Failed to swap pass")
    } finally {
      setIsSwapping(false)
    }
  }

  const getBatteryIcon = (battery?: number) => {
    if (!battery) return null
    if (battery >= 60) return <Battery className="size-4 text-green-500" />
    if (battery >= 30) return <Battery className="size-4 text-yellow-500" />
    return <Battery className="size-4 text-red-500" />
  }

  return (
    <Card className={isReturned ? "border-red-300 bg-red-50/50" : ""}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with Status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {device.deviceCode || "No Device Assigned"}
                </h4>
                {isReturned ? (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="size-3" />
                    Returned
                  </Badge>
                ) : (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="size-3" />
                    Active
                  </Badge>
                )}
              </div>
              {device.nickname && (
                <p className="text-sm text-muted-foreground">{device.nickname}</p>
              )}
            </div>
            {device.battery !== undefined && (
              <div className="flex items-center gap-2">
                {getBatteryIcon(device.battery)}
                <span className="text-sm font-medium">{device.battery}%</span>
              </div>
            )}
          </div>

          {/* Device Details Grid */}
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="text-sm font-medium">
                {device.productId ? getProductName(device.productId).en : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">
                {device.consumerCategoryId
                  ? getConsumerCategoryName(device.consumerCategoryId).en
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Insurance</p>
              <Badge variant={device.insurance ? "default" : "outline"} className="w-fit">
                {device.insurance ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Skidata Record</p>
              <Badge
                variant={hasSkidataRecord ? "default" : "secondary"}
                className="w-fit gap-1"
              >
                {hasSkidataRecord ? (
                  <>
                    <CheckCircle className="size-3" />
                    Skipass Added
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-3" />
                    No Skipass
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Technical Details (if device assigned) */}
          {device.deviceCode && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">Technical Details</p>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                {device.imei && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IMEI:</span>
                    <span className="font-mono">{device.imei}</span>
                  </div>
                )}
                {device.dtaCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DTA Code:</span>
                    <span className="font-mono">{device.dtaCode}</span>
                  </div>
                )}
                {device.connected !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected:</span>
                    <Badge variant={device.connected ? "default" : "secondary"}>
                      {device.connected ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
                {device.deviceAllocated !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allocated:</span>
                    <Badge variant={device.deviceAllocated ? "default" : "secondary"}>
                      {device.deviceAllocated ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions (only for active devices) */}
          {!isReturned && device.deviceCode && (
            <div className="flex gap-2 border-t pt-3">
              {/* Return Pass */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isReturning}>
                    {isReturning && <ReloadIcon className="mr-2 size-4 animate-spin" />}
                    Return Pass
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Return Pass?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to return pass <strong>{device.deviceCode}</strong>?
                      This will mark the device as returned and make it available for other
                      orders.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReturnPass}>
                      Return Pass
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Swap Pass */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isSwapping}>
                    {isSwapping && <ReloadIcon className="mr-2 size-4 animate-spin" />}
                    Swap Pass
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Swap Pass</AlertDialogTitle>
                    <AlertDialogDescription>
                      Replace <strong>{device.deviceCode}</strong> with a different pass.
                      {hasSkidataRecord &&
                        " The skipass will also be transferred to the new device."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium">New Device Code</label>
                    <input
                      type="text"
                      value={newDeviceCode}
                      onChange={(e) => setNewDeviceCode(e.target.value)}
                      placeholder="Enter new device code"
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNewDeviceCode("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSwapPass}
                      disabled={!newDeviceCode.trim()}
                    >
                      Swap Pass
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

