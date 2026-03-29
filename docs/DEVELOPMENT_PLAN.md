# AI 旅行规划师 - 开发工作计划

## 1. 项目概览

### 1.1 项目信息

- **项目名称**：AI 旅行规划师 (AI Travel Planner)
- **项目类型**：Web 应用
- **开发周期**：8 周
- **团队规模**：1 人
- **技术栈**：React + TypeScript + Supabase + 智谱AI

### 1.2 项目目标

- 构建一个功能完整的 AI 旅行规划 Web 应用
- 实现智能行程生成、费用管理、云端同步等核心功能
- 提供良好的用户体验和界面设计
- 完成部署和文档编写

***

## 2. 开发阶段划分

```
第1-2周：项目初始化与基础架构
第3-4周：核心功能开发（P0）
第5-6周：增强功能开发（P1）
第7周：测试与优化
第8周：部署与文档
```

***

## 3. 详细开发计划

### 第1周：项目初始化与环境搭建

#### 3.1.1 环境配置（2天）

**任务清单：**

- [x] 安装 Node.js 18+ 和 pnpm
- [x] 创建 GitHub 仓库
- [x] 配置 Git 工作流（.gitignore、分支策略）
- [x] 申请并配置外部服务账号
  - [x] Supabase 项目创建
  - [x] 智谱AI API Key 申请
  - [x] 科大讯飞语音识别账号申请
  - [x] 高德地图 API Key 申请
- [x] 配置环境变量文件（.env.example）

**交付物：**

- 完整的开发环境
- 各服务的 API Key 和配置信息

#### 3.1.2 项目脚手架搭建（3天）

**任务清单：**

- [x] 使用 Vite 创建 React + TypeScript 项目
- [x] 安装并配置依赖包
  - [x] React Router
  - [x] Zustand
  - [x] TailwindCSS
  - [x] shadcn/ui
  - [x] Axios
  - [x] Supabase Client
  - [x] 高德地图 SDK
  - [x] 科大讯飞 SDK
  - [x] CryptoJS
- [x] 配置 ESLint + Prettier
- [x] 配置 TypeScript 严格模式
- [x] 创建项目目录结构
- [x] 配置 Vite 构建优化

**交付物：**

- 可运行的项目脚手架
- 完整的目录结构
- 代码规范配置

#### 3.1.3 基础组件开发（2天）

**任务清单：**

- [x] 创建 Layout 组件（Header、Footer、Sidebar）
- [x] 创建基础 UI 组件（Button、Input、Card、Modal）
- [x] 创建 Loading 组件
- [x] 创建 Error Boundary 组件
- [x] 配置路由结构

**交付物：**

- 基础布局组件
- 路由配置完成

***

### 第2周：数据库设计与认证系统

#### 3.2.1 数据库设计与实现（2天）

**任务清单：**

- [x] 设计数据库表结构（ER 图）
- [x] 在 Supabase 中创建表
  - [x] users 表
  - [x] itineraries 表
  - [x] itinerary\_items 表
  - [x] expenses 表
  - [x] user\_settings 表
- [x] 创建数据库索引
- [x] 配置 Row Level Security (RLS) 策略
- [x] 编写数据库迁移脚本

**交付物：**

- 完整的数据库结构
- RLS 策略配置

#### 3.2.2 认证系统开发（3天）

**任务清单：**

- [x] 集成 Supabase Auth
- [x] 实现登录页面（Login.tsx）
- [x] 实现注册页面（Register.tsx）
- [x] 创建 Auth Store（Zustand）
- [x] 实现路由守卫（ProtectedRoute）
- [x] 实现记住登录状态
- [x] 实现退出登录功能
- [x] 添加表单验证

**交付物：**

- ✅ 完整的用户认证系统
- ✅ 登录/注册页面

#### 3.2.3 Supabase 服务封装（2天）

**任务清单：**

- [x] 创建 Supabase 客户端实例
- [x] 封装认证服务（services/auth.ts）
- [x] 封装行程服务（services/itinerary.ts）
- [x] 封装费用服务（services/expense.ts）
- [x] 封装设置服务（services/settings.ts）
- [x] 创建 TypeScript 类型定义
- [x] 实现错误处理机制
- [x] 实现 API Key 加密存储（AES-256-CBC）
- [x] 编写单元测试（159 个测试用例，覆盖率 68.05%）

**交付物：**

