import { supabase } from './supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'
import type { ItineraryRequest, AIItineraryResponse } from '@/types/itinerary'

export interface GenerateItineraryParams extends ItineraryRequest {
  userId: string
}

export interface OptimizeItineraryParams {
  originalItinerary: AIItineraryResponse
  userFeedback: string
  optimizationGoals: string[]
}

export interface GetRecommendationsParams {
  destination: string
  travelDates: string
  preferences: string[]
  budget: number
  participants: number
}

export interface AnalyzeBudgetParams {
  destination: string
  startDate: string
  endDate: string
  totalBudget: number
  participants: number
  preferences: string[]
}

export interface GenerateItineraryResult {
  success: boolean
  itinerary?: {
    id: string
    user_id: string
    destination: string
    start_date: string
    end_date: string
    budget: number
    participants: number
    preferences: string[]
    special_requirements: string | null
    daily_schedule: AIItineraryResponse['dailySchedule']
    budget_breakdown: AIItineraryResponse['budgetBreakdown']
    tips: string[]
    emergency_contacts: AIItineraryResponse['emergencyContacts']
    status: string
    created_at: string
    updated_at: string
  }
  error?: string
}

export interface OptimizeItineraryResult {
  success: boolean
  itinerary?: AIItineraryResponse
  error?: string
}

export interface GetRecommendationsResult {
  success: boolean
  recommendations?: {
    recommendations: Array<{
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
    }>
    itinerarySuggestions: Array<{
      day: number
      attractions: string[]
      route: string
    }>
  }
  error?: string
}

export interface AnalyzeBudgetResult {
  success: boolean
  budgetAnalysis?: {
    summary: {
      totalBudget: number
      participants: number
      days: number
      budgetPerDay: number
      budgetPerPerson: number
    }
    breakdown: {
      transport: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
      accommodation: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
      food: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
      tickets: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
      shopping: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
      other: { amount: number; percentage: number; details: Array<{ item: string; cost: number; description: string }> }
    }
    dailyBudget: Array<{
      date: string
      dayOfWeek: string
      budget: number
      breakdown: {
        transport: number
        food: number
        tickets: number
        other: number
      }
    }>
    suggestions: string[]
    riskAssessment: {
      level: 'low' | 'medium' | 'high'
      factors: string[]
      mitigation: string[]
    }
  }
  error?: string
}

export class AIServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export async function generateItinerary(
  params: GenerateItineraryParams
): Promise<GenerateItineraryResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('调用 Edge Function 时的 session:', session ? '存在' : '不存在')
    console.log('Access token 前缀:', session?.access_token?.substring(0, 20) + '...')

    const { data, error } = await supabase.functions.invoke('generate-itinerary', {
      body: params
    })

    if (error) {
      console.error('Edge Function 错误详情:', error)
      if (error instanceof FunctionsHttpError) {
        const errorDetails = await error.context.json().catch(() => ({}))
        console.error('Edge Function 错误响应体:', errorDetails)
        throw new AIServiceError(
          errorDetails.error || error.message || '生成行程失败，请稍后重试'
        )
      }
      throw new AIServiceError(`生成行程失败: ${error.message}`)
    }

    if (data && !data.success) {
      console.error('Edge Function 返回失败:', data)
      throw new AIServiceError(data.error || '生成行程失败，请稍后重试')
    }

    return data as GenerateItineraryResult
  } catch (error) {
    console.error('生成行程失败:', error)
    if (error instanceof AIServiceError) {
      throw error
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : '生成行程失败，请稍后重试'
    )
  }
}

export async function optimizeItinerary(
  params: OptimizeItineraryParams
): Promise<OptimizeItineraryResult> {
  try {
    const { data, error } = await supabase.functions.invoke('optimize-itinerary', {
      body: params
    })

    if (error) {
      throw new AIServiceError(`优化行程失败: ${error.message}`, error.code)
    }

    return data as OptimizeItineraryResult
  } catch (error) {
    console.error('优化行程失败:', error)
    if (error instanceof AIServiceError) {
      throw error
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : '优化行程失败，请稍后重试'
    )
  }
}

export async function getRecommendations(
  params: GetRecommendationsParams
): Promise<GetRecommendationsResult> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      body: params
    })

    if (error) {
      throw new AIServiceError(`获取推荐失败: ${error.message}`, error.code)
    }

    return data as GetRecommendationsResult
  } catch (error) {
    console.error('获取推荐失败:', error)
    if (error instanceof AIServiceError) {
      throw error
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : '获取推荐失败，请稍后重试'
    )
  }
}

export async function analyzeBudget(
  params: AnalyzeBudgetParams
): Promise<AnalyzeBudgetResult> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-budget', {
      body: params
    })

    if (error) {
      throw new AIServiceError(`分析预算失败: ${error.message}`, error.code)
    }

    return data as AnalyzeBudgetResult
  } catch (error) {
    console.error('分析预算失败:', error)
    if (error instanceof AIServiceError) {
      throw error
    }
    throw new AIServiceError(
      error instanceof Error ? error.message : '分析预算失败，请稍后重试'
    )
  }
}

export function isAIServiceError(error: unknown): error is AIServiceError {
  return error instanceof AIServiceError
}

export function getAIErrorMessage(error: unknown): string {
  if (isAIServiceError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '未知错误'
}
