import {
    type ConsumerCategory as DBConsumerCategory,
    type Product as DBProduct,
    type Resort,
} from "@/db/schema"

export interface Product extends DBProduct { }
export interface ConsumerCategory extends DBConsumerCategory { }

export interface CardReader {
    id: string
    label: string
}

export type CardReadersResponse =
    | {
        success: true
        data: CardReader[]
    }
    | {
        success: false
        error: string
        errorType: "validation" | "unknown" | "timeout" | "aborted" | "api_key_invalid"
    }

export interface ResortContextType {
    activeResort: Resort | null
    resort: Resort | null
    setActiveResort: (resort: Resort) => void
    resorts: Resort[]
    isLoading: boolean
    resortId: number
    normalizedResortName: string
    isValidResort: boolean
    products: Product[]
    categories: ConsumerCategory[]
    cardReaders: CardReader[]
    cardReadersLoading: boolean
    cardReadersResponse: CardReadersResponse | undefined
    selectedCardReader: CardReader | null
    setSelectedCardReader: (reader: CardReader | null) => void
    refreshCardReaders: () => Promise<void>
    getProductName: (productId: string) => {
        en: string
        de: string
        fr: string
        it: string
    }
    getConsumerCategoryName: (categoryId: string) => {
        en: string
        de: string
        fr: string
        it: string
    }
}

export const QUERY_KEYS = {
    RESORTS: ["resorts"],
    PRODUCTS: ["products"],
    CONSUMER_CATEGORIES: ["consumerCategories"],
    CARD_READERS: ["card-readers"],
} as const 