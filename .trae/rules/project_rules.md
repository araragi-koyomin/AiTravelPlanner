# 项目规则

## Git 提交规范

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 配置文件和脚本的变动
- `revert`: 回滚之前的 commit

### Scope 范围

- `auth`: 认证相关
- `itinerary`: 行程相关
- `expense`: 费用相关
- `map`: 地图相关
- `speech`: 语音相关
- `ui`: UI 组件
- `api`: API 服务
- `db`: 数据库
- `config`: 配置文件
- `docs`: 文档
- `deploy`: 部署

### Subject 主题

- 使用现在时态："add" 而不是 "added"
- 首字母小写
- 结尾不加句号
- 不超过 50 个字符

### Body 正文

- 每行不超过 72 个字符
- 说明"是什么"和"为什么"，而不是"怎么做"
- 使用现在时态和祈使语气

### Footer 脚注

- 列出相关的 Issue
- 列出 Breaking Changes

### 示例

```
feat(itinerary): add AI itinerary generation

Implement AI-powered itinerary generation using Zhipu AI GLM-4 model.
Users can now generate personalized travel plans by inputting
destination, dates, budget, and preferences.

Closes #123
```

```
fix(auth): resolve login failure with special characters

Users with special characters in email addresses were unable to login.
This issue has been fixed by properly encoding email addresses
before sending to Supabase Auth.

Fixes #45
```

```
docs(readme): update installation instructions

Add detailed steps for setting up environment variables and
configuring external API keys.

```

## 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 所有函数必须有明确的返回类型
- 避免使用 `any` 类型，使用 `unknown` 替代
- 使用接口定义数据结构
- 导出类型时使用 `type` 关键字

### React

- 使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名
- Props 接口使用 `Props` 后缀
- 使用 `useCallback` 和 `useMemo` 优化性能
- 避免在 JSX 中使用内联函数

### 样式

- 使用 TailwindCSS
- 避免使用内联样式
- 使用语义化的 CSS 类名
- 响应式设计优先

### 命名规范

- 文件名：PascalCase (组件), camelCase (工具函数)
- 变量名：camelCase
- 常量名：UPPER_SNAKE_CASE
- 接口名：PascalCase
- 类型别名：PascalCase

## 代码审查清单

### 提交前检查

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 Prettier 格式化
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] 编写有意义的提交信息
- [ ] 确保没有敏感信息泄露

### 功能检查

- [ ] 功能按需求实现
- [ ] 边界情况处理
- [ ] 错误处理完善
- [ ] 用户体验良好
- [ ] 性能可接受

### 安全检查

- [ ] 没有 API Key 硬编码
- [ ] 用户输入经过验证和清理
- [ ] 敏感数据加密存储
- [ ] 使用 HTTPS 传输

## 分支策略

### 分支命名

- `main`: 主分支，生产环境代码
- `develop`: 开发分支
- `feature/*`: 功能分支，如 `feature/itinerary-generation`
- `bugfix/*`: 修复分支，如 `bugfix/login-error`
- `hotfix/*`: 紧急修复分支

### 分支工作流

1. 从 `develop` 创建功能分支
2. 在功能分支上开发
3. 提交 Pull Request 到 `develop`
4. 代码审查通过后合并
5. 定期将 `develop` 合并到 `main`

## 项目命令

### 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 代码质量

```bash
# 运行 ESLint
pnpm lint

# 运行 Prettier
pnpm format

# 运行类型检查
pnpm typecheck

# 运行所有检查
pnpm check
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### Git

```bash
# 查看提交历史
git log --oneline

# 查看文件变更
git diff

# 暂存更改
git add .

# 提交更改
git commit -m "feat: add new feature"

# 推送到远程
git push origin feature/new-feature
```

## 文档规范

### 代码注释

- 公共 API 必须有 JSDoc 注释
- 复杂逻辑必须添加注释说明
- 注释使用中文
- 保持注释与代码同步

### 文档更新

- 新增功能必须更新 README
- API 变更必须更新 API 文档
- 数据库变更必须更新数据库文档
- 重大变更必须更新 CHANGELOG

## 环境变量管理

- 所有敏感信息使用环境变量
- 使用 `.env.example` 作为模板
- 永远不要提交 `.env` 文件
- 生产环境使用平台提供的环境变量

## 依赖管理

- 定期更新依赖包
- 使用 `npm audit` 检查安全漏洞
- 更新前查看变更日志
- 测试更新后的功能

## 性能优化

- 使用代码分割减少初始加载
- 图片使用懒加载
- 避免不必要的重渲染
- 使用缓存策略
- 优化 API 请求次数

## 错误处理

- 所有异步操作必须有错误处理
- 提供用户友好的错误提示
- 记录错误日志（不包含敏感信息）
- 实现错误边界组件

## 安全规范

详见 [安全规范文档](../docs/SECURITY.md)

- 禁止硬编码 API Key
- 禁止明文存储密码
- 所有输入必须验证和清理
- 使用 HTTPS 传输
- 启用 CSP 头

## 开发工具推荐

### VS Code 扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Auto Rename Tag
- Path Intellisense

### 浏览器扩展

- React Developer Tools
- Redux DevTools (如果使用 Redux)

## 常见问题

### Q: 如何处理 TypeScript 错误？

A: 首先检查类型定义是否正确，如果确实需要绕过类型检查，使用 `@ts-ignore` 或 `@ts-expect-error` 并添加注释说明原因。

### Q: 何时应该创建新的组件？

A: 当 UI 元素在多个地方复用，或者组件逻辑过于复杂时，应该创建新的组件。

### Q: 如何处理 API 错误？

A: 使用统一的错误处理机制，在服务层捕获错误，在组件层显示用户友好的错误提示。

---

**最后更新**：2026-03-12
