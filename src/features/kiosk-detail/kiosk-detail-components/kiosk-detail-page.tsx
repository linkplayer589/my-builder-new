"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { KioskInfoCard } from "./kiosk-info-card"
import { KioskSlotsGrid } from "./kiosk-slots-grid"
import { getKioskInfo } from "../kiosk-detail-actions/get-kiosk-info"
import { getKioskSlots } from "../kiosk-detail-actions/get-kiosk-slots"
import type { KioskInfoData, KioskSlotsData } from "../kiosk-detail-types"

interface KioskDetailPageProps {
  kioskId: string
  resortName: string
}

/**
 * Main kiosk detail page component
 * Fetches and displays comprehensive kiosk information and slot status
 */
export function KioskDetailPage({ kioskId, resortName }: KioskDetailPageProps) {
  const router = useRouter()
  const [kioskInfo, setKioskInfo] = React.useState<KioskInfoData | null>(null)
  const [slotsData, setSlotsData] = React.useState<KioskSlotsData | null>(null)
  const [isLoadingInfo, setIsLoadingInfo] = React.useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  /**
   * Fetches kiosk information from API
   */
  const fetchKioskInfo = React.useCallback(async () => {
    try {
      const result = await getKioskInfo(kioskId)

      if (result.success) {
        setKioskInfo(result.data)
        setError(null)
      } else {
        setError(result.error)
        toast.error("Failed to load kiosk information", {
          description: result.error,
        })
      }
    } catch (err) {
      console.error("Error fetching kiosk info:", err)
      setError("An unexpected error occurred")
      toast.error("Failed to load kiosk information")
    } finally {
      setIsLoadingInfo(false)
    }
  }, [kioskId])

  /**
   * Fetches slot information from API
   */
  const fetchSlotsData = React.useCallback(async () => {
    try {
      const result = await getKioskSlots(kioskId)

      if (result.success) {
        setSlotsData(result.data)
        setError(null)
      } else {
        setError(result.error)
        toast.error("Failed to load slot information", {
          description: result.error,
        })
      }
    } catch (err) {
      console.error("Error fetching slots:", err)
      setError("An unexpected error occurred")
      toast.error("Failed to load slot information")
    } finally {
      setIsLoadingSlots(false)
    }
  }, [kioskId])

  /**
   * Refreshes all kiosk data
   */
  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchKioskInfo(), fetchSlotsData()])
    setIsRefreshing(false)
    toast.success("Data refreshed successfully")
  }, [fetchKioskInfo, fetchSlotsData])

  /**
   * Navigates back to kiosks list
   */
  const handleBack = () => {
    router.push(`/admin/${resortName}/settings/kiosks`)
  }

  /**
   * Initial data fetch on mount
   */
  React.useEffect(() => {
    fetchKioskInfo()
    fetchSlotsData()
  }, [fetchKioskInfo, fetchSlotsData])

  /**
   * Loading skeleton
   */
  if (isLoadingInfo || isLoadingSlots) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Error state
   */
  if (error && !kioskInfo) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertCircle className="size-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to Load Kiosk</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Kiosks
                </Button>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="mr-2 size-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kiosk {kioskId}</h1>
            <p className="text-sm text-muted-foreground">
              {kioskInfo?.shop.name || "Loading..."}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Kiosk Information Cards */}
      {kioskInfo && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Kiosk Information</h2>
            <KioskInfoCard data={kioskInfo} />
          </div>

          {/* Battery Summary */}
          {kioskInfo.batteries.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Battery Overview ({kioskInfo.batteries.length} batteries)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {kioskInfo.batteries.map((battery) => (
                  <Card key={battery.batteryId}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Slot {battery.slotNum}</span>
                          <span className="text-xs text-muted-foreground">
                            {battery.vol}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${battery.vol}%` }}
                          />
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {battery.batteryId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot Grid */}
      {slotsData && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Slots ({slotsData.totalSlots} total, {slotsData.emptySlots} empty, {slotsData.occupiedSlots} occupied, {slotsData.faultSlots} faults)
          </h2>
          <KioskSlotsGrid
            kioskId={kioskId}
            slots={slotsData.slots}
            onSlotEjected={handleRefresh}
          />
        </div>
      )}
    </div>
  )
}

