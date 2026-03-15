# 单元测试配置文档

## 概述

本文档描述了 AI 旅行规划师项目的单元测试配置和使用方法。

## 测试框架

### Vitest

**版本**: 1.4.0

**选择理由**:
- 与 Vite 原生集成，配置简单
- 快速的测试执行速度
- 支持 TypeScript 开箱即用
- 与 Jest API 兼容，迁移成本低
- 内置代码覆盖率支持

### React Testing Library

**版本**: 14.2.1

**选择理由**:
- React 官方推荐的测试库
- 提供实用的测试工具
- 与 Vitest 完美集成
- 支持用户交互模拟

### jsdom

**版本**: 24.0.0

**选择理由**:
- 在 Node.js 环境中模拟浏览器 DOM
- 与 React Testing Library 配合良好
- 支持完整的 DOM API

## 配置文件

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 配置说明

#### plugins
- **react**: 使用 Vite React 插件，支持 JSX 和 React 组件测试

#### test.globals
- **true**: 启用全局测试函数（describe, it, expect 等），无需导入

#### test.environment
- **jsdom**: 使用 jsdom 模拟浏览器环境

#### test.setupFiles
- **./src/test/setup.ts**: 测试设置文件，在所有测试之前执行

#### test.css
- **true**: 支持 CSS 模块导入

#### test.coverage
- **provider**: v8（使用 v8 作为覆盖率提供者）
- **reporter**: 生成文本、JSON 和 HTML 格式的覆盖率报告
- **exclude**: 排除不需要测试覆盖的文件
- **thresholds**: 覆盖率阈值（行、函数、分支、语句都要求 > 60%）

#### resolve.alias
- **@**: 配置路径别名，支持 `@/` 导入

## 测试设置文件

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn(),
      in: vi.fn()
    }))
  }))
})
```

### 设置说明

#### @testing-library/jest-dom
- 添加自定义的 Jest DOM 匹配器（如 toBeInTheDocument）

#### cleanup
- 在每个测试后清理 React 组件，避免内存泄漏

#### vi.mock
- Mock Supabase 客户端，避免真实的 API 调用
- 提供模拟的函数，返回测试数据

## 测试脚本

### package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 脚本说明

#### test
- 运行监听模式，自动重新运行修改的测试
- 适合开发时使用

#### test:ui
- 运行测试 UI 界面
- 提供可视化的测试结果和覆盖率

#### test:run
- 运行一次所有测试
- 适合 CI/CD 环境

#### test:coverage
- 运行测试并生成覆盖率报告
- 生成 HTML 格式的覆盖率报告，可在浏览器中查看

## 测试文件组织

### 目录结构

```
src/
├── test/
│   └── setup.ts              # 测试设置文件
├── utils/
│   └── validation.test.ts     # 表单验证工具测试
├── services/
│   └── auth.test.ts          # 认证服务测试
├── stores/
│   └── authStore.test.ts      # Auth Store 测试
└── components/
    └── *.test.ts             # 组件测试（待添加）
```

### 命名规范

- 测试文件与被测试文件同名，添加 `.test.ts` 后缀
- 例如：`validation.ts` → `validation.test.ts`

## 已编写的测试

### 1. 表单验证工具测试

**文件**: `src/utils/validation.test.ts`

**测试覆盖**:
- ✅ validateEmail: 邮箱格式验证
- ✅ validatePassword: 密码强度验证
- ✅ validateConfirmPassword: 密码确认验证
- ✅ validateUsername: 用户名验证
- ✅ checkPasswordStrength: 密码强度检查
- ✅ getStrengthColor: 获取强度颜色
- ✅ getStrengthText: 获取强度文本
- ✅ sanitizeInput: 输入清理
- ✅ validateRequired: 必填项验证
- ✅ validateMinLength: 最小长度验证
- ✅ validateMaxLength: 最大长度验证

**测试用例数**: 40+

### 2. 认证服务测试

**文件**: `src/services/auth.test.ts`

**测试覆盖**:
- ✅ signIn: 登录功能
- ✅ signUp: 注册功能
- ✅ signOut: 登出功能
- ✅ resetPassword: 重置密码功能
- ✅ updatePassword: 更新密码功能
- ✅ getCurrentUser: 获取当前用户
- ✅ getCurrentSession: 获取当前会话
- ✅ onAuthStateChange: 认证状态监听
- ✅ checkAuthStatus: 检查认证状态
- ✅ getAuthErrorMessage: 错误消息转换

**测试用例数**: 25+

### 3. Auth Store 测试

**文件**: `src/stores/authStore.test.ts`

**测试覆盖**:
- ✅ 初始状态
- ✅ setUser: 设置用户信息
- ✅ setSession: 设置会话信息
- ✅ setLoading: 设置加载状态
- ✅ setError: 设置错误信息
- ✅ clearError: 清除错误信息
- ✅ login: 登录 action
- ✅ register: 注册 action
- ✅ logout: 登出 action
- ✅ resetUserPassword: 重置密码 action
- ✅ updateUserPassword: 更新密码 action
- ✅ initializeAuth: 初始化认证
- ✅ checkAuth: 检查认证状态

**测试用例数**: 20+

## 运行测试

### 开发环境

```bash
# 监听模式（推荐）
npm run test

