import { boolean, timestamp, varchar, pgTable } from 'drizzle-orm/pg-core';

export const tasks = pgTable("tasks", {
    id: varchar("id", { length: 30 })
        .primaryKey(),
    code: varchar("code", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 128 }),
    status: varchar("status", {
        length: 30,
        enum: ["todo", "in-progress", "done", "canceled"],
    })
        .notNull()
        .default("todo"),
    label: varchar("label", {
        length: 30,
        enum: ["bug", "feature", "enhancement", "documentation"],
    })
        .notNull()
        .default("bug"),
    priority: varchar("priority", {
        length: 30,
        enum: ["low", "medium", "high"],
    })
        .notNull()
        .default("low"),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert 