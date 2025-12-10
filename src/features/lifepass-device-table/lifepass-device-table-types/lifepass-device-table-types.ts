import { type Product } from '@/db/schemas/products'
import { type ConsumerCategory } from '@/db/schemas/consumer-categories'
import { type Order, type Device } from '@/db/schema'

/**
 * Processed order data structure for display in lifepass device table
 * Combines data from Myth orders, Skidata tickets, and product catalogs
 */
export interface ProcessedOrder {
  /** Unique order identifier */
  orderId: number
  /** ISO timestamp when order was created */
  createdAt: string
  /** Channel where the sale was made (e.g., 'online', 'kiosk') */
  salesChannel: string
  /** Product catalog ID */
  productId: string
  /** Localized product name */
  productName: string
  /** Consumer category ID (e.g., 'adult', 'child') */
  consumerCategoryId: string
  /** Localized consumer category name */
  consumerCategoryName: string
  /** Total order price including all items */
  totalPrice: number
  /** Skipass product price (gross) */
  skipassTotal: number
  /** Tax amount for skipass */
  skipassTaxAmount: number
  /** Lifepass rental fee (gross) */
  lifepassRentalTotal: number
  /** Tax amount for lifepass rental */
  lifepassRentalTaxAmount: number
  /** Insurance fee (gross) if applicable */
  insuranceTotal: number
  /** Tax amount for insurance */
  insuranceTaxAmount: number
  /** Skidata device serial number */
  skidataDeviceSerial: string
  /** Myth device ID */
  deviceId: string | null
  /** Physical lifepass device code */
  lifepassDeviceId: string | null
  /** Whether this order includes insurance */
  hasInsurance: boolean
  /** Pass validity start date (ISO string) */
  startDate: string | null
  /** Pass validity end date (ISO string) */
  endDate: string | null
  /** Whether device exists in Myth system */
  existsOnMyth: boolean
  /** Whether device exists in Skidata system */
  existsOnSkidata: boolean
}

/**
 * Props for processOrders function
 * Contains all data needed to process orders
 */
export interface ProcessOrdersProps {
  /** Array of orders to process */
  orders: Order[]
  /** Product catalog for name lookup */
  products?: Product[]
  /** Consumer categories for name lookup */
  consumerCategories?: ConsumerCategory[]
  /** Map of serial numbers to devices */
  serialMap?: Map<string, Device>
}





