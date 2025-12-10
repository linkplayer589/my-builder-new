import { type SkidataCalculatedPrice } from "@/types/skidata-types";


export type LocalizedText = {
    en?: string;
    de?: string;
    fr?: string;
    it?: string;
}

export type ClientDetails = {
    name: string;
    email: string;
    mobile: string;
    languageCode?: string;
    stripeClientId?: string;
}

export type FeedbackFormSubmission = {
    verifiedMobile: string;
    country: string;
    rating: string;
    wouldReturn: boolean;
}

export type OrderDetails = {
    resortId: number;
    startDate: string;
    endDate?: string;
    products?: {
        deviceId?: string;
        productId: string;
        consumerCategoryId: string;
        insurance?: boolean;
    }[];
    devices?: {
        deviceId?: string;
        productId: string;
        consumerCategoryId: string;
        insurance?: boolean;
    }[];
}

export type CalculatedOrderPrice = {
    startDate: string,
    daysValidity: number,
    cumulatedPrice: SkidataCalculatedPrice,
    orderItemPrices: OrderItemPrice[],
}

export type OrderItemPrice = {
    productId: string,
    consumerCategoryId: string,
    productPrice?: SkidataCalculatedPrice
    insurancePrice?: SkidataCalculatedPrice
    lifepassRentalPrice?: SkidataCalculatedPrice
    success: boolean;
}

export type GetProductsReturnCatalog = {
    catalogId: string;
    version: number;
    products: {
        id: string;
        name: LocalizedText;
        description: LocalizedText;
        validityCategory?: {
            id: string;
            unit: LocalizedText;
            value: number;
        };
        priceCategories: {
            consumerCategoryId: string;
            consumerCategoryData: {
                id: string;
                name: LocalizedText;
                description: LocalizedText;
                ageMin: number;
                ageMax: number;
            };
            price?: SkidataCalculatedPrice;
            success: boolean;
        }[];
    }[];
}


