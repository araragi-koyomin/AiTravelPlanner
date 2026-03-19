# 数据库设计文档

本文档详细说明 AI 旅行规划师项目的数据库设计，包括表结构、关系、索引、约束和 Row Level Security (RLS) 策略。

> **最后更新**: 2026-03-19  
> **版本**: 2.0.0

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
  - JSONB 支持

### 设计原则

1. **安全性优先**: 使用 RLS 保护数据
2. **性能优化**: 合理使用索引
3. **数据完整性**: 使用外键约束
4. **可扩展性**: 预留扩展字段，使用 JSONB 存储灵活数据
5. **可维护性**: 清晰的命名规范

### 命名规范

- **表名**: 小写，复数形式（如 `user_profiles`, `itineraries`）
- **字段名**: 小写，下划线分隔（如 `user_id`, `created_at`）
- **主键**: `id` (UUID)
- **外键**: `{table}_id` (如 `user_id`, `itinerary_id`)
- **时间戳**: `created_at`, `updated_at`
- **排序字段**: `order_idx` (索引后缀)

---

## ER 图

### 实体关系图

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  user_profiles  │       │   itineraries   │       │ itinerary_items │
│                 │ 1   N │                 │ 1   N │                 │
│ - id (PK)       │◄──────│ - id (PK)       │◄──────│ - id (PK)       │
│ - username      │       │ - user_id (FK)  │       │ - itinerary_id  │
│ - avatar_url    │       │ - title         │       │ - day           │
│ - preferences   │       │ - destination   │       │ - time          │
│   (JSONB)       │       │ - start_date    │       │ - type          │
│ - created_at    │       │ - end_date      │       │ - name          │
│ - updated_at    │       │ - budget        │       │ - location      │
└─────────────────┘       │ - participants  │       │   (JSONB)       │
                          │ - status        │       │ - description   │
                          │ - cover_image   │       │ - cost          │
                          │ - is_favorite   │       │ - duration      │
                          │ - created_at    │       │ - tips          │
                          │ - updated_at    │       │ - image_url     │
                          └─────────────────┘       │ - order_idx     │
                                   │ 1              │ - created_at    │
                                   │                └─────────────────┘
                                   │ N              
                          ┌─────────────────┐
                          │    expenses     │
                          │                 │
                          │ - id (PK)       │
                          │ - itinerary_id  │
                          │ - category      │
                          │ - amount        │
                          │ - expense_date  │
                          │ - payment_method│
                          │ - receipt_url   │
                          │ - notes         │
                          │ - created_at    │
                          └─────────────────┘

