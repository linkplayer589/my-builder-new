/**
 * Custom hook for managing order search state via URL parameters
 * Enables deep linking to specific orders and devices for return/swap flows
 */

"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"

export type OrderSearchView = "results" | "selected" | "processing"

/**
 * Hook to manage order search dialog state via URL parameters
 *
 * URL Parameters:
 * - orderId: Selected order ID
 * - deviceId: Selected device/lifepass ID (old pass being swapped/returned)
 * - view: Current view state (results | selected | processing)
 * - search: Original search query (for reference)
 *
 * @example
 * // URL: ?orderId=123&deviceId=456&view=selected
 * const { selectedOrderId, selectedDeviceId, view } = useOrderSearchState()
 *
 * // Select an order and device
 * selectOrder(123, "456")
 *
 * // Navigate back to results
 * showResults()
 */
export function useOrderSearchState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get current values from URL
  const selectedOrderId = useMemo(() => {
    const id = searchParams.get("orderId")
    return id ? parseInt(id, 10) : null
  }, [searchParams])

  const selectedDeviceId = useMemo(
    () => searchParams.get("deviceId"),
    [searchParams]
  )

  const searchQuery = useMemo(
    () => searchParams.get("search"),
    [searchParams]
  )

  const view = useMemo(() => {
    const v = searchParams.get("view") as OrderSearchView | null
    return v || "results"
  }, [searchParams])

  /**
   * Update URL parameters without full page reload
   */
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      // Build new URL
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname

      router.push(newUrl, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  /**
   * Select an order (optionally with a device)
   * Sets view to "selected"
   */
  const selectOrder = useCallback(
    (orderId: number, deviceId?: string) => {
      updateParams({
        orderId: orderId.toString(),
        deviceId: deviceId || null,
        view: "selected",
      })
    },
    [updateParams]
  )

  /**
   * Select a device for the currently selected order
   */
  const selectDevice = useCallback(
    (deviceId: string) => {
      if (!selectedOrderId) {
        console.warn("Cannot select device without an order selected")
        return
      }
      updateParams({
        deviceId,
      })
    },
    [selectedOrderId, updateParams]
  )

  /**
   * Navigate to processing view (swap/return in progress)
   */
  const startProcessing = useCallback(() => {
    if (!selectedOrderId || !selectedDeviceId) {
      console.warn("Cannot start processing without order and device selected")
      return
    }
    updateParams({
      view: "processing",
    })
  }, [selectedOrderId, selectedDeviceId, updateParams])

  /**
   * Show search results view
   */
  const showResults = useCallback(() => {
    updateParams({
      orderId: null,
      deviceId: null,
      view: "results",
    })
  }, [updateParams])

  /**
   * Clear all search state (return to initial state)
   */
  const clearSearch = useCallback(() => {
    updateParams({
      orderId: null,
      deviceId: null,
      view: null,
      search: null,
    })
  }, [updateParams])

  /**
   * Set the search query (for tracking what was searched)
   */
  const setSearchQuery = useCallback(
    (query: string) => {
      updateParams({
        search: query,
      })
    },
    [updateParams]
  )

  /**
   * Navigate back in the flow
   * - From processing -> selected
   * - From selected -> results
   * - From results -> clear search
   */
  const navigateBack = useCallback(() => {
    if (view === "processing") {
      updateParams({ view: "selected" })
    } else if (view === "selected") {
      showResults()
    } else {
      clearSearch()
    }
  }, [view, showResults, clearSearch, updateParams])

  return {
    // Current state
    selectedOrderId,
    selectedDeviceId,
    searchQuery,
    view,

    // Derived state
    hasSelectedOrder: selectedOrderId !== null,
    hasSelectedDevice: selectedDeviceId !== null,
    isShowingResults: view === "results",
    isShowingSelected: view === "selected",
    isProcessing: view === "processing",

    // Actions
    selectOrder,
    selectDevice,
    startProcessing,
    showResults,
    clearSearch,
    setSearchQuery,
    navigateBack,
    updateParams,
  }
}


