import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { type TaskData } from "../types"
import { formatMillisecondsTimeDuration } from "../utils/format-milliseconds-time-duration"
import { TaskStatusIconSwitch } from "./task-status-icon-switch"

export function TaskTimeline({
  task,
  selectedTasks,
  onTaskSelection,
}: {
  task: TaskData
  selectedTasks: Set<string>
  onTaskSelection: (id: string) => void
}) {
  return (
    <div className="relative">
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TaskStatusIconSwitch status={task.status} />
            <h4 className="font-medium">{task.description}</h4>
            {task.duration !== undefined && (
              <Badge variant="outline" className="ml-2">
                {formatMillisecondsTimeDuration(task.duration)}
              </Badge>
            )}
          </div>
          <Checkbox
            checked={selectedTasks.has(task.id)}
            onCheckedChange={() => onTaskSelection(task.id)}
            id={`timeline-task-${task.id}`}
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>Started: {new Date(task.startTime).toLocaleString()}</div>
          {task.endTime && (
            <div>Completed: {new Date(task.endTime).toLocaleString()}</div>
          )}
        </div>
        {task.status === "failed" && task.error && (
          <div className="mt-2">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-red-500">
                View Error Details
              </summary>
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
            </details>
          </div>
        )}
        {task.responseData && (
          <div className="mt-2">
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Response Data
              </summary>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-2 text-xs">
                {JSON.stringify(task.responseData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
