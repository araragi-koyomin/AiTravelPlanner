# AI 旅行规划师 PRD（产品需求文档）

## 1. 产品概述

### 1.1 产品定位
AI 旅行规划师是一款基于人工智能的智能旅行规划工具，通过语音或文字输入，自动生成个性化旅行路线，并提供费用预算管理和云端数据同步功能。

### 1.2 目标用户
- 有旅行需求但缺乏规划经验的用户
- 希望快速生成个性化旅行方案的用户
- 需要多设备同步旅行计划的用户
- 注重旅行预算管理的用户

### 1.3 核心价值
- **智能化**：AI 自动生成个性化旅行路线
- **便捷性**：语音输入，解放双手
- **可视化**：地图为主的交互界面
- **数据安全**：云端同步，多设备访问

---

## 2. 功能需求

### 2.1 用户认证与授权

#### 2.1.1 用户注册
- 支持邮箱注册
- 支持密码强度验证
- 支持邮箱验证

#### 2.1.2 用户登录
- 支持邮箱+密码登录
- 支持第三方登录（可选：Google、GitHub）
- 支持记住登录状态

#### 2.1.3 密码管理
- 支持找回密码（邮箱验证）
- 支持修改密码

### 2.2 智能行程规划

#### 2.2.1 需求输入（核心功能）
**语音输入**
- 点击麦克风按钮开始录音
- 支持实时语音识别
- 支持语音转文字编辑
- 支持重新录音

**文字输入**
- 文本框输入旅行需求
- 支持模板选择（可选）
- 支持历史记录快速填充

**需求字段**
- 目的地（必填）
- 出发日期（必填）
- 返回日期（必填）
- 预算（必填）
- 同行人数（必填）
- 人员构成（选填）：成人出行、亲子游、情侣出游、朋友结伴、独自旅行、商务出行
- 住宿偏好（选填）：经济型、舒适型、豪华型
- 行程节奏（选填）：轻松休闲、适中节奏、紧凑充实
- 旅行偏好（选填）：美食、景点、购物、文化、自然、动漫等
- 特殊需求（选填）：带小孩、老人、无障碍设施等

#### 2.2.2 行程生成
**AI 规划**
- 调用智谱AI API 生成行程
- 生成时间：< 10秒
- 支持重新生成

**行程内容**
- 每日行程安排（时间、地点、活动）
- 交通方式建议
- 住宿推荐（酒店名称、地址、价格）
- 景点介绍（开放时间、门票价格、特色）
- 餐厅推荐（菜系、人均消费、特色菜）

#### 2.2.3 行程展示
**地图视图**
- 高德地图展示行程路线
- 标记景点、餐厅、住宿位置
- 支持路线规划展示
- 支持点击查看详情

**列表视图**
- 按日期展示行程
- 支持展开/折叠每日详情
- 显示时间、地点、活动信息

**时间轴视图**
- 时间轴形式展示每日行程
- 直观展示行程节奏

#### 2.2.4 行程编辑
- 支持手动调整行程
- 支持添加/删除行程项
- 支持修改时间、地点
- 支持拖拽排序

#### 2.2.5 行程导出
- 支持导出为 PDF
- 支持导出为图片
- 支持分享链接

### 2.3 费用预算与管理

#### 2.3.1 预算分析
- AI 自动估算总费用
- 分类预算：交通、住宿、餐饮、门票、购物、其他
- 预算可视化（饼图/柱状图）

#### 2.3.2 费用记录
**手动记录**
- 添加费用记录
- 分类：交通、住宿、餐饮、门票、购物、其他
- 金额、日期、备注

**语音记录**
- 语音输入费用信息
- 自动识别金额和分类

#### 2.3.3 费用统计
- 实时统计已花费金额
- 预算对比（已花费/预算）
- 分类统计图表
- 超支提醒

### 2.4 行程管理

#### 2.4.1 行程列表
- 显示所有保存的行程
- 支持搜索、筛选
- 支持排序（时间、创建时间）

