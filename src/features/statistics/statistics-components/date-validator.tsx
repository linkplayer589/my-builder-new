"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

export function DateValidator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")

    let shouldUpdateDates = false

    // Validate existing dates
    if (fromStr && toStr) {
      const from = new Date(`${fromStr}T00:00:00`)
      const to = new Date(`${toStr}T23:59:59`)

      // Check if dates are valid
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        shouldUpdateDates = true
      }
      // Check if 'to' is before 'from'
      else if (to < from) {
        shouldUpdateDates = true
      }
    } else {
      shouldUpdateDates = true
    }

    // Set default dates if needed
    if (shouldUpdateDates) {
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const params = new URLSearchParams(searchParams.toString())
      params.set("from", format(currentMonth, "yyyy-MM-dd"))
      params.set("to", format(now, "yyyy-MM-dd"))
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router])

  return null
}
