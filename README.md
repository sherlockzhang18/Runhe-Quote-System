# 半自动报价系统 (Semi-Automatic Quote System)

> 基于 Next.js + TypeScript + PostgreSQL 构建的智能管板加工报价管理系统

## 🎯 系统概述

半自动报价系统是一个专为管板加工制造业设计的报价管理工具，通过预设的单价表自动计算零件报价，支持 Excel 数据导入和灵活的报价导出功能。系统能够智能匹配钻孔、攻螺纹、抠槽等工艺的价格，大幅提升报价效率。

## ✨ 核心功能

### 🤖 智能自动定价
- **多维度价格匹配**: 基于材质、厚度、孔径、孔数的复合匹配算法
- **业务逻辑智能化**: 自动区分ABS/非ABS材质的不同匹配策略
- **实时价格计算**: 参数变化时动态更新总价和分项明细
- **多年份价格支持**: F25/F26/F27/F28 历史价格查询

### 📊 完整业务流程
- **单价表管理**: Excel批量导入/导出、数据CRUD操作
- **报价创建**: 带自动定价的可视化报价创建流程
- **报价管理**: 列表查看、搜索筛选、状态管理
- **数据导出**: 专业格式的CSV报价单导出

### 🔐 企业级特性
- **用户认证**: JWT + bcrypt 安全认证体系
- **权限控制**: 基于角色的访问控制
- **数据安全**: SQL注入防护、XSS攻击防护
- **审计跟踪**: 完整的操作日志记录

## 🏗️ 技术架构

### 技术栈
```
前端: Next.js 15 + TypeScript + Material-UI v7
后端: Next.js API Routes + Drizzle ORM  
数据库: PostgreSQL 15
认证: JWT + bcrypt
文件处理: xlsx 库 (Excel导入/导出)
部署: Docker + Docker Compose
```

### 项目结构
```
📦 semiauto_quote_system/
├── 📁 pages/                          # Next.js 页面 (Page Router)
│   ├── 🏠 index.tsx                   # 系统仪表板
│   ├── 🔐 login.tsx                   # 用户登录页
│   ├── 💰 price-management.tsx        # 单价表管理
│   ├── 📊 quotes/                     # 报价管理模块
│   │   ├── index.tsx                  # 报价列表
│   │   ├── create.tsx                 # 创建报价 (含自动定价)
│   │   ├── [id].tsx                   # 报价详情
│   │   └── [id]/edit.tsx              # 编辑报价
│   └── 🔌 api/                        # API 接口层
│       ├── auth/                      # 认证接口
│       ├── dashboard/                 # 仪表板数据
│       ├── price-items/               # 单价管理接口
│       └── quotes/                    # 报价管理接口
├── 📁 components/                      # React 组件库
├── 📁 lib/                           # 工具库和数据库连接
├── 📁 drizzle/                       # 数据库配置和迁移
├── 📁 docs/                          # 项目文档
├── 🐳 docker-compose.yml             # Docker 配置
└── 📖 README.md                      # 项目文档
```

## 📊 数据库设计

### 核心三表结构

#### 1. users (用户表)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. price_items (单价表)
```sql
CREATE TABLE price_items (
  id SERIAL PRIMARY KEY,
  category1 VARCHAR(50) NOT NULL,        -- 钻孔/抠槽/螺纹盲孔/螺纹通孔
  category2 VARCHAR(50),                 -- ABS/非ABS (可空)
  category3 VARCHAR(50),                 -- 尖底/平底 (可空)
  material VARCHAR(100),                 -- 不锈钢/普通材质/09MnNiDⅢ
  thickness INTEGER,                     -- 管板厚度
  min_hole_diameter DECIMAL(10,2),       -- 最小孔径
  max_hole_diameter DECIMAL(10,2),       -- 最大孔径
  min_holes INTEGER,                     -- 最小孔数
  max_holes INTEGER,                     -- 最大孔数
  f25_price DECIMAL(10,4),               -- F25年份单价
  f26_price DECIMAL(10,4),               -- F26年份单价
  f27_price DECIMAL(10,4),               -- F27年份单价
  f28_price DECIMAL(10,4),               -- F28年份单价
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. quotes (报价表)
```sql
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- 基本信息
  project_name VARCHAR(200),
  customer_name VARCHAR(200),
  
  -- 规格信息
  old_material_code VARCHAR(100),
  sap_material_code VARCHAR(100),
  material_description VARCHAR(200),     -- ABS/非ABS
  version_number VARCHAR(50),
  processing_content VARCHAR(200),
  tube_plate_material VARCHAR(100),      -- 管板材质
  price_year VARCHAR(10),                -- F25/F26/F27/F28
  
  -- 尺寸信息
  thickness INTEGER,                     -- 厚度
  length_or_diameter DECIMAL(10,2),      -- 长/直径
  width DECIMAL(10,2),                   -- 宽
  
  -- 钻孔信息
  drilling_hole_diameter DECIMAL(10,2),  -- 钻孔孔径
  drilling_hole_count INTEGER,           -- 钻孔孔数
  drilling_unit_price VARCHAR(20),       -- 钻孔单价
  
  -- 螺纹信息
  thread_category VARCHAR(50),           -- 螺纹类别
  thread_specification VARCHAR(50),      -- 螺纹规格
  thread_hole_count INTEGER,             -- 螺纹孔数
  category3 VARCHAR(50),                 -- 类别三
  threading_unit_price VARCHAR(20),      -- 螺纹单价
  
  -- 抠槽信息
  grooving_hole_count INTEGER,           -- 抠槽孔数
  grooving_unit_price VARCHAR(20),       -- 抠槽单价
  
  -- 管理信息
  total_price VARCHAR(20),               -- 总价
  notes TEXT,                            -- 备注
  status VARCHAR(20) DEFAULT 'draft',    -- draft/confirmed/exported
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## � 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+
- Docker (可选)

