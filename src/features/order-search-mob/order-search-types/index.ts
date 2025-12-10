import { type Order } from "@/db/schema"

export interface OrderSearchResult {
    success: boolean
    message: string
    data?: Order[]
}

export interface OrderSearchFormProps {
    onSearch: (results: Order[] , oldLifePassId : string) => void
    onError: (message: string) => void
    isSwap?: boolean
    showSearch?: boolean
}

export interface OrderSearchResultsProps {
    results: Order[]
    onOrderClick: (order: Order) => void
    /** Select an order and optionally a device ID (for URL state) */
    onSelectOrder: (order: Order, deviceId?: string) => void
    isSwap?: boolean
    /** Select a specific device/lifepass ID */
    onSelectLifePass : (oldPassId : string) => void
}