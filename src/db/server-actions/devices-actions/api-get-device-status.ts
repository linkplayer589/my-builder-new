"use server"

/**
 * Device status response type from Hono API
 */
export type DeviceStatusResponse = {
  success: boolean
  error: string | null
  data: {
    totalDevices: number
    successfulDevices: number
    failedDevices: number
    devices: Array<{
      deviceId: string
      success: boolean
      deviceStatus: {
        id: string
        connected: boolean
        lastConnected: string
        imei: string
        deviceCode: string
        dtaCode: string
        deviceAllocated: boolean
        battery: number
      } | null
      error?: string
    }>
  }
}

/**
 * Fetch device status from the Hono API
 * Returns device connection status, battery level, and allocation info
 */
export async function apiGetDeviceStatus(
  deviceId: string
): Promise<DeviceStatusResponse | null> {
  console.log("[API] Fetching Device Status...", { deviceId })

  try {
    const response = await fetch(
      "https://mtech-api.jordangigg.workers.dev/api/cash-desk/device-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "SkiDataTestKey123",
        },
        body: JSON.stringify({
          deviceId,
        }),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      console.error("Device status API request failed:", response.status)
      return null
    }

    const data = (await response.json()) as DeviceStatusResponse

    if (!data.success) {
      console.error("Device status API returned error:", data.error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to fetch device status:", error)
    return null
  }
}