- ✅ 完整的 API 服务封装
- ✅ 类型定义文件
- ✅ 加密工具（crypto.ts）
- ✅ SQL 测试脚本（SQL_TEST_SCRIPTS.md）
- ✅ 数据库触发器（auth.users 与 public.users 同步）

***

### 第3周：智能行程规划核心功能

#### 3.3.1 需求输入功能（2天）

**任务清单：**

- [x] 创建行程规划页面（ItineraryPlanner.tsx）
- [x] 实现文字输入表单
  - [x] 目的地输入
  - [x] 日期选择器
  - [x] 预算输入
  - [x] 同行人数输入
  - [x] 人员构成选择（选填）
  - [x] 住宿偏好选择（选填）
  - [x] 行程节奏选择（选填）
  - [x] 旅行偏好选择（多选）
  - [x] 特殊需求输入
- [x] 实现表单验证
- [x] 创建行程数据类型定义
- [x] 实现数据持久化（localStorage）
- [x] 配置代码分割优化
- [x] 完善可访问性（aria-invalid、aria-describedby）
- [x] 单元测试（83 个测试用例，覆盖率 100%）
- [x] 验收报告（Task2.1-需求输入功能验收报告.md）

**交付物：**

- ✅ 需求输入表单
- ✅ 表单验证逻辑
- ✅ 行程数据类型定义
- ✅ 单元测试

#### 3.3.2 AI 行程生成集成（3天）

**任务清单：**

- [x] 创建 Supabase Edge Function（generate-itinerary）
- [x] 集成智谱AI API
- [x] 设计 Prompt 模板
- [x] 实现 AI 响应解析
- [x] 实现错误处理和重试机制
- [x] 添加加载状态提示
- [x] 测试不同场景的生成质量
- [x] 创建行程优化 Edge Function（optimize-itinerary）
- [x] 创建智能推荐 Edge Function（get-recommendations）
- [x] 创建预算分析 Edge Function（analyze-budget）
- [x] 前端服务层集成（services/ai.ts）
- [x] 行程规划表单集成
- [x] 数据库类型约束修复（添加 shopping 类型）
- [x] 单元测试（278 个测试用例，覆盖率达标）
- [x] 验收报告（Task2.2-AI行程生成集成验收报告.md）

**交付物：**

- ✅ AI 行程生成功能
- ✅ Edge Function 代码（4 个函数）
- ✅ 前端服务层
- ✅ 测试报告和验收报告

#### 3.3.3 行程展示功能（2天）

**任务清单：**

- [x] 创建行程详情页面（ItineraryDetail.tsx）
- [x] 实现列表视图展示
- [x] 实现时间轴视图展示
- [x] 创建行程卡片组件
- [x] 实现每日行程展开/折叠
- [x] 添加行程概览信息
- [x] 更新行程列表页面（Itineraries.tsx），添加基础展示功能
- [x] 实现骨架屏加载优化
- [x] 路由级代码分割优化
- [x] 单元测试（431 个测试用例，覆盖率达标）
- [x] 验收报告（Task2.3-行程展示功能验收报告.md）

**交付物：**

- ✅ 行程展示页面
- ✅ 多种视图切换
- ✅ 行程列表页面（基础版本）
- ✅ 性能优化（代码分割、骨架屏）

#### 3.3.4 数据库重构（3天）

**任务清单：**

- [x] 更新数据库设计文档（DATABASE_DESIGN.md v2.0.0）
- [x] 创建数据库迁移脚本
  - [x] 删除 users 表，创建 user_profiles 表
  - [x] 为 itineraries 添加 status、cover_image 字段
  - [x] 重构 itinerary_items 表（date→day，位置字段合并为 location JSONB）
  - [x] 扩展 expenses 表字段（payment_method、receipt_url、notes）
  - [x] 创建优化索引
- [x] 更新后端服务层类型定义
- [x] 更新前端类型定义和组件
- [x] 提取 AI Prompt 模板到独立文件
- [x] 更新测试用例适配新数据结构
- [x] 修复废弃列 NOT NULL 约束问题
- [x] 部署 Edge Function 和数据库迁移

**交付物：**

- ✅ 数据库迁移脚本（004-012）
- ✅ 更新的类型定义
- ✅ 更新的前端组件
- ✅ 独立的 Prompt 模板文件
- ✅ 403 个测试用例全部通过

***

### 第4周：地图集成与行程管理

#### 3.4.1 高德地图集成（2天）

**任务清单：**

