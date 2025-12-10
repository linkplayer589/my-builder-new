import * as React from "react"
import { CatalogsTable } from "@/features/catalogs-table"
import Header from "@/components/layouts/Header"

import { type SearchParams } from "@/types/index"

interface CatalogsPageProps {
  searchParams: Promise<SearchParams>
  params: Promise<{ resortName: string }>
}

/**
 * Catalogs page - displays catalog records for a resort
 * 
 * @description
 * Server component page that renders the catalogs table with all data fetching
 * handled internally by the CatalogsTable component. This page is a simple
 * wrapper providing layout and header.
 * 
 * @param props - Page props
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * @param props.params - Route parameters including resortName (must be awaited)
 * 
 * @returns Promise resolving to the catalogs page
 */
export default async function CatalogsPage({
  searchParams,
  params,
}: CatalogsPageProps) {
  const { resortName } = await params

  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              {
                label: "Catalogs",
                isLink: false,
                href: "/settings/catalogs",
              },
            ]}
          />
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <CatalogsTable 
            resortName={resortName}
            searchParams={searchParams}
          />
        </div>
      </div>
    </>
  )
}
