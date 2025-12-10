"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { useResort } from "@/features/resorts"

import { useToast } from "@/components/ui/use-toast"
import { useOrderSearchState } from "@/hooks/use-order-search-state"

import { OrderSearchForm } from "./order-search-form"
import { OrderSearchResults } from "./order-search-results"
import { SelectedOrder } from "./selected-order"
import { SwapPassProcess } from "./swap-pass-process"

export function OrderSearchDialog({ isSwap = false }: { isSwap?: boolean }) {
  const { resort } = useResort()
  const { toast } = useToast()

  // URL-based state management
  const {
    selectedOrderId,
    selectedDeviceId,
    view,
    selectOrder,
    selectDevice,
    startProcessing,
    showResults: navigateToResults,
    setSearchQuery,
  } = useOrderSearchState()

  // Local state for search results (not in URL as it's temporary data)
  const [searchResults, setSearchResults] = React.useState<Order[]>([])

  /**
   * Handle search completion
   * Stores results locally and device ID in URL
   */
  const handleSearch = React.useCallback(
    (results: Order[], deviceIdSearched: string) => {
      setSearchResults(results)
      setSearchQuery(deviceIdSearched)
      navigateToResults()
    },
    [setSearchQuery, navigateToResults]
  )

  /**
   * Handle search error
   */
  const handleError = React.useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    },
    [toast]
  )

  /**
   * Navigate to order details page
   */
  const handleOrderClick = React.useCallback(
    (order: Order) => {
      window.location.href = `/admin/${resort?.name.toLowerCase()}/orders/${order.id}`
    },
    [resort]
  )

  /**
   * Select a device for swap/return
   * Updates URL with device ID
   */
  const onSelectLifePass = React.useCallback(
    (deviceId: string) => {
      selectDevice(deviceId)
    },
    [selectDevice]
  )

  /**
   * Select an order and optionally a device
   * Updates URL with order ID and device ID
   */
  const handleSelectOrder = React.useCallback(
    (order: Order, deviceId?: string) => {
      selectOrder(order.id, deviceId)
    },
    [selectOrder]
  )

  /**
   * Navigate back to results
   */
  const handleBackToResults = React.useCallback(() => {
    navigateToResults()
  }, [navigateToResults])

  /**
   * Get the currently selected order from results
   */
  const selectedOrder = React.useMemo(() => {
    if (!selectedOrderId) return null
    return searchResults.find((order) => order.id === selectedOrderId) || null
  }, [selectedOrderId, searchResults])

  /**
   * Determine what view to show
   */
  const showResults = view === "results" && searchResults.length > 0
  const showSelected = view === "selected" && selectedOrder !== null
  const showProcessing = view === "processing" && selectedOrder !== null && selectedDeviceId

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header/Form Section - fixed at top */}
      <div className="shrink-0 px-4 pb-4 sm:px-6">
        <OrderSearchForm
          isSwap={isSwap}
          onSearch={handleSearch}
          showSearch={!showSelected && !showProcessing}
          onError={handleError}
        />
      </div>

      {/* Scrollable Content Section */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
        {/* Processing View - Swap flow with 3 steps */}
        {showProcessing && isSwap && (
          <SwapPassProcess
            order={selectedOrder}
            oldPassId={selectedDeviceId!}
            onBack={handleBackToResults}
          />
        )}

        {/* Selected Order View - Return flow or pre-swap */}
        {showSelected && !showProcessing && selectedOrder && (
          <>
            {isSwap ? (
              <SwapPassProcess
                order={selectedOrder}
                oldPassId={selectedDeviceId || ""}
                onBack={handleBackToResults}
              />
            ) : (
              <SelectedOrder
                oldFifepassId={selectedDeviceId || ""}
                order={selectedOrder}
                oldLifePassId={selectedDeviceId || ""}
                onChange={handleBackToResults}
              />
            )}
          </>
        )}

        {/* Results View - Show search results */}
        {showResults && (
          <OrderSearchResults
            isSwap={isSwap}
            results={searchResults}
            onOrderClick={handleOrderClick}
            onSelectLifePass={onSelectLifePass}
            onSelectOrder={(order: Order, deviceId?: string) => {
              handleSelectOrder(order, deviceId)
            }}
          />
        )}
      </div>
    </div>
  )
}