### 1. 克隆项目
```bash
git clone <repository-url>
cd semiauto_quote_system
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env.local` 文件：
```env
# 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/quotes_db

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# 环境标识
NODE_ENV=development
```

### 4. 数据库设置

#### 方式一：使用 Docker (推荐)
```bash
# 启动 PostgreSQL 数据库
docker-compose up postgres -d
```

#### 方式二：本地 PostgreSQL
确保本地安装了 PostgreSQL 15+，并创建数据库。

### 5. 数据库迁移
```bash
# 生成迁移文件
npm run drizzle:generate

# 执行迁移
npm run drizzle:migrate
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用系统。

## 📋 核心功能详解

### 🤖 智能自动定价系统

#### 定价算法逻辑

**钻孔价格匹配**
```javascript
匹配条件：
- category1 = "钻孔"
- category2 = 物料描述 (ABS/非ABS)  
- material = 管板材质
- thickness = 厚度 (精确匹配)
- hole_diameter ∈ [min_hole_diameter, max_hole_diameter]
- hole_count ∈ [min_holes, max_holes]

返回: 对应年份单价 (F25/F26/F27/F28)
```

**螺纹价格匹配**
```javascript
匹配条件：
- category1 = 螺纹类别 (螺纹盲孔/螺纹通孔)
- category2 = 物料描述 (ABS/非ABS)
- category3 = 类别三 (尖底/平底)
- hole_diameter ∈ [min_hole_diameter, max_hole_diameter]
- material = 管板材质 (仅ABS材质时验证)

特殊规则：
- ABS材质: 需要验证管板材质
- 非ABS材质: 跳过管板材质验证
- 所有螺纹: 不检查孔数范围限制
```

**抠槽价格匹配**
```javascript
匹配条件：
- category1 = "抠槽"
- category2 = 物料描述 (ABS/非ABS)
- hole_count ∈ [min_holes, max_holes]

返回: 对应年份单价
```

#### 价格计算公式
```javascript
钻孔费用 = 钻孔单价 × 钻孔孔数
螺纹费用 = 螺纹单价 × 螺纹孔数  
抠槽费用 = 抠槽单价 × 抠槽孔数
总价 = 钻孔费用 + 螺纹费用 + 抠槽费用
```

### � 使用流程

#### 1. 单价表数据准备
```
1️⃣ 管理员登录系统 (/login)
2️⃣ 进入单价管理页面 (/price-management)
3️⃣ 上传Excel单价表文件
4️⃣ 系统验证并批量导入数据
5️⃣ 查看和管理单价记录
```

#### 2. 自动化报价创建
```
1️⃣ 进入报价创建页面 (/quotes/create)
2️⃣ 填写基本规格信息:
   - 项目名称、客户名称
   - 物料描述 (ABS/非ABS)
   - 管板材质、厚度
   - 价格年份 (F25-F28)
3️⃣ 输入加工参数:
   - 钻孔: 孔径、孔数
   - 螺纹: 类别、规格、孔数、类别三
   - 抠槽: 孔数
