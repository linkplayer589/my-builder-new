import * as React from "react"
import { ProductsTable } from "@/features/products-table/products-table"
import { type SearchParams } from "@/types/index"
import Header from "@/components/layouts/Header"

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}

/**
 * Products page - displays product records for a resort
 * 
 * @description
 * Server component page that renders the products table with all data fetching
 * handled internally by the ProductsTable component.
 */
export default async function ProductsPage({
  searchParams,
  params,
}: ProductsPageProps) {
  const { resortName } = await params

  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Products", isLink: false, href: "/settings/products" },
            ]}
          />
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <ProductsTable 
            resortName={resortName}
            searchParams={searchParams}
          />
        </div>
      </div>
    </>
  )
}
