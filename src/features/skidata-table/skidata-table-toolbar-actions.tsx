"use client"

import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { exportTableToCSV } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { type TicketItem } from "./_types/skidata"

const ORDER_STATUSES = [
  "All",
  "BookedAndTransferred",
  "CanceledAndTransferred",
  // Add other possible statuses here
] as const

interface SkidataTableToolbarActionsProps { 
  table: Table<TicketItem>
}

export function SkidataTableToolbarActions({
  table,
}: SkidataTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        onValueChange={(value) => {
          if (value === "All") {
            table.getColumn("skidataOrderStatus")?.setFilterValue("")
          } else {
            table.getColumn("skidataOrderStatus")?.setFilterValue(value)
          }
        }}
        defaultValue="All"
      >
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "skidata-report",
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  )
}
