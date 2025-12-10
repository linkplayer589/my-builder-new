import { type JSONValue } from "hono/utils/types";

// Standard error response interface
export interface ErrorResponse {
    error: string;
    stage: string;
    details?: unknown;
}

// logging-types.ts
export interface SessionLog {
    sessionId: number;
    createdAt: string;
    lastActivityAt: string;
    status: string;
    actions: Action[];
    requestObject?: RequestObject;
    responseObject?: JSONValue;
    taskTracker: TaskTracker;
    orderId?: number;
    [key: string]: unknown;
}

// Add a new interface for the serialized version
export interface SerializedSessionLog {
    sessionId: number;
    createdAt: string;
    lastActivityAt: string;
    status: string;
    actions: Action[];
    requestObject?: RequestObject;
    responseObject?: JSONValue;
    taskTracker: {
        tasks: TaskProgress[];
    };
    orderId?: number;
    [key: string]: unknown;
}

export type RequestObject = {
    method: string;
    url: string;
    headers: JSONValue;
    body: JSONValue;
};

export interface TaskProgress {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'warning';
    startTime?: string;
    endTime?: string;
    error?: ErrorResponse;
    responseData?: unknown;
    parentId?: string; // Reference to parent task
    children?: string[]; // References to child tasks
    duration?: number; // Duration in milliseconds
    level?: number; // Nesting level for visualization
}

export interface Action {
    timestamp: string;
    type: 'info' | 'error' | 'progress';
    description: string;
    tasks?: TaskProgress[];
    context?: unknown;
}

export class TaskTracker {
    private tasks: TaskProgress[];
    private sessionId: number;
    private taskRelationships: Map<string, string[]>; // Map of parent task ID to child task IDs
    private currentTaskStack: string[]; // Stack to track currently in-progress tasks
    private taskMap: Map<string, TaskProgress>; // Map for quick task lookup by ID

    constructor(sessionLog: SessionLog) {
        this.tasks = [];
        this.sessionId = sessionLog.sessionId;
        this.taskRelationships = new Map();
        this.currentTaskStack = []; // Initialize empty stack
        this.taskMap = new Map(); // Initialize task map
    }

    startTask(taskId: string, description: string, parentId?: string) {
        // If no parent ID is provided, try to find the most recent in-progress task
        if (!parentId && this.currentTaskStack.length > 0) {
            // Use the most recent in-progress task as parent
            parentId = this.currentTaskStack[this.currentTaskStack.length - 1];
        }

        const task: TaskProgress = {
            id: taskId,
            description,
            status: 'in_progress',
            startTime: new Date().toISOString(),
            parentId,
            children: []
        };

        // Add task to the map for quick lookup
        this.taskMap.set(taskId, task);

        // If this task has a parent, add it to the parent's children
        if (parentId) {
            const parentTask = this.taskMap.get(parentId);
            if (parentTask) {
                if (!parentTask.children) {
                    parentTask.children = [];
                }
                parentTask.children.push(taskId);
            }

            // Add to relationships map
            if (!this.taskRelationships.has(parentId)) {
                this.taskRelationships.set(parentId, []);
            }
            this.taskRelationships.get(parentId)!.push(taskId);
        }

        // Add this task to the current task stack
        this.currentTaskStack.push(taskId);
        this.tasks.push(task);
        return task;
    }

    completeTask(taskId: string, responseData?: unknown) {
        const task = this.taskMap.get(taskId);
        if (task) {
            task.status = 'completed';
            task.endTime = new Date().toISOString();
            task.responseData = responseData;

            // Calculate duration
            if (task.startTime && task.endTime) {
                const start = new Date(task.startTime).getTime();
                const end = new Date(task.endTime).getTime();
                task.duration = end - start;
            }

            // Remove this task from the current task stack
            const index = this.currentTaskStack.indexOf(taskId);
            if (index !== -1) {
                this.currentTaskStack.splice(index, 1);
            }
        }
        return task;
    }

