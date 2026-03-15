# Supabase 服务封装 SQL 测试脚本

本文档提供完整的 SQL 测试脚本，用于在 Supabase Dashboard 中验证服务封装的正确性。

## ⚠️ 重要说明：关于 SQL Editor 会话

**Supabase Dashboard 的 SQL Editor 和前端应用是两个独立的会话环境**：

| 环境       | 会话来源               | `auth.uid()` 结果 |
| ---------- | ---------------------- | ----------------- |
| 前端应用   | 用户登录后的 JWT token | 返回用户 UUID     |
| SQL Editor | Dashboard 管理员会话   | **返回 NULL**     |

因此，在 SQL Editor 中测试时，需要使用 **固定的用户 ID** 而不是 `auth.uid()`。

## 使用方法

### 方法一：获取用户 ID（推荐）

1. 在前端登录后，打开浏览器开发者工具（F12）
2. 在 Console 中执行：
   ```javascript
   // 获取当前用户 ID
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User ID:', user?.id)
   ```
3. 复制输出的用户 ID，在下面的测试脚本中替换 `'YOUR_USER_ID_HERE'`

### 方法二：从 Dashboard 获取用户 ID

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → **Authentication** → **Users**
3. 找到您的用户，复制 **User UID**
4. 在测试脚本中替换 `'YOUR_USER_ID_HERE'`

---

## 第一部分：准备工作

### 1.0 设置测试用户 ID

```sql
-- ============================================
-- 测试 1.0：设置测试用户 ID
-- ============================================
-- 【重要】请将下面的 UUID 替换为您的实际用户 ID
-- 可以从 Authentication -> Users 页面获取

-- 设置会话变量（可选，用于后续测试）
SET LOCAL jwt.claims.sub = 'YOUR_USER_ID_HERE';

-- 验证用户 ID 格式
SELECT 
    'YOUR_USER_ID_HERE' as test_user_id,
    LENGTH('YOUR_USER_ID_HERE') as id_length,
    CASE 
        WHEN 'YOUR_USER_ID_HERE' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN '✅ UUID 格式正确'
        ELSE '❌ 请替换为实际的 UUID'
    END as validation;
```

**验证点**：
- ✅ id_length 应该为 36
- ✅ validation 显示 "UUID 格式正确"

---

### 1.1 查看用户信息

```sql
-- ============================================
-- 测试 1.1：查看用户信息
-- ============================================
-- 注意：在 SQL Editor 中 auth.uid() 返回 NULL
-- 使用固定的用户 ID 进行测试

-- 请替换 YOUR_USER_ID_HERE 为实际的用户 ID
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE';
```

**验证点**：
- ✅ 返回用户信息
- ✅ email 与前端登录的用户一致

---

### 1.2 检查用户同步状态

```sql
-- ============================================
-- 测试 1.2：检查 auth.users 与 public.users 同步状态
-- ============================================
-- 【重要】itineraries 表的外键引用的是 public.users 表
-- 而 Supabase Auth 的用户存储在 auth.users 表中
-- 
-- 如果已配置触发器（推荐），用户注册时会自动同步
-- 如果未配置触发器，需要手动同步或执行迁移脚本

-- 检查触发器是否存在
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
    AND trigger_name LIKE 'on_auth_user%';

-- 检查 public.users 表中是否已存在该用户
SELECT 
    'auth.users' as source,
    COUNT(*) as count
FROM auth.users WHERE id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 
    'public.users' as source,
    COUNT(*) as count
FROM public.users WHERE id = 'YOUR_USER_ID_HERE';
```

**验证点**：
- ✅ 触发器 `on_auth_user_created` 存在
- ✅ auth.users 和 public.users 的 count 都为 1

**如果触发器不存在或 count 不一致**：

执行迁移脚本 `docs/migrations/add_auth_users_trigger.sql`，或手动同步：

```sql
-- 手动同步用户数据（仅当触发器不存在时需要）
INSERT INTO public.users (id, email, password, name, created_at, updated_at)
SELECT 
    id,
    email,
    encrypted_password,
    raw_user_meta_data->>'name',
    created_at,
    updated_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
```

---

### 1.3 查看现有数据概览

