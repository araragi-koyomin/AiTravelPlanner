# AI 旅行规划师 - 技术架构设计文档

## 1. 系统架构概览

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户层                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Web Browser │  │  Mobile Web  │  │  Tablet Web  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                      前端应用层 (React SPA)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  UI Components│ │  State Mgmt │  │  API Client  │              │
│  │  (React)     │  │  (Zustand)  │  │  (Axios)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Map Service │  │  Speech SDK  │  │  Utils       │              │
│  │  (高德地图)   │  │  (科大讯飞)  │  │  (Helpers)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                    服务层 (Supabase)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Edge Functions│ │  Database    │  │  Auth        │              │
│  │  (Deno)      │  │  (PostgreSQL)│  │  (JWT)       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Storage     │  │  Realtime    │  │  Row Level    │              │
│  │  (S3 Compatible)│ │  (WebSocket)│  │  Security    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕ HTTPS API
┌─────────────────────────────────────────────────────────────────────┐
│                      外部服务层                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  智谱AI      │  │  科大讯飞    │  │  高德地图    │              │
│  │  (GLM API)   │  │  (语音API)   │  │  (地图API)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈清单

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | React | 18.x | UI 框架 |
| 前端语言 | TypeScript | 5.x | 类型安全 |
| 构建工具 | Vite | 5.x | 构建和开发服务器 |
| 状态管理 | Zustand | 4.x | 全局状态管理 |
| 路由 | React Router | 6.x | 前端路由 |
| UI 组件库 | shadcn/ui | latest | UI 组件 |
| 样式 | TailwindCSS | 3.x | CSS 框架 |
| HTTP 客户端 | Axios | 1.x | API 请求 |
| 地图服务 | 高德地图 JS API | 2.0 | 地图展示 |
| 语音识别 | 科大讯飞 Web SDK | latest | 语音转文字 |
| 后端运行时 | Deno | latest | Edge Functions |
| 数据库 | PostgreSQL | 15.x | 数据存储 |
| 认证服务 | Supabase Auth | latest | 用户认证 |
| 实时同步 | Supabase Realtime | latest | 数据同步 |
| 大语言模型 | 智谱AI GLM | 4.0 | 行程生成 |
| 容器化 | Docker | latest | 容器部署 |
| CI/CD | GitHub Actions | latest | 自动化部署 |

---

## 2. 前端架构

### 2.1 目录结构

```
src/
├── assets/                 # 静态资源
│   ├── images/
│   ├── icons/
│   └── fonts/
├── components/             # 通用组件
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── map/               # 地图组件
│   │   ├── AMap.tsx
│   │   ├── MapMarker.tsx
│   │   └── RouteLine.tsx
│   ├── itinerary/         # 行程组件
│   │   ├── ItineraryCard.tsx
│   │   ├── DayTimeline.tsx
│   │   └── ItemDetail.tsx
│   ├── speech/            # 语音组件
│   │   ├── VoiceInput.tsx
│   │   └── VoiceRecorder.tsx
│   └── expense/           # 费用组件
│       ├── ExpenseChart.tsx
│       └── ExpenseForm.tsx
├── pages/                 # 页面组件
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ItineraryPlanner.tsx
│   ├── ItineraryDetail.tsx
│   ├── ItineraryList.tsx
│   ├── ExpenseManager.tsx
│   └── Settings.tsx
├── stores/               # Zustand 状态管理
│   ├── authStore.ts
│   ├── itineraryStore.ts
│   ├── expenseStore.ts
│   └── uiStore.ts
├── services/             # API 服务
│   ├── supabase.ts       # Supabase 客户端
│   ├── auth.ts           # 认证服务
│   ├── itinerary.ts      # 行程服务
│   ├── expense.ts        # 费用服务
│   ├── ai.ts             # AI 服务
│   └── speech.ts         # 语音服务
├── hooks/                # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useItinerary.ts
│   ├── useExpense.ts
│   ├── useSpeech.ts
│   └── useMap.ts
├── types/                # TypeScript 类型定义
│   ├── index.ts
│   ├── auth.ts
│   ├── itinerary.ts
│   └── expense.ts
├── utils/                # 工具函数
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   └── storage.ts
├── config/               # 配置文件
│   ├── constants.ts
│   └── api.ts
├── App.tsx               # 根组件
├── main.tsx              # 入口文件
└── vite-env.d.ts         # Vite 类型声明
```