    failTask(taskId: string, error: string | ErrorResponse) {
        const task = this.taskMap.get(taskId);
        if (task) {
            task.status = 'failed';
            task.endTime = new Date().toISOString();

            // Calculate duration
            if (task.startTime && task.endTime) {
                const start = new Date(task.startTime).getTime();
                const end = new Date(task.endTime).getTime();
                task.duration = end - start;
            }

            // Convert string errors to ErrorResponse format
            if (typeof error === 'string') {
                task.error = {
                    error: error,
                    stage: task.id,
                    details: {
                        timestamp: new Date().toISOString()
                    }
                };
            } else {
                task.error = error;
            }

            // Remove this task from the current task stack
            const index = this.currentTaskStack.indexOf(taskId);
            if (index !== -1) {
                this.currentTaskStack.splice(index, 1);
            }
        }
        return task;
    }

    warnTask(taskId: string, warning: string | ErrorResponse) {
        const task = this.taskMap.get(taskId);
        if (task) {
            task.status = 'warning';
            task.endTime = new Date().toISOString();

            // Calculate duration
            if (task.startTime && task.endTime) {
                const start = new Date(task.startTime).getTime();
                const end = new Date(task.endTime).getTime();
                task.duration = end - start;
            }

            // Convert string warnings to ErrorResponse format
            if (typeof warning === 'string') {
                task.error = {
                    error: warning,
                    stage: task.id,
                    details: {
                        timestamp: new Date().toISOString()
                    }
                };
            } else {
                task.error = warning;
            }

            // Remove this task from the current task stack
            const index = this.currentTaskStack.indexOf(taskId);
            if (index !== -1) {
                this.currentTaskStack.splice(index, 1);
            }
        }
        return task;
    }

    getAllTasks(): TaskProgress[] {
        return [...this.tasks];
    }

    getTaskById(taskId: string): TaskProgress | undefined {
        return this.taskMap.get(taskId);
    }

    getCurrentTask(): TaskProgress | null {
        // Get the most recent task that is in progress
        if (this.currentTaskStack.length > 0) {
            const currentTaskId = this.currentTaskStack[this.currentTaskStack.length - 1];
            if (currentTaskId) {
                return this.taskMap.get(currentTaskId) || null;
            }
        }
        return null;
    }

    // Get tasks organized in a hierarchical structure
    getTaskHierarchy(): TaskProgress[] {
        // First, calculate the level for each task
        this.calculateTaskLevels();

        // Return root tasks (those without parents)
        return this.tasks.filter(task => !task.parentId);
    }

    // Calculate the nesting level for each task
    private calculateTaskLevels() {
        // First, identify root tasks and set their level to 0
        const rootTasks = this.tasks.filter(task => !task.parentId);
        rootTasks.forEach(task => {
            task.level = 0;
        });

        // Then, traverse the tree to set levels for all tasks
        const setLevelForChildren = (parentId: string, parentLevel: number) => {
            const childIds = this.taskRelationships.get(parentId) || [];
            childIds.forEach(childId => {
                const childTask = this.taskMap.get(childId);
                if (childTask) {
                    childTask.level = parentLevel + 1;
                    setLevelForChildren(childId, parentLevel + 1);
                }
            });
        };

        rootTasks.forEach(task => {
            setLevelForChildren(task.id, 0);
        });
    }

    // Get a flat list of tasks with their hierarchy information
    getFlatTasksWithHierarchy(): TaskProgress[] {
        this.calculateTaskLevels();
        return this.tasks;
    }

    // Get tasks filtered by status
    getTasksByStatus(status: TaskProgress['status']): TaskProgress[] {
        return this.tasks.filter(task => task.status === status);
    }

    // Get tasks that match a search term
    searchTasks(term: string): TaskProgress[] {
        const lowerTerm = term.toLowerCase();
        return this.tasks.filter(task =>
            task.description.toLowerCase().includes(lowerTerm) ||
            task.id.toLowerCase().includes(lowerTerm) ||
            (task.error?.error && task.error.error.toLowerCase().includes(lowerTerm))
        );
    }

    // Get the total duration of all tasks
    getTotalDuration(): number {
        return this.tasks.reduce((total, task) => total + (task.duration || 0), 0);
    }

    // Get the critical path (longest sequence of dependent tasks)
    getCriticalPath(): TaskProgress[] {
        // Implementation would find the longest path through the task graph
        // This is a placeholder for a more complex implementation
        return [];
    }

    // New method to get a serializable version of the tracker
    toJSON() {
        // Calculate levels before serializing
        this.calculateTaskLevels();
        return {
            tasks: this.getAllTasks()
        };
    }
}