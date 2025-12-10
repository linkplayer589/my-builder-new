import * as React from "react"
import { DevicesTable } from "@/features/devices-table/devices-table"
import { type SearchParams } from "@/types/index"
import Header from "@/components/layouts/Header"

interface DevicesPageProps {
  searchParams: Promise<SearchParams>
}

/**
 * Devices page - displays device records
 * 
 * @description
 * Server component page that renders the devices table with all data fetching
 * handled internally by the DevicesTable component. This page is a simple
 * wrapper providing layout and header.
 */
export default async function DevicesPage({ searchParams }: DevicesPageProps) {
  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Devices", isLink: false, href: "/settings/devices" },
            ]}
          />
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <DevicesTable searchParams={searchParams} />
        </div>
      </div>
    </>
  )
}
