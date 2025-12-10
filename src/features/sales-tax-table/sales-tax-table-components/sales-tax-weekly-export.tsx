"use client"

import * as React from "react"
import {
  FileSpreadsheet,
  Loader2,
  Download,
  Globe,
  Monitor,
  CreditCard,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { type ReconciliationItem } from "../_actions/db-get-sales-tax-data"
import { generateRicardoWeeklyExport } from "../_actions/sales-tax-export-xlsx"

interface RevenueStats {
  totalItems: number
  skipassRevenue: number
  skipassTax: number
  lifepassRevenue: number
  lifepassTax: number
  insuranceRevenue: number
  insuranceTax: number
}

interface StripeStats {
  totalGross: number
  totalFees: number
  totalProcessingFees: number
  totalTax: number
  totalNet: number
  transactionsCount: number
}

interface ChannelStats {
  itemCount: number
  totalRevenue: number
  skipassRevenue: number
  lifepassRevenue: number
  insuranceRevenue: number
  stripeStats: StripeStats
}

interface DayStats {
  day: string
  itemCount: number
  totalCharge: number
  lifepassGross: number
  lifepassTax: number
  skipassGross: number
  skipassTax: number
  insuranceGross: number
  insuranceTax: number
  stripeFees: number
  stripeNet: number
}

interface SalesTaxWeeklyExportProps {
  /** All reconciliation items */
  items: ReconciliationItem[]
  /** Live items stats */
  liveStats: RevenueStats
  /** Test items stats */
  testStats: RevenueStats
  /** Online channel stats (includes click-and-collect) */
  onlineStats: ChannelStats
  /** Kiosk channel stats */
  kioskStats: ChannelStats
  /** Overall Stripe deductions */
  stripeStats: StripeStats
  /** Start date of the report period (ISO string) */
  startDate: string
  /** End date of the report period (ISO string) */
  endDate: string
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Helper to determine if channel is "online"
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
  return day === 0 ? 6 : day - 1
}

/**
 * Weekly export component with table preview, channel breakdown, and Stripe deductions
 */
export function SalesTaxWeeklyExport({
  items,
  liveStats,
  testStats,
  onlineStats,
  kioskStats,
  stripeStats,
  startDate,
  endDate,
}: SalesTaxWeeklyExportProps) {
  const [includeTestItems, setIncludeTestItems] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  // Filter items based on toggle state and only matched/internal
  const filteredItems = React.useMemo(() => {
    const baseItems = items.filter(
      (item) =>
        item.reconciliationStatus === "matched" ||
        item.reconciliationStatus === "only-internal"
    )

    if (includeTestItems) {
      return baseItems
    }
    return baseItems.filter((item) => !item.testOrder)
  }, [items, includeTestItems])

  // Calculate day-by-day breakdown
  const dayBreakdown = React.useMemo(() => {
    const kioskByDay: DayStats[] = DAYS_OF_WEEK.map((day) => ({
      day,
      itemCount: 0,
      totalCharge: 0,
      lifepassGross: 0,
      lifepassTax: 0,
      skipassGross: 0,
      skipassTax: 0,
      insuranceGross: 0,
      insuranceTax: 0,
      stripeFees: 0,
      stripeNet: 0,
    }))

    const onlineByDay: DayStats[] = DAYS_OF_WEEK.map((day) => ({
      day,
      itemCount: 0,
      totalCharge: 0,
      lifepassGross: 0,
      lifepassTax: 0,
      skipassGross: 0,
      skipassTax: 0,
      insuranceGross: 0,
      insuranceTax: 0,
      stripeFees: 0,
      stripeNet: 0,
    }))

    for (const item of filteredItems) {
      const itemDate = new Date(item.createdAt)
      const dayIndex = getDayIndex(itemDate)
      const isOnline = isOnlineChannel(item.salesChannel)
      const target = isOnline ? onlineByDay[dayIndex] : kioskByDay[dayIndex]

      target.itemCount += 1
      target.totalCharge +=
        item.skipassTotal + item.lifepassRentalTotal + item.insuranceTotal
      target.lifepassGross += item.lifepassRentalTotal
      target.lifepassTax += item.lifepassRentalTaxAmount
      target.skipassGross += item.skipassTotal
      target.skipassTax += item.skipassTaxAmount
      target.insuranceGross += item.insuranceTotal
      target.insuranceTax += item.insuranceTaxAmount
      target.stripeFees += item.stripeFee || 0
      target.stripeNet += item.stripeNet || 0
    }

    // Calculate totals
    const sumStats = (arr: DayStats[]): DayStats =>
      arr.reduce(
        (acc, d) => ({
          day: "TOTAL",
          itemCount: acc.itemCount + d.itemCount,
          totalCharge: acc.totalCharge + d.totalCharge,
          lifepassGross: acc.lifepassGross + d.lifepassGross,
          lifepassTax: acc.lifepassTax + d.lifepassTax,
          skipassGross: acc.skipassGross + d.skipassGross,
          skipassTax: acc.skipassTax + d.skipassTax,
          insuranceGross: acc.insuranceGross + d.insuranceGross,
          insuranceTax: acc.insuranceTax + d.insuranceTax,
          stripeFees: acc.stripeFees + d.stripeFees,
          stripeNet: acc.stripeNet + d.stripeNet,
        }),
        {
          day: "TOTAL",
          itemCount: 0,
          totalCharge: 0,
          lifepassGross: 0,
          lifepassTax: 0,
          skipassGross: 0,
          skipassTax: 0,
          insuranceGross: 0,
          insuranceTax: 0,
          stripeFees: 0,
          stripeNet: 0,
        }
      )

    return {
      kiosk: kioskByDay,
      online: onlineByDay,
      kioskTotal: sumStats(kioskByDay),
      onlineTotal: sumStats(onlineByDay),
    }
  }, [filteredItems])

  const grandTotal = React.useMemo(() => {
    return {
      itemCount: dayBreakdown.kioskTotal.itemCount + dayBreakdown.onlineTotal.itemCount,
      totalCharge: dayBreakdown.kioskTotal.totalCharge + dayBreakdown.onlineTotal.totalCharge,
      lifepassGross: dayBreakdown.kioskTotal.lifepassGross + dayBreakdown.onlineTotal.lifepassGross,
      lifepassTax: dayBreakdown.kioskTotal.lifepassTax + dayBreakdown.onlineTotal.lifepassTax,
      skipassGross: dayBreakdown.kioskTotal.skipassGross + dayBreakdown.onlineTotal.skipassGross,
      skipassTax: dayBreakdown.kioskTotal.skipassTax + dayBreakdown.onlineTotal.skipassTax,
      insuranceGross: dayBreakdown.kioskTotal.insuranceGross + dayBreakdown.onlineTotal.insuranceGross,
      insuranceTax: dayBreakdown.kioskTotal.insuranceTax + dayBreakdown.onlineTotal.insuranceTax,
      stripeFees: dayBreakdown.kioskTotal.stripeFees + dayBreakdown.onlineTotal.stripeFees,
      stripeNet: dayBreakdown.kioskTotal.stripeNet + dayBreakdown.onlineTotal.stripeNet,
    }
  }, [dayBreakdown])

  /**
   * Handle export to xlsx
   */
  const handleExport = React.useCallback(async () => {
    setIsExporting(true)
    try {
      const itemsToExport = includeTestItems
        ? items
        : items.filter((item) => !item.testOrder)

      const result = await generateRicardoWeeklyExport({
        items: itemsToExport,
        startDate,
        endDate,
      })

      if (result.error || !result.data || !result.filename) {
        toast.error(result.error || "Failed to generate export")
        return
      }

      const byteCharacters = atob(result.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Export downloaded successfully")
    } catch (error) {
      console.error("Error exporting:", error)
      toast.error("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }, [items, includeTestItems, startDate, endDate])

  /**
   * Render day breakdown table
   */
  const renderDayTable = (
    dayStats: DayStats[],
    total: DayStats,
    channelLabel: string,
    icon: React.ReactNode
  ) => (
    <div className="rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
        {icon}
        <span className="font-medium">{channelLabel}</span>
        <span className="text-sm text-muted-foreground">
          ({total.itemCount} items)
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Day</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total €</TableHead>
              <TableHead className="text-right">Skipass</TableHead>
              <TableHead className="text-right">SP Tax</TableHead>
              <TableHead className="text-right">LifePass</TableHead>
              <TableHead className="text-right">LP Tax</TableHead>
              <TableHead className="text-right">Insurance</TableHead>
              <TableHead className="text-right">Ins Tax</TableHead>
              <TableHead className="text-right">Stripe Fees</TableHead>
              <TableHead className="text-right">Stripe Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayStats.map((d) => (
              <TableRow key={d.day} className={d.itemCount === 0 ? "text-muted-foreground" : ""}>
                <TableCell className="font-medium">{d.day}</TableCell>
                <TableCell className="text-right">{d.itemCount || "-"}</TableCell>
                <TableCell className="text-right">
                  {d.totalCharge ? `€${d.totalCharge.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.skipassGross ? `€${d.skipassGross.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.skipassTax ? `€${d.skipassTax.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.lifepassGross ? `€${d.lifepassGross.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.lifepassTax ? `€${d.lifepassTax.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.insuranceGross ? `€${d.insuranceGross.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {d.insuranceTax ? `€${d.insuranceTax.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {d.stripeFees ? `-€${d.stripeFees.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {d.stripeNet ? `€${d.stripeNet.toFixed(2)}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right">{total.itemCount}</TableCell>
              <TableCell className="text-right">€{total.totalCharge.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.skipassGross.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.skipassTax.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.lifepassGross.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.lifepassTax.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.insuranceGross.toFixed(2)}</TableCell>
              <TableCell className="text-right">€{total.insuranceTax.toFixed(2)}</TableCell>
              <TableCell className="text-right text-red-600">-€{total.stripeFees.toFixed(2)}</TableCell>
              <TableCell className="text-right text-green-600">€{total.stripeNet.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="include-test-items-export"
            checked={includeTestItems}
            onCheckedChange={setIncludeTestItems}
          />
          <Label
            htmlFor="include-test-items-export"
            className="cursor-pointer text-sm text-muted-foreground"
          >
            Include test items
          </Label>
          {testStats.totalItems > 0 && (
            <span className="text-xs text-muted-foreground">
              ({testStats.totalItems} test item{testStats.totalItems !== 1 ? "s" : ""})
            </span>
          )}
        </div>

        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          Download Excel Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            Period
          </div>
          <div className="text-sm font-bold">
            {format(new Date(startDate), "dd/MM")} - {format(new Date(endDate), "dd/MM/yy")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Total Items</div>
          <div className="text-xl font-bold">{grandTotal.itemCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Total Revenue</div>
          <div className="text-xl font-bold">€{grandTotal.totalCharge.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Total Tax</div>
          <div className="text-xl font-bold">
            €{(grandTotal.skipassTax + grandTotal.lifepassTax + grandTotal.insuranceTax).toFixed(2)}
          </div>
        </div>
        <div className="rounded-lg border bg-red-50 p-4">
          <div className="text-xs text-red-700">Stripe Fees</div>
          <div className="text-xl font-bold text-red-700">-€{grandTotal.stripeFees.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border bg-green-50 p-4">
          <div className="text-xs text-green-700">Net to Receive</div>
          <div className="text-xl font-bold text-green-700">€{grandTotal.stripeNet.toFixed(2)}</div>
        </div>
      </div>

      {/* Channel Split Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Online */}
        <div className="rounded-lg border bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="size-5 text-blue-600" />
            <span className="font-medium text-blue-900">Online</span>
            <span className="text-xs text-blue-600">(includes click-and-collect)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Items</div>
              <div className="font-bold">{dayBreakdown.onlineTotal.itemCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Revenue</div>
              <div className="font-bold">€{dayBreakdown.onlineTotal.totalCharge.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Stripe Net</div>
              <div className="font-bold text-green-600">€{dayBreakdown.onlineTotal.stripeNet.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Kiosk */}
        <div className="rounded-lg border bg-purple-50/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Monitor className="size-5 text-purple-600" />
            <span className="font-medium text-purple-900">Kiosk</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Items</div>
              <div className="font-bold">{dayBreakdown.kioskTotal.itemCount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Revenue</div>
              <div className="font-bold">€{dayBreakdown.kioskTotal.totalCharge.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Stripe Net</div>
              <div className="font-bold text-green-600">€{dayBreakdown.kioskTotal.stripeNet.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Tables */}
      <Tabs defaultValue="kiosk" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kiosk" className="gap-2">
            <Monitor className="size-4" />
            Kiosk ({dayBreakdown.kioskTotal.itemCount})
          </TabsTrigger>
          <TabsTrigger value="online" className="gap-2">
            <Globe className="size-4" />
            Online ({dayBreakdown.onlineTotal.itemCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kiosk" className="mt-4">
          {renderDayTable(
            dayBreakdown.kiosk,
            dayBreakdown.kioskTotal,
            "Kiosk Sales by Day",
            <Monitor className="size-5 text-purple-600" />
          )}
        </TabsContent>
        <TabsContent value="online" className="mt-4">
          {renderDayTable(
            dayBreakdown.online,
            dayBreakdown.onlineTotal,
            "Online Sales by Day (includes click-and-collect)",
            <Globe className="size-5 text-blue-600" />
          )}
        </TabsContent>
      </Tabs>

      {/* Combined Summary */}
      <div className="rounded-lg border">
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
          <FileSpreadsheet className="size-5 text-muted-foreground" />
          <span className="font-medium">Combined Totals</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Skipass €</TableHead>
                <TableHead className="text-right">LifePass €</TableHead>
                <TableHead className="text-right">Insurance €</TableHead>
                <TableHead className="text-right">Total Tax</TableHead>
                <TableHead className="text-right">Stripe Fees</TableHead>
                <TableHead className="text-right">Stripe Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <Monitor className="size-4 text-purple-600" /> Kiosk
                </TableCell>
                <TableCell className="text-right">{dayBreakdown.kioskTotal.itemCount}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.kioskTotal.skipassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.kioskTotal.lifepassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.kioskTotal.insuranceGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  €{(dayBreakdown.kioskTotal.skipassTax + dayBreakdown.kioskTotal.lifepassTax + dayBreakdown.kioskTotal.insuranceTax).toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-red-600">-€{dayBreakdown.kioskTotal.stripeFees.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-600">€{dayBreakdown.kioskTotal.stripeNet.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <Globe className="size-4 text-blue-600" /> Online
                </TableCell>
                <TableCell className="text-right">{dayBreakdown.onlineTotal.itemCount}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.onlineTotal.skipassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.onlineTotal.lifepassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{dayBreakdown.onlineTotal.insuranceGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  €{(dayBreakdown.onlineTotal.skipassTax + dayBreakdown.onlineTotal.lifepassTax + dayBreakdown.onlineTotal.insuranceTax).toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-red-600">-€{dayBreakdown.onlineTotal.stripeFees.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-600">€{dayBreakdown.onlineTotal.stripeNet.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>GRAND TOTAL</TableCell>
                <TableCell className="text-right">{grandTotal.itemCount}</TableCell>
                <TableCell className="text-right">€{grandTotal.skipassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{grandTotal.lifepassGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">€{grandTotal.insuranceGross.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  €{(grandTotal.skipassTax + grandTotal.lifepassTax + grandTotal.insuranceTax).toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-red-600">-€{grandTotal.stripeFees.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-600">€{grandTotal.stripeNet.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  )
}
