"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { type Order, type Product, type ConsumerCategory } from "@/db/schema"
import { ordersTableReturnLifepassApi } from "@/features/orders-table/orders-table-actions/orders-table-return-lifepass-api/route"
import { dbGetAllProductsByResortId } from "@/db/server-actions/product-actions/db-get-all-products-by-resort-id"
import { dbGetAllConsumerCategoriesByResortId } from "@/db/server-actions/consumer-categories-actions/db-get-all-consumer-categories-by-resort-id"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { type OrderSearchResultsProps } from "../order-search-types"

export function OrderSearchResults({
  results,
  onOrderClick,
  isSwap = false,
  onSelectOrder,
  onSelectLifePass
}: OrderSearchResultsProps) {
  const [returningDeviceIds, setReturningDeviceIds] = React.useState<Set<string>>(new Set())

  // Get unique resort IDs from results
  const resortIds = React.useMemo(() => {
    const ids = new Set<number>()
    results.forEach(order => {
      if (order.resortId) ids.add(order.resortId)
    })
    return Array.from(ids)
  }, [results])

  // Fetch products for all resorts in results
  const { data: productsMap = new Map<number, Product[]>() } = useQuery({
    queryKey: ["order-search-products", resortIds],
    queryFn: async () => {
      const map = new Map<number, Product[]>()
      await Promise.all(
        resortIds.map(async (resortId) => {
          const products = await dbGetAllProductsByResortId(resortId)
          map.set(resortId, products)
        })
      )
      return map
    },
    enabled: resortIds.length > 0,
  })

  // Fetch categories for all resorts in results
  const { data: categoriesMap = new Map<number, ConsumerCategory[]>() } = useQuery({
    queryKey: ["order-search-categories", resortIds],
    queryFn: async () => {
      const map = new Map<number, ConsumerCategory[]>()
      await Promise.all(
        resortIds.map(async (resortId) => {
          const categories = await dbGetAllConsumerCategoriesByResortId(resortId)
          map.set(resortId, categories)
        })
      )
      return map
    },
    enabled: resortIds.length > 0,
  })

  /**
   * Get display name for a product by resort
   */
  const getProductDisplayName = React.useCallback((resortId: number, productId: string | undefined): string => {
    if (!productId) return "Unknown"

    const products = productsMap.get(resortId) || []
    const product = products.find(p => p.id === productId)
    if (product?.titleTranslations?.en) return product.titleTranslations.en

    // Fallback: show shortened ID
    return productId.length > 12 ? `${productId.slice(0, 8)}...` : productId
  }, [productsMap])

  /**
   * Get display name for a consumer category by resort
   */
  const getCategoryDisplayName = React.useCallback((resortId: number, categoryId: string | undefined): string => {
    if (!categoryId) return "Unknown"

    const categories = categoriesMap.get(resortId) || []
    const category = categories.find(c => c.id === categoryId)
    if (category?.titleTranslations?.en) return category.titleTranslations.en

    // Fallback: show shortened ID
    return categoryId.length > 12 ? `${categoryId.slice(0, 8)}...` : categoryId
  }, [categoriesMap])

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

  const handleReturnLifepass = async (deviceIds: string[]) => {
    setReturningDeviceIds(prev => new Set([...prev, ...deviceIds]))

    try {
      const result = await ordersTableReturnLifepassApi(deviceIds)

      if (result.success) {
        toast.success(result.message ?? "Successfully returned lifepass(es)", {
          duration: 5000,
        })
      } else {
        toast.error(result.message ?? "Failed to return lifepass", {
          duration: 5000,
          description: "Please try again or contact support if the issue persists.",
        })
      }
    } catch (error) {
      console.error("Error returning lifepass:", error)
      toast.error("An unexpected error occurred", {
        duration: 5000,
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setReturningDeviceIds(prev => {
        const updated = new Set(prev)
        deviceIds.forEach(id => updated.delete(id))
        return updated
      })
    }
  }

    const _handleReturnOne = (order: Order) => {
    const deviceIds = order.mythOrderSubmissionData?.devices
      ? [order.mythOrderSubmissionData.devices?.[0]?.deviceId ?? ""]
      : []

    if (deviceIds.length > 0) {
      void handleReturnLifepass(deviceIds)
    }
  }

  const handleReturnAll = (order: Order) => {
    const deviceIds =
      order.mythOrderSubmissionData?.devices
        ?.map((device) => device.deviceId)
        .filter((id): id is string => id !== undefined) || []

    if (deviceIds.length > 0) {
      void handleReturnLifepass(deviceIds)
    }
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
    <div className="space-y-3 pb-4 sm:space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold sm:text-xl">
          Results ({results.length})
        </h3>
        {!isSwap && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm sm:h-10"
            onClick={() => results.forEach((order) => handleReturnAll(order))}
            disabled={results.some(order =>
              order.mythOrderSubmissionData?.devices?.some(d => returningDeviceIds.has(d.deviceId || "N/A"))
            )}
          >
            Return All
          </Button>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3 sm:space-y-4">
        {results.map((order : Order) => (
          <div
            key={order.id}
            className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-4"
          >
            {/* Order Header - clickable */}
            <div
              onClick={() => onOrderClick(order)}
              className="cursor-pointer space-y-2"
            >
              {/* Order ID & Price Row */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">#{order.id || "N/A"}</span>
                <span className="text-lg font-bold">{formatPrice(order)}</span>
              </div>

              {/* Contact Info */}
              <div className="text-sm">
                {order.clientDetails?.email && (
                  <p className="truncate font-medium">{order.clientDetails.email}</p>
                )}
                {order.clientDetails?.mobile && (
                  <p className="text-muted-foreground">{order.clientDetails.mobile}</p>
                )}
              </div>

              {/* Details Grid - Single Column for Mobile */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(order.createdAt)}</span></div>
                <div><span className="text-muted-foreground">Channel:</span> <span className="font-medium capitalize">{order.salesChannel}</span></div>
                <div><span className="text-muted-foreground">Order:</span> <span className="font-medium capitalize">{order.orderStatus || "N/A"}</span></div>
                <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium capitalize">{order.paymentStatus || "N/A"}</span></div>
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            {/* Devices Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                  {order.mythOrderSubmissionData?.devices?.length || 0} Device
                  {order.mythOrderSubmissionData?.devices?.length !== 1 ? "s" : ""}
                </span>
              </div>
              {order.mythOrderSubmissionData?.devices?.length ? (
                <div className="space-y-2">
                  {order.mythOrderSubmissionData.devices.map((device, idx) => {
                    // Get product info from orderItemPrices (uses correct IDs that match products table)
                    const orderItemPrice = order.calculatedOrderPrice?.orderItemPrices?.[idx]
                    const productName = orderItemPrice
                      ? getProductDisplayName(order.resortId, orderItemPrice.productId)
                      : "Unknown"
                    const categoryName = orderItemPrice
                      ? getCategoryDisplayName(order.resortId, orderItemPrice.consumerCategoryId)
                      : "Unknown"

                    return (
                      <div
                        key={device.deviceId || idx}
                        className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          {device.deviceCode && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help font-mono text-sm font-bold sm:text-base">
                                    {device.deviceCode}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>DTA: {device.dtaCode || "N/A"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {productName} ({categoryName})
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="h-9 shrink-0 text-sm sm:h-10"
                          disabled={returningDeviceIds.has(device.deviceId || "N/A")}
                          onClick={() => {
                            if (isSwap) {
                              // Pass device ID directly to onSelectOrder for URL state
                              onSelectOrder(order, device?.deviceId || undefined)
                            } else {
                              if (device.deviceId) {
                                void handleReturnLifepass([device.deviceId])
                              }
                            }
                          }}
                        >
                          {returningDeviceIds.has(device.deviceId || "N/A")
                            ? "Returning..."
                            : isSwap
                            ? "Select"
                            : "Return"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No devices</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
