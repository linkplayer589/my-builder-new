import type { SkidataCalculatedPrice } from '@/types/skidata-types';
import { integer, json, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { resorts } from '@/db/schemas/resorts';


// Used to store sales channels for resorts.
export const salesChannels = pgTable('sales_channels', {
    id: serial('id').primaryKey().unique().notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    name: text('name').notNull(),
    type: text('type').$type<'web' | 'kiosk'>().notNull(),
    activeProductIds: text('active_product_ids').array(),
    activeConsumerCategoryIds: text('active_consumer_category_ids').array(),
    lifepassPrice: json('lifepass_price').$type<SkidataCalculatedPrice>().notNull(),
    insurancePrice: json('insurance_price').$type<SkidataCalculatedPrice>().notNull(),
    depotTickets: boolean('depot_tickets').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});
export type SalesChannel = typeof salesChannels.$inferSelect
export type NewSalesChannel = typeof salesChannels.$inferInsert
export const NewSalesChannelSchema = createInsertSchema(salesChannels)
export const SalesChannelSchema = createSelectSchema(salesChannels)