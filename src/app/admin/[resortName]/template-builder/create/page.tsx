"use client"

import dynamic from "next/dynamic"

/**
 * Email Template Builder - Create Mode Page
 * Route: /admin/[resortName]/template-builder/create
 *
 * Dynamically imports the TemplateBuilder component with SSR disabled
 * to prevent server-side rendering issues with email builder dependencies
 */
const TemplateBuilder = dynamic(
  () => import("@/features/email-template-builder/TemplateBuilder"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading template builder...</p>
        </div>
      </div>
    ),
  }
)

export default function CreateTemplate() {
  return <TemplateBuilder />
}
