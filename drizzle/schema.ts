import { pgTable, serial, varchar, decimal, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 单价表
export const priceItems = pgTable('price_items', {
  id: serial('id').primaryKey(),
  category1: varchar('category1', { length: 50 }),
  category2: varchar('category2', { length: 50 }),
  category3: varchar('category3', { length: 50 }),
  material: varchar('material', { length: 100 }),
  thickness: decimal('thickness', { precision: 10, scale: 2 }),
  minHoleDistance: decimal('min_hole_distance', { precision: 10, scale: 2 }),
  maxHoleDistance: decimal('max_hole_distance', { precision: 10, scale: 2 }),
  minHoles: integer('min_holes'),
  maxHoles: integer('max_holes'),
  f25Price: decimal('f25_price', { precision: 10, scale: 4 }),
  f26Price: decimal('f26_price', { precision: 10, scale: 4 }),
  f27Price: decimal('f27_price', { precision: 10, scale: 4 }),
  f28Price: decimal('f28_price', { precision: 10, scale: 4 }),
  threadingPrice: decimal('threading_price', { precision: 10, scale: 4 }),
  groovingPrice: decimal('grooving_price', { precision: 10, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 报价表
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  quoteNumber: varchar('quote_number', { length: 50 }).notNull().unique(),
  projectName: varchar('project_name', { length: 200 }),
  customerName: varchar('customer_name', { length: 100 }),
  itemCode: varchar('item_code', { length: 100 }),
  description: text('description'),
  specifications: jsonb('specifications'), // 存储规格参数
  quantity: integer('quantity'),
  unitPrice: decimal('unit_price', { precision: 10, scale: 4 }),
  threadingPrice: decimal('threading_price', { precision: 10, scale: 4 }),
  groovingPrice: decimal('grooving_price', { precision: 10, scale: 4 }),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).default('draft'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 类型导出
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type PriceItem = typeof priceItems.$inferSelect
export type NewPriceItem = typeof priceItems.$inferInsert
export type Quote = typeof quotes.$inferSelect
export type NewQuote = typeof quotes.$inferInsert
