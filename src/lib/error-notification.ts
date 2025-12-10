import { useEffect } from "react"

export interface CustomError extends Error {
    status?: number
}

export const errorNotification = (
    isError: boolean,
    title: string,
    error: CustomError | null = null
) => {
    if (isError && error) {
        console.error(`${error.status}: ${title}`, error.message)
        // TODO: Implement toast system
    }
}

export const useErrorNotification = (
    isError: boolean,
    title: string,
    error: CustomError | null = null
) => {
    useEffect(() => {
        errorNotification(isError, title, error)
    }, [isError, title, error])
} 