import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildItineraryPrompt, SYSTEM_PROMPT } from '../_shared/prompts/itinerary.ts'

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

interface LocationData {
  address: string
  lat: number
  lng: number
  poi_id?: string
  city?: string
  district?: string
}

interface AIResponseItem {
  time: string
  type: string
  title: string
  description: string
  location: LocationData | string
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
  theme: string
  items: AIResponseItem[]
}

interface AIAccommodation {
  day: number
  hotel_name: string
  location: LocationData | string
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
  entertainment?: number
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
  day: number
  time: string
  type: ActivityType
  name: string
  location: LocationData
  description: string
  cost: number
  duration: number
  tips: string | null
  image_url: string | null
  order_idx: number
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

    const aiResponse = await callZhipuAI(buildItineraryPrompt({
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
        pace,
        status: 'generated'
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
    const dbActivities = transformToDbFormat(itinerary, itineraryId, daysCount)

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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 8192,
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

  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
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
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  try {
    return JSON.parse(jsonStr) as AIGeneratedItinerary
  } catch (e) {
    console.error('JSON 解析失败:', e)
    console.error('原始内容:', content.substring(0, 500))
    console.error('处理后内容:', jsonStr.substring(0, 500))
    throw new Error('AI 响应格式解析失败，请重试')
  }
}

function parseLocation(location: LocationData | string | undefined): LocationData {
  if (!location) {
    return { address: '', lat: 0, lng: 0 }
  }
  if (typeof location === 'string') {
    return { address: location, lat: 0, lng: 0 }
  }
  return {
    address: location.address || '',
    lat: location.lat || 0,
    lng: location.lng || 0,
    poi_id: location.poi_id,
    city: location.city,
    district: location.district
  }
}

function transformToDbFormat(
  itinerary: AIGeneratedItinerary,
  itineraryId: string,
  daysCount: number
): DbActivity[] {
  const activities: DbActivity[] = []
  let orderIndex = 0

  for (let day = 1; day <= daysCount; day++) {
    const dayItinerary = itinerary.daily_itinerary?.find(d => d.day === day)

    if (dayItinerary?.items) {
      for (const item of dayItinerary.items) {
        const normalizedType = normalizeActivityType(item.type)

        activities.push({
          itinerary_id: itineraryId,
          day: day,
          time: item.time || '09:00',
          type: normalizedType,
          name: item.title || '未命名活动',
          location: parseLocation(item.location),
          description: item.description || '',
          cost: parseCost(item.cost),
          duration: parseDuration(item.duration),
          tips: item.tips || null,
          image_url: null,
          order_idx: orderIndex++
        })
      }
    }

    const dayAccommodation = itinerary.accommodation?.find(a => a.day === day)
    if (dayAccommodation) {
      activities.push({
        itinerary_id: itineraryId,
        day: day,
        time: '18:00',
        type: 'accommodation',
        name: dayAccommodation.hotel_name || '住宿',
        location: parseLocation(dayAccommodation.location),
        description: `${dayAccommodation.price_range || ''} ${dayAccommodation.features?.join('、') || ''}`.trim(),
        cost: parsePriceRange(dayAccommodation.price_range),
        duration: 0,
        tips: dayAccommodation.booking_tips || null,
        image_url: null,
        order_idx: orderIndex++
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
  expense_date: string
  description: string
}> {
  if (!budgetBreakdown) return []

  const categoryMap: Record<string, string> = {
    'transportation': 'transport',
    'accommodation': 'accommodation',
    'food': 'food',
    'tickets': 'ticket',
    'shopping': 'shopping',
    'entertainment': 'entertainment',
    'other': 'other'
  }

  const expenses: Array<{
    itinerary_id: string
    category: string
    amount: number
    expense_date: string
    description: string
  }> = []

  for (const [key, value] of Object.entries(budgetBreakdown)) {
    if (key && value > 0) {
      expenses.push({
        itinerary_id: itineraryId,
        category: categoryMap[key] || 'other',
        amount: value,
        expense_date: startDate,
        description: `${key} 预算`
      })
    }
  }

  return expenses
}
