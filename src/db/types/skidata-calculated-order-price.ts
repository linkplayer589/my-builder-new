import type { CalculatedPrice } from "./skidata-calculated-price"

export type OrderPrice = {
    startDate: string,
    daysValidity: number,
    cumulatedPrice: CalculatedPrice,
    orderItemPrices: OrderItemPrice[],
}

export type OrderItemPrice = {
    productId: string,
    consumerCategoryId: string,
    productPrice?: CalculatedPrice
    insurancePrice?: CalculatedPrice
    lifepassRentalPrice?: CalculatedPrice
    success: boolean;
}