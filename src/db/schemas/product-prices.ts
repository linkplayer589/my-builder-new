import { json, pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { resorts } from '@/db/schemas/resorts';
import { consumerCategories } from '@/db/schemas/consumer-categories';
import { products } from '@/db/schemas/products';
import type { SkidataCalculatedPrice } from '@/types/skidata-types';


export const productPrices = pgTable('product_prices', {
    id: serial('id').primaryKey().unique(),
    productId: text('product_id').references(() => products.id).notNull(),
    consumerCategoryId: text('consumer_category_id').references(() => consumerCategories.id).notNull(),
    pricingDate: text('pricing_date').notNull(),
    price: json('price').notNull().$type<SkidataCalculatedPrice>(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type ProductPrice = typeof productPrices.$inferSelect
export type NewProductPrice = typeof productPrices.$inferInsert
export const NewProductPriceSchema = createInsertSchema(productPrices)
export const ProductPriceSchema = createSelectSchema(productPrices) 