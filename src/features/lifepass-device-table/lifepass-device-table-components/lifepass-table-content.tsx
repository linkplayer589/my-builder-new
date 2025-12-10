"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { type TicketItem } from "@/features/skidata-table/_types/skidata"
import { LifepassTable } from "./lifepass-table"

interface LifepassTableContentProps {
  /** All ticket items (including test orders) */
  items: TicketItem[]
  /** Resort ID for table actions */
  resortId: number
  /** Number of live items */
  liveItems: number
  /** Number of test items */
  testItems: number
  /** Number of items without matching order */
  itemsWithoutMatchingOrder: number
}

/**
 * Client component that manages the test items toggle
 *
 * @description
 * Controls both the stats display AND the table data filtering.
 * By default, test items are excluded from both.
 * When toggled on, test items are included in both stats and table.
 */
export function LifepassTableContent({
  items,
  resortId,
  liveItems,
  testItems,
  itemsWithoutMatchingOrder,
}: LifepassTableContentProps) {
  const [includeTestItems, setIncludeTestItems] = React.useState(false)

  // Filter items based on toggle state
  const filteredItems = React.useMemo(() => {
    if (includeTestItems) {
      return items
    }
    return items.filter((item) => !item.testOrder)
  }, [items, includeTestItems])

  // Calculate displayed count
  const displayedCount = includeTestItems ? items.length : liveItems

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
        {testItems > 0 && (
          <span className="text-xs text-muted-foreground">
            ({testItems} test item{testItems !== 1 ? "s" : ""})
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Devices</div>
          <div className="text-2xl font-bold">{displayedCount}</div>
          <div className="text-xs text-muted-foreground">
            {includeTestItems ? "Including test items" : "Live items only"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Test Devices</div>
          <div className="text-2xl font-bold">{testItems}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Live Devices</div>
          <div className="text-2xl font-bold">{liveItems}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Without Matching Order</div>
          <div className="text-2xl font-bold">{itemsWithoutMatchingOrder}</div>
        </div>
      </div>

      {/* Table with filtered data */}
      <LifepassTable data={filteredItems} resortId={resortId} />
    </div>
  )
}

