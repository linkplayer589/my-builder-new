/**
 * Custom hook for managing sidebar sheet state via URL parameters
 * Enables deep linking and browser history navigation for sidebar sheets
 */

"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"

export type SheetType =
  | "search"
  | "rent"
  | "return"
  | "swap"
  | "troubleshoot"
  | "access-kiosk"
  | "inventory"

/**
 * Hook to manage sidebar sheet state via URL parameters
 *
 * @example
 * const { isOpen, openSheet, closeSheet } = useSidebarSheetState("rent")
 *
 * // Open rent sheet - URL will be ?sheet=rent
 * openSheet()
 *
 * // Check if rent sheet is open
 * if (isOpen) { ... }
 *
 * // Close any sheet
 * closeSheet()
 */
export function useSidebarSheetState(sheetType: SheetType) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get current sheet from URL
  const currentSheet = searchParams.get("sheet")

  // Check if this specific sheet is open
  const isOpen = useMemo(
    () => currentSheet === sheetType,
    [currentSheet, sheetType]
  )

  /**
   * Open this sheet by setting URL param
   */
  const openSheet = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sheet", sheetType)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname, sheetType])

  /**
   * Close any open sheet by removing URL param
   */
  const closeSheet = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("sheet")
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }, [searchParams, router, pathname])

  /**
   * Toggle this sheet
   */
  const toggleSheet = useCallback(() => {
    if (isOpen) {
      closeSheet()
    } else {
      openSheet()
    }
  }, [isOpen, openSheet, closeSheet])

  return {
    isOpen,
    openSheet,
    closeSheet,
    toggleSheet,
    currentSheet,
  }
}

/**
 * Hook to get all sheet states at once
 * Useful for managing multiple sheets in a component
 */
export function useAllSidebarSheets() {
  const searchParams = useSearchParams()
  const currentSheet = searchParams.get("sheet") as SheetType | null

  const sheets = {
    search: useSidebarSheetState("search"),
    rent: useSidebarSheetState("rent"),
    return: useSidebarSheetState("return"),
    swap: useSidebarSheetState("swap"),
    troubleshoot: useSidebarSheetState("troubleshoot"),
    accessKiosk: useSidebarSheetState("access-kiosk"),
    inventory: useSidebarSheetState("inventory"),
  }

  return {
    sheets,
    currentSheet,
    hasOpenSheet: currentSheet !== null,
  }
}


