import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface ItineraryRequest {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
  userId: string
  travelersType?: string
  accommodation?: string
  pace?: string
}

interface ZhipuAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  error?: {
    message: string
    code: string
  }
}

type ActivityType = 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity' | 'shopping'

interface AIResponseItem {
  time: string
  type: string
  title: string
  description: string
  location: string
  duration?: string
  cost: number
  ticket_info?: string
  opening_hours?: string
  tips?: string
  cuisine?: string
  recommended_dishes?: string[]
}

interface AIDailyItinerary {
  day: number
  date: string
  theme: string
  items: AIResponseItem[]
}

interface AIAccommodation {
  day: number
  hotel_name: string
  location: string
  price_range: string
  rating?: string
  features?: string[]
  booking_tips?: string
}

interface AITransportation {
  to_destination?: {
    method: string
    details: string
    estimated_cost: number
    duration: string
  }
  local_transport?: {
    recommendation: string
    daily_cost: number
    tips: string
  }
  return?: {
    method: string
    estimated_cost: number
  }
}

interface AIBudgetBreakdown {
  transportation: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  other: number
}

interface AIGeneratedItinerary {
  trip_title: string
  summary: string
  highlights: string[]
  total_days: number
  daily_itinerary: AIDailyItinerary[]
  accommodation: AIAccommodation[]
  transportation: AITransportation
  budget_breakdown: AIBudgetBreakdown
  total_estimated_cost: number
  packing_list: string[]
  travel_tips: string[]
  emergency_contacts: {
    police: string
    hospital: string
    tourist_hotline: string
  }
}

