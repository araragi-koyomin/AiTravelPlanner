# Supabase 集成使用文档

## 目录

- [概述](#概述)
- [配置步骤](#配置步骤)
- [数据库初始化](#数据库初始化)
- [种子数据](#种子数据)
- [运行测试](#运行测试)
- [API 使用示例](#api-使用示例)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

---

## 概述

本文档介绍如何在 AI 旅行规划师项目中配置和使用 Supabase 数据库服务。

### 主要功能

- 用户认证和授权
- 数据持久化存储
- 实时数据同步
- 行级安全策略（RLS）
- 数据库迁移管理

### 技术栈

- **数据库**: PostgreSQL (通过 Supabase)
- **认证**: Supabase Auth
- **实时**: Supabase Realtime
- **客户端**: @supabase/supabase-js

---

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: `ai-travel-planner`
   - **Database Password**: 生成强密码并保存
   - **Region**: 选择离你最近的区域
   - **Pricing Plan**: Free Tier（免费版）
4. 点击 "Create new project"，等待项目创建完成（约 2 分钟）

### 2. 获取项目凭证

创建完成后，在项目设置中获取以下信息：

1. 进入 **Settings** > **API**
2. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: 以 `eyJ...` 开头的长字符串

### 3. 配置环境变量

1. 复制 `.env.example` 文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入 Supabase 凭证：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. 保存文件

### 4. 验证配置

启动开发服务器：
```bash
pnpm dev
```

访问测试页面：`http://localhost:3000/supabase-test`

---

## 数据库初始化

### 方法 1: 使用 Supabase SQL Editor（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 点击 "New Query"
5. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
6. 粘贴到 SQL Editor
7. 点击 "Run" 执行脚本
8. 等待执行完成，确认没有错误

### 方法 2: 使用 Supabase CLI

1. 安装 Supabase CLI：
   ```bash
   npm install -g supabase
   ```

2. 登录 Supabase：
   ```bash
   supabase login
   ```

3. 链接到你的项目：
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. 执行迁移：
   ```bash
   supabase db push
   ```

### 验证数据库结构

执行完成后，在 **Table Editor** 中应该能看到以下表：

- `users` - 用户表
- `itineraries` - 行程表
- `itinerary_items` - 行程项表
- `expenses` - 费用表
- `user_settings` - 用户设置表

---

## 种子数据

### 插入种子数据

1. 在 Supabase Dashboard 中进入 **SQL Editor**
2. 点击 "New Query"
3. 复制 `supabase/seeds/001_seed_data.sql` 的内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行脚本

### 种子数据内容

脚本会插入以下测试数据：

- **3 个测试用户**
  - test.user.a@example.com
  - test.user.b@example.com
  - test.user.c@example.com

- **5 个测试行程**
  - 日本东京 5 日游
  - 北京周末游
  - 上海迪士尼 3 日游
  - 杭州西湖 2 日游
  - 成都美食之旅

- **15 个测试行程项**
  - 包含交通、住宿、景点、餐厅等活动

- **14 条测试费用记录**
  - 涵盖交通、住宿、餐饮、门票等类别

- **3 条测试用户设置**
  - 包含主题、语言、通知等配置

### 清理种子数据

如需清理种子数据，在 SQL Editor 中执行：

```sql
DELETE FROM expenses WHERE created_at < NOW() - INTERVAL '1 day';
DELETE FROM itinerary_items WHERE created_at < NOW() - INTERVAL '1 day';
DELETE FROM itineraries WHERE created_at < NOW() - INTERVAL '1 day';
DELETE FROM user_settings WHERE created_at < NOW() - INTERVAL '1 day';
DELETE FROM users WHERE created_at < NOW() - INTERVAL '1 day';
```

---

## 运行测试

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 访问测试页面

在浏览器中打开：`http://localhost:3000/supabase-test`

### 3. 执行测试

点击 "开始测试" 按钮，系统将自动执行以下测试：

#### 连接测试
- 验证 Supabase 客户端连接
- 检查数据库访问权限

#### CRUD 操作测试
- **创建**: 插入测试记录
- **读取**: 查询记录
- **更新**: 修改记录
- **删除**: 删除记录

#### RLS 策略测试
- 验证用户只能访问自己的数据
- 测试跨用户数据访问限制

#### 性能测试
- 查询性能测试（目标 < 100ms）
- 批量操作性能测试（目标 < 500ms）

### 4. 查看测试结果

测试完成后，页面会显示：

- **测试摘要**: 总数、通过、失败、警告
- **详细结果**: 每个测试的状态和详细信息
- **通过率**: 整体测试通过率

### 5. 导出测试报告

- **复制报告**: 点击 "复制报告" 按钮复制到剪贴板
- **下载报告**: 点击 "下载报告" 按钮保存为文本文件

---

## API 使用示例

### 认证相关

#### 用户注册

```typescript
import { signUp } from '@/services/supabase'

try {
  const session = await signUp(
    'user@example.com',
    'password123',
    { name: '张三' }
  )
  console.log('注册成功', session)
} catch (error) {
  console.error('注册失败', error)
}
```

#### 用户登录

```typescript
import { signIn } from '@/services/supabase'

try {
  const session = await signIn('user@example.com', 'password123')
  console.log('登录成功', session)
} catch (error) {
  console.error('登录失败', error)
}
```

#### 用户登出

```typescript
import { signOut } from '@/services/supabase'

try {
  await signOut()
  console.log('登出成功')
} catch (error) {
  console.error('登出失败', error)
}
```

#### 获取当前用户

```typescript
import { getCurrentUser } from '@/services/supabase'

const user = await getCurrentUser()
if (user) {
  console.log('当前用户', user)
}
```

### 数据库操作

#### 创建记录

```typescript
import { createRecord } from '@/services/supabase'

const itinerary = await createRecord('itineraries', {
  user_id: 'user-uuid',
  title: '日本东京 5 日游',
  destination: '日本东京',
  start_date: '2024-04-01',
  end_date: '2024-04-05',
  budget: 15000,
  participants: 2,
  preferences: ['美食', '购物'],
  special_requirements: null,
  is_favorite: true
})
```

#### 读取记录

```typescript
import { readRecord, readRecords } from '@/services/supabase'

// 读取单条记录
const itinerary = await readRecord('itineraries', 'itinerary-uuid')

// 读取多条记录
const itineraries = await readRecords('itineraries', {
  user_id: 'user-uuid'
}, {
  orderBy: { column: 'created_at', ascending: false },
  limit: 10
})
```

#### 更新记录

```typescript
import { updateRecord } from '@/services/supabase'

const updated = await updateRecord('itineraries', 'itinerary-uuid', {
  title: '日本东京 7 日游',
  budget: 20000
})
```

#### 删除记录

```typescript
import { deleteRecord } from '@/services/supabase'

await deleteRecord('itineraries', 'itinerary-uuid')
```

#### 批量操作

```typescript
import { createRecords, deleteRecords } from '@/services/supabase'

// 批量创建
const items = await createRecords('itinerary_items', [
  {
    itinerary_id: 'itinerary-uuid',
    date: '2024-04-01',
    time: '10:00',
    type: 'attraction',
    name: '浅草寺',
    address: '东京都台东区浅草2-3-1',
    order_index: 1
  },
  {
    itinerary_id: 'itinerary-uuid',
    date: '2024-04-01',
    time: '14:00',
    type: 'restaurant',
    name: '拉面店',
    address: '东京都千代田区',
    order_index: 2
  }
])

// 批量删除
await deleteRecords('itinerary_items', ['item-uuid-1', 'item-uuid-2'])
```

### 实时订阅

#### 订阅表变化

```typescript
import { subscribeToTable } from '@/services/supabase'

const unsubscribe = subscribeToTable('itineraries', (payload) => {
  console.log('表变化:', payload)
  
  if (payload.eventType === 'INSERT') {
    console.log('新行程:', payload.new)
  } else if (payload.eventType === 'UPDATE') {
    console.log('行程更新:', payload.new)
  } else if (payload.eventType === 'DELETE') {
    console.log('行程删除:', payload.old)
  }
})

// 取消订阅
unsubscribe()
```

#### 订阅用户数据变化

```typescript
import { subscribeToUserChanges } from '@/services/supabase'

const unsubscribe = subscribeToUserChanges('user-uuid', (payload) => {
  console.log('用户数据变化:', payload)
})

// 取消订阅
unsubscribe()
```

### 错误处理

```typescript
import { 
  isSupabaseError, 
  getErrorMessage,
  handleSupabaseError 
} from '@/services/supabase'

try {
  const result = await someSupabaseOperation()
} catch (error) {
  if (isSupabaseError(error)) {
    console.error('Supabase 错误:', error.code, error.message)
    console.error('详情:', error.details)
    console.error('提示:', error.hint)
  } else {
    console.error('未知错误:', getErrorMessage(error))
  }
}
```

---

## 常见问题

### Q1: 连接失败怎么办？

**A**: 检查以下几点：

1. 确认 `.env` 文件中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 确认 Supabase 项目是否已启动
3. 检查网络连接
4. 查看浏览器控制台的错误信息

### Q2: RLS 策略测试失败？

**A**: 可能的原因：

1. 数据库未启用 RLS
2. RLS 策略未正确配置
3. 用户未登录或认证失败
4. 策略条件不匹配

**解决方案**：
- 重新执行 `001_initial_schema.sql` 中的 RLS 策略部分
- 确保用户已正确登录
- 检查策略条件是否正确

### Q3: 性能测试不通过？

**A**: 优化建议：

1. 为常用查询字段添加索引
2. 优化 SQL 查询语句
3. 使用 Supabase Edge Functions 处理复杂逻辑
4. 考虑使用缓存策略

### Q4: 如何重置数据库？

**A**: 使用 Supabase CLI：

```bash
# 重置数据库
supabase db reset

# 或手动删除所有表
supabase db reset --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Q5: 如何备份数据？

**A**: 使用 Supabase Dashboard：

1. 进入 **Database** > **Backups**
2. 点击 "Create backup"
3. 等待备份完成
4. 可以下载备份文件

### Q6: 如何查看数据库日志？

**A**: 在 Supabase Dashboard 中：

1. 进入 **Logs** > **Database**
2. 选择时间范围
3. 查看查询日志和错误日志

---

## 故障排除

### 问题 1: 环境变量未加载

**症状**: 应用启动时提示 "Missing Supabase environment variables"

**解决方案**:
1. 确认 `.env` 文件存在于项目根目录
2. 检查变量名是否正确（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）
3. 重启开发服务器

### 问题 2: CORS 错误

**症状**: 浏览器控制台显示 CORS 相关错误

**解决方案**:
1. 在 Supabase Dashboard 中进入 **Authentication** > **URL Configuration**
2. 添加你的本地开发 URL：`http://localhost:3000`
3. 保存设置

### 问题 3: 认证失败

**症状**: 登录/注册失败，返回 401 或 403 错误

**解决方案**:
1. 检查邮箱格式是否正确
2. 确认密码强度符合要求
3. 检查 Supabase Auth 设置
4. 查看浏览器控制台的详细错误信息

### 问题 4: 数据库查询超时

**症状**: 查询操作长时间无响应

**解决方案**:
1. 检查网络连接
2. 优化查询语句
3. 添加适当的索引
4. 考虑分页查询

### 问题 5: 实时订阅不工作

**症状**: 订阅后未收到数据变化通知

**解决方案**:
1. 确认 Supabase Realtime 已启用
2. 检查表是否启用了 Realtime
3. 验证订阅参数是否正确
4. 检查网络连接稳定性

---

## 最佳实践

### 1. 安全性

- **永远不要**在前端暴露 `service_role` key
- 使用 RLS 策略保护数据安全
- 对敏感数据进行加密存储
- 定期轮换 API 密钥

### 2. 性能优化

- 使用索引加速查询
- 避免全表扫描
- 合理使用分页
- 缓存常用数据

### 3. 错误处理

- 始终捕获和处理错误
- 提供用户友好的错误信息
- 记录错误日志
- 实现重试机制

### 4. 数据验证

- 在前端和后端都进行数据验证
- 使用 TypeScript 类型定义
- 验证用户输入
- 防止 SQL 注入

### 5. 测试

- 编写单元测试
- 进行集成测试
- 测试 RLS 策略
- 性能测试

---

## 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Supabase Auth 指南](https://supabase.com/docs/guides/auth)
- [Supabase Realtime 指南](https://supabase.com/docs/guides/realtime)
- [Supabase RLS 指南](https://supabase.com/docs/guides/auth/row-level-security)

---

## 更新日志

### v1.0.0 (2026-03-15)

- 初始版本
- 完成数据库结构设计
- 实现 RLS 策略
- 创建测试工具
- 编写使用文档

---

## 支持

如有问题，请：

1. 查阅本文档的常见问题部分
2. 查看 Supabase 官方文档
3. 在项目 Issues 中提问
4. 联系开发团队

---

**最后更新**: 2026-03-15
