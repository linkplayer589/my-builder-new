import { toast } from "@/components/ui/use-toast"
import { ZodError } from "zod"

interface ErrorOptions {
  title?: string
  silent?: boolean
}

export function handleError(error: unknown, options: ErrorOptions = {}) {
  const { title = "Something went wrong", silent = false } = options

  // Log all errors in development
  if (process.env.NODE_ENV === "development") {
    console.error(error)
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const zodError = error.errors[0]
    if (!silent && zodError) {
      toast({
        title: "Validation Error",
        description: zodError.message,
        variant: "destructive",
      })
    }
    return {
      error: {
        type: "validation",
        message: zodError?.message || "Invalid input",
      },
    }
  }

  // Handle known error types
  if (error instanceof Error) {
    if (!silent) {
      toast({
        title,
        description: error.message,
        variant: "destructive",
      })
    }
    return {
      error: {
        type: "known",
        message: error.message,
      },
    }
  }

  // Handle unknown errors
  if (!silent) {
    toast({
      title,
      description: "An unexpected error occurred",
      variant: "destructive",
    })
  }
  return {
    error: {
      type: "unknown",
      message: "An unexpected error occurred",
    },
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.errors[0]?.message || "Invalid input"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}
