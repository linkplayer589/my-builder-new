import type { SkiDataConsumerCategory, SkiDataProduct, SkidataValidityCategory } from "@/types/skidata-types";
import { integer, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { resorts } from './resorts';

// Used to cache catalogs from Skidata for resorts so that clients have faster access to data.
export const catalogs = pgTable('catalogs', {
    id: text('id').primaryKey().notNull(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    version: integer('version').notNull(),
    productsXml: text('products_xml').notNull(),
    productsData: json('products_data').notNull().$type<SkiDataProduct[]>(),
    consumerCategoriesXml: text('consumer_categories_xml').notNull(),
    consumerCategories: json('consumer_categories').notNull().$type<SkiDataConsumerCategory[]>(),
    validityCategoriesXml: text('validity_categories_xml').notNull(),
    validityCategories: json('validity_categories').notNull().$type<SkidataValidityCategory[]>(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
    createdAt: timestamp('created_at').defaultNow(),
});
export type Catalog = typeof catalogs.$inferSelect
export type NewCatalog = typeof catalogs.$inferInsert
export const NewCatalogSchema = createInsertSchema(catalogs)
export const CatalogSchema = createSelectSchema(catalogs)