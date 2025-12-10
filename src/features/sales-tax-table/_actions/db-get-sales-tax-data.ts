"use server"

import { and, eq, gte, lte, or, inArray } from "drizzle-orm"
import { format } from "date-fns"

import { db } from "@/db"
import { orders } from "@/db/schema"
import { dbGetAllProductsByResortId } from "@/db/server-actions/product-actions/db-get-all-products-by-resort-id"
import { dbGetAllConsumerCategoriesByResortId } from "@/db/server-actions/consumer-categories-actions/db-get-all-consumer-categories-by-resort-id"

import { fetchSkidataExport } from "@/features/skidata-table/_actions/fetch-skidata-export"
import { type TicketItem } from "@/features/skidata-table/_types/skidata"

import { processOrders, type ProcessedOrder } from "../_lib/sales-tax-process-data"

/**
 * Extended ProcessedOrder with reconciliation status
 *
 * Reconciliation statuses:
 * - "matched" - Found in both our system (mythOrderSubmissionData.devices) and Skidata
 * - "only-internal" - In our system but not found in Skidata export
 * - "only-skidata" - In Skidata WITHOUT an orderId (truly external, not from our system)
 * - "missing-device" - Has orderId (from our system) but device not found in mythOrderSubmissionData
 */
export interface ReconciliationItem extends ProcessedOrder {
  /** Reconciliation status */
  reconciliationStatus: "matched" | "only-internal" | "only-skidata" | "missing-device"
  /** Whether this item has an orderId (means it originated from our system) */
  hasOrderId: boolean
  /** Skidata ticket item data (if from Skidata) */
  skidataTicketItem?: TicketItem
}

interface RevenueStats {
  totalItems: number
  skipassRevenue: number
  skipassTax: number
  lifepassRevenue: number
  lifepassTax: number
  insuranceRevenue: number
  insuranceTax: number
}

/**
 * Stripe deductions summary
 */
interface StripeStats {
  /** Total gross amount charged to customers */
  totalGross: number
  /** Total Stripe fees deducted */
  totalFees: number
  /** Total Stripe processing fees */
  totalProcessingFees: number
  /** Total Tax on Stripe fees */
  totalTax: number
  /** Net amount after Stripe deductions */
  totalNet: number
  /** Number of transactions with Stripe data */
  transactionsCount: number
}

/**
 * Channel breakdown for a specific sales channel
 */
interface ChannelStats {
  /** Number of items in this channel */
  itemCount: number
  /** Total revenue (gross) */
  totalRevenue: number
  /** Breakdown by type */
  skipassRevenue: number
  lifepassRevenue: number
  insuranceRevenue: number
  /** Stripe deductions for this channel */
  stripeStats: StripeStats
}

interface ReconciliationStats {
  matchedItems: number
  onlyInternalItems: number
  /** Items in Skidata WITHOUT orderId - truly external passes not from our system */
  onlySkidataItems: number
  /** Items WITH orderId but device not found in mythOrderSubmissionData - data integrity issue */
  missingDeviceItems: number
}

export interface SalesTaxDataResponse {
  success: boolean
  // Total items count
  totalItems: number
  // Reconciliation stats separated by live/test
  liveReconciliation: ReconciliationStats
  testReconciliation: ReconciliationStats
  // Revenue stats separated by live/test
  liveStats: RevenueStats
  testStats: RevenueStats
  // Skidata totals (for reference/comparison)
  skidataTotalItems: number
  skidataLiveItems: number
  skidataTestItems: number
  // Channel breakdown (live items only - online includes click-and-collect)
  onlineStats: ChannelStats
  kioskStats: ChannelStats
  // Overall Stripe deductions (live items only)
  stripeStats: StripeStats
  // Combined items
  items: ReconciliationItem[]
}

interface FetchSalesTaxDataParams {
  resortId: number
  startDate: Date
  endDate: Date
}

/**
 * Fetch sales tax data with cross-reference between internal orders and Skidata
 *
 * @description
 * Fetches data from both internal orders database AND Skidata export,
 * then cross-references them to identify:
 * - Items that exist in both systems (matched)
 * - Items only in our system (potential issue)
 * - Items only in Skidata (potential issue - passes we don't have)
 *
 * @param params - Fetch parameters
 * @param params.resortId - Resort ID to filter orders
 * @param params.startDate - Start date of the range
 * @param params.endDate - End date of the range
 * @returns Sales tax data with reconciliation info
 */
