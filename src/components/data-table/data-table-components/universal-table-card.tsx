"use client"

import * as React from "react"
import { type Row } from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/**
 * Universal Table Card Component for Mobile Views
 * 
 * Provides a card-based layout for table data on mobile devices
 * with collapsible content and customizable rendering
 * 
 * @example
 * ```tsx
 * <UniversalTableCard
 *   row={row}
 *   renderHeader={(row) => <div>{row.original.title}</div>}
 *   renderSummary={(row) => <div>{row.original.description}</div>}
 *   renderDetails={(row) => <div>Full details here</div>}
 * />
 * ```
 */
interface UniversalTableCardProps<TData> {
  /** The table row data */
  row: Row<TData>
  /** Render function for the card header (always visible) */
  renderHeader: (row: Row<TData>) => React.ReactNode
  /** Render function for summary info (always visible) */
  renderSummary?: (row: Row<TData>) => React.ReactNode
  /** Render function for detailed content (collapsible) */
  renderDetails?: (row: Row<TData>) => React.ReactNode
  /** Render function for action buttons */
  renderActions?: (row: Row<TData>) => React.ReactNode
  /** Whether the card is initially expanded */
  defaultExpanded?: boolean
  /** CSS classes for the card */
  className?: string
  /** Children components (e.g., dialogs) */
  children?: React.ReactNode
}

export function UniversalTableCard<TData>({
  row,
  renderHeader,
  renderSummary,
  renderDetails,
  renderActions,
  defaultExpanded = false,
  className = "",
  children,
}: UniversalTableCardProps<TData>) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  return (
    <>
      <Card className={`mb-3 ${className}`}>
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">{renderHeader(row)}</div>
            {renderDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            )}
          </div>

          {/* Summary Section */}
          {renderSummary && (
            <div className="mb-2 text-sm text-muted-foreground">
              {renderSummary(row)}
            </div>
          )}

          {/* Actions Section */}
          {renderActions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {renderActions(row)}
            </div>
          )}

          {/* Collapsible Details Section */}
          {isExpanded && renderDetails && (
            <div className="mt-4 border-t pt-4">
              {renderDetails(row)}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render children (e.g., dialogs) outside the card */}
      {children}
    </>
  )
}

/**
 * Helper Components for Common Card Patterns
 */

interface CardFieldProps {
  label: string
  value: React.ReactNode
  variant?: "default" | "vertical"
}

export function CardField({ label, value, variant = "default" }: CardFieldProps) {
  if (variant === "vertical") {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

interface CardSectionProps {
  title: string
  children: React.ReactNode
}

export function CardSection({ title, children }: CardSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

interface CardBadgeGroupProps {
  badges: Array<{
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }>
}

export function CardBadgeGroup({ badges }: CardBadgeGroupProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge, index) => (
        <Badge key={index} variant={badge.variant || "default"} className="text-xs">
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}

