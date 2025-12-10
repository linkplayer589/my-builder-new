import React, { useState } from "react"
import { Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchLifePassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (deviceId: string) => Promise<any>
}

export const SearchLifePassDialog: React.FC<SearchLifePassDialogProps> = ({
  open,
  onOpenChange,
  onSearch,
}) => {
  const [deviceId, setDeviceId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)

  const handleSearch = async () => {
    if (!deviceId.trim()) {
      return
    }

    setIsLoading(true)
    setSearchResult(null)

    try {
      const result = await onSearch(deviceId.trim())
      setSearchResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDeviceId("")
    setSearchResult(null)
    setIsLoading(false)
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find LifePass Location</DialogTitle>
          <DialogDescription>
            Enter the Device ID to locate the LifePass in kiosks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              placeholder="Enter Device ID..."
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="font-mono"
            />
          </div>

          {searchResult && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <h4 className="mb-2 font-semibold text-green-800">
                LifePass Found!
              </h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>
                  <strong>Kiosk:</strong> {searchResult.kioskName}
                </p>
                <p>
                  <strong>Slot Number:</strong> {searchResult.slotNumber}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {searchResult.kioskLocation?.label || "N/A"}
                </p>
                <p>
                  <strong>Battery:</strong> {searchResult.batteryCharge}%
                </p>
                <p>
                  <strong>Last Seen:</strong>{" "}
                  {new Date(searchResult.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSearch}
              disabled={!deviceId.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 size-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
