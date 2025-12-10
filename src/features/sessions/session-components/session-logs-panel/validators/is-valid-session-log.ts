import { type SessionLog } from "../types"

export function isValidSessionLog(log: unknown): log is SessionLog {
    if (!log || typeof log !== "object") return false
    const l = log as Partial<SessionLog>
    return (
        "status" in l &&
        "createdAt" in l &&
        "taskTracker" in l &&
        l.taskTracker !== undefined &&
        typeof l.taskTracker === "object" &&
        "tasks" in l.taskTracker &&
        Array.isArray(l.taskTracker.tasks)
    )
}
