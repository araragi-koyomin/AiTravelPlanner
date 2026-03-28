import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface TransportRequest {
  origin: {
    name: string
    lat: number
    lng: number
  }
  destination: {
    name: string
    lat: number
    lng: number
  }
  budget?: number
  specialNeeds?: string[]
  travelersType?: string
  participants?: number
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

interface TransportRecommendation {
  mode: 'walking' | 'driving' | 'transit' | 'riding'
  reason: string
  estimatedCost: number
  estimatedDuration: number
  distance: number
  priority: number
}

const SYSTEM_PROMPT = `你是一个专业的旅行交通顾问。你需要根据起点、终点、预算、特殊需求等因素，推荐最合适的交通方式。

你需要返回一个 JSON 对象，包含推荐的交通方式列表，按优先级排序。

返回格式：
{
  "recommendations": [
    {
      "mode": "walking|driving|transit|riding",
      "reason": "推荐理由",
      "estimatedCost": 预估费用（元）,
      "estimatedDuration": 预估时间（分钟）,
      "distance": 预估距离（米）,
      "priority": 优先级（1-4，1最高）
    }
  ],
  "summary": "整体交通建议摘要"
}

交通方式说明：
- walking: 步行，适合短距离（1-2公里内），免费，健康环保
- driving: 驾车/打车，适合中长距离，灵活但费用较高
- transit: 公交/地铁，适合城市内出行，经济实惠
- riding: 骑行，适合中短距离（3-5公里），健康环保

考虑因素：
1. 距离：根据起点终点坐标计算
2. 预算：用户预算限制
3. 特殊需求：如老人、小孩、无障碍设施等
4. 出行类型：独自旅行、家庭出游、商务出行等
5. 参与人数：影响交通方式选择`

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

    let data: TransportRequest
    try {
      data = JSON.parse(bodyText)
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: '请求体 JSON 格式无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { origin, destination, budget, specialNeeds, travelersType, participants } = data

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少起点或终点坐标' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const distance = calculateDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    )

    const prompt = buildTransportPrompt({
      origin,
      destination,
      distance,
      budget,
      specialNeeds,
      travelersType,
      participants
    })

    const aiResponse = await callZhipuAI(prompt)
    const recommendations = parseAIResponse(aiResponse, distance)

    return new Response(
      JSON.stringify({
        success: true,
        distance,
        recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('推荐交通方式失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '推荐交通方式失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

function buildTransportPrompt(params: {
  origin: TransportRequest['origin']
  destination: TransportRequest['destination']
  distance: number
  budget?: number
  specialNeeds?: string[]
  travelersType?: string
  participants?: number
}): string {
  const { origin, destination, distance, budget, specialNeeds, travelersType, participants } = params

  const distanceKm = (distance / 1000).toFixed(2)

  let prompt = `请推荐从"${origin.name}"到"${destination.name}"的交通方式。

距离：约 ${distanceKm} 公里
`

  if (budget) {
    prompt += `预算：${budget} 元\n`
  }

  if (specialNeeds && specialNeeds.length > 0) {
    prompt += `特殊需求：${specialNeeds.join('、')}\n`
  }

  if (travelersType) {
    const typeLabels: Record<string, string> = {
      'adult': '成人出行',
      'family': '亲子游',
      'couple': '情侣出游',
      'friends': '朋友结伴',
      'solo': '独自旅行',
      'business': '商务出行'
    }
    prompt += `出行类型：${typeLabels[travelersType] || travelersType}\n`
  }

  if (participants && participants > 1) {
    prompt += `参与人数：${participants} 人\n`
  }

  prompt += `\n请根据以上信息，推荐最合适的交通方式。`

  return prompt
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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1024,
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

function parseAIResponse(content: string, distance: number): TransportRecommendation[] {
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

  try {
    const parsed = JSON.parse(jsonStr)
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations.map((rec: TransportRecommendation) => ({
        ...rec,
        distance: rec.distance || distance
      }))
    }
  } catch (e) {
    console.error('JSON 解析失败:', e)
  }

  return getDefaultRecommendations(distance)
}

function getDefaultRecommendations(distance: number): TransportRecommendation[] {
  const recommendations: TransportRecommendation[] = []

  if (distance <= 2000) {
    recommendations.push({
      mode: 'walking',
      reason: '距离较近，步行约需' + Math.round(distance / 80) + '分钟',
      estimatedCost: 0,
      estimatedDuration: Math.round(distance / 80),
      distance,
      priority: 1
    })
  }

  if (distance <= 5000) {
    recommendations.push({
      mode: 'riding',
      reason: '适合骑行，约需' + Math.round(distance / 250) + '分钟',
      estimatedCost: 0,
      estimatedDuration: Math.round(distance / 250),
      distance,
      priority: distance <= 2000 ? 2 : 1
    })
  }

  recommendations.push({
    mode: 'transit',
    reason: '公共交通，经济实惠',
    estimatedCost: Math.round(distance / 1000) * 2,
    estimatedDuration: Math.round(distance / 333) + 15,
    distance,
    priority: distance > 5000 ? 1 : 2
  })

  recommendations.push({
    mode: 'driving',
    reason: '打车出行，灵活便捷',
    estimatedCost: Math.round(distance / 1000) * 3 + 10,
    estimatedDuration: Math.round(distance / 400),
    distance,
    priority: 3
  })

  return recommendations.sort((a, b) => a.priority - b.priority)
}
