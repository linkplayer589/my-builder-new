export interface SkiDataExportResponse {
    success: boolean
    totalTicketItems: number
    ticketItemsWithoutMatchingSkidataOrderId: number
    testTicketItems: number
    liveTicketItems: number
    totalOwedToSkidataForLiveTicketItems: number
    ticketItems: TicketItem[]
}

export interface TicketItem {
    orderId?: number;
    skidataOrderId: string;
    date: string;
    skidataOrderItemId: string;
    skidataOrderItemStatus: string;
    skidataConfirmationNumber: string;
    productId: string;
    productName: string;
    consumerCategoryId: string;
    consumerCategoryName: string;
    orderItemPriceGross: number;
    ticketItemIds: string[];
    skipassDTAs: string[];
    testOrder?: boolean;
}
