# 🚀 AI 旅行规划师数据库重构 - 完整执行 Prompt

> **执行说明**：请 AI 助手严格按照以下 prompt 执行数据库重构任务。任务分为多个阶段，需按顺序执行。每个阶段完成后需确认再进入下一阶段。

***

## 📋 任务概览

### 项目背景

AI 旅行规划师是一个基于 Supabase + React 的智能旅行规划应用。当前数据库结构存在以下问题：

1. `users` 表与 Supabase Auth 的 `auth.users` 重复
2. `itinerary_items` 表字段分散，不利于地图功能接入
3. 缺少行程状态管理和封面图支持
4. 字段命名不统一（`order_index` vs `order_idx`）

### 重构目标

1. 用 `user_profiles` 表完全替换 `users` 表
2. 重构 `itinerary_items` 表，引入 `day` 和 `location` JSONB 字段
3. 为 `itineraries` 表添加 `status` 和 `cover_image` 字段
4. 扩展 `expenses` 表字段
5. 统一字段命名为 `order_idx`
6. 提取 AI Prompt 模板到独立文件

### 执行策略

- **分阶段执行**：文档 → 数据库 → 后端 → 前端 → 测试
- **渐进式迁移**：前端保留旧字段兼容，后续清理
- **地图功能**：仅准备 `location` 字段结构，地图组件后续开发

***

## 📁 执行阶段总览

```
阶段0: 文档更新（docs/ 目录）
    ↓
阶段1: 数据库迁移脚本（supabase/migrations/）
    ↓
阶段2: 后端服务层更新
    ↓
阶段3: 前端类型定义更新
    ↓
阶段4: 前端组件更新
    ↓
阶段5: AI Prompt 模板提取与更新
    ↓
阶段6: 测试用例更新
    ↓
阶段7: 回滚脚本生成
```

***

## 阶段 0：文档更新

### 0.1 更新 `docs/DATABASE_DESIGN.md`

**修改要点**：

1. 将 `users` 表替换为 `user_profiles` 表
2. 更新 `itineraries` 表结构，添加 `status`、`cover_image` 字段
3. 更新 `itinerary_items` 表结构：
   - 删除 `date`、`address`、`latitude`、`longitude` 字段
   - 添加 `day`、`location`（JSONB）、`tips`、`image_url` 字段
   - 将 `order_index` 改为 `order_idx`
4. 更新 `expenses` 表结构，添加 `payment_method`、`receipt_url`、`notes` 字段
5. 更新 ER 图和关系说明
6. 更新 RLS 策略说明

**关键变更对照表**：

| 表名                | 变更类型 | 变更内容                                  |
| ----------------- | ---- | ------------------------------------- |
| `users`           | 删除   | 完全替换为 `user_profiles`                 |
| `user_profiles`   | 新增   | 用户扩展信息表                               |
| `itineraries`     | 修改   | 添加 `status`、`cover_image`             |
| `itinerary_items` | 重构   | `date`→`day`，位置字段合并为 `location` JSONB |
| `expenses`        | 扩展   | 添加支付方式、票据、备注字段                        |

### 0.2 更新 `docs/PRD.md`

**修改要点**：

1. 更新数据模型章节中的表结构定义
2. 添加行程状态说明
3. 更新费用类别，添加 `entertainment`

### 0.3 更新 `docs/TECHNICAL_ARCHITECTURE.md`

**修改要点**：

1. 更新数据库表结构 SQL 定义
2. 更新 RLS 策略代码
3. 添加 `user_profiles` 表说明

### 0.4 更新 `docs/PROMPT_TEMPLATES.md`

**修改要点**：

1. 更新行程生成 Prompt 模板，适配新的数据结构
2. 添加 `day` 字段说明（从 1 开始）
3. 添加 `location` JSONB 结构说明
4. 添加 `tips` 和 `image_url` 字段要求

***

## 阶段 1：数据库迁移脚本

### 1.1 创建迁移脚本目录结构

```
supabase/migrations/
├── 001_initial_schema.sql          # 保留原有
├── 002_drop_users_table.sql        # 删除 users 表
├── 003_create_user_profiles.sql    # 创建 user_profiles 表
├── 004_alter_itineraries.sql       # 修改 itineraries 表
├── 005_alter_itinerary_items.sql   # 重构 itinerary_items 表
├── 006_alter_expenses.sql          # 扩展 expenses 表
├── 007_create_indexes.sql          # 创建优化索引
└── 008_verify_migration.sql        # 验证脚本
```

### 1.2 迁移脚本详细内容

#### 文件：`supabase/migrations/002_drop_users_table.sql`

