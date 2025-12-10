"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Kiosk } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useResort } from "@/features/resorts"

interface KiosksExpandedRowProps {
  row: Row<Kiosk>
  setCurrentKiosk?: React.Dispatch<React.SetStateAction<Kiosk | null>>
  setOpenUpdateDialog?: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Expanded row content for Kiosks table (mobile view)
 * Displays actions and kiosk details
 */
export function KiosksExpandedRow({
  row,
  setCurrentKiosk,
  setOpenUpdateDialog,
}: KiosksExpandedRowProps) {
  const router = useRouter()
  const { resort } = useResort()

  const LABELS: Record<string, string> = {
    id: "Order ID",
    name: "Name",
    type: "Type",
    resortId: "Resort ID",
    kisokContentIds: "Content Count",
    location: "Location",
    updatedAt: "Updated",
    createdAt: "Created At",
  }

  function getLabel(key: string): string {
    if (LABELS[key]) return LABELS[key]
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase())
  }

  function renderValue(key: string, value: unknown): React.ReactNode {
    let displayValue = value
    if (key === "location") {
      displayValue = (value as { label?: string })?.label || ""
    }
    return (
      <div className="flex w-full flex-row justify-between p-1">
        <strong className="mr-2 shrink-0">{getLabel(key)}:</strong>
        <span className="grow text-right">{String(displayValue)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions Section */}
      <div>
        <span className="text-base font-bold">Actions</span>
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1 text-xs"
            variant="outline"
            onClick={() => {
              if (resort) {
                const normalizedResortName = resort.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                router.push(
                  `/admin/${normalizedResortName}/settings/kiosks/${row.original.id}`
                )
              }
            }}
          >
            <Eye className="mr-2 size-4" />
            View Details
          </Button>

          <Button
            className="flex-1 text-xs"
            variant="outline"
            onClick={() => {
              setCurrentKiosk?.(row.original)
              setOpenUpdateDialog?.(true)
            }}
          >
            Update
          </Button>
        </div>
      </div>

      {/* Kiosk Details Section */}
      <div className="space-y-4">
        {Object.entries(row.original).map(([key, value]) => (
          <div
            key={key}
            className="mb-4 flex max-w-full flex-wrap justify-between overflow-hidden rounded-md border border-gray-300 p-4"
          >
            {renderValue(key, value)}
          </div>
        ))}
      </div>
    </div>
  )
}

