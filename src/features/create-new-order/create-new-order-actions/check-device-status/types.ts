/**
 * Device status data returned from the API
 */
export interface DeviceStatusData {
    id: string
    connected: boolean
    lastConnected: string
    imei: string
    deviceCode: string
    dtaCode: string
    deviceAllocated: boolean
    battery: number
}

/**
 * Single device result in the response
 */
export interface DeviceResult {
    deviceId: string
    success: boolean
    deviceStatus: DeviceStatusData
    error?: string
}

/**
 * API response structure for device status
 */
export interface DeviceStatusResponse {
    success: boolean
    error: null | string
    data: {
        totalDevices: number
        successfulDevices: number
        failedDevices: number
        devices: DeviceResult[]
    }
}

/**
 * Severity levels for validation criteria
 */
export type ValidationSeverity = "error" | "warning" | "info" | "success"

/**
 * Individual validation criterion with severity
 */
export interface ValidationCriterion {
    passed: boolean
    severity: ValidationSeverity
    label: string
    value: string | number | boolean
    message: string
}

export interface DeviceValidationResult {
    isValid: boolean
    hasWarnings: boolean
    hasErrors: boolean
    deviceData: DeviceStatusData
    criteria: {
        hasDeviceCode: ValidationCriterion
        hasDtaCode: ValidationCriterion
        isNotAllocated: ValidationCriterion
        hasSufficientBattery: ValidationCriterion
        isConnected: ValidationCriterion
        hasRecentConnection: ValidationCriterion
    }
    summary: {
        errors: string[]
        warnings: string[]
    }
}

/**
 * Calculate time difference in human readable format
 */
function getTimeSinceLastConnection(lastConnected: string): {
    text: string
    isRecent: boolean
    minutesAgo: number
} {
    const lastConnectedDate = new Date(lastConnected)
    const now = new Date()
    const diffMs = now.getTime() - lastConnectedDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let text: string
    if (diffMins < 1) {
        text = "Just now"
    } else if (diffMins < 60) {
        text = `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
        text = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
        text = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }

    // Consider "recent" if within the last 30 minutes
    const isRecent = diffMins <= 30

    return { text, isRecent, minutesAgo: diffMins }
}

/**
 * Get battery status with severity
 */
function getBatteryStatus(battery: number): {
    severity: ValidationSeverity
    message: string
} {
    if (battery >= 70) {
        return { severity: "success", message: "Good battery level" }
    } else if (battery >= 50) {
        return { severity: "warning", message: "Battery is moderate, consider charging" }
    } else if (battery >= 20) {
        return { severity: "warning", message: "Battery is low, charging recommended" }
    } else {
        return { severity: "error", message: "Battery is critically low" }
    }
}

export function validateDeviceStatus(
    status: DeviceStatusResponse
): DeviceValidationResult {
    // Extract device data from nested structure
    const firstDevice = status.data.devices[0]
    if (!firstDevice || !firstDevice.deviceStatus) {
        // Return an error result if no device data
        return {
            isValid: false,
            hasWarnings: false,
            hasErrors: true,
            deviceData: {
                id: "",
                connected: false,
                lastConnected: "",
                imei: "",
                deviceCode: "",
                dtaCode: "",
                deviceAllocated: false,
                battery: 0,
            },
            criteria: {
                hasDeviceCode: {
                    passed: false,
                    severity: "error",
                    label: "Device Code",
                    value: "Missing",
                    message: "No device data returned from API",
                },
                hasDtaCode: {
                    passed: false,
                    severity: "error",
                    label: "DTA Code",
                    value: "Missing",
                    message: "No device data returned from API",
                },
                isNotAllocated: {
                    passed: false,
                    severity: "error",
                    label: "Availability",
                    value: "Unknown",
                    message: "Cannot determine availability",
                },
                hasSufficientBattery: {
                    passed: false,
                    severity: "error",
                    label: "Battery",
                    value: "Unknown",
                    message: "Cannot determine battery level",
                },
                isConnected: {
                    passed: false,
                    severity: "error",
                    label: "Connection",
                    value: "Unknown",
                    message: "Cannot determine connection status",
                },
                hasRecentConnection: {
                    passed: false,
                    severity: "error",
                    label: "Last Seen",
                    value: "Unknown",
                    message: "Cannot determine last connection",
                },
            },
            summary: {
                errors: ["No device data returned from API"],
                warnings: [],
            },
        }
    }

    const data = firstDevice.deviceStatus
    const lastConnectionInfo = getTimeSinceLastConnection(data.lastConnected)
    const batteryStatus = getBatteryStatus(data.battery)

    const criteria = {
        hasDeviceCode: {
            passed: Boolean(data.deviceCode),
            severity: data.deviceCode ? "success" : "error",
            label: "Device Code",
            value: data.deviceCode || "Missing",
            message: data.deviceCode ? `Device code: ${data.deviceCode}` : "Device code is missing",
        } as ValidationCriterion,

        hasDtaCode: {
            passed: Boolean(data.dtaCode),
            severity: data.dtaCode ? "success" : "error",
            label: "DTA Code",
            value: data.dtaCode || "Missing",
            message: data.dtaCode ? "DTA code present" : "DTA code is missing - device may not work at turnstiles",
        } as ValidationCriterion,

        isNotAllocated: {
            passed: !data.deviceAllocated,
            severity: data.deviceAllocated ? "error" : "success",
            label: "Availability",
            value: data.deviceAllocated ? "Allocated" : "Available",
            message: data.deviceAllocated
                ? "Device is already allocated to another order"
                : "Device is available for use",
        } as ValidationCriterion,

        hasSufficientBattery: {
            passed: data.battery >= 70,
            severity: batteryStatus.severity,
            label: "Battery",
            value: `${data.battery}%`,
            message: batteryStatus.message,
        } as ValidationCriterion,

        isConnected: {
            passed: data.connected,
            severity: data.connected ? "success" : "warning",
            label: "Connection",
            value: data.connected ? "Connected" : "Disconnected",
            message: data.connected
                ? "Device is currently connected"
                : "Device is offline - may have connectivity issues",
        } as ValidationCriterion,

        hasRecentConnection: {
            passed: lastConnectionInfo.isRecent,
            severity: lastConnectionInfo.isRecent ? "success" : (lastConnectionInfo.minutesAgo > 60 ? "warning" : "info"),
            label: "Last Seen",
            value: lastConnectionInfo.text,
            message: lastConnectionInfo.isRecent
                ? `Last connected ${lastConnectionInfo.text}`
                : `Device was last seen ${lastConnectionInfo.text}`,
        } as ValidationCriterion,
    }

    // Collect errors and warnings
    const errors: string[] = []
    const warnings: string[] = []

    Object.values(criteria).forEach((criterion) => {
        if (!criterion.passed) {
            if (criterion.severity === "error") {
                errors.push(criterion.message)
            } else if (criterion.severity === "warning") {
                warnings.push(criterion.message)
            }
        }
    })

    // Core validation (errors block the order)
    const hasErrors = errors.length > 0
    const hasWarnings = warnings.length > 0

    // isValid means no blocking errors (warnings are allowed)
    const isValid = !criteria.hasDeviceCode.passed === false &&
        !criteria.hasDtaCode.passed === false &&
        criteria.isNotAllocated.passed &&
        criteria.hasSufficientBattery.passed

    return {
        isValid,
        hasWarnings,
        hasErrors,
        deviceData: data,
        criteria,
        summary: {
            errors,
            warnings,
        },
    }
}