### 2.2 状态管理架构

使用 Zustand 进行状态管理，按功能模块划分 Store：

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

// stores/itineraryStore.ts
interface ItineraryState {
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  loading: boolean;
  fetchItineraries: () => Promise<void>;
  createItinerary: (data: ItineraryData) => Promise<void>;
  updateItinerary: (id: string, data: Partial<Itinerary>) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
}

// stores/expenseStore.ts
interface ExpenseState {
  expenses: Expense[];
  budget: number;
  fetchExpenses: (itineraryId: string) => Promise<void>;
  addExpense: (data: ExpenseData) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

// stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  toggleSidebar: () => void;
}
```

### 2.3 路由设计

```typescript
// App.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'itineraries',
        element: <ProtectedRoute><ItineraryList /></ProtectedRoute>
      },
      {
        path: 'itineraries/new',
        element: <ProtectedRoute><ItineraryPlanner /></ProtectedRoute>
      },
      {
        path: 'itineraries/:id',
        element: <ProtectedRoute><ItineraryDetail /></ProtectedRoute>
      },
      {
        path: 'expenses/:itineraryId',
        element: <ProtectedRoute><ExpenseManager /></ProtectedRoute>
      },
      {
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      }
    ]
  }
]);
```

### 2.4 组件通信

- **父子组件**：Props 传递
- **跨组件**：Zustand Store
- **服务端数据**：React Query / SWR（可选）
- **事件处理**：自定义 Hooks

---

## 3. 后端架构（Supabase Edge Functions）

### 3.1 Edge Functions 结构

```
supabase/
└── functions/
    ├── generate-itinerary/
    │   ├── index.ts
    │   └── deno.json
    ├── speech-to-text/
    │   ├── index.ts
    │   └── deno.json
    └── export-itinerary/
        ├── index.ts
        └── deno.json
```

### 3.2 Edge Functions 实现

#### 3.2.1 生成行程 (generate-itinerary)

```typescript
// supabase/functions/generate-itinerary/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { destination, start_date, end_date, budget, participants, preferences } = await req.json();

    // 调用智谱AI API
    const prompt = `请为${destination}生成一个${start_date}到${end_date}的旅行计划，预算${budget}元，${participants}人，偏好：${preferences.join('、')}。请返回JSON格式，包含每日行程、交通、住宿、景点、餐厅等信息。`;

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

#### 3.2.2 语音识别 (speech-to-text)

