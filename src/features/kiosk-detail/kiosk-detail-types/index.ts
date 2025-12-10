/**
 * Type definitions for Kiosk Detail feature
 * Defines all interfaces for kiosk information, slots, batteries, and API responses
 */

/**
 * Price strategy configuration for the kiosk
 */
export interface KioskPriceStrategy {
  depositAmount: number
  priceMinute: number
  autoRefund: number
  timeoutAmount: number
  timeoutDay: number
  dailyMaxPrice: number
  freeMinutes: number
  currencySymbol: string
  price: number
  name: string
  currency: string
  shopId: string
}

/**
 * Shop information associated with the kiosk
 */
export interface KioskShop {
  address: string
  priceMinute: string
  city: string
  dailyMaxPrice: number
  latitude: string
  openingTime: string
  freeMinutes: number
  icon: string
  content: string
  province: string
  price: number
  name: string
  deposit: number
  logo: string
  id: string
  region: string
  longitude: string
}

/**
 * Battery information for a single battery in the kiosk
 */
export interface KioskBattery {
  slotNum: number
  vol: number
  batteryId: string
}

/**
 * Cabinet/Kiosk hardware information
 */
export interface KioskCabinet {
  ip: string
  posOnlineStatus: string
  type: string
  slots: number
  qrCode: string
  online: boolean
  emptySlots: number
  busySlots: number
  id: string
  shopId: string
  signal: string
  posDeviceId: string
}

/**
 * Complete kiosk information response
 */
export interface KioskInfoData {
  priceStrategy: KioskPriceStrategy
  shop: KioskShop
  batteries: KioskBattery[]
  cabinet: KioskCabinet
}

/**
 * API response for kiosk information
 */
export interface KioskInfoResponse {
  success: boolean
  error: string | null
  data: KioskInfoData
}

/**
 * Detailed battery information from slot data
 */
export interface SlotBatteryDetails {
  transMap: Record<string, unknown>
  powerSupplyFlag: number
  psn: string
  pid: number
  pcabinetid: string
  pzujie: number
  pregtime: string
  pbatteryid: string
  pkakou: number
  prouterStatus: number
  poperator: string
  ptemperature: number
  pcapacity: number
  piosStatus: number
  pmicroStatus: number
  ptypecStatus: number
  pinfostatus: string
  pproductType: number
  pstate: number
  pdianliang: number
  plognum: number
  pfaultType: number
  pxian: number
  plogtime: string
  pzujienum: number
  pdailiid: string
  perrid: number
  pcheckResult: string
  pzjztime: number
  ptotalrevenue: number
  pcellSn: number
  pauthfailTime: number
  pchipPlatform: string
  pbatteryCapacity: string
  [key: string]: string | number | Record<string, unknown>
}

/**
 * Individual slot information
 */
export interface KioskSlot {
  slotNumber: number
  slotId: number
  cabinetId: string
  state: number
  stateDescription: string
  batteryId: string | null
  batteryCharge: number
  lastBatteryId: string | null
  faultType: number
  faultCause: string | null
  isGuarded: boolean
  lastLogTime: string
  battery: SlotBatteryDetails | null
}

/**
 * Kiosk slots data response
 */
export interface KioskSlotsData {
  cabinetId: string
  totalSlots: number
  emptySlots: number
  occupiedSlots: number
  faultSlots: number
  slots: KioskSlot[]
}

/**
 * API response for kiosk slots
 */
export interface KioskSlotsResponse {
  success: boolean
  error: string | null
  data: KioskSlotsData
}

/**
 * Slot eject response data
 */
export interface SlotEjectData {
  message: string
  deviceId: string
  slotNumber: number
  timestamp: string
}

/**
 * API response for slot ejection
 */
export interface SlotEjectResponse {
  success: boolean
  error: string | null
  data: SlotEjectData
}

/**
 * Error response type
 */
export interface KioskApiError {
  success: false
  error: string
  errorType: "unknown" | "timeout" | "aborted" | "api_key_invalid" | "not_found"
}

