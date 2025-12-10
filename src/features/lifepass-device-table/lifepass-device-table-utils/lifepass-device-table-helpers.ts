import { type Product } from '@/db/schemas/products'
import { type ConsumerCategory } from '@/db/schemas/consumer-categories'
import { type MythLifepassDevice } from '@/types/myth-types'
import { type OrderItem, type Identification } from '@/types/skidata-types'

/**
 * Get localized product name from product catalog
 * Falls back to product ID if product not found
 * 
 * @param products - Product catalog array
 * @param productId - Product ID to lookup
 * @returns Localized product name (Italian) or product ID as fallback
 */
export function getProductName(products: Product[], productId: string): string {
  const product = products?.find(p => p?.id === productId)
  return product?.titleTranslations?.it ?? productId
}

/**
 * Get localized consumer category name from catalog
 * Falls back to category ID if category not found
 * 
 * @param consumerCategories - Consumer category catalog array
 * @param categoryId - Category ID to lookup
 * @returns Localized category name (Italian) or category ID as fallback
 */
export function getConsumerCategoryName(
  consumerCategories: ConsumerCategory[],
  categoryId: string
): string {
  const category = consumerCategories?.find(c => c?.id === categoryId)
  return category?.titleTranslations?.it ?? categoryId
}

/**
 * Match a Myth device with its corresponding Skidata ticket
 * Uses DTA code to find matching serial number in Skidata order items
 * 
 * @param mythDevice - Myth lifepass device with DTA code
 * @param skidataItems - Array of Skidata order items to search
 * @returns Object containing matched ticket item and order item, or undefined if no match
 * 
 * @example
 * const { ticketItem, orderItem } = matchSkidataTicketWithDevice(
 *   mythDevice,
 *   skidataOrderItems
 * )
 * if (ticketItem) {
 *   console.log('Found matching ticket:', ticketItem.identifications[0].serialNumber)
 * }
 */
export function matchSkidataTicketWithDevice(
  mythDevice: MythLifepassDevice,
  skidataItems: OrderItem[]
): { ticketItem: OrderItem['ticketItems'][0] | undefined; orderItem: OrderItem | undefined } {
  // Extract serial number from DTA code (format: "prefix-SERIAL-suffix")
  const parts = mythDevice.dtaCode.split('-')
  const dtaSerial = parts.length > 1 ? parts[1]?.replace(/\s/g, '') || '' : ''

  // Search through all order items and their tickets
  for (const orderItem of skidataItems) {
    for (const ticketItem of orderItem.ticketItems || []) {
      const matchingIdentification = ticketItem.identifications?.find(
        (id: Identification) => id.serialNumber === dtaSerial
      )
      
      if (matchingIdentification) {
        return { ticketItem, orderItem }
      }
    }
  }

  // Log when no match is found for debugging
  console.log('No matching identification found for mythDevice:', {
    deviceCode: mythDevice.deviceCode,
    dtaCode: mythDevice.dtaCode,
    extractedSerial: dtaSerial
  })

  return { ticketItem: undefined, orderItem: undefined }
}





