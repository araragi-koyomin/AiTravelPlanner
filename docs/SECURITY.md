# 安全规范文档

## 1. 概述

本文档定义了 AI 旅行规划师项目的安全规范和最佳实践，确保项目在开发、部署和运行过程中的安全性。

## 2. API Key 管理

### 2.1 严禁事项

- ❌ **绝对禁止**将任何 API Key 硬编码在源代码中
- ❌ **绝对禁止**将 API Key 提交到 Git 仓库
- ❌ **绝对禁止**在公开的代码库中包含任何密钥

### 2.2 正确做法

#### 2.2.1 环境变量

使用环境变量存储敏感信息：

```typescript
// ✅ 正确
const apiKey = import.meta.env.VITE_ZHIPU_API_KEY;

// ❌ 错误
const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxx';
```

#### 2.2.2 用户输入存储

用户提供的 API Key 应该加密存储在数据库中：

```typescript
// 加密存储
import { encrypt } from '@/utils/encryption';

const encryptedKey = encrypt(userApiKey);

// 存储到数据库
await supabase.from('user_settings').insert({
  user_id: userId,
  zhipu_api_key: encryptedKey
});
```

#### 2.2.3 服务端存储

对于服务端使用的 API Key（如 Edge Functions），使用 Supabase Secrets：

```bash
# 在 Supabase Dashboard 中设置
supabase secrets set ZHIPU_API_KEY=your_key_here
```

或在 Edge Functions 中使用环境变量：

```typescript
// Edge Functions 中使用
const apiKey = Deno.env.get('ZHIPU_API_KEY');
```

## 3. 数据安全

### 3.1 数据传输

- ✅ 所有 API 请求必须使用 HTTPS
- ✅ 敏感数据传输必须加密

```typescript
// ✅ 使用 HTTPS
const response = await fetch('https://api.example.com/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 3.2 数据存储

#### 3.2.1 密码存储

- ✅ 密码必须使用 bcrypt 或 Argon2 加密
- ✅ 永远不要明文存储密码

```typescript
// 使用 Supabase Auth，自动处理密码加密
const { data, error } = await supabase.auth.signUp({
  email,
  password  // Supabase 会自动加密
});
```

#### 3.2.2 API Key 加密

使用 AES 加密存储用户 API Key：

```typescript
// utils/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

### 3.3 数据访问控制

#### 3.3.1 Row Level Security (RLS)

在 Supabase 中启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);
```

#### 3.3.2 前端验证

即使有后端验证，前端也要进行基本验证：

```typescript
// utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

## 4. 认证与授权

### 4.1 认证流程

使用 Supabase Auth 进行用户认证：

```typescript
// services/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}
```

### 4.2 路由守卫

保护需要认证的路由：

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 4.3 会话管理

```typescript
// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // 用户已登录
  } else {
    // 用户已登出
  }
});
```

## 5. 输入验证与清理

### 5.1 表单验证

```typescript
// utils/validation.ts
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateItineraryData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.destination || data.destination.trim().length === 0) {
    errors.push('目的地不能为空');
  }

  if (!data.start_date || !data.end_date) {
    errors.push('日期不能为空');
  }

  if (new Date(data.start_date) > new Date(data.end_date)) {
    errors.push('开始日期不能晚于结束日期');
  }

  if (!data.budget || data.budget <= 0) {
    errors.push('预算必须大于0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 5.2 XSS 防护

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '');
}
```

### 5.3 SQL 注入防护

使用参数化查询（Supabase 自动处理）：

```typescript
// ✅ 正确 - Supabase 自动处理参数化
const { data, error } = await supabase
  .from('itineraries')
  .select('*')
  .eq('user_id', userId);

// ❌ 错误 - 不要拼接 SQL
const query = `SELECT * FROM itineraries WHERE user_id = '${userId}'`;
```

## 6. 错误处理

### 6.1 前端错误处理

```typescript
// utils/errorHandler.ts
export function handleError(error: any, context?: string) {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);

  // 不要在控制台输出敏感信息
  if (error.message?.includes('API Key')) {
    console.error('API Key error occurred');
  }

  // 发送到错误监控服务（生产环境）
  if (import.meta.env.PROD) {
    // Sentry.captureException(error);
  }
}
```

### 6.2 用户友好的错误提示

```typescript
// 不要暴露技术细节给用户
export function getErrorMessage(error: any): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'User already registered': '该邮箱已被注册',
    'Network request failed': '网络连接失败，请检查网络',
    'API Key invalid': 'API Key 无效，请检查设置'
  };

  return errorMap[error.message] || '操作失败，请稍后重试';
}
```

