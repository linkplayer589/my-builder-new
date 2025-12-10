"use client"

import * as React from "react"
import { useResort } from "@/features/resorts"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { SessionLogsPanel } from "@/features/sessions/session-components/session-logs-panel"
import { dbGetOrderSessions } from "@/db/server-actions/order-actions/db-get-order-sessions"

import { type TOrdersTableOrderDetailsDropdownProps } from "../orders-table-order-details-dropdown-types/orders-table-order-details-dropdown-types"
import { OrdersTableOrderDetailsDropdownOverview } from "./orders-table-order-details-dropdown-overview"
import { OrdersTableOrderDetailsDropdownMythSection } from "./orders-table-order-details-dropdown-myth-section"
import { OrdersTableOrderDetailsDropdownSkidataSection } from "./orders-table-order-details-dropdown-skidata-section"
import { OrdersTableOrderDetailsDropdownStripeSection } from "./orders-table-order-details-dropdown-stripe-section"

/**
 * Combined order details dropdown component that expands within the table
 *
 * @description
 * Displays comprehensive order information in an expandable row format.
 * Shows all order data including:
 * - Order overview (status, dates, client info)
 * - Myth submission details with device actions
 * - Skidata submission details with cancel functionality
 * - Stripe payment information with invoices
 * - Order sessions with logs panel
 *
 * Sessions are fetched internally using the order's sessionIds.
 * All tabs use forceMount to pre-fetch data when dropdown opens.
 *
 * @param props - Component props
 * @returns Expandable order details dropdown component
 */
