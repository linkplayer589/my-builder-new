import { json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { ResortConfig } from '@/types/constants';

export const resorts = pgTable('resorts', {
    id: serial('id').primaryKey().unique().notNull(),
    name: text('name').unique().notNull(),
    config: json('config').notNull().$type<ResortConfig>(),
    stripeSecretKey: text('stripe_secret_key'),
    stripeWebhookSecret: text('stripe_webhook_secret'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type Resort = typeof resorts.$inferSelect
export type NewResort = typeof resorts.$inferInsert
export const NewResortSchema = createInsertSchema(resorts)
export const ResortSchema = createSelectSchema(resorts)
