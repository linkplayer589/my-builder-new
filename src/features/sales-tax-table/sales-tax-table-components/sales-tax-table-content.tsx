"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { type ReconciliationItem } from "../_actions/db-get-sales-tax-data"
import { SalesTaxTable } from "../sales-tax-table"

interface RevenueStats {
  totalItems: number
  skipassRevenue: number
  skipassTax: number
  lifepassRevenue: number
  lifepassTax: number
  insuranceRevenue: number
  insuranceTax: number
}

interface ReconciliationStats {
  matchedItems: number
  onlyInternalItems: number
  onlySkidataItems: number
  missingDeviceItems: number
}

interface SalesTaxTableContentProps {
  /** All reconciliation items (including test orders) */
  items: ReconciliationItem[]
  /** Resort ID for table actions */
  resortId: number
  /** Live items stats */
  liveStats: RevenueStats
  /** Test items stats */
  testStats: RevenueStats
  /** Live items reconciliation stats */
  liveReconciliation: ReconciliationStats
  /** Test items reconciliation stats */
  testReconciliation: ReconciliationStats
}

/**
 * Client component that manages the test items toggle
 *
 * @description
 * Controls both the revenue stats display AND the table data filtering.
 * By default, test items are excluded from both.
 * When toggled on, test items are included in both stats and table.
 */