- [x] 集成高德地图 JavaScript API v2.0
- [x] 创建地图组件（AMap.tsx）
- [x] 实现地图标记（MapMarker.tsx）
- [x] 实现路线绘制（MapRoute.tsx）
- [x] 实现信息窗口（MapInfoWindow.tsx）
- [x] 添加地图控件（MapControls.tsx - 缩放、定位、图层切换）
- [x] 实现地图自适应
- [x] 创建行程地图视图（ItineraryMapView.tsx）
- [x] 创建地图 Hook（useAMap.ts）
- [x] 创建地图工具函数（mapUtils.ts）
- [x] 创建交通推荐服务（amap.ts）
- [x] 创建 Edge Functions（recommend-transport、check-amap-status、verify-poi）
- [x] 单元测试（122 个测试用例，100% 通过率）
- [x] 验收报告（Task2.5-高德地图集成验收报告.md）

**交付物：**

- ✅ 地图展示功能
- ✅ 标记和路线显示
- ✅ 交通推荐服务
- ✅ 完整的测试覆盖

#### 3.4.2 行程编辑功能（2天）

**任务清单：**

- [x] 实现行程项编辑
- [x] 实现行程项添加
- [x] 实现行程项删除
- [x] 实现拖拽排序
- [x] 添加保存确认提示
- [x] 实现撤销/重做功能

**交付物：**

- ✅ 行程编辑功能
- ✅ 拖拽排序
- ✅ 历史管理工具（historyManager.ts）
- ✅ 编辑状态管理（itineraryEditStore.ts）
- ✅ 编辑工具栏组件（EditToolbar.tsx）
- ✅ 行程项编辑器组件（ItemEditor.tsx）
- ✅ 添加按钮组件（AddItemButton.tsx）
- ✅ 删除确认弹窗组件（DeleteConfirmModal.tsx）
- ✅ 未保存更改弹窗组件（UnsavedChangesModal.tsx）
- ✅ 拖拽排序列表组件（DraggableItemList.tsx）
- ✅ 单元测试（287 个测试用例，覆盖率 ~85%）
- ✅ 验收报告（Task2.6-行程编辑功能验收报告.md）

#### 3.4.3 行程列表与管理（3天）

**任务清单：**

- [x] 更新行程列表页面（Itineraries.tsx）
- [x] 实现搜索功能
- [x] 实现筛选功能（按日期、目的地）
- [x] 实现排序功能
- [x] 实现删除行程功能
- [x] 实现复制行程功能
- [x] 实现收藏行程功能
- [x] 实现批量操作功能
- [x] 实现分页功能
- [x] 单元测试（287 个测试用例，覆盖率 ~85%）
- [x] 验收报告（Task2.7-行程列表管理验收报告.md）

**交付物：**

- ✅ 行程列表页面（完整版本）
- ✅ 搜索、筛选、排序功能
- ✅ 批量操作功能
- ✅ 分页功能

***

### 第5周：语音识别与费用管理

#### 3.5.1 语音识别功能（2天）

**任务清单：**

- [x] 集成科大讯飞语音识别 SDK
- [x] 创建语音输入组件（VoiceInput.tsx）
- [x] 实现录音开始/停止
- [x] 实现实时语音识别
- [x] 实现语音转文字编辑
- [x] 添加录音状态提示
- [x] 实现错误处理（麦克风权限等）
- [x] 实现行程语音输入解析
- [x] 实现费用语音输入解析
- [x] 单元测试（225 个测试用例，覆盖率 96.8%）
- [x] 验收报告（Task2.8-语音识别功能验收报告.md）

**交付物：**

- ✅ 语音输入组件（VoiceInput.tsx）
- ✅ 语音识别功能
- ✅ 行程语音解析（voiceParser.ts）
- ✅ 费用语音解析
- ✅ 讯飞语音服务（xunfei.ts）
- ✅ 语音识别 Hook（useVoiceRecognition.ts）
- ✅ 完整的测试覆盖

#### 3.5.2 费用预算功能（2天）

**任务清单：**

- [x] 创建费用管理页面（ExpenseManager.tsx）
- [x] 实现预算概览展示
- [x] 实现预算分类统计
- [x] 创建预算统计图表（使用 Recharts）
- [x] 实现预算对比（已花费/预算）
- [x] 添加超支提醒
- [x] 创建费用预算组件（BudgetOverview、BudgetProgressBar、ExpensePieChart、ExpenseBarChart、OverBudgetAlert、ExpenseAnalysis）
- [x] 创建费用工具函数（expenseUtils.ts）
- [x] 单元测试（169 个测试用例，覆盖率 100%）
- [x] 验收报告（Task2.9-费用预算功能验收报告.md）

