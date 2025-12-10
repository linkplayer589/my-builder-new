import { type Product } from '@/db/schemas/products';
import { type ConsumerCategory } from '@/db/schemas/consumer-categories'
import { type Order, type Device } from "@/db/schema"
import { type MythLifepassDevice } from '@/types/myth-types';
import { type OrderItem, type Identification } from '@/types/skidata-types';

export interface ProcessedOrder {
  orderId: number
  createdAt: string
  salesChannel: string
  productId: string
  productName: string
  consumerCategoryId: string
  consumerCategoryName: string
  totalPrice: number
  skipassTotal: number
  skipassTaxAmount: number
  lifepassRentalTotal: number
  lifepassRentalTaxAmount: number
  insuranceTotal: number
  insuranceTaxAmount: number
  /** Serial from Skidata ticket identifications (if found in skidataOrderData) */
  skidataDeviceSerial: string
  /** Serial extracted from mythDevice.dtaCode (e.g., "01-1234567890-0" → "1234567890") */
  mythDtaSerial: string
  /** Full DTA code from Myth device (e.g., "01-1614 7159 9232 1569 7179-0") */
  mythDtaCode: string
  deviceId: string | null
  lifepassDeviceId: string | null
  hasInsurance: boolean
  startDate: string | null
  endDate: string | null
  existsOnMyth: boolean
  existsOnSkidata: boolean
  stripeAmount: number | null
  stripeFee: number | null
  stripeNet: number | null
  stripeProcessingFee: number | null
  stripeTax: number | null
  stripePaid: boolean
  stripeRefunded: boolean
  stripeCaptured: boolean
  /** Whether this is a test order */
  testOrder: boolean
}

interface ProcessOrdersProps {
  orders: Order[];
  products?: Product[];
  consumerCategories?: ConsumerCategory[];
  serialMap?: Map<string, Device>;
}

// Helper functions
const getProductName = (products: Product[], productId: string) => {
  const product = products?.find(p => p?.id === productId);
  return product?.titleTranslations?.it ?? productId;
};

const getConsumerCategoryName = (consumerCategories: ConsumerCategory[], categoryId: string) => {
  const category = consumerCategories?.find(c => c?.id === categoryId);
  return category?.titleTranslations?.it ?? categoryId;
};

function matchSkidataTicketWithDevice(
  mythDevice: MythLifepassDevice,
  skidataItems: OrderItem[]
) {
  const parts = mythDevice.dtaCode.split('-');
  const dtaSerial = parts.length > 1 ? parts[1]?.replace(/\s/g, '') || '' : '';

  for (const orderItem of skidataItems) {
    for (const ticketItem of orderItem.ticketItems || []) {
      const matchingIdentification = ticketItem.identifications?.find(
        (id: Identification) => {
          return id.serialNumber === dtaSerial
        }
      );
      if (matchingIdentification) {
        return { ticketItem, orderItem };
      }
    }
  }

  console.log('No matching identification found for mythDevice:', {
    deviceCode: mythDevice.deviceCode,
    dtaCode: mythDevice.dtaCode,
    extractedSerial: dtaSerial
  });

  return { ticketItem: undefined, orderItem: undefined };
}

const processDevice = (
  order: Order,
  mythDevice: MythLifepassDevice,
  products: Product[],
  consumerCategories: ConsumerCategory[],
): ProcessedOrder | null => {
  // Find matching price for this mythDevice
  const orderItemPrice = order.calculatedOrderPrice.orderItemPrices.find(
    price => price.productId === mythDevice.productId && price.consumerCategoryId === mythDevice.consumerCategoryId && (Boolean(price.insurancePrice?.basePrice.amountGross) === Boolean(mythDevice.insurance))
  );

  if (!orderItemPrice) {
    console.warn(`No matching price found for mythDevice ${mythDevice.deviceCode}`);
    return null;
  }

  // Find matching Skidata ticket
  const { ticketItem, orderItem } = matchSkidataTicketWithDevice(
    mythDevice,
    typeof order.skidataOrderData?.orderDetails === 'object' && order.skidataOrderData?.orderDetails !== null
      ? order.skidataOrderData.orderDetails.orderItems
      : []
  );

  const skidataSerial = ticketItem?.identifications?.[0]?.serialNumber || 'N/A';

  // Extract DTA serial from mythDevice.dtaCode (e.g., "01-1614 7159 9232 1569 7179-0" → "16147159923215697179")
  const mythDtaCode = mythDevice.dtaCode || '';
  const dtaParts = mythDtaCode.split('-');
  const mythDtaSerial = dtaParts.length > 1 ? dtaParts[1]?.replace(/\s/g, '') || '' : '';

  // Get Stripe transaction data
  const stripeCharge = order.stripeTransactionDatas?.[0]?.charges?.[0]?.balanceTransaction;
  const stripeChargeStatus = order.stripeTransactionDatas?.[0]?.charges?.[0];
  const processingFee = stripeCharge?.feeDetails.find((fee) => fee.description === "Stripe processing fees")?.amount ?? null;
  const taxFee = stripeCharge?.feeDetails.find((fee) => fee.description === "VAT")?.amount ?? null;

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
    mythDtaSerial,
    mythDtaCode,
    deviceId: mythDevice.id?.toString() || null,
    lifepassDeviceId: mythDevice.deviceCode?.toString() || null,
    hasInsurance: Boolean(mythDevice.insurance),
    startDate: orderItem?.validFrom || null,
    endDate: ticketItem?.attributes?.find(attr => attr.key === 'dta-validity-end')?.value || null,
    existsOnMyth: Boolean(mythDevice.id),
    existsOnSkidata: Boolean(ticketItem?.identifications?.length),
    stripeAmount: stripeCharge?.amount ? stripeCharge.amount / 100 : null,
    stripeFee: stripeCharge?.fee ? stripeCharge.fee / 100 : null,
    stripeNet: stripeCharge?.net ? stripeCharge.net / 100 : null,
    stripeProcessingFee: processingFee ? processingFee / 100 : null,
    stripeTax: taxFee ? taxFee / 100 : null,
    stripePaid: Boolean(stripeChargeStatus?.paid),
    stripeRefunded: Boolean(stripeChargeStatus?.refunded),
    stripeCaptured: Boolean(stripeChargeStatus?.captured),
    testOrder: Boolean(order.testOrder),
  };
};

export function processOrders({
  orders = [],
  products = [],
  consumerCategories = [],
}: ProcessOrdersProps): ProcessedOrder[] {
  if (!Array.isArray(orders)) {
    console.error('Invalid data format: orders should be an array');
    return [];
  }

  return orders.flatMap(order => {

    if (!order.calculatedOrderPrice?.orderItemPrices) {
      console.warn(`Order with ID ${order.id} has no price data`);
      return [];
    }

    // Process each device in the Myth order
    const devices = order.mythOrderSubmissionData?.devices || [];

    return devices
      .map(device => processDevice(order, device, products, consumerCategories))
      .filter((item): item is ProcessedOrder => item !== null);
  });
}