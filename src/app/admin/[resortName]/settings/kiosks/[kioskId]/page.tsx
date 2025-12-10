import * as React from "react"
import { KioskDetailPage } from "@/features/kiosk-detail"
import { validateResortAccess } from "@/features/resorts/resort-utils"
import Header from "@/components/layouts/Header"

interface KioskDetailPageProps {
  params: Promise<{
    resortName: string
    kioskId: string
  }>
}

/**
 * Individual kiosk detail page route
 * Displays comprehensive kiosk information and slot management
 */
export default async function KioskDetail({ params }: KioskDetailPageProps) {
  const { resortName, kioskId } = await params

  // Validate resort access
  await validateResortAccess(resortName)

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full flex-col justify-between py-4 md:flex-row">
        <Header
          breadcrumbItems={[
            { label: "Kiosks", isLink: true, href: `/admin/${resortName}/settings/kiosks` },
            { label: kioskId, isLink: false, href: "#" },
          ]}
        />
      </div>

      <KioskDetailPage kioskId={kioskId} resortName={resortName} />
    </div>
  )
}

