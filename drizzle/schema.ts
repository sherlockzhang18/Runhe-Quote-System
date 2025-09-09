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
  category1: varchar('category1', { length: 50 }).notNull(), // 钻孔/扣槽/螺纹盲孔/螺纹通孔 - 必填
  category2: varchar('category2', { length: 50 }), // ABS/非ABS - 可空
  category3: varchar('category3', { length: 50 }), // 尖底/平底 - 可空
  material: varchar('material', { length: 100 }), // 不锈钢/普通材质/09MnNiDⅢ - 可空
  thickness: decimal('thickness', { precision: 10, scale: 2 }), // 厚度 - 可空
  minHoleDiameter: decimal('min_hole_diameter', { precision: 10, scale: 2 }), // 最小孔径 - 可空
  maxHoleDiameter: decimal('max_hole_diameter', { precision: 10, scale: 2 }), // 最大孔径 - 可空
  minHoles: integer('min_holes'), // 最小孔数 - 可空
  maxHoles: integer('max_holes'), // 最大孔数 - 可空
  f25Price: decimal('f25_price', { precision: 10, scale: 4 }), // F25单价 - 可空
  f26Price: decimal('f26_price', { precision: 10, scale: 4 }), // F26单价 - 可空
  f27Price: decimal('f27_price', { precision: 10, scale: 4 }), // F27单价 - 可空
  f28Price: decimal('f28_price', { precision: 10, scale: 4 }), // F28单价 - 可空
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
