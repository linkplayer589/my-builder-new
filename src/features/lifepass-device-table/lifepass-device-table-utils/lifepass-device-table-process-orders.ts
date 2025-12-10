import { type Order } from '@/db/schema'
import { type MythLifepassDevice } from '@/types/myth-types'
import { type Product } from '@/db/schemas/products'
import { type ConsumerCategory } from '@/db/schemas/consumer-categories'
import {
  type ProcessedOrder,
  type ProcessOrdersProps,
} from '../lifepass-device-table-types/lifepass-device-table-types'
import {
  getProductName,
  getConsumerCategoryName,
  matchSkidataTicketWithDevice,
} from './lifepass-device-table-helpers'

/**
 * Process orders from Myth and Skidata systems into unified table data
 * Combines order data with product catalogs and matches devices across systems
 * 
 * @param props - Processing configuration with orders and catalog data
 * @returns Array of processed orders ready for table display
 * 
 * @example
 * const processedOrders = processOrders({
 *   orders: mythOrders,
 *   products: productCatalog,
 *   consumerCategories: categories
 * })
 * 
 * Side Effects:
 * - Logs warnings for orders with missing price data
 * - Logs warnings for devices without matching prices
 */
export function processOrders({
  orders = [],
  products = [],
  consumerCategories = [],
}: ProcessOrdersProps): ProcessedOrder[] {
  // Validate input format
  if (!Array.isArray(orders)) {
    console.error('Invalid data format: orders should be an array')
    return []
  }

  // Process each order and flatten device arrays
  return orders.flatMap(order => {
    // Skip orders without price data
    if (!order.calculatedOrderPrice?.orderItemPrices) {
      console.warn(`Order with ID ${order.id} has no price data`)
      return []
    }

    // Extract devices from Myth order submission
    const devices = order.mythOrderSubmissionData?.devices || []

    // Process each device and filter out null results
    return devices
      .map(device => processDevice(order, device, products, consumerCategories))
      .filter((item): item is ProcessedOrder => item !== null)
  })
}

/**
 * Process a single device within an order
 * Matches Myth device with Skidata ticket and combines pricing data
 * 
 * @param order - Parent order containing price and Skidata data
 * @param mythDevice - Myth device to process
 * @param products - Product catalog for name lookup
 * @param consumerCategories - Category catalog for name lookup
 * @returns Processed order data or null if device cannot be matched with pricing
 * 
 * Internal Logic:
 * 1. Find matching price for device based on product, category, and insurance
 * 2. Match device with corresponding Skidata ticket
 * 3. Extract serial numbers and validity dates
 * 4. Combine all data into ProcessedOrder structure
 */
function processDevice(
  order: Order,
  mythDevice: MythLifepassDevice,
  products: Product[],
  consumerCategories: ConsumerCategory[]
): ProcessedOrder | null {
  // Find price data matching this specific device configuration
  const orderItemPrice = order.calculatedOrderPrice.orderItemPrices.find(
    price =>
      price.productId === mythDevice.productId &&
      price.consumerCategoryId === mythDevice.consumerCategoryId &&
      Boolean(price.insurancePrice?.basePrice.amountGross) === Boolean(mythDevice.insurance)
  )

  // Skip device if no matching price found
  if (!orderItemPrice) {
    console.warn(`No matching price found for mythDevice ${mythDevice.deviceCode}`)
    return null
  }

  // Match device with Skidata ticket
  const { ticketItem, orderItem } = matchSkidataTicketWithDevice(
    mythDevice,
    typeof order.skidataOrderData?.orderDetails === 'object' &&
      order.skidataOrderData?.orderDetails !== null
      ? order.skidataOrderData.orderDetails.orderItems
      : []
  )

  // Extract Skidata serial number
  const skidataSerial = ticketItem?.identifications?.[0]?.serialNumber || 'N/A'

  // Combine all data into final structure
  return {
    orderId: order.id,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    salesChannel: order.salesChannel,
    productId: mythDevice.productId || '',
    productName: getProductName(products, mythDevice.productId || ''),
    consumerCategoryId: mythDevice.consumerCategoryId || '',
    consumerCategoryName: getConsumerCategoryName(consumerCategories, mythDevice.consumerCategoryId || ''),
    totalPrice: order.calculatedOrderPrice.cumulatedPrice.basePrice.amountGross,
    skipassTotal: orderItemPrice.productPrice?.basePrice.amountGross ?? 0,
    skipassTaxAmount: orderItemPrice.productPrice?.basePrice.taxDetails.taxAmount ?? 0,
    lifepassRentalTotal: orderItemPrice.lifepassRentalPrice?.basePrice.amountGross ?? 0,
    lifepassRentalTaxAmount: orderItemPrice.lifepassRentalPrice?.basePrice.taxDetails.taxAmount ?? 0,
    insuranceTotal: orderItemPrice.insurancePrice?.basePrice.amountGross ?? 0,
    insuranceTaxAmount: orderItemPrice.insurancePrice?.basePrice.taxDetails.taxAmount ?? 0,
    skidataDeviceSerial: skidataSerial,
    deviceId: mythDevice.id?.toString() || null,
    lifepassDeviceId: mythDevice.deviceCode?.toString() || null,
    hasInsurance: Boolean(mythDevice.insurance),
    startDate: orderItem?.validFrom || null,
    endDate: ticketItem?.attributes?.find(attr => attr.key === 'dta-validity-end')?.value || null,
    existsOnMyth: Boolean(mythDevice.id),
    existsOnSkidata: Boolean(ticketItem?.identifications?.length),
  }
}





