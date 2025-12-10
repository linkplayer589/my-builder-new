/**
 * Kiosk Detail Feature
 * Provides detailed view and management capabilities for individual kiosks
 * Integrates with external Hono API for real-time kiosk data
 */

// Components
export { KioskDetailPage } from "./kiosk-detail-components/kiosk-detail-page"
export { KioskInfoCard } from "./kiosk-detail-components/kiosk-info-card"
export { KioskSlotsGrid } from "./kiosk-detail-components/kiosk-slots-grid"

// Actions
export { getKioskInfo } from "./kiosk-detail-actions/get-kiosk-info"
export { getKioskSlots } from "./kiosk-detail-actions/get-kiosk-slots"
export { ejectSlot } from "./kiosk-detail-actions/eject-slot"

// Types
export type {
  KioskInfoResponse,
  KioskInfoData,
  KioskSlotsResponse,
  KioskSlotsData,
  SlotEjectResponse,
  KioskPriceStrategy,
  KioskShop,
  KioskBattery,
  KioskCabinet,
  KioskSlot,
  SlotBatteryDetails,
  SlotEjectData,
  KioskApiError,
} from "./kiosk-detail-types"