```sql
-- ============================================
-- 测试 1.2：查看指定用户的所有数据概览
-- ============================================
-- 请替换 YOUR_USER_ID_HERE 为实际的用户 ID

SELECT 
    'itineraries' as table_name,
    COUNT(*) as count
FROM itineraries 
WHERE user_id = 'YOUR_USER_ID_HERE'

UNION ALL

SELECT 
    'itinerary_items' as table_name,
    COUNT(*) as count
FROM itinerary_items 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE user_id = 'YOUR_USER_ID_HERE')

UNION ALL

SELECT 
    'expenses' as table_name,
    COUNT(*) as count
FROM expenses 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE user_id = 'YOUR_USER_ID_HERE')

UNION ALL

SELECT 
    'user_settings' as table_name,
    COUNT(*) as count
FROM user_settings 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

**验证点**：
- ✅ 返回各表的记录数
- ✅ 数据与前端显示一致

---

## 第二部分：行程服务测试

### 2.1 测试创建行程

```sql
-- ============================================
-- 测试 2.1：创建测试行程
-- ============================================
-- 操作：插入一条测试行程记录
-- 预期结果：成功插入，自动生成 UUID 和时间戳

INSERT INTO itineraries (
    user_id,
    title,
    destination,
    start_date,
    end_date,
    budget,
    participants,
    preferences,
    special_requirements,
    is_favorite
) VALUES (
    'YOUR_USER_ID_HERE',
    '【SQL测试】东京5日游',
    '东京',
    '2024-05-01',
    '2024-05-05',
    15000.00,
    2,
    ARRAY['美食', '购物', '文化'],
    '希望体验当地文化',
    false
)
RETURNING 
    id,
    title,
    destination,
    start_date,
    end_date,
    budget,
    created_at,
    updated_at;
```

**验证点**：
- ✅ 成功返回新创建的行程 ID
- ✅ `created_at` 和 `updated_at` 自动设置
- ✅ `id` 自动生成为 UUID

**保存返回的 `id`，后续测试需要使用！**

---

### 2.2 测试查询行程

```sql
-- ============================================
-- 测试 2.2：查询当前用户的所有行程
-- ============================================
-- 预期结果：返回当前用户的所有行程，包括刚创建的测试行程

SELECT 
    id,
    title,
    destination,
    start_date,
    end_date,
    budget,
    participants,
    is_favorite,
    created_at,
    updated_at
FROM itineraries
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

**验证点**：
- ✅ 能看到刚创建的测试行程
- ✅ 只显示当前用户的行程

---

### 2.3 测试更新行程

```sql
-- ============================================
-- 测试 2.3：更新行程（修改标题和收藏状态）
-- ============================================
-- 操作：将测试行程标记为收藏，并修改标题
-- 预期结果：成功更新，updated_at 自动更新

UPDATE itineraries
SET 
    title = '【SQL测试】东京5日游 - 已更新',
    is_favorite = true,
    updated_at = NOW()
WHERE 
    user_id = 'YOUR_USER_ID_HERE'
    AND title LIKE '【SQL测试】%'
RETURNING 
    id,
    title,
    is_favorite,
    updated_at;
```

**验证点**：
- ✅ 标题成功更新
- ✅ `is_favorite` 变为 `true`
- ✅ `updated_at` 更新为当前时间

---

### 2.4 测试行程统计

```sql
-- ============================================
-- 测试 2.4：获取行程统计信息
-- ============================================
-- 预期结果：返回行程的天数、预算等信息

SELECT 
    i.id,
    i.title,
    i.destination,
    i.budget,
    i.start_date,
    i.end_date,
    (i.end_date - i.start_date + 1) as total_days,
    i.participants,
    i.is_favorite,
    COUNT(DISTINCT ii.id) as items_count,
    COALESCE(SUM(e.amount), 0) as total_expenses
FROM itineraries i
LEFT JOIN itinerary_items ii ON ii.itinerary_id = i.id
LEFT JOIN expenses e ON e.itinerary_id = i.id
WHERE i.user_id = 'YOUR_USER_ID_HERE'
GROUP BY i.id
ORDER BY i.created_at DESC;
```

**验证点**：
- ✅ 正确计算行程天数
- ✅ 正确统计行程项数量
- ✅ 正确计算总费用

---

## 第三部分：费用服务测试

### 3.1 创建测试费用记录

