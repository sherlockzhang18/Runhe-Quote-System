import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

// Example table - you can modify this based on your needs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Export the schema
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