```sql
-- ============================================
-- 002_drop_users_table.sql
-- 删除原有的 users 表
-- 注意：此操作会删除 users 表中的所有数据
-- ============================================

-- 先删除依赖 users 表的外键约束
ALTER TABLE itineraries DROP CONSTRAINT IF EXISTS itineraries_user_id_fkey;
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- 删除 users 表
DROP TABLE IF EXISTS users CASCADE;

-- 删除相关的触发器（如果存在）
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- 删除触发器函数
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_update_user();
DROP FUNCTION IF EXISTS public.handle_delete_user();

DO $$
BEGIN
  RAISE NOTICE 'users 表已删除';
END $$;
```

#### 文件：`supabase/migrations/003_create_user_profiles.sql`

```sql
-- ============================================
-- 003_create_user_profiles.sql
-- 创建用户扩展信息表
-- ============================================

-- 创建 user_profiles 表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(100),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建索引
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 创建触发器：用户注册时自动创建 profile
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

-- 添加表注释
COMMENT ON TABLE user_profiles IS '用户扩展信息表，存储用户个人资料和偏好设置';
COMMENT ON COLUMN user_profiles.preferences IS '用户偏好设置，JSONB 格式，可包含 favorite_destinations, travel_style, budget_preference 等';

DO $$
BEGIN
  RAISE NOTICE 'user_profiles 表创建完成';
END $$;
```

#### 文件：`supabase/migrations/004_alter_itineraries.sql`

```sql
-- ============================================
-- 004_alter_itineraries.sql
-- 修改 itineraries 表结构
-- ============================================

-- 修改外键引用：从 users 改为 auth.users
ALTER TABLE itineraries 
  ADD CONSTRAINT itineraries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 添加 status 字段
ALTER TABLE itineraries ADD COLUMN status VARCHAR(50) DEFAULT 'generated';

-- 添加 cover_image 字段
ALTER TABLE itineraries ADD COLUMN cover_image TEXT;

-- 添加 CHECK 约束
ALTER TABLE itineraries ADD CONSTRAINT check_budget_positive CHECK (budget > 0);
ALTER TABLE itineraries ADD CONSTRAINT check_participants_positive CHECK (participants > 0);
ALTER TABLE itineraries ADD CONSTRAINT check_status_valid 
  CHECK (status IN ('draft', 'generated', 'in_progress', 'completed', 'archived'));

-- 添加 CHECK 约束：结束日期必须大于等于开始日期
ALTER TABLE itineraries ADD CONSTRAINT check_dates_valid 
  CHECK (end_date >= start_date);

-- 更新现有数据的 status（根据日期判断）
UPDATE itineraries 
SET status = CASE
  WHEN end_date < CURRENT_DATE THEN 'completed'
  WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'in_progress'
  ELSE 'generated'
END;

-- 创建索引
CREATE INDEX idx_itineraries_status ON itineraries(status);
CREATE INDEX idx_itineraries_user_status ON itineraries(user_id, status);

-- 添加字段注释
COMMENT ON COLUMN itineraries.status IS '行程状态：draft(草稿), generated(已生成), in_progress(进行中), completed(已完成), archived(已归档)';
COMMENT ON COLUMN itineraries.cover_image IS '行程封面图片 URL';

DO $$
BEGIN
  RAISE NOTICE 'itineraries 表修改完成';
END $$;
```

#### 文件：`supabase/migrations/005_alter_itinerary_items.sql`