```sql
-- ============================================
-- 测试 3.1：创建多条测试费用记录
-- ============================================
-- 操作：为测试行程创建多条费用记录
-- 预期结果：成功插入所有费用记录

-- 先获取测试行程的 ID
WITH test_itinerary AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title LIKE '【SQL测试】%'
    LIMIT 1
)
INSERT INTO expenses (itinerary_id, category, amount, date, description)
SELECT 
    id,
    category,
    amount,
    date,
    description
FROM test_itinerary
CROSS JOIN (
    VALUES 
        ('transport'::varchar, 2000.00, '2024-05-01'::date, '机票'::text),
        ('accommodation'::varchar, 3000.00, '2024-05-01'::date, '酒店 5晚'::text),
        ('food'::varchar, 500.00, '2024-05-01'::date, '午餐'::text),
        ('food'::varchar, 800.00, '2024-05-02'::date, '晚餐'::text),
        ('ticket'::varchar, 1200.00, '2024-05-02'::date, '东京塔门票'::text),
        ('shopping'::varchar, 2000.00, '2024-05-03'::date, '购物'::text),
        ('transport'::varchar, 500.00, '2024-05-04'::date, '地铁卡'::text),
        ('other'::varchar, 300.00, '2024-05-05'::date, '纪念品'::text)
) AS t(category, amount, date, description)
RETURNING id, category, amount, date, description;
```

**验证点**：
- ✅ 成功插入 8 条费用记录
- ✅ 自动生成 UUID 和 created_at

---

### 3.2 测试费用统计

```sql
-- ============================================
-- 测试 3.2：按类别统计费用
-- ============================================
-- 预期结果：返回各类别的费用汇总

WITH test_itinerary AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title LIKE '【SQL测试】%'
    LIMIT 1
)
SELECT 
    e.category,
    COUNT(*) as count,
    SUM(e.amount) as total_amount,
    ROUND(SUM(e.amount) * 100.0 / SUM(SUM(e.amount)) OVER(), 2) as percentage
FROM expenses e
WHERE e.itinerary_id = (SELECT id FROM test_itinerary)
GROUP BY e.category
ORDER BY total_amount DESC;
```

**验证点**：
- ✅ 正确统计各类别费用
- ✅ 正确计算百分比

---

### 3.3 测试按日期统计费用

```sql
-- ============================================
-- 测试 3.3：按日期统计费用
-- ============================================
-- 预期结果：返回每日的费用汇总

WITH test_itinerary AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title LIKE '【SQL测试】%'
    LIMIT 1
)
SELECT 
    e.date,
    COUNT(*) as count,
    SUM(e.amount) as daily_amount
FROM expenses e
WHERE e.itinerary_id = (SELECT id FROM test_itinerary)
GROUP BY e.date
ORDER BY e.date;
```

**验证点**：
- ✅ 正确统计每日费用
- ✅ 按日期排序

---

### 3.4 测试费用总览

```sql
-- ============================================
-- 测试 3.4：费用总览统计
-- ============================================
-- 预期结果：返回总费用、平均每日费用等

WITH test_itinerary AS (
    SELECT id, start_date, end_date FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title LIKE '【SQL测试】%'
    LIMIT 1
)
SELECT 
    (SELECT id FROM test_itinerary) as itinerary_id,
    COUNT(*) as total_records,
    SUM(e.amount) as total_amount,
    ROUND(AVG(e.amount), 2) as average_amount,
    MIN(e.amount) as min_amount,
    MAX(e.amount) as max_amount,
    (SELECT (end_date - start_date + 1) FROM test_itinerary) as total_days,
    ROUND(SUM(e.amount) / (SELECT (end_date - start_date + 1) FROM test_itinerary), 2) as daily_average
FROM expenses e
WHERE e.itinerary_id = (SELECT id FROM test_itinerary);
```

**验证点**：
- ✅ 总费用 = 10300 元
- ✅ 平均每日费用正确计算

---

## 第四部分：设置服务测试

### 4.1 创建用户设置

```sql
-- ============================================
-- 测试 4.1：创建用户设置记录
-- ============================================
-- 操作：为当前用户创建设置记录
-- 预期结果：成功创建，API Key 字段为 NULL

INSERT INTO user_settings (
    user_id,
    theme,
    language,
    notifications
) VALUES (
    'YOUR_USER_ID_HERE',
    'light',
    'zh',
    true
)
ON CONFLICT (user_id) DO UPDATE SET
    theme = EXCLUDED.theme,
    language = EXCLUDED.language,
    notifications = EXCLUDED.notifications,
    updated_at = NOW()
RETURNING 
    id,
    user_id,
    theme,
    language,
    notifications,
    zhipu_api_key,
    xunfei_api_key,
    amap_api_key,
    created_at,
    updated_at;
```

