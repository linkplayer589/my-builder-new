import type { DeviceStatusResponse, DeviceValidationResult } from "../types"

export function formatDeviceStatusResponse(
  status: DeviceStatusResponse
): DeviceValidationResult {
  const criteria = {
    hasDeviceCode: Boolean(status.data.deviceCode),
    hasDtaCode: Boolean(status.data.dtaCode),
    isNotAllocated: !status.data.deviceAllocated,
    hasSufficientBattery: status.data.battery >= 70,
  }

  const isValid = Object.values(criteria).every(Boolean)

  let message
  if (!isValid) {
    const issues = []
    if (!criteria.hasDeviceCode) issues.push("missing device code")
    if (!criteria.hasDtaCode) issues.push("missing DTA code")
    if (!criteria.isNotAllocated) issues.push("device is already allocated")
    if (!criteria.hasSufficientBattery)
      issues.push(`battery level (${status.data.battery}%) is below 70%`)

    message = `Device is not suitable: ${issues.join(", ")}`
  }

  return {
    isValid,
    criteria,
    message,
  }
}
