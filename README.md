# 半自动报价系统 (Semi-Automatic Quote System)

基于 Next.js + TypeScript + PostgreSQL 构建的智能报价管理系统

## 🎯 系统概述

半自动报价系统是一个专为制造业设计的报价管理工具，通过预设的单价表自动计算零件报价，支持 Excel 数据导入和灵活的报价导出功能。

## 🏗️ 系统架构

### 技术栈
- **前端**: Next.js 15 + TypeScript + Material-UI/Ant Design
- **后端**: Next.js API Routes + Drizzle ORM
- **数据库**: PostgreSQL 15
- **认证**: JWT + bcrypt
- **文件处理**: xlsx 库 (Excel 导入/导出)
- **部署**: Docker + Docker Compose

### 核心功能模块
1. **用户认证系统** - 管理员登录验证
2. **单价表管理** - Excel 导入和数据管理
3. **报价引擎** - 自动价格匹配计算
4. **报价单管理** - 创建、编辑、导出报价
5. **数据导入/导出** - Excel 文件处理

## 📊 数据库设计

### 核心三表结构

#### 1. users (用户表)
```sql
- id: 主键
- username: 用户名 (唯一)
- password_hash: 密码哈希
- role: 角色 (admin)
- created_at, updated_at: 时间戳
```

#### 2. price_items (单价表)
```sql
- id: 主键
- category1, category2, category3: 列别分类
- material: 管板材质
- thickness: 管板厚度
- min_hole_distance, max_hole_distance: 孔距范围
- min_holes, max_holes: 孔数范围
- f25_price, f26_price, f27_price, f28_price: 各年份单价
- threading_price: 攻螺纹单价
- grooving_price: 抠槽单价
- created_at, updated_at: 时间戳
```

#### 3. quotes (报价表)
```sql
- id: 主键
- quote_number: 报价单号 (唯一)
- project_name: 项目名称
- customer_name: 客户名称
- item_code: 零件编号
- description: 描述
- specifications: 规格参数 (JSONB)
- quantity: 数量
- unit_price: 单价 (自动匹配)
- threading_price: 攻螺纹单价 (自动匹配)
- grooving_price: 抠槽单价 (自动匹配)
- subtotal: 小计 (自动计算)
- notes: 备注
- status: 状态 (draft/confirmed/exported)
- created_by: 创建人
- created_at, updated_at: 时间戳
```

## 🔧 核心功能设计

### 1. Excel 数据导入流程
```
1. 管理员上传 Excel 单价表文件
2. 系统解析文件结构和数据
3. 数据验证和格式转换
4. 批量导入到 price_items 表
5. 支持覆盖或追加现有数据
```

### 2. 价格匹配算法
```javascript
匹配条件：
- category1, category2, category3 (精确匹配)
- material (材质精确匹配)
- thickness (厚度精确匹配)
- hole_distance (在 min_hole_distance 和 max_hole_distance 范围内)
- hole_count (在 min_holes 和 max_holes 范围内)

返回结果：
- unit_price: 对应年份单价 (F25/F26/F27/F28)
- threading_price: 攻螺纹单价
- grooving_price: 抠槽单价
```

### 3. 报价计算逻辑
```javascript
小计 = (单价 + 攻螺纹单价 + 抠槽单价) × 数量
```

## 📋 页面结构设计

### 主要页面
```
/login                    # 登录页面
/ (dashboard)            # 系统概览和快捷操作
/price-management        # 单价表管理
  ├── Excel 上传功能
  ├── 单价表查看和搜索
  └── 单条记录编辑
/quotes                  # 报价管理
  ├── /list             # 报价单列表
  ├── /create           # 创建新报价
  ├── /[id]             # 查看报价详情
  ├── /[id]/edit        # 编辑报价
  └── /export           # 批量导出功能
/settings                # 系统设置
```

### 用户操作流程
1. **管理员登录** → 进入系统
2. **单价表管理** → 上传 Excel 文件导入单价数据
3. **创建报价** → 输入零件规格参数
4. **自动匹配** → 系统自动匹配对应单价
5. **确认报价** → 检查和调整报价信息
6. **导出报价** → 选择报价单导出为 Excel

## 🔌 API 接口设计

### 认证接口
```
POST /api/auth/login     # 用户登录
POST /api/auth/logout    # 用户登出
GET  /api/auth/me        # 获取当前用户信息
```

### 单价管理接口
```
POST /api/price-items/import    # Excel 导入
GET  /api/price-items          # 获取单价列表 (分页、搜索)
GET  /api/price-items/search   # 价格匹配查询
PUT  /api/price-items/[id]     # 编辑单价记录
DELETE /api/price-items/[id]   # 删除单价记录
```

### 报价管理接口
```
GET  /api/quotes               # 获取报价列表
POST /api/quotes               # 创建新报价
GET  /api/quotes/[id]         # 获取报价详情
PUT  /api/quotes/[id]         # 更新报价
DELETE /api/quotes/[id]       # 删除报价
POST /api/quotes/export       # 导出选中报价
POST /api/quotes/price-match  # 实时价格匹配
```

## 🚀 部署说明

### 开发环境
```bash
# 启动 PostgreSQL 数据库
docker-compose up postgres -d

# 安装依赖
npm install

# 运行数据库迁移
npm run drizzle:migrate

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建并启动完整应用栈
docker-compose up --build -d

# 应用将在 http://localhost:3000 运行
```

## 📁 项目结构
```
├── drizzle/              # 数据库配置和迁移
├── lib/                  # 工具库和数据库连接
├── pages/                # Next.js 页面 (Page Router)
│   ├── api/             # API 路由
│   ├── auth/            # 认证页面
│   ├── price-management/ # 单价管理页面
│   └── quotes/          # 报价管理页面
├── components/           # React 组件
├── styles/              # 样式文件
├── docker-compose.yml   # Docker 配置
└── README.md           # 项目文档
```

## 🔐 安全性设计
- JWT Token 认证机制
- 管理员权限验证
- 数据库连接加密
- 文件上传安全验证
- API 接口访问控制

## 📈 扩展性考虑
- 支持多版本单价表管理
- 报价模板自定义
- 批量操作优化
- 数据统计和分析功能
- 多用户角色支持

---

## 开发状态
- [x] 项目初始化和 Docker 配置
- [ ] 数据库设计和迁移
- [ ] 用户认证系统
- [ ] 单价表管理功能
- [ ] 报价引擎开发
- [ ] Excel 导入/导出功能
- [ ] 前端界面开发
- [ ] 系统测试和优化

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
