"use client"

import type { DeviceHistory } from "@/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"

interface GetColumnsProps {
  isMobile: boolean
}

/**
 * Get color variant for event type badge
 */
function getEventTypeVariant(eventType: string): "default" | "secondary" | "destructive" | "outline" {
  if (eventType.includes("error")) return "destructive"
  if (eventType.includes("created") || eventType.includes("registered")) return "default"
  if (eventType.includes("cancelled") || eventType.includes("deleted")) return "destructive"
  if (eventType.includes("returned") || eventType.includes("retrieved")) return "secondary"
  return "outline"
}

/**
 * Get color variant for processing status badge
 */
function getProcessingStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "processed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    case "requires_attention":
      return "outline"
    default:
      return "outline"
  }
}

/**
 * Device history table columns configuration
 */
export function getDeviceHistoryTableColumns({
  isMobile,
}: GetColumnsProps): ColumnDef<DeviceHistory>[] {
  const columns: ColumnDef<DeviceHistory>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ cell }) => {
        return <div className="w-[60px]">{cell.getValue() as number}</div>
      },
    },
    {
      accessorKey: "eventType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Type" />
      ),
      cell: ({ cell }) => {
        const eventType = cell.getValue() as string
        return (
          <Badge
            variant={getEventTypeVariant(eventType)}
            className="whitespace-nowrap"
          >
            {eventType.replace(/_/g, " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "eventTimestamp",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timestamp" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | Date
        const date = typeof value === "string" ? new Date(value) : value
        return !isNaN(date.getTime())
          ? `${date.toISOString().split("T")[0]} ${date.toISOString().split("T")[1]?.slice(0, 8)}`
          : "Invalid Date"
      },
    },
    {
      accessorKey: "locationType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location Type" />
      ),
      cell: ({ cell }) => {
        const locationType = cell.getValue() as string | null
        return locationType ? (
          <Badge variant="secondary" className="capitalize">
            {locationType.replace(/_/g, " ")}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "locationName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | null
        return value ?? <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "statusBefore",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status Before" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | null
        return value ? (
          <Badge variant="outline">{value}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "statusAfter",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status After" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | null
        return value ? (
          <Badge variant="outline">{value}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "initiatedBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Initiated By" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | null
        return value ? (
          <Badge variant="secondary" className="capitalize">
            {value.replace(/_/g, " ")}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "processingStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ cell }) => {
        const status = cell.getValue() as string
        return (
          <Badge
            variant={getProcessingStatusVariant(status)}
            className="capitalize"
          >
            {status.replace(/_/g, " ")}
          </Badge>
        )
      },
    },
  ]

  // On mobile, show only essential columns
  return isMobile
    ? columns.filter((_, index) => [0, 1, 2, 8].includes(index))
    : columns
}
