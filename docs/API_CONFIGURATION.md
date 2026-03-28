# 第三方 API 配置指南

本文档详细说明如何配置 AI 旅行规划师项目所需的所有第三方 API 服务。

## 📋 目录

- [API 服务概述](#api-服务概述)
- [智谱AI (GLM-4)](#智谱ai-glm-4)
- [科大讯飞 (语音识别)](#科大讯飞-语音识别)
- [高德地图 (地图服务)](#高德地图-地图服务)
- [环境变量配置](#环境变量配置)
- [API 集成测试](#api-集成测试)
- [费用估算](#费用估算)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

---

## API 服务概述

### 必需的 API 服务

| API 服务           | 用途        | 免费额度      | 付费计划 |
| ------------------ | ----------- | ------------- | -------- |
| **智谱AI (GLM-4)** | AI 行程规划 | 100 万 tokens | 按量计费 |
| **科大讯飞**       | 语音识别    | 500 次/天     | 按量计费 |
| **高德地图**       | 地图服务    | 100 万次/天   | 按量计费 |

### API 服务架构

```
┌─────────────────────────────────────────────────┐
│                  前端应用                      │
│            (React + TypeScript)               │
└────────────────┬────────────────────────────────┘
                 │
                 │ API 调用
                 │
    ┌────────────┼────────────┬────────────┐
    │            │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│智谱AI │   │科大讯飞│   │高德地图│   │Supabase│
│GLM-4  │   │语音识别│   │JavaScript API│  │后端服务 │
└───────┘   └───────┘   └───────┘   └───────┘
```

---

## 智谱AI (GLM-4)

### 1. 注册智谱AI 账号

1. 访问 https://open.bigmodel.cn/
2. 点击右上角 "注册"
3. 填写注册信息：
   - 手机号
   - 验证码
   - 密码
4. 完成注册并登录

### 2. 创建 API Key

1. 登录后，点击右上角头像 → "API Key"
2. 点击 "创建新的 API Key"
3. 填写名称：`AI Travel Planner`
4. 点击 "确定"
5. **重要**：复制并保存 API Key（只显示一次）

**API Key 格式**：
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 配置 API Key

在 `.env` 文件中添加：

```env
VITE_ZHIPU_API_KEY=your-zhipu-api-key-here
```

**注意**：
- API Key 以 `.` 分隔，不要删除或修改
- 永远不要将 API Key 提交到 Git
- 建议使用环境变量管理

### 4. API 使用示例

#### 基础调用

```typescript
import { createClient } from '@supabase/supabase-js';

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;

async function generateItinerary(params: {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  participants: number;
  preferences: string[];
}) {
  const prompt = `请为${params.destination}生成一个${params.startDate}到${params.endDate}的旅行计划，预算${params.budget}元，${params.participants}人，偏好：${params.preferences.join('、')}。

请以JSON格式返回，包含以下字段：
- daily_schedule: 每日行程安排
  - date: 日期
  - activities: 活动列表
    - time: 时间
    - type: 类型（transport/accommodation/attraction/restaurant/activity）
    - name: 名称
    - address: 地址
    - description: 描述
    - cost: 费用
    - duration: 时长（分钟）
- total_cost: 总费用
- budget_breakdown: 预算明细
- tips: 旅行建议`;

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的旅行规划师，擅长为用户制定个性化的旅行计划。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const itinerary = JSON.parse(data.choices[0].message.content);
  return itinerary;
}
```

#### 流式响应

```typescript
async function generateItineraryStream(params: any) {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [{ role: 'user', content: '生成旅行计划' }],
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = JSON.parse(line.slice(6));
      if (data.choices[0].delta.content) {
        console.log(data.choices[0].delta.content);
      }
    }
  }
}
```

### 5. 费用说明

#### 免费额度

- **新用户**：100 万 tokens
- **有效期**：永久有效

#### 付费计划

| 模型        | 价格（输入）     | 价格（输出）     |
| ----------- | ---------------- | ---------------- |
| GLM-4       | ¥0.1/千 tokens   | ¥0.1/千 tokens   |
| GLM-3-Turbo | ¥0.005/千 tokens | ¥0.005/千 tokens |

**费用估算**：
- 生成一个旅行计划：约 2000 tokens
- 1000 个旅行计划：约 200 万 tokens
- 预计费用：约 ¥200

### 6. 限制说明

- **速率限制**：60 次/分钟
- **并发限制**：10 个请求
- **Token 限制**：GLM-4 最多 128K tokens

---

## 科大讯飞 (语音识别)

### 1. 注册科大讯飞账号

1. 访问 https://www.xfyun.cn/
2. 点击右上角 "注册"
3. 填写注册信息：
   - 手机号
   - 验证码
   - 密码
4. 完成注册并登录

### 2. 创建应用

1. 登录后，点击右上角 "控制台"
2. 点击 "创建应用"
3. 填写应用信息：
   - **应用名称**: `AI Travel Planner`
   - **应用分类**: `教育/培训`
   - **应用描述**: `AI 旅行规划师 - 语音输入功能`
4. 点击 "提交"

### 3. 添加语音识别服务

1. 在控制台中，找到刚创建的应用
2. 点击 "添加 API"
3. 选择 "语音听写（流式版）"
4. 点击 "添加"
5. 记录以下信息：
   - **APPID**: 应用 ID
   - **API Key**: API 密钥
   - **APISecret**: API 密钥

### 4. 配置 API Key

在 `.env` 文件中添加：

```env
VITE_XUNFEI_APP_ID=your-app-id
VITE_XUNFEI_API_KEY=your-api-key
VITE_XUNFEI_API_SECRET=your-api-secret
```

### 5. API 使用示例

#### 语音识别（WebSocket）

```typescript
import CryptoJS from 'crypto-js';

const XUNFEI_CONFIG = {
  appId: import.meta.env.VITE_XUNFEI_APP_ID,
  apiKey: import.meta.env.VITE_XUNFEI_API_KEY,
  apiSecret: import.meta.env.VITE_XUNFEI_API_SECRET,
  host: 'wss://iat-api.xfyun.cn/v2/iat'
};

class XunfeiASR {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;

  // 生成鉴权 URL
  private generateAuthUrl(): string {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${XUNFEI_CONFIG.host.replace('wss://', '')}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    const signature = CryptoJS.HmacSHA256(signatureOrigin, XUNFEI_CONFIG.apiSecret).toString(CryptoJS.enc.Base64);
    const authorizationOrigin = `api_key="${XUNFEI_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
    return `${XUNFEI_CONFIG.host}?authorization=${authorization}&date=${date}&host=${XUNFEI_CONFIG.host.replace('wss://', '')}`;
  }

  // 开始识别
  async startRecognition(onResult: (text: string) => void): Promise<void> {
    const url = this.generateAuthUrl();
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.code === 0 && data.data.result.ws) {
        const text = data.data.result.ws.map((item: any) => item.cw[0].w).join('');
        onResult(text);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
    };
  }

  // 发送音频数据
  sendAudioData(audioData: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));
      this.ws.send(JSON.stringify({
        data: {
          status: 1,
          format: 'audio/L16;rate=16000',
          audio: base64Audio,
          encoding: 'raw'
        }
      }));
    }
  }

  // 停止识别
  stopRecognition(): void {
    if (this.ws) {
      this.ws.send(JSON.stringify({ data: { status: 2 } }));
      this.ws.close();
      this.ws = null;
    }
  }
}

// 使用示例
const asr = new XunfeiASR();

// 开始识别
await asr.startRecognition((text) => {
  console.log('识别结果:', text);
});

// 发送音频数据
// ... 从麦克风获取音频数据并发送

// 停止识别
asr.stopRecognition();
```

### 6. 费用说明

#### 免费额度

- **语音听写**: 500 次/天
- **有效期**: 永久有效

#### 付费计划

| 服务               | 价格      |
| ------------------ | --------- |
| 语音听写（流式版） | ¥0.035/次 |
| 语音听写（一句话） | ¥0.035/次 |

**费用估算**：
- 每日 100 次语音输入：¥3.5/天
- 每月 3000 次语音输入：¥105/月

### 7. 限制说明

- **速率限制**：500 次/天（免费）
- **音频格式**：PCM、WAV、OPUS
- **采样率**：8000Hz、16000Hz
- **音频时长**：最长 60 秒

---

## 高德地图 (地图服务)

### 1. 注册高德地图账号

1. 访问 https://lbs.amap.com/
2. 点击右上角 "注册"
3. 填写注册信息：
   - 手机号
   - 验证码
   - 密码
4. 完成注册并登录

### 2. 创建应用

1. 登录后，点击右上角 "控制台"
2. 点击 "应用管理" → "我的应用"
3. 点击 "创建新应用"
4. 填写应用信息：
   - **应用名称**: `AI Travel Planner`
   - **应用类型**: `出行` 或 `其他`
5. 点击 "提交"

### 3. 添加 Key（需要两种类型的 Key）

本项目需要两种类型的高德地图 API Key：

#### 3.1 Web端(JS API) Key - 用于前端地图展示

1. 在应用列表中，找到刚创建的应用
2. 点击 "添加 Key"
3. 填写 Key 信息：
   - **Key 名称**: `Web端 Key`
   - **服务平台**: `Web端(JS API)`
4. 点击 "提交"
5. 记录以下信息：
   - **Key**: API Key（用于 `VITE_AMAP_KEY`）
   - **安全密钥**: Security JS Code（用于 `VITE_AMAP_SECURITY_JS_CODE`）

#### 3.2 Web服务 Key - 用于服务端 POI 搜索

1. 在同一应用下，再次点击 "添加 Key"
2. 填写 Key 信息：
   - **Key 名称**: `Web服务 Key`
   - **服务平台**: `Web服务`
3. 点击 "提交"
4. 记录 Key 信息（用于 `AMAP_WEB_API_KEY`）

**重要说明**：
- `Web端(JS API)` Key 用于前端 JavaScript 调用，直接在浏览器中使用
- `Web服务` Key 用于服务端 REST API 调用，如 POI 搜索、地理编码等
- 两种 Key 不能混用，否则会返回 `USERKEY_PLAT_NOMATCH` 错误

### 4. 配置 API Key

在 `.env` 文件中添加：

```env
# 高德地图 - Web端(JS API) - 前端地图展示
VITE_AMAP_KEY=your-amap-web-js-key
VITE_AMAP_SECURITY_JS_CODE=your-security-js-code

# 高德地图 - Web服务 - 服务端 POI 搜索（需要配置到 Supabase Edge Functions）
AMAP_WEB_API_KEY=your-amap-web-service-key
```

**配置 Web服务 Key 到 Supabase**：

```bash
supabase secrets set AMAP_WEB_API_KEY=your-amap-web-service-key --project-ref your-project-ref
```

### 5. API 使用示例

#### 地图初始化

```typescript
import AMapLoader from '@amap/amap-jsapi-loader';

const AMAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY,
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE,
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.ControlBar',
    'AMap.Geolocation',
    'AMap.Geocoder',
    'AMap.PlaceSearch',
    'AMap.Driving',
    'AMap.Walking',
    'AMap.Riding',
    'AMap.Transit'
  ]
};

