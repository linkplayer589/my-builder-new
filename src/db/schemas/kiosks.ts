import { json, pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { resorts } from '@/db/schemas/resorts';


export const kiosks = pgTable('kiosks', {
    id: text('id').primaryKey().unique().notNull(),
    name: text('name').notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    kioskContentIds: integer('kiosk_content_ids').array().notNull(),
    location: json('location').notNull(),
    type: text('type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Kiosk = typeof kiosks.$inferSelect
export type NewKiosk = typeof kiosks.$inferInsert
export const NewKioskSchema = createInsertSchema(kiosks)
export const KioskSchema = createSelectSchema(kiosks)
