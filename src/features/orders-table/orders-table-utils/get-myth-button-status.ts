import { type Order } from "@/db/schema"
import { type MythGetOrderResponse } from "@/types/myth-types"

/**
 * Calculates the Myth dialog button status from order data
 *
 * @param order - Order data containing mythOrderData
 * @returns Button status with text and className
 *
 * @description
 * "Submitted" status shows when:
 * - mythOrderData is null/undefined (order not fetched from Myth API yet, or fetch failed)
 * - This indicates the order was submitted but we don't have the current state from Myth
 */
export function getMythButtonStatus(order: Order): {
  text: string
  className: string | undefined
} {
  const mythResponse = order.mythOrderData as MythGetOrderResponse | null | undefined

  // If no myth order data exists, show "Submitted" (order submitted but not yet fetched/available)
  if (!mythResponse) {
    return { text: "Submitted", className: undefined }
  }

  // Extract orderDetails - handle both direct access and potential JSON parsing issues
  const orderDetails = mythResponse.orderDetails

  // If no orderDetails, show "Submitted"
  if (!orderDetails || typeof orderDetails !== 'object') {
    return { text: "Submitted", className: undefined }
  }

  const mythData = orderDetails

  // Check API status first - if it explicitly says "Returned", respect that
  // This handles cases where database cache is stale but API has current status
  const apiStatus = mythData.status ? String(mythData.status).trim().toLowerCase() : null
  if (apiStatus === "returned") {
    return { text: "Returned", className: undefined }
  }

  // Check if there are active devices (devices with deviceCode AND deviceAllocated: true)
  // Device-based logic takes precedence - if devices exist with deviceCodes AND are allocated, the order is active
  // A device with deviceCode but deviceAllocated: false means it's been returned
  // More robust check: ensure devices array exists, has items, and at least one has a valid deviceCode AND is allocated
  const hasActivePasses = Array.isArray(mythData.devices) && mythData.devices.length > 0
    ? mythData.devices.some((device) => {
        const deviceCode = device?.deviceCode
        const isAllocated = device?.deviceAllocated === true
        const hasValidDeviceCode = deviceCode !== null && deviceCode !== undefined && String(deviceCode).trim() !== ""
        // Device is active only if it has a valid deviceCode AND is allocated
        return hasValidDeviceCode && isAllocated
      })
    : false

  // Check if order is past end date
  const endDate = mythData.to ? new Date(mythData.to) : null
  const isPastEndDate = endDate && !isNaN(endDate.getTime())
    ? new Date().getTime() > endDate.getTime()
    : false

  // If no active devices (empty array or no devices with deviceCode), show "Returned"
  if (!hasActivePasses) {
    return { text: "Returned", className: undefined }
  }

  // If has active passes and past end date, show "OVERDUE"
  if (hasActivePasses && isPastEndDate) {
    return { text: "OVERDUE", className: "bg-yellow-500 text-white hover:bg-yellow-600" }
  }

  // If has active passes and before end date, show "Active"
  if (hasActivePasses && !isPastEndDate) {
    return { text: "Active", className: "bg-green-600 text-white hover:bg-green-700" }
  }

  // This should never be reached, but included for type safety
  return { text: "Submitted", className: undefined }
}


