# AI 旅行规划师项目

## 项目概述

这是一个基于 AI 的智能旅行规划 Web 应用，核心功能包括智能行程生成、语音输入、地图展示、费用管理和云端同步。

## 技术栈总览

### 前端
- React 18 + TypeScript 5 + Vite 5
- TailwindCSS + shadcn/ui + Zustand
- React Router 6

### 后端
- Supabase (PostgreSQL + Auth + Edge Functions + Realtime)

### AI 服务
- 智谱AI GLM-4 (行程规划)
- 科大讯飞 (语音识别)
- 高德地图 (地图服务)

## 目录结构说明

```
AiTravelPlanner/
├── docs/                    # 开发文档
├── .trae/                   # 项目规则和模板
├── src/                     # 源代码
├── public/                  # 静态资源
├── docker/                  # Docker 配置
├── .env.example             # 环境变量模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── Dockerfile               # Docker 镜像
├── docker-compose.yml       # Docker 编排
└── CLAUDE.md               # 本文件
```

## 开发文档索引

### 核心文档

| 文档路径                       | 用途         | 何时阅读               |
| ------------------------------ | ------------ | ---------------------- |
| `docs/PRD.md`                  | 产品需求文档 | 了解项目需求和功能     |
| `docs/TECHNOLOGY_SELECTION.md` | 技术选型文档 | 了解技术栈和选型理由   |
| `docs/DEVELOPMENT_PLAN.md`     | 开发计划     | 了解开发任务和时间安排 |

### 配置文档

| 文档路径                    | 用途                 | 何时阅读                 |
| --------------------------- | -------------------- | ------------------------ |
| `docs/LOCAL_SETUP.md`       | 本地开发环境搭建指南 | 开始开发前，搭建开发环境 |
| `docs/SUPABASE_SETUP.md`    | Supabase 配置指南    | 配置后端服务             |
| `docs/API_CONFIGURATION.md` | 第三方 API 配置指南  | 配置外部 API 服务        |
| `docs/DATABASE_DESIGN.md`   | 数据库设计文档       | 了解数据库结构和关系     |

### 开发规范文档

| 文档路径                   | 用途            | 何时阅读                    |
| -------------------------- | --------------- | --------------------------- |
| `docs/GIT_WORKFLOW.md`     | Git 工作流文档  | 了解 Git 分支策略和提交规范 |
| `docs/PROMPT_TEMPLATES.md` | Prompt 模板文档 | 使用 AI 服务时参考          |

### 其他文档

| 文档路径                              | 用途                         |
| ------------------------------------- | ---------------------------- |
| `docs/SECURITY.md`                    | 安全规范                     |
| `docs/DOCKER_DEPLOYMENT.md`           | Docker 部署文档              |
| `docs/SUPABASE_INTEGRATION.md`        | Supabase 集成文档            |
| `docs/DATABASE_DEVELOPMENT_ISSUES.md` | 数据库开发常见问题与解决方案 |
| `.trae/rules/project_rules.md`        | 项目规则（Git 提交规范等）   |

## 全局编码规范

### TypeScript
- 使用 TypeScript 严格模式
- 所有函数必须有明确的返回类型
- 避免使用 `any` 类型，使用 `unknown` 替代
- 使用接口定义数据结构

### React
- 使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名
- Props 接口使用 `Props` 后缀
- 使用 `useCallback` 和 `useMemo` 优化性能

### 样式
- 使用 TailwindCSS
- 避免使用内联样式
- 使用语义化的 CSS 类名

### 命名规范
- 文件名：PascalCase (组件), camelCase (工具函数)
- 变量名：camelCase
- 常量名：UPPER_SNAKE_CASE
- 接口名：PascalCase

## Git 工作流程

### 分支策略
- `main`: 生产环境代码
- `develop`: 开发分支
- `feature/*`: 功能开发
- `bugfix/*`: Bug 修复
- `hotfix/*`: 紧急修复

### 提交规范
遵循 Conventional Commits 规范：
```
<type>(<scope>): <subject>

<body>

<footer>
```

Type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

Scope: `auth`, `itinerary`, `expense`, `map`, `speech`, `ui`, `api`, `db`, `config`, `docs`, `deploy`

详细规范请参考 `docs/GIT_WORKFLOW.md`

### Git 操作规范
- ⚠️ 执行 `git commit` 前必须获得用户确认
- ⚠️ 执行 `git push` 前必须获得用户确认
- ✅ 只读操作（如 `git status`, `git log`）可以执行

## 开发工作流程

### 1. 开发前准备
1. 阅读 `docs/LOCAL_SETUP.md` 搭建开发环境
2. 阅读 `docs/SUPABASE_SETUP.md` 配置 Supabase
3. 阅读 `docs/API_CONFIGURATION.md` 配置第三方 API
4. 阅读 `docs/GIT_WORKFLOW.md` 了解 Git 工作流

### 2. 功能开发
1. 从 `develop` 创建功能分支：`git checkout -b feature/xxx`
2. 阅读相关文档（如 `docs/DATABASE_DESIGN.md` 了解数据库结构）
3. 开发功能，遵循编码规范
4. 运行测试：`pnpm test`
5. 运行类型检查：`pnpm typecheck`
6. 运行 Lint：`pnpm lint`

### 3. 提交代码
1. 暂存更改：`git add .`
2. 查看状态：`git status`
3. **询问用户确认**是否提交
4. 提交代码：`git commit -m "feat(scope): subject"`
5. **询问用户确认**是否推送
6. 推送代码：`git push origin feature/xxx`

### 4. AI 服务集成
1. 阅读 `docs/PROMPT_TEMPLATES.md` 了解 Prompt 模板
2. 使用文档中的 Prompt 模板进行 AI 调用
3. 参考 `docs/API_CONFIGURATION.md` 配置 API Key

### 5. 数据库操作
1. 阅读 `docs/DATABASE_DESIGN.md` 了解数据库结构
2. 使用 Supabase Dashboard 或 SQL Editor 操作数据库
3. 遵循 RLS 策略，确保数据安全

## Agent 开发指引

### 开发前
- ✅ 必先阅读相关文档（根据任务类型选择）
- ✅ 遵循 `docs/` 中的开发规范
- ✅ 参考 `docs/` 中的配置指南进行配置
- ✅ 使用 `docs/PROMPT_TEMPLATES.md` 中的 Prompt 模板
- ✅ 参考 `docs/DATABASE_DEVELOPMENT_ISSUES.md` 避免常见错误

### 开发中
- ✅ 遵循全局编码规范
- ✅ 遵循 Git 提交规范
- ✅ 执行 git commit 和 git push 前必须获得用户确认
- ✅ 使用 TypeScript 严格模式
- ✅ 运行测试和类型检查

### 开发后
- ✅ 更新相关文档
- ✅ 提交代码到 Git
- ✅ 等待用户确认后执行 git push

## 项目命令

### 开发
```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建
```

### 代码质量
```bash
pnpm lint             # 运行 ESLint
pnpm format           # 运行 Prettier
pnpm typecheck        # 运行类型检查
pnpm check            # 运行所有检查
```

### 测试
```bash
pnpm test             # 运行测试
pnpm test:coverage    # 运行测试并生成覆盖率报告
```

### Docker
```bash
docker-compose up -d  # 启动容器
docker-compose down   # 停止容器
docker-compose logs -f # 查看日志
```

## 参考资料

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vite 官方文档](https://vitejs.dev/)
- [Supabase 官方文档](https://supabase.com/docs)
- [TailwindCSS 官方文档](https://tailwindcss.com/docs)

---

**最后更新**: 2026-03-15