4️⃣ 点击 🚀 自动获取价格
5️⃣ 系统智能匹配并填入单价
6️⃣ 实时计算和显示总价
7️⃣ 保存报价单
```

#### 3. 报价管理操作
```
1️⃣ 查看报价列表 (/quotes)
2️⃣ 搜索和筛选报价 (支持多条件)
3️⃣ 查看报价详情 (/quotes/[id])
4️⃣ 编辑报价信息 (/quotes/[id]/edit)
5️⃣ 导出CSV报价单
6️⃣ 管理报价状态 (草稿→已确认→已导出)
```

## 🔌 API 接口文档

### 认证接口
```
POST /api/auth/login     # 用户登录
POST /api/auth/logout    # 用户登出  
GET  /api/auth/me        # 获取当前用户信息
```

### 仪表板接口
```
GET  /api/dashboard/stats # 获取系统统计数据
```

### 单价管理接口
```
GET    /api/price-items          # 获取单价列表 (分页、搜索)
POST   /api/price-items/import   # Excel批量导入
GET    /api/price-items/[id]     # 获取单价详情
PUT    /api/price-items/[id]     # 更新单价记录
DELETE /api/price-items/[id]     # 删除单价记录
```

### 报价管理接口
```
GET    /api/quotes               # 获取报价列表 (分页、搜索)
POST   /api/quotes               # 创建新报价
GET    /api/quotes/[id]          # 获取报价详情
PUT    /api/quotes/[id]          # 更新报价信息
DELETE /api/quotes/[id]          # 删除报价
GET    /api/quotes/[id]/export   # 导出报价CSV
GET    /api/quotes/[id]/print    # 生成打印页面
POST   /api/quotes/price-match   # 智能价格匹配
```

### 价格匹配 API 示例

**请求 (`POST /api/quotes/price-match`)**
```json
{
  "priceYear": "f28",
  "drillingParams": {
    "materialDescription": "ABS",
    "tubePlateMaterial": "不锈钢", 
    "thickness": 25,
    "holeDiameter": 12.5,
    "holeCount": 100
  },
  "threadingParams": {
    "threadCategory": "螺纹盲孔",
    "materialDescription": "非ABS",
    "holeSpecification": 16,
    "category3": "尖底"
    // 注意: 非ABS材质不需要 tubePlateMaterial
    // 注意: 螺纹价格不检查 holeCount 范围
  },
  "groovingParams": {
    "materialDescription": "ABS",
    "holeCount": 50
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "drillingPrice": "1.25",
    "threadingPrice": "2.80",
    "groovingPrice": "0.95"
  },
  "matches": {
    "drilling": { "id": 123, "thickness": 25, "material": "不锈钢" },
    "threading": { "id": 456, "category3": "尖底" },
    "grooving": { "id": 789, "maxHoles": 100 }
  }
}
```

## 🎨 用户界面

### 设计特色
- **现代化设计**: 基于 Material-UI 的现代化界面
- **响应式布局**: 完美适配桌面和移动设备
- **直观操作**: 可视化的操作流程和实时反馈
- **无障碍设计**: 支持键盘导航和屏幕阅读器

### 核心页面展示

#### 🏠 系统仪表板 (`/`)
- 系统概览统计: 报价总数、用户数量、单价记录数
- 最近报价列表
- 快捷操作入口
- 系统状态监控

#### 💰 单价管理 (`/price-management`)
- Excel文件拖拽上传
- 单价数据表格展示
- 多维度搜索筛选
- 批量数据操作

#### 📊 报价列表 (`/quotes`)
- 分页报价列表
- 高级搜索功能
- 状态筛选和排序
- 批量操作 (导出、删除)

#### 🚀 创建报价 (`/quotes/create`)
- 分步骤创建流程
- 实时价格预览
- 智能自动定价按钮
- 表单验证和错误提示

## �️ 安全性设计

### 认证与授权
- **JWT Token 认证**: 无状态的安全认证机制
- **密码加密**: 使用 bcrypt 进行密码哈希存储
- **会话管理**: 自动过期和刷新机制
- **路由保护**: RouteGuard 组件保护敏感页面

### 数据安全
- **SQL 注入防护**: Drizzle ORM 参数化查询
- **XSS 攻击防护**: 输入验证和输出转义
- **CSRF 保护**: 基于 SameSite cookie 的保护
- **文件上传安全**: 文件类型和大小限制验证

### API 安全
- **请求验证**: 统一的输入验证中间件
- **错误处理**: 安全的错误信息返回
- **访问控制**: 基于角色的 API 访问控制
- **审计日志**: 关键操作的审计跟踪

## 📈 性能优化

### 前端优化
- **代码分割**: 基于页面的懒加载
- **缓存策略**: 静态资源和数据缓存
- **优化渲染**: React.memo 和 useMemo 优化
- **打包优化**: webpack 配置优化

### 后端优化
- **数据库索引**: 关键查询字段建立索引
- **分页查询**: 大数据量的分页处理
- **连接池**: PostgreSQL 连接池管理
- **查询优化**: SQL 查询语句优化

### 部署优化
- **Docker 容器化**: 统一的部署环境
- **多阶段构建**: 优化镜像大小
- **健康检查**: 容器健康状态监控
- **日志管理**: 结构化日志输出

## 🚀 部署指南

### 开发环境部署
```bash
# 1. 启动数据库
docker-compose up postgres -d

