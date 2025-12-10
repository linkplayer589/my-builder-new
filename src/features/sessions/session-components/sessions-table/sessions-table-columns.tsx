import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"
import posthog from "posthog-js"

/**
 * Type definitions for session log structures to ensure type safety
 */
interface RequestObject {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
}

interface ResponseObject {
  status?: number | string
  statusCode?: number | string
  code?: number | string
  meta?: {
    status?: number | string
  }
  response?: {
    status?: number | string
  }
  httpStatus?: number | string
}

interface TaskResponseData {
  status?: number | string
  statusCode?: number | string
  code?: number | string
  httpStatus?: number | string
  response?: {
    status?: number | string
  }
  meta?: {
    status?: number | string
  }
  data?: {
    status?: number | string
  }
}

interface TaskTrackerTask {
  responseData?: TaskResponseData
}

interface TaskTracker {
  tasks?: TaskTrackerTask[]
}

interface SessionLog {
  requestObject?: RequestObject
  responseObject?: ResponseObject
  taskTracker?: TaskTracker
}

interface SessionWithLog extends JoinedSession {
  sessions: JoinedSession['sessions'] & {
    sessionLog?: SessionLog
  }
}

interface BodyWithType {
  type: string
  content: string
}

/**
 * Build a cURL command string from the session's request object.
 * Falls back safely if parts are missing. This is used to allow admins to
 * quickly resend an event by copying the request as a cURL command.
 */
function buildCurlFromSession(session: JoinedSession): string | null {
  const sessionWithLog = session as SessionWithLog
  const log = sessionWithLog?.sessions?.sessionLog
  if (!log || typeof log !== "object") return null

  const request = log.requestObject
  if (!request || typeof request !== "object") return null

  const method: string = String(request.method || "GET").toUpperCase()
  const url: string | undefined = request.url
  if (!url) return null

  const headers: Record<string, string> = request.headers || {}
  const body = request.body

  // Exclude headers that are not typically needed or may conflict when replayed
  const excludedHeaderNames = new Set(["host", "content-length"])

  const headerFlags = Object.entries(headers)
    .filter(([key]) => !excludedHeaderNames.has(key.toLowerCase()))
    .map(([key, value]) => `-H ${quoteShell(`${key}: ${String(value)}`)}`)
    .join(" ")

  // Extract the actual JSON content from the body if it has the wrapper structure
  let actualBody = body
  if (body && typeof body === "object" && "type" in body && "content" in body) {
    try {
      // If body has type:"json" and content field, parse the content
      const typedBody = body as BodyWithType
      if (typedBody.type === "json" && typeof typedBody.content === "string") {
        actualBody = JSON.parse(typedBody.content)
      }
    } catch (error) {
      // If parsing fails, fall back to the original body
      console.warn("Failed to parse body.content as JSON, using original body:", error)
      actualBody = body
    }
  }

  const dataFlag =
    actualBody !== undefined && method !== "GET"
      ? `--data ${quoteShell(
          typeof actualBody === "string" ? actualBody : JSON.stringify(actualBody)
        )}`
      : ""

  const curl = [
    "curl",
    "-X",
    method,
    headerFlags,
    dataFlag,
    quoteShell(url),
  ]
    .filter(Boolean)
    .join(" ")

  return curl
}

/**
 * Extract a status code from the session response object or task responses.
 * Checks common fields like status/statusCode/code in responseObject and task responseData.
 */
