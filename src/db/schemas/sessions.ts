import { json, pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apiKeys } from '@/db/schemas/api-keys';

export const sessions = pgTable('sessions', {
    id: serial('id').primaryKey().unique(),
    createdAt: timestamp('created_at').defaultNow(),
    lastActivityAt: timestamp('last_activity_at').defaultNow().$onUpdate(() => new Date()),
    status: text('status'),
    sessionLabel: text('session_label'),
    sessionLog: json('session_log'),
    connectionInfo: json('connection_info'),
    apikeyId: integer('apikey_id').references(() => apiKeys.id),
});

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export const NewSessionSchema = createInsertSchema(sessions)
export const SessionSchema = createSelectSchema(sessions) 