**交付物：**

- ✅ 费用预算展示
- ✅ 统计图表
- ✅ 超支提醒

#### 3.5.3 费用记录功能（3天）

**任务清单：**

- [x] 创建费用表单组件（内联于 ExpenseManager.tsx）
- [x] 实现手动添加费用
- [x] 实现语音记录费用
- [x] 实现费用分类选择
- [x] 实现费用列表展示
- [x] 实现费用编辑功能
- [x] 实现费用删除功能
- [x] 添加费用统计汇总

**交付物：**

- ✅ 费用记录功能（ExpenseManager.tsx）
- ✅ 费用列表和统计
- ✅ 服务层完整实现（expense.ts）
- ✅ 集成测试（expenseManager.integration.test.tsx、voiceExpense.integration.test.tsx）

***

### 第6周：设置、导出与优化

#### 3.6.1 设置页面开发（2天）

**任务清单：**

- [x] 创建设置页面（Settings.tsx）
- [x] 实现 API Key 输入
  - [x] 智谱AI API Key（单字段）
  - [x] 科大讯飞凭证（APP ID + API Key + API Secret 三字段）
  - [x] 高德地图凭证（API Key + SecurityJsCode 双字段）
- [x] 实现 API Key 加密存储（AES-256）
- [x] 实现主题设置保存（浅色/深色，保存到数据库）
- [x] 实现语言设置保存（中文/英文，保存到数据库）
- [x] 实现通知设置保存（开关状态，保存到数据库）
- [x] 实现账户设置（修改密码、退出登录）

**待完善功能（后续开发）：**

- [ ] 主题切换实际效果（Tailwind dark mode、CSS 变量）
- [ ] 国际化（i18n）功能
- [ ] 推送通知功能（可选）

**交付物：**

- ✅ 设置页面
- ✅ API Key 管理功能（支持多凭证类型）
- ✅ 主题/语言/通知设置（保存到数据库）
- ✅ 账户设置（修改密码、退出登录）

#### 3.6.2 行程导出功能（2天）

**任务清单：**

- [ ] 实现导出为 PDF（使用 jsPDF）
- [ ] 实现导出为图片（使用 html2canvas）
- [ ] 实现分享链接生成
- [ ] 添加导出预览
- [ ] 优化导出样式

**交付物：**

- 行程导出功能
- PDF 和图片导出

#### 3.6.3 云端同步与优化（3天）

**任务清单：**

- [ ] 实现 Supabase Realtime 订阅
- [ ] 实现多设备数据同步
- [ ] 添加离线缓存支持
- [ ] 优化页面加载性能
- [ ] 优化地图渲染性能
- [ ] 添加骨架屏加载
- [ ] 优化图片加载（懒加载）

**交付物：**

- 云端同步功能
- 性能优化

***

### 第7周：测试与Bug修复

#### 3.7.1 功能测试（2天）

**任务清单：**

- [ ] 测试用户注册/登录流程
- [ ] 测试行程生成功能
- [ ] 测试行程编辑功能
- [ ] 测试地图展示功能
- [ ] 测试语音识别功能
- [ ] 测试费用管理功能
- [ ] 测试云端同步功能
- [ ] 测试导出功能
- [ ] 测试设置功能

**交付物：**

- 测试报告
- Bug 列表

#### 3.7.2 Bug修复与优化（3天）

**任务清单：**

- [ ] 修复发现的 Bug
- [ ] 优化用户体验细节
- [ ] 修复兼容性问题
- [ ] 优化错误提示
- [ ] 添加加载动画
- [ ] 优化响应式布局

**交付物：**

- Bug 修复
- 用户体验优化

#### 3.7.3 单元测试（2天）

**任务清单：**

- [x] 编写工具函数单元测试
- [x] 编写服务层单元测试
- [ ] 编写组件单元测试
- [x] 配置测试覆盖率报告
- [ ] 确保测试覆盖率 > 60%

**交付物：**

- 单元测试代码
- 测试覆盖率报告

***

### 第8周：部署与文档

#### 3.8.0 Edge Function 用户 API Key 支持（1天）

**背景说明：**

当前 Edge Functions（generate-itinerary、optimize-itinerary 等）直接使用 Supabase 环境变量中的 API Key，未使用用户在设置页面配置的 API Key。公开部署时需要修改为支持用户 API Key。

