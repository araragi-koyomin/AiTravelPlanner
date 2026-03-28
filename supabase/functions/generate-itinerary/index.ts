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
    const dbActivities = await transformToDbFormat(itinerary, itineraryId, daysCount, destination)
    console.log('POI搜索完成，活动数量:', dbActivities.length, '有效坐标数量:', dbActivities.filter(a => a.location.lat !== 0).length)

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

interface POISearchResult {
  poi_id: string
  name: string
  address: string
  lat: number
  lng: number
  city: string
  district: string
}

function extractCityName(destination: string): string {
  if (!destination) return ''

  const cityMatch = destination.match(/(?:中国)?(.+?)(?:市|省|$)/)
  if (cityMatch && cityMatch[1]) {
    return cityMatch[1].replace(/省$/, '')
  }

  const parts = destination.replace('中国', '').trim().split(/[省市]/)
  return parts[0] || destination
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (lat1 === 0 || lng1 === 0 || lat2 === 0 || lng2 === 0) return Infinity
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getTransportSuggestion(distance: number): string {
  const distanceKm = distance / 1000

  if (distance <= 500) {
    return `步行约${Math.round(distance / 80)}分钟`
  } else if (distance <= 2000) {
    return `步行约${Math.round(distance / 80)}分钟，或骑行约${Math.round(distance / 250)}分钟`
  } else if (distance <= 5000) {
    return `建议打车或地铁，约${Math.round(distance / 400)}分钟，距离${distanceKm.toFixed(1)}公里`
  } else {
    return `建议地铁或打车，约${Math.round(distance / 400)}分钟，距离${distanceKm.toFixed(1)}公里`
  }
}

function optimizeRouteByDay(activities: DbActivity[]): DbActivity[] {
  const dayGroups = new Map<number, DbActivity[]>()
  for (const activity of activities) {
    const dayActivities = dayGroups.get(activity.day) || []
    dayActivities.push(activity)
    dayGroups.set(activity.day, dayActivities)
  }

  const optimizedActivities: DbActivity[] = []

  for (const [day, dayActivities] of dayGroups) {
    if (dayActivities.length <= 1) {
      optimizedActivities.push(...dayActivities)
      continue
    }

    const nonAccommodation = dayActivities.filter(a => a.type !== 'accommodation')
    const accommodations = dayActivities.filter(a => a.type === 'accommodation')

    const result = [...nonAccommodation].sort((a, b) => a.time.localeCompare(b.time))

    for (let i = 0; i < result.length - 1; i++) {
      const current = result[i]
      const next = result[i + 1]

      const distance = calculateDistance(
        current.location.lat, current.location.lng,
        next.location.lat, next.location.lng
      )

      if (distance !== Infinity && distance > 100) {
        const transportInfo = getTransportSuggestion(distance)
        const nextName = next.name || '下一站'

        if (current.tips) {
          current.tips = `${current.tips}\n前往${nextName}：${transportInfo}`
        } else {
          current.tips = `前往${nextName}：${transportInfo}`
        }
      }
    }

    if (accommodations.length > 0 && result.length > 0) {
      const lastActivity = result[result.length - 1]
      const lastHour = parseInt(lastActivity.time.split(':')[0], 10)
      const accommodationHour = Math.max(lastHour + 2, 21)
      accommodations[0].time = `${accommodationHour.toString().padStart(2, '0')}:00`

      const distance = calculateDistance(
        lastActivity.location.lat, lastActivity.location.lng,
        accommodations[0].location.lat, accommodations[0].location.lng
      )

      if (distance !== Infinity && distance > 100) {
        const transportInfo = getTransportSuggestion(distance)
        if (lastActivity.tips) {
          lastActivity.tips = `${lastActivity.tips}\n前往${accommodations[0].name}：${transportInfo}`
        } else {
          lastActivity.tips = `前往${accommodations[0].name}：${transportInfo}`
        }
      }
    }

    result.forEach((activity, index) => {
      activity.order_idx = optimizedActivities.length + index
    })

    optimizedActivities.push(...result)

    accommodations.forEach((activity, index) => {
      activity.order_idx = optimizedActivities.length + index
    })
    optimizedActivities.push(...accommodations)
  }

  return optimizedActivities.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day
    return a.order_idx - b.order_idx
  })
}