```sql
-- ============================================
-- 005_alter_itinerary_items.sql
-- 重构 itinerary_items 表结构
-- ============================================

-- ============================================
-- 步骤1: 添加新字段
-- ============================================

-- 添加 day 字段（第几天）
ALTER TABLE itinerary_items ADD COLUMN day INT;

-- 添加 location JSONB 字段
ALTER TABLE itinerary_items ADD COLUMN location JSONB;

-- 添加 tips 字段
ALTER TABLE itinerary_items ADD COLUMN tips TEXT;

-- 添加 image_url 字段
ALTER TABLE itinerary_items ADD COLUMN image_url TEXT;

-- 重命名 order_index 为 order_idx
ALTER TABLE itinerary_items RENAME COLUMN order_index TO order_idx;

-- ============================================
-- 步骤2: 数据迁移（如果有数据）
-- ============================================

-- 计算 day 值（从 start_date 计算）
UPDATE itinerary_items ii
SET day = (ii.date::date - i.start_date::date)::INT + 1
FROM itineraries i
WHERE ii.itinerary_id = i.id AND ii.day IS NULL;

-- 迁移位置信息到 location JSONB
UPDATE itinerary_items
SET location = jsonb_build_object(
  'address', COALESCE(address, ''),
  'lat', latitude,
  'lng', longitude
)
WHERE location IS NULL AND (address IS NOT NULL OR latitude IS NOT NULL OR longitude IS NOT NULL);

-- 为没有位置信息的记录设置空对象
UPDATE itinerary_items
SET location = '{}'::jsonb
WHERE location IS NULL;

-- ============================================
-- 步骤3: 添加约束和默认值
-- ============================================

-- 设置 day 非空约束
ALTER TABLE itinerary_items ALTER COLUMN day SET NOT NULL;
ALTER TABLE itinerary_items ADD CONSTRAINT check_day_positive CHECK (day > 0);

-- 设置 location 默认值和非空
ALTER TABLE itinerary_items ALTER COLUMN location SET DEFAULT '{}'::jsonb;
ALTER TABLE itinerary_items ALTER COLUMN location SET NOT NULL;

-- 更新 type 约束（添加 shopping 类型）
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS itinerary_items_type_check;
ALTER TABLE itinerary_items ADD CONSTRAINT itinerary_items_type_check 
  CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity', 'shopping'));

-- ============================================
-- 步骤4: 删除旧字段
-- ============================================

ALTER TABLE itinerary_items DROP COLUMN IF EXISTS date;
ALTER TABLE itinerary_items DROP COLUMN IF EXISTS address;
ALTER TABLE itinerary_items DROP COLUMN IF EXISTS latitude;
ALTER TABLE itinerary_items DROP COLUMN IF EXISTS longitude;

-- ============================================
-- 步骤5: 创建索引
-- ============================================

-- 删除旧索引
DROP INDEX IF EXISTS idx_itinerary_items_date;

-- 创建新索引
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day);
CREATE INDEX idx_itinerary_items_location ON itinerary_items USING GIN (location);
CREATE INDEX idx_itinerary_items_trip_day_order ON itinerary_items(itinerary_id, day, order_idx);

-- ============================================
-- 步骤6: 更新字段注释
-- ============================================

COMMENT ON COLUMN itinerary_items.day IS '行程第几天，从1开始';
COMMENT ON COLUMN itinerary_items.location IS '位置信息 JSONB: {address, lat, lng, poi_id, city, district}';
COMMENT ON COLUMN itinerary_items.tips IS '游玩建议';
COMMENT ON COLUMN itinerary_items.image_url IS '图片 URL';
COMMENT ON COLUMN itinerary_items.order_idx IS '排序索引';

-- ============================================
-- 完成
-- ============================================

DO $$
DECLARE
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM itinerary_items;
  RAISE NOTICE 'itinerary_items 表重构完成，共 % 条记录已迁移', total_count;
END $$;
```

#### 文件：`supabase/migrations/006_alter_expenses.sql`

```sql
-- ============================================
-- 006_alter_expenses.sql
-- 扩展 expenses 表字段
-- ============================================

-- 添加新字段
ALTER TABLE expenses ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE expenses ADD COLUMN receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN notes TEXT;

-- 重命名 date 为 expense_date
ALTER TABLE expenses RENAME COLUMN date TO expense_date;

-- 添加 CHECK 约束
ALTER TABLE expenses ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

-- 更新 category 约束（添加 entertainment）
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN ('transport', 'accommodation', 'food', 'ticket', 'shopping', 'entertainment', 'other'));

-- 创建复合索引
CREATE INDEX idx_expenses_itinerary_date ON expenses(itinerary_id, expense_date);

-- 添加字段注释
COMMENT ON COLUMN expenses.payment_method IS '支付方式：cash, credit_card, debit_card, alipay, wechat, other';
COMMENT ON COLUMN expenses.receipt_url IS '票据照片 URL';
COMMENT ON COLUMN expenses.notes IS '费用备注';
COMMENT ON COLUMN expenses.expense_date IS '消费日期';

DO $$
BEGIN
  RAISE NOTICE 'expenses 表修改完成';
END $$;
```

#### 文件：`supabase/migrations/007_create_indexes.sql`

```sql
-- ============================================
-- 007_create_indexes.sql
-- 创建优化索引
-- ============================================

-- itineraries 表复合索引
CREATE INDEX IF NOT EXISTS idx_itineraries_user_status ON itineraries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_favorite ON itineraries(user_id, is_favorite);

-- itinerary_items 表复合索引
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_day_order ON itinerary_items(itinerary_id, day, order_idx);

-- expenses 表复合索引
CREATE INDEX IF NOT EXISTS idx_expenses_itinerary_date ON expenses(itinerary_id, expense_date);

-- user_profiles 表 GIN 索引（支持 JSONB 查询）
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

DO $$
BEGIN
  RAISE NOTICE '索引创建完成';
END $$;
```