export function OrdersTableOrderDetailsDropdown({
  order,
  isExpanded,
  onToggle: _onToggle,
}: TOrdersTableOrderDetailsDropdownProps) {
  const { getProductName, getConsumerCategoryName } = useResort()
  const [selectedSession, setSelectedSession] = React.useState<JoinedSession | null>(null)

  // Track if this is a manual refetch vs initial load
  const isManualRefetch = React.useRef(false)

  // Fetch sessions using the order's sessionIds
  const {
    data: sessions = [],
    refetch: refetchSessions,
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
  } = useQuery({
    queryKey: ["orderSessions", order.id, order.sessionIds],
    queryFn: async () => {
      if (!order.sessionIds?.length) return []
      const result = await dbGetOrderSessions(order.sessionIds)
      if (isManualRefetch.current) {
        toast.success("Sessions refreshed")
        isManualRefetch.current = false
      }
      return result
    },
    enabled: Boolean(order.sessionIds?.length) && isExpanded,
    retry: 1,
  })

  const handleRefreshSessions = () => {
    isManualRefetch.current = true
    void refetchSessions()
  }

  // Determine which tabs to show based on available data
  const hasMythData = Boolean(order.mythOrderSubmissionData)
  const hasSkidataData = Boolean(order.skidataOrderSubmissionData)
  const hasStripeData = Boolean(order.stripePaymentIntentIds?.[0] || order.stripeInvoiceId)

  /**
   * Get HTTP status code color based on status
   */
  const getStatusColor = (code: number | string | null): string => {
    if (!code) return "text-gray-400"
    const num = Number(code)
    if (num >= 200 && num < 300) return "text-green-600 bg-green-50"
    if (num >= 400 && num < 500) return "text-yellow-600 bg-yellow-50"
    if (num >= 500) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  /**
   * Extract HTTP status code from session log
   */
  const getStatusCode = (session: JoinedSession): number | string | null => {
    const log = session?.sessions?.sessionLog as Record<string, unknown> | undefined
    if (!log || typeof log !== "object") return null

    const response = log.responseObject as Record<string, unknown> | undefined
    if (response && typeof response === "object") {
      const candidates = [
        response.status,
        response.statusCode,
        response.code,
        (response.meta as Record<string, unknown> | undefined)?.status,
        (response.response as Record<string, unknown> | undefined)?.status,
        response.httpStatus,
      ]
      const value = candidates.find((v) => v !== undefined && v !== null)
      if (value !== undefined && value !== null) {
        const n = Number(value)
        if (Number.isFinite(n) && n >= 100 && n <= 599) return n
      }
    }
    return null
  }

  /**
   * Get request path from session log
   */
  const getRequestPath = (session: JoinedSession): string | null => {
    const log = session?.sessions?.sessionLog as Record<string, unknown> | undefined
    const request = log?.requestObject as Record<string, unknown> | undefined
    const url = request?.url as string | undefined
    if (!url) return null
    try {
      const u = new URL(url)
      return `${u.pathname}${u.search}` || "/"
    } catch {
      return url.replace(/^https?:\/\/[^/]+/i, "") || "/"
    }
  }

  return (
    <div className="w-full">
      {/* Expanded content - always shown when isExpanded is true (inline table expansion) */}
      {isExpanded && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {hasMythData && <TabsTrigger value="myth">Myth Details</TabsTrigger>}
            {hasSkidataData && <TabsTrigger value="skidata">Skidata Details</TabsTrigger>}
            {hasStripeData && <TabsTrigger value="stripe">Payment</TabsTrigger>}
            <TabsTrigger value="sessions">
              Sessions {order.sessionIds?.length ? `(${order.sessionIds.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OrdersTableOrderDetailsDropdownOverview
              order={order}
              getProductName={getProductName}
              getConsumerCategoryName={getConsumerCategoryName}
            />
          </TabsContent>

          {/* forceMount ensures data is fetched immediately when panel opens
              data-[state=inactive]:hidden hides content when tab is not active */}
          {hasMythData && (
            <TabsContent value="myth" className="space-y-4 data-[state=inactive]:hidden" forceMount>
              <OrdersTableOrderDetailsDropdownMythSection
                order={order}
                getProductName={getProductName}
                getConsumerCategoryName={getConsumerCategoryName}
              />
            </TabsContent>
          )}

          {hasSkidataData && (
            <TabsContent value="skidata" className="space-y-4 data-[state=inactive]:hidden" forceMount>
              <OrdersTableOrderDetailsDropdownSkidataSection
                order={order}
                getProductName={getProductName}
                getConsumerCategoryName={getConsumerCategoryName}
              />
            </TabsContent>
          )}

          {hasStripeData && (
            <TabsContent value="stripe" className="space-y-4 data-[state=inactive]:hidden" forceMount>
              <OrdersTableOrderDetailsDropdownStripeSection order={order} />
            </TabsContent>
          )}

          <TabsContent value="sessions" className="space-y-4">
            {/* Sessions Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Sessions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshSessions}
                disabled={isFetchingSessions}
                className="gap-2"
              >
                <RefreshCw className={`size-4 ${isFetchingSessions ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoadingSessions ? (
              <div className="flex items-center justify-center rounded-md border p-8">
                <Loader2 className="mr-2 size-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading sessions...</p>
              </div>
            ) : !order.sessionIds?.length ? (
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">
                  No session IDs associated with this order.
                </p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">
                  No sessions found for this order.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Sessions Table Header */}
                <div className="grid grid-cols-12 gap-2 rounded-md border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-3">Label</div>
                  <div className="col-span-3">Path</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">HTTP</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-1">Action</div>
                </div>

                {/* Sessions List */}
                <div className="space-y-1">
                  {sessions.map((session) => {
                    const statusCode = getStatusCode(session)
                    const requestPath = getRequestPath(session)

                    return (
                      <div
                        key={session.sessions.id}
                        className="grid grid-cols-12 gap-2 items-center rounded-md border bg-background p-3 text-sm transition-colors hover:bg-muted/30"
                      >
                        {/* ID */}
                        <div className="col-span-1 font-mono text-xs">
                          {session.sessions.id}
                        </div>

                        {/* Label */}
                        <div className="col-span-3 truncate text-xs" title={session.sessions.sessionLabel ?? "No label"}>
                          {session.sessions.sessionLabel ?? "No label"}
                        </div>

                        {/* Path */}
                        <div className="col-span-3 truncate font-mono text-xs text-muted-foreground" title={requestPath ?? "N/A"}>
                          {requestPath ?? "N/A"}
                        </div>

                        {/* Session Status */}
                        <div className="col-span-1">
                          <Badge variant="outline" className="text-xs">
                            {session.sessions.status}
                          </Badge>
                        </div>

                        {/* HTTP Status */}
                        <div className="col-span-1">
                          {statusCode ? (
                            <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-medium ${getStatusColor(statusCode)}`}>
                              {statusCode}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>

                        {/* Created At */}
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {(() => {
                            try {
                              const date = new Date(session.sessions.createdAt)
                              const isoString = date.toISOString()
                              const [dateStr, timeStr] = isoString.split("T")
                              return `${dateStr} ${timeStr?.slice(0, 5)}`
                            } catch {
                              return "Invalid Date"
                            }
                          })()}
                        </div>

                        {/* Action */}
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedSession(session)}
                          >
                            Logs
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Session Logs Panel - Opens when a session is clicked */}
      <SessionLogsPanel
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </div>
  )
}