**任务清单：**

- [ ] 修改 `generate-itinerary` Edge Function
  - [ ] 添加从 `user_settings` 表读取用户 API Key 的逻辑
  - [ ] 实现用户 API Key 解密（使用与前端相同的加密密钥）
  - [ ] 实现回退机制：用户 Key → 环境变量 Key
- [ ] 修改 `optimize-itinerary` Edge Function（同上）
- [ ] 修改 `get-recommendations` Edge Function（同上）
- [ ] 修改 `analyze-budget` Edge Function（同上）
- [ ] 测试用户 API Key 调用路径
- [ ] 测试回退到环境变量的路径
- [ ] 更新相关文档

**技术实现要点：**

```typescript
// Edge Function 中获取 API Key 的逻辑
async function getApiKey(userId: string, keyType: string): Promise<string | undefined> {
  const supabase = createClient(...)
  
  // 1. 尝试获取用户配置的 API Key
  const { data: settings } = await supabase
    .from('user_settings')
    .select(`${keyType}_api_key`)
    .eq('user_id', userId)
    .single()
  
  if (settings?.[`${keyType}_api_key`]) {
    return decryptApiKey(settings[`${keyType}_api_key`])
  }
  
  // 2. 回退到环境变量
  return Deno.env.get(`${keyType.toUpperCase()}_API_KEY`)
}
```

**交付物：**

- ✅ 支持用户 API Key 的 Edge Functions
- ✅ 测试通过的 API Key 调用路径

#### 3.8.1 Docker 部署配置（2天）

**任务清单：**

- [ ] 编写 Dockerfile
- [ ] 编写 docker-compose.yml
- [ ] 编写 nginx 配置文件
- [ ] 配置环境变量
- [ ] 测试本地 Docker 构建
- [ ] 测试 Docker 运行

**交付物：**

- Docker 配置文件
- 可运行的 Docker 镜像

#### 3.8.2 GitHub Actions CI/CD（2天）

**任务清单：**

- [ ] 创建 GitHub Actions 工作流
- [ ] 配置自动构建
- [ ] 配置自动推送到阿里云镜像仓库
- [ ] 配置环境变量和密钥
- [ ] 测试 CI/CD 流程

**交付物：**

- GitHub Actions 配置
- 自动化部署流程

#### 3.8.3 文档编写（3天）

**任务清单：**

- [ ] 编写 README.md
  - [ ] 项目介绍
  - [ ] 功能特性
  - [ ] 技术栈
  - [ ] 安装和运行说明
  - [ ] Docker 部署说明
  - [x] API Key 配置说明（用户自行配置，支持多凭证类型）
  - [ ] 项目结构说明
- [ ] 编写 API 文档
- [ ] 编写部署文档
- [ ] 编写用户使用手册
- [ ] 添加代码注释
- [ ] 创建项目演示视频（可选）

**交付物：**

- 完整的文档
- README.md

#### 3.8.4 最终测试与提交（1天）

**任务清单：**

- [ ] 进行完整功能测试
- [ ] 检查代码规范
- [ ] 运行 Lint 和 Type Check
- [ ] 提交所有代码到 GitHub
- [ ] 打包 Docker 镜像
- [ ] 推送到阿里云镜像仓库
- [ ] 验证部署成功

**交付物：**

- 完整的项目代码
- Docker 镜像
- GitHub 仓库

***

## 4. 里程碑

| 里程碑             | 时间      | 交付物                             | 状态                                                               |
| ------------------ | --------- | ---------------------------------- | ------------------------------------------------------------------ |
| M1: 项目初始化完成 | 第1周结束 | 项目脚手架、基础组件、路由配置     | ✅ 已完成                                                           |
| M2: 认证系统完成   | 第2周结束 | 用户注册登录、数据库设计、API 封装 | ✅ 已完成                                                           |
| M3: 核心功能完成   | 第4周结束 | 行程生成、地图展示、行程管理       | ✅ 已完成                                                           |
| M4: 增强功能完成   | 第6周结束 | 语音识别、费用管理、云端同步       | ✅ 已完成（语音识别、费用预算、费用记录已完成）                     |
| M5: 测试完成       | 第7周结束 | Bug 修复、单元测试、功能测试       | ⬜ 待开始                                                           |
| M6: 项目交付       | 第8周结束 | Docker 镜像、文档、GitHub 仓库     | ⬜ 待开始                                                           |

***

## 5. 风险管理

### 5.1 技术风险