async function searchPOI(keywords: string, targetCity: string): Promise<POISearchResult | null> {
  const amapKey = Deno.env.get('AMAP_WEB_API_KEY')
  if (!amapKey || !keywords) {
    return null
  }

  const city = extractCityName(targetCity)
  const enhancedKeywords = `${city}${keywords}`

  console.log('POI搜索:', keywords, '城市:', city, '增强关键词:', enhancedKeywords)

  try {
    const params = new URLSearchParams({
      key: amapKey,
      keywords: enhancedKeywords,
      city: city,
      citylimit: 'true',
      offset: '3',
      page: '1',
      extensions: 'base',
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/place/text?${params.toString()}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      const data = await response.json()
      console.log('POI搜索响应:', keywords, 'status:', data.status, 'pois count:', data.pois?.length || 0, 'info:', data.info || '')

      if (data.status === '1' && data.pois && data.pois.length > 0) {
        for (const poi of data.pois) {
          console.log('检查POI:', poi.name, '城市:', poi.cityname, '位置:', poi.location)

          if (!poi.location || poi.location === '0,0') {
            continue
          }

          const poiCity = (poi.cityname || '').replace('市', '')
          const targetCityName = city.replace('市', '')

          if (poiCity.includes(targetCityName) || targetCityName.includes(poiCity)) {
            const [lng, lat] = poi.location.split(',').map(Number)
            const address = poi.address || `${poi.pname || ''}${poi.cityname || ''}${poi.adname || ''}${poi.name || ''}`

            console.log('POI匹配成功:', poi.name, '->', address, lat, lng)

            return {
              poi_id: poi.id,
              name: poi.name,
              address: address,
              lat,
              lng,
              city: poi.cityname || '',
              district: poi.adname || ''
            }
          }
        }

        console.log('POI搜索结果城市不匹配:', keywords, '目标城市:', city)
      } else {
        console.log('POI搜索无结果:', keywords, 'response:', JSON.stringify(data))
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('POI搜索超时或失败:', keywords, fetchError)
    }
  } catch (error) {
    console.error('POI搜索异常:', keywords, error)
  }

  return null
}

async function searchLocationByName(name: string, destination: string): Promise<LocationData> {
  const poi = await searchPOI(name, destination)
  if (poi) {
    return {
      address: poi.address,
      lat: poi.lat,
      lng: poi.lng,
      poi_id: poi.poi_id,
      city: poi.city,
      district: poi.district
    }
  }

  console.log('POI搜索失败:', name)
  return { address: '', lat: 0, lng: 0 }
}

async function transformToDbFormat(
  itinerary: AIGeneratedItinerary,
  itineraryId: string,
  daysCount: number,
  destination: string
): Promise<DbActivity[]> {
  const activities: DbActivity[] = []
  const locationItems: Array<{
    day: number
    item: AIResponseItem | null
    accommodation: AIAccommodation | null
    orderIndex: number
  }> = []
  let orderIndex = 0

  for (let day = 1; day <= daysCount; day++) {
    const dayItinerary = itinerary.daily_itinerary?.find(d => d.day === day)

    if (dayItinerary?.items) {
      for (const item of dayItinerary.items) {
        locationItems.push({
          day,
          item,
          accommodation: null,
          orderIndex: orderIndex++
        })
      }
    }

    const dayAccommodation = itinerary.accommodation?.find(a => a.day === day)
    if (dayAccommodation && day < daysCount) {
      locationItems.push({
        day,
        item: null,
        accommodation: dayAccommodation,
        orderIndex: orderIndex++
      })
    }
  }

  console.log('开始串行搜索', locationItems.length, '个地点...')

  const enrichedLocations: LocationData[] = []
  for (let i = 0; i < locationItems.length; i++) {
    const { item, accommodation } = locationItems[i]

    let location: LocationData = { address: '', lat: 0, lng: 0 }

    if (item) {
      location = await searchLocationByName(item.title || '', destination)
    } else if (accommodation) {
      location = await searchLocationByName(accommodation.hotel_name || '', destination)
    }

    enrichedLocations.push(location)

    if (i < locationItems.length - 1) {
      await sleep(200)
    }
  }

  const validCount = enrichedLocations.filter(l => l.lat !== 0).length
  console.log('POI搜索完成，总数:', enrichedLocations.length, '有效:', validCount)

  for (let i = 0; i < locationItems.length; i++) {
    const { day, item, accommodation, orderIndex: idx } = locationItems[i]
    const location = enrichedLocations[i]

    if (item) {
      const normalizedType = normalizeActivityType(item.type)
      activities.push({
        itinerary_id: itineraryId,
        day: day,
        time: item.time || '09:00',
        type: normalizedType,
        name: item.title || '未命名活动',
        location,
        description: item.description || '',
        cost: parseCost(item.cost),
        duration: parseDuration(item.duration),
        tips: item.tips || null,
        image_url: null,
        order_idx: idx
      })
    } else if (accommodation) {
      activities.push({
        itinerary_id: itineraryId,
        day: day,
        time: '18:00',
        type: 'accommodation',
        name: accommodation.hotel_name || '住宿',
        location,
        description: `${accommodation.price_range || ''} ${accommodation.features?.join('、') || ''}`.trim(),
        cost: parsePriceRange(accommodation.price_range),
        duration: 0,
        tips: accommodation.booking_tips || null,
        image_url: null,
        order_idx: idx
      })
    }
  }

  console.log('开始路线优化...')
  const optimizedActivities = optimizeRouteByDay(activities)
  console.log('路线优化完成，活动数量:', optimizedActivities.length)

  return optimizedActivities
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
