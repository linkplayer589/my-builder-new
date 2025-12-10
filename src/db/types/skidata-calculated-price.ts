export interface CalculatedPrice {
    basePrice: PriceDetails;
    bestPrice: PriceDetails;
    components?: PriceComponent[];
    success: boolean;
}

export interface PriceDetails {
    amountNet: number;
    amountGross: number;
    currencyCode: string;
    taxDetails: TaxDetails;
    calculateFromPreviousAmount: boolean;
    netPrice: boolean;
}

export interface TaxDetails {
    name: string;
    taxValue: number;
    taxAmount: number;
    taxShortName: string;
    sortOrder: number;
}

export interface PriceComponent {
    name: string;
    price: PriceDetails;
}