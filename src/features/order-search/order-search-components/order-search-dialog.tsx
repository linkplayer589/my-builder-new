"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import { useResort } from "@/features/resorts"

import { useToast } from "@/components/ui/use-toast"

import { OrderSearchForm } from "./order-search-form"
import { OrderSearchResults } from "./order-search-results"

export function OrderSearchDialog() {
  const { resort } = useResort()
  const [searchResults, setSearchResults] = React.useState<Order[]>([])
  const [showResults, setShowResults] = React.useState(false)
  const { toast } = useToast()

  const handleSearch = (results: Order[]) => {
    setSearchResults(results)
    setShowResults(true)
  }

  const handleError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  const handleOrderClick = (order: Order) => {
    window.location.href = `/admin/${resort?.name.toLowerCase()}/orders/${order.id}`
  }

  return (
    <div className="space-y-6">
      <OrderSearchForm onSearch={handleSearch} onError={handleError} />
      {showResults && (
        <OrderSearchResults
          results={searchResults}
          onOrderClick={handleOrderClick}
        />
      )}
    </div>
  )
}
