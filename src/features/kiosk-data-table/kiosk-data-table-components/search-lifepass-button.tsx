import React from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { Button } from "@/components/ui/button"

import { SearchLifePassDialog } from "./search-lifepass-modal"

const SearchLifePassButton: React.FC = () => {
  const { isMobile } = useRowExpansionAndMobile()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Abort any ongoing request when modal closes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const handleSearchLifePass = async (deviceId: string) => {
    const TIMEOUT_DURATION = 30000 // 30 seconds

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    const timeoutController = new AbortController()

    try {
      console.log(`[API] Searching LifePass for device: ${deviceId}`)

      // Set timeout
      const timeoutId = setTimeout(
        () => timeoutController.abort(),
        TIMEOUT_DURATION
      )

      // Combine signals
      const combinedSignal = combineAbortSignals([
        abortControllerRef.current.signal,
        timeoutController.signal,
      ])

      // Get API configuration from environment
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_HONO_API_URL || "http://localhost:8787"
      const apiKey = process.env.NEXT_PUBLIC_HONO_API_KEY

      if (!apiKey) {
        console.error("[API] Missing HONO_API_KEY environment variable")
        toast.error("API configuration error")
        return null
      }

      const response = await fetch(`${apiBaseUrl}/api/kiosk/search-lifepass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ deviceId }),
        signal: combinedSignal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("LifePass not found")
          return null
        }

        if (response.status === 401 || response.status === 403) {
          toast.error("Invalid API key")
          return null
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success(
          `LifePass found at Kiosk: ${result.data.kioskName}, Slot: ${result.data.slotNumber}`
        )
        return result.data
      } else {
        toast.error(result.message || "LifePass not found")
        return null
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          if (abortControllerRef.current?.signal.aborted) {
            console.log("[API] LifePass search request aborted by user")
            // Don't show toast for user-initiated abort
            return null
          }
          console.log("[API] LifePass search request timed out")
          toast.error("Search request timed out")
          return null
        }

        console.error("[API] Failed to search for LifePass:", error)
        toast.error("Failed to search for LifePass")
        return null
      }

      console.error("[API] Unknown error searching for LifePass:", error)
      toast.error("An unknown error occurred")
      return null
    } finally {
      // Clean up
      if (abortControllerRef.current) {
        abortControllerRef.current = null
      }
    }
  }

  /**
   * Combines multiple AbortSignals into one
   * Used to handle both user cancellation and timeout
   */
  const combineAbortSignals = (signals: AbortSignal[]): AbortSignal => {
    const controller = new AbortController()

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        return controller.signal
      }

      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      })
    }

    return controller.signal
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className={`${isMobile ? "mb-3 w-full" : ""}`}
      >
        <Search className="mr-2 size-4" aria-hidden="true" />
        Find LifePass
      </Button>
      <SearchLifePassDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSearch={handleSearchLifePass}
      />
    </>
  )
}

export default SearchLifePassButton