┌─────────────────┐
│  user_settings  │
│                 │
│ - id (PK)       │
│ - user_id (FK)  │
│ - zhipu_api_key │
│ - xunfei_api_key│
│ - amap_api_key  │
│ - theme         │
│ - language      │
│ - notifications │
│ - created_at    │
│ - updated_at    │
└─────────────────┘
```

### 关系说明

| 关系                                   | 类型 | 说明                       |
| -------------------------------------- | ---- | -------------------------- |
| `auth.users` → `user_profiles`         | 1:1  | 一个认证用户对应一个资料   |
| `auth.users` → `itineraries`           | 1:N  | 一个用户可以有多个行程     |
| `itineraries` → `itinerary_items`      | 1:N  | 一个行程可以有多个行程项   |
| `itineraries` → `expenses`             | 1:N  | 一个行程可以有多条费用记录 |
| `auth.users` → `user_settings`         | 1:1  | 一个用户对应一条设置记录   |

---

## 表结构设计

### 1. user_profiles (用户资料表)

存储用户扩展信息，与 Supabase Auth 的 `auth.users` 表关联。

#### 表结构

| 字段名        | 类型         | 约束                        | 说明               |
| ------------- | ------------ | --------------------------- | ------------------ |
| `id`          | UUID         | PRIMARY KEY, FOREIGN KEY    | 用户 ID，关联 auth.users |
| `username`    | VARCHAR(100) | NULL                        | 用户昵称           |
| `avatar_url`  | TEXT         | NULL                        | 头像 URL           |
| `preferences` | JSONB        | DEFAULT '{}'::jsonb         | 用户偏好设置       |
| `created_at`  | TIMESTAMPTZ  | DEFAULT NOW()               | 创建时间           |
| `updated_at`  | TIMESTAMPTZ  | DEFAULT NOW()               | 更新时间           |

#### SQL 定义

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(100),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 使用 UUID 作为主键，**直接关联 auth.users.id**
- **username**: 用户昵称，可选字段
- **avatar_url**: 存储头像图片的 URL（Supabase Storage）
- **preferences**: 用户偏好设置，JSONB 格式，可包含：
  - `favorite_destinations`: 喜欢的目的地列表
  - `travel_style`: 旅行风格偏好
  - `budget_preference`: 预算偏好
  - `accommodation_type`: 住宿类型偏好
  - `diet_restrictions`: 饮食限制

#### preferences JSONB 结构示例

```json
{
  "favorite_destinations": ["日本", "泰国", "欧洲"],
  "travel_style": ["美食", "文化", "自然"],
  "budget_preference": "moderate",
  "accommodation_type": ["舒适型"],
  "diet_restrictions": ["素食"]
}
```

#### 索引

```sql
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
```

#### 自动创建触发器

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
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
| `status`               | VARCHAR(50)    | DEFAULT 'generated'  | 行程状态     |
| `cover_image`          | TEXT           | NULL                 | 封面图片 URL |
| `is_favorite`          | BOOLEAN        | DEFAULT FALSE        | 是否收藏     |
| `created_at`           | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间     |
| `updated_at`           | TIMESTAMPTZ    | DEFAULT NOW()        | 更新时间     |

#### SQL 定义

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  status VARCHAR(50) DEFAULT 'generated',
  cover_image TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_budget_positive CHECK (budget > 0),
  CONSTRAINT check_participants_positive CHECK (participants > 0),
  CONSTRAINT check_status_valid CHECK (status IN ('draft', 'generated', 'in_progress', 'completed', 'archived')),
  CONSTRAINT check_dates_valid CHECK (end_date >= start_date)
);
```

#### 字段说明

- **id**: 行程唯一标识
- **user_id**: 关联用户（auth.users），级联删除
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
- **status**: 行程状态，枚举值：
  - `draft`: 草稿
  - `generated`: 已生成
  - `in_progress`: 进行中
  - `completed`: 已完成
  - `archived`: 已归档
- **cover_image**: 行程封面图片 URL
- **is_favorite**: 是否收藏，用于快速访问
- **created_at**: 创建时间
- **updated_at**: 更新时间

#### 索引

```sql
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_start_date ON itineraries(start_date);
CREATE INDEX idx_itineraries_is_favorite ON itineraries(is_favorite);
CREATE INDEX idx_itineraries_destination ON itineraries(destination);
CREATE INDEX idx_itineraries_status ON itineraries(status);
CREATE INDEX idx_itineraries_user_status ON itineraries(user_id, status);
CREATE INDEX idx_itineraries_user_favorite ON itineraries(user_id, is_favorite);
```

---

### 3. itinerary_items (行程详情表)

存储行程的具体活动安排。

#### 表结构

| 字段名         | 类型           | 约束                 | 说明               |
| -------------- | -------------- | -------------------- | ------------------ |
| `id`           | UUID           | PRIMARY KEY          | 行程项 ID          |
| `itinerary_id` | UUID           | FOREIGN KEY NOT NULL | 行程 ID            |
| `day`          | INTEGER        | NOT NULL             | 第几天（从1开始）  |
| `time`         | VARCHAR(10)    | NOT NULL             | 时间（HH:MM）      |
| `type`         | VARCHAR(50)    | CHECK NOT NULL       | 类型               |
| `name`         | VARCHAR(255)   | NOT NULL             | 名称               |
| `location`     | JSONB          | NOT NULL DEFAULT '{}'| 位置信息           |
| `description`  | TEXT           | NULL                 | 描述               |
| `cost`         | DECIMAL(10, 2) | NULL                 | 费用               |
| `duration`     | INTEGER        | NULL                 | 时长（分钟）       |
| `tips`         | TEXT           | NULL                 | 游玩建议           |
| `image_url`    | TEXT           | NULL                 | 图片 URL           |
| `order_idx`    | INTEGER        | NOT NULL             | 排序索引           |
| `created_at`   | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间           |