export async function dbGetSalesTaxData({
  resortId,
  startDate,
  endDate,
}: FetchSalesTaxDataParams): Promise<{
  data: SalesTaxDataResponse | null
  error: string | null
}> {
  console.log("📊 [DB] Fetching sales tax data with cross-reference...", { resortId, startDate, endDate })

  try {
    // Format dates for Skidata API call
    const startDateTime = `${format(startDate, "yyyy-MM-dd")}T${format(startDate, "HH:mm:ss")}.000Z`
    const endDateTime = `${format(endDate, "yyyy-MM-dd")}T${format(endDate, "HH:mm:ss")}.999Z`

    // First, fetch Skidata export and basic data
    const [skidataResult, products, consumerCategories] = await Promise.all([
      // Fetch Skidata export
      fetchSkidataExport({
        resortId,
        startDateTime,
        endDateTime,
        languageCode: "en",
      }),
      // Fetch products and consumer categories
      dbGetAllProductsByResortId(resortId),
      dbGetAllConsumerCategoriesByResortId(resortId),
    ])

    // Extract all unique orderIds from Skidata items
    const skidataOrderIds = new Set<number>()
    const skidataItems = skidataResult.data?.ticketItems || []
    for (const item of skidataItems) {
      if (item.orderId) {
        skidataOrderIds.add(item.orderId)
      }
    }

    console.log("📊 [DB] Skidata returned orderIds:", {
      count: skidataOrderIds.size,
      sample: Array.from(skidataOrderIds).slice(0, 5)
    })

    // Fetch internal orders - both in date range AND referenced by Skidata
    // Build the date/id filter condition
    const skidataOrderIdsArray = Array.from(skidataOrderIds)

    // For orders in date range, filter by status
    // For orders referenced by Skidata, fetch regardless of status (they're active in Skidata)
    const orderData = await db
      .select({
        id: orders.id,
        status: orders.status,
        salesChannel: orders.salesChannel,
        calculatedOrderPrice: orders.calculatedOrderPrice,
        createdAt: orders.createdAt,
        mythOrderSubmissionData: orders.mythOrderSubmissionData,
        skidataOrderData: orders.skidataOrderData,
        stripeTransactionDatas: orders.stripeTransactionDatas,
        testOrder: orders.testOrder,
      })
      .from(orders)
      .where(
        and(
          eq(orders.resortId, resortId),
          or(
            // Orders created in date range with completed payment status
            and(
              gte(orders.createdAt, startDate),
              lte(orders.createdAt, endDate),
              or(eq(orders.status, "fully-paid"), eq(orders.status, "order-complete"))
            ),
            // OR orders referenced by Skidata (regardless of status - they're active passes)
            skidataOrderIdsArray.length > 0
              ? inArray(orders.id, skidataOrderIdsArray)
              : undefined
          )
        )
      )

    console.log("📊 [DB] Fetched internal orders:", {
      count: orderData.length,
      orderIds: orderData.map(o => o.id).slice(0, 10)
    })

    // Process internal orders to get price breakdown per device
    const processedOrders = processOrders({
      orders: orderData as Parameters<typeof processOrders>[0]["orders"],
      products,
      consumerCategories,
    })

    // Create lookup maps for cross-referencing
    // Map by orderId for quick lookup
    const internalByOrderId = new Map<number, ProcessedOrder[]>()
    for (const item of processedOrders) {
      const existing = internalByOrderId.get(item.orderId) || []
      existing.push(item)
      internalByOrderId.set(item.orderId, existing)
    }

    // Map internal items by serial for matching
    // We use BOTH skidataDeviceSerial (from ticket identifications) AND mythDtaSerial (from dtaCode)
    const internalBySerial = new Map<string, ProcessedOrder>()
    for (const item of processedOrders) {
      // Map by skidataDeviceSerial (from ticket identifications)
      if (item.skidataDeviceSerial && item.skidataDeviceSerial !== "N/A") {
        internalBySerial.set(item.skidataDeviceSerial, item)
      }
      // ALSO map by mythDtaSerial (extracted from mythDevice.dtaCode)
      // This is the key fix - ensures we can match even if skidataOrderData wasn't available
      if (item.mythDtaSerial && item.mythDtaSerial !== "") {
        internalBySerial.set(item.mythDtaSerial, item)
      }
    }

    console.log("📊 [DB] Created serial maps:", {
      processedOrdersCount: processedOrders.length,
      serialMapSize: internalBySerial.size,
      sampleSerials: Array.from(internalBySerial.keys()).slice(0, 3),
    })

    // Track which internal items have been matched
    const matchedInternalIds = new Set<string>()

    // Build reconciliation items
    const reconciliationItems: ReconciliationItem[] = []

    // Process Skidata items and match with internal orders
    // CRITICAL: A pass is only "matched" if we can find it in mythOrderSubmissionData.devices
    // The DTA serial from Skidata must match a device's dtaCode from our orders
    // Note: skidataItems is already defined above when extracting orderIds
    for (const skidataItem of skidataItems) {
      let matchedInternal: ProcessedOrder | undefined

      // Extract all possible serial numbers from Skidata DTAs
      // DTA format is typically "PREFIX-SERIAL" (e.g., "01-123456789")
      const skidataSerials: string[] = []
      for (const dta of skidataItem.skipassDTAs) {
        const serial = dta.split("-")[1]?.replace(/\s/g, "") || ""
        if (serial) {
          skidataSerials.push(serial)
        }
      }

      // PRIMARY MATCH: By DTA serial number
      // This is the authoritative way to match - the serial from Skidata
      // should match a device in mythOrderSubmissionData.devices
      for (const serial of skidataSerials) {
        if (internalBySerial.has(serial)) {
          matchedInternal = internalBySerial.get(serial)
          break
        }
      }

      // FALLBACK: If orderId matches AND product/category matches
      // Only use this if we didn't find by serial - this handles cases where
      // our system might have a different serial format
      if (!matchedInternal && skidataItem.orderId) {
        const internalItems = internalByOrderId.get(skidataItem.orderId)
        if (internalItems && internalItems.length > 0) {
          // Find by matching product + consumer category (must match exactly)
          // AND ensure the item hasn't already been matched
          // Key format must match the format used when storing matched items (line 269)
          const found = internalItems.find(
            (item) =>
              item.productId === skidataItem.productId &&
              item.consumerCategoryId === skidataItem.consumerCategoryId &&
              !matchedInternalIds.has(`${item.orderId}-${item.mythDtaSerial || item.skidataDeviceSerial}`)
          )
          if (found) {
            matchedInternal = found
          }
        }
      }

      // Determine reconciliation status based on whether we found a match
      // and whether Skidata item has an orderId (indicating it came from our system)
      const hasOrderId = Boolean(skidataItem.orderId)

      if (matchedInternal) {
        // Matched item - found device in mythOrderSubmissionData.devices
        // Use mythDtaSerial as the key since it's extracted directly from the device
        const itemKey = `${matchedInternal.orderId}-${matchedInternal.mythDtaSerial || matchedInternal.skidataDeviceSerial}`
        matchedInternalIds.add(itemKey)

        reconciliationItems.push({
          ...matchedInternal,
          reconciliationStatus: "matched",
          hasOrderId,
          skidataTicketItem: skidataItem,
        })
      } else if (hasOrderId) {
        // Has orderId (from our system) but device not found in mythOrderSubmissionData
        // This is a data integrity issue - the order exists but device wasn't recorded properly
        const skidataDtaSerial = skidataItem.skipassDTAs[0]?.split("-")[1]?.replace(/\s/g, "") || "N/A"
        reconciliationItems.push({
          orderId: skidataItem.orderId!,
          createdAt: skidataItem.date,
          salesChannel: "unknown (device missing)",
          productId: skidataItem.productId,
          productName: skidataItem.productName,
          consumerCategoryId: skidataItem.consumerCategoryId,
          consumerCategoryName: skidataItem.consumerCategoryName,
          totalPrice: skidataItem.orderItemPriceGross,
          skipassTotal: skidataItem.orderItemPriceGross,
          skipassTaxAmount: 0,
          lifepassRentalTotal: 0,
          lifepassRentalTaxAmount: 0,
          insuranceTotal: 0,
          insuranceTaxAmount: 0,
          skidataDeviceSerial: skidataDtaSerial,
          mythDtaSerial: skidataDtaSerial, // Same as extracted from Skidata DTA
          mythDtaCode: skidataItem.skipassDTAs[0] || "", // Full DTA from Skidata
          deviceId: null,
          lifepassDeviceId: null,
          hasInsurance: false,
          startDate: skidataItem.date,
          endDate: null,
          existsOnMyth: true, // It IS from our system (has orderId)
          existsOnSkidata: true,
          stripeAmount: null,
          stripeFee: null,
          stripeNet: null,
          stripeProcessingFee: null,
          stripeTax: null,
          stripePaid: false,
          stripeRefunded: false,
          stripeCaptured: false,
          testOrder: skidataItem.testOrder,
          reconciliationStatus: "missing-device",
          hasOrderId: true,
          skidataTicketItem: skidataItem,
        })
      } else {
        // NO orderId - truly external pass not from our system
        // This is concerning - someone created a pass directly in Skidata
        const skidataDtaSerial = skidataItem.skipassDTAs[0]?.split("-")[1]?.replace(/\s/g, "") || "N/A"
        reconciliationItems.push({
          orderId: 0,
          createdAt: skidataItem.date,
          salesChannel: "external (no order)",
          productId: skidataItem.productId,
          productName: skidataItem.productName,
          consumerCategoryId: skidataItem.consumerCategoryId,
          consumerCategoryName: skidataItem.consumerCategoryName,
          totalPrice: skidataItem.orderItemPriceGross,
          skipassTotal: skidataItem.orderItemPriceGross,
          skipassTaxAmount: 0,
          lifepassRentalTotal: 0,
          lifepassRentalTaxAmount: 0,
          insuranceTotal: 0,
          insuranceTaxAmount: 0,
          skidataDeviceSerial: skidataDtaSerial,
          mythDtaSerial: skidataDtaSerial, // Same as extracted from Skidata DTA
          mythDtaCode: skidataItem.skipassDTAs[0] || "", // Full DTA from Skidata
          deviceId: null,
          lifepassDeviceId: null,
          hasInsurance: false,
          startDate: skidataItem.date,
          endDate: null,
          existsOnMyth: false,
          existsOnSkidata: true,
          stripeAmount: null,
          stripeFee: null,
          stripeNet: null,
          stripeProcessingFee: null,
          stripeTax: null,
          stripePaid: false,
          stripeRefunded: false,
          stripeCaptured: false,
          testOrder: skidataItem.testOrder,
          reconciliationStatus: "only-skidata",
          hasOrderId: false,
          skidataTicketItem: skidataItem,
        })
      }
    }

    // Add internal items that weren't matched to Skidata
    for (const item of processedOrders) {
      // Use the same key format as in matched items
      const itemKey = `${item.orderId}-${item.mythDtaSerial || item.skidataDeviceSerial}`
      if (!matchedInternalIds.has(itemKey)) {
        reconciliationItems.push({
          ...item,
          reconciliationStatus: "only-internal",
          hasOrderId: true, // Internal items always have orderId
        })
      }
    }

    // Calculate reconciliation stats - separate live and test
    const liveReconItems = reconciliationItems.filter((i) => !i.testOrder)
    const testReconItems = reconciliationItems.filter((i) => i.testOrder)

    const calculateReconciliationStats = (items: ReconciliationItem[]): ReconciliationStats => ({
      matchedItems: items.filter((i) => i.reconciliationStatus === "matched").length,
      onlyInternalItems: items.filter((i) => i.reconciliationStatus === "only-internal").length,
      onlySkidataItems: items.filter((i) => i.reconciliationStatus === "only-skidata").length,
      missingDeviceItems: items.filter((i) => i.reconciliationStatus === "missing-device").length,
    })

    const liveReconciliation = calculateReconciliationStats(liveReconItems)
    const testReconciliation = calculateReconciliationStats(testReconItems)

    // Calculate revenue totals - separate live and test items
    const itemsWithPricing = reconciliationItems.filter(
      (i) => i.reconciliationStatus === "matched" || i.reconciliationStatus === "only-internal"
    )

    const liveItems = itemsWithPricing.filter((i) => !i.testOrder)
    const testItems = itemsWithPricing.filter((i) => i.testOrder)

    const calculateStats = (items: typeof itemsWithPricing) => ({
      totalItems: items.length,
      skipassRevenue: items.reduce((sum, i) => sum + i.skipassTotal, 0),
      skipassTax: items.reduce((sum, i) => sum + i.skipassTaxAmount, 0),
      lifepassRevenue: items.reduce((sum, i) => sum + i.lifepassRentalTotal, 0),
      lifepassTax: items.reduce((sum, i) => sum + i.lifepassRentalTaxAmount, 0),
      insuranceRevenue: items.reduce((sum, i) => sum + i.insuranceTotal, 0),
      insuranceTax: items.reduce((sum, i) => sum + i.insuranceTaxAmount, 0),
    })

    const liveStats = calculateStats(liveItems)
    const testStats = calculateStats(testItems)

    // Helper to determine if channel is "online" (includes click-and-collect)
    const isOnlineChannel = (channel: string): boolean => {
      const lowerChannel = channel.toLowerCase()
      return lowerChannel === "online" || lowerChannel === "click-and-collect" || lowerChannel === "click_and_collect"
    }

    // Calculate Stripe stats for a set of items
    const calculateStripeStats = (items: ReconciliationItem[]): StripeStats => {
      const itemsWithStripe = items.filter(i => i.stripeAmount !== null && i.stripeAmount > 0)
      return {
        totalGross: itemsWithStripe.reduce((sum, i) => sum + (i.stripeAmount || 0), 0),
        totalFees: itemsWithStripe.reduce((sum, i) => sum + (i.stripeFee || 0), 0),
        totalProcessingFees: itemsWithStripe.reduce((sum, i) => sum + (i.stripeProcessingFee || 0), 0),
        totalTax: itemsWithStripe.reduce((sum, i) => sum + (i.stripeTax || 0), 0),
        totalNet: itemsWithStripe.reduce((sum, i) => sum + (i.stripeNet || 0), 0),
        transactionsCount: itemsWithStripe.length,
      }
    }

    // Calculate channel stats for a set of items
    const calculateChannelStats = (items: ReconciliationItem[]): ChannelStats => {
      return {
        itemCount: items.length,
        totalRevenue: items.reduce((sum, i) => sum + i.skipassTotal + i.lifepassRentalTotal + i.insuranceTotal, 0),
        skipassRevenue: items.reduce((sum, i) => sum + i.skipassTotal, 0),
        lifepassRevenue: items.reduce((sum, i) => sum + i.lifepassRentalTotal, 0),
        insuranceRevenue: items.reduce((sum, i) => sum + i.insuranceTotal, 0),
        stripeStats: calculateStripeStats(items),
      }
    }

    // Filter live items by channel
    const onlineItems = liveItems.filter(i => isOnlineChannel(i.salesChannel))
    const kioskItems = liveItems.filter(i => i.salesChannel.toLowerCase() === "kiosk")

    // Calculate channel stats
    const onlineStats = calculateChannelStats(onlineItems)
    const kioskStats = calculateChannelStats(kioskItems)

    // Calculate overall Stripe stats (live items only)
    const stripeStats = calculateStripeStats(liveItems)

    console.log("📊 [DB] Sales tax data fetched with reconciliation:", {
      totalItems: reconciliationItems.length,
      liveReconciliation,
      testReconciliation,
      skidataTotalItems: skidataResult.data?.totalTicketItems || 0,
      onlineItemCount: onlineStats.itemCount,
      kioskItemCount: kioskStats.itemCount,
      stripeTransactionsCount: stripeStats.transactionsCount,
    })

    return {
      data: {
        success: true,
        totalItems: reconciliationItems.length,
        liveReconciliation,
        testReconciliation,
        liveStats,
        testStats,
        skidataTotalItems: skidataResult.data?.totalTicketItems || 0,
        skidataLiveItems: skidataResult.data?.liveTicketItems || 0,
        skidataTestItems: skidataResult.data?.testTicketItems || 0,
        onlineStats,
        kioskStats,
        stripeStats,
        items: reconciliationItems,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching sales tax data:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch sales tax data",
    }
  }
}