class AMapService {
  private map: any = null;

  // 初始化地图
  async initMap(containerId: string): Promise<void> {
    try {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: AMAP_CONFIG.plugins
      }).then((AMap) => {
        this.map = new AMap.Map(containerId, {
          zoom: 11,
          center: [116.397428, 39.90923], // 北京
          viewMode: '3D'
        });

        // 添加控件
        this.map.addControl(new AMap.Scale());
        this.map.addControl(new AMap.ToolBar());
        this.map.addControl(new AMap.ControlBar());
      });
    } catch (error) {
      console.error('地图加载失败:', error);
    }
  }

  // 地理编码（地址 → 坐标）
  async geocode(address: string): Promise<{ lng: number; lat: number } | null> {
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: ['AMap.Geocoder']
      }).then((AMap) => {
        const geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes.length) {
            const { lng, lat } = result.geocodes[0].location;
            resolve({ lng, lat });
          } else {
            reject(new Error('地理编码失败'));
          }
        });
      }).catch(reject);
    });
  }

  // 逆地理编码（坐标 → 地址）
  async reverseGeocode(lng: number, lat: number): Promise<string | null> {
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: ['AMap.Geocoder']
      }).then((AMap) => {
        const geocoder = new AMap.Geocoder();
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            resolve(result.regeocode.formattedAddress);
          } else {
            reject(new Error('逆地理编码失败'));
          }
        });
      }).catch(reject);
    });
  }

  // 地点搜索
  async searchPlace(keyword: string, city: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: ['AMap.PlaceSearch']
      }).then((AMap) => {
        const placeSearch = new AMap.PlaceSearch({
          city: city,
          pageSize: 10
        });
        placeSearch.search(keyword, (status: string, result: any) => {
          if (status === 'complete' && result.poiList) {
            resolve(result.poiList.pois);
          } else {
            reject(new Error('地点搜索失败'));
          }
        });
      }).catch(reject);
    });
  }

  // 路线规划（驾车）
  async planDrivingRoute(start: [number, number], end: [number, number]): Promise<any> {
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: ['AMap.Driving']
      }).then((AMap) => {
        const driving = new AMap.Driving({
          map: this.map
        });
        driving.search(start, end, (status: string, result: any) => {
          if (status === 'complete') {
            resolve(result);
          } else {
            reject(new Error('路线规划失败'));
          }
        });
      }).catch(reject);
    });
  }

  // 路线规划（步行）
  async planWalkingRoute(start: [number, number], end: [number, number]): Promise<any> {
    return new Promise((resolve, reject) => {
      AMapLoader.load({
        key: AMAP_CONFIG.key,
        version: AMAP_CONFIG.version,
        plugins: ['AMap.Walking']
      }).then((AMap) => {
        const walking = new AMap.Walking({
          map: this.map
        });
        walking.search(start, end, (status: string, result: any) => {
          if (status === 'complete') {
            resolve(result);
          } else {
            reject(new Error('路线规划失败'));
          }
        });
      }).catch(reject);
    });
  }
}