#### SQL 定义

```sql
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
  day INTEGER NOT NULL CHECK (day > 0),
  time VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity', 'shopping')),
  name VARCHAR(255) NOT NULL,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  cost DECIMAL(10, 2),
  duration INTEGER,
  tips TEXT,
  image_url TEXT,
  order_idx INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 字段说明

- **id**: 行程项唯一标识
- **itinerary_id**: 关联行程，级联删除
- **day**: 行程第几天，从 1 开始（通过 `itineraries.start_date + (day - 1)` 计算实际日期）
- **time**: 活动时间，格式 "HH:MM"
- **type**: 活动类型，枚举值：
  - `transport`: 交通
  - `accommodation`: 住宿
  - `attraction`: 景点
  - `restaurant`: 餐厅
  - `activity`: 活动
  - `shopping`: 购物
- **name**: 活动名称
- **location**: 位置信息，JSONB 格式
- **description**: 活动描述
- **cost**: 费用（人民币）
- **duration**: 时长（分钟）
- **tips**: 游玩建议
- **image_url**: 图片 URL
- **order_idx**: 排序索引，用于按时间排序
- **created_at**: 创建时间

#### location JSONB 结构

```json
{
  "address": "东京都港区芝公园4丁目2-8",
  "lat": 35.6586,
  "lng": 139.7454,
  "poi_id": "B000A5FJD0",
  "city": "东京",
  "district": "港区"
}
```

| 字段      | 类型    | 说明                    |
| --------- | ------- | ----------------------- |
| `address` | string  | 详细地址                |
| `lat`     | number  | 纬度（高德地图坐标系）  |
| `lng`     | number  | 经度（高德地图坐标系）  |
| `poi_id`  | string  | POI 唯一标识（可选）    |
| `city`    | string  | 城市（可选）            |
| `district`| string  | 区县（可选）            |

#### 索引

```sql
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day);
CREATE INDEX idx_itinerary_items_type ON itinerary_items(type);
CREATE INDEX idx_itinerary_items_order_idx ON itinerary_items(order_idx);
CREATE INDEX idx_itinerary_items_location ON itinerary_items USING GIN (location);
CREATE INDEX idx_itinerary_items_trip_day_order ON itinerary_items(itinerary_id, day, order_idx);
```

---

### 4. expenses (费用记录表)

存储行程的费用记录。

#### 表结构

| 字段名           | 类型           | 约束                 | 说明        |
| ---------------- | -------------- | -------------------- | ----------- |
| `id`             | UUID           | PRIMARY KEY          | 费用记录 ID |
| `itinerary_id`   | UUID           | FOREIGN KEY NOT NULL | 行程 ID     |
| `category`       | VARCHAR(50)    | CHECK NOT NULL       | 类别        |
| `amount`         | DECIMAL(10, 2) | NOT NULL             | 金额        |
| `expense_date`   | DATE           | NOT NULL             | 消费日期    |
| `payment_method` | VARCHAR(50)    | NULL                 | 支付方式    |
| `receipt_url`    | TEXT           | NULL                 | 票据照片 URL|
| `notes`          | TEXT           | NULL                 | 备注        |
| `description`    | TEXT           | NULL                 | 描述        |
| `created_at`     | TIMESTAMPTZ    | DEFAULT NOW()        | 创建时间    |

#### SQL 定义

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'entertainment', 'other')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_url TEXT,
  notes TEXT,
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
  - `entertainment`: 娱乐
  - `other`: 其他
- **amount**: 金额（人民币）
- **expense_date**: 消费日期
- **payment_method**: 支付方式，枚举值：
  - `cash`: 现金
  - `credit_card`: 信用卡
  - `debit_card`: 借记卡
  - `alipay`: 支付宝
  - `wechat`: 微信支付
  - `other`: 其他
- **receipt_url**: 票据照片 URL
- **notes**: 费用备注
- **description**: 详细描述
- **created_at**: 创建时间

#### 索引

```sql
CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_itinerary_date ON expenses(itinerary_id, expense_date);
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
- **user_id**: 关联用户（auth.users），唯一约束，级联删除
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

