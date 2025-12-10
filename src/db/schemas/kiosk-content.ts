import { json, pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { LanguageSpecificKioskContent } from '@/types/kiosk-content';
import { resorts } from '@/db/schemas/resorts';

export const kioskContent = pgTable('kiosk_content', {
    id: serial('id').primaryKey().unique().notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    languageCode: text('language_code').notNull(),
    content: json('content').$type<LanguageSpecificKioskContent>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type KioskContent = typeof kioskContent.$inferSelect
export type NewKioskContent = typeof kioskContent.$inferInsert
export const NewKioskContentSchema = createInsertSchema(kioskContent)
export const KioskContentSchema = createSelectSchema(kioskContent) 