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
    destination, startDate, endDate, daysCount, budget, participants,
    preferences, specialRequirements, travelersType, accommodation, pace
  } = params

  const preferenceLabels: Record<string, string> = {
    'food': '美食',
    'attraction': '景点',
    'shopping': '购物',
    'culture': '文化',
    'nature': '自然',
    'anime': '动漫',
    'history': '历史',
    'nightlife': '夜生活'
  }

  const preferenceText = preferences.length > 0
    ? preferences.map(p => preferenceLabels[p] || p).join('、')
    : '无特别偏好'

  return `你是一位经验丰富的旅行规划师，擅长根据用户需求定制个性化旅行方案。

## 用户需求
- 目的地: ${destination}
- 出发日期: ${startDate}
- 返程日期: ${endDate}
- 旅行天数: ${daysCount}天
- 总预算: ${budget}元
- 同行人数: ${participants}人
- 人员构成: ${travelersType || '成人'}
- 旅行偏好: ${preferenceText}
- 住宿偏好: ${accommodation || '经济型'}
- 行程节奏: ${pace || '适中'}
- 特殊需求: ${specialRequirements || '无'}

## 任务要求

请生成一份详细的旅行计划，包含：

### 1. 每日行程安排
- 按时间顺序列出每天的活动
- 包含景点、餐厅、交通、住宿
- 时间安排合理，避免过于紧凑或松散
- 路线规划避免走回头路

### 2. 景点推荐
- 符合用户偏好的景点
- 包含景点简介、开放时间、门票价格
- 预估游玩时长
- 游玩建议和注意事项

### 3. 餐饮推荐
- 当地特色餐厅
- 菜系类型和人均消费
- 推荐菜品

### 4. 住宿建议
- 符合预算和偏好的酒店
- 位置便利性说明
- 价格区间和特色

### 5. 交通方案
- 往返目的地的交通方式
- 市内交通建议
- 预估交通费用

### 6. 预算分配
- 详细列出各项费用
- 确保总费用不超过预算

## 输出格式

请严格按照以下 JSON 格式输出，不要包含任何额外的解释文字：

\`\`\`json
{
  "trip_title": "行程标题（例如：${destination}${daysCount}日游）",
  "summary": "行程简介（100字以内）",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "total_days": ${daysCount},
  "daily_itinerary": [
    {
      "day": 1,
      "theme": "当日主题",
      "items": [
        {
          "time": "09:00",
          "type": "attraction",
          "title": "景点名称",
          "description": "景点简介（100字以内）",
          "location": {
            "address": "详细地址",
            "lat": 0,
            "lng": 0,
            "city": "城市"
          },
          "duration": "2小时",
          "cost": 60,
          "ticket_info": "门票信息",
          "opening_hours": "开放时间",
          "tips": "游玩建议"
        },
        {
          "time": "12:00",
          "type": "restaurant",
          "title": "餐厅名称",
          "description": "餐厅特色（50字以内）",
          "location": {
            "address": "详细地址",
            "lat": 0,
            "lng": 0
          },
          "cuisine": "菜系",
          "cost": 150,
          "recommended_dishes": ["菜品1", "菜品2"]
        }
      ]
    }
  ],
  "accommodation": [
    {
      "day": 1,
      "hotel_name": "酒店名称",
      "location": {
        "address": "酒店位置",
        "lat": 0,
        "lng": 0
      },
      "price_range": "300-500元/晚",
      "rating": "4.5",
      "features": ["特点1", "特点2"],
      "booking_tips": "预订建议"
    }
  ],
  "transportation": {
    "to_destination": {
      "method": "高铁/飞机/自驾",
      "details": "具体方案",
      "estimated_cost": 1000,
      "duration": "3小时"
    },
    "local_transport": {
      "recommendation": "地铁为主，配合打车",
      "daily_cost": 50,
      "tips": "交通建议"
    },
    "return": {
      "method": "返程方式",
      "estimated_cost": 1000
    }
  },
  "budget_breakdown": {
    "transportation": 2000,
    "accommodation": 2000,
    "food": 2500,
    "tickets": 1000,
    "shopping": 1500,
    "entertainment": 500,
    "other": 1000
  },
  "total_estimated_cost": 10000,
  "packing_list": ["必带物品1", "必带物品2"],
  "travel_tips": ["旅行建议1", "旅行建议2"],
  "emergency_contacts": {
    "police": "110",
    "hospital": "120",
    "tourist_hotline": "12301"
  }
}
\`\`\`

## 注意事项

1. 所有价格为人民币，精确到小数点后两位
2. 时间格式统一为 HH:mm
3. day 字段从 1 开始，表示行程的第几天
4. location 必须包含 address 字段
5. 确保 JSON 格式完全正确，可被解析
6. 行程安排要符合实际情况，避免不合理的时间安排
7. 预算分配要合理，总和应接近用户预算
8. 考虑目的地的实际情况（气候、节假日、特殊事件等）
9. 必须生成 ${daysCount} 天的完整行程
10. 每天的 items 数组必须包含 3-5 个活动`
}

export const SYSTEM_PROMPT = '你是旅行规划师，只返回纯JSON格式结果。确保JSON格式完全正确，所有字符串用双引号包裹，不要在JSON中使用注释或额外文字。'
