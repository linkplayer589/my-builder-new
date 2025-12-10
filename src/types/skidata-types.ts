import { type LocalizedText } from "@/types/general-types";


export interface SkidataGetOrderResponse {
    success: boolean;
    skidataOrderId: string;
    orderDetails?: SkidataOrder | string;
    updatedAt?: string;
    error?: string;
}

export interface SkidataOrderItem {
    id?: string;
    productId: string;
    consumerCategoryId: string;
    quantity: number;
    basePrice: SkidataPriceDetails;
    IsDepotTicket: boolean;
    lifepassDTAComponents?: {
        ChipId: string;
        SerialNumber: string;
        LuhnNumber: string;
    }
    ticketItemId?: string;
}

export interface SkidataOrderSubmission {
    orderId: string;
    confirmationNumber: string;
    asynchronousExecutionToken: {
        executionId: string;
    };
}

export interface SkidataValidityCategory {
    id: string;
    externalId: string;
    name: LocalizedText;
    active: boolean;
    validityValue: number;
    validityUnit: string;
    variable: boolean;
}

export interface TicketItem {
    id: string;
    permissionId: string;
    permissionSerialNumber: string;
    permissionStatus: string;
    salesStatus: string;
    contactId?: string;
    version?: string;
    identificationStatus?: string;
    isBookingWithoutIdentification?: boolean;
    identifications?: Identification[];
    attributes?: Attribute[];
}

export interface OrderItem {
    id: string;
    productId: string;
    consumerCategoryId: string;
    quantity: number;
    cancelationQuantity?: number;
    salesStatus: string;
    orderType?: string;
    isManualPrice?: boolean;
    isDepotTicket: boolean;
    permissionType?: string;
    validFrom: string;
    amountGross?: number;
    currencyCode?: string;
    unitPrice: SkidataPriceDetails;
    linePrice: SkidataPriceDetails;
    ticketItems: TicketItem[];
}

export interface SkidataOrder {
    orderId: string;
    date: string;
    systemDate: string;
    totalPrice: SkidataPriceDetails;
    confirmationNumber: string;
    orderItems: OrderItem[];
    seller: Seller;
    isCreatedAsReservation?: boolean;
}

export interface SkiDataConsumerCategory {
    id: string;
    externalId: string;
    name: LocalizedText;
    description: LocalizedText;
    active: boolean;
    sortOrder: number;
    reservedForSpecialUseCase: boolean;
    fromDate?: string;
    toDate?: string;
    ageMin?: number;
    ageMax?: number;
}

export interface SkiDataProduct {
    id: string;
    type: string;
    name: LocalizedText;
    description: LocalizedText;
    isAdditionalProductOnly: boolean;
    productCategoryId: string;
    consumerCategoryIds: string[];
    active: boolean;
    sortOrder: number;
    reservedForSpecialUseCase: boolean;
    contractorId: string;
    catalogId: string;
    externalId: string;
    contactRequired: boolean;
    issueValidityPeriodId?: string;
    additionalProductItems?: unknown;
    internalContingent: boolean;
    coding?: boolean;
    printing?: boolean;
    photoRequired?: 'yes' | 'no';
    depotPossible?: boolean;
    predatingPossible?: boolean;
    validityCategoryId?: string;
}

export interface SkidataCalculatedPrice {
    basePrice: SkidataPriceDetails;
    bestPrice: SkidataPriceDetails;
    success: boolean;
}

export interface SkidataPriceDetails {
    amountNet: number;
    amountGross: number;
    currencyCode: string;
    taxDetails: SkidataTaxDetails;
    calculateFromPreviousAmount: boolean;
    netPrice: boolean;
}

export interface SkidataTaxDetails {
    name: string;
    taxValue: number;
    taxAmount: number;
    taxShortName: string;
    sortOrder: number;
}