**验证点**：
- ✅ 成功创建或更新用户设置
- ✅ API Key 字段为 NULL（尚未设置）

---

### 4.2 测试 API Key 存储（模拟加密）

```sql
-- ============================================
-- 测试 4.2：存储加密的 API Key
-- ============================================
-- 注意：实际加密应由前端完成，这里模拟存储加密后的字符串
-- 预期结果：API Key 字段存储的是加密字符串，不是明文

UPDATE user_settings
SET 
    zhipu_api_key = 'U2FsdGVkX1+模拟加密字符串示例==',
    xunfei_api_key = 'U2FsdGVkX1+另一个加密字符串==',
    amap_api_key = 'U2FsdGVkX1+高德地图加密字符串==',
    updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE'
RETURNING 
    user_id,
    zhipu_api_key,
    xunfei_api_key,
    amap_api_key,
    updated_at;
```

**验证点**：
- ✅ API Key 存储的是加密字符串
- ✅ 不是明文 API Key
- ✅ `updated_at` 自动更新

---

### 4.3 验证 API Key 不是明文

```sql
-- ============================================
-- 测试 4.3：验证 API Key 加密存储
-- ============================================
-- 预期结果：API Key 字段不以明文形式存储

SELECT 
    user_id,
    theme,
    language,
    CASE 
        WHEN zhipu_api_key IS NULL THEN '未设置'
        WHEN zhipu_api_key LIKE 'U2FsdGVkX%' THEN '已加密存储 ✓'
        ELSE '⚠️ 可能是明文存储'
    END as zhipu_status,
    CASE 
        WHEN xunfei_api_key IS NULL THEN '未设置'
        WHEN xunfei_api_key LIKE 'U2FsdGVkX%' THEN '已加密存储 ✓'
        ELSE '⚠️ 可能是明文存储'
    END as xunfei_status,
    CASE 
        WHEN amap_api_key IS NULL THEN '未设置'
        WHEN amap_api_key LIKE 'U2FsdGVkX%' THEN '已加密存储 ✓'
        ELSE '⚠️ 可能是明文存储'
    END as amap_status
FROM user_settings
WHERE user_id = 'YOUR_USER_ID_HERE';
```

**验证点**：
- ✅ 所有 API Key 显示"已加密存储 ✓"
- ❌ 如果显示"可能是明文存储"，需要检查加密逻辑

---

## 第五部分：RLS 策略测试

### 5.1 测试 RLS - 只能查看自己的数据

```sql
-- ============================================
-- 测试 5.1：验证只能查看自己的行程
-- ============================================
-- 预期结果：只返回当前用户的行程

-- 查看所有行程（应该只看到自己的）
SELECT 
    'itineraries' as source,
    COUNT(*) as visible_count
FROM itineraries;

-- 对比：实际应该等于自己拥有的行程数
SELECT 
    'expected' as source,
    COUNT(*) as expected_count
FROM itineraries
WHERE user_id = 'YOUR_USER_ID_HERE';
```

**验证点**：
- ✅ `visible_count` = `expected_count`
- ❌ 如果 `visible_count` > `expected_count`，说明 RLS 未正确配置

---

### 5.2 测试 RLS - 无法插入其他用户的数据

```sql
-- ============================================
-- 测试 5.2：尝试插入其他用户的行程
-- ============================================
-- 预期结果：插入失败，RLS 策略阻止操作

INSERT INTO itineraries (
    user_id,
    title,
    destination,
    start_date,
    end_date,
    budget,
    participants,
    is_favorite
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- 假的其他用户 ID
    '尝试插入其他用户的行程',
    '测试',
    '2024-01-01',
    '2024-01-02',
    1000,
    1,
    false
);
```

**验证点**：
- ❌ 应该报错：`new row violates row-level security policy`
- ✅ 如果成功插入，说明 RLS 配置有问题

---

### 5.3 测试 RLS - 无法更新其他用户的数据

