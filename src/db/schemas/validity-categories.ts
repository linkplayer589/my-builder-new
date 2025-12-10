import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { LocalizedText } from "@/types/general-types";
import { resorts } from "@/db/schemas/resorts";
import type { SkidataValidityCategory } from "@/types/skidata-types";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Used to store validity categories for resorts and their translations.
export const validityCategories = pgTable('validity_categories', {
    id: text('id').primaryKey().unique().notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    unitTranslations: json('unit_translations').$type<LocalizedText>(),
    validityCategoryData: json('validity_category_data').$type<SkidataValidityCategory>().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type ValidityCategory = typeof validityCategories.$inferSelect
export type NewValidityCategory = typeof validityCategories.$inferInsert
export const NewValidityCategorySchema = createInsertSchema(validityCategories)
export const ValidityCategorySchema = createSelectSchema(validityCategories)