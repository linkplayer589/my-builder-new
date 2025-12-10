"use client"

import LifePassLogoBlue from "./branding-and-logos/lifepass-logo-blue"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div>
        <LifePassLogoBlue className="size-24 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      </div>
    </div>
  )
}
