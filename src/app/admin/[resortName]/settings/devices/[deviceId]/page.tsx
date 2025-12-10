import * as React from "react"
import { notFound } from "next/navigation"
import { DeviceHistoryTable } from "@/features/device-history-table/device-history-table"
import {
  dbGetDeviceById,
} from "@/db/server-actions/devices-actions/db-get-device-history"
import {
  apiGetDeviceStatus,
  type DeviceStatusResponse,
} from "@/db/server-actions/devices-actions/api-get-device-status"

import { type SearchParams } from "@/types/index"
import Header from "@/components/layouts/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DeviceDetailPageProps {
  params: Promise<{
    deviceId: string
    resortName: string
  }>
  searchParams: Promise<SearchParams>
}

/**
 * Individual Device Detail Page
 * Shows device information, live status from API, and device history
 */
export default async function DeviceDetailPage({
  params,
  searchParams,
}: DeviceDetailPageProps) {
  const { deviceId, resortName } = await params

  // Parse device ID
  const parsedDeviceId = parseInt(deviceId)
  
  if (isNaN(parsedDeviceId)) {
    notFound()
  }

  // Fetch device from database
  const device = await dbGetDeviceById(parsedDeviceId)

  if (!device) {
    notFound()
  }

  // Fetch device status from API (using serial number for API)
  const deviceStatus: DeviceStatusResponse | null = await apiGetDeviceStatus(
    device.id.toString()
  )

  // Device history will be fetched by the DeviceHistoryTable component

  const statusData = deviceStatus?.data?.devices?.[0]?.deviceStatus

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              {
                label: "Devices",
                isLink: true,
                href: `/admin/${resortName}/settings/devices`,
              },
              {
                label: `Device #${device.id}`,
                isLink: false,
                href: "",
              },
            ]}
          />
        </div>

        {/* Device Information Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {/* Basic Device Info */}
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>
                Basic device details from database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Serial Number:</span>
                <span className="font-mono">{device.serial}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Chip ID:</span>
                <span className="font-mono">{device.chipId}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Hex:</span>
                <span className="font-mono">{device.hex}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">LUHN:</span>
                <span className="font-mono">{device.luhn}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Created At:</span>
                <span>
                  {device.createdAt
                    ? new Date(device.createdAt).toISOString().replace("T", " ").slice(0, 19)
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Live Device Status */}
          <Card>
            <CardHeader>
              <CardTitle>Live Device Status</CardTitle>
              <CardDescription>
                Real-time status from Myth system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusData ? (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Connection Status:</span>
                    <Badge variant={statusData.connected ? "default" : "destructive"}>
                      {statusData.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Device Allocated:</span>
                    <Badge variant={statusData.deviceAllocated ? "default" : "secondary"}>
                      {statusData.deviceAllocated ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Battery Level:</span>
                    <Badge
                      variant={
                        statusData.battery > 50
                          ? "default"
                          : statusData.battery > 20
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {statusData.battery}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Last Connected:</span>
                    <span className="text-sm">
                      {new Date(statusData.lastConnected).toISOString().replace("T", " ").slice(0, 19)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">IMEI:</span>
                    <span className="font-mono text-sm">{statusData.imei}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">DTA Code:</span>
                    <span className="font-mono text-sm">{statusData.dtaCode}</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Device status unavailable
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Device History Table */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Device History</CardTitle>
              <CardDescription>
                Complete audit trail for device #{device.id} (Serial: {device.serial})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceHistoryTable 
                deviceId={device.id.toString()}
                searchParams={searchParams}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
