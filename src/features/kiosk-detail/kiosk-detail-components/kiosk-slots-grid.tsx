"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Battery, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { KioskSlot } from "../kiosk-detail-types"
import { ejectSlot } from "../kiosk-detail-actions/eject-slot"

interface KioskSlotsGridProps {
  kioskId: string
  slots: KioskSlot[]
  onSlotEjected?: () => void
}

/**
 * Displays a grid of kiosk slots with detailed information
 * Allows force ejection of individual slots
 */
export function KioskSlotsGrid({ kioskId, slots, onSlotEjected }: KioskSlotsGridProps) {
  const [ejectingSlot, setEjectingSlot] = React.useState<number | null>(null)
  const [slotToEject, setSlotToEject] = React.useState<number | null>(null)

  /**
   * Handles the slot ejection confirmation dialog
   */
  const handleEjectClick = (slotNumber: number) => {
    setSlotToEject(slotNumber)
  }

  /**
   * Performs the actual slot ejection
   */
  const handleConfirmEject = async () => {
    if (!slotToEject) return

    setEjectingSlot(slotToEject)
    
    try {
      const result = await ejectSlot(kioskId, slotToEject)

      if (result.success) {
        toast.success(`Slot ${slotToEject} ejected successfully`, {
          description: `Ejected at ${new Date(result.data.timestamp).toLocaleTimeString()}`,
        })
        
        // Notify parent component to refresh data
        onSlotEjected?.()
      } else {
        toast.error("Failed to eject slot", {
          description: result.error,
        })
      }
    } catch (error) {
      console.error("Error ejecting slot:", error)
      toast.error("Failed to eject slot", {
        description: "An unexpected error occurred",
      })
    } finally {
      setEjectingSlot(null)
      setSlotToEject(null)
    }
  }

  /**
   * Gets the appropriate badge variant based on slot state
   */
  const getStateBadgeVariant = (state: number): "default" | "secondary" | "destructive" => {
    switch (state) {
      case 1: // Empty
        return "secondary"
      case 2: // Occupied
        return "default"
      case 3: // Fault
        return "destructive"
      default:
        return "secondary"
    }
  }

  /**
   * Gets the appropriate icon for slot state
   */
  const getStateIcon = (state: number) => {
    switch (state) {
      case 1: // Empty
        return <CheckCircle className="size-4" />
      case 2: // Occupied
        return <Battery className="size-4" />
      case 3: // Fault
        return <AlertTriangle className="size-4" />
      default:
        return <XCircle className="size-4" />
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slots.map((slot) => (
          <Card key={slot.slotId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Slot {slot.slotNumber}</CardTitle>
                <Badge variant={getStateBadgeVariant(slot.state)}>
                  <span className="flex items-center gap-1">
                    {getStateIcon(slot.state)}
                    {slot.stateDescription}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Battery Information */}
              {slot.batteryId && slot.batteryId !== "0000000000" && (
                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Battery ID</span>
                    <span className="font-mono text-xs">{slot.batteryId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Charge</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${slot.batteryCharge}%` }}
                        />
                      </div>
                      <span className="font-medium">{slot.batteryCharge}%</span>
                    </div>
                  </div>
                  {slot.battery && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-medium">{slot.battery.ptemperature}°C</span>
                    </div>
                  )}
                </div>
              )}

              {/* Fault Information */}
              {slot.faultType > 0 && slot.faultCause && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="size-4" />
                    Fault Detected
                  </div>
                  <p className="text-xs text-muted-foreground">{slot.faultCause}</p>
                </div>
              )}

              {/* Slot Metadata */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Slot ID:</span>
                  <span className="font-mono">{slot.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span>{new Date(slot.lastLogTime).toLocaleString()}</span>
                </div>
                {slot.lastBatteryId && (
                  <div className="flex justify-between">
                    <span>Last Battery:</span>
                    <span className="font-mono">{slot.lastBatteryId}</span>
                  </div>
                )}
              </div>

              {/* Eject Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleEjectClick(slot.slotNumber)}
                disabled={ejectingSlot === slot.slotNumber}
              >
                {ejectingSlot === slot.slotNumber ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Ejecting...
                  </>
                ) : (
                  "Force Eject"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Eject Confirmation Dialog */}
      <AlertDialog open={slotToEject !== null} onOpenChange={() => setSlotToEject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Slot Ejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force eject slot {slotToEject}? This action will
              open the slot regardless of its current state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEject}>
              Eject Slot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

