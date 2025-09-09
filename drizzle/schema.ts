import { pgTable, serial, varchar, decimal, integer, text, timestamp } from 'drizzle-orm/pg-core'

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
  category1: varchar('category1', { length: 50 }).notNull(), // 钻孔/抠槽/螺纹盲孔/螺纹通孔 - 必填
  category2: varchar('category2', { length: 50 }), // ABS/非ABS - 可空
  category3: varchar('category3', { length: 50 }), // 尖底/平底 - 可空
  material: varchar('material', { length: 100 }), // 不锈钢/普通材质/09MnNiDⅢ - 可空
  thickness: integer('thickness'), // 厚度 - 可空
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
  
  // 规格信息
  oldMaterialCode: varchar('old_material_code', { length: 100 }), // 旧物料编号
  sapMaterialCode: varchar('sap_material_code', { length: 100 }), // SAP物料
  materialDescription: varchar('material_description', { length: 200 }), // 物料描述
  versionNumber: varchar('version_number', { length: 50 }), // 版本号
  processingContent: varchar('processing_content', { length: 200 }), // 加工内容
  tubePlateMaterial: varchar('tube_plate_material', { length: 100 }), // 管板材质
  priceYear: varchar('price_year', { length: 10 }), // 年份选择 (f25/f26/f27/f28)
  
  // 基本尺寸信息
  thickness: integer('thickness'), // 厚度
  lengthOrDiameter: decimal('length_or_diameter', { precision: 10, scale: 2 }), // 长/直径
  width: decimal('width', { precision: 10, scale: 2 }), // 宽
  
  // 钻孔信息
  drillingHoleDiameter: decimal('drilling_hole_diameter', { precision: 10, scale: 2 }), // 钻孔孔径
  drillingHoleCount: integer('drilling_hole_count'), // 钻孔孔数
  drillingUnitPrice: decimal('drilling_unit_price', { precision: 10, scale: 4 }), // 钻孔单价
  
  // 攻螺纹信息
  threadCategory: varchar('thread_category', { length: 50 }), // 螺纹类别 (螺纹盲孔/螺纹通孔)
  threadSpecification: decimal('thread_specification', { precision: 10, scale: 2 }), // 螺纹孔型号
  threadHoleCount: integer('thread_hole_count'), // 螺纹孔数
  category3: varchar('category3', { length: 50 }), // 类别三 (尖底/平底)
  threadingUnitPrice: decimal('threading_unit_price', { precision: 10, scale: 4 }), // 攻螺纹单价
  
  // 抠槽信息
  groovingHoleCount: integer('grooving_hole_count'), // 抠槽孔数
  groovingUnitPrice: decimal('grooving_unit_price', { precision: 10, scale: 4 }), // 抠槽单价
  
  // 合计
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }), // 总价 = (钻孔单价*钻孔孔数) + (攻螺纹单价*螺纹孔数) + (抠槽单价*抠槽孔数)
  
  // 其他信息
  projectName: varchar('project_name', { length: 200 }),
  customerName: varchar('customer_name', { length: 100 }),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).default('draft'), // draft/confirmed/exported
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
