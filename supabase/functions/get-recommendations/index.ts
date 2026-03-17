import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface GetRecommendationsRequest {
  destination: string
  travelDates: string
  preferences: string[]
  budget: number
  participants: number
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

interface Recommendation {
  name: string
  type: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  openingHours: string
  ticketPrice: number
  recommendedDuration: number
  bestTimeToVisit: string
  tips: string[]
  matchScore: number
}

interface ItinerarySuggestion {
  day: number
  attractions: string[]
  route: string
}

interface RecommendationsResult {
  recommendations: Recommendation[]
  itinerarySuggestions: ItinerarySuggestion[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: GetRecommendationsRequest = await req.json()
    const { destination, travelDates, preferences, budget, participants } = data

    if (!destination || !travelDates || !budget || !participants) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少必填字段'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const recommendations = await getRecommendations({
      destination,
      travelDates,
      preferences: preferences || [],
      budget,
      participants
    })

    return new Response(
      JSON.stringify({
        success: true,
        recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('获取推荐失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '获取推荐失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateRecommendationPrompt(params: {
  destination: string
  travelDates: string
  preferences: string[]
  budget: number
  participants: number
}): string {
  const { destination, travelDates, preferences, budget, participants } = params

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

  return `你是一个专业的景点推荐师，擅长根据用户偏好推荐合适的景点。

## 任务
根据用户的信息，推荐合适的景点。

## 输入信息
- 目的地：${destination}
- 旅行日期：${travelDates}
- 用户偏好：${preferenceText}
- 预算：${budget} 元
- 参与人数：${participants} 人

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

请直接返回 JSON 格式的结果，不要包含其他说明文字。`
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
            content: '你是景点推荐师，只返回JSON格式结果。'
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

async function getRecommendations(params: {
  destination: string
  travelDates: string
  preferences: string[]
  budget: number
  participants: number
}): Promise<RecommendationsResult> {
  const prompt = generateRecommendationPrompt(params)

  console.log('开始调用智谱 AI...')
  const response = await callZhipuAI(prompt)
  console.log('智谱 AI 调用完成')

  const content = response.choices[0].message.content
  console.log('AI 响应内容长度:', content?.length || 0)
  console.log('AI 响应前 500 字符:', content?.substring(0, 500))

  let recommendations: RecommendationsResult
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

    recommendations = JSON.parse(jsonString)
  } catch (error) {
    console.error('解析 AI 响应失败:', error)
    console.error('原始响应:', content)
    throw new Error('解析 AI 响应失败，请重试')
  }

  if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
    console.error('AI 响应格式不正确:', recommendations)
    throw new Error('AI 响应格式不正确，请重试')
  }

  return recommendations
}
