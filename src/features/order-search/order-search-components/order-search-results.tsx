"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { type OrderSearchResultsProps } from "../order-search-types"

export function OrderSearchResults({
  results,
  onOrderClick,
}: OrderSearchResultsProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "No date"
    return new Date(date).toLocaleDateString()
  }

  const formatPrice = (order: Order) => {
    if (!order.calculatedOrderPrice) return "No price"
    const totalPrice =
      order.calculatedOrderPrice.cumulatedPrice?.bestPrice?.amountGross
    if (totalPrice === undefined) return "No price"
    return `$${totalPrice.toFixed(2)}`
  }

  if (results.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>
          No orders found matching your search criteria.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Results</h3>
        {results.map((order) => {
          return (
            <div
              key={order.id}
              className="cursor-pointer rounded-lg border p-4 hover:bg-accent"
              onClick={() => onOrderClick(order)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Order #{order.id || "N/A"}</p>
                    <Badge variant="outline" className="capitalize">
                      {order.salesChannel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.clientDetails?.name || "No name provided"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>•</span>
                    <span>{order.clientDetails?.mobile || "No phone"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {order.deviceIds?.length || 0} devices
                </span>
                <span className="font-medium">{formatPrice(order)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