```sql
-- ============================================
-- 测试 5.3：尝试更新其他用户的行程
-- ============================================
-- 预期结果：更新失败或影响 0 行

UPDATE itineraries
SET title = '尝试修改其他用户的行程'
WHERE user_id != 'YOUR_USER_ID_HERE';

-- 检查影响的行数
-- 应该返回 0 行
```

**验证点**：
- ✅ 影响 0 行
- ❌ 如果有行被更新，说明 RLS 配置有问题

---

## 第六部分：级联删除测试

### 6.1 准备级联删除测试数据

```sql
-- ============================================
-- 测试 6.1：准备级联删除测试数据
-- ============================================
-- 操作：创建一个专门用于测试删除的行程

INSERT INTO itineraries (
    user_id,
    title,
    destination,
    start_date,
    end_date,
    budget,
    participants,
    is_favorite
) VALUES (
    'YOUR_USER_ID_HERE',
    '【级联删除测试】待删除的行程',
    '测试城市',
    '2024-06-01',
    '2024-06-02',
    5000,
    1,
    false
)
RETURNING id;

-- 记录返回的 ID，假设为: cascade_test_itinerary_id
```

### 6.2 为级联删除测试创建关联数据

```sql
-- ============================================
-- 测试 6.2：创建关联的行程项和费用
-- ============================================

WITH test_itinerary AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title = '【级联删除测试】待删除的行程'
    LIMIT 1
)
-- 创建行程项
INSERT INTO itinerary_items (
    itinerary_id, date, time, type, name, address, cost, order_index
)
SELECT 
    id, '2024-06-01', '09:00', 'attraction', '测试景点', '测试地址', 100, 1
FROM test_itinerary;

-- 创建费用
WITH test_itinerary AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title = '【级联删除测试】待删除的行程'
    LIMIT 1
)
INSERT INTO expenses (itinerary_id, category, amount, date, description)
SELECT id, 'food', 200, '2024-06-01', '测试费用'
FROM test_itinerary;

-- 验证关联数据已创建
SELECT 
    'itineraries' as table_name, COUNT(*) as count
FROM itineraries WHERE title = '【级联删除测试】待删除的行程'
UNION ALL
SELECT 
    'itinerary_items' as table_name, COUNT(*) as count
FROM itinerary_items 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE title = '【级联删除测试】待删除的行程')
UNION ALL
SELECT 
    'expenses' as table_name, COUNT(*) as count
FROM expenses 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE title = '【级联删除测试】待删除的行程');
```

**验证点**：
- ✅ itineraries: 1 条
- ✅ itinerary_items: 1 条
- ✅ expenses: 1 条

---

### 6.3 执行级联删除

```sql
-- ============================================
-- 测试 6.3：删除行程，验证级联删除
-- ============================================
-- 操作：删除测试行程
-- 预期结果：关联的行程项和费用也被删除

-- 删除前记录 ID
WITH deleted_ids AS (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND title = '【级联删除测试】待删除的行程'
)
SELECT id as deleted_itinerary_id FROM deleted_ids;

-- 执行删除
DELETE FROM itineraries
WHERE user_id = 'YOUR_USER_ID_HERE'
AND title = '【级联删除测试】待删除的行程';

-- 验证删除结果
SELECT 
    'itineraries' as table_name, COUNT(*) as count
FROM itineraries WHERE title = '【级联删除测试】待删除的行程'
UNION ALL
SELECT 
    'itinerary_items' as table_name, COUNT(*) as count
FROM itinerary_items 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE title = '【级联删除测试】待删除的行程')
UNION ALL
SELECT 
    'expenses' as table_name, COUNT(*) as count
FROM expenses 
WHERE itinerary_id IN (SELECT id FROM itineraries WHERE title = '【级联删除测试】待删除的行程');
```

**验证点**：
- ✅ 所有表的 count 都为 0
- ✅ 级联删除成功

---

## 第七部分：清理测试数据

### 7.1 清理所有测试数据

