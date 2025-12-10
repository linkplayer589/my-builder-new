import * as React from "react"
import { SalesChannelsTable } from "@/features/sales-channels/products-components/sales-channels-table/sales-channels-table"
import type { SalesChannelsSearchParamsType } from "@/lib/sales-channels-params"
import Header from "@/components/layouts/Header"

interface SalesChannelsPageProps {
  searchParams: Promise<SalesChannelsSearchParamsType>
  params: Promise<{ resortName: string }>
}

/**
 * Sales Channels page - displays sales channel records for a resort
 * 
 * @description
 * Server component page that renders the sales channels table with all data fetching
 * handled internally by the SalesChannelsTable component.
 */
export default async function SalesChannelsPage({
  searchParams,
  params,
}: SalesChannelsPageProps) {
  const { resortName } = await params

  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              {
                label: "Sales Channels",
                isLink: false,
                href: "/settings/sales-channels",
              },
            ]}
          />
        </div>
 
        {/* Full width table container */}
        <div className="w-full">
          <SalesChannelsTable 
            resortName={resortName}
            searchParams={searchParams}
          />
        </div>
      </div>
    </>
  )
}
