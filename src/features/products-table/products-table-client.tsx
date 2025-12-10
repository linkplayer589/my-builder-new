"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Product } from "@/db/schema"
import { revalidateProducts } from "@/db/server-actions/product-actions/revalidate-products"

import { useDataTable } from "@/components/data-table"
import { useIsMobile } from "@/hooks/use-mobile"
import { UniversalDataTableWrapper } from "@/components/data-table"
import { UniversalDataTable } from "@/components/data-table"

import { getProductsTableColumns } from "./products-table-columns"

interface ProductsTableProps {
  promises: Promise<
    [
      {
        data: Product[]
        pageCount: number
      },
    ]
  >
}

/**
 * Client-side products table component
 *
 * @description
 * Client component that renders the products table with interactive features
 */
export function ProductsTableClient({ promises }: ProductsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Product[]; pageCount: number },
  ]

  // Track previous search params to detect changes
  const prevSearchParamsRef = React.useRef<string | null>(null)

  // Trigger router refresh when URL params change (pagination, sorting, filtering)
  React.useEffect(() => {
    const currentParams = searchParams.toString()

    // Skip on initial mount
    if (prevSearchParamsRef.current === null) {
      prevSearchParamsRef.current = currentParams
      return
    }

    // If params changed, trigger refresh to fetch new data
    if (prevSearchParamsRef.current !== currentParams) {
      prevSearchParamsRef.current = currentParams
      router.refresh()
    }
  }, [searchParams, router])

  const columns = React.useMemo(() => {
    return getProductsTableColumns({
      isMobile,
    })
  }, [isMobile])

  // Setup the table using the data, columns, and filters
  const { table } = useDataTable<Product>({
    data,
    columns,
    pageCount: pageCount,
    filterFields: [],
    enableAdvancedFilter: true,
    initialState: {
      columnFilters: [],
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: true,
    clearOnDefault: false,
  })

  return (
    <UniversalDataTableWrapper
      table={table}
      columns={columns}
      onRevalidate={revalidateProducts}
      storageKey="productsLastRefreshed"
      exportFilename="products"
    >
      <UniversalDataTable table={table} />
    </UniversalDataTableWrapper>
  )
}