export function SalesTaxTableContent({
  items,
  resortId,
  liveStats,
  testStats,
  liveReconciliation,
  testReconciliation,
}: SalesTaxTableContentProps) {
  const [includeTestItems, setIncludeTestItems] = React.useState(false)

  // Filter items based on toggle state
  const filteredItems = React.useMemo(() => {
    if (includeTestItems) {
      return items
    }
    return items.filter((item) => !item.testOrder)
  }, [items, includeTestItems])

  // Calculate totals based on toggle state
  const stats = includeTestItems
    ? {
        totalItems: liveStats.totalItems + testStats.totalItems,
        skipassRevenue: liveStats.skipassRevenue + testStats.skipassRevenue,
        skipassTax: liveStats.skipassTax + testStats.skipassTax,
        lifepassRevenue: liveStats.lifepassRevenue + testStats.lifepassRevenue,
        lifepassTax: liveStats.lifepassTax + testStats.lifepassTax,
        insuranceRevenue: liveStats.insuranceRevenue + testStats.insuranceRevenue,
        insuranceTax: liveStats.insuranceTax + testStats.insuranceTax,
      }
    : liveStats

  // Calculate reconciliation stats based on toggle state
  const reconStats = includeTestItems
    ? {
        matchedItems: liveReconciliation.matchedItems + testReconciliation.matchedItems,
        onlyInternalItems: liveReconciliation.onlyInternalItems + testReconciliation.onlyInternalItems,
        onlySkidataItems: liveReconciliation.onlySkidataItems + testReconciliation.onlySkidataItems,
        missingDeviceItems: liveReconciliation.missingDeviceItems + testReconciliation.missingDeviceItems,
      }
    : liveReconciliation

  const totalRevenue = stats.skipassRevenue + stats.lifepassRevenue + stats.insuranceRevenue
  const totalTax = stats.skipassTax + stats.lifepassTax + stats.insuranceTax

  // Determine if there are any reconciliation issues (for live items by default)
  const hasCriticalIssues = reconStats.onlySkidataItems > 0
  const hasDataIssues = reconStats.missingDeviceItems > 0
  const hasMinorDiscrepancies = reconStats.onlyInternalItems > 0
  const hasAnyMismatch = hasCriticalIssues || hasDataIssues || hasMinorDiscrepancies

  return (
    <div className="space-y-4">
      {/* Toggle for including test items */}
      <div className="flex items-center justify-end gap-2">
        <Switch
          id="include-test-items"
          checked={includeTestItems}
          onCheckedChange={setIncludeTestItems}
        />
        <Label htmlFor="include-test-items" className="cursor-pointer text-sm text-muted-foreground">
          Include test items
        </Label>
        {testStats.totalItems > 0 && (
          <span className="text-xs text-muted-foreground">
            ({testStats.totalItems} test item{testStats.totalItems !== 1 ? "s" : ""})
          </span>
        )}
      </div>

      {/* Critical issue banner - external passes in Skidata not from our system */}
      {hasCriticalIssues && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <div>
              <div className="font-semibold text-red-800">
                CRITICAL: External passes found in Skidata
              </div>
              <div className="text-sm text-red-600">
                {reconStats.onlySkidataItems} pass(es) exist in Skidata WITHOUT an orderId.
                These were created directly in Skidata, not through our system!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data issue banner - passes with orderId but missing from mythOrderSubmissionData */}
      {hasDataIssues && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-semibold text-orange-800">
                Data Issue: Device records missing
              </div>
              <div className="text-sm text-orange-600">
                {reconStats.missingDeviceItems} pass(es) have orderId (from our system) but device
                not found in mythOrderSubmissionData. Check order submission data.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minor discrepancy banner - internal items not in Skidata */}
      {hasMinorDiscrepancies && !hasCriticalIssues && !hasDataIssues && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <div>
              <div className="font-semibold text-yellow-800">
                Notice: Items in our system not in Skidata export
              </div>
              <div className="text-sm text-yellow-600">
                {reconStats.onlyInternalItems} pass(es) in our system not found in Skidata export.
                May be due to date range or pending sync.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation stats - only show if there are mismatches */}
      {hasAnyMismatch && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-green-50 p-3">
            <div className="text-xs text-muted-foreground">✓ Matched</div>
            <div className="text-xl font-bold text-green-700">{reconStats.matchedItems}</div>
            <div className="text-xs text-muted-foreground">In both systems</div>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            reconStats.onlySkidataItems > 0 ? "bg-red-100 border-red-300" : "bg-muted/30"
          )}>
            <div className="text-xs text-muted-foreground">🚨 External (no orderId)</div>
            <div className={cn(
              "text-xl font-bold",
              reconStats.onlySkidataItems > 0 ? "text-red-600" : "text-muted-foreground"
            )}>
              {reconStats.onlySkidataItems}
            </div>
            <div className="text-xs text-muted-foreground">Not from our system</div>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            reconStats.missingDeviceItems > 0 ? "bg-orange-50 border-orange-300" : "bg-muted/30"
          )}>
            <div className="text-xs text-muted-foreground">⚠️ Missing Device</div>
            <div className={cn(
              "text-xl font-bold",
              reconStats.missingDeviceItems > 0 ? "text-orange-600" : "text-muted-foreground"
            )}>
              {reconStats.missingDeviceItems}
            </div>
            <div className="text-xs text-muted-foreground">Has orderId, no device</div>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            reconStats.onlyInternalItems > 0 ? "bg-yellow-50 border-yellow-300" : "bg-muted/30"
          )}>
            <div className="text-xs text-muted-foreground">📝 Only Internal</div>
            <div className={cn(
              "text-xl font-bold",
              reconStats.onlyInternalItems > 0 ? "text-yellow-600" : "text-muted-foreground"
            )}>
              {reconStats.onlyInternalItems}
            </div>
            <div className="text-xs text-muted-foreground">Not in Skidata export</div>
          </div>
        </div>
      )}

      {/* Revenue stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Items</div>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <div className="text-xs text-muted-foreground">
            {includeTestItems ? "Including test items" : "Live items only"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Skipass Revenue</div>
          <div className="text-2xl font-bold">€{stats.skipassRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Tax: €{stats.skipassTax.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Lifepass Revenue</div>
          <div className="text-2xl font-bold">€{stats.lifepassRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Tax: €{stats.lifepassTax.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Insurance Revenue</div>
          <div className="text-2xl font-bold">€{stats.insuranceRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Tax: €{stats.insuranceTax.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Tax: €{totalTax.toFixed(2)}</div>
        </div>
      </div>

      {/* Table with filtered data */}
      <SalesTaxTable data={filteredItems} resortId={resortId} />
    </div>
  )
}
