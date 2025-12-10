import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const devices = pgTable('devices', {
    id: serial('id').primaryKey().unique().notNull(),
    luhn: text('luhn').notNull(),
    serial: text('serial').notNull().unique(),
    chipId: text('chip_id').notNull(),
    hex: text('hex').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type Device = typeof devices.$inferSelect
export type NewDevice = typeof devices.$inferInsert
export const NewDeviceSchema = createInsertSchema(devices)
export const DeviceSchema = createSelectSchema(devices) 