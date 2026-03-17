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

interface Activity {
  time: string
  type: ActivityType
  name: string
  address: string
  latitude?: number
  longitude?: number
  description: string
  cost: number
  duration: number
  tips: string
}

interface DailySchedule {
  date: string
  dayOfWeek: string
  theme: string
  activities: Activity[]
}

interface BudgetBreakdown {
  transport: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  other: number
  total: number
}

interface EmergencyContacts {
  police: string
  hospital: string
  embassy: string
}

interface GeneratedItinerary {
  summary: {
    destination: string
    duration: string
    totalBudget: number
    participants: number
    estimatedCost: number
  }
  dailySchedule: DailySchedule[]
  budgetBreakdown: BudgetBreakdown
  tips: string[]
  emergencyContacts: EmergencyContacts
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: ItineraryRequest = await req.json()
    const {
      destination,
      startDate,
      endDate,
      budget,
      participants,
      preferences,
      specialRequirements,
      userId
    } = data

    if (!destination || !startDate || !endDate || !budget || !participants || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少必填字段'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const itinerary = await generateItinerary({
      destination,
      startDate,
      endDate,
      budget,
      participants,
      preferences: preferences || [],
      specialRequirements
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: savedItinerary, error: saveError } = await supabase
      .from('itineraries')
      .insert({
        user_id: userId,
        title: `${destination} ${itinerary.summary.duration}游`,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget,
        participants,
        preferences,
        special_requirements: specialRequirements
      })
      .select()
      .single()

    if (saveError) {
      console.error('保存行程失败:', saveError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `保存行程失败: ${saveError.message}`,
          itinerary: itinerary
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const itineraryId = savedItinerary.id

    const itineraryItems = []
    let orderIndex = 0
    for (const day of itinerary.dailySchedule) {
      for (const activity of day.activities) {
        itineraryItems.push({
          itinerary_id: itineraryId,
          date: day.date,
          time: activity.time,
          type: activity.type,
          name: activity.name,
          address: activity.address,
          latitude: activity.latitude,
          longitude: activity.longitude,
          description: activity.description,
          cost: activity.cost,
          duration: activity.duration,
          order_index: orderIndex++
        })
      }
    }

    if (itineraryItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('itinerary_items')
        .insert(itineraryItems)

      if (itemsError) {
        console.error('保存行程项失败:', itemsError)
      }
    }

    const expenses = []
    const expenseCategories: Record<string, string> = {
      'transport': 'transport',
      'accommodation': 'accommodation',
      'food': 'food',
      'tickets': 'ticket',
      'shopping': 'shopping',
      'other': 'other'
    }

    for (const [key, value] of Object.entries(itinerary.budgetBreakdown)) {
      if (key !== 'total' && typeof value === 'number' && value > 0) {
        expenses.push({
          itinerary_id: itineraryId,
          category: expenseCategories[key] || 'other',
          amount: value,
          date: startDate,
          description: `${key} 预算`
        })
      }
    }

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
          daily_schedule: itinerary.dailySchedule,
          budget_breakdown: itinerary.budgetBreakdown,
          tips: itinerary.tips,
          emergency_contacts: itinerary.emergencyContacts
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('生成行程失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '生成行程失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateItineraryPrompt(params: {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
}): string {
  const { destination, startDate, endDate, budget, participants, preferences, specialRequirements } = params

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

  return `你是旅行规划师。根据以下信息生成简洁的旅行计划。

目的地：${destination}
日期：${startDate} 至 ${endDate}
预算：${budget} 元
人数：${participants} 人
偏好：${preferenceText || '无'}
特殊需求：${specialRequirements || '无'}

返回 JSON 格式：
{
  "summary": {
    "destination": "目的地",
    "duration": "X天",
    "totalBudget": ${budget},
    "participants": ${participants},
    "estimatedCost": 预估费用
  },
  "dailySchedule": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "星期X",
      "theme": "主题",
      "activities": [
        {"time": "HH:MM", "type": "transport|accommodation|attraction|restaurant|activity|shopping", "name": "名称", "address": "地址", "latitude": 0, "longitude": 0, "description": "描述", "cost": 0, "duration": 60, "tips": "提示"}
      ]
    }
  ],
  "budgetBreakdown": {"transport": 0, "accommodation": 0, "food": 0, "tickets": 0, "shopping": 0, "other": 0, "total": 0},
  "tips": ["建议1", "建议2"],
  "emergencyContacts": {"police": "110", "hospital": "120", "embassy": "电话"}
}

要求：
1. 每天最多4个活动
2. 预算不超${budget}元
3. 直接返回JSON，不要其他文字`
}

async function callZhipuAI(prompt: string, retryCount = 0): Promise<ZhipuAIResponse> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY 环境变量未配置')
  }

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: '你是旅行规划师，只返回JSON格式结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

    return data
  } catch (error) {
    if (retryCount === 0) {
      console.log('第一次调用失败，正在重试...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return callZhipuAI(prompt, retryCount + 1)
    }
    throw error
  }
}

async function generateItinerary(params: {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
}): Promise<GeneratedItinerary> {
  const prompt = generateItineraryPrompt(params)

  console.log('开始调用智谱 AI...')
  const response = await callZhipuAI(prompt)
  console.log('智谱 AI 调用完成')

  const content = response.choices[0].message.content
  console.log('AI 响应内容长度:', content?.length || 0)
  console.log('AI 响应前 500 字符:', content?.substring(0, 500))

  let itinerary: GeneratedItinerary
  try {
    let jsonString = content

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      jsonString = jsonMatch[1]
    } else {
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        jsonString = jsonObjectMatch[0]
      }
    }

    console.log('尝试解析 JSON，长度:', jsonString?.length || 0)

    jsonString = jsonString
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,\s*]/g, ']')
      .replace(/,\s*}/g, '}')
      .replace(/[\x00-\x1F\x7F]/g, (char) => {
        if (char === '\n' || char === '\r' || char === '\t') return char
        return ''
      })

    itinerary = JSON.parse(jsonString)
  } catch (error) {
    console.error('解析 AI 响应失败:', error)
    console.error('原始响应:', content)
    throw new Error('解析 AI 响应失败，请重试')
  }

  if (!itinerary.summary || !itinerary.dailySchedule || !itinerary.budgetBreakdown) {
    console.error('AI 响应格式不正确:', itinerary)
    throw new Error('AI 响应格式不正确，请重试')
  }

  return itinerary
}
