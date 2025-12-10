"use client"

import { type Table } from "@tanstack/react-table"
import { Download } from "lucide-react"

import { exportTableToCSV } from "@/components/data-table"
import { Button } from "@/components/ui/button"

import { type ReconciliationItem } from "./_actions/db-get-sales-tax-data"

interface SalesTaxTableToolbarActionsProps {
  table: Table<ReconciliationItem>
}

export function SalesTaxTableToolbarActions({
  table,
}: SalesTaxTableToolbarActionsProps) {
  return (
    <div className="w-full gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "sales-tax-reporting",
          })
        }
        className="w-full gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  )
}