#### 2.4.2 行程操作
- 新建行程
- 复制行程
- 删除行程
- 重命名行程

#### 2.4.3 行程收藏
- 支持收藏行程
- 收藏夹管理

### 2.5 云端同步

#### 2.5.1 数据同步
- 自动同步行程数据
- 支持多设备访问
- 离线缓存支持

#### 2.5.2 偏好设置同步
- 用户偏好设置云端保存
- 跨设备同步

### 2.6 设置

#### 2.6.1 API Key 管理
- 智谱AI API Key 输入
- 科大讯飞 API Key 输入
- 高德地图 API Key 输入
- Key 加密存储（Supabase）

#### 2.6.2 账户设置
- 修改个人信息
- 修改密码
- 退出登录

#### 2.6.3 应用设置
- 主题切换（浅色/深色）
- 语言设置（中文/英文）
- 通知设置

---

## 3. 非功能需求

### 3.1 性能要求
- 页面加载时间 < 3秒
- AI 行程生成时间 < 10秒
- 语音识别响应时间 < 2秒
- 地图渲染时间 < 2秒

### 3.2 可用性要求
- 系统可用性 > 99%
- 支持主流浏览器（Chrome、Firefox、Safari、Edge）
- 响应式设计，支持移动端

### 3.3 安全性要求
- API Key 不暴露在前端代码
- 用户数据加密存储
- HTTPS 传输
- SQL 注入防护
- XSS 攻击防护

### 3.4 可维护性要求
- 代码注释率 > 30%
- 遵循代码规范
- 模块化设计
- 完善的错误处理

---

## 4. 用户界面设计

### 4.1 主要页面

#### 4.1.1 登录/注册页
- 简洁的登录表单
- 邮箱、密码输入
- 登录/注册切换
- 第三方登录入口

#### 4.1.2 首页
- 欢迎信息
- 快速创建行程入口
- 最近行程列表
- 收藏行程

#### 4.1.3 行程规划页
- 需求输入区域（语音/文字）
- 行程生成按钮
- 加载状态提示
- 行程展示区域（地图/列表/时间轴）

#### 4.1.4 行程详情页
- 行程概览
- 地图展示
- 每日行程详情
- 费用统计
- 编辑/导出按钮

#### 4.1.5 费用管理页
- 预算概览
- 费用统计图表
- 费用记录列表
- 添加费用入口

#### 4.1.6 行程列表页
- 所有行程卡片展示
- 搜索/筛选功能
- 新建行程按钮

#### 4.1.7 设置页
- API Key 设置
- 账户设置
- 应用设置

### 4.2 设计原则
- 简洁明了，重点突出
- 地图为核心交互元素
- 美观的图片展示
- 流畅的动画效果
- 清晰的视觉层次

---

## 5. 数据模型

> **最后更新**: 2026-03-19  
> **详细设计请参考**: [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)

### 5.1 用户资料表（user_profiles）
与 Supabase Auth 的 `auth.users` 表关联，存储用户扩展信息。

