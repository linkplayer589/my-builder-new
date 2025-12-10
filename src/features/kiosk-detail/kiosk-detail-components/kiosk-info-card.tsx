"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KioskInfoData } from "../kiosk-detail-types"

interface KioskInfoCardProps {
  data: KioskInfoData
}

/**
 * Displays comprehensive kiosk information including cabinet details,
 * shop information, and price strategy
 */
export function KioskInfoCard({ data }: KioskInfoCardProps) {
  const { cabinet, shop, priceStrategy } = data

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Cabinet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cabinet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={cabinet.online ? "default" : "destructive"}>
              {cabinet.online ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">POS Status</span>
            <Badge variant={cabinet.posOnlineStatus === "online" ? "default" : "secondary"}>
              {cabinet.posOnlineStatus}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Slots</span>
              <span className="font-medium">{cabinet.slots}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Empty Slots</span>
              <span className="font-medium text-green-600">{cabinet.emptySlots}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Busy Slots</span>
              <span className="font-medium text-orange-600">{cabinet.busySlots}</span>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Signal Strength</span>
              <span className="font-medium">{cabinet.signal}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-mono text-xs">{cabinet.ip}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">POS Device ID</span>
              <span className="font-mono text-xs">{cabinet.posDeviceId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">QR Code</span>
              <span className="font-mono text-xs">{cabinet.qrCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{shop.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shop ID</span>
              <span className="font-mono text-xs">{shop.id}</span>
            </div>
          </div>

          {shop.address && (
            <div className="border-t pt-2">
              <span className="text-sm text-muted-foreground">Address</span>
              <p className="mt-1 text-sm">{shop.address}</p>
            </div>
          )}

          {(shop.latitude && shop.longitude) && (
            <div className="border-t pt-2">
              <span className="text-sm text-muted-foreground">Coordinates</span>
              <div className="mt-1 space-y-1 font-mono text-xs">
                <div>Lat: {shop.latitude}</div>
                <div>Lng: {shop.longitude}</div>
              </div>
            </div>
          )}

          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{shop.deposit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Max Price</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{shop.dailyMaxPrice}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Strategy Name</span>
              <span className="font-medium">{priceStrategy.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">
                {priceStrategy.currency} ({priceStrategy.currencySymbol})
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{priceStrategy.price}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Minute</span>
              <span className="font-medium">{priceStrategy.priceMinute} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Free Minutes</span>
              <span className="font-medium">{priceStrategy.freeMinutes} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Max</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{priceStrategy.dailyMaxPrice}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit Amount</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{priceStrategy.depositAmount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timeout Amount</span>
              <span className="font-medium">
                {priceStrategy.currencySymbol}{priceStrategy.timeoutAmount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timeout Days</span>
              <span className="font-medium">{priceStrategy.timeoutDay} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Auto Refund</span>
              <Badge variant={priceStrategy.autoRefund === 1 ? "default" : "secondary"}>
                {priceStrategy.autoRefund === 1 ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