```sql
-- ============================================
-- 测试 7.1：清理所有测试数据
-- ============================================
-- 操作：删除所有以【SQL测试】或【级联删除测试】开头的测试数据

-- 先删除费用（如果有）
DELETE FROM expenses
WHERE itinerary_id IN (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND (title LIKE '【SQL测试】%' OR title LIKE '【级联删除测试】%')
);

-- 删除行程项（如果有）
DELETE FROM itinerary_items
WHERE itinerary_id IN (
    SELECT id FROM itineraries 
    WHERE user_id = 'YOUR_USER_ID_HERE' 
    AND (title LIKE '【SQL测试】%' OR title LIKE '【级联删除测试】%')
);

-- 删除行程
DELETE FROM itineraries
WHERE user_id = 'YOUR_USER_ID_HERE'
AND (title LIKE '【SQL测试】%' OR title LIKE '【级联删除测试】%');

-- 重置用户设置中的测试 API Key
UPDATE user_settings
SET 
    zhipu_api_key = NULL,
    xunfei_api_key = NULL,
    amap_api_key = NULL,
    updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE';

-- 验证清理结果
SELECT 
    'itineraries' as table_name, COUNT(*) as remaining_test_data
FROM itineraries 
WHERE user_id = 'YOUR_USER_ID_HERE' 
AND (title LIKE '【SQL测试】%' OR title LIKE '【级联删除测试】%')
UNION ALL
SELECT 
    'user_settings' as table_name, COUNT(*) as remaining_test_data
FROM user_settings 
WHERE user_id = 'YOUR_USER_ID_HERE' 
AND (zhipu_api_key IS NOT NULL OR xunfei_api_key IS NOT NULL OR amap_api_key IS NOT NULL);
```

**验证点**：
- ✅ 所有测试数据已清理
- ✅ remaining_test_data 都为 0

---

## 测试检查清单

### 行程服务测试

| 测试项   | SQL 测试编号 | 状态 |
| -------- | ------------ | ---- |
| 创建行程 | 2.1          | ⬜    |
| 查询行程 | 2.2          | ⬜    |
| 更新行程 | 2.3          | ⬜    |
| 行程统计 | 2.4          | ⬜    |

### 费用服务测试

| 测试项     | SQL 测试编号 | 状态 |
| ---------- | ------------ | ---- |
| 创建费用   | 3.1          | ⬜    |
| 按类别统计 | 3.2          | ⬜    |
| 按日期统计 | 3.3          | ⬜    |
| 费用总览   | 3.4          | ⬜    |

### 设置服务测试

| 测试项           | SQL 测试编号 | 状态 |
| ---------------- | ------------ | ---- |
| 创建设置         | 4.1          | ⬜    |
| API Key 存储     | 4.2          | ⬜    |
| API Key 加密验证 | 4.3          | ⬜    |

### RLS 策略测试

| 测试项               | SQL 测试编号 | 状态 |
| -------------------- | ------------ | ---- |
| 只能查看自己的数据   | 5.1          | ⬜    |
| 无法插入其他用户数据 | 5.2          | ⬜    |
| 无法更新其他用户数据 | 5.3          | ⬜    |

### 级联删除测试

| 测试项       | SQL 测试编号 | 状态 |
| ------------ | ------------ | ---- |
| 准备测试数据 | 6.1, 6.2     | ⬜    |
| 执行级联删除 | 6.3          | ⬜    |

### 清理测试

| 测试项       | SQL 测试编号 | 状态 |
| ------------ | ------------ | ---- |
| 清理测试数据 | 7.1          | ⬜    |

---

## 预期结果汇总

### 测试 2.1 - 创建行程
```
id: [自动生成的 UUID]
title: 【SQL测试】东京5日游
destination: 东京
start_date: 2024-05-01
end_date: 2024-05-05
budget: 15000.00
created_at: [当前时间]
updated_at: [当前时间]
```

### 测试 3.2 - 费用统计
```
| category      | count | total_amount | percentage |
| ------------- | ----- | ------------ | ---------- |
| accommodation | 1     | 3000.00      | 29.13      |
| transport     | 2     | 2500.00      | 24.27      |
| shopping      | 1     | 2000.00      | 19.42      |
| food          | 2     | 1300.00      | 12.62      |
| ticket        | 1     | 1200.00      | 11.65      |
| other         | 1     | 300.00       | 2.91       |
```

### 测试 3.4 - 费用总览
```
total_records: 8
total_amount: 10300.00
average_amount: 1287.50
min_amount: 300.00
max_amount: 3000.00
total_days: 5
daily_average: 2060.00
```

---

**文档版本**: v1.0
**创建日期**: 2026-03-16
**适用阶段**: Task1.4 Supabase 服务封装
