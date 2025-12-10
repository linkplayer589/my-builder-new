/**
 * Skidata order response from API
 */
export interface TSkidataOrderResponse {
    success: boolean
    skidataOrderId: string
    orderDetails: {
        orderId: string
        date: string
        systemDate: string
        contactId: string
        confirmationNumber: string
        totalPrice: {
            amountGross: number
            currencyCode: string
        }
        seller: {
            saleschannelShortName: string
            pointOfSaleName: string
            posType: string
        }
        orderItems: Array<{
            id: string
            productId: string
            consumerCategoryId: string
            quantity: number
            cancelationQuantity: number
            salesStatus: string
            amountGross: number
            validFrom: string
            isDepotTicket: boolean
            ticketItems: Array<{
                id: string
                permissionId: string
                permissionSerialNumber: string
                permissionStatus: string
                salesStatus: string
            }>
        }>
    }
}

