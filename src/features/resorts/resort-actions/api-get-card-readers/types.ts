export type CardReader = {
    id: string
    label: string
    status: string
    isRegistered: boolean
}

export type CardReadersResponse = {
    success: true
    data: CardReader[]
    metadata: {
        total: number
        locations: string[]
    }
}

export type GetCardReadersError = {
    success: false
    error: string
    errorType: "validation" | "unknown" | "timeout" | "aborted" | "api_key_invalid"
} 