export interface SkidataCancelOrder {
    originalOrderId: string;
    cancelationOrderId: string;
    cancelationSystemDate: string;
    executionId: string;
}

export interface SkidataCancelTicketItem {
    originalOrderId: string;
    cancelationOrderId: string;
    cancelationSystemDate: string;
    executionId: string;
}

export interface CommitReservedOrderResponse {
    orderId: string;
    confirmationNumber: string;
    asynchronousExecutionToken: {
        executionId: string;
    };
}

export interface CreateReservedOrderRequest {
    date: string;
    totalPrice: SkidataPriceDetails;
    orderItems: CreateReservedOrderItem[];
}

export interface CreateReservedOrderItem {
    productId: string;
    quantity: number;
    unitPrice: SkidataPriceDetails;
    linePrice: SkidataPriceDetails;
    isDepotTicket: boolean;
    ticketItems: {
        isBookingWithoutIdentification: boolean;
    };
    consumerCategoryId: string;
    validFrom: string;
}

export interface CreateReservedOrderResponse {
    orderId: string;
    confirmationNumber: string;
}


export interface CatalogVersionResponse {
    version: number;
}


export interface SkidataTicketItem {
    id: string;
    identification: Identification[];
    isBookingWithoutIdentification?: boolean;
}

export interface Identification {
    chipId: string;
    serialNumber: string;
    luhnNumber: string;
}

export interface Attribute {
    key: string;
    value: string;
    attributeTypeId: string;
    languageCode: string;
    text: string;
    isVariable: boolean;
    sortOrder: number;
}

export interface Seller {
    saleschannelShortName: string;
    saleschannelExternalId: string;
    userName: string;
    pointOfSaleName: string;
    posType: string;

}

export interface ContractorPosMap {
    contractorId: string;
    contractorShortName: string;
    contractorDefaultCurrency: string;
    contractorType: string;
    contractorsubType: string;
    companyId: string;
    cashDeskId: string;
    defaultContractor: boolean;
    paymentRoundingRule: string;
    paymentRoundingPrecision: number;
    cashRoundingRule: string;
    cashRoundingPrecision: number;
}

export interface OrganizationDetail {
    organizationShortName: string;
    organizationName: string;
    organizationId: string;
}

export interface AssignedCatalog {
    id: string;
    externalId: string;
    shortName: string;
    name: string;
    contractorId: string;
    contractorShortName: string;
}

export interface PointOfSaleConfiguration {
    pointOfSaleId: string;
    pointOfSaleName: string;
    pointOfSaleProperties: string[];
    pointOfSaleTimeZone: string;
    pointOfSaleDeviceId: string;
    salesChannelId: string;
    salesChannelExternalId: string;
    salesChannelShortName: string;
    salesChannelName: string;
    salesChannelProperties: string[];
    salesChannelTimeZone: string;
    contractorPosMap: ContractorPosMap;
    organizationDetail: OrganizationDetail;
    assignedCatalogsArray: AssignedCatalog[];
}

export interface UpdateReservedOrderRequest {
    id: string;
    date: string;
    systemDate: string;
    totalPrice: SkidataPriceDetails;
    confirmationNumber: string;
    orderItems: UpdateReservedOrderItem[];
    seller: {
        saleschannelShortName: string;
        saleschannelExternalId: string;
        userName: string;
        pointOfSaleName: string;
        posType: string;
    };
    isCreatedAsReservation: boolean;
}

export interface UpdateReservedOrderItem {
    id: string;
    productId: string;
    unitPrice: SkidataPriceDetails;
    quantity: number;
    consumerCategoryId: string;
    salesStatus: string;
    orderType: string;
    isManualPrice: boolean;
    linePrice: SkidataPriceDetails;
    validFrom: string;
    isDepotTicket: boolean;
    permissionType: string;
    ticketItems: SkidataTicketItem[];
}

export interface UpdateReservedOrderResponse {
    orderId: string;
    confirmationNumber: string;
} 