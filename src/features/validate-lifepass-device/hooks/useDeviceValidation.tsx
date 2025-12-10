import { useCallback, useEffect, useState } from "react"

import { checkDeviceStatus } from "../actions/check-device-status"
import { formatDeviceStatusResponse } from "../functions/format-device-status-response"
import { type DeviceValidationResult } from "../types"

export function useDeviceValidation(deviceId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] =
    useState<DeviceValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateDevice = useCallback(async () => {
    if (!deviceId || deviceId.length < 3) {
      setValidationResult(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await checkDeviceStatus(deviceId)

      if (!result.success) {
        setError(
          result.error instanceof Error
            ? result.error.message
            : "Failed to validate device"
        )
        setValidationResult(null)
        return
      }

      const validation = formatDeviceStatusResponse(result.data)
      setValidationResult(validation)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
      setValidationResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    const timeoutId = setTimeout(() => void validateDevice(), 500) // 500ms debounce
    return () => clearTimeout(timeoutId)
  }, [validateDevice])

  return {
    isLoading,
    validationResult,
    error,
  }
}
