import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface AnalyzeBudgetRequest {
  destination: string
  startDate: string
  endDate: string
  totalBudget: number
  participants: number
  preferences: string[]
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

interface BudgetDetail {
  item: string
  cost: number
  description: string
}

interface BudgetCategory {
  amount: number
  percentage: number
  details: BudgetDetail[]
}

interface DailyBudgetBreakdown {
  transport: number
  food: number
  tickets: number
  other: number
}

interface DailyBudget {
  date: string
  dayOfWeek: string
  budget: number
  breakdown: DailyBudgetBreakdown
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high'
  factors: string[]
  mitigation: string[]
}

interface BudgetAnalysisResult {
  summary: {
    totalBudget: number
    participants: number
    days: number
    budgetPerDay: number
    budgetPerPerson: number
  }
  breakdown: {
    transport: BudgetCategory
    accommodation: BudgetCategory
    food: BudgetCategory
    tickets: BudgetCategory
    shopping: BudgetCategory
    other: BudgetCategory
  }
  dailyBudget: DailyBudget[]
  suggestions: string[]
  riskAssessment: RiskAssessment
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: AnalyzeBudgetRequest = await req.json()
    const { destination, startDate, endDate, totalBudget, participants, preferences } = data

    if (!destination || !startDate || !endDate || !totalBudget || !participants) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '缺少必填字段'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const budgetAnalysis = await analyzeBudget({
      destination,
      startDate,
      endDate,
      totalBudget,
      participants,
      preferences: preferences || []
    })

    return new Response(
      JSON.stringify({
        success: true,
        budgetAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('分析预算失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '分析预算失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateBudgetAnalysisPrompt(params: {
  destination: string
  startDate: string
  endDate: string
  totalBudget: number
  participants: number
  preferences: string[]
}): string {
  const { destination, startDate, endDate, totalBudget, participants, preferences } = params

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

  return `你是一个专业的旅行预算分析师，擅长计算和分析旅行预算。

## 任务
根据用户的旅行计划，计算详细的预算分配。

## 输入信息
- 目的地：${destination}
- 出发日期：${startDate}
- 返回日期：${endDate}
- 总预算：${totalBudget} 元
- 参与人数：${participants} 人
- 旅行偏好：${preferenceText}

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
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
    },
    "food": {
      "amount": 餐饮费用,
      "percentage": 百分比,
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
    },
    "tickets": {
      "amount": 门票费用,
      "percentage": 百分比,
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
    },
    "shopping": {
      "amount": 购物费用,
      "percentage": 百分比,
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
    },
    "other": {
      "amount": 其他费用,
      "percentage": 百分比,
      "details": [
        {
          "item": "项目",
          "cost": 费用,
          "description": "说明"
        }
      ]
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
            content: '你是旅行预算分析师，只返回JSON格式结果。'
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

async function analyzeBudget(params: {
  destination: string
  startDate: string
  endDate: string
  totalBudget: number
  participants: number
  preferences: string[]
}): Promise<BudgetAnalysisResult> {
  const prompt = generateBudgetAnalysisPrompt(params)

  console.log('开始调用智谱 AI...')
  const response = await callZhipuAI(prompt)
  console.log('智谱 AI 调用完成')

  const content = response.choices[0].message.content
  console.log('AI 响应内容长度:', content?.length || 0)
  console.log('AI 响应前 500 字符:', content?.substring(0, 500))

  let budgetAnalysis: BudgetAnalysisResult
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

    budgetAnalysis = JSON.parse(jsonString)
  } catch (error) {
    console.error('解析 AI 响应失败:', error)
    console.error('原始响应:', content)
    throw new Error('解析 AI 响应失败，请重试')
  }

  if (!budgetAnalysis.summary || !budgetAnalysis.breakdown) {
    console.error('AI 响应格式不正确:', budgetAnalysis)
    throw new Error('AI 响应格式不正确，请重试')
  }

  return budgetAnalysis
}