```typescript
// supabase/functions/speech-to-text/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    // 调用科大讯飞语音识别 API
    const response = await fetch('https://raasr.xfyun.cn/v2/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('XUNFEI_API_KEY')}`
      },
      body: audioFile
    });

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, text: data.result }), {
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

### 3.3 数据库设计

#### 3.3.1 表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 行程表
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

-- 索引
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_expenses_itinerary_id ON expenses(itinerary_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

#### 3.3.2 Row Level Security (RLS)

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

---

## 4. 外部 API 集成

### 4.1 智谱AI (GLM) 集成

#### 4.1.1 API 配置

```typescript
// config/api.ts
export const ZHIPU_CONFIG = {
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4',
  temperature: 0.7,
  maxTokens: 2000
};
```

#### 4.1.2 行程生成 Prompt 模板

```typescript
// services/ai.ts
const ITINERARY_PROMPT = `
你是一个专业的旅行规划师。请根据以下信息生成一个详细的旅行计划：

目的地：{destination}
出发日期：{start_date}
返回日期：{end_date}
预算：{budget} 元
同行人数：{participants} 人
旅行偏好：{preferences}
特殊需求：{special_requirements}

请按照以下 JSON 格式返回行程：

{
  "summary": {
    "total_days": 数字,
    "estimated_cost": 数字,
    "highlights": ["亮点1", "亮点2"]
  },
  "daily_itinerary": [
    {
      "date": "YYYY-MM-DD",
      "day": 1,
      "items": [
        {
          "time": "HH:MM",
          "type": "transport/accommodation/attraction/restaurant/activity",
          "name": "名称",
          "address": "地址",
          "latitude": 数字,
          "longitude": 数字,
          "description": "描述",
          "cost": 数字,
          "duration": 数字（分钟）
        }
      ]
    }
  ],
  "budget_breakdown": {
    "transport": 数字,
    "accommodation": 数字,
    "food": 数字,
    "tickets": 数字,
    "shopping": 数字,
    "other": 数字
  }
}

注意：
1. 确保所有时间安排合理，避免过于紧凑
2. 景点和餐厅推荐要有特色和口碑
3. 预算分配要合理，不要超出总预算
4. 提供准确的经纬度坐标（如果可能）
`;
```

### 4.2 科大讯飞语音识别集成

#### 4.2.1 前端集成

```typescript
// services/speech.ts
import { IatRecorder } from '@xfyun/webapi';

export class SpeechRecognitionService {
  private recorder: IatRecorder | null = null;

  constructor(apiKey: string) {
    this.recorder = new IatRecorder({
      appId: apiKey,
      onTextChange: (text: string) => {
        console.log('识别结果:', text);
      },
      onError: (error: any) => {
        console.error('语音识别错误:', error);
      }
    });
  }

  startRecording() {
    this.recorder?.start();
  }

  stopRecording() {
    this.recorder?.stop();
  }

  getText(): string {
    return this.recorder?.getText() || '';
  }
}
```

### 4.3 高德地图集成

#### 4.3.1 地图初始化

```typescript
// components/map/AMap.tsx
import { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

export function AMap({ markers, onMarkerClick }: AMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polyline', 'AMap.InfoWindow']
    }).then((AMap) => {
      const map = new AMap.Map(mapRef.current!, {
        zoom: 12,
        center: [116.397428, 39.90923]
      });

      mapInstanceRef.current = map;

      // 添加标记
      markers.forEach((marker) => {
        const amapMarker = new AMap.Marker({
          position: [marker.longitude, marker.latitude],
          title: marker.name
        });

        amapMarker.on('click', () => onMarkerClick(marker));
        map.add(amapMarker);
      });

      // 绘制路线
      if (markers.length > 1) {
        const path = markers.map(m => [m.longitude, m.latitude]);
        const polyline = new AMap.Polyline({
          path: path,
          borderWeight: 2,
          strokeColor: 'blue',
          lineJoin: 'round'
        });
        map.add(polyline);
      }
    });

    return () => {
      mapInstanceRef.current?.destroy();
    };
  }, [markers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
```

---

## 5. 安全设计

### 5.1 API Key 管理

#### 5.1.1 存储方案

- **前端**：通过环境变量存储（仅用于开发）
- **生产环境**：用户在设置页面输入，加密存储在 Supabase

#### 5.1.2 加密方案

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

### 5.2 认证与授权

#### 5.2.1 Supabase Auth

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

export async function register(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### 5.3 数据验证

#### 5.3.1 前端验证

```typescript
// utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateItineraryData(data: any): boolean {
  return !!(
    data.destination &&
    data.start_date &&
    data.end_date &&
    data.budget &&
    data.participants
  );
}
```

#### 5.3.2 后端验证（Edge Functions）

```typescript
// utils/validation.ts (Edge Functions)
export function validateItineraryRequest(data: any): { valid: boolean; error?: string } {
  if (!data.destination) {
    return { valid: false, error: '目的地不能为空' };
  }
  if (!data.start_date || !data.end_date) {
    return { valid: false, error: '日期不能为空' };
  }
  if (new Date(data.start_date) > new Date(data.end_date)) {
    return { valid: false, error: '开始日期不能晚于结束日期' };
  }
  if (!data.budget || data.budget <= 0) {
    return { valid: false, error: '预算必须大于0' };
  }
  return { valid: true };
}
```

---

## 6. 性能优化

### 6.1 前端优化

#### 6.1.1 代码分割

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const ItineraryPlanner = lazy(() => import('./pages/ItineraryPlanner'));
const ItineraryDetail = lazy(() => import('./pages/ItineraryDetail'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/itineraries/new" element={<ItineraryPlanner />} />
        <Route path="/itineraries/:id" element={<ItineraryDetail />} />
      </Routes>
    </Suspense>
  );
}
```

#### 6.1.2 图片优化

```typescript
// components/ui/Image.tsx
export function OptimizedImage({ src, alt, ...props }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
```

#### 6.1.3 缓存策略

```typescript
// utils/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data as T;
  }
  return null;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}
```

### 6.2 后端优化

#### 6.2.1 数据库索引

已在数据库设计中创建索引。

#### 6.2.2 查询优化

```typescript
// services/itinerary.ts
export async function fetchItineraries(userId: string) {
  const { data, error } = await supabase
    .from('itineraries')
    .select(`
      *,
      itinerary_items (
        id,
        date,
        time,
        type,
        name,
        address,
        latitude,
        longitude
      ),
      expenses (
        id,
        category,
        amount,
        date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

## 7. 部署架构

### 7.1 Docker 部署

#### 7.1.1 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 7.1.2 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://your-project.supabase.co;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 7.1.3 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### 7.2 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Aliyun Container Registry
      uses: docker/login-action@v2
      with:
        registry: registry.cn-hangzhou.aliyuncs.com
        username: ${{ secrets.ALIYUN_USERNAME }}
        password: ${{ secrets.ALIYUN_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
        cache-from: type=registry,ref=registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:buildcache
        cache-to: type=registry,ref=registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:buildcache,mode=max
```

---

## 8. 监控与日志

### 8.1 错误监控

```typescript
// utils/errorHandler.ts
export function handleError(error: any, context?: string) {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);

  // 发送到错误监控服务（如 Sentry）
  if (import.meta.env.PROD) {
    // Sentry.captureException(error);
  }
}

export function logInfo(message: string, data?: any) {
  console.log(`[Info]: ${message}`, data);
}

export function logWarning(message: string, data?: any) {
  console.warn(`[Warning]: ${message}`, data);
}
```

### 8.2 性能监控

```typescript
// utils/performance.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async () => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
}
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
// __tests__/utils/validation.test.ts
import { validateEmail, validatePassword } from '../../src/utils/validation';

describe('Validation Utils', () => {
  test('validateEmail should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('validateEmail should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('validatePassword should return true for valid password', () => {
    expect(validatePassword('password123')).toBe(true);
  });

  test('validatePassword should return false for short password', () => {
    expect(validatePassword('pass')).toBe(false);
  });
});
```

### 9.2 集成测试

```typescript
// __tests__/services/auth.test.ts
import { login, register } from '../../src/services/auth';

describe('Auth Service', () => {
  test('register should create a new user', async () => {
    const result = await register('test@example.com', 'password123', 'Test User');
    expect(result.user).toBeDefined();
  });

  test('login should authenticate a user', async () => {
    const result = await login('test@example.com', 'password123');
    expect(result.session).toBeDefined();
  });
});
```

---

## 10. 开发规范

### 10.1 代码风格

- 使用 ESLint + Prettier
- 遵循 Airbnb JavaScript Style Guide
- 使用 TypeScript 严格模式

### 10.2 Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

### 10.3 分支策略

- `main`：生产环境
- `develop`：开发环境
- `feature/*`：功能分支
- `bugfix/*`：修复分支

---

## 11. 技术债务与改进方向

### 11.1 短期改进

- [ ] 添加 React Query 进行数据缓存
- [ ] 实现离线支持（PWA）
- [ ] 添加单元测试覆盖率 > 80%

### 11.2 中期改进

- [ ] 实现 WebSocket 实时协作
- [ ] 添加国际化支持（i18n）
- [ ] 优化地图加载性能

### 11.3 长期改进

- [ ] 迁移到微前端架构
- [ ] 实现 AI 多轮对话
- [ ] 添加 AR 导航功能
