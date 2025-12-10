import type { ConsumerCategory, Product } from "./types"

export const normalizeResortName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

export function getProductName(
    products: Product[] | undefined,
    productId: string
): {
    en: string
    de: string
    fr: string
    it: string
} {
    console.log("[getProductName] products:", products)
    const product = products?.find((p) => p.id === productId)
    return {
        en: product?.titleTranslations?.en || "",
        de: product?.titleTranslations?.de || "",
        fr: product?.titleTranslations?.fr || "",
        it: product?.titleTranslations?.it || "",
    }
}

export function getConsumerCategoryName(
    categories: ConsumerCategory[] | undefined,
    categoryId: string
): {
    en: string
    de: string
    fr: string
    it: string
} {
    const category = categories?.find((c) => c.id === categoryId)
    return {
        en: category?.titleTranslations?.en || "",
        de: category?.titleTranslations?.de || "",
        fr: category?.titleTranslations?.fr || "",
        it: category?.titleTranslations?.it || "",
    }
} 