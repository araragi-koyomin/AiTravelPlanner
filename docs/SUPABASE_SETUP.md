# Supabase 配置指南

本文档详细说明如何配置 Supabase 作为 AI 旅行规划师项目的后端服务。

## 📋 目录

- [Supabase 概述](#supabase-概述)
- [项目创建](#项目创建)
- [数据库配置](#数据库配置)
- [认证配置](#认证配置)
- [Edge Functions 配置](#edge-functions-配置)
- [存储配置](#存储配置)
- [实时同步配置](#实时同步配置)
- [API Key 管理](#api-key-管理)
- [本地开发配置](#本地开发配置)
- [生产环境配置](#生产环境配置)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

---

## Supabase 概述

### 什么是 Supabase？

Supabase 是一个开源的 Firebase 替代方案，提供：

- **PostgreSQL 数据库**：功能强大的关系型数据库
- **认证服务**：用户注册、登录、OAuth
- **实时同步**：基于 PostgreSQL 的实时订阅
- **存储服务**：文件存储（类似 AWS S3）
- **Edge Functions**：无服务器函数（类似 AWS Lambda）
- **自动生成 API**：自动生成 REST 和 GraphQL API

### 为什么选择 Supabase？

- ✅ **开源**：完全开源，可自托管
- ✅ **TypeScript 原生**：完整的 TypeScript 支持
- ✅ **免费额度**：慷慨的免费计划
- ✅ **快速开发**：减少后端开发时间
- ✅ **易于集成**：提供官方 SDK
- ✅ **Row Level Security**：细粒度的数据访问控制

---

## 项目创建

### 1. 注册 Supabase 账号

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 选择注册方式：
   - 使用 GitHub 账号登录（推荐）
   - 使用邮箱注册
4. 完成注册流程

### 2. 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Name**: `AI Travel Planner`
   - **Database Password**: 设置强密码（至少 10 个字符）
   - **Region**: 选择离用户最近的区域
     - Southeast Asia (Singapore) - 推荐中国用户
     - East Asia (Tokyo)
     - Northeast Asia (Seoul)
3. 点击 "Create new project"

**注意**：
- 项目创建需要 1-2 分钟
- 数据库密码只显示一次，请妥善保存

### 3. 获取项目凭证

项目创建后，你会看到：

```
Project URL: https://xxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Project Reference: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**重要凭证说明**：

| 凭证 | 用途 | 安全性 |
|------|------|--------|
| **Project URL** | API 端点 | 公开 |
| **Anon Key** | 匿名访问 | 公开，用于客户端 |
| **Service Role Key** | 服务端访问 | 秘密，不要泄露 |
| **Database URL** | 直接数据库访问 | 秘密，不要泄露 |

---

## 数据库配置

### 1. 访问 SQL 编辑器

1. 在项目仪表板中，点击左侧 "SQL Editor"
2. 你可以在这里执行 SQL 命令

### 2. 创建表结构

#### 方法 1：使用 SQL 脚本（推荐）

在 SQL Editor 中执行以下 SQL：

```sql
-- ============================================
-- 用户表（与 auth.users 同步）
-- ============================================
-- 注意：id 不使用 DEFAULT，由 auth.users 触发器同步

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 触发器：auth.users 与 public.users 同步
-- ============================================
-- 【重要】必须创建此触发器，否则外键约束会失败

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, password, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.encrypted_password,
    NEW.raw_user_meta_data->>'name',
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新触发器函数
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    password = NEW.encrypted_password,
    name = NEW.raw_user_meta_data->>'name',
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- 删除触发器函数
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user();

-- 同步现有用户数据
INSERT INTO public.users (id, email, password, name, created_at, updated_at)
SELECT 
  id,
  email,
  encrypted_password,
  raw_user_meta_data->>'name',
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 行程表
-- ============================================
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  participants INTEGER NOT NULL,
  preferences TEXT[],
  special_requirements TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 行程详情表
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity')),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  cost DECIMAL(10, 2),
  duration INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 费用记录表
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户设置表
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  zhipu_api_key TEXT,
  xunfei_api_key TEXT,
  amap_api_key TEXT,
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(5) DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

#### 方法 2：使用 Table Editor（可视化）

1. 在项目仪表板中，点击左侧 "Table Editor"
2. 点击 "Create a new table"
3. 选择 "Start from scratch" 或 "Import data"
4. 填写字段信息：
   - **Table name**: `users`
   - **Columns**: 添加字段（id, email, password, name, avatar, created_at, updated_at）
5. 点击 "Save"

**重复以上步骤**，创建所有表：
- `users`
- `itineraries`
- `itinerary_items`
- `expenses`
- `user_settings`

### 3. 启用 Row Level Security (RLS)

在 SQL Editor 中执行以下 SQL：

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 行程表策略
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" ON itineraries
  FOR DELETE USING (auth.uid() = user_id);

-- 行程详情表策略
CREATE POLICY "Users can view own itinerary items" ON itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 费用记录表策略
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户设置表策略
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. 验证数据库配置

1. 在 "Table Editor" 中查看所有表
2. 确认表结构正确
3. 在 "SQL Editor" 中测试查询：

```sql
-- 测试查询
SELECT * FROM users LIMIT 5;
SELECT * FROM itineraries LIMIT 5;
SELECT * FROM itinerary_items LIMIT 5;
SELECT * FROM expenses LIMIT 5;
SELECT * FROM user_settings LIMIT 5;
```

---

## 认证配置

### 1. 启用 Email 认证

1. 在项目仪表板中，点击左侧 "Authentication"
2. 点击 "Providers" 标签
3. 找到 "Email" provider
4. 点击 "Enable"
5. 配置 Email 设置：
   - **Confirm email**: 启用邮箱验证
   - **Secure email change**: 启用安全邮箱变更
   - **Enable email confirmations**: 启用

### 2. 配置 OAuth 提供商（可选）

#### GitHub OAuth

1. 在 "Authentication" → "Providers" 中，点击 "GitHub"
2. 点击 "Enable"
3. 点击 "Get Client ID" 和 "Get Secret"
4. 在 GitHub 中创建 OAuth App：
   - 访问 https://github.com/settings/developers
   - 点击 "New OAuth App"
   - 填写应用信息：
     - Application name: `AI Travel Planner`
     - Homepage URL: `https://your-project.supabase.co/auth/v1/callback`
     - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
5. 复制 Client ID 和 Secret 到 Supabase

#### Google OAuth

1. 在 "Authentication" → "Providers" 中，点击 "Google"
2. 点击 "Enable"
3. 配置 Google OAuth：
   - Client ID: 从 Google Cloud Console 获取
   - Client Secret: 从 Google Cloud Console 获取

### 3. 配置认证策略

1. 在 "Authentication" → "Policies" 中配置：
   - **Email confirmation**: 启用
   - **Password requirements**: 最少 8 个字符
   - **Session duration**: 设置会话过期时间（推荐 1 周）

### 4. 测试认证

创建测试用户：

```bash
# 使用 Supabase CLI（需要安装）
npx supabase auth signup --email test@example.com --password Test123456

# 或使用 Postman 测试
POST https://your-project.supabase.co/auth/v1/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

---

## Edge Functions 配置

### 1. 创建 Edge Function

#### 方法 1：使用 Supabase CLI（推荐）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接到本地项目
supabase link --project-ref YOUR_PROJECT_REF

# 创建 Edge Function
supabase functions new generate-itinerary
```

#### 方法 2：使用 Dashboard

1. 在项目仪表板中，点击左侧 "Edge Functions"
2. 点击 "New Function"
3. 填写函数信息：
   - **Function name**: `generate-itinerary`
   - **Verify JWT**: 启用（需要认证）
4. 点击 "Create"

### 2. 编写 Edge Function 代码

#### generate-itinerary 函数

```typescript
// supabase/functions/generate-itinerary/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { destination, start_date, end_date, budget, participants, preferences } = await req.json();

    // 调用智谱AI API
    const prompt = `请为${destination}生成一个${start_date}到${end_date}的旅行计划，预算${budget}元，${participants}人，偏好：${preferences.join('、')}。`;

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('ZHIPU_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const itinerary = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, data: itinerary }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### 3. 配置环境变量

在 Edge Function 中添加环境变量：

1. 在 "Edge Functions" 页面中，点击函数名称
2. 点击 "Environment variables"
3. 添加以下变量：
   - **ZHIPU_API_KEY**: 智谱AI API Key
   - **XUNFEI_API_KEY**: 科大讯飞 API Key

**注意**：
- 环境变量只在 Edge Function 中可用
- 不要在代码中硬编码 API Key

### 4. 部署 Edge Function

```bash
# 使用 Supabase CLI 部署
supabase functions deploy generate-itinerary

# 或使用 Dashboard 部署
# 在 Edge Functions 页面中，点击 "Deploy"
```

### 5. 测试 Edge Function

```bash
# 使用 curl 测试
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "destination": "日本",
    "start_date": "2024-04-01",
    "end_date": "2024-04-05",
    "budget": 10000,
    "participants": 2,
    "preferences": ["美食", "动漫"]
  }' \
  https://your-project.supabase.co/functions/v1/generate-itinerary
```

---

## 存储配置

### 1. 创建存储桶

1. 在项目仪表板中，点击左侧 "Storage"
2. 点击 "New bucket"
3. 填写存储桶信息：
   - **Name**: `avatars`（用户头像）
   - **Public bucket**: 启用（如果需要公开访问）
4. 点击 "Create bucket"

**推荐的存储桶**：
- `avatars`: 用户头像
- `itinerary-images`: 行程相关图片
- `exports`: 导出的 PDF/图片

### 2. 配置存储策略

1. 在 "Storage" → "Policies" 中配置：
   - **Public access**: 控制公开访问
   - **File size limit**: 限制文件大小（如 5MB）
   - **Allowed MIME types**: 限制文件类型（如 image/*）

### 3. 测试存储

```bash
# 使用 Supabase SDK 上传文件
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('avatar.jpg', file, {
    cacheControl: '3600',
    upsert: false
  });

// 获取公开 URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar.jpg');
```

---

## 实时同步配置

### 1. 启用 Realtime

1. 在项目仪表板中，点击左侧 "Database"
2. 点击 "Replication" 标签
3. 选择要同步的表：
   - ✅ `itineraries`
   - ✅ `itinerary_items`
   - ✅ `expenses`
4. 点击 "Save"

### 2. 配置实时订阅

在客户端代码中订阅数据变更：

```typescript
import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 订阅行程表变更
const channel = supabase
  .channel('public:itineraries')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'itineraries' }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### 3. 测试实时同步

1. 在两个不同的浏览器中打开应用
2. 在一个浏览器中创建行程
3. 在另一个浏览器中应该自动看到更新

---

## API Key 管理

### 1. 获取 API Keys

在项目仪表板中，点击 "Settings" → "API"：

| Key | 用途 | 安全性 |
|-----|------|--------|
| **anon/public** | 客户端访问 | 公开，可以暴露在前端 |
| **service_role** | 服务端访问 | 秘密，不要在前端使用 |

### 2. 配置本地环境变量

在 `.env` 文件中添加：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 安全注意事项

- ✅ **永远不要**在前端代码中使用 `service_role` key
- ✅ **永远不要**将任何 API Key 提交到 Git
- ✅ **永远不要**在公开代码库中暴露 `service_role` key
- ✅ **使用** Row Level Security 保护数据
- ✅ **定期轮换** API Keys

---

## 本地开发配置

### 1. 安装 Supabase CLI

```bash
# 全局安装
npm install -g supabase

# 验证安装
supabase --version
```

### 2. 链接到 Supabase 项目

```bash
# 登录 Supabase
supabase login

# 链接到项目
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. 启动本地开发

```bash
# 启动 Supabase 本地开发
supabase start

# 这会启动：
# - 本地 PostgreSQL 数据库
# - 本地 Supabase Studio
# - 本地 Edge Functions
```

### 4. 应用数据库迁移

```bash
# 创建迁移文件
supabase migration new add_users_table

# 应用迁移
supabase db push
```

---

## 生产环境配置

### 1. 配置生产环境变量

在 `.env.production` 文件中：

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. 使用生产数据库

- ✅ 确认使用生产项目 URL
- ✅ 确认使用生产 API Keys
- ✅ 不要在开发环境使用生产数据

### 3. 配置备份

1. 在项目仪表板中，点击 "Database" → "Backups"
2. 配置自动备份：
   - **Frequency**: 每天
   - **Retention**: 保留 30 天
3. 点击 "Enable"

---

## 故障排查

### 问题 1：无法连接到 Supabase

**错误信息**：
```
Error: Connection refused
```

**解决方案**：

1. 检查 Project URL 是否正确
2. 检查网络连接
3. 检查防火墙设置
4. 确认 Supabase 服务状态：https://status.supabase.com/

### 问题 2：RLS 策略阻止访问

**错误信息**：
```
Error: new row violates row-level security policy
```

**解决方案**：

1. 检查用户是否已认证
2. 检查 RLS 策略是否正确
3. 使用 Supabase Dashboard 测试查询

### 问题 3：Edge Function 超时

**错误信息**：
```
Error: Function execution timeout
```

**解决方案**：

1. 优化函数代码，减少执行时间
2. 增加超时限制（在 Dashboard 中配置）
3. 使用异步处理

### 问题 4：实时同步不工作

**错误信息**：
```
Error: Realtime connection failed
```

**解决方案**：

1. 确认表已启用复制
2. 检查网络连接
3. 检查订阅配置

---

## 最佳实践

### 1. 数据库设计

- ✅ 使用 UUID 作为主键
- ✅ 添加适当的索引
- ✅ 启用 Row Level Security
- ✅ 使用外键约束
- ✅ 添加时间戳字段（created_at, updated_at）

### 2. 认证安全

- ✅ 启用邮箱验证
- ✅ 设置强密码策略
- ✅ 配置会话过期时间
- ✅ 使用 HTTPS 传输

### 3. Edge Functions

- ✅ 使用环境变量存储 API Keys
- ✅ 实现错误处理
- ✅ 添加日志记录
- ✅ 优化函数性能

### 4. 存储管理

- ✅ 限制文件大小
- ✅ 限制文件类型
- ✅ 配置存储策略
- ✅ 定期清理未使用的文件

### 5. 监控和日志

- ✅ 使用 Supabase Dashboard 监控
- ✅ 配置告警
- ✅ 定期查看日志
- ✅ 监控 API 使用量

---

## 参考资料

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
