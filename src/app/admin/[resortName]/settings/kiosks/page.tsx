import * as React from "react"
import { KiosksTable } from "@/features/kiosk-data-table/kiosk-data-table-components/kiosks-table"
import type { KioskSearchParamsType } from "@/lib/kiosks-params"
import Header from "@/components/layouts/Header"

interface KiosksPageProps {
    params: Promise<{ resortName: string }>
    searchParams: Promise<KioskSearchParamsType>
}

/**
 * Kiosks page - displays kiosk records for a resort
 * 
 * @description
 * Server component page that renders the kiosks table with all data fetching
 * handled internally by the KiosksTable component. This page is a simple
 * wrapper providing layout and header.
 */
export default async function KiosksPage({
    params,
    searchParams,
}: KiosksPageProps) {
    const { resortName } = await params

    return (
        <>
            {/* Full width wrapper for better table space utilization */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mb-4 flex w-full flex-col justify-between py-4 md:flex-row">
                    <Header
                        breadcrumbItems={[
                            { label: "Kiosks", isLink: false, href: "/kiosks" },
                        ]}
                    />
                </div>
                
                {/* Full width table container */}
                <div className="w-full">
                    <KiosksTable 
                        resortName={resortName}
                        searchParams={searchParams}
                    />
                </div>
            </div>
        </>
    )
}
