"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { DateRangePicker } from "@/components/ui/date-range-picker"

interface DateRangeWrapperProps {
  initialDateFrom: Date
  initialDateTo: Date
  /** Enable time selection in the date picker */
  showTime?: boolean
}

/**
 * Client-side wrapper for DateRangePicker that syncs with URL search params
 *
 * @description
 * Wraps the DateRangePicker component and handles URL synchronization.
 * When dates (and optionally times) are selected, updates the URL search params.
 */
export function DateRangeWrapper({
  initialDateFrom,
  initialDateTo,
  showTime = false,
}: DateRangeWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <DateRangePicker
      initialDateFrom={initialDateFrom}
      initialDateTo={initialDateTo}
      showTime={showTime}
      onUpdate={({ range }) => {
        if (!range.from || !range.to) return

        const params = new URLSearchParams(searchParams.toString())

        // Create dates preserving the selected times
        // The range dates are in local time, so we copy and set seconds
        // toISOString() will correctly convert local time to UTC
        const fromDate = new Date(range.from)
        fromDate.setSeconds(0, 0)

        const toDate = new Date(range.to)
        toDate.setSeconds(59, 999)

        params.set("from", fromDate.toISOString())
        params.set("to", toDate.toISOString())
        router.push(`?${params.toString()}`, { scroll: false })
      }}
      align="end"
      locale="UTC"
      showCompare={false}
    />
  )
}
