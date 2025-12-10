import { useMemo } from "react"
import { AlertTriangle, CheckCircle2, Clock, X, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { type SessionLog } from "../types"
import { formatMillisecondsTimeDuration } from "../utils/format-milliseconds-time-duration"

export function SessionSummary({
  sessionLog,
  onHide,
}: {
  sessionLog: SessionLog
  onHide: () => void
}) {
  // Calculate session duration (from first task start to last task end)
  const sessionDuration = useMemo(() => {
    if (!sessionLog.taskTracker.tasks.length) return 0

    // Find earliest start time and latest end time
    let earliestStart: number | null = null
    let latestEnd: number | null = null

    sessionLog.taskTracker.tasks.forEach((task) => {
      const startTime = new Date(task.startTime).getTime()

      if (earliestStart === null || startTime < earliestStart) {
        earliestStart = startTime
      }

      if (task.endTime) {
        const endTime = new Date(task.endTime).getTime()
        if (latestEnd === null || endTime > latestEnd) {
          latestEnd = endTime
        }
      }
    })

    // If we have both start and end times, calculate duration
    if (earliestStart !== null && latestEnd !== null) {
      return latestEnd - earliestStart
    }

    return 0
  }, [sessionLog.taskTracker.tasks])

  // Calculate cumulative duration (sum of all task durations)
  const cumulativeDuration = useMemo(() => {
    return sessionLog.taskTracker.tasks.reduce(
      (total, task) => total + (task.duration || 0),
      0
    )
  }, [sessionLog.taskTracker.tasks])

  // Count tasks by status
  const taskCounts = useMemo(() => {
    const counts = {
      completed: 0,
      failed: 0,
      warning: 0,
      pending: 0,
      in_progress: 0,
    }

    sessionLog.taskTracker.tasks.forEach((task) => {
      const status = task.status as keyof typeof counts
      if (status in counts) {
        counts[status]++
      }
    })

    return counts
  }, [sessionLog.taskTracker.tasks])

  return (
    <div className="relative rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Session Summary</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHide}
          className="size-6 p-0"
          aria-label="Hide summary"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          Status: <Badge>{sessionLog.status}</Badge>
        </div>
        <div>Created: {new Date(sessionLog.createdAt).toLocaleString()}</div>
        <div>
          Session Duration:{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline">
                  {formatMillisecondsTimeDuration(sessionDuration)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time from first task start to last task end</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          Cumulative Duration:{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline">
                  {formatMillisecondsTimeDuration(cumulativeDuration)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sum of all task durations (includes overlapping time)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>Tasks: {sessionLog.taskTracker.tasks.length}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="mr-1 size-3" /> {taskCounts.completed}{" "}
          completed
        </Badge>
        {taskCounts.failed > 0 && (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-950">
            <XCircle className="mr-1 size-3" /> {taskCounts.failed} failed
          </Badge>
        )}
        {taskCounts.warning > 0 && (
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="mr-1 size-3" /> {taskCounts.warning}{" "}
            warnings
          </Badge>
        )}
        {taskCounts.pending + taskCounts.in_progress > 0 && (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
            <Clock className="mr-1 size-3" />{" "}
            {taskCounts.pending + taskCounts.in_progress} in progress
          </Badge>
        )}
      </div>
    </div>
  )
}
