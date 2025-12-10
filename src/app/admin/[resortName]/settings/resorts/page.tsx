import * as React from "react"
import { validateResortAccess } from "@/features/resorts/resort-utils"
import Header from "@/components/layouts/Header"
import type { ResortsSearchParamsType } from "@/lib/resorts-params"
import { ResortsTable } from "@/features/resorts/resort-data-table/resort-table"

interface ResortsPageProps {
    params: Promise<{ resortName: string }>
    searchParams: Promise<ResortsSearchParamsType>
}

/**
 * Resorts page - displays resort records
 * 
 * @description
 * Server component page that renders the resorts table with all data fetching
 * handled internally by the ResortsTable component.
 */
export default async function ResortsPage({
    params,
    searchParams,
}: ResortsPageProps) {
    const resolvedParams = await params
    
    // Validate resort access
    await validateResortAccess(resolvedParams.resortName)

    return (
        <>
            {/* Full width wrapper for better table space utilization */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mb-4 flex w-full flex-col justify-between py-4 md:flex-row">
                    <Header
                        breadcrumbItems={[
                            { label: "Resorts", isLink: false, href: "/resorts" },
                        ]}
                    />
                </div>
                
                {/* Full width table container */}
                <div className="w-full">
                    <ResortsTable searchParams={searchParams} />
                </div>
            </div>
        </>
    )
}