| 风险              | 影响 | 概率 | 应对措施                      |
| ----------------- | ---- | ---- | ----------------------------- |
| AI 生成质量不稳定 | 高   | 中   | 优化 Prompt、添加人工编辑功能 |
| 语音识别准确率低  | 中   | 中   | 提供文字输入备选方案          |
| 地图 API 限制     | 中   | 低   | 使用免费额度、优化调用次数    |
| 第三方服务故障    | 高   | 低   | 添加错误处理、提供降级方案    |

### 5.2 进度风险

| 风险         | 影响 | 概率 | 应对措施                   |
| ------------ | ---- | ---- | -------------------------- |
| 开发进度延迟 | 高   | 中   | 合理安排任务、预留缓冲时间 |
| 技术难点耗时 | 中   | 中   | 提前调研、寻求帮助         |
| Bug 修复耗时 | 中   | 高   | 及时测试、预留测试时间     |

***

## 6. 质量保证

### 6.1 代码质量

- 代码审查（自我审查）
- ESLint + Prettier 检查
- TypeScript 类型检查
- 单元测试覆盖率 > 60%

### 6.2 功能质量

- 功能测试通过率 100%
- 用户体验测试
- 兼容性测试（主流浏览器）
- 性能测试（加载时间 < 3秒）

### 6.3 文档质量

- README.md 完整
- 代码注释率 > 30%
- API 文档清晰
- 部署文档详细

***

## 7. 每日工作计划模板

### 7.1 每日计划

```
日期：YYYY-MM-DD
本周目标：[本周主要目标]

今日任务：
- [ ] 任务1（预计2小时）
- [ ] 任务2（预计3小时）
- [ ] 任务3（预计1小时）

完成情况：
- [ ] 任务1 - 完成/未完成 - 备注
- [ ] 任务2 - 完成/未完成 - 备注
- [ ] 任务3 - 完成/未完成 - 备注

遇到的问题：
- 问题1及解决方案

明日计划：
- [ ] 任务1
- [ ] 任务2
```

***

## 8. 每周总结模板

### 8.1 每周总结

```
周次：第X周
日期：YYYY-MM-DD 至 YYYY-MM-DD

本周完成：
- [ ] 完成内容1
- [ ] 完成内容2
- [ ] 完成内容3

未完成：
- [ ] 未完成内容1 - 原因 - 计划完成时间
- [ ] 未完成内容2 - 原因 - 计划完成时间

遇到的问题：
- 问题1及解决方案

下周计划：
- [ ] 计划任务1
- [ ] 计划任务2
- [ ] 计划任务3

收获与反思：
- 本周收获
- 需要改进的地方
```

***

## 9. 提交检查清单

### 9.1 代码提交前检查

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 Prettier 格式化
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] 编写有意义的提交信息
- [ ] 确保没有敏感信息泄露

### 9.2 最终交付检查

- [ ] 所有 P0 功能完成
- [ ] 所有 P1 功能完成
- [ ] 通过功能测试
- [ ] 通过单元测试
- [ ] 代码注释完整
- [ ] README.md 完整
- [ ] Docker 镜像可运行
- [ ] GitHub Actions 配置正确
- [ ] 没有 API Key 硬编码
- [ ] 提交记录详细

***

## 10. 资源链接

### 10.1 技术文档

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [Supabase 文档](https://supabase.com/docs)
- [智谱AI 文档](https://open.bigmodel.cn/dev/api)
- [科大讯飞文档](https://www.xfyun.cn/doc/)
- [高德地图文档](https://lbs.amap.com/api/jsapi-v2/summary)

### 10.2 学习资源

- [React 教程](https://react.dev/learn)
- [TypeScript 入门](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Supabase 教程](https://supabase.com/docs/guides/getting-started)

***

## 11. 附录

### 11.1 Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

示例：

```
feat: 实现用户登录功能
fix: 修复地图标记显示问题
docs: 更新 README.md
style: 格式化代码
refactor: 重构 API 服务层
test: 添加认证服务单元测试
chore: 更新依赖包
```

### 11.2 环境变量配置

```env
# .env.example
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ZHIPU_API_KEY=your_zhipu_api_key
VITE_XUNFEI_API_KEY=your_xunfei_api_key
VITE_AMAP_KEY=your_amap_key
VITE_ENCRYPTION_KEY=your_encryption_key
```

***

**文档版本**：v1.5
**最后更新**：2026-03-29
**维护者**：项目开发者
