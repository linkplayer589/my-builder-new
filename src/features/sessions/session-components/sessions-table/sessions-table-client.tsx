"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  type dbGetSessions,
  type JoinedSession,
} from "@/features/sessions/session-actions/db-get-sessions"
import { revalidateSessions } from "./_lib/revalidate-sessions"

import { useDataTable } from "@/components/data-table"
import { useIsMobile } from "@/hooks/use-mobile"
import { UniversalDataTableWrapper } from "@/components/data-table"
import { UniversalDataTable } from "@/components/data-table"

import { SessionLogsPanel } from "../session-logs-panel"
import { getSessionsTableColumns } from "./sessions-table-columns"

interface SessionsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof dbGetSessions>>]>
}

/**
 * Client-side sessions table component
 *
 * @description
 * Client component that renders the sessions table with interactive features
 * Includes loading states and next-page prefetching
 */
export function SessionsTableClient({ promises }: SessionsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: JoinedSession[]; pageCount: number },
  ]

  const [selectedSession, setSelectedSession] =
    React.useState<JoinedSession | null>(null)
  const [showLogs, setShowLogs] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Track previous search params to detect changes
  const prevSearchParamsRef = React.useRef<string | null>(null)
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const dataRef = React.useRef<JoinedSession[] | null>(null)

  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  /**
   * Trigger router refresh when URL params change
   *
   * IMPORTANT: Only show skeleton for pagination/sorting changes.
   * Don't show skeleton while user is typing filters (debounced).
   */
  React.useEffect(() => {
    const currentParams = searchParams.toString()

    // Skip on initial mount
    if (prevSearchParamsRef.current === null) {
      prevSearchParamsRef.current = currentParams
      return
    }

    // If params changed, trigger refresh to fetch new data
    if (prevSearchParamsRef.current !== currentParams) {
      prevSearchParamsRef.current = currentParams

      // Clear any pending timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      // Debounce skeleton appearance (wait 300ms to see if more changes come)
      // This prevents skeleton from showing while user is actively typing filters
      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(true)
        router.refresh()
      }, 300)
    }

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [searchParams, router])

  React.useEffect(() => {
    if (dataRef.current !== data) {
      dataRef.current = data
      setIsRefreshing(false)
    }
  }, [data])

  // Prefetch next page when approaching current page end
  React.useEffect(() => {
    if (currentPage < pageCount) {
      const params = new URLSearchParams(searchParams)
      params.set('page', String(currentPage + 1))
      router.prefetch(`?${params.toString()}`)
    }
  }, [currentPage, pageCount, searchParams, router])

  // Memoize the columns based on the isMobile state
  const columns = React.useMemo(() => {
    return getSessionsTableColumns((session) => {
      setSelectedSession(session)
      setShowLogs(true)
    }, isMobile)
  }, [isMobile])

  // Setup the table using the data, columns, and filters
  const { table } = useDataTable<JoinedSession>({
    data,
    columns,
    pageCount,
    filterFields: [],
    enableAdvancedFilter: true,
    initialState: {
      sorting: [],
    },
    getRowId: (originalRow, index) => `${originalRow.sessions.id}-${index}`,
    shallow: true,
    clearOnDefault: false,
  })

  return (
    <>
      <UniversalDataTableWrapper
        table={table}
        columns={columns}
        onRevalidate={revalidateSessions}
        storageKey="sessionsLastRefreshed"
        exportFilename="sessions"
        isLoading={isRefreshing}
      >
        <UniversalDataTable table={table} />
      </UniversalDataTableWrapper>
      <SessionLogsPanel
        session={selectedSession}
        open={showLogs}
        onOpenChange={setShowLogs}
      />
    </>
  )
}

