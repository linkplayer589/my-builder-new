import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const apiKeys = pgTable('api_keys', {
    id: serial('id').primaryKey().unique(),
    apiKey: text('api_key').unique(),
    scope: text('scope'),
    notes: text('notes'),
    enabled: boolean('enabled').default(true),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow(),
});

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
export const NewApiKeySchema = createInsertSchema(apiKeys)
export const ApiKeySchema = createSelectSchema(apiKeys)

