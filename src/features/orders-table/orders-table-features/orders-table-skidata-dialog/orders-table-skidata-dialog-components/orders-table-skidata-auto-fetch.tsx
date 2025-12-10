"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { type Order } from "@/db/schema"
import { type SkidataGetOrderResponse, type SkidataOrder, type TicketItem, type Attribute } from "@/types/skidata-types"

import { getSkidataOrder } from "../orders-table-skidata-dialog-actions/get-skidata-order/route"
import { SkidataDialog, type SkidataDialogProps } from "./orders-table-skidata-dialog"

/**
 * Checks if a ticket is cancelled (CanceledAndTransferred or any cancel status)
 * Matches: "CanceledAndTransferred", "Canceled", "Cancelled", etc.
 */
function isTicketCancelled(ticket: TicketItem): boolean {
  const ps = (ticket.permissionStatus || "").toLowerCase()
  const ss = (ticket.salesStatus || "").toLowerCase()
  return ps.includes("cancel") || ss.includes("cancel")
}

/**
 * Checks if a ticket is active (not cancelled)
 * Active statuses include: "Issued", "BookedAndTransferred", "Booked", etc.
 */
function isTicketActive(ticket: TicketItem): boolean {
  return !isTicketCancelled(ticket)
}

/**
 * Checks if a ticket is past its end date (dta-validity-end)
 * A ticket is past end date if the end date is BEFORE today (not including today)
 */
function isTicketPastEndDate(ticket: TicketItem): boolean {
  const endDateAttr = ticket.attributes?.find((attr: Attribute) => attr.key === "dta-validity-end")
  if (!endDateAttr?.value) return false
  try {
    const endDate = new Date(endDateAttr.value)
    if (isNaN(endDate.getTime())) return false

    // Compare dates only (ignore time) - ticket is valid for the entire end date day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDateOnly = new Date(endDate)
    endDateOnly.setHours(23, 59, 59, 999) // End of the valid day

    return today.getTime() > endDateOnly.getTime()
  } catch {
    return false
  }
}

/**
 * Gets all tickets from order details
 */
function getAllTickets(orderDetails: SkidataOrder | null | undefined): TicketItem[] {
  if (!orderDetails || typeof orderDetails !== "object" || !Array.isArray(orderDetails.orderItems)) {
    return []
  }
  return orderDetails.orderItems.flatMap((item) =>
    Array.isArray(item.ticketItems) ? item.ticketItems : []
  )
}

/**
 * Calculate button status from fetched data
 */
function calculateButtonStatus(data: SkidataGetOrderResponse[] | null | undefined): {
  text: string
  className: string | undefined
} {
  if (!Array.isArray(data) || data.length === 0) {
    return { text: "No Data", className: undefined }
  }

  // Collect all tickets from all successful entries
  const allTickets: TicketItem[] = []
  for (const entry of data) {
    if (entry.success && typeof entry.orderDetails === "object" && entry.orderDetails) {
      allTickets.push(...getAllTickets(entry.orderDetails as SkidataOrder))
    }
  }

  if (allTickets.length === 0) {
    return { text: "No Data", className: undefined }
  }

  // Check if ALL tickets are cancelled -> Cancelled (Red)
  const allCanceled = allTickets.every((t) => isTicketCancelled(t))
  if (allCanceled) {
    return { text: "Cancelled", className: "bg-red-600 text-white hover:bg-red-700" }
  }

  // Check for active tickets (not cancelled with future/today Valid Until date)
  const hasActiveTicket = allTickets.some(
    (t) => isTicketActive(t) && !isTicketPastEndDate(t)
  )

  if (hasActiveTicket) {
    return { text: "Active", className: "bg-green-600 text-white hover:bg-green-700" }
  }

  // Check if all non-cancelled tickets are past end date -> Completed
  const allActiveTickets = allTickets.filter((t) => isTicketActive(t))
  const allPastEndDate = allActiveTickets.length > 0 && allActiveTickets.every((t) => isTicketPastEndDate(t))

  if (allPastEndDate) {
    return { text: "Completed", className: undefined }
  }

  // Any other outcome -> See Details (Yellow)
  return { text: "See Details", className: "bg-yellow-500 text-white hover:bg-yellow-600" }
}

interface SkidataAutoFetchProps {
  order: Order
  skidataOrderSubmissionData: SkidataDialogProps["skidataOrderSubmissionData"]
  initialButtonStatus: { text: string; className?: string }
}

/**
 * Wrapper component that auto-fetches Skidata data for orders that don't have it
 *
 * If the initial status is not "Cancelled" and order is not complete,
 * it will fetch the latest data from Skidata and display the updated status.
 */
export function SkidataAutoFetch({
  order,
  skidataOrderSubmissionData,
  initialButtonStatus,
}: SkidataAutoFetchProps) {
  // Determine if we should auto-fetch
  // Skip if: Cancelled, Completed, or order is complete
  const isOrderComplete = order.orderStatus === "order-complete"
  const shouldAutoFetch =
    initialButtonStatus.text !== "Cancelled" &&
    initialButtonStatus.text !== "Completed" &&
    !isOrderComplete

  // Fetch Skidata order data
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ["skidataOrder", skidataOrderSubmissionData.orderId],
    queryFn: () =>
      getSkidataOrder(order.resortId, skidataOrderSubmissionData.orderId, order.id),
    enabled: shouldAutoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch too often
    refetchOnWindowFocus: false,
  })

  // Calculate button status from fetched data or use initial
  const buttonStatus = React.useMemo(() => {
    if (isLoading) {
      return { text: "Loading...", className: undefined }
    }
    if (fetchedData && Array.isArray(fetchedData)) {
      return calculateButtonStatus(fetchedData)
    }
    return initialButtonStatus
  }, [fetchedData, isLoading, initialButtonStatus])

  return (
    <SkidataDialog
      resortId={order.resortId}
      skidataOrderSubmissionData={skidataOrderSubmissionData}
      orderId={order.id}
      buttonStatus={buttonStatus}
    />
  )
}

