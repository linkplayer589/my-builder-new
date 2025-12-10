"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Resort } from "@/db/schema"
import { useQueryClient } from "@tanstack/react-query"

import { revalidateCardReadersCache } from "../resort-actions/api-get-card-readers/handler"
import { useResortQueries } from "../resort-hooks/useResortQueries"
import type { CardReader, ResortContextType } from "../types"
import { QUERY_KEYS } from "../types"
import { normalizeResortName } from "../utils"

const ResortContext = React.createContext<ResortContextType | undefined>(
  undefined
)

const ADMIN_PATH = "/admin"

function getProductName(
  products: ResortContextType["products"],
  productId: string
): {
  en: string
  de: string
  fr: string
  it: string
} {
  const product = products.find((p) => p.id === productId)
  return {
    en: product?.titleTranslations?.en || "",
    de: product?.titleTranslations?.de || "",
    fr: product?.titleTranslations?.fr || "",
    it: product?.titleTranslations?.it || "",
  }
}

function getConsumerCategoryName(
  categories: ResortContextType["categories"],
  categoryId: string
): {
  en: string
  de: string
  fr: string
  it: string
} {
  const category = categories.find((c) => c.id === categoryId)
  return {
    en: category?.titleTranslations?.en || "",
    de: category?.titleTranslations?.de || "",
    fr: category?.titleTranslations?.fr || "",
    it: category?.titleTranslations?.it || "",
  }
}

export function ResortProvider({
  children,
  initialResorts,
}: {
  children: React.ReactNode
  initialResorts?: Resort[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  // State
  const [activeResort, setActiveResortState] = React.useState<Resort | null>(
    null
  )
  const [selectedCardReader, setSelectedCardReader] =
    React.useState<CardReader | null>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [isManualSelection, setIsManualSelection] = React.useState(false)

  // Get resort from URL
  const getResortFromUrl = React.useCallback(
    (path: string, resortsList: Resort[]) => {
      if (!path.startsWith(ADMIN_PATH)) return null
      const pathSegments = path.split("/")
      if (pathSegments.length < 3) return null

      const urlResortName = pathSegments[2]
      return (
        resortsList.find(
          (r) => normalizeResortName(r.name) === urlResortName
        ) || null
      )
    },
    []
  )

  // Initialize resort based on URL or first available resort
  React.useEffect(() => {
    if (isInitialized || !initialResorts?.length || isManualSelection) return

    const urlResort = getResortFromUrl(pathname, initialResorts)

    if (pathname === ADMIN_PATH && initialResorts.length > 0) {
      // Only on the admin root, redirect to first resort if no manual selection is in progress
      const firstResort = initialResorts[0]
      if (firstResort) {
        setActiveResortState(firstResort)
        const normalizedName = normalizeResortName(firstResort.name)
        router.replace(`${ADMIN_PATH}/${normalizedName}/orders`)
      }
    } else if (urlResort) {
      // On resort-specific routes, set the active resort without redirecting
      setActiveResortState(urlResort)
    }

    setIsInitialized(true)
  }, [
    pathname,
    initialResorts,
    router,
    getResortFromUrl,
    isInitialized,
    isManualSelection,
  ])

  // Queries
  const {
    resorts,
    resortsLoading,
    products,
    productsLoading,
    categories,
    categoriesLoading,
    cardReadersResponse,
    cardReadersLoading,
    cardReadersRefetch,
  } = useResortQueries(activeResort, initialResorts)

  const setActiveResort = React.useCallback(
    (resort: Resort) => {
      console.log(
        "setActiveResort called:",
        resort.name,
        "current path:",
        pathname
      )
      if (resort.id === activeResort?.id) return
      setIsManualSelection(true)
      setActiveResortState(resort)

      const normalizedName = normalizeResortName(resort.name)

      // Preserve the current path structure, only change the resort name
      const pathSegments = pathname.split("/")
      if (pathSegments.length >= 3) {
        pathSegments[2] = normalizedName
        const newPath = pathSegments.join("/")
        console.log("Navigating to:", newPath)
        router.push(newPath)
      } else {
        // Fallback to orders if no resort segment exists
        console.log("Fallback navigation to orders")
        router.push(`${ADMIN_PATH}/${normalizedName}/orders`)
      }
    },
    [activeResort?.id, router, pathname]
  )

  // Set first card reader as selected when data loads
  React.useEffect(() => {
    if (
      cardReadersResponse?.success &&
      cardReadersResponse.data[0] &&
      !selectedCardReader
    ) {
      setSelectedCardReader(cardReadersResponse.data[0])
    }
  }, [cardReadersResponse, selectedCardReader])

  // Memoize the name getter functions to prevent unnecessary re-renders
  const memoizedGetProductName = React.useCallback(
    (productId: string) => getProductName(products, productId),
    [products]
  )

  const memoizedGetConsumerCategoryName = React.useCallback(
    (categoryId: string) => getConsumerCategoryName(categories, categoryId),
    [categories]
  )

  const value = React.useMemo(
    () => ({
      activeResort,
      resort: activeResort,
      setActiveResort,
      resorts,
      isLoading: Boolean(
        !isInitialized ||
          (resortsLoading && !resorts.length) ||
          (productsLoading && activeResort) ||
          (categoriesLoading && activeResort) ||
          (cardReadersLoading && activeResort)
      ),
      resortId: activeResort?.id ?? 0,
      normalizedResortName: activeResort
        ? normalizeResortName(activeResort.name)
        : "",
      isValidResort: !!activeResort,
      products,
      categories,
      cardReaders: cardReadersResponse?.success ? cardReadersResponse.data : [],
      cardReadersLoading,
      cardReadersResponse,
      selectedCardReader,
      setSelectedCardReader,
      getProductName: memoizedGetProductName,
      getConsumerCategoryName: memoizedGetConsumerCategoryName,
      refreshCardReaders: async () => {
        // Revalidate server-side cache first to ensure fresh API fetch
        await revalidateCardReadersCache()
        // Then invalidate and refetch React Query cache
        await queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.CARD_READERS, activeResort?.id],
        })
        // Force immediate refetch to bypass all caches
        await cardReadersRefetch()
      },
    }),
    [
      activeResort,
      queryClient,
      setActiveResort,
      resorts,
      resortsLoading,
      productsLoading,
      categoriesLoading,
      cardReadersLoading,
      products,
      categories,
      cardReadersResponse,
      selectedCardReader,
      memoizedGetProductName,
      memoizedGetConsumerCategoryName,
      isInitialized,
      cardReadersRefetch,
    ]
  )

  return (
    <ResortContext.Provider value={value}>{children}</ResortContext.Provider>
  )
}

export function useResort() {
  const context = React.useContext(ResortContext)
  if (context === undefined) {
    throw new Error("useResort must be used within a ResortProvider")
  }
  return context
}