#### 文件：`supabase/migrations/008_verify_migration.sql`

```sql
-- ============================================
-- 008_verify_migration.sql
-- 验证迁移结果
-- ============================================

-- 验证 user_profiles 表
SELECT 'user_profiles' AS table_name, COUNT(*) AS count FROM user_profiles
UNION ALL
-- 验证 itineraries 表 status 分布
SELECT 'itineraries_by_status', COUNT(*) FROM itineraries WHERE status IS NOT NULL
UNION ALL
-- 验证 itinerary_items 表 day 字段
SELECT 'itinerary_items_with_day', COUNT(*) FROM itinerary_items WHERE day IS NOT NULL
UNION ALL
-- 验证 itinerary_items 表 location 字段
SELECT 'itinerary_items_with_location', COUNT(*) FROM itinerary_items WHERE location IS NOT NULL
UNION ALL
-- 验证 expenses 表新字段
SELECT 'expenses_total', COUNT(*) FROM expenses;

-- 验证索引
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 验证约束
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 验证数据完整性：检查 day 值是否合理
SELECT 
  ii.id,
  ii.day,
  i.start_date,
  i.end_date,
  i.start_date + (ii.day - 1) AS calculated_date
FROM itinerary_items ii
JOIN itineraries i ON ii.itinerary_id = i.id
WHERE ii.day < 1 
   OR ii.day > (i.end_date - i.start_date + 1);

-- 如果上述查询返回空，则数据迁移成功
DO $$
BEGIN
  RAISE NOTICE '验证完成，请检查上述结果';
END $$;
```

***

## 阶段 2：后端服务层更新

### 2.1 更新 `src/services/supabase.ts`

**修改要点**：

1. 更新 Database 接口，删除 `users` 表定义
2. 添加 `user_profiles` 表定义
3. 更新 `itineraries` 表定义，添加 `status`、`cover_image`
4. 更新 `itinerary_items` 表定义：
   - 删除 `date`、`address`、`latitude`、`longitude`
   - 添加 `day`、`location`、`tips`、`image_url`
   - 将 `order_index` 改为 `order_idx`
5. 更新 `expenses` 表定义，添加新字段

**关键代码**：

```typescript
// Location JSONB 类型
export interface Location {
  address: string
  lat: number | null
  lng: number | null
  poi_id?: string
  city?: string
  district?: string
}

// 行程状态类型
export type ItineraryStatus = 'draft' | 'generated' | 'in_progress' | 'completed' | 'archived'

// 费用类别（添加 entertainment）
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'entertainment' | 'other'

// Database 接口更新
export interface Database {
  public: {
    Tables: {
      // 删除 users 表定义
      
      // 新增 user_profiles 表
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      
      // 更新 itineraries 表
      itineraries: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          participants: number
          preferences: string[] | null
          special_requirements: string | null
          travelers_type: string | null
          accommodation_pref: string | null
          pace: string | null
          is_favorite: boolean
          status: ItineraryStatus  // 新增
          cover_image: string | null  // 新增
          created_at: string
          updated_at: string
        }
        // ... Insert, Update 同步更新
      }
      
      // 更新 itinerary_items 表
      itinerary_items: {
        Row: {
          id: string
          itinerary_id: string
          day: number  // 替代 date
          time: string
          type: ActivityType
          name: string
          location: Json  // JSONB 类型
          description: string | null
          cost: number | null
          duration: number | null
          order_idx: number  // 原 order_index
          tips: string | null  // 新增
          image_url: string | null  // 新增
          created_at: string
        }
        // ... Insert, Update 同步更新
      }
      
      // 更新 expenses 表
      expenses: {
        Row: {
          id: string
          itinerary_id: string
          category: ExpenseCategory
          amount: number
          expense_date: string  // 原 date
          payment_method: string | null  // 新增
          receipt_url: string | null  // 新增
          notes: string | null  // 新增
          description: string | null
          created_at: string
        }
        // ... Insert, Update 同步更新
      }
      
      // user_settings 表保持不变，但外键引用更新
      user_settings: {
        Row: {
          id: string
          user_id: string  // 现在引用 auth.users.id
          // ... 其他字段不变
        }
      }
    }
  }
}
```

### 2.2 更新 `src/services/types.ts`

**修改要点**：

1. 添加 `Location` 接口
2. 添加 `ItineraryStatus` 类型
3. 更新 `ExpenseCategory` 类型，添加 `entertainment`
4. 更新 `Itinerary` 接口
5. 更新 `ItineraryItem` 接口
6. 更新 `Expense` 接口
7. 添加 `UserProfile` 接口