// 使用示例
const mapService = new AMapService();

// 初始化地图
await mapService.initMap('map-container');

// 地理编码
const location = await mapService.geocode('北京市天安门广场');
console.log('坐标:', location);

// 逆地理编码
const address = await mapService.reverseGeocode(116.397428, 39.90923);
console.log('地址:', address);

// 地点搜索
const places = await mapService.searchPlace('餐厅', '北京');
console.log('搜索结果:', places);

// 路线规划
const route = await mapService.planDrivingRoute(
  [116.397428, 39.90923],
  [116.407428, 39.91923]
);
console.log('路线:', route);
```

### 6. 费用说明

#### 免费额度

- **JavaScript API**: 100 万次/天
- **Web服务 API**: 100 万次/天
- **有效期**: 永久有效

#### 付费计划

| 服务           | 价格                      |
| -------------- | ------------------------- |
| JavaScript API | ¥0.005/次（超出免费额度） |
| Web服务 API    | ¥0.005/次（超出免费额度） |

**费用估算**：
- 每日 1000 次地图调用：免费
- 每月 3000 万次地图调用：¥150,000/月

### 7. 限制说明

- **速率限制**：100 万次/天（免费）
- **QPS 限制**：100 QPS
- **并发限制**：10 个请求

---

## 环境变量配置

### 完整的 .env 文件

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 加密密钥（必需，至少32字符）
VITE_ENCRYPTION_KEY=your-secret-encryption-key-at-least-32-chars

# 智谱AI (GLM-4)
VITE_ZHIPU_API_KEY=your-zhipu-api-key

# 科大讯飞 (语音识别)
VITE_XUNFEI_APP_ID=your-xunfei-app-id
VITE_XUNFEI_API_KEY=your-xunfei-api-key
VITE_XUNFEI_API_SECRET=your-xunfei-api-secret

# 高德地图 - Web端(JS API) - 前端地图展示
VITE_AMAP_KEY=your-amap-web-js-key
VITE_AMAP_SECURITY_JS_CODE=your-amap-security-js-code

# 高德地图 - Web服务 - 服务端 POI 搜索
AMAP_WEB_API_KEY=your-amap-web-service-key

# 应用配置
VITE_APP_NAME=AI Travel Planner
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
VITE_ENABLE_SPEECH_RECOGNITION=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_MULTI_LANGUAGE=true
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

### 环境变量验证

创建一个验证脚本 `scripts/verify-env.ts`：

```typescript
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ENCRYPTION_KEY',
  'VITE_ZHIPU_API_KEY',
  'VITE_XUNFEI_APP_ID',
  'VITE_XUNFEI_API_KEY',
  'VITE_XUNFEI_API_SECRET',
  'VITE_AMAP_KEY',
  'VITE_AMAP_SECURITY_JS_CODE',
  'AMAP_WEB_API_KEY'
];

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error('缺少以下环境变量:');
  missingVars.forEach((varName) => console.error(`- ${varName}`));
  process.exit(1);
}

