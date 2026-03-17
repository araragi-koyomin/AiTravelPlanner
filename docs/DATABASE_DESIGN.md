# 数据库设计文档

本文档详细说明 AI 旅行规划师项目的数据库设计，包括表结构、关系、索引、约束和 Row Level Security (RLS) 策略。

## 📋 目录

- [数据库概述](#数据库概述)
- [ER 图](#er-图)
- [表结构设计](#表结构设计)
- [表关系说明](#表关系说明)
- [索引设计](#索引设计)
- [约束设计](#约束设计)
- [Row Level Security (RLS)](#row-level-security-rls)
- [数据迁移](#数据迁移)
- [性能优化](#性能优化)
- [备份与恢复](#备份与恢复)

---

## 数据库概述

### 技术选型

- **数据库**: PostgreSQL 15.x
- **平台**: Supabase (基于 PostgreSQL)
- **特性**:
  - Row Level Security (RLS)
  - 实时订阅
  - 自动生成 API
  - 全文搜索

### 设计原则

1. **安全性优先**: 使用 RLS 保护数据
2. **性能优化**: 合理使用索引
3. **数据完整性**: 使用外键约束
4. **可扩展性**: 预留扩展字段
5. **可维护性**: 清晰的命名规范

### 命名规范

- **表名**: 小写，复数形式（如 `users`, `itineraries`）
- **字段名**: 小写，下划线分隔（如 `user_id`, `created_at`）
- **主键**: `id` (UUID)
- **外键**: `{table}_id` (如 `user_id`, `itinerary_id`)
- **时间戳**: `created_at`, `updated_at`

---

## ER 图

### 实体关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │ itineraries │       │itinerary_   │
│             │ 1    N │             │ 1    N │   items     │
│ - id        │◄──────│ - id        │◄──────│ - id        │
│ - email     │       │ - user_id   │       │ - itinerary │
│ - password  │       │ - title     │       │   _id       │
│ - name      │       │ - destina-  │       │ - date      │
│ - avatar    │       │   tion      │       │ - time      │
│ - created_at│       │ - start_    │       │ - type      │
│ - updated_at│       │   date      │       │ - name      │
└─────────────┘       │ - end_date  │       │ - address   │
                      │ - budget    │       │ - latitude  │
                      │ - partici-  │       │ - longitude │
                      │   pants     │       │ - descrip-  │
                      │ - travelers │       │   tion      │
                      │   _type     │       │ - cost      │
                      │ - accommo-  │       │ - duration  │
                      │   dation    │       │ - order_idx │
                      │ - pace      │       │ - created_at│
                      │ - prefer-   │       └─────────────┘
                      │   ences     │       
                      │ - is_fav-   │       
                      │   orite     │       
                      │ - created_at│       
                      │ - updated_at│       
                      └─────────────┘       
                             │ 1             
                             │               
                             │ N             
                      ┌─────────────┐
                      │  expenses   │
                      │             │
                      │ - id        │
                      │ - itinerary │
                      │   _id       │
                      │ - category  │
                      │ - amount    │
                      │ - date      │
                      │ - descrip-  │
                      │   tion      │
                      │ - created_at│
                      └─────────────┘

┌─────────────┐
│user_settings│
│             │
│ - id        │
│ - user_id   │
│ - zhipu_    │
│   api_key   │
│ - xunfei_   │
│   api_key   │
│ - amap_     │
│   api_key   │
│ - theme     │
│ - language  │
│ - notifica- │
│   tions    │
│ - created_at│
│ - updated_at│
└─────────────┘
```

### 关系说明

| 关系                              | 类型 | 说明                       |
| --------------------------------- | ---- | -------------------------- |
| `users` → `itineraries`           | 1:N  | 一个用户可以有多个行程     |
| `itineraries` → `itinerary_items` | 1:N  | 一个行程可以有多个行程项   |
| `itineraries` → `expenses`        | 1:N  | 一个行程可以有多条费用记录 |
| `users` → `user_settings`         | 1:1  | 一个用户对应一条设置记录   |

---

## 表结构设计

### 1. users (用户表)

存储用户基本信息。

#### 表结构

| 字段名       | 类型         | 约束            | 说明         |
| ------------ | ------------ | --------------- | ------------ |
| `id`         | UUID         | PRIMARY KEY     | 用户 ID      |
| `email`      | VARCHAR(255) | UNIQUE NOT NULL | 邮箱地址     |
| `password`   | VARCHAR(255) | NOT NULL        | 密码（哈希） |
| `name`       | VARCHAR(100) | NULL            | 用户名       |
| `avatar`     | TEXT         | NULL            | 头像 URL     |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW()   | 创建时间     |
| `updated_at` | TIMESTAMPTZ  | DEFAULT NOW()   | 更新时间     |

#### SQL 定义

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,  -- 不使用 DEFAULT，由 auth.users 同步
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### ⚠️ 重要：与 Supabase Auth 的关系

**Supabase 使用 `auth.users` 表存储认证用户信息，而项目使用 `public.users` 表存储用户资料。**

| 表             | 用途                | 数据来源                       |
| -------------- | ------------------- | ------------------------------ |
| `auth.users`   | Supabase 内置认证表 | 用户注册时自动创建             |
| `public.users` | 项目用户资料表      | 通过触发器从 `auth.users` 同步 |

**必须创建触发器**，在用户注册时自动同步数据到 `public.users` 表，否则外键约束会失败。

#### 触发器函数和触发器

```sql
-- 创建触发器函数：在 auth.users 创建新用户时，自动在 public.users 中创建对应记录
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

-- 创建触发器：在 auth.users 插入新记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建触发器函数：在 auth.users 更新用户时，同步更新 public.users
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

-- 创建触发器：在 auth.users 更新记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- 创建触发器函数：在 auth.users 删除用户时，同步删除 public.users
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在 auth.users 删除记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user();
```

#### 字段说明

- **id**: 使用 UUID 作为主键，**与 auth.users.id 保持一致**
- **email**: 唯一索引，用于登录，**与 auth.users.email 同步**
- **password**: 存储 bcrypt 哈希值，**与 auth.users.encrypted_password 同步**
- **name**: 可选字段，用户昵称，**从 auth.users.raw_user_meta_data 同步**
- **avatar**: 存储头像图片的 URL（Supabase Storage）
- **created_at**: 记录创建时间
- **updated_at**: 记录最后更新时间

#### 索引

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

### 2. itineraries (行程表)

存储旅行行程的基本信息。

#### 表结构

| 字段名                 | 类型           | 约束                 | 说明         |
| ---------------------- | -------------- | -------------------- | ------------ |
| `id`                   | UUID           | PRIMARY KEY          | 行程 ID      |
| `user_id`              | UUID           | FOREIGN KEY NOT NULL | 用户 ID      |
| `title`                | VARCHAR(255)   | NOT NULL             | 行程标题     |
| `destination`          | VARCHAR(255)   | NOT NULL             | 目的地       |
| `start_date`           | DATE           | NOT NULL             | 开始日期     |
| `end_date`             | DATE           | NOT NULL             | 结束日期     |
| `budget`               | DECIMAL(10, 2) | NOT NULL             | 预算         |
| `participants`         | INTEGER        | NOT NULL             | 参与人数     |
| `travelers_type`       | VARCHAR(50)    | NULL                 | 人员构成类型 |
| `accommodation_pref`   | VARCHAR(50)    | NULL                 | 住宿偏好     |
| `pace`                 | VARCHAR(50)    | NULL                 | 行程节奏     |
| `preferences`          | TEXT[]         | NULL                 | 偏好标签数组 |
| `special_requirements` | TEXT           | NULL                 | 特殊需求     |
| `is_favorite`          | BOOLEAN        | DEFAULT FALSE        | 是否收藏     |
| `created_at`           | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间     |
| `updated_at`           | TIMESTAMPTZ    | DEFAULT NOW()        | 更新时间     |

#### SQL 定义

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  participants INTEGER NOT NULL,
  travelers_type VARCHAR(50),
  accommodation_pref VARCHAR(50),
  pace VARCHAR(50),
  preferences TEXT[],
  special_requirements TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 行程唯一标识
- **user_id**: 关联用户，级联删除
- **title**: 行程标题，如 "日本 5 日游"
- **destination**: 目的地，如 "日本东京"
- **start_date**: 行程开始日期
- **end_date**: 行程结束日期
- **budget**: 总预算（人民币）
- **participants**: 参与人数
- **travelers_type**: 人员构成类型，枚举值：
  - `adult`: 成人出行
  - `family`: 亲子游
  - `couple`: 情侣出游
  - `friends`: 朋友结伴
  - `solo`: 独自旅行
  - `business`: 商务出行
- **accommodation_pref**: 住宿偏好，枚举值：
  - `budget`: 经济型
  - `comfort`: 舒适型
  - `luxury`: 豪华型
- **pace**: 行程节奏，枚举值：
  - `relaxed`: 轻松休闲
  - `moderate`: 适中节奏
  - `intense`: 紧凑充实
- **preferences**: 偏好标签数组，如 `['美食', '动漫', '购物']`
- **special_requirements**: 特殊需求，如 "需要无障碍设施"
- **is_favorite**: 是否收藏，用于快速访问
- **created_at**: 创建时间
- **updated_at**: 更新时间

#### 索引

```sql
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_start_date ON itineraries(start_date);
CREATE INDEX idx_itineraries_is_favorite ON itineraries(is_favorite);
CREATE INDEX idx_itineraries_destination ON itineraries(destination);
```

---

### 3. itinerary_items (行程详情表)

存储行程的具体活动安排。

#### 表结构

| 字段名         | 类型           | 约束                 | 说明          |
| -------------- | -------------- | -------------------- | ------------- |
| `id`           | UUID           | PRIMARY KEY          | 行程项 ID     |
| `itinerary_id` | UUID           | FOREIGN KEY NOT NULL | 行程 ID       |
| `date`         | DATE           | NOT NULL             | 日期          |
| `time`         | VARCHAR(10)    | NOT NULL             | 时间（HH:MM） |
| `type`         | VARCHAR(50)    | CHECK NOT NULL       | 类型          |
| `name`         | VARCHAR(255)   | NOT NULL             | 名称          |
| `address`      | VARCHAR(500)   | NULL                 | 地址          |
| `latitude`     | DECIMAL(10, 8) | NULL                 | 纬度          |
| `longitude`    | DECIMAL(11, 8) | NULL                 | 经度          |
| `description`  | TEXT           | NULL                 | 描述          |
| `cost`         | DECIMAL(10, 2) | NULL                 | 费用          |
| `duration`     | INTEGER        | NULL                 | 时长（分钟）  |
| `order_index`  | INTEGER        | NOT NULL             | 排序索引      |
| `created_at`   | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间      |

#### SQL 定义

```sql
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 行程项唯一标识
- **itinerary_id**: 关联行程，级联删除
- **date**: 活动日期
- **time**: 活动时间，格式 "HH:MM"
- **type**: 活动类型，枚举值：
  - `transport`: 交通
  - `accommodation`: 住宿
  - `attraction`: 景点
  - `restaurant`: 餐厅
  - `activity`: 活动
- **name**: 活动名称
- **address**: 地址
- **latitude**: 纬度（用于地图）
- **longitude**: 经度（用于地图）
- **description**: 活动描述
- **cost**: 费用（人民币）
- **duration**: 时长（分钟）
- **order_index**: 排序索引，用于按时间排序
- **created_at**: 创建时间

#### 索引

```sql
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_itinerary_items_date ON itinerary_items(date);
CREATE INDEX idx_itinerary_items_type ON itinerary_items(type);
CREATE INDEX idx_itinerary_items_order_index ON itinerary_items(order_index);
```

---

### 4. expenses (费用记录表)

存储行程的费用记录。

#### 表结构

| 字段名         | 类型           | 约束                 | 说明        |
| -------------- | -------------- | -------------------- | ----------- |
| `id`           | UUID           | PRIMARY KEY          | 费用记录 ID |
| `itinerary_id` | UUID           | FOREIGN KEY NOT NULL | 行程 ID     |
| `category`     | VARCHAR(50)    | CHECK NOT NULL       | 类别        |
| `amount`       | DECIMAL(10, 2) | NOT NULL             | 金额        |
| `date`         | DATE           | NOT NULL             | 日期        |
| `description`  | TEXT           | NULL                 | 描述        |
| `created_at`   | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间    |

#### SQL 定义

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 费用记录唯一标识
- **itinerary_id**: 关联行程，级联删除
- **category**: 费用类别，枚举值：
  - `transport`: 交通
  - `accommodation`: 住宿
  - `food`: 餐饮
  - `ticket`: 门票
  - `shopping`: 购物
  - `other`: 其他
- **amount**: 金额（人民币）
- **date**: 消费日期
- **description**: 描述
- **created_at**: 创建时间

#### 索引

```sql
CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);
```

---

### 5. user_settings (用户设置表)

存储用户的个性化设置。

#### 表结构

| 字段名           | 类型        | 约束                        | 说明             |
| ---------------- | ----------- | --------------------------- | ---------------- |
| `id`             | UUID        | PRIMARY KEY                 | 设置 ID          |
| `user_id`        | UUID        | FOREIGN KEY UNIQUE NOT NULL | 用户 ID          |
| `zhipu_api_key`  | TEXT        | NULL                        | 智谱AI API Key   |
| `xunfei_api_key` | TEXT        | NULL                        | 科大讯飞 API Key |
| `amap_api_key`   | TEXT        | NULL                        | 高德地图 API Key |
| `theme`          | VARCHAR(10) | CHECK DEFAULT 'light'       | 主题             |
| `language`       | VARCHAR(5)  | CHECK DEFAULT 'zh'          | 语言             |
| `notifications`  | BOOLEAN     | DEFAULT TRUE                | 通知开关         |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()               | 创建时间         |
| `updated_at`     | TIMESTAMPTZ | DEFAULT NOW()               | 更新时间         |

#### SQL 定义

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  zhipu_api_key TEXT,
  xunfei_api_key TEXT,
  amap_api_key TEXT,
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(5) DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 设置记录唯一标识
- **user_id**: 关联用户，唯一约束，级联删除
- **zhipu_api_key**: 智谱AI API Key（加密存储）
- **xunfei_api_key**: 科大讯飞 API Key（加密存储）
- **amap_api_key**: 高德地图 API Key（加密存储）
- **theme**: 主题，枚举值：
  - `light`: 浅色主题
  - `dark`: 深色主题
- **language**: 语言，枚举值：
  - `zh`: 中文
  - `en`: 英文
- **notifications**: 是否启用通知
- **created_at**: 创建时间
- **updated_at**: 更新时间

#### 索引

```sql
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

---

## 表关系说明

### 1. users → itineraries (一对多)

**关系说明**：一个用户可以创建多个行程

**外键约束**：
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```

**级联删除**：删除用户时，自动删除其所有行程

**查询示例**：
```sql
-- 查询用户的所有行程
SELECT * FROM itineraries WHERE user_id = 'user-uuid';

-- 查询用户及其行程
SELECT u.*, i.* 
FROM users u
LEFT JOIN itineraries i ON u.id = i.user_id
WHERE u.id = 'user-uuid';
```

### 2. itineraries → itinerary_items (一对多)

**关系说明**：一个行程包含多个行程项

**外键约束**：
```sql
itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE
```

**级联删除**：删除行程时，自动删除其所有行程项

**查询示例**：
```sql
-- 查询行程的所有行程项
SELECT * FROM itinerary_items WHERE itinerary_id = 'itinerary-uuid';

-- 查询行程及其行程项（按日期和时间排序）
SELECT i.*, it.*
FROM itineraries i
LEFT JOIN itinerary_items it ON i.id = it.itinerary_id
WHERE i.id = 'itinerary-uuid'
ORDER BY it.date, it.time, it.order_index;
```

### 3. itineraries → expenses (一对多)

**关系说明**：一个行程可以有多条费用记录

**外键约束**：
```sql
itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE
```

**级联删除**：删除行程时，自动删除其所有费用记录

**查询示例**：
```sql
-- 查询行程的所有费用记录
SELECT * FROM expenses WHERE itinerary_id = 'itinerary-uuid';

-- 查询行程及其费用记录（按类别分组）
SELECT i.*, e.*
FROM itineraries i
LEFT JOIN expenses e ON i.id = e.itinerary_id
WHERE i.id = 'itinerary-uuid'
ORDER BY e.date DESC;
```

### 4. users → user_settings (一对一)

**关系说明**：一个用户对应一条设置记录

**外键约束**：
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
```

**唯一约束**：确保一个用户只有一条设置记录

**级联删除**：删除用户时，自动删除其设置

**查询示例**：
```sql
-- 查询用户的设置
SELECT * FROM user_settings WHERE user_id = 'user-uuid';

-- 查询用户及其设置
SELECT u.*, us.*
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE u.id = 'user-uuid';
```

---

## 索引设计

### 索引策略

1. **主键索引**：自动创建（UUID）
2. **外键索引**：为所有外键创建索引
3. **查询索引**：为常用查询字段创建索引
4. **复合索引**：为多字段查询创建复合索引

### 索引清单

| 表名              | 索引名                             | 字段           | 类型   | 说明             |
| ----------------- | ---------------------------------- | -------------- | ------ | ---------------- |
| `users`           | `idx_users_email`                  | `email`        | UNIQUE | 邮箱唯一索引     |
| `users`           | `idx_users_created_at`             | `created_at`   | INDEX  | 按创建时间排序   |
| `itineraries`     | `idx_itineraries_user_id`          | `user_id`      | INDEX  | 查询用户的行程   |
| `itineraries`     | `idx_itineraries_start_date`       | `start_date`   | INDEX  | 按开始日期排序   |
| `itineraries`     | `idx_itineraries_is_favorite`      | `is_favorite`  | INDEX  | 查询收藏的行程   |
| `itineraries`     | `idx_itineraries_destination`      | `destination`  | INDEX  | 按目的地搜索     |
| `itinerary_items` | `idx_itinerary_items_itinerary_id` | `itinerary_id` | INDEX  | 查询行程的行程项 |
| `itinerary_items` | `idx_itinerary_items_date`         | `date`         | INDEX  | 按日期排序       |
| `itinerary_items` | `idx_itinerary_items_type`         | `type`         | INDEX  | 按类型筛选       |
| `itinerary_items` | `idx_itinerary_items_order_index`  | `order_index`  | INDEX  | 按顺序排序       |
| `expenses`        | `idx_expenses_itinerary_id`        | `itinerary_id` | INDEX  | 查询行程的费用   |
| `expenses`        | `idx_expenses_category`            | `category`     | INDEX  | 按类别分组       |
| `expenses`        | `idx_expenses_date`                | `date`         | INDEX  | 按日期排序       |
| `user_settings`   | `idx_user_settings_user_id`        | `user_id`      | INDEX  | 查询用户设置     |

### 索引创建 SQL

```sql
-- users 表
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- itineraries 表
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_start_date ON itineraries(start_date);
CREATE INDEX idx_itineraries_is_favorite ON itineraries(is_favorite);
CREATE INDEX idx_itineraries_destination ON itineraries(destination);

-- itinerary_items 表
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_itinerary_items_date ON itinerary_items(date);
CREATE INDEX idx_itinerary_items_type ON itinerary_items(type);
CREATE INDEX idx_itinerary_items_order_index ON itinerary_items(order_index);

-- expenses 表
CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);

-- user_settings 表
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

---

## 约束设计

### 1. 主键约束 (PRIMARY KEY)

所有表都使用 UUID 作为主键：

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**优势**：
- 全局唯一
- 不暴露自增 ID
- 适合分布式系统

### 2. 外键约束 (FOREIGN KEY)

确保数据完整性：

```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```

**级联操作**：
- `ON DELETE CASCADE`: 删除父记录时，自动删除子记录
- `ON UPDATE CASCADE`: 更新父记录时，自动更新子记录

### 3. 唯一约束 (UNIQUE)

确保字段值唯一：

```sql
email VARCHAR(255) UNIQUE NOT NULL
```

### 4. 非空约束 (NOT NULL)

确保字段必须有值：

```sql
title VARCHAR(255) NOT NULL
```

### 5. 检查约束 (CHECK)

确保字段值符合规则：

```sql
type VARCHAR(50) CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity'))
```

### 6. 默认值约束 (DEFAULT)

为字段设置默认值：

```sql
created_at TIMESTAMPTZ DEFAULT NOW()
is_favorite BOOLEAN DEFAULT FALSE
```

---

## Row Level Security (RLS)

### RLS 概述

Row Level Security (RLS) 是 PostgreSQL 的安全特性，允许在行级别控制数据访问。

### 启用 RLS

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### RLS 策略

#### 1. users 表策略

```sql
-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. itineraries 表策略

```sql
-- 用户可以查看自己的行程
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的行程
CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的行程
CREATE POLICY "Users can update own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的行程
CREATE POLICY "Users can delete own itineraries" ON itineraries
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3. itinerary_items 表策略

```sql
-- 用户可以查看自己行程的行程项
CREATE POLICY "Users can view own itinerary items" ON itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以插入自己行程的行程项
CREATE POLICY "Users can insert own itinerary items" ON itinerary_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以更新自己行程的行程项
CREATE POLICY "Users can update own itinerary items" ON itinerary_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以删除自己行程的行程项
CREATE POLICY "Users can delete own itinerary items" ON itinerary_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );
```

#### 4. expenses 表策略

```sql
-- 用户可以查看自己行程的费用记录
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以插入自己行程的费用记录
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以更新自己行程的费用记录
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- 用户可以删除自己行程的费用记录
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );
```

#### 5. user_settings 表策略

```sql
-- 用户可以查看自己的设置
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以更新自己的设置
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以插入自己的设置
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### RLS 测试

```sql
-- 测试 RLS 策略
-- 1. 设置当前用户
SET LOCAL request.jwt.claim.sub = 'user-uuid';

-- 2. 尝试查询其他用户的数据（应该失败）
SELECT * FROM itineraries WHERE user_id = 'other-user-uuid';
-- 应该返回空结果

-- 3. 查询自己的数据（应该成功）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';
-- 应该返回自己的行程
```

---

## 数据迁移

### 创建迁移文件

使用 Supabase CLI 创建迁移文件：

```bash
supabase migration new create_tables
```

### 迁移文件内容

```sql
-- supabase/migrations/20240312000000_create_tables.sql

-- ============================================
-- 创建用户表（与 auth.users 同步）
-- ============================================
-- 注意：id 不使用 DEFAULT，由 auth.users 触发器同步

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 创建触发器：auth.users 与 public.users 同步
-- ============================================

-- 创建触发器函数：在 auth.users 创建新用户时，自动在 public.users 中创建对应记录
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

-- 创建触发器：在 auth.users 插入新记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建触发器函数：在 auth.users 更新用户时，同步更新 public.users
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

-- 创建触发器：在 auth.users 更新记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- 创建触发器函数：在 auth.users 删除用户时，同步删除 public.users
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在 auth.users 删除记录后执行
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user();

-- ============================================
-- 创建行程表
-- ============================================
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  participants INTEGER NOT NULL,
  preferences TEXT[],
  special_requirements TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建行程详情表
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建费用记录表
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户设置表
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  zhipu_api_key TEXT,
  xunfei_api_key TEXT,
  amap_api_key TEXT,
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(5) DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_start_date ON itineraries(start_date);
CREATE INDEX idx_itineraries_is_favorite ON itineraries(is_favorite);
CREATE INDEX idx_itineraries_destination ON itineraries(destination);

CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_itinerary_items_date ON itinerary_items(date);
CREATE INDEX idx_itinerary_items_type ON itinerary_items(type);
CREATE INDEX idx_itinerary_items_order_index ON itinerary_items(order_index);

CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" ON itineraries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own itinerary items" ON itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own itinerary items" ON itinerary_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own itinerary items" ON itinerary_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own itinerary items" ON itinerary_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = itinerary_items.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = expenses.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 应用迁移

```bash
# 应用迁移
supabase db push

# 或使用 SQL Editor
# 复制迁移文件内容到 SQL Editor 中执行
```

---

## 性能优化

### 1. 查询优化

#### 使用索引

```sql
-- 慢查询（全表扫描）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';

-- 快速查询（使用索引）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';
-- 使用索引：idx_itineraries_user_id
```

#### 避免使用 SELECT *

```sql
-- 慢查询（返回所有字段）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';

-- 快速查询（只返回需要的字段）
SELECT id, title, destination, start_date, end_date 
FROM itineraries 
WHERE user_id = 'user-uuid';
```

#### 使用 LIMIT 限制结果

```sql
-- 慢查询（返回所有结果）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';

-- 快速查询（只返回前 10 条）
SELECT * FROM itineraries WHERE user_id = 'user-uuid' LIMIT 10;
```

### 2. 连接优化

#### 使用 JOIN 而不是子查询

```sql
-- 慢查询（子查询）
SELECT * FROM itineraries 
WHERE user_id IN (SELECT id FROM users WHERE email = 'test@example.com');

-- 快速查询（JOIN）
SELECT i.* 
FROM itineraries i
JOIN users u ON i.user_id = u.id
WHERE u.email = 'test@example.com';
```

### 3. 批量操作

#### 使用批量插入

```sql
-- 慢操作（逐条插入）
INSERT INTO itinerary_items (itinerary_id, date, time, type, name, order_index) 
VALUES ('itinerary-uuid', '2024-04-01', '09:00', 'attraction', '景点1', 1);
INSERT INTO itinerary_items (itinerary_id, date, time, type, name, order_index) 
VALUES ('itinerary-uuid', '2024-04-01', '12:00', 'restaurant', '餐厅1', 2);

-- 快速操作（批量插入）
INSERT INTO itinerary_items (itinerary_id, date, time, type, name, order_index) 
VALUES 
  ('itinerary-uuid', '2024-04-01', '09:00', 'attraction', '景点1', 1),
  ('itinerary-uuid', '2024-04-01', '12:00', 'restaurant', '餐厅1', 2);
```

### 4. 缓存策略

#### 使用 PostgreSQL 缓存

```sql
-- 启用查询缓存
SET enable_seqscan = off;

-- 使用物化视图
CREATE MATERIALIZED VIEW user_itinerary_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(i.id) as itinerary_count,
  SUM(i.budget) as total_budget
FROM users u
LEFT JOIN itineraries i ON u.id = i.user_id
GROUP BY u.id, u.email;

-- 刷新物化视图
REFRESH MATERIALIZED VIEW user_itinerary_summary;
```

---

## 备份与恢复

### 1. 备份策略

#### 自动备份

在 Supabase Dashboard 中配置自动备份：

1. 进入项目 Dashboard
2. 点击 "Database" → "Backups"
3. 配置自动备份：
   - **Frequency**: 每天
   - **Retention**: 保留 30 天
4. 点击 "Enable"

#### 手动备份

```bash
# 使用 Supabase CLI 备份
supabase db dump -f backup.sql

# 或使用 pg_dump
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### 2. 恢复策略

#### 从备份恢复

```bash
# 使用 Supabase CLI 恢复
supabase db reset

# 或使用 psql
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

#### 点时间恢复 (PITR)

在 Supabase Dashboard 中：

1. 进入项目 Dashboard
2. 点击 "Database" → "Backups"
3. 选择备份点
4. 点击 "Restore"

---

## 参考资料

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Supabase 数据库文档](https://supabase.com/docs/guides/database)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/current/performance-tips.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
