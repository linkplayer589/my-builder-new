import { useCallback, useMemo, useState } from "react"
import { type JoinedSession } from "@/features/sessions/session-actions/db-get-sessions"
import { ArrowRight, Filter, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/copy-button"

import { JsonViewer } from "./components/json-viewer"
import { RequestResponseSection } from "./components/request-response-section"
import { SessionSummary } from "./components/session-summery"
import { TaskTimeline } from "./components/task-timeline"
import { VirtualizedTaskList } from "./components/virtualized-task-list"
import { type RequestData, type SessionLog, type TaskData } from "./types"
import { isValidSessionLog } from "./validators/is-valid-session-log"

interface SessionLogsPanelProps {
  session: JoinedSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionLogsPanel({
  session,
  open,
  onOpenChange,
}: SessionLogsPanelProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [includeChildren, setIncludeChildren] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("tree")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSummary, setShowSummary] = useState(true)

  // Safely access session log data with proper type checking
  const sessionLog = useMemo<SessionLog | null>(() => {
    if (!session?.sessions?.sessionLog) return null

    setIsProcessing(true)
    try {
      const result = isValidSessionLog(session.sessions.sessionLog)
        ? session.sessions.sessionLog
        : null
      return result
    } finally {
      setIsProcessing(false)
    }
  }, [session])

  const isValidLog = !!sessionLog

  // Move all hooks before any conditional returns
  const handleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedTasks(new Set())
  }, [])

  const handleSelectAll = useCallback(() => {
    if (!sessionLog) return

    const allTaskIds = new Set<string>(
      sessionLog.taskTracker.tasks.map((task) => task.id)
    )
    setSelectedTasks(allTaskIds)
  }, [sessionLog])

  // Toggle summary visibility
  const toggleSummary = useCallback(() => {
    setShowSummary((prev) => !prev)
  }, [])

  // Hide summary
  const hideSummary = useCallback(() => {
    setShowSummary(false)
  }, [])

  // Show summary
  const _showSummaryHandler = useCallback(() => {
    setShowSummary(true)
  }, [])

  // Calculate the scroll area height based on whether the summary is shown
  const scrollAreaHeight = useMemo(() => {
    return showSummary ? "h-[calc(100vh-26rem)]" : "h-[calc(100vh-18rem)]"
  }, [showSummary])

  // Filter tasks based on search term and status filter - with memoization
  const filteredTasks = useMemo<TaskData[]>(() => {
    if (!sessionLog) return []

    return sessionLog.taskTracker.tasks.filter((task) => {
      // Apply status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false
      }

      // Apply search filter if there's a search term
      if (searchTerm) {
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
          const responseDataString = JSON.stringify(
            task.responseData
          ).toLowerCase()
          if (responseDataString.includes(lowerSearchTerm)) {
            return true
          }
        }

        return false
      }

      return true
    })
  }, [sessionLog, searchTerm, statusFilter])

  // Get all child tasks recursively for selected tasks
  const getAllChildrenForTasks = useCallback(
    (taskIds: string[]): TaskData[] => {
      if (!sessionLog) return []

      const result: TaskData[] = []
      const visited = new Set<string>()

      const collectChildren = (taskId: string) => {
        if (visited.has(taskId)) return
        visited.add(taskId)

        const task = sessionLog.taskTracker.tasks.find((t) => t.id === taskId)
        if (!task) return

        result.push(task)

        // Find all children of this task
        const childTasks = sessionLog.taskTracker.tasks.filter(
          (t) => t.parentId === taskId
        )
        childTasks.forEach((child) => collectChildren(child.id))
      }

      taskIds.forEach((id) => collectChildren(id))
      return result
    },
    [sessionLog]
  )

  // Get selected tasks with their children if includeChildren is true
  const selectedTasksData = useMemo<TaskData[]>(() => {
    if (!sessionLog) return []

    const selectedTaskIds = Array.from(selectedTasks)

    if (includeChildren) {
      return getAllChildrenForTasks(selectedTaskIds)
    } else {
      return sessionLog.taskTracker.tasks.filter((task) =>
        selectedTasks.has(task.id)
      )
    }
  }, [sessionLog, selectedTasks, includeChildren, getAllChildrenForTasks])

  // Get task counts by status
  const taskStatusCounts = useMemo(() => {
    if (!sessionLog)
      return {
        all: 0,
        completed: 0,
        failed: 0,
        warning: 0,
        in_progress: 0,
        pending: 0,
      }

    const counts = {
      all: sessionLog.taskTracker.tasks.length,
      completed: 0,
      failed: 0,
      warning: 0,
      in_progress: 0,
      pending: 0,
    }

    sessionLog.taskTracker.tasks.forEach((task) => {
      const status = task.status as keyof typeof counts
      if (status in counts && status !== "all") {
        counts[status]++
      }
    })

    return counts
  }, [sessionLog])

  if (!session) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-1/3 min-w-fit">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Session Logs - {session.sessions.id}</SheetTitle>
            <div className="flex items-center gap-2 pr-8">
              {selectedTasksData.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-children"
                      checked={includeChildren}
                      onCheckedChange={(checked) =>
                        setIncludeChildren(!!checked)
                      }
                    />
                    <label
                      htmlFor="include-children"
                      className="cursor-pointer text-sm"
                    >
                      Include children
                    </label>
                  </div>
                  <CopyButton
                    data={selectedTasksData}
                    label={`Copy (${selectedTasksData.length})`}
                  />
                </>
              )}
            </div>
          </div>
        </SheetHeader>
        <Tabs
          defaultValue={isValidLog ? "tree" : "raw"}
          className="mt-4 h-[calc(100vh-8rem)]"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="tree" disabled={!isValidLog}>
              Tree View
            </TabsTrigger>
            <TabsTrigger value="flow" disabled={!isValidLog}>
              Flow Diagram
            </TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          {/* Tree View Tab */}
          <TabsContent value="tree" className="mt-4 h-full">
            {!isValidLog ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Unable to parse session log structure.</p>
                  <p>Please check the raw JSON view.</p>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Processing session log data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filter Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-8"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[220px]">
                        <SelectItem value="all">
                          All Statuses ({taskStatusCounts.all})
                        </SelectItem>
                        <SelectItem value="completed">
                          Completed ({taskStatusCounts.completed})
                        </SelectItem>
                        <SelectItem value="failed">
                          Failed ({taskStatusCounts.failed})
                        </SelectItem>
                        <SelectItem value="warning">
                          Warning ({taskStatusCounts.warning})
                        </SelectItem>
                        <SelectItem value="in_progress">
                          In Progress ({taskStatusCounts.in_progress})
                        </SelectItem>
                        <SelectItem value="pending">
                          Pending ({taskStatusCounts.pending})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Session Summary with toggle button */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {filteredTasks.length} tasks{" "}
                    {statusFilter !== "all"
                      ? `(filtered by ${statusFilter})`
                      : ""}
                    {searchTerm ? ` (search: "${searchTerm}")` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleSummary}>
                      {showSummary ? "Hide Summary" : "Show Summary"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    {selectedTasksData.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                      >
                        Deselect All
                      </Button>
                    )}
                  </div>
                </div>

                {/* Session Summary - conditionally rendered */}
                {activeTab === "tree" && sessionLog && showSummary && (
                  <SessionSummary
                    sessionLog={sessionLog}
                    onHide={hideSummary}
                  />
                )}

                {/* Dynamic height ScrollArea */}
                <ScrollArea
                  className={`${scrollAreaHeight} pr-4 transition-all duration-300`}
                >
                  {/* Hierarchical Task Tree - Use virtualized list for better performance */}
                  <div className="w-full p-1 pb-10">
                    <VirtualizedTaskList
                      tasks={sessionLog.taskTracker.tasks}
                      selectedTasks={selectedTasks}
                      onTaskSelection={handleTaskSelection}
                      searchTerm={searchTerm}
                      statusFilter={statusFilter}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Flow Diagram Tab */}
          <TabsContent value="flow" className="mt-4 h-full">
            {!isValidLog ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Unable to parse session log structure.</p>
                  <p>Please check the raw JSON view.</p>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Processing session log data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Toggle Summary Button */}
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={toggleSummary}>
                    {showSummary ? "Hide Summary" : "Show Summary"}
                  </Button>
                </div>

                {/* Session Summary - conditionally rendered */}
                {activeTab === "flow" && sessionLog && showSummary && (
                  <SessionSummary
                    sessionLog={sessionLog}
                    onHide={hideSummary}
                  />
                )}

                <ScrollArea
                  className={`${showSummary ? "h-[calc(100vh-26rem)]" : "h-[calc(100vh-18rem)]"} pr-4 transition-all duration-300`}
                >
                  <div className="space-y-8 pb-16">
                    {/* Request */}
                    <div className="relative">
                      <RequestResponseSection
                        title="Request"
                        data={sessionLog.requestObject}
                      />
                      <div className="absolute left-1/2 flex h-8 w-full -translate-x-1/2 items-center justify-center">
                        <ArrowRight className="rotate-90 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Tasks Timeline - Only show first 50 tasks for performance */}
                    <div className="space-y-8">
                      {filteredTasks.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-lg border bg-muted p-4">
                          <p className="text-center text-muted-foreground">
                            No tasks match the current filters
                          </p>
                        </div>
                      ) : (
                        <>
                          {filteredTasks.slice(0, 50).map((task, index) => (
                            <div
                              key={`${task.id}-${index}`}
                              className="relative"
                            >
                              <TaskTimeline
                                task={task}
                                selectedTasks={selectedTasks}
                                onTaskSelection={handleTaskSelection}
                              />
                              {index <
                                Math.min(filteredTasks.length - 1, 49) && (
                                <div className="absolute left-1/2 flex h-8 w-full -translate-x-1/2 items-center justify-center">
                                  <ArrowRight className="rotate-90 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                          {filteredTasks.length > 50 && (
                            <div className="rounded-lg border bg-muted p-4 text-center text-muted-foreground">
                              {filteredTasks.length - 50} more tasks not shown
                              for performance reasons
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Response */}
                    <div className="relative">
                      <div className="absolute -top-8 left-1/2 flex w-full -translate-x-1/2 items-center justify-center">
                        <ArrowRight className="rotate-90 text-muted-foreground" />
                      </div>
                      <RequestResponseSection
                        title="Response"
                        data={
                          sessionLog.responseObject as unknown as RequestData
                        }
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Raw JSON Tab */}
          <TabsContent value="raw" className="h-full">
            <JsonViewer data={session.sessions.sessionLog} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