## 7. 内容安全策略 (CSP)

### 7.1 配置 CSP

在 `index.html` 中添加 CSP 头：

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://open.bigmodel.cn https://lbs.amap.com;
  font-src 'self' https://cdn.jsdelivr.net;
  frame-src 'self';
">
```

### 7.2 Nginx 配置（生产环境）

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://open.bigmodel.cn https://lbs.amap.com; font-src 'self' https://cdn.jsdelivr.net; frame-src 'self';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 8. 第三方服务安全

### 8.1 API 限流

```typescript
// utils/rateLimit.ts
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
```

### 8.2 API Key 轮换

建议定期轮换 API Key，特别是在发现潜在泄露时。

## 9. 日志与监控

### 9.1 日志规范

```typescript
// utils/logger.ts
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export function log(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };

  // 不要记录敏感信息
  const sanitizedData = data ? sanitizeLogData(data) : undefined;

  if (import.meta.env.DEV) {
    console.log(JSON.stringify({ ...logEntry, data: sanitizedData }, null, 2));
  } else {
    // 发送到日志服务
    // logService.send({ ...logEntry, data: sanitizedData });
  }
}

function sanitizeLogData(data: any): any {
  const sensitiveKeys = ['password', 'apiKey', 'token', 'secret'];
  const sanitized = { ...data };

  for (const key of sensitiveKeys) {
    if (sanitized[key]) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}
```

### 9.2 错误监控

```typescript
// 集成 Sentry（可选）
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    beforeSend(event, hint) {
      // 过滤敏感信息
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
      }
      return event;
    }
  });
}
```

## 10. 部署安全

### 10.1 公开部署安全

如果要将应用部署到公开域名（如 GitHub Pages、Vercel 等），必须遵循以下安全规范：

#### 10.1.1 禁止在环境变量中配置真实 API Key

```env
# ❌ 错误：公开部署时不要配置真实的 API Key
VITE_ZHIPU_API_KEY=your-real-api-key

# ✅ 正确：公开部署时不配置 API Key，让用户自行配置
# VITE_ZHIPU_API_KEY=（留空或删除）
```

#### 10.1.2 用户 API Key 隔离

每个用户的 API Key 存储在 `user_settings` 表中，通过 RLS 策略确保：

- 用户只能访问自己的 API Key
- API Key 加密存储，即使数据库泄露也无法直接使用
- 用户 API Key 仅用于当前用户的请求

#### 10.1.3 加密密钥管理

```env
# 加密密钥必须配置（用于加密用户 API Key）
VITE_ENCRYPTION_KEY=your-secret-encryption-key-at-least-32-chars
```

**重要**：
- 加密密钥应该足够复杂（至少 32 字符）
- 不要将加密密钥提交到 Git
- 不同环境使用不同的加密密钥

### 10.2 Docker 安全

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# 使用非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 10.3 环境变量管理

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    env_file:
      - .env.production
    restart: unless-stopped
```

## 11. 代码审查检查清单

在提交代码前，确保：

- [ ] 没有硬编码的 API Key 或密钥
- [ ] 所有敏感数据都通过环境变量管理
- [ ] 用户输入都经过验证和清理
- [ ] 错误处理不会泄露敏感信息
- [ ] 使用 HTTPS 进行所有 API 请求
- [ ] 数据库查询使用参数化
- [ ] 认证和授权正确实现
- [ ] 日志中不包含敏感信息
- [ ] CSP 头正确配置
- [ ] 依赖包都是最新版本（无已知漏洞）

## 12. 安全检查工具

### 12.1 依赖漏洞扫描

```bash
# 使用 npm audit
npm audit

# 使用 Snyk
npm install -g snyk
snyk test

# 使用 npm-check-updates
npm install -g npm-check-updates
ncu
```

### 12.2 代码安全扫描

```bash
# 使用 ESLint 安全插件
npm install --save-dev eslint-plugin-security

# 使用 SonarQube（可选）
```

## 13. 应急响应

### 13.1 API Key 泄露处理

如果发现 API Key 泄露：

1. 立即在服务提供商处撤销该 Key
2. 生成新的 API Key
3. 更新环境变量
4. 重新部署应用
5. 审查访问日志，检查是否有异常使用

### 13.2 数据泄露处理

如果发生数据泄露：

1. 立即隔离受影响的系统
2. 评估泄露范围和影响
3. 通知受影响的用户
4. 修复安全漏洞
5. 加强安全措施
6. 记录事件并改进流程

## 14. 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
- [Web Security Guidelines](https://web.dev/secure/)

---

**文档版本**：v1.1
**最后更新**：2026-03-30
**维护者**：项目开发者
