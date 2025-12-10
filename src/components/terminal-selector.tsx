"use client"

import * as React from "react"
import { useResort } from "@/features/resorts"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiKeyErrorBoundary } from "@/components/api-key-error-boundary"

export function TerminalSelector() {
  const {
    cardReaders,
    cardReadersLoading,
    selectedCardReader,
    setSelectedCardReader,
    refreshCardReaders,
    cardReadersResponse,
  } = useResort()

  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshCardReaders()
    setIsRefreshing(false)
  }

  // Handle loading state
  if (cardReadersLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Loading terminals...
        </div>
        <Button variant="ghost" size="icon" disabled className="size-8">
          <RefreshCw className="size-4 animate-spin" />
        </Button>
      </div>
    )
  }

  // Handle API errors using the error boundary component
  if (cardReadersResponse && !cardReadersResponse.success) {
    return (
      <div className="flex flex-col gap-2">
        <ApiKeyErrorBoundary
          error={cardReadersResponse.error}
          errorType={cardReadersResponse.errorType}
          onRetry={handleRefresh}
          className="w-full"
          context="terminal_selector"
        />
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Terminal access unavailable
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="size-8"
            title="Retry connection"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
    )
  }

  // Handle empty card readers
  if (!cardReaders || cardReaders.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          No terminals available
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="size-8"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    )
  }

  // Normal state with card readers available
  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCardReader?.id}
        onValueChange={(id) => {
          const reader = cardReaders.find((r) => r.id === id)
          if (reader) setSelectedCardReader(reader)
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select terminal" />
        </SelectTrigger>
        <SelectContent>
          {cardReaders.map((reader) => (
            <SelectItem key={reader.id} value={reader.id}>
              {reader.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="size-8"
      >
        <RefreshCw
          className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  )
}
