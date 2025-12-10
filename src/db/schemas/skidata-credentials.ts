import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { resorts } from '@/db/schemas/resorts';


export const SkiDataCredentials = pgTable('skidata_credentials', {
    id: serial('id').primaryKey().unique().notNull(),
    name: text('name').notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull().unique(),
    url: text('url').notNull(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    salesChannelShortName: text('sales_channel_short_name').notNull(),
    pointOfSaleName: text('point_of_sale_name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type SkiDataCredential = typeof SkiDataCredentials.$inferSelect
export type NewSkiDataCredential = typeof SkiDataCredentials.$inferInsert
export const NewSkiDataCredentialSchema = createInsertSchema(SkiDataCredentials) 