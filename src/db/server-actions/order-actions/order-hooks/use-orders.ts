import { useQuery } from "@tanstack/react-query"
import { type Order as _Order } from "@/db/schema"
import { dbGetOrders } from "@/db/server-actions/order-actions/db-get-orders"
import { type SearchParamsType } from "@/lib/search-params"

interface UseOrdersOptions {
    resortId: number
    page?: number
    perPage?: number
    sort?: SearchParamsType["sort"]
    status?: SearchParamsType["status"]
    filters?: SearchParamsType["filters"]
    joinOperator?: SearchParamsType["joinOperator"]
    flags?: SearchParamsType["flags"]
}

export function useOrders({
    resortId,
    page = 1,
    perPage = 25,
    sort = [{ id: "createdAt", desc: true }],
    status = [],
    filters = [],
    joinOperator = "and",
    flags = []
}: UseOrdersOptions) {
    return useQuery({
        queryKey: ["orders", { resortId, page, perPage, sort, status, filters, joinOperator, flags }],
        queryFn: async () => {
            try {
                const response = await dbGetOrders({
                    resortId,
                    page,
                    perPage,
                    sort,
                    status,
                    filters,
                    joinOperator,
                    flags
                })
                return response
            } catch (error) {
                console.error("Error fetching orders:", error)
                throw error
            }
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
} 