### 1. auth.users → user_profiles (一对一)

**关系说明**：一个认证用户对应一个用户资料

**外键约束**：
```sql
id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
```

**级联删除**：删除 auth.users 时，自动删除 user_profiles

**查询示例**：
```sql
SELECT up.*, au.email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.id = 'user-uuid';
```

### 2. auth.users → itineraries (一对多)

**关系说明**：一个用户可以创建多个行程

**外键约束**：
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

**级联删除**：删除用户时，自动删除其所有行程

**查询示例**：
```sql
SELECT * FROM itineraries WHERE user_id = 'user-uuid';

SELECT au.email, i.*
FROM auth.users au
LEFT JOIN itineraries i ON au.id = i.user_id
WHERE au.id = 'user-uuid';
```

### 3. itineraries → itinerary_items (一对多)

**关系说明**：一个行程包含多个行程项

**外键约束**：
```sql
itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE
```

**级联删除**：删除行程时，自动删除其所有行程项

**查询示例**：
```sql
SELECT * FROM itinerary_items 
WHERE itinerary_id = 'itinerary-uuid'
ORDER BY day, order_idx;

SELECT i.destination, ii.*
FROM itineraries i
JOIN itinerary_items ii ON i.id = ii.itinerary_id
WHERE i.id = 'itinerary-uuid'
ORDER BY ii.day, ii.order_idx;
```

### 4. itineraries → expenses (一对多)

**关系说明**：一个行程可以有多条费用记录

**外键约束**：
```sql
itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE
```

**级联删除**：删除行程时，自动删除其所有费用记录

**查询示例**：
```sql
SELECT * FROM expenses WHERE itinerary_id = 'itinerary-uuid';

SELECT category, SUM(amount) as total
FROM expenses
WHERE itinerary_id = 'itinerary-uuid'
GROUP BY category;
```

---

## 索引设计

### 索引总览

| 表名              | 索引名                          | 字段              | 类型  | 用途           |
| ----------------- | ------------------------------- | ----------------- | ----- | -------------- |
| `user_profiles`   | `idx_user_profiles_username`    | `username`        | B-tree | 用户名搜索    |
| `user_profiles`   | `idx_user_profiles_preferences` | `preferences`     | GIN   | JSONB 查询    |
| `itineraries`     | `idx_itineraries_user_id`       | `user_id`         | B-tree | 用户行程查询  |
| `itineraries`     | `idx_itineraries_status`        | `status`          | B-tree | 状态筛选      |
| `itineraries`     | `idx_itineraries_user_status`   | `user_id, status` | B-tree | 复合查询      |
| `itinerary_items` | `idx_itinerary_items_day`       | `day`             | B-tree | 日期筛选      |
| `itinerary_items` | `idx_itinerary_items_location`  | `location`        | GIN   | JSONB 查询    |
| `itinerary_items` | `idx_itinerary_items_trip_day_order` | `itinerary_id, day, order_idx` | B-tree | 复合排序 |
| `expenses`        | `idx_expenses_itinerary_date`   | `itinerary_id, expense_date` | B-tree | 复合查询 |

---

## 约束设计

### CHECK 约束