# 或
pnpm test

# UI 模式
npm run test:ui

# 或
pnpm test:ui
```

### CI/CD 环境

```bash
# 运行一次所有测试
npm run test:run

# 或
pnpm test:run

# 生成覆盖率报告
npm run test:coverage

# 或
pnpm test:coverage
```

## 查看测试结果

### 命令行输出

运行测试后，终端会显示：
- 测试通过/失败数量
- 每个测试的执行时间
- 失败测试的详细信息

### 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告会生成在：
- `coverage/index.html`: 可在浏览器中打开查看
- `coverage/coverage-final.json`: JSON 格式的覆盖率数据
- `coverage/lcov.info`: LCOV 格式的覆盖率数据

### UI 界面

运行 `npm run test:ui` 后，浏览器会自动打开：
- 测试文件列表
- 测试结果概览
- 代码覆盖率可视化
- 测试执行时间

## 测试覆盖率目标

### 当前目标

| 指标 | 目标值 | 当前状态 |
|--------|---------|---------|
| 语句覆盖率 | > 60% | 待测试 |
| 分支覆盖率 | > 60% | 待测试 |
| 函数覆盖率 | > 60% | 待测试 |
| 行覆盖率 | > 60% | 待测试 |

### 覆盖率要求

- **P0 功能**: 核心功能（认证、行程规划）覆盖率 > 80%
- **P1 功能**: 增强功能（地图、费用管理）覆盖率 > 70%
- **P2 功能**: 辅助功能（设置、导出）覆盖率 > 60%

## Mock 策略

### Supabase Mock

所有 Supabase 相关的 API 调用都被 Mock，避免：
- 真实的网络请求
- 需要真实的 Supabase 项目
- 测试执行时间过长

### Mock 实现

```typescript
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      // ... 其他方法
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      // ... 其他方法
    }))
  }))
})
```

## 测试最佳实践

### 1. 测试命名

使用描述性的测试名称：

```typescript
it('应该验证有效的邮箱地址', () => {
  // 测试代码
})

it('应该拒绝无效的邮箱地址', () => {
  // 测试代码
})
```

### 2. AAA 模式

使用 Arrange-Act-Assert 模式：

```typescript
it('应该成功登录', async () => {
  // Arrange: 准备测试数据
  const mockUser = { id: 'test-id', email: 'test@example.com' }
  const mockSession = { access_token: 'test-token', user: mockUser }

  // Act: 执行被测试的操作
  vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
    data: { session: mockSession },
    error: null
  })
  const result = await signIn({ email: 'test@example.com', password: 'Test1234' })

  // Assert: 验证结果
  expect(result).toEqual(mockSession)
  expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
})
```

### 3. 测试隔离

每个测试应该独立运行，不依赖其他测试：

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

### 4. 边界情况测试

测试边界情况和错误情况：

```typescript
it('应该处理空输入', () => {
  const result = validateEmail('')
  expect(result.valid).toBe(false)
  expect(result.errors).toContain('邮箱不能为空')
})

it('应该处理无效输入', () => {
  const result = validateEmail('invalid-email')
  expect(result.valid).toBe(false)
  expect(result.errors).toContain('邮箱格式不正确')
})
```

### 5. 异步测试

使用 async/await 处理异步操作：

```typescript
it('应该成功登录', async () => {
  const result = await signIn({ email: 'test@example.com', password: 'Test1234' })
  expect(result).toBeDefined()
})
```

## 常见问题

### Q: 如何测试需要认证的功能？

A: Mock 认证状态，在测试中设置已认证状态：

```typescript
vi.mocked(useAuthStore).mockReturnValue({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null
})
```

### Q: 如何测试路由守卫？

A: 使用 React Router 的 MemoryRouter 和测试工具：

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

render(
  <MemoryRouter initialEntries={['/protected']}>
    <ProtectedRoute>
      <ProtectedContent />
    </ProtectedRoute>
  </MemoryRouter>
)
```

### Q: 如何测试表单提交？

A: 使用 userEvent 模拟用户交互：

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
await user.type(screen.getByLabelText('密码'), 'Test1234')
await user.click(screen.getByRole('button', { name: '登录' }))
```

### Q: 如何查看详细的测试失败信息？

A: 使用 `--reporter=verbose` 选项：

```bash
npm run test -- --reporter=verbose
```

## 下一步计划

### 待添加的测试

- [ ] 组件单元测试（Login, Register, Header, ProtectedRoute）
- [ ] 行程服务测试
- [ ] 费用服务测试
- [ ] 设置服务测试
- [ ] E2E 测试配置（Playwright）

### 测试覆盖率提升

- [ ] 确保核心功能覆盖率 > 80%
- [ ] 确保增强功能覆盖率 > 70%
- [ ] 添加组件测试，提升整体覆盖率

## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Vitest 最佳实践](https://vitest.dev/guide/)
- [测试覆盖率最佳实践](https://vitest.dev/guide/coverage)

---

**文档版本**: v1.0
**最后更新**: 2026-03-15
**维护者**: 项目开发者
