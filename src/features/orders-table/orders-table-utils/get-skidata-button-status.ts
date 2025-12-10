import { type Order } from "@/db/schema"
import { type SkidataGetOrderResponse, type SkidataOrder, type TicketItem, type Attribute } from "@/types/skidata-types"

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
 * Calculates the Skidata dialog button status from order data
 *
 * Status logic:
 * - **Active (Green)**: At least one ticket is BookedAndTransferred AND Valid Until date is in the future
 * - **Completed (Default/outline)**: All tickets are BookedAndTransferred AND all Valid Until dates are in the past
 * - **Cancelled (Red)**: All tickets are CanceledAndTransferred
 * - **See Details (Yellow)**: Any other outcome
 *
 * @param order - Order data containing skidataOrderData
 * @returns Button status with text and className
 */
export function getSkidataButtonStatus(order: Order): {
  text: string
  className: string | undefined
} {
  const skidataData = order.skidataOrderData as SkidataGetOrderResponse | null | undefined

  // If no Skidata order data available, show "No Data"
  if (!skidataData || !skidataData.success || !skidataData.orderDetails) {
    return { text: "No Data", className: undefined }
  }

  // Handle case where orderDetails might be a string (JSON stringified)
  let orderDetails: SkidataOrder | null | undefined
  if (typeof skidataData.orderDetails === "string") {
    try {
      orderDetails = JSON.parse(skidataData.orderDetails) as SkidataOrder
    } catch {
      return { text: "No Data", className: undefined }
    }
  } else if (typeof skidataData.orderDetails === "object") {
    orderDetails = skidataData.orderDetails as SkidataOrder
  } else {
    return { text: "No Data", className: undefined }
  }

  // Get all tickets from the order
  const allTickets = getAllTickets(orderDetails)

  // If no tickets, show "No Data"
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

  // If at least one ticket is active -> Active (Green)
  if (hasActiveTicket) {
    return { text: "Active", className: "bg-green-600 text-white hover:bg-green-700" }
  }

  // Check if all non-cancelled tickets are past end date -> Completed (Default)
  const allActiveTickets = allTickets.filter((t) => isTicketActive(t))
  const allPastEndDate = allActiveTickets.length > 0 && allActiveTickets.every((t) => isTicketPastEndDate(t))

  if (allPastEndDate) {
    return { text: "Completed", className: undefined }
  }

  // Any other outcome -> See Details (Yellow)
  return { text: "See Details", className: "bg-yellow-500 text-white hover:bg-yellow-600" }
}

