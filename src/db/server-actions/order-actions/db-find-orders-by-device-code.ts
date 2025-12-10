"use server"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { sql, desc, or } from "drizzle-orm"
import type { MythOrderDetails, MythLifepassDevice, MythGetOrderResponse } from "@/types/myth-types"

/**
 * Device allocation info from stored Myth data
 */
export type TDeviceAllocationInfo = {
  deviceCode: string
  deviceId: string | null
  deviceAllocated: boolean
  dtaCode: string | null
}

/**
 * Result type for finding orders by device code
 */
export type TOrderByDeviceResult = {
  id: number
  orderStatus: string
  paymentStatus: string
  resortId: number
  clientEmail: string | null
  createdAt: Date | null
  /** Myth order ID for fetching live data */
  mythOrderId: string | null
  /** Device allocation status from stored Myth data */
  deviceInfo: TDeviceAllocationInfo | null
  /** Myth order dates */
  mythFrom: string | null
  mythTo: string | null
  /** Full Myth order submission data for opening the dialog */
  mythOrderSubmissionData: MythOrderDetails | null
}

/**
 * Find all orders that contain a specific device code in their mythOrderData (response from Myth).
 * Falls back to mythOrderSubmissionData if mythOrderData is not available.
 * This is useful for determining where a device/pass is currently allocated.
 *
 * @param deviceCode - The 6-digit device code to search for
 * @returns Array of orders containing this device, with key details
 */
export async function dbFindOrdersByDeviceCode(
  deviceCode: string
): Promise<TOrderByDeviceResult[]> {
  if (!deviceCode || deviceCode.length < 3) {
    return []
  }

  try {
    // Search for orders where mythOrderData.orderDetails contains this device code (preferred)
    // OR mythOrderSubmissionData contains this device code (fallback)
    // Using PostgreSQL JSONB query to find device in the devices array
    const results = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        resortId: orders.resortId,
        clientDetails: orders.clientDetails,
        createdAt: orders.createdAt,
        mythOrderSubmissionData: orders.mythOrderSubmissionData,
        mythOrderData: orders.mythOrderData,
      })
      .from(orders)
      .where(
        or(
          // Search in mythOrderData.orderDetails.devices (the GET response from Myth - more up-to-date)
          sql`${orders.mythOrderData}::jsonb -> 'orderDetails' @> jsonb_build_object('devices', jsonb_build_array(jsonb_build_object('deviceCode', ${deviceCode})))`,
          // Fallback: Search in mythOrderSubmissionData.devices (the submission data)
          sql`${orders.mythOrderSubmissionData}::jsonb @> jsonb_build_object('devices', jsonb_build_array(jsonb_build_object('deviceCode', ${deviceCode})))`
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(10)

    return results.map((order) => {
      // Prefer mythOrderData (response from Myth) over mythOrderSubmissionData (what we submitted)
      const mythResponseData = order.mythOrderData as MythGetOrderResponse | null
      const mythSubmissionData = order.mythOrderSubmissionData as MythOrderDetails | null

      // Use orderDetails from the GET response if available, otherwise fall back to submission data
      const mythOrderDetails = mythResponseData?.orderDetails ?? mythSubmissionData

      // Find the device in the order details
      const device = mythOrderDetails?.devices?.find(
        (d: MythLifepassDevice) => d.deviceCode === deviceCode
      )

      return {
        id: order.id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        resortId: order.resortId,
        clientEmail: order.clientDetails?.email ?? null,
        createdAt: order.createdAt,
        mythOrderId: mythOrderDetails?.orderId ?? null,
        deviceInfo: device
          ? {
              deviceCode: device.deviceCode,
              deviceId: device.deviceId ?? null,
              deviceAllocated: device.deviceAllocated ?? false,
              dtaCode: device.dtaCode ?? null,
            }
          : null,
        mythFrom: mythOrderDetails?.from ?? null,
        mythTo: mythOrderDetails?.to ?? null,
        // For the dialog, prefer the more up-to-date orderDetails from the GET response
        mythOrderSubmissionData: mythOrderDetails,
      }
    })
  } catch (error) {
    console.error("[DB] Error finding orders by device code:", error)

    // Fallback: Try a simpler text-based search
    try {
      const fallbackResults = await db
        .select({
          id: orders.id,
          orderStatus: orders.orderStatus,
          paymentStatus: orders.paymentStatus,
          resortId: orders.resortId,
          clientDetails: orders.clientDetails,
          createdAt: orders.createdAt,
          mythOrderSubmissionData: orders.mythOrderSubmissionData,
          mythOrderData: orders.mythOrderData,
        })
        .from(orders)
        .where(
          or(
            sql`${orders.mythOrderData}::text LIKE ${'%"deviceCode":"' + deviceCode + '"%'}`,
            sql`${orders.mythOrderSubmissionData}::text LIKE ${'%"deviceCode":"' + deviceCode + '"%'}`
          )
        )
        .orderBy(desc(orders.createdAt))
        .limit(10)

      return fallbackResults.map((order) => {
        // Prefer mythOrderData (response from Myth) over mythOrderSubmissionData (what we submitted)
        const mythResponseData = order.mythOrderData as MythGetOrderResponse | null
        const mythSubmissionData = order.mythOrderSubmissionData as MythOrderDetails | null

        // Use orderDetails from the GET response if available, otherwise fall back to submission data
        const mythOrderDetails = mythResponseData?.orderDetails ?? mythSubmissionData

        const device = mythOrderDetails?.devices?.find(
          (d: MythLifepassDevice) => d.deviceCode === deviceCode
        )

        return {
          id: order.id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          resortId: order.resortId,
          clientEmail: order.clientDetails?.email ?? null,
          createdAt: order.createdAt,
          mythOrderId: mythOrderDetails?.orderId ?? null,
          deviceInfo: device
            ? {
                deviceCode: device.deviceCode,
                deviceId: device.deviceId ?? null,
                deviceAllocated: device.deviceAllocated ?? false,
                dtaCode: device.dtaCode ?? null,
              }
            : null,
          mythFrom: mythOrderDetails?.from ?? null,
          mythTo: mythOrderDetails?.to ?? null,
          mythOrderSubmissionData: mythOrderDetails,
        }
      })
    } catch (fallbackError) {
      console.error("[DB] Fallback search also failed:", fallbackError)
      return []
    }
  }
}


