import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

interface Itinerary {
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
  optimizationNotes?: string
}

interface OptimizeItineraryRequest {
  originalItinerary: Itinerary
  userFeedback: string
  optimizationGoals: string[]
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: OptimizeItineraryRequest = await req.json()
    const { originalItinerary, userFeedback, optimizationGoals } = data

    if (!originalItinerary || !userFeedback) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少必填字段'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const optimizedItinerary = await optimizeItinerary({
      originalItinerary,
      userFeedback,
      optimizationGoals: optimizationGoals || []
    })

    return new Response(
      JSON.stringify({
        success: true,
        itinerary: optimizedItinerary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('优化行程失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '优化行程失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateOptimizationPrompt(params: {
  originalItinerary: Itinerary
  userFeedback: string
  optimizationGoals: string[]
}): string {
  const { originalItinerary, userFeedback, optimizationGoals } = params

  const goalsText = optimizationGoals.length > 0
    ? optimizationGoals.map(goal => `- ${goal}`).join('\n')
    : '- 根据用户反馈进行优化'

  return `你是一个专业的旅行规划师，擅长优化旅行计划。

## 任务
根据用户的反馈，优化现有的旅行计划。

## 原始行程计划
\`\`\`json
${JSON.stringify(originalItinerary, null, 2)}
\`\`\`

## 用户反馈
${userFeedback}

## 优化目标
${goalsText}

## 输出要求
请以 JSON 格式返回优化后的旅行计划，格式与原始行程计划相同：

\`\`\`json
{
  "summary": { ... },
  "dailySchedule": [ ... ],
  "budgetBreakdown": { ... },
  "tips": [ ... ],
  "emergencyContacts": { ... },
  "optimizationNotes": "优化说明，解释为什么这样修改"
}
\`\`\`

## 约束条件
1. 保持行程的核心体验不变
2. 根据用户反馈进行针对性优化
3. 确保优化后的行程更加合理
4. 控制预算在用户可接受范围内
5. 提供优化说明，解释为什么这样修改

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

async function optimizeItinerary(params: {
  originalItinerary: Itinerary
  userFeedback: string
  optimizationGoals: string[]
}): Promise<Itinerary> {
  const prompt = generateOptimizationPrompt(params)

  console.log('开始调用智谱 AI...')
  const response = await callZhipuAI(prompt)
  console.log('智谱 AI 调用完成')

  const content = response.choices[0].message.content
  console.log('AI 响应内容长度:', content?.length || 0)
  console.log('AI 响应前 500 字符:', content?.substring(0, 500))

  let optimizedItinerary: Itinerary
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

    optimizedItinerary = JSON.parse(jsonString)
  } catch (error) {
    console.error('解析 AI 响应失败:', error)
    console.error('原始响应:', content)
    throw new Error('解析 AI 响应失败，请重试')
  }

  if (!optimizedItinerary.summary || !optimizedItinerary.dailySchedule || !optimizedItinerary.budgetBreakdown) {
    console.error('AI 响应格式不正确:', optimizedItinerary)
    throw new Error('AI 响应格式不正确，请重试')
  }

  return optimizedItinerary
}
