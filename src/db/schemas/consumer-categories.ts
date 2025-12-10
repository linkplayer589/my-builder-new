import { integer, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { resorts } from '@/db/schemas/resorts';
import type { SkidataCalculatedPrice } from "@/types/skidata-types";
import type { LocalizedText } from '@/types/general-types';

// Used to store consumer categories for resorts and their translations.
export const consumerCategories = pgTable('consumer_categories', {
    id: text('id').primaryKey().unique().notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    titleTranslations: json('title_translations').$type<LocalizedText>(),
    descriptionTranslations: json('description_translations').$type<LocalizedText>(),
    ageMin: integer('age_min'),
    ageMax: integer('age_max'),
    consumerCategoryData: json('consumer_category_data').notNull(),
    lifepassRentalPricePerDay: json('lifepass_rental_price_per_day').$type<SkidataCalculatedPrice>(),
    insurancePricePerDay: json('insurance_price_per_day').$type<SkidataCalculatedPrice>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});
export type ConsumerCategory = typeof consumerCategories.$inferSelect
export type NewConsumerCategory = typeof consumerCategories.$inferInsert
export const NewConsumerCategorySchema = createInsertSchema(consumerCategories)
export const ConsumerCategorySchema = createSelectSchema(consumerCategories)
