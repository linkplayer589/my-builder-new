import { useQuery } from "@tanstack/react-query"
import { dbGetAllConsumerCategoriesByResortId } from "@/db/server-actions/consumer-categories-actions/db-get-all-consumer-categories-by-resort-id"
import { getCardReaders } from "@/features/resorts/resort-actions/api-get-card-readers/handler"
import { dbGetAllProductsByResortId } from "@/db/server-actions/product-actions/db-get-all-products-by-resort-id"
import { dbGetAllResorts } from "@/features/resorts/resort-actions/db-get-all-resorts"
import type { Resort } from "@/db/schema"
import { QUERY_KEYS } from "../types"
import type { CardReadersResponse, Product, ConsumerCategory } from "../types"

export function useResortQueries(activeResort: Resort | null, initialResorts?: Resort[]) {
    // Resort query with proper hydration
    const {
        data: resorts = [],
        isLoading: resortsLoading
    } = useQuery<Resort[]>({
        queryKey: QUERY_KEYS.RESORTS,
        queryFn: async () => {
            console.log("[ResortContext] Fetching resorts from DB...")
            return dbGetAllResorts()
        },
        initialData: initialResorts,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false,
    })

    // Products query
    const {
        data: products = [],
        isLoading: productsLoading
    } = useQuery<Product[]>({
        queryKey: [...QUERY_KEYS.PRODUCTS, activeResort?.id],
        queryFn: async () => {
            if (!activeResort?.id) return []
            console.log("[ResortContext] Fetching products for resort:", activeResort.id)
            return dbGetAllProductsByResortId(activeResort.id)
        },
        enabled: !!activeResort?.id,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    // Categories query
    const {
        data: categories = [],
        isLoading: categoriesLoading
    } = useQuery<ConsumerCategory[]>({
        queryKey: [...QUERY_KEYS.CONSUMER_CATEGORIES, activeResort?.id],
        queryFn: async () => {
            if (!activeResort?.id) return []
            console.log("[ResortContext] Fetching categories for resort:", activeResort.id)
            return dbGetAllConsumerCategoriesByResortId(activeResort.id)
        },
        enabled: !!activeResort?.id,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    // Card readers query
    const cardReadersQuery = useQuery<CardReadersResponse>({
        queryKey: [...QUERY_KEYS.CARD_READERS, activeResort?.id],
        queryFn: async () => {
            if (!activeResort?.id) return { success: true, data: [] }
            console.log("[ResortContext] Fetching card readers for resort:", activeResort.id)
            try {
                return await getCardReaders(activeResort.id)
            } catch (error) {
                console.error("Failed to fetch card readers:", error)
                return {
                    success: false,
                    error: "Failed to fetch card readers",
                    errorType: "timeout",
                }
            }
        },
        enabled: !!activeResort?.id,
        staleTime: 0, // Always consider stale to allow refetching
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 2,
        retryDelay: 1000,
    })

    return {
        resorts,
        resortsLoading,
        products,
        productsLoading,
        categories,
        categoriesLoading,
        cardReadersResponse: cardReadersQuery.data,
        cardReadersLoading: cardReadersQuery.isLoading,
        cardReadersRefetch: cardReadersQuery.refetch,
    }
}