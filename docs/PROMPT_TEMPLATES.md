# Prompt 模板文档

本文档详细说明 AI 旅行规划师项目中使用的所有 Prompt 模板，包括行程规划、预算分析、语音输入解析、费用解析等，以及 Prompt 优化技巧。

## 📋 目录

- [Prompt 概述](#prompt-概述)
- [行程规划 Prompt](#行程规划-prompt)
- [预算分析 Prompt](#预算分析-prompt)
- [语音输入解析 Prompt](#语音输入解析-prompt)
- [费用解析 Prompt](#费用解析-prompt)
- [地点推荐 Prompt](#地点推荐-prompt)
- [行程优化 Prompt](#行程优化-prompt)
- [Prompt 优化技巧](#prompt-优化技巧)
- [Prompt 测试与评估](#prompt-测试与评估)
- [常见问题](#常见问题)

---

## Prompt 概述

### 什么是 Prompt？

Prompt 是给 AI 模型的输入指令，用于引导模型生成期望的输出。

### Prompt 设计原则

1. **清晰明确**：明确告诉模型要做什么
2. **具体详细**：提供足够的上下文信息
3. **结构化输出**：要求模型以特定格式输出
4. **示例引导**：提供示例帮助模型理解
5. **迭代优化**：根据反馈不断优化

### Prompt 结构

```
角色设定
↓
任务描述
↓
输入信息
↓
输出格式
↓
示例（可选）
↓
约束条件
```

---

## 行程规划 Prompt

### 基础行程规划 Prompt

#### Prompt 模板

```typescript
const ITINERARY_PLANNING_PROMPT = `
你是一个专业的旅行规划师，擅长为用户制定个性化的旅行计划。

## 任务
根据用户提供的旅行信息，生成一个详细的旅行计划。

## 输入信息
- 目的地：{destination}
- 出发日期：{startDate}
- 返回日期：{endDate}
- 预算：{budget} 元
- 参与人数：{participants} 人
- 人员构成：{travelersType}
- 住宿偏好：{accommodation}
- 行程节奏：{pace}
- 旅行偏好：{preferences}
- 特殊需求：{specialRequirements}

## 输出要求
请以 JSON 格式返回旅行计划，包含以下字段：

\`\`\`json
{
  "summary": {
    "destination": "目的地",
    "duration": "旅行天数",
    "totalBudget": 总预算,
    "participants": 参与人数,
    "estimatedCost": 预估总费用
  },
  "dailySchedule": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "星期几",
      "theme": "当日主题",
      "activities": [
        {
          "time": "HH:MM",
          "type": "transport|accommodation|attraction|restaurant|activity",
          "name": "活动名称",
          "address": "详细地址",
          "description": "活动描述",
          "cost": 费用,
          "duration": 时长（分钟）,
          "tips": "小贴士"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "transport": 交通费用,
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "tickets": 门票费用,
    "shopping": 购物费用,
    "other": 其他费用,
    "total": 总费用
  },
  "tips": [
    "旅行建议1",
    "旅行建议2"
  ],
  "emergencyContacts": {
    "police": "报警电话",
    "hospital": "急救电话",
    "embassy": "大使馆电话"
  }
}
\`\`\`

## 约束条件
1. 每天的活动时间安排要合理，不要过于紧凑
2. 预算要严格控制，不要超出用户预算
3. 活动类型要多样化，满足用户偏好
4. 考虑交通时间，合理安排活动顺序
5. 提供实用的小贴士和注意事项
6. 确保所有费用都是合理的市场价格
7. 如果预算不足，优先保证核心体验

## 注意事项
- 考虑当地的天气和季节因素
- 注意节假日和特殊活动
- 考虑参与人员的年龄和体力
- 提供备选方案
`;
```

#### 使用示例

```typescript
async function generateItinerary(params: {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  participants: number;
  travelersType?: string;
  accommodation?: string;
  pace?: string;
  preferences: string[];
  specialRequirements?: string;
}) {
  const prompt = ITINERARY_PLANNING_PROMPT
    .replace('{destination}', params.destination)
    .replace('{startDate}', params.startDate)
    .replace('{endDate}', params.endDate)
    .replace('{budget}', params.budget.toString())
    .replace('{participants}', params.participants.toString())
    .replace('{travelersType}', params.travelersType || '未指定')
    .replace('{accommodation}', params.accommodation || '未指定')
    .replace('{pace}', params.pace || '适中')
    .replace('{preferences}', params.preferences.join('、'))
    .replace('{specialRequirements}', params.specialRequirements || '无');

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
      max_tokens: 3000
    })
  });

  const data = await response.json();
  const itinerary = JSON.parse(data.choices[0].message.content);
  return itinerary;
}
```

### 行程优化 Prompt

#### Prompt 模板

```typescript
const ITINERARY_OPTIMIZATION_PROMPT = `
你是一个专业的旅行规划师，擅长优化旅行计划。

## 任务
根据用户的反馈，优化现有的旅行计划。

## 原始行程计划
{originalItinerary}

## 用户反馈
{userFeedback}

## 优化目标
{optimizationGoals}

## 输出要求
请以 JSON 格式返回优化后的旅行计划，格式与原始行程计划相同。

## 约束条件
1. 保持行程的核心体验不变
2. 根据用户反馈进行针对性优化
3. 确保优化后的行程更加合理
4. 控制预算在用户可接受范围内
5. 提供优化说明，解释为什么这样修改
`;
```

---

## 预算分析 Prompt

### 预算计算 Prompt

#### Prompt 模板

```typescript
const BUDGET_CALCULATION_PROMPT = `
你是一个专业的旅行预算分析师，擅长计算和分析旅行预算。

## 任务
根据用户的旅行计划，计算详细的预算分配。

## 输入信息
- 目的地：{destination}
- 出发日期：{startDate}
- 返回日期：{endDate}
- 总预算：{totalBudget} 元
- 参与人数：{participants} 人
- 旅行偏好：{preferences}

## 输出要求
请以 JSON 格式返回预算分析，包含以下字段：

\`\`\`json
{
  "summary": {
    "totalBudget": 总预算,
    "participants": 参与人数,
    "days": 旅行天数,
    "budgetPerDay": 每日预算,
    "budgetPerPerson": 每人预算
  },
  "breakdown": {
    "transport": {
      "amount": 交通费用,
      "percentage": 百分比,
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
    },
    "accommodation": {
      "amount": 住宿费用,
      "percentage": 百分比,
      "details": [...]
    },
    "food": {
      "amount": 餐饮费用,
      "percentage": 百分比,
      "details": [...]
    },
    "tickets": {
      "amount": 门票费用,
      "percentage": 百分比,
      "details": [...]
    },
    "shopping": {
      "amount": 购物费用,
      "percentage": 百分比,
      "details": [...]
    },
    "other": {
      "amount": 其他费用,
      "percentage": 百分比,
      "details": [...]
    }
  },
  "dailyBudget": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "星期几",
      "budget": 当日预算,
      "breakdown": {
        "transport": 交通费用,
        "food": 餐饮费用,
        "tickets": 门票费用,
        "other": 其他费用
      }
    }
  ],
  "suggestions": [
    "预算建议1",
    "预算建议2"
  ],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": [
      "风险因素1",
      "风险因素2"
    ],
    "mitigation": [
      "缓解措施1",
      "缓解措施2"
    ]
  }
}
\`\`\`

## 约束条件
1. 预算分配要合理，符合当地消费水平
2. 各类费用比例要平衡
3. 提供详细的费用明细
4. 识别潜在的预算风险
5. 提供实用的省钱建议
6. 考虑汇率和物价波动

## 注意事项
- 参考当地平均消费水平
- 考虑节假日和旺季价格
- 预留一定的应急资金
- 提供不同档次的消费选择
`;
```

### 预算优化 Prompt

#### Prompt 模板

```typescript
const BUDGET_OPTIMIZATION_PROMPT = `
你是一个专业的旅行预算分析师，擅长优化旅行预算。

## 任务
根据用户的预算限制，优化旅行计划以降低成本。

## 输入信息
- 原始行程计划：{originalItinerary}
- 当前预算：{currentBudget} 元
- 目标预算：{targetBudget} 元
- 优化优先级：{priorities}

## 输出要求
请以 JSON 格式返回优化后的预算方案，包含以下字段：

\`\`\`json
{
  "summary": {
    "originalBudget": 原始预算,
    "optimizedBudget": 优化后预算,
    "savings": 节省金额,
    "savingsPercentage": 节省百分比
  },
  "optimizations": [
    {
      "category": "类别",
      "originalCost": 原始费用,
      "optimizedCost": 优化后费用,
      "savings": 节省金额,
      "suggestions": [
        "优化建议1",
        "优化建议2"
      ]
    }
  ],
  "tradeoffs": [
    {
      "item": "项目",
      "change": "变更说明",
      "impact": "影响评估"
    }
  ],
  "recommendations": [
    "推荐方案1",
    "推荐方案2"
  ]
}
\`\`\`

## 约束条件
1. 在保证核心体验的前提下降低成本
2. 根据优化优先级进行调整
3. 提供多个优化方案供用户选择
4. 说明每个优化的利弊
5. 确保优化后的行程仍然可行
`;
```

---

## 语音输入解析 Prompt

### 语音输入理解 Prompt

#### Prompt 模板

```typescript
const SPEECH_INPUT_PARSING_PROMPT = `
你是一个专业的语音输入解析器，擅长将用户的语音输入转换为结构化的旅行需求。

## 任务
解析用户的语音输入，提取旅行相关信息。

## 语音输入
"{speechInput}"

## 输出要求
请以 JSON 格式返回解析结果，包含以下字段：

\`\`\`json
{
  "intent": "itinerary_planning|budget_analysis|expense_tracking|other",
  "destination": "目的地",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budget": 预算,
  "participants": 参与人数,
  "preferences": ["偏好1", "偏好2"],
  "specialRequirements": "特殊需求",
  "confidence": 置信度（0-1）,
  "missingFields": ["缺失字段1", "缺失字段2"],
  "clarifications": ["需要澄清的问题1", "需要澄清的问题2"]
}
\`\`\`

## 约束条件
1. 尽可能提取所有相关信息
2. 对于模糊的信息，标记为需要澄清
3. 识别用户的真实意图
4. 提供置信度评估
5. 列出缺失的关键信息
6. 生成澄清问题

## 示例

输入："我想去日本玩五天，预算一万块，两个人，喜欢吃美食和看动漫"

输出：
\`\`\`json
{
  "intent": "itinerary_planning",
  "destination": "日本",
  "startDate": null,
  "endDate": null,
  "budget": 10000,
  "participants": 2,
  "preferences": ["美食", "动漫"],
  "specialRequirements": null,
  "confidence": 0.9,
  "missingFields": ["startDate", "endDate"],
  "clarifications": [
    "请问您计划什么时候出发？",
    "请问您计划什么时候返回？"
  ]
}
\`\`\`
`;
```

### 语音输入纠错 Prompt

#### Prompt 模板

```typescript
const SPEECH_CORRECTION_PROMPT = `
你是一个专业的语音纠错器，擅长纠正语音识别中的错误。

## 任务
纠正语音识别中的错误，提取正确的旅行信息。

## 语音识别结果
"{speechRecognitionResult}"

## 上下文信息
- 对话历史：{conversationHistory}
- 当前任务：{currentTask}

## 输出要求
请以 JSON 格式返回纠正结果，包含以下字段：

\`\`\`json
{
  "originalText": "原始文本",
  "correctedText": "纠正后文本",
  "corrections": [
    {
      "original": "错误词",
      "corrected": "正确词",
      "reason": "纠正原因"
    }
  ],
  "extractedInfo": {
    "destination": "目的地",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "budget": 预算,
    "participants": 参与人数,
    "preferences": ["偏好1", "偏好2"]
  },
  "confidence": 置信度（0-1）
}
\`\`\`

## 约束条件
1. 根据上下文理解用户的真实意图
2. 纠正常见的语音识别错误
3. 保持用户的原意不变
4. 提供纠正原因
5. 评估纠正的置信度
`;
```

---

## 费用解析 Prompt

### 费用记录解析 Prompt

#### Prompt 模板

```typescript
const EXPENSE_PARSING_PROMPT = `
你是一个专业的费用解析器，擅长从用户的描述中提取费用信息。

## 任务
解析用户的费用描述，提取结构化的费用信息。

## 费用描述
"{expenseDescription}"

## 上下文信息
- 当前行程：{currentItinerary}
- 旅行目的地：{destination}
- 旅行日期：{travelDates}

## 输出要求
请以 JSON 格式返回解析结果，包含以下字段：

\`\`\`json
{
  "category": "transport|accommodation|food|ticket|shopping|other",
  "amount": 金额,
  "currency": "货币",
  "date": "YYYY-MM-DD",
  "description": "费用描述",
  "details": {
    "item": "项目名称",
    "quantity": 数量,
    "unitPrice": 单价,
    "location": "地点",
    "merchant": "商家"
  },
  "confidence": 置信度（0-1）,
  "suggestions": ["建议1", "建议2"]
}
\`\`\`

## 约束条件
1. 准确识别费用类别
2. 提取金额和货币信息
3. 推断费用日期（如果未明确说明）
4. 提供详细的费用明细
5. 评估解析的置信度
6. 提供实用的建议

## 示例

输入："今天中午在东京塔附近的拉面店吃了一碗拉面，花了1200日元"

输出：
\`\`\`json
{
  "category": "food",
  "amount": 1200,
  "currency": "JPY",
  "date": "2024-04-01",
  "description": "东京塔附近拉面店午餐",
  "details": {
    "item": "拉面",
    "quantity": 1,
    "unitPrice": 1200,
    "location": "东京塔附近",
    "merchant": "拉面店"
  },
  "confidence": 0.95,
  "suggestions": [
    "建议记录具体的拉面店名称",
    "可以添加照片作为凭证"
  ]
}
\`\`\`
`;
```

### 费用分类 Prompt

#### Prompt 模板

```typescript
const EXPENSE_CLASSIFICATION_PROMPT = `
你是一个专业的费用分类器，擅长将费用记录分类到合适的类别。

## 任务
将费用记录分类到合适的类别。

## 费用记录
{expenseRecord}

## 输出要求
请以 JSON 格式返回分类结果，包含以下字段：

\`\`\`json
{
  "category": "transport|accommodation|food|ticket|shopping|other",
  "subcategory": "子类别",
  "confidence": 置信度（0-1）,
  "reasoning": "分类理由",
  "alternatives": [
    {
      "category": "替代类别",
      "reason": "理由"
    }
  ]
}
\`\`\`

## 类别说明
- **transport**: 交通费用（机票、火车票、出租车、地铁等）
- **accommodation**: 住宿费用（酒店、民宿、青年旅社等）
- **food**: 餐饮费用（餐厅、小吃、饮料等）
- **ticket**: 门票费用（景点门票、演出门票等）
- **shopping**: 购物费用（纪念品、服装、电子产品等）
- **other**: 其他费用（签证、保险、小费等）

## 约束条件
1. 根据费用的性质进行分类
2. 提供分类理由
3. 评估分类的置信度
4. 提供可能的替代分类
5. 考虑费用的上下文信息
`;
```

---

## 地点推荐 Prompt

### 景点推荐 Prompt

#### Prompt 模板

```typescript
const ATTRACTION_RECOMMENDATION_PROMPT = `
你是一个专业的景点推荐师，擅长根据用户偏好推荐合适的景点。

## 任务
根据用户的信息，推荐合适的景点。

## 输入信息
- 目的地：{destination}
- 旅行日期：{travelDates}
- 用户偏好：{preferences}
- 预算：{budget}
- 参与人数：{participants}

## 输出要求
请以 JSON 格式返回推荐结果，包含以下字段：

\`\`\`json
{
  "recommendations": [
    {
      "name": "景点名称",
      "type": "natural|cultural|entertainment|shopping|other",
      "description": "景点描述",
      "address": "详细地址",
      "latitude": 纬度,
      "longitude": 经度,
      "openingHours": "开放时间",
      "ticketPrice": 门票价格,
      "recommendedDuration": 推荐游览时长（小时）,
      "bestTimeToVisit": "最佳游览时间",
      "tips": ["小贴士1", "小贴士2"],
      "matchScore": 匹配度（0-1）
    }
  ],
  "itinerarySuggestions": [
    {
      "day": 1,
      "attractions": ["景点1", "景点2", "景点3"],
      "route": "游览路线建议"
    }
  ]
}
\`\`\`

## 约束条件
1. 推荐的景点要符合用户偏好
2. 考虑景点的开放时间和季节
3. 控制门票费用在预算范围内
4. 提供实用的游览建议
5. 合理安排游览路线
6. 评估景点与用户的匹配度
`;
```

### 餐厅推荐 Prompt

#### Prompt 模板

```typescript
const RESTAURANT_RECOMMENDATION_PROMPT = `
你是一个专业的餐厅推荐师，擅长根据用户偏好推荐合适的餐厅。

## 任务
根据用户的信息，推荐合适的餐厅。

## 输入信息
- 目的地：{destination}
- 旅行日期：{travelDates}
- 饮食偏好：{dietaryPreferences}
- 预算：{budget}
- 参与人数：{participants}

## 输出要求
请以 JSON 格式返回推荐结果，包含以下字段：

\`\`\`json
{
  "recommendations": [
    {
      "name": "餐厅名称",
      "cuisine": "菜系",
      "description": "餐厅描述",
      "address": "详细地址",
      "latitude": 纬度,
      "longitude": 经度,
      "openingHours": "营业时间",
      "averagePrice": 人均消费,
      "priceRange": "价格区间",
      "signatureDishes": ["招牌菜1", "招牌菜2"],
      "specialties": ["特色1", "特色2"],
      "rating": 评分,
      "reviews": 评论数,
      "tips": ["小贴士1", "小贴士2"],
      "matchScore": 匹配度（0-1）
    }
  ],
  "mealSuggestions": [
    {
      "meal": "breakfast|lunch|dinner",
      "restaurant": "推荐餐厅",
      "reason": "推荐理由"
    }
  ]
}
\`\`\`

## 约束条件
1. 推荐的餐厅要符合用户饮食偏好
2. 考虑餐厅的营业时间
3. 控制人均消费在预算范围内
4. 推荐当地特色餐厅
5. 提供实用的用餐建议
6. 评估餐厅与用户的匹配度
`;
```

---

## Prompt 优化技巧

### 1. 明确角色设定

**❌ 不好的例子**：

```
帮我规划一个旅行计划。
```

**✅ 好的例子**：

```
你是一个专业的旅行规划师，拥有10年的旅行规划经验，
擅长为不同类型的客户制定个性化的旅行计划。
```

### 2. 提供详细上下文

**❌ 不好的例子**：

```
规划一个去日本的旅行。
```

**✅ 好的例子**：

```
请为以下信息规划一个旅行计划：
- 目的地：日本东京
- 出发日期：2024年4月1日
- 返回日期：2024年4月5日
- 预算：10000元
- 参与人数：2人
- 旅行偏好：美食、动漫、购物
- 特殊需求：无
```

### 3. 明确输出格式

**❌ 不好的例子**：

```
给我一个旅行计划。
```

**✅ 好的例子**：

```
请以 JSON 格式返回旅行计划，包含以下字段：
{
  "summary": {...},
  "dailySchedule": [...],
  "budgetBreakdown": {...}
}
```

### 4. 提供示例

**❌ 不好的例子**：

```
解析用户的语音输入。
```

**✅ 好的例子**：

```
解析用户的语音输入。

示例：
输入："我想去日本玩五天，预算一万块"
输出：
{
  "destination": "日本",
  "duration": 5,
  "budget": 10000
}
```

### 5. 设置约束条件

**❌ 不好的例子**：

```
规划一个旅行计划。
```

**✅ 好的例子**：

```
规划一个旅行计划，需满足以下约束：
1. 每天的活动时间安排要合理
2. 预算要严格控制
3. 活动类型要多样化
4. 考虑交通时间
```

### 6. 使用 Chain of Thought

**❌ 不好的例子**：

```
计算旅行预算。
```

**✅ 好的例子**：

```
请按以下步骤计算旅行预算：
1. 确定旅行天数和参与人数
2. 查询当地平均消费水平
3. 计算各类费用（交通、住宿、餐饮等）
4. 汇总总费用
5. 提供预算分配建议
```

### 7. 迭代优化

**步骤 1**：创建基础 Prompt

```
规划一个旅行计划。
```

**步骤 2**：添加角色和上下文

```
你是一个专业的旅行规划师。
请为日本规划一个5天的旅行计划。
```

**步骤 3**：明确输出格式

```
你是一个专业的旅行规划师。
请为日本规划一个5天的旅行计划。
以 JSON 格式返回。
```

**步骤 4**：添加约束和示例

```
你是一个专业的旅行规划师。
请为日本规划一个5天的旅行计划。
以 JSON 格式返回。
预算控制在10000元以内。
```

### 8. 使用 Few-Shot Learning

**❌ 不好的例子**：

```
解析费用记录。
```

**✅ 好的例子**：

```
解析费用记录。

示例 1：
输入："今天中午吃拉面花了1200日元"
输出：{"category": "food", "amount": 1200, "currency": "JPY"}

示例 2：
输入："买了两张东京塔门票，共2000日元"
输出：{"category": "ticket", "amount": 2000, "currency": "JPY"}

现在解析：
输入："打车去机场花了3000日元"
输出：
```

---

## Prompt 测试与评估

### 测试方法

#### 1. 单元测试

```typescript
describe('Itinerary Planning Prompt', () => {
  it('should generate valid itinerary', async () => {
    const result = await generateItinerary({
      destination: '日本',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      budget: 10000,
      participants: 2,
      preferences: ['美食', '动漫']
    });

    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('dailySchedule');
    expect(result).toHaveProperty('budgetBreakdown');
  });
});
```

#### 2. 集成测试

```typescript
describe('Speech Input Parsing', () => {
  it('should parse speech input correctly', async () => {
    const result = await parseSpeechInput(
      '我想去日本玩五天，预算一万块'
    );

    expect(result.intent).toBe('itinerary_planning');
    expect(result.destination).toBe('日本');
    expect(result.budget).toBe(10000);
  });
});
```

#### 3. A/B 测试

```typescript
// 测试不同 Prompt 版本的效果
const promptV1 = generatePromptV1(params);
const promptV2 = generatePromptV2(params);

const resultV1 = await callAI(promptV1);
const resultV2 = await callAI(promptV2);

compareResults(resultV1, resultV2);
```

### 评估指标

#### 1. 准确性

- 信息提取准确性
- 分类准确性
- 数值计算准确性

#### 2. 完整性

- 是否包含所有必需字段
- 是否覆盖所有用户需求
- 是否提供足够的细节

#### 3. 一致性

- 多次运行结果是否一致
- 格式是否一致
- 风格是否一致

#### 4. 可用性

- 输出是否易于理解
- 是否符合用户期望
- 是否可以直接使用

#### 5. 效率

- 响应时间
- Token 使用量
- 成本

---

## 常见问题

### Q1: 如何处理模糊的输入？

**方法**：

1. 识别模糊的部分
2. 生成澄清问题
3. 提供默认值或建议
4. 标记置信度

**示例**：

```typescript
const PROMPT = `
用户说："我想去日本玩几天"

分析：
- 目的地：明确（日本）
- 日期：模糊（需要澄清）
- 预算：未提供（需要澄清）
- 人数：未提供（需要澄清）

生成澄清问题：
1. 请问您计划什么时候出发？
2. 请问您的预算是多少？
3. 请问有几个人一起旅行？
`;
```

### Q2: 如何处理多轮对话？

**方法**：

1. 维护对话历史
2. 在 Prompt 中包含上下文
3. 引用之前的对话
4. 保持上下文连贯性

**示例**：

```typescript
const PROMPT = `
对话历史：
用户：我想去日本玩五天
AI：好的，请问您计划什么时候出发？
用户：4月1日
AI：请问您的预算是多少？
用户：10000元

当前任务：根据以上信息生成旅行计划
`;
```

### Q3: 如何优化 Prompt 的性能？

**方法**：

1. 减少 Prompt 长度
2. 使用更简洁的语言
3. 避免重复信息
4. 使用模板变量
5. 缓存常用 Prompt

**示例**：

```typescript
// ❌ 不好：每次都重复
const prompt = `
你是一个专业的旅行规划师。
请为日本规划一个旅行计划。
...
`;

// ✅ 好：使用模板
const prompt = ITINERARY_PLANNING_PROMPT
  .replace('{destination}', '日本')
  .replace('{startDate}', '2024-04-01');
```

### Q4: 如何处理 API 错误？

**方法**：

1. 实现重试机制
2. 提供降级方案
3. 记录错误日志
4. 友好的错误提示

**示例**：

```typescript
async function generateItinerary(params: any) {
  try {
    const result = await callAI(prompt);
    return result;
  } catch (error) {
    if (error.status === 429) {
      // 速率限制，等待后重试
      await sleep(1000);
      return generateItinerary(params);
    } else {
      // 其他错误，使用降级方案
      return generateFallbackItinerary(params);
    }
  }
}
```

### Q5: 如何评估 Prompt 的效果？

**方法**：

1. 收集用户反馈
2. 分析输出质量
3. 监控性能指标
4. A/B 测试
5. 定期优化

**示例**：

```typescript
// 收集反馈
function collectFeedback(result: any, userRating: number) {
  saveFeedback({
    prompt: result.prompt,
    output: result.output,
    rating: userRating,
    timestamp: Date.now()
  });
}

// 分析效果
function analyzeEffectiveness() {
  const feedbacks = getFeedbacks();
  const avgRating = calculateAverageRating(feedbacks);
  const successRate = calculateSuccessRate(feedbacks);
  
  console.log(`平均评分: ${avgRating}`);
  console.log(`成功率: ${successRate}`);
}
```

---

## 参考资料

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Learn Prompting](https://learnprompting.org/)
- [智谱AI API 文档](https://open.bigmodel.cn/dev/api)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
