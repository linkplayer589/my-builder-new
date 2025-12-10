"use server"

/**
 * Gets the API URL and key for client-side SSE streaming
 *
 * @description
 * Returns the Hono API URL and key for establishing SSE connections
 * from the client. This is needed because environment variables
 * are not available on the client side.
 *
 * @returns Promise resolving to the API configuration
 */
export async function getStreamApiConfig(): Promise<{
    apiUrl: string
    apiKey: string
}> {
    return {
        apiUrl: process.env.HONO_API_URL ?? "",
        apiKey: process.env.HONO_API_KEY ?? "",
    }
}