```typescript
{
  id: string;                    // 关联 auth.users.id
  username?: string;             // 用户昵称
  avatar_url?: string;           // 头像 URL
  preferences?: {                // 用户偏好设置 (JSONB)
    favorite_destinations?: string[];
    travel_style?: string[];
    budget_preference?: string;
    accommodation_type?: string[];
    diet_restrictions?: string[];
  };
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 5.2 行程表（itineraries）
```typescript
{
  id: string;
  user_id: string;               // 关联 auth.users.id
  title: string;
  destination: string;
  start_date: date;
  end_date: date;
  budget: number;
  participants: number;
  travelers_type?: 'adult' | 'family' | 'couple' | 'friends' | 'solo' | 'business';
  accommodation_pref?: 'budget' | 'comfort' | 'luxury';
  pace?: 'relaxed' | 'moderate' | 'intense';
  preferences?: string[];
  special_requirements?: string;
  status: 'draft' | 'generated' | 'in_progress' | 'completed' | 'archived';
  cover_image?: string;          // 封面图片 URL
  is_favorite: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 5.3 行程详情表（itinerary_items）
```typescript
{
  id: string;
  itinerary_id: string;
  day: number;                   // 第几天（从1开始）
  time: string;                  // HH:MM 格式
  type: 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity' | 'shopping';
  name: string;
  location: {                    // 位置信息 (JSONB)
    address: string;
    lat: number;
    lng: number;
    poi_id?: string;
    city?: string;
    district?: string;
  };
  description?: string;
  cost?: number;
  duration?: number;             // 时长（分钟）
  tips?: string;                 // 游玩建议
  image_url?: string;            // 图片 URL
  order_idx: number;             // 排序索引
  created_at: timestamp;
}
```

### 5.4 费用记录表（expenses）
```typescript
{
  id: string;
  itinerary_id: string;
  category: 'transport' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'entertainment' | 'other';
  amount: number;
  expense_date: date;            // 消费日期
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'alipay' | 'wechat' | 'other';
  receipt_url?: string;          // 票据照片 URL
  notes?: string;                // 备注
  description?: string;
  created_at: timestamp;
}
```

### 5.5 用户设置表（user_settings）
```typescript
{
  id: string;
  user_id: string;               // 关联 auth.users.id
  zhipu_api_key?: string;
  xunfei_api_key?: string;
  amap_api_key?: string;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  notifications: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## 6. API 接口设计

### 6.1 Supabase Edge Functions

#### 6.1.1 生成行程
```
POST /functions/v1/generate-itinerary
Request: {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  participants: number;
  preferences: string[];
  special_requirements?: string;
}
Response: {
  success: boolean;
  data: ItineraryItem[];
  error?: string;
}
```

#### 6.1.2 语音识别
```
POST /functions/v1/speech-to-text
Request: FormData (audio file)
Response: {
  success: boolean;
  text: string;
  error?: string;
}
```

### 6.2 Supabase 直接调用

#### 6.2.1 认证
- 注册、登录、登出
- 使用 Supabase Auth

#### 6.2.2 数据库操作
- CRUD 操作（通过 Supabase Client）
- 实时订阅（用于数据同步）

---

## 7. 外部 API 集成

### 7.1 智谱AI（GLM）
- **用途**：生成旅行行程
- **API**：GLM-4 / GLM-3-Turbo
- **调用方式**：通过 Supabase Edge Functions

### 7.2 科大讯飞
- **用途**：语音识别
- **API**：Web Speech API / WebSocket
- **调用方式**：前端直接调用

### 7.3 高德地图
- **用途**：地图展示、路线规划
- **API**：JavaScript API v2.0
- **调用方式**：前端直接调用

---

## 8. 开发优先级

### P0（必须有）
- 用户注册登录
- 智能行程规划（文字输入）
- 行程展示（地图+列表）
- 行程保存与管理
- 费用预算与记录（手动）

### P1（应该有）
- 语音输入
- 语音记录费用
- 行程导出
- 云端同步
- API Key 设置

### P2（可以有）
- 第三方登录
- 行程收藏
- 主题切换
- 多语言支持
- 通知功能

---

## 9. 成功指标

- 用户注册转化率 > 30%
- 行程生成成功率 > 95%
- 平均会话时长 > 5分钟
- 用户留存率（7天）> 40%
- API 调用成功率 > 99%

---

## 10. 风险与限制

### 10.1 技术风险
- AI 生成质量不稳定
- 语音识别准确率受环境影响
- 地图 API 调用限制

### 10.2 业务风险
- 用户隐私数据安全
- API Key 泄露风险
- 第三方服务依赖

### 10.3 限制
- 免费额度限制
- 浏览器兼容性
- 网络依赖性

---

## 11. 后续迭代方向

- V1.1：增加行程分享功能
- V1.2：增加行程模板库
- V1.3：增加社交功能（评论、点赞）
- V2.0：增加 AI 实时旅行助手
- V2.1：增加 AR 导航功能
