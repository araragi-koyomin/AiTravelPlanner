# AI 旅行规划师 (AI Travel Planner)

> 基于 AI 的智能旅行规划 Web 应用，通过语音或文字输入，自动生成个性化旅行路线，并提供费用预算管理和云端数据同步功能。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)](https://vitejs.dev/)

## 📖 项目简介

AI 旅行规划师是一款基于人工智能的智能旅行规划工具，旨在简化旅行规划过程。用户可以通过语音或文字输入旅行需求，AI 会自动生成详细的个性化旅行路线，包括交通、住宿、景点、餐厅等详细信息，并提供费用预算管理和云端数据同步功能。

### ✨ 核心特性

- 🤖 **智能行程规划**：基于智谱AI GLM 模型，自动生成个性化旅行路线
- ✏️ **行程编辑**：支持行程项添加、编辑、删除、拖拽排序，完整的撤销/重做功能
- 🎤 **语音输入**：集成科大讯飞语音识别，支持语音输入旅行需求
- 🗺️ **地图展示**：基于高德地图，可视化展示行程路线和景点位置
- 💰 **费用管理**：AI 预算分析，支持手动和语音记录旅行开销
- ☁️ **云端同步**：基于 Supabase，支持多设备数据同步
- 🔒 **安全可靠**：API Key 加密存储，Row Level Security 保护用户数据

## 🎯 项目目标

- 简化旅行规划流程，让用户快速获得个性化旅行方案
- 提供直观的地图交互界面，提升用户体验
- 实现多设备数据同步，方便用户随时随地访问
- 确保用户数据安全，保护用户隐私

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + TypeScript 5.x
- **构建工具**：Vite 5.x
- **状态管理**：Zustand 4.x
- **路由**：React Router 6.x
- **UI 组件**：shadcn/ui
- **样式**：TailwindCSS 3.x
- **HTTP 客户端**：Axios 1.x

### 后端
- **BaaS 平台**：Supabase
- **数据库**：PostgreSQL 15.x
- **认证服务**：Supabase Auth
- **实时同步**：Supabase Realtime
- **Edge Functions**：Deno

### 外部服务
- **大语言模型**：智谱AI GLM-4
- **语音识别**：科大讯飞 Web API
- **地图服务**：高德地图 JavaScript API v2.0

### 部署
- **容器化**：Docker
- **CI/CD**：GitHub Actions
- **镜像仓库**：阿里云容器镜像服务

## 📊 当前开发阶段

### ✅ 阶段1：项目初始化与环境搭建（已完成）

#### ✅ 已完成
- [x] 环境配置（Node.js、pnpm、API Keys）
- [x] 项目脚手架搭建（Vite + React + TypeScript）
- [x] 基础组件开发（Button、Input、Card、Modal、Loading、ErrorBoundary）
- [x] 布局组件开发（Header、Footer、Layout）
- [x] 服务层封装（Supabase、API、类型定义）
- [x] 工具函数开发（cn、加密、日期）
- [x] 配置文件创建（TypeScript、Vite、TailwindCSS、ESLint、Prettier）
- [x] 环境变量配置（Supabase、智谱AI、科大讯飞、高德地图）
- [x] 占位页面开发（Home、Login、Register）
- [x] 路由配置（React Router）
- [x] 全面测试验证（功能、代码质量、构建、API连接、性能、错误处理）

### ✅ 阶段2：Supabase 配置与集成（已完成）

#### ✅ 已完成
- [x] 数据库初始化脚本（001_initial_schema.sql）
- [x] 种子数据脚本（001_seed_data.sql）
- [x] Supabase 服务封装（完整 TypeScript 类型定义）
- [x] Supabase 连接测试工具
- [x] 测试页面开发（SupabaseTest.tsx）
- [x] RLS 策略配置（所有表）
- [x] 数据库索引优化
- [x] 触发器配置（updated_at 自动更新）
- [x] 环境变量配置（.env.example）
- [x] Supabase 集成文档
- [x] 实际数据库验证（在 Supabase Dashboard 中执行 SQL 脚本）
- [x] 全面测试验证（数据库初始化、连接测试、CRUD 操作、RLS 安全、性能测试、错误处理、代码质量）
- [x] 验收报告（Task1.2_ACCEPTANCE_REPORT.md）

### ✅ 阶段3：用户认证与授权系统（已完成）

#### ✅ 已完成
- [x] 集成 Supabase Auth
- [x] 实现登录页面（Login.tsx）
- [x] 实现注册页面（Register.tsx）
- [x] 创建 Auth Store（Zustand）
- [x] 实现路由守卫（ProtectedRoute）
- [x] 实现记住登录状态
- [x] 实现退出登录功能
- [x] 添加表单验证
- [x] 单元测试（auth.test.ts、authStore.test.ts）
- [x] 验收报告（Task1.3-认证系统开发验收报告.md）

### ✅ 阶段4：Supabase 服务封装（已完成）

#### ✅ 已完成
- [x] 行程服务开发（itinerary.ts）
  - [x] CRUD 操作（创建、读取、更新、删除）
  - [x] 行程统计功能
  - [x] 行程搜索功能
  - [x] 行程复制功能
  - [x] 收藏状态切换
- [x] 费用服务开发（expense.ts）
  - [x] CRUD 操作（创建、读取、更新、删除）
  - [x] 批量操作（批量创建、批量删除）
  - [x] 费用统计功能
  - [x] 费用类别汇总
- [x] 设置服务开发（settings.ts）
  - [x] 用户设置 CRUD
  - [x] API Key 加密存储（AES-256-CBC）
  - [x] API Key 解密读取
  - [x] 主题、语言、通知设置
- [x] 加密工具开发（crypto.ts）
  - [x] AES 加密/解密
  - [x] API Key 加密/解密
- [x] 单元测试（159 个测试用例，覆盖率 68.05%）
- [x] SQL 测试脚本（SQL_TEST_SCRIPTS.md）
- [x] 数据库触发器（auth.users 与 public.users 同步）
- [x] 验收报告（Task1.4-Supabase服务封装验收报告.md）

### ✅ 阶段5：智能行程规划核心功能（已完成）

#### ✅ 已完成

**Task 2.1 - 需求输入功能**
- [x] 创建行程数据类型定义（src/types/itinerary.ts）
- [x] 创建表单验证工具（src/utils/itineraryValidation.ts）
- [x] 创建行程规划页面（src/pages/ItineraryPlanner.tsx）
- [x] 实现文字输入表单（目的地、日期、预算、同行人数、旅行偏好、特殊需求）
- [x] 实现实时表单验证
- [x] 实现数据持久化（localStorage）
- [x] 配置代码分割优化
- [x] 完善可访问性（aria-invalid、aria-describedby）
- [x] 单元测试（83 个测试用例，覆盖率 100%）
- [x] 验收报告（Task2.1-需求输入功能验收报告.md）

**Task 2.2 - AI 行程生成集成**
- [x] 创建 Supabase Edge Functions
  - [x] generate-itinerary（行程生成）
  - [x] optimize-itinerary（行程优化）
  - [x] get-recommendations（智能推荐）
  - [x] analyze-budget（预算分析）
- [x] 集成智谱AI GLM-4 API
- [x] 设计 Prompt 模板
- [x] 实现 AI 响应解析
- [x] 实现错误处理和重试机制
- [x] 前端服务层集成（services/ai.ts）
- [x] 行程规划表单集成
- [x] 数据库类型约束修复（添加 shopping 类型）
- [x] 单元测试（278 个测试用例，覆盖率达标）
- [x] 验收报告（Task2.2-AI行程生成集成验收报告.md）

**Task 2.3 - 行程展示功能**
- [x] 创建行程详情页面（ItineraryDetail.tsx）
- [x] 实现列表视图展示
- [x] 实现时间轴视图展示
- [x] 创建行程卡片组件
- [x] 实现每日行程展开/折叠
- [x] 添加行程概览信息
- [x] 更新行程列表页面（Itineraries.tsx）
- [x] 实现骨架屏加载优化
- [x] 路由级代码分割优化
- [x] 单元测试（431 个测试用例，覆盖率达标）
- [x] 验收报告（Task2.3-行程展示功能验收报告.md）

**Task 2.4 - 数据库重构**
- [x] 更新数据库设计文档（DATABASE_DESIGN.md v2.0.0）
- [x] 创建数据库迁移脚本（004-012）
  - [x] 删除 users 表，创建 user_profiles 表
  - [x] 为 itineraries 添加 status、cover_image 字段
  - [x] 重构 itinerary_items 表（date→day，位置字段合并为 location JSONB）
  - [x] 扩展 expenses 表字段
- [x] 更新后端服务层类型定义
- [x] 更新前端类型定义和组件
- [x] 提取 AI Prompt 模板到独立文件
- [x] 更新测试用例适配新数据结构
- [x] 修复废弃列 NOT NULL 约束问题
- [x] 部署 Edge Function 和数据库迁移
- [x] 403 个测试用例全部通过

**Task 2.5 - 高德地图集成**
- [x] 集成高德地图 JavaScript API v2.0
- [x] 创建地图组件（AMap、MapMarker、MapInfoWindow、MapRoute、MapControls）
- [x] 创建地图 Hook（useAMap.ts）
- [x] 创建地图工具函数（mapUtils.ts）
- [x] 创建交通推荐服务（amap.ts）
- [x] 创建 Edge Functions（recommend-transport、check-amap-status、verify-poi）
- [x] 创建行程地图视图（ItineraryMapView.tsx）
- [x] 单元测试（122 个测试用例，100% 通过率）
- [x] 验收报告（Task2.5-高德地图集成验收报告.md）

**Task 2.6 - 行程编辑功能**
- [x] 实现行程项编辑（ItemEditor.tsx）
- [x] 实现行程项添加（AddItemButton.tsx）
- [x] 实现行程项删除（DeleteConfirmModal.tsx）
- [x] 实现拖拽排序（DraggableItemList.tsx + dnd-kit）
- [x] 实现撤销/重做功能（historyManager.ts）
- [x] 实现未保存更改提示（UnsavedChangesModal.tsx）
- [x] 创建编辑状态管理（itineraryEditStore.ts）
- [x] 创建编辑工具栏组件（EditToolbar.tsx）
- [x] 单元测试（287 个测试用例，覆盖率 ~85%）
- [x] 验收报告（Task2.6-行程编辑功能验收报告.md）

**Task 2.7 - 行程列表管理**
- [x] 更新行程列表页面（Itineraries.tsx）
- [x] 实现搜索功能（防抖搜索、关键词匹配）
- [x] 实现筛选功能（日期、目的地、收藏、状态）
- [x] 实现排序功能（多字段排序、方向切换）
- [x] 实现视图切换（网格/列表视图）
- [x] 实现批量操作（全选、批量收藏、批量删除）
- [x] 实现分页功能
- [x] 实现复制行程功能
- [x] 创建状态管理（itineraryListStore.ts）
- [x] 单元测试（287 个测试用例，覆盖率 ~85%）
- [x] 验收报告（Task2.7-行程列表管理验收报告.md）

#### 📋 待开发（按优先级）

**P0 - 核心功能（必须有）**
- [x] 行程保存与管理
- [ ] 费用预算与记录（手动）

**P1 - 增强功能（应该有）**
- [ ] 语音输入功能
- [ ] 语音记录费用
- [ ] 行程导出（PDF/图片）
- [ ] 云端数据同步
- [ ] API Key 设置页面

**P2 - 可选功能（可以有）**
- [ ] 第三方登录（Google、GitHub）
- [ ] 行程收藏功能
- [ ] 主题切换（深色/浅色）
- [ ] 多语言支持
- [ ] 通知功能

## 📁 项目结构

```
AiTravelPlanner/
├── docs/                      # 项目文档
│   ├── PRD.md                 # 产品需求文档
│   ├── TECHNICAL_ARCHITECTURE.md  # 技术架构设计
│   ├── DEVELOPMENT_PLAN.md     # 开发工作计划
│   ├── SECURITY.md            # 安全规范文档
│   ├── LOCAL_SETUP.md         # 本地开发环境搭建指南
│   ├── SUPABASE_SETUP.md      # Supabase 配置指南
│   ├── SUPABASE_INTEGRATION.md # Supabase 集成文档
│   ├── API_CONFIGURATION.md    # 第三方 API 配置指南
│   ├── GIT_WORKFLOW.md       # Git 工作流文档
│   ├── PROMPT_TEMPLATES.md   # Prompt 模板文档
│   ├── TECHNOLOGY_SELECTION.md # 技术选型文档
│   ├── DATABASE_DESIGN.md     # 数据库设计文档
│   ├── DATABASE_DEVELOPMENT_ISSUES.md # 数据库开发常见问题与解决方案
│   ├── DOCKER_DEPLOYMENT.md    # Docker 部署文档
├── src/                       # 源代码
│   ├── assets/               # 静态资源
│   │   └── styles/           # 全局样式
│   │       └── index.css     # 主样式文件
│   ├── components/           # 公共组件
│   │   ├── ui/              # 基础UI组件
│   │   │   ├── Button.tsx   # 按钮组件
│   │   │   ├── Input.tsx    # 输入框组件
│   │   │   ├── Card.tsx     # 卡片组件
│   │   │   ├── Modal.tsx    # 模态框组件
│   │   │   ├── Loading.tsx  # 加载组件
│   │   │   ├── ErrorBoundary.tsx  # 错误边界组件
│   │   │   └── button-variants.ts  # 按钮样式变体
│   │   ├── layout/          # 布局组件
│   │   │   ├── Header.tsx    # 头部组件
│   │   │   ├── Footer.tsx    # 底部组件
│   │   │   └── Layout.tsx    # 主布局组件
│   │   ├── map/             # 地图组件
│   │   │   ├── AMap.tsx      # 地图主组件
│   │   │   ├── MapMarker.tsx # 地图标记组件
│   │   │   ├── MapInfoWindow.tsx # 信息窗组件
│   │   │   ├── MapRoute.tsx  # 路线规划组件
│   │   │   ├── MapControls.tsx # 地图控件组件
│   │   │   ├── MapError.tsx  # 错误展示组件
│   │   │   └── MapLoading.tsx # 加载指示器组件
│   │   └── itinerary/       # 行程组件
│   │       ├── ItineraryMapView.tsx # 行程地图视图
│   │       ├── ListView.tsx  # 列表视图
│   │       ├── TimelineView.tsx # 时间轴视图
│   │       ├── EditToolbar.tsx # 编辑工具栏
│   │       ├── ItemEditor.tsx # 行程项编辑器
│   │       ├── AddItemButton.tsx # 添加按钮
│   │       ├── DeleteConfirmModal.tsx # 删除确认弹窗
│   │       ├── UnsavedChangesModal.tsx # 未保存更改弹窗
│   │       ├── DraggableItemList.tsx # 拖拽排序列表
│   │       ├── ItinerarySearchBar.tsx # 搜索栏组件
│   │       ├── ItineraryFilters.tsx # 筛选组件
│   │       ├── ItinerarySortDropdown.tsx # 排序下拉组件
│   │       ├── ViewToggle.tsx # 视图切换组件
│   │       ├── ItineraryCard.tsx # 行程卡片组件
│   │       ├── ItineraryBatchActions.tsx # 批量操作组件
│   │       ├── Pagination.tsx # 分页组件
│   │       └── CopyItineraryModal.tsx # 复制行程弹窗
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Login.tsx       # 登录页
│   │   ├── Register.tsx    # 注册页
│   │   ├── Itineraries.tsx # 行程列表页
│   │   ├── ItineraryPlanner.tsx # 行程规划页
│   │   └── SupabaseTest.tsx # Supabase 测试页
│   ├── services/            # 服务层
│   │   ├── supabase.ts     # Supabase 客户端
│   │   ├── api.ts          # API 封装
│   │   ├── auth.ts         # 认证服务
│   │   ├── itinerary.ts    # 行程服务
│   │   ├── expense.ts      # 费用服务
│   │   ├── settings.ts     # 设置服务
│   │   ├── ai.ts           # AI 服务
│   │   ├── amap.ts         # 高德地图服务
│   │   ├── amapStatus.ts   # 地图状态服务
│   │   ├── poiSearch.ts    # POI 搜索服务
│   │   └── types.ts        # 类型定义
│   ├── types/               # 类型定义
│   │   ├── itinerary.ts    # 行程数据类型
│   │   ├── map.ts          # 地图类型定义
│   │   └── amap.d.ts       # AMap 全局类型定义
│   ├── stores/              # Zustand 状态管理
│   │   ├── authStore.ts    # 认证状态管理
│   │   ├── itineraryEditStore.ts # 行程编辑状态管理
│   │   └── itineraryListStore.ts # 行程列表状态管理
│   ├── hooks/               # 自定义 Hooks
│   │   └── useAMap.ts      # 地图 Hook
│   ├── utils/               # 工具函数
│   │   ├── cn.ts           # 类名合并工具
│   │   ├── crypto.ts       # 加密工具
│   │   ├── date.ts         # 日期工具
│   │   ├── mapUtils.ts     # 地图工具函数
│   │   ├── historyManager.ts # 历史管理（撤销/重做）
│   │   ├── itineraryValidation.ts # 行程表单验证
│   │   └── supabase-test.ts # Supabase 连接测试工具
│   ├── config/              # 配置文件
│   │   ├── api.ts          # API 配置
│   │   └── app.ts         # 应用配置
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── vite-env.d.ts        # Vite 环境变量类型定义
├── supabase/                 # Supabase 数据库脚本
│   ├── migrations/          # 数据库迁移脚本
│   │   └── 001_initial_schema.sql  # 初始化数据库结构
│   ├── seeds/               # 种子数据脚本
│   │   └── 001_seed_data.sql  # 测试数据
│   └── functions/           # Edge Functions
│       ├── generate-itinerary/  # 行程生成
│       ├── optimize-itinerary/  # 行程优化
│       ├── get-recommendations/ # 智能推荐
│       ├── analyze-budget/      # 预算分析
│       ├── recommend-transport/ # 交通推荐
│       ├── check-amap-status/   # 地图状态检查
│       ├── verify-poi/          # POI 验证
│       └── _shared/             # 共享代码
│           └── prompts/         # AI Prompt 模板
├── test_report/              # 测试报告
│   ├── Task1.1.md           # 项目初始化测试报告
│   ├── Task1.1_ACCEPTANCE_REPORT.md  # 项目初始化验收报告
│   ├── Task1.2.md           # Supabase 集成测试报告
│   ├── Task1.2_ACCEPTANCE_REPORT.md  # Supabase 集成验收报告
│   ├── Task1.3-认证系统开发测试报告.md  # 认证系统测试报告
│   ├── Task1.3-认证系统开发验收报告.md  # 认证系统验收报告
│   ├── Task1.4-Supabase服务封装测试报告.md  # 服务封装测试报告
│   ├── Task1.4-Supabase服务封装验收报告.md  # 服务封装验收报告
│   ├── Task2.1-需求输入功能测试报告.md  # 需求输入功能测试报告
│   ├── Task2.1-需求输入功能验收报告.md  # 需求输入功能验收报告
│   ├── Task2.2-AI行程生成集成测试报告.md  # AI行程生成集成测试报告
│   ├── Task2.2-AI行程生成集成验收报告.md  # AI行程生成集成验收报告
│   ├── Task2.3-行程展示功能测试报告.md  # 行程展示功能测试报告
│   ├── Task2.3-行程展示功能验收报告.md  # 行程展示功能验收报告
│   ├── Task2.5-高德地图集成测试报告.md  # 高德地图集成测试报告
│   └── Task2.5-高德地图集成验收报告.md  # 高德地图集成验收报告
│   ├── Task2.6-行程编辑功能测试报告.md  # 行程编辑功能测试报告
│   └── Task2.6-行程编辑功能验收报告.md  # 行程编辑功能验收报告
│   ├── Task2.7-行程列表管理测试报告.md  # 行程列表管理测试报告
│   └── Task2.7-行程列表管理验收报告.md  # 行程列表管理验收报告
├── .trae/                   # 项目规则和模板
│   ├── rules/               # 项目规则
│   │   └── project_rules.md
│   └── templates/           # Git 模板
│       ├── commit_message.txt
│       ├── issue_bug_template.md
│       ├── issue_feature_template.md
│       └── pr_template.md
├── docker/                   # Docker 配置
│   └── nginx.conf           # Nginx 配置
├── .dockerignore            # Docker 忽略文件
├── .env.example            # 环境变量模板
├── .eslintrc.cjs          # ESLint 配置
├── .gitignore              # Git 忽略文件
├── .prettierrc            # Prettier 配置
├── CLAUDE.md               # Claude 项目说明
├── Dockerfile              # Docker 镜像配置
├── docker-compose.yml       # Docker 编排配置
├── index.html              # HTML 入口文件
├── LICENSE                # MIT 许可证
├── package.json            # 项目配置
├── package-lock.json       # npm 锁文件
├── postcss.config.js       # PostCSS 配置
├── README.md              # 项目说明（本文件）
├── requirement.md          # 原始需求文档
├── tailwind.config.js      # TailwindCSS 配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # TypeScript Node 配置
└── vite.config.ts          # Vite 配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- pnpm 8.x 或 npm 9.x
- Git
- Docker 20.10+ 和 Docker Compose 2.0+（用于 Docker 部署）

### 安装步骤

#### 方式 1：本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/araragi-koyomin/AiTravelPlanner.git
   cd AiTravelPlanner
   ```

2. **安装依赖**
   ```bash
   # 使用 pnpm（推荐）
   pnpm install
   
   # 或使用 npm
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑 .env 文件，填入实际的 API Key 和配置
   # 需要配置的服务：
   # - Supabase (https://supabase.com/)
   # - 智谱AI (https://open.bigmodel.cn/)
   # - 科大讯飞 (https://www.xfyun.cn/)
   # - 高德地图 (https://lbs.amap.com/)
   ```

4. **启动开发服务器**
   ```bash
   # 使用 pnpm
   pnpm dev
   
   # 或使用 npm
   npm run dev
   ```

5. **访问应用**
   ```
   打开浏览器访问 http://localhost:5173
   ```

#### 方式 2：Docker 部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/araragi-koyomin/AiTravelPlanner.git
   cd AiTravelPlanner
   ```

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑 .env 文件，填入实际的配置
   nano .env  # 或使用其他编辑器
   ```

3. **使用 Docker Compose 启动**
   ```bash
   # 构建并启动容器
   docker-compose up -d
   
   # 查看容器日志
   docker-compose logs -f
   ```

4. **访问应用**
   ```
   打开浏览器访问 http://localhost:3000
   ```

5. **停止容器**
   ```bash
   # 停止并删除容器
   docker-compose down
   ```

**详细的 Docker 部署指南**：请查看 [Docker 部署文档](docs/DOCKER_DEPLOYMENT.md)

### Docker 部署（开发阶段完成后）

```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -p 3000:80 --env-file .env ai-travel-planner
```

## 📚 文档

- [产品需求文档 (PRD)](docs/PRD.md) - 详细的产品功能需求和用户界面设计
- [技术架构设计](docs/TECHNICAL_ARCHITECTURE.md) - 系统架构、数据库设计、API 接口设计
- [开发工作计划](docs/DEVELOPMENT_PLAN.md) - 8 周详细开发计划和里程碑
- [安全规范文档](docs/SECURITY.md) - API Key 管理、数据安全、认证授权等安全规范
- [本地开发环境搭建指南](docs/LOCAL_SETUP.md) - 开发环境配置步骤
- [Supabase 配置指南](docs/SUPABASE_SETUP.md) - Supabase 项目创建和配置
- [Supabase 集成文档](docs/SUPABASE_INTEGRATION.md) - Supabase 客户端集成和使用
- [第三方 API 配置指南](docs/API_CONFIGURATION.md) - 智谱AI、科大讯飞、高德地图 API 配置
- [Git 工作流文档](docs/GIT_WORKFLOW.md) - Git 分支策略和提交规范
- [Prompt 模板文档](docs/PROMPT_TEMPLATES.md) - AI 服务调用的 Prompt 模板
- [技术选型文档](docs/TECHNOLOGY_SELECTION.md) - 技术栈选择和理由
- [数据库设计文档](docs/DATABASE_DESIGN.md) - 数据库表结构和关系设计
- [数据库开发常见问题与解决方案](docs/DATABASE_DEVELOPMENT_ISSUES.md) - 数据库开发中的常见问题和解决方案
- [Docker 部署文档](docs/DOCKER_DEPLOYMENT.md) - Docker 部署指南、命令参考、故障排查

## 🗓️ 开发计划

项目预计开发周期为 **8 周**，分为以下阶段：

| 阶段    | 时间                 | 主要任务                                 |
| ------- | -------------------- | ---------------------------------------- |
| 第1-2周 | 项目初始化与基础架构 | 环境搭建、基础组件、数据库设计、认证系统 |
| 第3-4周 | 核心功能开发         | 智能行程规划、地图集成、行程管理         |
| 第5-6周 | 增强功能开发         | 语音识别、费用管理、云端同步             |
| 第7周   | 测试与优化           | 功能测试、Bug 修复、性能优化             |
| 第8周   | 部署与文档           | Docker 部署、CI/CD、文档编写             |

详细的开发计划请参考 [开发工作计划](docs/DEVELOPMENT_PLAN.md)。

## 🔐 安全说明

本项目非常重视安全性，遵循以下安全规范：

- ✅ 所有 API Key 通过环境变量管理，绝不硬编码在代码中
- ✅ 用户提供的 API Key 加密存储在数据库中
- ✅ 启用 Row Level Security (RLS) 保护用户数据
- ✅ 所有 API 请求使用 HTTPS
- ✅ 用户输入经过验证和清理，防止 XSS 和 SQL 注入
- ✅ 配置 Content Security Policy (CSP)

详细的安全规范请参考 [安全规范文档](docs/SECURITY.md)。

**重要提醒**：
- ⚠️ 请勿将 `.env` 文件提交到 Git 仓库
- ⚠️ 请勿在公开代码库中包含任何 API Key
- ⚠️ 使用 `.env.example` 作为环境变量模板

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出建议！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 📝 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 👥 作者

- 开发者：[araragi-koyomin]
- 项目链接：[https://github.com/araragi-koyomin/AiTravelPlanner](https://github.com/araragi-koyomin/AiTravelPlanner)

## 🙏 致谢

感谢以下开源项目和服务：

- [React](https://reactjs.org/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Supabase](https://supabase.com/) - BaaS 平台
- [智谱AI](https://open.bigmodel.cn/) - 大语言模型 API
- [科大讯飞](https://www.xfyun.cn/) - 语音识别服务
- [高德地图](https://lbs.amap.com/) - 地图服务

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/araragi-koyomin/AiTravelPlanner/issues)
- 发送邮件：3099146950@qq.com

## 🌟 Star History

如果这个项目对你有帮助，请给个 Star ⭐️

---

**当前版本**：v0.7.0（行程展示功能完成）
**最后更新**：2026-03-28
**开发状态**：🚧 开发中
