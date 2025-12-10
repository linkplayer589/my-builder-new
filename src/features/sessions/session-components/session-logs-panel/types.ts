export interface RequestData {
    method: string
    url: string
    headers: Record<string, string>
    body: unknown
}

export interface SessionLog {
    status: string
    createdAt: string
    requestObject: RequestData
    responseObject: Record<string, unknown>
    taskTracker: {
        tasks: TaskData[]
    }
}

export interface TaskData {
    id: string
    description: string
    status: string
    startTime: string
    endTime?: string
    duration?: number
    responseData?: Record<string, unknown>
    error?: {
        error: string
        stage: string
        details: Record<string, unknown>
    }
    parentId?: string
    children?: string[]
    level?: number
}
