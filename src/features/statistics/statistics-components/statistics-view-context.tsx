"use client"

import * as React from "react"

import { type SalesChannelViewType } from "./sales-channel-view-selector"

interface StatisticsViewContextType {
  viewType: SalesChannelViewType
  setViewType: (type: SalesChannelViewType) => void
}

const StatisticsViewContext = React.createContext<
  StatisticsViewContextType | undefined
>(undefined)

export function StatisticsViewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [viewType, setViewType] =
    React.useState<SalesChannelViewType>("currency")

  return (
    <StatisticsViewContext.Provider value={{ viewType, setViewType }}>
      {children}
    </StatisticsViewContext.Provider>
  )
}

export function useStatisticsView() {
  const context = React.useContext(StatisticsViewContext)
  if (!context) {
    throw new Error(
      "useStatisticsView must be used within StatisticsViewProvider"
    )
  }
  return context
}
