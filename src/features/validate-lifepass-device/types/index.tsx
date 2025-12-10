export interface DeviceStatusResponse {
  success: boolean
  error: null | string
  data: {
    id: string
    connected: boolean
    lastConnected: string
    imei: string
    deviceCode: string
    dtaCode: string
    deviceAllocated: boolean
    battery: number
  }
}

export interface DeviceValidationResult {
  isValid: boolean
  criteria: {
    hasDeviceCode: boolean
    hasDtaCode: boolean
    isNotAllocated: boolean
    hasSufficientBattery: boolean
  }
  message?: string
}