function getStatusCode(session: JoinedSession): number | string | null {
  const sessionWithLog = session as SessionWithLog
  const log = sessionWithLog?.sessions?.sessionLog
  if (!log || typeof log !== "object") return null

  // First check the main responseObject
  const response = log.responseObject
  if (response && typeof response === "object") {
    const candidates: Array<number | string | undefined> = [
      response.status,
      response.statusCode,
      response.code,
      response.meta?.status,
      response.response?.status,
      response.httpStatus,
    ]
    const value = candidates.find((v) => v !== undefined && v !== null)
    if (value !== undefined && value !== null) {
      const n = Number(value)
      if (Number.isFinite(n) && n >= 100 && n <= 599) return n
      if (typeof value === "string" && /^[1-5]\d{2}$/.test(value)) return Number(value)
    }
  }

  // If not found in responseObject, check task tracker tasks for HTTP status codes
  const taskTracker = log.taskTracker
  if (taskTracker && typeof taskTracker === "object" && Array.isArray(taskTracker.tasks)) {
    for (const task of taskTracker.tasks) {
      if (task?.responseData && typeof task.responseData === "object") {
        const taskResponse = task.responseData
        const candidates: Array<number | string | undefined> = [
          taskResponse.status,
          taskResponse.statusCode,
          taskResponse.code,
          taskResponse.httpStatus,
          taskResponse.response?.status,
          taskResponse.meta?.status,
          taskResponse.data?.status,
        ]
        const value = candidates.find((v) => v !== undefined && v !== null)
        if (value !== undefined && value !== null) {
          const n = Number(value)
          if (Number.isFinite(n) && n >= 100 && n <= 599) return n
          if (typeof value === "string" && /^[1-5]\d{2}$/.test(value)) return Number(value)
        }
      }
    }
  }

  return null
}

/**
 * Get the request path (and query) minus the domain from the request URL.
 */
function getPathMinusDomain(session: JoinedSession): string | null {
  const sessionWithLog = session as SessionWithLog
  const log = sessionWithLog?.sessions?.sessionLog
  const request = log?.requestObject
  const url: string | undefined = request?.url
  if (!url) return null
  try {
    const u = new URL(url)
    return `${u.pathname}${u.search}` || "/"
  } catch {
    // Fallback: strip protocol and domain if URL constructor fails
    return url.replace(/^https?:\/\/[^/]+/i, "") || "/"
  }
}

/**
 * Shell-quote a string for safe inclusion in a cURL command.
 */
function quoteShell(value: string): string {
  // Prefer single quotes; escape any existing single quotes using the POSIX-safe pattern
  const str = String(value)
  if (str.length === 0) return "''"
  return `'${str.replace(/'/g, "'\\''")}'`
}