interface DbActivity {
  itinerary_id: string
  date: string
  time: string
  type: ActivityType
  name: string
  address: string
  latitude?: number
  longitude?: number
  description: string
  cost: number
  duration: number
  order_index: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ success: false, error: '请求 Content-Type 必须是 application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const bodyText = await req.text()
    if (!bodyText || bodyText.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: '请求体不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let data: ItineraryRequest
    try {
      data = JSON.parse(bodyText)
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: '请求体 JSON 格式无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      destination,
      startDate,
      endDate,
      budget,
      participants,
      preferences,
      specialRequirements,
      userId,
      travelersType,
      accommodation,
      pace
    } = data

    if (!destination || !startDate || !endDate || !budget || !participants || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必填字段' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (daysCount > 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '行程天数不能超过10天，建议分段规划'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResponse = await callZhipuAI(buildPrompt({
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
    }))

    const itinerary = parseAIResponse(aiResponse)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: savedItinerary, error: saveError } = await supabase
      .from('itineraries')
      .insert({
        user_id: userId,
        title: itinerary.trip_title || `${destination} ${daysCount}日游`,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget,
        participants,
        preferences,
        special_requirements: specialRequirements,
        travelers_type: travelersType,
        accommodation_pref: accommodation,
        pace
      })
      .select()
      .single()

    if (saveError) {
      console.error('保存行程失败:', saveError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `保存行程失败: ${saveError.message}`,
          itinerary
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const itineraryId = savedItinerary.id
    const dbActivities = transformToDbFormat(itinerary, itineraryId, startDate, daysCount)

    if (dbActivities.length > 0) {
      const { error: itemsError } = await supabase
        .from('itinerary_items')
        .insert(dbActivities)

      if (itemsError) {
        console.error('保存行程项失败:', itemsError)
      }
    }

    const expenses = buildExpenses(itinerary.budget_breakdown, itineraryId, startDate)
    if (expenses.length > 0) {
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(expenses)

      if (expensesError) {
        console.error('保存费用记录失败:', expensesError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        itinerary: {
          ...savedItinerary,
          daily_schedule: itinerary.daily_itinerary,
          budget_breakdown: itinerary.budget_breakdown,
          total_estimated_cost: itinerary.total_estimated_cost,
          highlights: itinerary.highlights,
          tips: itinerary.travel_tips,
          packing_list: itinerary.packing_list,
          emergency_contacts: itinerary.emergency_contacts,
          accommodation: itinerary.accommodation,
          transportation: itinerary.transportation
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('生成行程失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '生成行程失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildPrompt(params: {
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
}): string {
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
      "date": "${startDate}",
      "theme": "当日主题",
      "items": [
        {
          "time": "09:00",
          "type": "attraction",
          "title": "景点名称",
          "description": "景点简介（100字以内）",
          "location": "详细地址",
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
          "location": "详细地址",
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
      "location": "酒店位置",
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
3. 日期格式为 YYYY-MM-DD
4. 确保 JSON 格式完全正确，可被解析
5. 行程安排要符合实际情况，避免不合理的时间安排
6. 预算分配要合理，总和应接近用户预算
7. 考虑目的地的实际情况（气候、节假日、特殊事件等）
8. 必须生成 ${daysCount} 天的完整行程
9. 每天的 items 数组必须包含 3-5 个活动`
}

async function callZhipuAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY 环境变量未配置')
  }

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: '你是旅行规划师，只返回JSON格式结果，不要包含任何解释文字。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`智谱AI API 错误: ${errorData.error?.message || response.statusText}`)
  }

  const data: ZhipuAIResponse = await response.json()

  if (data.error) {
    throw new Error(`智谱AI API 错误: ${data.error.message}`)
  }

  return data.choices[0]?.message?.content || ''
}

function parseAIResponse(content: string): AIGeneratedItinerary {
  let jsonStr = content

  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  } else {
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0]
    }
  }

  jsonStr = jsonStr
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    .trim()

  try {
    return JSON.parse(jsonStr) as AIGeneratedItinerary
  } catch (e) {
    console.error('JSON 解析失败:', e)
    console.error('原始内容:', content.substring(0, 500))
    throw new Error('AI 响应格式解析失败，请重试')
  }
}

function transformToDbFormat(
  itinerary: AIGeneratedItinerary,
  itineraryId: string,
  startDate: string,
  daysCount: number
): DbActivity[] {
  const activities: DbActivity[] = []
  let orderIndex = 0

  const startDateObj = new Date(startDate)

  for (let day = 1; day <= daysCount; day++) {
    const currentDate = new Date(startDateObj)
    currentDate.setDate(startDateObj.getDate() + day - 1)
    const dateStr = currentDate.toISOString().split('T')[0]

    const dayItinerary = itinerary.daily_itinerary?.find(d => d.day === day)

    if (dayItinerary?.items) {
      for (const item of dayItinerary.items) {
        const normalizedType = normalizeActivityType(item.type)

        activities.push({
          itinerary_id: itineraryId,
          date: dateStr,
          time: item.time || '09:00',
          type: normalizedType,
          name: item.title || '未命名活动',
          address: item.location || '',
          latitude: 0,
          longitude: 0,
          description: item.description || '',
          cost: parseCost(item.cost),
          duration: parseDuration(item.duration),
          order_index: orderIndex++
        })
      }
    }

    const dayAccommodation = itinerary.accommodation?.find(a => a.day === day)
    if (dayAccommodation) {
      activities.push({
        itinerary_id: itineraryId,
        date: dateStr,
        time: '18:00',
        type: 'accommodation',
        name: dayAccommodation.hotel_name || '住宿',
        address: dayAccommodation.location || '',
        latitude: 0,
        longitude: 0,
        description: `${dayAccommodation.price_range || ''} ${dayAccommodation.features?.join('、') || ''}`.trim(),
        cost: parsePriceRange(dayAccommodation.price_range),
        duration: 0,
        order_index: orderIndex++
      })
    }
  }

  return activities
}

function normalizeActivityType(type: string): ActivityType {
  const typeMap: Record<string, ActivityType> = {
    'attraction': 'attraction',
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'transport': 'transport',
    'transportation': 'transport',
    'accommodation': 'accommodation',
    'hotel': 'accommodation',
    'activity': 'activity',
    'shopping': 'shopping'
  }
  return typeMap[type?.toLowerCase()] || 'activity'
}

function parseCost(cost: unknown): number {
  if (typeof cost === 'number') return cost
  if (typeof cost === 'string') {
    const match = cost.match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
  }
  return 0
}

function parseDuration(duration: unknown): number {
  if (typeof duration === 'number') return duration
  if (typeof duration === 'string') {
    const hourMatch = duration.match(/(\d+)\s*小时/)
    if (hourMatch) return parseInt(hourMatch[1]) * 60

    const minuteMatch = duration.match(/(\d+)\s*分钟/)
    if (minuteMatch) return parseInt(minuteMatch[1])

    const numMatch = duration.match(/(\d+)/)
    if (numMatch) return parseInt(numMatch[1])
  }
  return 0
}

function parsePriceRange(priceRange: string | undefined): number {
  if (!priceRange) return 0
  const match = priceRange.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function buildExpenses(
  budgetBreakdown: AIBudgetBreakdown | undefined,
  itineraryId: string,
  startDate: string
): Array<{
  itinerary_id: string
  category: string
  amount: number
  date: string
  description: string
}> {
  if (!budgetBreakdown) return []

  const categoryMap: Record<string, string> = {
    'transportation': 'transport',
    'accommodation': 'accommodation',
    'food': 'food',
    'tickets': 'ticket',
    'shopping': 'shopping',
    'other': 'other'
  }

  const expenses: Array<{
    itinerary_id: string
    category: string
    amount: number
    date: string
    description: string
  }> = []

  for (const [key, value] of Object.entries(budgetBreakdown)) {
    if (key && value > 0) {
      expenses.push({
        itinerary_id: itineraryId,
        category: categoryMap[key] || 'other',
        amount: value,
        date: startDate,
        description: `${key} 预算`
      })
    }
  }

  return expenses
}