console.log('✅ 所有环境变量已配置');
```

---

## API 集成测试

### 1. 测试智谱AI

```typescript
// scripts/test-zhipu.ts
async function testZhipuAI() {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [{ role: 'user', content: '你好' }],
      max_tokens: 10
    })
  });

  const data = await response.json();
  console.log('智谱AI 测试结果:', data);
}

testZhipuAI();
```

### 2. 测试科大讯飞

```typescript
// scripts/test-xunfei.ts
async function testXunfeiASR() {
  // 测试 WebSocket 连接
  const url = generateAuthUrl();
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('✅ 科大讯飞 WebSocket 连接成功');
    ws.close();
  };

  ws.onerror = (error) => {
    console.error('❌ 科大讯飞 WebSocket 连接失败:', error);
  };
}

testXunfeiASR();
```

### 3. 测试高德地图

```typescript
// scripts/test-amap.ts
async function testAMap() {
  try {
    const AMap = await AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: '2.0'
    });
    console.log('✅ 高德地图加载成功');
  } catch (error) {
    console.error('❌ 高德地图加载失败:', error);
  }
}

testAMap();
```

---

## 费用估算

### 月度费用估算（假设）

| API 服务       | 使用量       | 单价      | 月费用      |
| -------------- | ------------ | --------- | ----------- |
| 智谱AI (GLM-4) | 1000 次调用  | ¥0.2/次   | ¥200        |
| 科大讯飞       | 3000 次调用  | ¥0.035/次 | ¥105        |
| 高德地图       | 100 万次调用 | 免费      | ¥0          |
| **总计**       | -            | -         | **¥305/月** |

### 优化建议

1. **智谱AI**：
   - 使用 GLM-3-Turbo 降低成本
   - 缓存常用行程计划
   - 优化 Prompt 减少 token 使用

2. **科大讯飞**：
   - 使用 Web Speech API（浏览器原生）
   - 限制语音输入时长
   - 使用本地语音识别

3. **高德地图**：
   - 充分利用免费额度
   - 缓存地理编码结果
   - 使用离线地图

---

## 故障排查

### 问题 1：智谱AI API 调用失败

**错误信息**：
```
Error: 401 Unauthorized
```

**解决方案**：

1. 检查 API Key 是否正确
2. 确认 API Key 未过期
3. 检查账户余额
4. 查看速率限制

### 问题 2：科大讯飞 WebSocket 连接失败

**错误信息**：
```
Error: WebSocket connection failed
```

**解决方案**：

1. 检查 APPID、API Key、APISecret 是否正确
2. 确认鉴权 URL 生成正确
3. 检查网络连接
4. 查看防火墙设置

### 问题 3：高德地图加载失败

**错误信息**：
```
Error: AMap is not defined
```

**解决方案**：

1. 检查 API Key 是否正确
2. 确认 Security JS Code 配置正确
3. 检查域名白名单
4. 查看浏览器控制台错误

---

## 最佳实践

### 1. API Key 管理

- ✅ 使用环境变量存储 API Key
- ✅ 永远不要将 API Key 提交到 Git
- ✅ 定期轮换 API Key
- ✅ 使用不同的 API Key 用于开发和生产

### 2. 错误处理

- ✅ 实现统一的错误处理机制
- ✅ 提供用户友好的错误提示
- ✅ 记录错误日志
- ✅ 实现重试机制

### 3. 性能优化

- ✅ 使用缓存减少 API 调用
- ✅ 实现请求去重
- ✅ 使用流式响应
- ✅ 优化 Prompt 减少 token 使用

### 4. 安全建议

- ✅ 在服务端验证 API 调用
- ✅ 限制 API 调用频率
- ✅ 使用 HTTPS 传输
- ✅ 实现访问日志

---

## 参考资料

- [智谱AI 官方文档](https://open.bigmodel.cn/dev/api)
- [科大讯飞语音识别文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html)
- [高德地图 JavaScript API 文档](https://lbs.amap.com/api/javascript-api/summary)
- [Supabase 官方文档](https://supabase.com/docs)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