### 2.3 更新 `src/services/itinerary.ts`

**修改要点**：

1. 更新 `buildDailySchedule` 函数，使用 `day` 字段分组
2. 更新 `getItineraryItems` 返回类型
3. 添加行程状态相关函数
4. 更新字段名 `order_index` → `order_idx`

**关键函数修改**：

```typescript
// buildDailySchedule 函数修改
export function buildDailySchedule(
  startDate: string,
  endDate: string,
  items: ItineraryItem[]
): DailyScheduleBuilt[] {
  const schedules: DailyScheduleBuilt[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i - 1)
    
    // 使用 day 字段筛选，而非 date
    const dayItems = items.filter(item => item.day === i)
      .sort((a, b) => a.order_idx - b.order_idx)

    schedules.push({
      day: i,
      date: date.toISOString().split('T')[0],
      dayOfWeek: DAY_OF_WEEK_LABELS[date.getDay()],
      theme: getDayTheme(dayItems),
      items: dayItems
    })
  }

  return schedules
}
```

### 2.4 更新 `src/services/expense.ts`

**修改要点**：

1. 更新字段名 `date` → `expense_date`
2. 更新 `ExpenseCategory` 类型
3. 添加新字段支持

### 2.5 新增 `src/services/userProfile.ts`

**功能**：

- `getUserProfile(userId)` - 获取用户资料
- `updateUserProfile(userId, data)` - 更新用户资料
- `updateUserPreferences(userId, preferences)` - 更新用户偏好

***

## 阶段 3：前端类型定义更新

### 3.1 更新 `src/types/itinerary.ts`

**修改要点**：

1. 添加 `Location` 接口
2. 添加 `ItineraryStatus` 类型和标签映射
3. 更新 `ItineraryItemBase` 接口
4. 更新 `Activity` 接口
5. 更新 `DailyScheduleWithItems` 接口，添加 `day` 字段

**关键代码**：

```typescript
// 新增 Location 接口
export interface Location {
  address: string
  lat: number | null
  lng: number | null
  poi_id?: string
  city?: string
  district?: string
}

// 新增行程状态类型
export type ItineraryStatus = 'draft' | 'generated' | 'in_progress' | 'completed' | 'archived'

export const ItineraryStatusLabels: Record<ItineraryStatus, string> = {
  draft: '草稿',
  generated: '已生成',
  in_progress: '进行中',
  completed: '已完成',
  archived: '已归档'
}

// 更新 ItineraryItemBase 接口
export interface ItineraryItemBase {
  id: string
  itinerary_id: string
  day: number  // 原 date
  time: string
  type: ActivityType
  name: string
  location: Location  // 新增，替代 address/latitude/longitude
  description: string | null
  cost: number | null
  duration: number | null
  order_idx: number  // 原 order_index
  tips: string | null  // 新增
  image_url: string | null  // 新增
  created_at: string
}

// 更新 DailyScheduleWithItems 接口
export interface DailyScheduleWithItems {
  day: number  // 新增
  date: string
  dayOfWeek: string
  theme: string
  items: ItineraryItemBase[]
}
```

***

## 阶段 4：前端组件更新

### 4.1 更新 `src/components/itinerary/ListView.tsx`

**修改要点**：

1. 使用 `item.day` 替代计算日期
2. 解析 `item.location` 获取地址
3. 展示 `item.tips` 和 `item.image_url`
4. 更新字段名 `order_index` → `order_idx`

### 4.2 更新 `src/components/itinerary/TimelineView.tsx`

**修改要点**：同 ListView

### 4.3 更新 `src/pages/ItineraryDetail.tsx`

**修改要点**：

1. 使用 `status` 字段展示行程状态徽章
2. 支持 `cover_image` 封面展示
3. 更新 `dailySchedule` 构建逻辑
4. 更新字段访问方式

### 4.4 更新 `src/pages/Itineraries.tsx`

**修改要点**：

1. 支持按 `status` 筛选行程
2. 展示行程封面图 `cover_image`
3. 添加状态筛选器组件

### 4.5 更新 `src/pages/ItineraryPlanner.tsx`

**修改要点**：

1. 生成行程时设置 `status: 'generated'`
2. 支持上传/选择封面图（可选）

***

## 阶段 5：AI Prompt 模板提取与更新

### 5.1 创建 Prompt 模板文件

**新建文件**：`supabase/functions/_shared/prompt_templates.ts`

