import { useMemo } from "react"

import { type TaskData } from "../types"
import { Task } from "./task"

export function VirtualizedTaskList({
  tasks,
  selectedTasks,
  onTaskSelection,
  searchTerm,
  statusFilter,
}: {
  tasks: TaskData[]
  selectedTasks: Set<string>
  onTaskSelection: (id: string) => void
  searchTerm: string
  statusFilter: string
}) {
  // Only render root tasks initially
  const rootTasks = useMemo(() => {
    // First filter all tasks by status and search term
    const filteredTasks = tasks.filter((task) => {
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

    // Then get root tasks from the filtered set
    // We need to consider a task as a root if:
    // 1. It has no parent, or
    // 2. Its parent is not in the filtered set
    return filteredTasks.filter((task) => {
      if (!task.parentId) return true

      // Check if any parent task exists in the filtered set
      return !filteredTasks.some((t) => t.id === task.parentId)
    })
  }, [tasks, searchTerm, statusFilter])

  if (rootTasks.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border bg-muted p-4">
        <p className="text-center text-muted-foreground">
          No tasks match the current filters
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {rootTasks.map((task, index) => (
        <Task
          key={`${task.id}-${index}`}
          task={task}
          tasks={tasks}
          selectedTasks={selectedTasks}
          onTaskSelection={onTaskSelection}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      ))}
    </div>
  )
}
