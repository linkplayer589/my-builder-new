import { text, timestamp, integer, jsonb, serial } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const tdiSalesItems = pgTable('tdi_sales_items', {
    id: serial('id').primaryKey().notNull(),
    skidataOrderId: text('skidata_order_id').notNull(),
    dataCarrierId: text('data_carrier_id').notNull(),
    lifepassDeviceId: text('lifepass_device_id'),
    resortId: integer('resort_id').notNull(),
    resortName: text('resort_name').notNull(),
    productId: text('product_id').notNull(),
    productName: text('product_name').notNull(),
    categoryId: text('category_id').notNull(),
    validityAreaId: text('validity_area_id').notNull(),
    validFrom: timestamp('valid_from').notNull(),
    validTo: timestamp('valid_to').notNull(),
    salesNotificationEventJson: jsonb('sales_notification_event_json').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});
export type TdiSalesItem = typeof tdiSalesItems.$inferSelect;
export type NewTdiSalesItem = typeof tdiSalesItems.$inferInsert;
export const NewTdiSalesItemSchema = createInsertSchema(tdiSalesItems)
export const TdiSalesItemSchema = createSelectSchema(tdiSalesItems)
