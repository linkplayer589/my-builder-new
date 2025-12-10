import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const clients = pgTable('clients', {
    id: serial('id').primaryKey().unique(),
    name: text('name'),
    email: text('email'),
    mobile: text('mobile').unique(),
    country: text('country'),
    languageCode: text('language_code'),
    stripeClientId: text('stripe_client_id'),
    generatedVerificationCode: text('generated_verification_code').$defaultFn(() => Math.floor(10000 + Math.random() * 90000).toString()).notNull(),
    verified: boolean('verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export const NewClientSchema = createInsertSchema(clients)
export const ClientSchema = createSelectSchema(clients)