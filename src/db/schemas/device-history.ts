import { pgTable, serial, text, timestamp, integer, json, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { orders } from './orders';
import { sessions } from './sessions';
import { clients } from './clients';
import { resorts } from './resorts';

/**
 * Device History Table - Comprehensive tracking of all device movements and activities
 * 
 * This table provides a complete audit trail for device lifecycle events including:
 * - Device registration and deregistration in various systems (Myth, Skidata, TDI)
 * - Order-related activities (rentals, collections, returns)
 * - Location transfers between kiosks, cash desks, and return bins
 * - Status changes and system interactions
 * - Error events and system failures
 */
export const deviceHistory = pgTable('device_history', {
    // Primary identifier
    id: serial('id').primaryKey().unique().notNull(),
    
    // Device reference - using serial number as the main device identifier
    deviceSerial: text('device_serial').notNull(),
    
    // Event classification
    eventType: varchar('event_type', { 
        length: 50,
        enum: [
            // Device lifecycle events
            'device_created', 'device_updated', 'device_deleted',
            
            // Myth system events
            'myth_device_registered', 'myth_device_returned', 'myth_booking_created',
            'myth_device_info_retrieved', 'myth_order_retrieved',
            
            // Skidata system events
            'skidata_order_submitted', 'skidata_order_retrieved', 'skidata_order_cancelled',
            'skidata_ticket_cancelled', 'skidata_skipass_added',
            
            // TDI system events
            'tdi_datacarrier_registered', 'tdi_datacarrier_unregistered',
            'tdi_notification_received', 'tdi_sales_item_created',
            'tdi_access_event', 'tdi_cancellation_event', 'tdi_block_event', 'tdi_unblock_event', 'tdi_tracking_data_event',
            
            // Kiosk operations
            'kiosk_device_collected', 'kiosk_device_returned', 'kiosk_order_submitted',
            'kiosk_order_validated', 'kiosk_device_scanned',
            
            // Cash desk operations
            'cash_desk_device_rented', 'cash_desk_device_returned', 'cash_desk_device_swapped',
            'cash_desk_order_submitted', 'cash_desk_payment_captured',
            
            // Return bin operations
            'return_bin_device_returned', 'return_bin_device_processed',
            
            // Order-related events
            'order_device_assigned', 'order_device_removed', 'order_completed',
            'order_cancelled', 'order_refunded',
            
            // Status change events
            'device_status_changed', 'device_location_changed',
            
            // Error and maintenance events
            'device_error_occurred', 'device_maintenance_performed',
            'system_error', 'api_error'
        ]
    }).notNull(),
    
    // Temporal information
    eventTimestamp: timestamp('event_timestamp').notNull().defaultNow(),
    
    // Location context
    locationType: varchar('location_type', { 
        length: 30,
        enum: ['kiosk', 'cash_desk', 'return_bin', 'myth_system', 'skidata_system', 'tdi_system', 'web_portal', 'api', 'system', 'unknown', "turnstile", "gate", "lift"]
    }),
    locationId: text('location_id'), // Specific kiosk ID, cash desk ID, etc.
    locationName: text('location_name'), // Human-readable location name
    
    // Relationship references
    resortId: integer('resort_id').references(() => resorts.id),
    orderId: integer('order_id').references(() => orders.id),
    sessionId: integer('session_id').references(() => sessions.id),
    clientId: integer('client_id').references(() => clients.id),
    
    // Status tracking
    statusBefore: text('status_before'), // Device status before the event
    statusAfter: text('status_after'),   // Device status after the event
    
    // Event-specific details stored as JSON for flexibility
    eventDetails: json('event_details').$type<{
        // Common fields
        action?: string;
        result?: 'success' | 'failure' | 'pending';
        
        // Order-related details
        orderType?: string;
        productIds?: string[];
        totalAmount?: number;
        currency?: string;
        
        // Payment details
        paymentMethod?: string;
        paymentIntentId?: string;
        transactionId?: string;
        
        // System integration details
        mythBookingId?: string;
        skidataOrderId?: string;
        tdiNotificationId?: string;
        
        // Device technical details
        deviceChipId?: string;
        deviceHex?: string;
        deviceLuhn?: string;
        
        // Error information
        errorCode?: string;
        errorMessage?: string;
        stackTrace?: string;
        
        // API request details
        requestMethod?: string;
        requestPath?: string;
        responseStatus?: number;
        
        // User context
        userAgent?: string;
        ipAddress?: string;
        
        // Additional flexible data
        metadata?: Record<string, unknown>;
    }>(),
    
    // User and system context
    initiatedBy: varchar('initiated_by', { 
        length: 30,
        enum: ['system', 'client', 'kiosk_user', 'cash_desk_operator', 'api_client', 'automated_process', 'maintenance', 'unknown']
    }),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    
    // Additional notes for manual entries or special cases
    notes: text('notes'),
    
    // Processing status for events that might need follow-up
    processingStatus: varchar('processing_status', { 
        length: 20,
        enum: ['pending', 'processed', 'failed', 'requires_attention']
    }).default('processed'),
    processingError: text('processing_error'),
    processingDuration: integer('processing_duration_ms'), // For performance tracking
    
    // Standard timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Type exports for use in handlers
export type DeviceHistory = typeof deviceHistory.$inferSelect;
export type NewDeviceHistory = typeof deviceHistory.$inferInsert;

// Zod schemas for validation
export const NewDeviceHistorySchema = createInsertSchema(deviceHistory);
export const DeviceHistorySchema = createSelectSchema(deviceHistory);

/**
 * Helper function to create standardized device history entries
 */
export const createDeviceHistoryEntry = (data: {
    deviceSerial: string;
    eventType: NonNullable<NewDeviceHistory['eventType']>;
    locationType?: NewDeviceHistory['locationType'];
    locationId?: string;
    locationName?: string;
    resortId?: number;
    orderId?: number;
    sessionId?: number;
    clientId?: number;
    statusBefore?: string;
    statusAfter?: string;
    eventDetails?: NewDeviceHistory['eventDetails'];
    initiatedBy?: NewDeviceHistory['initiatedBy'];
    userAgent?: string;
    ipAddress?: string;
    notes?: string;
    processingStatus?: NonNullable<NewDeviceHistory['processingStatus']>;
}): NewDeviceHistory => ({
    deviceSerial: data.deviceSerial,
    eventType: data.eventType,
    eventTimestamp: new Date(),
    locationType: data.locationType || 'unknown',
    locationId: data.locationId,
    locationName: data.locationName,
    resortId: data.resortId,
    orderId: data.orderId,
    sessionId: data.sessionId,
    clientId: data.clientId,
    statusBefore: data.statusBefore,
    statusAfter: data.statusAfter,
    eventDetails: data.eventDetails || {},
    initiatedBy: data.initiatedBy || 'unknown',
    userAgent: data.userAgent,
    ipAddress: data.ipAddress,
    notes: data.notes,
    processingStatus: data.processingStatus || 'processed',
});