```typescript
// ============================================
// prompt_templates.ts
// AI Prompt 模板定义
// ============================================

export interface ItineraryPromptParams {
  destination: string
  startDate: string
  endDate: string
  daysCount: number
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
  travelersType?: string
  accommodation?: string
  pace?: string
}

export function buildItineraryPrompt(params: ItineraryPromptParams): string {
  const {
    destination,
    startDate,
    endDate,
    daysCount,
    budget,
    participants,
    preferences,
    specialRequirements,
    travelersType,
    accommodation,
    pace
  } = params

  return `你是一位专业的旅行规划师，请为用户生成一份详细的旅行计划。

**用户需求：**
- 目的地：${destination}
- 日期：${startDate} 至 ${endDate}（共 ${daysCount} 天）
- 预算：${budget} 元
- 参与人数：${participants} 人
${travelersType ? `- 人员构成：${travelersType}` : ''}
${accommodation ? `- 住宿偏好：${accommodation}` : ''}
${pace ? `- 行程节奏：${pace}` : ''}
${preferences.length > 0 ? `- 旅行偏好：${preferences.join('、')}` : ''}
${specialRequirements ? `- 特殊需求：${specialRequirements}` : ''}

**输出要求：**
请严格按照以下 JSON 格式输出，不要添加任何其他内容：

\`\`\`json
{
  "trip_title": "行程标题",
  "summary": "行程概述（100字以内）",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "total_estimated_cost": 预估总费用（数字）,
  "daily_itinerary": [
    {
      "day": 1,
      "theme": "当天主题",
      "items": [
        {
          "time": "09:00",
          "type": "attraction|restaurant|hotel|transport|activity|shopping",
          "name": "地点名称",
          "location": {
            "address": "详细地址",
            "lat": 纬度（数字，如无则为 null）,
            "lng": 经度（数字，如无则为 null）,
            "poi_id": "POI标识（如有）",
            "city": "城市",
            "district": "区县"
          },
          "description": "详细描述（50字以内）",
          "cost": 费用（数字）,
          "duration": 时长分钟数（数字）,
          "tips": "游玩建议（30字以内）",
          "image_url": "图片URL（如有，可为null）"
        }
      ]
    }
  ],
  "transportation": {
    "to_destination": {
      "method": "交通方式",
      "details": "详细信息",
      "estimated_cost": 费用,
      "duration": "时长"
    },
    "local_transport": {
      "recommendation": "当地交通建议",
      "daily_cost": 日均费用,
      "tips": "交通提示"
    }
  },
  "accommodation": [
    {
      "day": 1,
      "hotel_name": "酒店名称",
      "location": {
        "address": "酒店地址",
        "lat": 纬度,
        "lng": 经度
      },
      "price_range": "价格区间",
      "features": ["特色1", "特色2"],
      "booking_tips": "预订建议"
    }
  ],
  "budget_breakdown": {
    "transportation": 交通费用,
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "tickets": 门票费用,
    "shopping": 购物预算,
    "other": 其他费用
  },
  "packing_list": ["物品1", "物品2"],
  "travel_tips": ["建议1", "建议2"],
  "emergency_contacts": {
    "police": "报警电话",
    "hospital": "医院电话",
    "tourist_hotline": "旅游热线"
  }
}
\`\`\`

**注意事项：**
1. day 字段从 1 开始，表示第几天
2. type 必须是以下值之一：attraction, restaurant, hotel, transport, activity, shopping
3. location 对象中，lat 和 lng 为数字类型，如无坐标信息则设为 null
4. cost 和 duration 必须是数字类型
5. 每个景点/餐厅都必须包含 tips 字段
6. 确保所有费用总和不超过预算
7. 根据行程节奏合理安排每天的活动数量`
}

// 其他 Prompt 模板（标记为需要更新）
export const OPTIMIZE_ITINERARY_PROMPT = '⚠️ 此模板需要更新以适配新的数据结构'
export const GET_RECOMMENDATIONS_PROMPT = '⚠️ 此模板需要更新以适配新的数据结构'
export const ANALYZE_BUDGET_PROMPT = '⚠️ 此模板需要更新以适配新的数据结构'
```

### 5.2 更新 Edge Function

**文件**：`supabase/functions/generate-itinerary/index.ts`

**修改要点**：

1. 导入 Prompt 模板
2. 更新接口定义
3. 更新解析逻辑

**关键代码**：

```typescript
import { buildItineraryPrompt } from '../_shared/prompt_templates.ts'

// 更新接口定义
interface AIResponseItem {
  time: string
  type: string
  name: string
  location: {
    address: string
    lat: number | null
    lng: number | null
    poi_id?: string
    city?: string
    district?: string
  }
  description: string
  cost: number
  duration: number
  tips: string
  image_url?: string
}