```sql
-- itineraries 表
ALTER TABLE itineraries ADD CONSTRAINT check_budget_positive CHECK (budget > 0);
ALTER TABLE itineraries ADD CONSTRAINT check_participants_positive CHECK (participants > 0);
ALTER TABLE itineraries ADD CONSTRAINT check_status_valid 
  CHECK (status IN ('draft', 'generated', 'in_progress', 'completed', 'archived'));
ALTER TABLE itineraries ADD CONSTRAINT check_dates_valid CHECK (end_date >= start_date);

-- itinerary_items 表
ALTER TABLE itinerary_items ADD CONSTRAINT check_day_positive CHECK (day > 0);
ALTER TABLE itinerary_items ADD CONSTRAINT itinerary_items_type_check 
  CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity', 'shopping'));

-- expenses 表
ALTER TABLE expenses ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'entertainment', 'other'));
```

---

## Row Level Security (RLS)

### 启用 RLS

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### RLS 策略

#### 1. user_profiles 表策略

```sql
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. itineraries 表策略

```sql
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" ON itineraries
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3. itinerary_items 表策略

```sql
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
```

#### 4. expenses 表策略

```sql
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
```

#### 5. user_settings 表策略

```sql
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 数据迁移

### 迁移文件命名规范

```
supabase/migrations/
├── 001_initial_schema.sql          # 初始化数据库结构
├── 002_drop_users_table.sql        # 删除 users 表
├── 003_create_user_profiles.sql    # 创建 user_profiles 表
├── 004_alter_itineraries.sql       # 修改 itineraries 表
├── 005_alter_itinerary_items.sql   # 重构 itinerary_items 表
├── 006_alter_expenses.sql          # 扩展 expenses 表
├── 007_create_indexes.sql          # 创建优化索引
└── 008_verify_migration.sql        # 验证脚本
```

### 应用迁移

```bash
# 使用 Supabase CLI
supabase db push

# 或在 Supabase Dashboard 的 SQL Editor 中执行
```

---

## 性能优化

### 1. 查询优化

#### 使用索引

```sql
-- 快速查询（使用索引）
SELECT * FROM itineraries WHERE user_id = 'user-uuid';
-- 使用索引：idx_itineraries_user_id

SELECT * FROM itineraries WHERE user_id = 'user-uuid' AND status = 'generated';
-- 使用索引：idx_itineraries_user_status
```

#### 避免使用 SELECT *

```sql
-- 推荐：只返回需要的字段
SELECT id, title, destination, start_date, end_date, status
FROM itineraries 
WHERE user_id = 'user-uuid';
```

#### 使用 LIMIT 限制结果

```sql
SELECT * FROM itineraries WHERE user_id = 'user-uuid' LIMIT 10;
```

### 2. JSONB 查询优化

```sql
-- 查询偏好包含"美食"的用户
SELECT * FROM user_profiles 
WHERE preferences @> '{"travel_style": ["美食"]}'::jsonb;

-- 查询特定城市的行程项
SELECT * FROM itinerary_items 
WHERE location->>'city' = '东京';

-- 使用 GIN 索引加速 JSONB 查询
-- 已创建：idx_user_profiles_preferences, idx_itinerary_items_location
```

### 3. 批量操作

```sql
-- 批量插入
INSERT INTO itinerary_items (itinerary_id, day, time, type, name, location, order_idx) 
VALUES 
  ('itinerary-uuid', 1, '09:00', 'attraction', '景点1', '{"address": "..."}', 1),
  ('itinerary-uuid', 1, '12:00', 'restaurant', '餐厅1', '{"address": "..."}', 2);
```

---

## 备份与恢复

### 备份策略

1. **自动备份**：Supabase 提供每日自动备份
2. **手动备份**：重要操作前手动创建快照
3. **导出数据**：定期导出关键数据

### 恢复流程

```bash
# 使用 Supabase CLI 恢复
supabase db reset

# 从备份恢复
supabase db restore --backup-id <backup-id>
```

---

## 变更历史

| 版本   | 日期       | 变更内容                                      |
| ------ | ---------- | --------------------------------------------- |
| 2.0.0  | 2026-03-19 | 重大重构：users→user_profiles，itinerary_items 结构重构 |
| 1.0.0  | 2026-03-15 | 初始版本                                      |