export function getSessionsTableColumns(
  onViewLogs: (session: JoinedSession) => void,
  isMobile: boolean // Pass this parameter to determine if the device is mobile
): ColumnDef<JoinedSession>[] {
  console.log(isMobile, "isMobile")
  // Define the columns with filter metadata
  const columns: ColumnDef<JoinedSession>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="w-16" />
      ),
      cell: ({ row }) => (
        <div className="w-16 text-center font-mono text-sm">
          {row.original.sessions.id}
        </div>
      ),
      meta: {
        filterable: true,
        filterType: "number",
        filterLabel: "Session ID",
        filterPlaceholder: "Enter session ID...",
      },
    },
    {
      accessorKey: "sessionLabel",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Label"
          className="min-w-[150px] max-w-[250px]"
        />
      ),
      cell: ({ row }) => {
        const value = row.original.sessions.sessionLabel
        return (
          <div className="max-w-[250px] truncate text-sm" title={value ?? "No label"}>
            {value ?? "No label"}
          </div>
        )
      },
      meta: {
        filterable: true,
        filterType: "text",
        filterLabel: "Session Label",
        filterPlaceholder: "Search by session label...",
      },
    },
    {
      // Request path (minus domain) extracted from sessionLog.requestObject.url
      id: "requestPath",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Path" className="min-w-[200px]" />
      ),
      cell: ({ row }) => {
        const path = getPathMinusDomain(row.original)
        return (
          <div className="max-w-[300px] truncate font-mono text-sm" title={path ?? "N/A"}>
            {path ?? "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" className="w-24" />
      ),
      cell: ({ row }) => {
        const status = row.original.sessions.status
        return (
          <div className="w-24 text-center">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              {status}
            </span>
          </div>
        )
      },
      meta: {
        filterable: true,
        filterType: "select",
        filterLabel: "Session Status",
        filterOptions: [
          { label: "Active", value: "active" },
          { label: "Complete", value: "complete" },
          { label: "Pending", value: "pending" },
          { label: "Failed", value: "failed" },
          { label: "Warning", value: "warning" },
          { label: "In Progress", value: "in_progress" },
        ],
      },
    },
    {
      // HTTP status code derived from sessionLog.responseObject
      id: "statusCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HTTP" className="w-16" />
      ),
      cell: ({ row }) => {
        const code = getStatusCode(row.original)
        const statusColor = code ?
          (Number(code) >= 200 && Number(code) < 300 ? 'text-green-600 bg-green-50' :
           Number(code) >= 400 && Number(code) < 500 ? 'text-yellow-600 bg-yellow-50' :
           Number(code) >= 500 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50') :
          'text-gray-400'
        return (
          <div className="w-16 text-center">
            {code ? (
              <span className={`inline-flex items-center rounded px-2 py-1 font-mono text-xs font-medium ${statusColor}`}>
                {code}
              </span>
            ) : (
              <span className="text-xs text-gray-400">N/A</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "apikeyId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="API Key" className="w-20" />
      ),
      cell: ({ row }) => {
        const value = row.original.api_keys?.id
        return (
          <div className="w-20 text-center font-mono text-sm">
            {value ?? "N/A"}
          </div>
        )
      },
      meta: {
        filterable: true,
        filterType: "number",
        filterLabel: "API Key ID",
        filterPlaceholder: "Enter API key ID...",
      },
    },
    {
      accessorKey: "apiKeys.scope",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scope" className="w-24" />
      ),
      cell: ({ row }) => {
        const scope = row.original.api_keys?.scope
        return (
          <div className="w-24 text-center">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {scope || "N/A"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" className="w-20" />
      ),
      cell: ({ row }) => {
        const orderId = row.original.orderId
        return (
          <div className="w-20 text-center font-mono text-sm">
            {orderId ? (
              <span className="text-blue-600 hover:text-blue-800 hover:underline">
                {orderId}
              </span>
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        )
      },
      meta: {
        filterable: true,
        filterType: "number",
        filterLabel: "Order ID",
        filterPlaceholder: "Enter order ID...",
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created At"
          className="w-36"
        />
      ),
      cell: ({ row }) => {
        const value = row.original.sessions.createdAt
        if (!value) return "N/A"

        try {
          const date = typeof value === "string" ? new Date(value) : value
          if (isNaN(date.getTime())) return "Invalid Date"

          const isoString = date.toISOString()
          const [dateStr, timeStr] = isoString.split("T")
          return (
            <div>
              {dateStr} {timeStr?.slice(0, 5)}
            </div>
          )
        } catch (error) {
          return "Invalid Date"
        }
      },
      meta: {
        filterable: true,
        filterType: "date",
        filterLabel: "Created Date",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewLogs(session)}>
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Build and copy cURL command for the request
                    try {
                      const curl = buildCurlFromSession(session)
                      if (!curl) return
                      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(curl).catch(() => {
                          // Fallback copy mechanism
                          const el = document.createElement("textarea")
                          el.value = curl
                          document.body.appendChild(el)
                          el.select()
                          document.execCommand("copy")
                          document.body.removeChild(el)
                        })
                      }
                      // PostHog analytics for copy action
                      try {
                        posthog?.capture?.("sessions.copy_curl", {
                          sessionId: session.sessions.id,
                        })
                      } catch {}
                    } catch (e) {
                      console.error("Failed to copy cURL:", e)
                    }
                  }}
                >
                  Copy as cURL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Return optimized columns for mobile (ID, Label, Path, Actions) or all columns for desktop
  return isMobile
    ? columns.filter((column, index) => {
        // Show: ID (0), Label (1), Path (2), Actions (last)
        return index === 0 || index === 1 || index === 2 || index === columns.length - 1
      })
    : columns
}