interface AIDailyItinerary {
  day: number
  theme: string
  items: AIResponseItem[]
}

// 使用新的 Prompt 构建
const prompt = buildItineraryPrompt({
  destination,
  startDate,
  endDate,
  daysCount,
  budget,
  participants,
  preferences: preferences || [],
  specialRequirements,
  travelersType,
  accommodation,
  pace
})

// 更新解析函数
function parseAIResponse(aiResponse: AIGeneratedItinerary, itineraryId: string): DbActivity[] {
  const activities: DbActivity[] = []

  aiResponse.daily_itinerary.forEach((day) => {
    day.items.forEach((item, index) => {
      activities.push({
        itinerary_id: itineraryId,
        day: day.day,
        time: item.time,
        type: validateType(item.type),
        name: item.name,
        location: {
          address: item.location?.address || '',
          lat: item.location?.lat ?? null,
          lng: item.location?.lng ?? null,
          poi_id: item.location?.poi_id,
          city: item.location?.city,
          district: item.location?.district
        },
        description: item.description || null,
        cost: item.cost || 0,
        duration: item.duration || 0,
        tips: item.tips || null,
        image_url: item.image_url || null,
        order_idx: index + 1
      })
    })
  })

  return activities
}
```

### 5.3 标记其他 Edge Functions 需要更新

在以下文件顶部添加注释：

- `supabase/functions/optimize-itinerary/index.ts`
- `supabase/functions/get-recommendations/index.ts`
- `supabase/functions/analyze-budget/index.ts`

```typescript
/**
 * ⚠️ 警告：此 Edge Function 的数据结构已过时
 * 
 * 数据库已进行重大重构：
 * - users 表已替换为 user_profiles
 * - itinerary_items.date 已改为 day
 * - itinerary_items 的 address/latitude/longitude 已合并为 location JSONB
 * - order_index 已改名为 order_idx
 * - expenses.date 已改名为 expense_date
 * 
 * 此函数需要更新以适配新的数据结构。
 * 参考：docs/DATABASE_DESIGN.md
 */
```

### 5.4 更新 `docs/PROMPT_TEMPLATES.md`

同步更新文档中的 Prompt 模板说明。

***

## 阶段 6：测试用例更新

### 6.1 更新测试文件清单

| 文件                                                 | 修改内容      |
| -------------------------------------------------- | --------- |
| `src/services/itinerary.test.ts`                   | 更新测试数据和断言 |
| `src/services/expense.test.ts`                     | 更新字段名和类型  |
| `src/types/itinerary.test.ts`                      | 更新类型测试    |
| `src/components/itinerary/ListView.test.tsx`       | 更新组件测试    |
| `src/components/itinerary/TimelineView.test.tsx`   | 更新组件测试    |
| `src/pages/ItineraryDetail.test.tsx`               | 更新页面测试    |
| `src/integration/itineraries.integration.test.tsx` | 更新集成测试    |

### 6.2 测试数据更新示例

```typescript
// 修改前
const mockItem = {
  date: '2026-04-01',
  address: '东京塔',
  latitude: 35.6586,
  longitude: 139.7454,
  order_index: 1
}

// 修改后
const mockItem = {
  day: 1,
  location: {
    address: '东京塔',
    lat: 35.6586,
    lng: 139.7454
  },
  tips: '建议傍晚前往，可欣赏夜景',
  image_url: null,
  order_idx: 1
}
```

***

## 阶段 7：回滚脚本生成

### 7.1 回滚脚本清单

| 迁移脚本                            | 回滚脚本                                     |
| ------------------------------- | ---------------------------------------- |
| `002_drop_users_table.sql`      | `002_drop_users_table_rollback.sql`      |
| `003_create_user_profiles.sql`  | `003_create_user_profiles_rollback.sql`  |
| `004_alter_itineraries.sql`     | `004_alter_itineraries_rollback.sql`     |
| `005_alter_itinerary_items.sql` | `005_alter_itinerary_items_rollback.sql` |
| `006_alter_expenses.sql`        | `006_alter_expenses_rollback.sql`        |

### 7.2 回滚脚本示例

#### 文件：`supabase/migrations/005_alter_itinerary_items_rollback.sql`

```sql
-- ============================================
-- 005_alter_itinerary_items_rollback.sql
-- 回滚 itinerary_items 表修改
-- ⚠️ 警告：此脚本会导致 tips 和 image_url 数据丢失
-- ============================================

-- 恢复旧字段
ALTER TABLE itinerary_items ADD COLUMN date DATE;
ALTER TABLE itinerary_items ADD COLUMN address VARCHAR(500);
ALTER TABLE itinerary_items ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE itinerary_items ADD COLUMN longitude DECIMAL(11, 8);

