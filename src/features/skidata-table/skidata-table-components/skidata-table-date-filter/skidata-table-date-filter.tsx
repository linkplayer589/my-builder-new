"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { XCircle } from "lucide-react"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"

import {
  SKIDATA_TABLE_DATE_FILTER_ID,
  SKIDATA_TABLE_DATE_FROM_ROW_ID,
  SKIDATA_TABLE_DATE_PLACEHOLDER,
  SKIDATA_TABLE_DATE_TO_ROW_ID,
} from "./skidata-table-date-filter-constants"

type FilterParam = {
  id: string
  value: string | string[]
  type: string
  operator: string
  rowId: string
}

interface SkidataTableDateFilterProps {
  initialDateFrom?: string
  initialDateTo?: string
}

/**
 * Skidata table date filter
 *
 * @description
 * Syncs the top-of-page date picker with the `filters` query parameter so the
 * Skidata reporting table fetches the correct date range on the server.
 */
export function SkidataTableDateFilter({
  initialDateFrom,
  initialDateTo,
}: SkidataTableDateFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [label, setLabel] = React.useState(() =>
    formatDisplayLabel(initialDateFrom, initialDateTo)
  )
  const [hasSelection, setHasSelection] = React.useState(
    Boolean(initialDateFrom && initialDateTo)
  )

  React.useEffect(() => {
    setLabel(formatDisplayLabel(initialDateFrom, initialDateTo))
    setHasSelection(Boolean(initialDateFrom && initialDateTo))
  }, [initialDateFrom, initialDateTo])

  const handleUpdate = React.useCallback(
    ({ range }: { range?: { from?: Date; to?: Date } }) => {
      if (!range?.from || !range?.to) return

      const fromISO = toIsoBoundary(range.from, "start")
      const toISO = toIsoBoundary(range.to, "end")

      const params = new URLSearchParams(searchParams.toString())
      const filters = getFiltersFromParams(params)
      const nextFilters = [
        ...filters.filter(
          (filter) =>
            filter.rowId !== SKIDATA_TABLE_DATE_FROM_ROW_ID &&
            filter.rowId !== SKIDATA_TABLE_DATE_TO_ROW_ID
        ),
        buildFilter(SKIDATA_TABLE_DATE_FROM_ROW_ID, "gte", fromISO),
        buildFilter(SKIDATA_TABLE_DATE_TO_ROW_ID, "lte", toISO),
      ]

      applyFiltersToParams(params, nextFilters)
      params.set("page", "1")

      setLabel(formatDisplayLabel(fromISO, toISO))
      setHasSelection(true)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleClear = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    const filters = getFiltersFromParams(params)
    const nextFilters = filters.filter(
      (filter) =>
        filter.rowId !== SKIDATA_TABLE_DATE_FROM_ROW_ID &&
        filter.rowId !== SKIDATA_TABLE_DATE_TO_ROW_ID
    )

    applyFiltersToParams(params, nextFilters)
    params.set("page", "1")

    setLabel(SKIDATA_TABLE_DATE_PLACEHOLDER)
    setHasSelection(false)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return (
    <div className="flex items-center gap-2">
      <DateRangePicker
        showCompare={false}
        align="end"
        displayValue={label}
        initialDateFrom={initialDateFrom ? new Date(initialDateFrom) : undefined}
        initialDateTo={initialDateTo ? new Date(initialDateTo) : undefined}
        onUpdate={handleUpdate}
      />
      {hasSelection && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="gap-1 text-muted-foreground"
          onClick={handleClear}
        >
          <XCircle className="size-4" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  )
}

function formatDisplayLabel(from?: string, to?: string): string {
  if (!from || !to) {
    return SKIDATA_TABLE_DATE_PLACEHOLDER
  }

  try {
    const fromDate = new Date(from)
    const toDate = new Date(to)

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return SKIDATA_TABLE_DATE_PLACEHOLDER
    }

    return `${format(fromDate, "dd/MM/yyyy")} - ${format(toDate, "dd/MM/yyyy")}`
  } catch {
    return SKIDATA_TABLE_DATE_PLACEHOLDER
  }
}

function toIsoBoundary(date: Date, boundary: "start" | "end"): string {
  if (boundary === "start") {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    ).toISOString()
  }

  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  ).toISOString()
}

function getFiltersFromParams(params: URLSearchParams): FilterParam[] {
  const raw = params.get("filters")
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as FilterParam[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function applyFiltersToParams(
  params: URLSearchParams,
  filters: FilterParam[]
): void {
  if (!filters.length) {
    params.delete("filters")
  } else {
    params.set("filters", JSON.stringify(filters))
  }
}

function buildFilter(
  rowId: string,
  operator: "gte" | "lte",
  value: string
): FilterParam {
  return {
    id: SKIDATA_TABLE_DATE_FILTER_ID,
    rowId,
    operator,
    value,
    type: "date",
  }
}


