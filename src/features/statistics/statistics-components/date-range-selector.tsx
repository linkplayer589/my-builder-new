"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangeSelectorProps {
  date: DateRange
}

export function DateRangeSelector({
  date: initialDate,
}: DateRangeSelectorProps) {
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>(initialDate)
  const [debouncedUpdateTimeout, setDebouncedUpdateTimeout] =
    useState<NodeJS.Timeout>()

  // Update local state when prop changes
  useEffect(() => {
    setDate(initialDate)
  }, [initialDate])

  const updateDateRange = (range: DateRange | undefined) => {
    // Update local state immediately
    setDate(range)

    // Clear any pending debounced updates
    if (debouncedUpdateTimeout) {
      clearTimeout(debouncedUpdateTimeout)
    }

    // Debounce the URL update and server request
    const timeout = setTimeout(() => {
      if (!range?.from) return

      const searchParams = new URLSearchParams()
      searchParams.set("from", format(range.from, "yyyy-MM-dd"))
      if (range.to) {
        searchParams.set("to", format(range.to, "yyyy-MM-dd"))
      }

      router.push(`?${searchParams.toString()}`, { scroll: false })
    }, 500) // 500ms debounce

    setDebouncedUpdateTimeout(timeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdateTimeout) {
        clearTimeout(debouncedUpdateTimeout)
      }
    }
  }, [debouncedUpdateTimeout])

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className="w-[300px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={updateDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