-- 从 location JSONB 恢复数据
UPDATE itinerary_items
SET 
  address = location->>'address',
  latitude = (location->>'lat')::DECIMAL(10, 8),
  longitude = (location->>'lng')::DECIMAL(11, 8)
WHERE location IS NOT NULL;

-- 从 day 计算 date（需要关联 itineraries 表）
UPDATE itinerary_items ii
SET date = i.start_date + (ii.day - 1)
FROM itineraries i
WHERE ii.itinerary_id = i.id;

-- 删除新字段
ALTER TABLE itinerary_items DROP COLUMN day;
ALTER TABLE itinerary_items DROP COLUMN location;
ALTER TABLE itinerary_items DROP COLUMN tips;
ALTER TABLE itinerary_items DROP COLUMN image_url;

-- 恢复字段名
ALTER TABLE itinerary_items RENAME COLUMN order_idx TO order_index;

-- 删除约束
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS check_day_positive;

-- 恢复旧约束
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS itinerary_items_type_check;
ALTER TABLE itinerary_items ADD CONSTRAINT itinerary_items_type_check 
  CHECK (type IN ('transport', 'accommodation', 'attraction', 'restaurant', 'activity'));

-- 删除新索引
DROP INDEX IF EXISTS idx_itinerary_items_day;
DROP INDEX IF EXISTS idx_itinerary_items_location;
DROP INDEX IF EXISTS idx_itinerary_items_trip_day_order;

-- 恢复旧索引
CREATE INDEX idx_itinerary_items_date ON itinerary_items(date);

DO $$
BEGIN
  RAISE NOTICE 'itinerary_items 表已回滚（注意：tips 和 image_url 数据已丢失）';
END $$;
```

***

## 📋 执行检查清单

### 阶段 0 检查点

- [ ] `docs/DATABASE_DESIGN.md` 已更新
- [ ] `docs/PRD.md` 已更新
- [ ] `docs/TECHNICAL_ARCHITECTURE.md` 已更新
- [ ] `docs/PROMPT_TEMPLATES.md` 已更新

### 阶段 1 检查点

- [ ] 所有迁移脚本已创建
- [ ] 迁移脚本在开发环境测试通过
- [ ] 验证脚本执行无错误

### 阶段 2 检查点

- [ ] `src/services/supabase.ts` 已更新
- [ ] `src/services/types.ts` 已更新
- [ ] `src/services/itinerary.ts` 已更新
- [ ] `src/services/expense.ts` 已更新
- [ ] `src/services/userProfile.ts` 已创建

### 阶段 3 检查点

- [ ] `src/types/itinerary.ts` 已更新
- [ ] TypeScript 编译无错误

### 阶段 4 检查点

- [ ] 所有组件已更新
- [ ] 页面正常渲染
- [ ] 无运行时错误

### 阶段 5 检查点

- [ ] Prompt 模板文件已创建
- [ ] Edge Function 已更新
- [ ] 其他 Edge Functions 已标记警告

### 阶段 6 检查点

- [ ] 所有测试用例已更新
- [ ] 测试全部通过

### 阶段 7 检查点

- [ ] 所有回滚脚本已创建
- [ ] 回滚脚本已测试

***

## ⚠️ 重要提示

1. **执行顺序**：必须严格按照阶段顺序执行，不可跳过
2. **备份**：执行数据库迁移前，务必备份现有数据
3. **测试环境**：先在开发环境完整测试，再部署到生产环境
4. **渐进式迁移**：前端代码保留旧字段兼容，后续清理
5. **地图功能**：本次仅准备 `location` 字段结构，地图组件后续开发

***

**Prompt 结束**

***

以上是完整的执行 Prompt。您可以将此内容复制给 AI 助手执行任务。是否需要我对某个部分进行补充或调整？

toolName: todo\_write

status: success

Todos updated: 1 items

完整的 Prompt 已生成完毕！这份 Prompt 包含了：

| 部分       | 内容                  |
| -------- | ------------------- |
| **任务概览** | 项目背景、重构目标、执行策略      |
| **阶段 0** | 文档更新（4 个文档）         |
| **阶段 1** | 数据库迁移脚本（7 个 SQL 文件） |
| **阶段 2** | 后端服务层更新（5 个文件）      |
| **阶段 3** | 前端类型定义更新            |
| **阶段 4** | 前端组件更新（5 个组件）       |
| **阶段 5** | AI Prompt 模板提取与更新   |
| **阶段 6** | 测试用例更新              |
| **阶段 7** | 回滚脚本生成              |
| **检查清单** | 每个阶段的验证点            |

