import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps {
  /**
   * Number of columns to render
   */
  columnCount: number
  /**
   * Number of rows to render
   */
  rowCount: number
  /**
   * Whether to show the search bar skeleton
   */
  showToolbar?: boolean
  /**
   * Whether to show pagination skeleton
   */
  showPagination?: boolean
  /**
   * Optional class name for the container
   */
  className?: string
}

/**
 * Skeleton loader for data tables
 *
 * @description
 * Displays animated skeleton placeholders while table data is loading.
 * Shows pulsating rows that match the expected table structure.
 */
export function DataTableSkeleton({
  columnCount,
  rowCount,
  showToolbar = true,
  showPagination = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={className}>
      {showToolbar && (
        <div className="mb-4 flex items-center justify-between">
          {/* Search/Filter skeleton */}
          <div className="flex flex-1 items-center space-x-2">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10" /> {/* Refresh */}
            <Skeleton className="h-10 w-10" /> {/* Columns */}
            <Skeleton className="h-10 w-[100px]" /> {/* Export */}
          </div>
        </div>
      )}

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  )
}
