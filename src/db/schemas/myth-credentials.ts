import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { resorts } from '@/db/schemas/resorts';

export const mythCredentials = pgTable('myth_credentials', {
    id: serial('id').primaryKey(),
    resortId: integer('resort_id').notNull().references(() => resorts.id),
    apiKey: text('api_key').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type MythCredential = typeof mythCredentials.$inferSelect;
export type NewMythCredential = typeof mythCredentials.$inferInsert; 