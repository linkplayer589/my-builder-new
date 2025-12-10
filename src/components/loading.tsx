import React from "react"

import LifePassLogoBlue from "@/components/branding-and-logos/lifepass-logo-blue"

type Props = {}

export default function Loading({}: Props) {
  return (
    <div className="flex size-full items-center justify-center">
      <LifePassLogoBlue className="animate-pulse" />
    </div>
  )
}