# 2. 安装依赖
npm install

# 3. 数据库迁移
npm run drizzle:migrate

# 4. 启动开发服务器
npm run dev
```

### 生产环境部署
```bash
# 1. 构建并启动完整应用栈
docker-compose up --build -d

# 2. 应用将在 http://localhost:3000 运行

# 3. 查看日志
docker-compose logs -f app
```

### Docker Compose 配置
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quotes_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/quotes_db
      JWT_SECRET: your-production-secret
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## 📊 系统监控

### 关键指标
- **响应时间**: API 接口响应时间监控
- **错误率**: 4xx/5xx 错误率统计
- **数据库性能**: 查询时间和连接数监控
- **内存使用**: 应用内存使用情况

### 日志管理
- **结构化日志**: JSON 格式的日志输出
- **日志级别**: DEBUG/INFO/WARN/ERROR 分级
- **错误追踪**: 详细的错误栈信息
- **审计日志**: 用户操作审计记录

## 🔧 开发指南

### 代码规范
- **TypeScript**: 严格的类型检查
- **ESLint**: 代码风格和质量检查
- **Prettier**: 代码格式化 (待配置)
- **Husky**: Git hooks 自动化检查 (待配置)

### 开发工作流
```bash
# 1. 功能分支开发
git checkout -b feature/new-feature

# 2. 开发和测试
npm run dev
npm run lint

# 3. 数据库变更
npm run drizzle:generate
npm run drizzle:migrate

# 4. 提交和合并
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 扩展开发
- **新增页面**: 在 `pages/` 目录下创建新页面
- **新增 API**: 在 `pages/api/` 目录下创建 API 路由
- **新增组件**: 在 `components/` 目录下创建可复用组件
- **数据库更改**: 修改 `drizzle/schema.ts` 并生成迁移

## 📚 学习资源

### 技术文档
- [Next.js 官方文档](https://nextjs.org/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Material-UI 文档](https://mui.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

### 项目文档
- [自动定价功能使用指南](./docs/AUTO_PRICING_GUIDE.md)
- [开发完成总结](./docs/DEVELOPMENT_SUMMARY.md)
- [系统功能状态](./docs/SYSTEM_STATUS.md)
- [螺纹逻辑调整说明](./docs/THREADING_LOGIC_UPDATE.md)

## 🤝 贡献指南

### 开发环境设置
1. Fork 项目仓库
2. 克隆到本地: `git clone <your-fork>`
3. 安装依赖: `npm install`
4. 创建功能分支: `git checkout -b feature/amazing-feature`
5. 提交更改: `git commit -m 'Add amazing feature'`
6. 推送分支: `git push origin feature/amazing-feature`
7. 创建 Pull Request

### 代码贡献
- 遵循现有的代码风格
- 添加适当的测试覆盖
- 更新相关文档
- 确保所有检查通过

## 📝 更新日志

### v1.0.0 (2025-09-09)
- ✅ 完成核心业务功能开发
- ✅ 智能自动定价系统
- ✅ 完整的报价管理流程
- ✅ Excel 导入/导出功能
- ✅ 现代化用户界面
- ✅ 安全认证体系

### 后续规划
- [ ] 单元测试和集成测试
- [ ] 性能监控和优化
- [ ] 多语言支持 (i18n)
- [ ] 移动端 App 开发
- [ ] 高级报表和分析功能

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与联系

- **项目仓库**: [GitHub Repository](https://github.com/sherlockzhang18/Runhe-Quote-System)
- **问题反馈**: [GitHub Issues](https://github.com/sherlockzhang18/Runhe-Quote-System/issues)
- **技术支持**: 通过 GitHub Issues 或项目维护者联系

---

<div align="center">

Made] by [sherlockzhang18](https://github.com/sherlockzhang18)

</div>
