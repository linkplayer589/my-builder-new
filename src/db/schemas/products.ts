import { boolean, json, pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type SkiDataProduct } from '@/types/skidata-types';
import { type LocalizedText } from '@/types/general-types';
import { resorts } from '@/db/schemas/resorts';


export const products = pgTable('products', {
    id: text('id').primaryKey().unique().notNull(),
    active: boolean('active').default(false),
    titleTranslations: json('title_translations').$type<LocalizedText>(),
    descriptionTranslations: json('description_translations').$type<LocalizedText>(),
    productData: json('product_data').$type<SkiDataProduct>().notNull(),
    additionalInfo: json('additional_info'),
    resortId: integer('resort_id').references(() => resorts.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export const NewProductSchema = createInsertSchema(products)
export const ProductSchema = createSelectSchema(products)

