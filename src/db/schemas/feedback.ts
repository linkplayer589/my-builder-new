import { json, pgTable, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { clients } from '@/db/schemas/clients';
import type { FeedbackFormSubmission } from '@/types/general-types';

export const feedback = pgTable('feedback', {
    id: serial('id').primaryKey().unique(),
    clientId: integer('client_id').references(() => clients.id),
    feedback: json('feedback').$type<FeedbackFormSubmission>(),
    createdAt: timestamp('created_at').defaultNow(),
});

export type Feedback = typeof feedback.$inferSelect
export type NewFeedback = typeof feedback.$inferInsert
export const NewFeedbackSchema = createInsertSchema(feedback)
export const FeedbackSchema = createSelectSchema(feedback) 