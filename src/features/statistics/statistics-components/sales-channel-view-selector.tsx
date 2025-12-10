"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useStatisticsView } from "./statistics-view-context"

export type SalesChannelViewType = "currency" | "orders" | "lifepasses" | "days"

export function SalesChannelViewSelector() {
  const { viewType, setViewType } = useStatisticsView()

  return (
    <Select value={viewType} onValueChange={setViewType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="currency">Revenue (EUR)</SelectItem>
        <SelectItem value="orders">Orders Count</SelectItem>
        <SelectItem value="lifepasses">Lifepasses</SelectItem>
        <SelectItem value="days">Day Count</SelectItem>
      </SelectContent>
    </Select>
  )
}
