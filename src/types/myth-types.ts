export interface MythGetOrderResponse {
    success: boolean;
    orderId: string;
    orderDetails?: MythOrderDetails;
    updatedAt?: string;
    error?: string;
}

export interface MythBookingRequestDetails {
    telephone: string;
    name: string;
    fromDate: string;
    toDate: string;
    languageCode: string;
    devices: {
        deviceId: string;
        productId: string;
        consumerCategoryId: string;
        insurance: boolean;
    }[];
}

export interface MythOrderDetails {
    id: string; // UUID for the group order.
    groupId?: string; // An identifier for the group.
    leadBookerName?: string; // Name of the primary person responsible for the booking.
    orderId: string; // Unique order identifier.
    authCode: string; // Authorization code for registration or access.
    from: string; // Starting date and time for the booking in ISO 8601 format.
    to: string; // Ending date and time for the booking in ISO 8601 format.
    status: string; // Current status of the booking or registration.
    contactDetails?: MythContactDetails; // Contact information related to the booking.
    devices: MythLifepassDevice[]; // Array of devices associated with the booking.
    registrationUrlBase64QrCode?: string; // Base64 encoded image for QR code linked to registration.
    registrationUrl?: string; // URL for registration, possibly allowing users to finalize the process.
    updatedAt?: string; // Timestamp of when the booking was last updated.
}

export interface MythContactDetails {
    id: string; // UUID for contact details.
    telephone: string; // Contact telephone number including the country code.
    email: string; // Email address of the contact, which may be empty.
    contactName: string; // Name of the contact person.
    contactPreferences: string[]; // Array for contact preferences; type can be specified if further details are known.
}


export interface MythLifepassDevice {
    id: string; // UUID for each device.
    deviceCode: string; // Code identifying the device model or type.
    imei: string; // International Mobile Equipment Identity number for the device.
    nickname?: string; // Nickname for the device, which may be empty.
    dtaCode: string; // A code representing specific tracking data.
    battery: number; // Battery level of the device as a percentage.
    deviceAllocated: boolean; // Boolean indicating if the device is assigned.
    connected: boolean; // Boolean indicating if the device is currently connected.
    deviceDtaCode: string;
    deviceId?: string; // Optional identifier for the device, which may be empty.
    productId?: string;
    consumerCategoryId?: string;
    insurance?: boolean;
}



