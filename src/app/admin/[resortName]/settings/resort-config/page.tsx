import * as React from "react"
import { ResortConfigClient, getSalesChannelsByResortId } from "@/features/resort-config"
import { validateResortAccess } from "@/features/resorts/resort-utils"
import Header from "@/components/layouts/Header"

/**
 * Props for the Resort Configuration page
 */
interface ResortConfigPageProps {
    params: Promise<{ resortName: string }>
}

/**
 * Resort & Sales Channel Configuration Page
 *
 * @description
 * Server component page that allows admins to:
 * - View and stream Skidata pricing data
 * - Configure active products/categories per sales channel
 * - Test API endpoints (kiosk, cash desk, web)
 * - Manage catalog cache
 *
 * @param props - Component props containing route parameters
 * @returns Promise resolving to the page component
 */
export default async function ResortConfigPage({ params }: ResortConfigPageProps) {
    const { resortName } = await params

    // Fetch resort data using normalized name matching
    const resort = await validateResortAccess(resortName)

    // Fetch sales channels for the resort
    const salesChannels = await getSalesChannelsByResortId(resort.id)

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex w-full flex-col justify-between py-4 md:flex-row">
                <Header
                    breadcrumbItems={[
                        {
                            label: "Settings",
                            isLink: true,
                            href: `/${resortName}/settings`,
                        },
                        {
                            label: "Resort Configuration",
                            isLink: false,
                            href: `/${resortName}/settings/resort-config`,
                        },
                    ]}
                />
            </div>

            <div className="pb-8">
                <ResortConfigClient
                    resort={resort}
                    salesChannels={salesChannels}
                />
            </div>
        </div>
    )
}

/**
 * Page metadata
 */
export const metadata = {
    title: "Resort & Sales Channel Configuration",
    description: "Configure products, categories, and test API endpoints for sales channels",
}

