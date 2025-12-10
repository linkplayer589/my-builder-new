"use server"

import * as XLSX from "xlsx"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"

import { type ReconciliationItem } from "./db-get-sales-tax-data"

interface ExportParams {
  /** Items to export (filtered by test toggle) */
  items: ReconciliationItem[]
  /** Start date of the report period */
  startDate: string
  /** End date of the report period */
  endDate: string
}

interface ExportResult {
  data: string | null
  filename: string | null
  error: string | null
}

interface DayStats {
  totalCharge: number
  lifepassGross: number
  lifepassTax: number
  lifepassNet: number
  skipassGross: number
  skipassTax: number
  skipassNet: number
  insuranceGross: number
  insuranceTax: number
  insuranceNet: number
  stripeGross: number
  stripeTax: number
  stripeNet: number
  stripeFees: number
  stripeProcessingFees: number
  netCash: number
  itemCount: number
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Helper to determine if channel is "online" (includes click-and-collect)
 */
function isOnlineChannel(channel: string): boolean {
  const lowerChannel = channel.toLowerCase()
  return (
    lowerChannel === "online" ||
    lowerChannel === "click-and-collect" ||
    lowerChannel === "click_and_collect"
  )
}

/**
 * Get the day index (0 = Monday, 6 = Sunday) for a date
 */
function getDayIndex(date: Date): number {
  const day = date.getDay()
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return day === 0 ? 6 : day - 1
}

/**
 * Initialize empty day stats
 */
function emptyDayStats(): DayStats {
  return {
    totalCharge: 0,
    lifepassGross: 0,
    lifepassTax: 0,
    lifepassNet: 0,
    skipassGross: 0,
    skipassTax: 0,
    skipassNet: 0,
    insuranceGross: 0,
    insuranceTax: 0,
    insuranceNet: 0,
    stripeGross: 0,
    stripeTax: 0,
    stripeNet: 0,
    stripeFees: 0,
    stripeProcessingFees: 0,
    netCash: 0,
    itemCount: 0,
  }
}

/**
 * Add item stats to day stats
 */
function addItemToDayStats(stats: DayStats, item: ReconciliationItem): void {
  // Calculate totals
  const totalCharge =
    item.skipassTotal + item.lifepassRentalTotal + item.insuranceTotal

  stats.totalCharge += totalCharge
  stats.itemCount += 1

  // Lifepass
  stats.lifepassGross += item.lifepassRentalTotal
  stats.lifepassTax += item.lifepassRentalTaxAmount
  stats.lifepassNet += item.lifepassRentalTotal - item.lifepassRentalTaxAmount

  // Skipass
  stats.skipassGross += item.skipassTotal
  stats.skipassTax += item.skipassTaxAmount
  stats.skipassNet += item.skipassTotal - item.skipassTaxAmount

  // Insurance
  stats.insuranceGross += item.insuranceTotal
  stats.insuranceTax += item.insuranceTaxAmount
  stats.insuranceNet += item.insuranceTotal - item.insuranceTaxAmount

  // Stripe (if available)
  if (item.stripeAmount !== null) {
    stats.stripeGross += item.stripeAmount
    stats.stripeTax += item.stripeTax || 0
    stats.stripeNet += item.stripeNet || 0
    stats.stripeFees += item.stripeFee || 0
    stats.stripeProcessingFees += item.stripeProcessingFee || 0
  }

  // Net cash (total minus stripe fees)
  stats.netCash += totalCharge - (item.stripeFee || 0)
}

/**
 * Sum multiple day stats into one
 */
function sumDayStats(statsArray: DayStats[]): DayStats {
  const total = emptyDayStats()
  for (const stats of statsArray) {
    total.totalCharge += stats.totalCharge
    total.itemCount += stats.itemCount
    total.lifepassGross += stats.lifepassGross
    total.lifepassTax += stats.lifepassTax
    total.lifepassNet += stats.lifepassNet
    total.skipassGross += stats.skipassGross
    total.skipassTax += stats.skipassTax
    total.skipassNet += stats.skipassNet
    total.insuranceGross += stats.insuranceGross
    total.insuranceTax += stats.insuranceTax
    total.insuranceNet += stats.insuranceNet
    total.stripeGross += stats.stripeGross
    total.stripeTax += stats.stripeTax
    total.stripeNet += stats.stripeNet
    total.stripeFees += stats.stripeFees
    total.stripeProcessingFees += stats.stripeProcessingFees
    total.netCash += stats.netCash
  }
  return total
}

/**
 * Format number as Euro with 2 decimals, or empty if zero
 */
function formatEuro(value: number): string {
  return value === 0 ? "" : value.toFixed(2)
}

/**
 * Generate Ricardo Weekly Export xlsx file
 *
 * @description
 * Creates an Excel file with sales tax data in the Ricardo weekly format.
 * Split by day (Mon-Sun) and channel (Kiosks, Online).
 */
export async function generateRicardoWeeklyExport({
  items,
  startDate,
  endDate,
}: ExportParams): Promise<ExportResult> {
  try {
    // Only include matched/internal items with pricing
    // Note: Test item filtering is handled by the client based on user's toggle preference
    const exportItems = items.filter(
      (item) =>
        item.reconciliationStatus === "matched" ||
        item.reconciliationStatus === "only-internal"
    )

    // Initialize stats by day and channel
    const kioskByDay: DayStats[] = Array(7)
      .fill(null)
      .map(() => emptyDayStats())
    const onlineByDay: DayStats[] = Array(7)
      .fill(null)
      .map(() => emptyDayStats())

    // Process each item
    for (const item of exportItems) {
      const itemDate = new Date(item.createdAt)
      const dayIndex = getDayIndex(itemDate)
      const isOnline = isOnlineChannel(item.salesChannel)

      if (isOnline) {
        addItemToDayStats(onlineByDay[dayIndex], item)
      } else {
        addItemToDayStats(kioskByDay[dayIndex], item)
      }
    }

    // Calculate totals
    const kioskTotal = sumDayStats(kioskByDay)
    const onlineTotal = sumDayStats(onlineByDay)

    // Create worksheet data
    const wsData: (string | number)[][] = []

    // Title row
    wsData.push([
      "Weekly Sales Report",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      format(new Date(startDate), "dd/MM/yyyy"),
      "-",
      format(new Date(endDate), "dd/MM/yyyy"),
    ])
    wsData.push([]) // Empty row

    // === KIOSKS SECTION ===
    wsData.push(["KIOSKS"])
    wsData.push([
      "",
      "Total Charge",
      "LifePass",
      "",
      "",
      "Skipasses",
      "",
      "",
      "Insurance",
      "",
      "",
      "Stripe Deductions",
      "",
      "",
      "NET CASH",
      "Items",
    ])
    wsData.push([
      "Day",
      "€",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Fees",
      "Tax",
      "Net",
      "€",
      "#",
    ])

    // Kiosk daily rows
    for (let i = 0; i < 7; i++) {
      const stats = kioskByDay[i]
      wsData.push([
        DAYS_OF_WEEK[i],
        formatEuro(stats.totalCharge),
        formatEuro(stats.lifepassGross),
        formatEuro(stats.lifepassTax),
        formatEuro(stats.lifepassNet),
        formatEuro(stats.skipassGross),
        formatEuro(stats.skipassTax),
        formatEuro(stats.skipassNet),
        formatEuro(stats.insuranceGross),
        formatEuro(stats.insuranceTax),
        formatEuro(stats.insuranceNet),
        formatEuro(stats.stripeFees),
        formatEuro(stats.stripeTax),
        formatEuro(stats.stripeNet),
        formatEuro(stats.netCash),
        stats.itemCount || "",
      ])
    }

    // Kiosk total row
    wsData.push([
      "TOTAL",
      formatEuro(kioskTotal.totalCharge),
      formatEuro(kioskTotal.lifepassGross),
      formatEuro(kioskTotal.lifepassTax),
      formatEuro(kioskTotal.lifepassNet),
      formatEuro(kioskTotal.skipassGross),
      formatEuro(kioskTotal.skipassTax),
      formatEuro(kioskTotal.skipassNet),
      formatEuro(kioskTotal.insuranceGross),
      formatEuro(kioskTotal.insuranceTax),
      formatEuro(kioskTotal.insuranceNet),
      formatEuro(kioskTotal.stripeFees),
      formatEuro(kioskTotal.stripeTax),
      formatEuro(kioskTotal.stripeNet),
      formatEuro(kioskTotal.netCash),
      kioskTotal.itemCount,
    ])

    wsData.push([]) // Empty row
    wsData.push([]) // Empty row

    // === ONLINE SECTION ===
    wsData.push(["ONLINE (includes click-and-collect)"])
    wsData.push([
      "",
      "Total Charge",
      "LifePass",
      "",
      "",
      "Skipasses",
      "",
      "",
      "Insurance",
      "",
      "",
      "Stripe Deductions",
      "",
      "",
      "NET CASH",
      "Items",
    ])
    wsData.push([
      "Day",
      "€",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Fees",
      "Tax",
      "Net",
      "€",
      "#",
    ])

    // Online daily rows
    for (let i = 0; i < 7; i++) {
      const stats = onlineByDay[i]
      wsData.push([
        DAYS_OF_WEEK[i],
        formatEuro(stats.totalCharge),
        formatEuro(stats.lifepassGross),
        formatEuro(stats.lifepassTax),
        formatEuro(stats.lifepassNet),
        formatEuro(stats.skipassGross),
        formatEuro(stats.skipassTax),
        formatEuro(stats.skipassNet),
        formatEuro(stats.insuranceGross),
        formatEuro(stats.insuranceTax),
        formatEuro(stats.insuranceNet),
        formatEuro(stats.stripeFees),
        formatEuro(stats.stripeTax),
        formatEuro(stats.stripeNet),
        formatEuro(stats.netCash),
        stats.itemCount || "",
      ])
    }

    // Online total row
    wsData.push([
      "TOTAL",
      formatEuro(onlineTotal.totalCharge),
      formatEuro(onlineTotal.lifepassGross),
      formatEuro(onlineTotal.lifepassTax),
      formatEuro(onlineTotal.lifepassNet),
      formatEuro(onlineTotal.skipassGross),
      formatEuro(onlineTotal.skipassTax),
      formatEuro(onlineTotal.skipassNet),
      formatEuro(onlineTotal.insuranceGross),
      formatEuro(onlineTotal.insuranceTax),
      formatEuro(onlineTotal.insuranceNet),
      formatEuro(onlineTotal.stripeFees),
      formatEuro(onlineTotal.stripeTax),
      formatEuro(onlineTotal.stripeNet),
      formatEuro(onlineTotal.netCash),
      onlineTotal.itemCount,
    ])

    wsData.push([]) // Empty row
    wsData.push([]) // Empty row

    // === COMBINED TOTALS ===
    const combinedTotal = sumDayStats([kioskTotal, onlineTotal])
    wsData.push(["COMBINED TOTALS (Kiosks + Online)"])
    wsData.push([
      "",
      "Total Charge",
      "LifePass",
      "",
      "",
      "Skipasses",
      "",
      "",
      "Insurance",
      "",
      "",
      "Stripe Deductions",
      "",
      "",
      "NET CASH",
      "Items",
    ])
    wsData.push([
      "",
      "€",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Gross",
      "Tax",
      "Net",
      "Fees",
      "Tax",
      "Net",
      "€",
      "#",
    ])
    wsData.push([
      "TOTAL",
      formatEuro(combinedTotal.totalCharge),
      formatEuro(combinedTotal.lifepassGross),
      formatEuro(combinedTotal.lifepassTax),
      formatEuro(combinedTotal.lifepassNet),
      formatEuro(combinedTotal.skipassGross),
      formatEuro(combinedTotal.skipassTax),
      formatEuro(combinedTotal.skipassNet),
      formatEuro(combinedTotal.insuranceGross),
      formatEuro(combinedTotal.insuranceTax),
      formatEuro(combinedTotal.insuranceNet),
      formatEuro(combinedTotal.stripeFees),
      formatEuro(combinedTotal.stripeTax),
      formatEuro(combinedTotal.stripeNet),
      formatEuro(combinedTotal.netCash),
      combinedTotal.itemCount,
    ])

    wsData.push([]) // Empty row
    wsData.push([]) // Empty row

    // === SUMMARY SECTION ===
    wsData.push(["SUMMARY"])
    wsData.push([
      "Category",
      "Kiosks",
      "Online",
      "Total",
    ])
    wsData.push([
      "Items Sold",
      kioskTotal.itemCount,
      onlineTotal.itemCount,
      combinedTotal.itemCount,
    ])
    wsData.push([
      "Total Revenue (Gross)",
      formatEuro(kioskTotal.totalCharge),
      formatEuro(onlineTotal.totalCharge),
      formatEuro(combinedTotal.totalCharge),
    ])
    wsData.push([
      "Skipass Revenue",
      formatEuro(kioskTotal.skipassGross),
      formatEuro(onlineTotal.skipassGross),
      formatEuro(combinedTotal.skipassGross),
    ])
    wsData.push([
      "LifePass Revenue",
      formatEuro(kioskTotal.lifepassGross),
      formatEuro(onlineTotal.lifepassGross),
      formatEuro(combinedTotal.lifepassGross),
    ])
    wsData.push([
      "Insurance Revenue",
      formatEuro(kioskTotal.insuranceGross),
      formatEuro(onlineTotal.insuranceGross),
      formatEuro(combinedTotal.insuranceGross),
    ])
    wsData.push([
      "Total Tax",
      formatEuro(
        kioskTotal.skipassTax + kioskTotal.lifepassTax + kioskTotal.insuranceTax
      ),
      formatEuro(
        onlineTotal.skipassTax +
          onlineTotal.lifepassTax +
          onlineTotal.insuranceTax
      ),
      formatEuro(
        combinedTotal.skipassTax +
          combinedTotal.lifepassTax +
          combinedTotal.insuranceTax
      ),
    ])
    wsData.push([
      "Stripe Processing Fees",
      formatEuro(kioskTotal.stripeProcessingFees),
      formatEuro(onlineTotal.stripeProcessingFees),
      formatEuro(combinedTotal.stripeProcessingFees),
    ])
    wsData.push([
      "Stripe Tax on Fees",
      formatEuro(kioskTotal.stripeTax),
      formatEuro(onlineTotal.stripeTax),
      formatEuro(combinedTotal.stripeTax),
    ])
    wsData.push([
      "Total Stripe Fees",
      formatEuro(kioskTotal.stripeFees),
      formatEuro(onlineTotal.stripeFees),
      formatEuro(combinedTotal.stripeFees),
    ])
    wsData.push([
      "Net After Stripe",
      formatEuro(kioskTotal.stripeNet),
      formatEuro(onlineTotal.stripeNet),
      formatEuro(combinedTotal.stripeNet),
    ])
    wsData.push([
      "Total to Receive",
      formatEuro(kioskTotal.netCash),
      formatEuro(onlineTotal.netCash),
      formatEuro(combinedTotal.netCash),
    ])

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // Day/Label
      { wch: 14 }, // Total Charge
      { wch: 10 }, // LP Gross
      { wch: 10 }, // LP Tax
      { wch: 10 }, // LP Net
      { wch: 10 }, // SP Gross
      { wch: 10 }, // SP Tax
      { wch: 10 }, // SP Net
      { wch: 10 }, // Ins Gross
      { wch: 10 }, // Ins Tax
      { wch: 10 }, // Ins Net
      { wch: 10 }, // Stripe Fees
      { wch: 10 }, // Stripe Tax
      { wch: 10 }, // Stripe Net
      { wch: 12 }, // Net Cash
      { wch: 8 }, // Items
    ]

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Report Settimanale")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    // Convert to base64
    const base64 = Buffer.from(buffer).toString("base64")

    // Generate filename
    const startFormatted = format(new Date(startDate), "dd-MM-yyyy")
    const endFormatted = format(new Date(endDate), "dd-MM-yyyy")
    const filename = `report-settimanale-${startFormatted}-${endFormatted}.xlsx`

    return {
      data: base64,
      filename,
      error: null,
    }
  } catch (error) {
    console.error("Error generating Ricardo weekly export:", error)
    return {
      data: null,
      filename: null,
      error: error instanceof Error ? error.message : "Failed to generate export",
    }
  }
}
