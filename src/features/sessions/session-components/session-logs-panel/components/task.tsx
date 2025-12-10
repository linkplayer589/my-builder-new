import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { type TaskData } from "../types"
import { formatMillisecondsTimeDuration } from "../utils/format-milliseconds-time-duration"
import { TaskStatusIconSwitch } from "./task-status-icon-switch"

export function Task({
  task,
  tasks,
  selectedTasks,
  onTaskSelection,
  searchTerm,
  statusFilter,
}: {
  task: TaskData
  tasks: TaskData[]
  selectedTasks: Set<string>
  onTaskSelection: (id: string) => void
  searchTerm: string
  statusFilter: string
}) {
  const [expanded, setExpanded] = useState(false) // Default to collapsed
  const [showResponseData, setShowResponseData] = useState(false)
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  // Find child tasks - memoize to avoid recalculation on every render
  const childTasks = useMemo(() => {
    // Get all direct children
    const directChildren = tasks.filter((t) => t.parentId === task.id)

    // Apply filters to children
    return directChildren.filter((childTask) => {
      // Apply status filter
      if (statusFilter !== "all" && childTask.status !== statusFilter) {
        return false
      }

      // Apply search filter if there's a search term
      if (searchTerm) {
        return (
          childTask.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          childTask.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (childTask.error?.error &&
            childTask.error.error
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        )
      }

      return true
    })
  }, [tasks, task.id, searchTerm, statusFilter])

  // Check if this task matches the search term
  const matchesSearch = useMemo(() => {
    if (searchTerm === "") return true

    const lowerSearchTerm = searchTerm.toLowerCase()

    // Search in task description and ID
    if (
      task.description.toLowerCase().includes(lowerSearchTerm) ||
      task.id.toLowerCase().includes(lowerSearchTerm)
    ) {
      return true
    }

    // Search in error message if available
    if (
      task.error?.error &&
      task.error.error.toLowerCase().includes(lowerSearchTerm)
    ) {
      return true
    }

    // Search in response data if available
    if (task.responseData) {
      const responseDataString = JSON.stringify(task.responseData).toLowerCase()
      if (responseDataString.includes(lowerSearchTerm)) {
        return true
      }
    }

    return false
  }, [task, searchTerm])

  // Check if this task matches the status filter
  const matchesStatusFilter = useMemo(() => {
    if (statusFilter === "all") return true
    return task.status === statusFilter
  }, [task.status, statusFilter])

  // If this task doesn't match filters and has no matching children, don't render
  if ((!matchesSearch || !matchesStatusFilter) && childTasks.length === 0) {
    return null
  }

  // Calculate left padding based on level
  const paddingLeft = task.level ? `${task.level * 1.5}rem` : "0"

  // Determine if this task should be highlighted
  const shouldHighlight = matchesSearch && matchesStatusFilter

  return (
    <div className="mb-4">
      <div
        className={`rounded-lg border ${shouldHighlight ? "bg-background" : "bg-muted/30"} p-4 ${searchTerm && matchesSearch ? "ring-2 ring-primary" : ""}`}
        style={{ marginLeft: paddingLeft }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {childTasks.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={expanded ? "Collapse task" : "Expand task"}
              >
                {expanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
            )}
            <TaskStatusIconSwitch status={task.status} />
            <h4
              className={`break-words font-medium ${!shouldHighlight ? "text-muted-foreground" : ""}`}
            >
              {task.description}
            </h4>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {task.duration !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="ml-auto whitespace-nowrap"
                    >
                      {formatMillisecondsTimeDuration(task.duration)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Task duration</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Checkbox
              checked={selectedTasks.has(task.id)}
              onCheckedChange={() => onTaskSelection(task.id)}
              id={`task-${task.id}`}
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>Started: {new Date(task.startTime).toLocaleString()}</div>
          {task.endTime && (
            <div>Completed: {new Date(task.endTime).toLocaleString()}</div>
          )}
        </div>
        {task.status === "failed" && task.error && shouldHighlight && (
          <div className="mt-2">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <span>View Error Details</span>
              {showErrorDetails ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            {showErrorDetails && (
              <div className="mt-2 space-y-2 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                <div>
                  <span className="font-medium">Stage:</span> {task.error.stage}
                </div>
                <div>
                  <span className="font-medium">Error Message:</span>
                  <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-2 text-xs">
                    {task.error.error}
                  </pre>
                </div>
                {task.error.details && (
                  <div>
                    <span className="font-medium">Additional Details:</span>
                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-2 text-xs">
                      {JSON.stringify(task.error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {task.responseData && shouldHighlight && (
          <div className="mt-2">
            <button
              onClick={() => setShowResponseData(!showResponseData)}
              className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              <span>Response Data</span>
              {showResponseData ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            {showResponseData && (
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-2 text-xs">
                {JSON.stringify(task.responseData, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Render child tasks if expanded */}
      {expanded && childTasks.length > 0 && (
        <div className="ml-4 mt-2 max-w-[calc(100%-1rem)] overflow-hidden border-l-2 border-muted pl-4">
          {childTasks.map((childTask, index) => (
            <Task
              key={`${childTask.id}-${index}`}
              task={childTask}
              tasks={tasks}
              selectedTasks={selectedTasks}
              onTaskSelection={onTaskSelection}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          ))}
        </div>
      )}
    </div>
  )
}
