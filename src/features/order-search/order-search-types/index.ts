import { type Order } from "@/db/schema"

export interface OrderSearchResult {
    success: boolean
    message: string
    data?: Order[]
}

export interface OrderSearchFormProps {
    onSearch: (results: Order[]) => void
    onError: (message: string) => void
}

export interface OrderSearchResultsProps {
    results: Order[]
    onOrderClick: (order: Order) => void
} 