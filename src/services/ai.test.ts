import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateItinerary,
  optimizeItinerary,
  getRecommendations,
  analyzeBudget,
  AIServiceError,
  isAIServiceError,
  getAIErrorMessage,
  type GenerateItineraryParams,
  type OptimizeItineraryParams,
  type GetRecommendationsParams,
  type AnalyzeBudgetParams
} from './ai'
import { supabase } from './supabase'
import { TravelPreference } from '@/types/itinerary'

class MockFunctionsHttpError extends Error {
  context: { json: () => Promise<Record<string, unknown>> }
  constructor(public details: Record<string, unknown>) {
    super(details.message as string || 'FunctionsHttpError')
    this.name = 'FunctionsHttpError'
    this.context = {
      json: () => Promise.resolve(details)
    }
  }
}

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    }
  }
}))

vi.mock('@supabase/supabase-js', () => ({
  FunctionsHttpError: class FunctionsHttpError extends Error {
    context: { json: () => Promise<Record<string, unknown>> }
    constructor(public details: Record<string, unknown>) {
      super(details.message as string || 'FunctionsHttpError')
      this.name = 'FunctionsHttpError'
      this.context = {
        json: () => Promise.resolve(details)
      }
    }
  }
}))

const createMockSession = () => ({
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer' as const,
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z'
  }
})

const createMockItinerary = () => ({
  id: 'test-itinerary-id',
  user_id: 'test-user-id',
  destination: '北京',
  start_date: '2026-04-01',
  end_date: '2026-04-03',
  budget: 5000,
  participants: 2,
  preferences: ['attraction', 'food'],
  special_requirements: null,
  daily_schedule: [
    {
      day: 1,
      date: '2026-04-01',
      dayOfWeek: '星期三',
      theme: '故宫一日游',
      activities: [
        {
          time: '09:00',
          type: 'attraction' as const,
          name: '故宫博物院',
          location: {
            address: '北京市东城区景山前街4号',
            lat: 39.9163,
            lng: 116.3972
          },
          description: '中国古代皇家宫殿',
          cost: 60,
          duration: 180,
          tips: '建议提前预约'
        }
      ]
    }
  ],
  budget_breakdown: {
    transport: 1000,
    accommodation: 2000,
    food: 1000,
    tickets: 300,
    shopping: 200,
    entertainment: 0,
    other: 0,
    total: 4500
  },
  tips: ['建议穿舒适的鞋子', '带好身份证'],
  emergency_contacts: {
    police: '110',
    hospital: '120',
    embassy: '010-12345678'
  },
  status: 'draft',
  created_at: '2026-03-16T00:00:00Z',
  updated_at: '2026-03-16T00:00:00Z'
})

const createMockAIItineraryResponse = () => ({
  summary: {
    destination: '北京',
    duration: '3天',
    totalBudget: 5000,
    participants: 2,
    estimatedCost: 4500
  },
  dailySchedule: [
    {
      day: 1,
      date: '2026-04-01',
      dayOfWeek: '星期三',
      theme: '故宫一日游',
      activities: [
        {
          time: '09:00',
          type: 'attraction' as const,
          name: '故宫博物院',
          location: {
            address: '北京市东城区景山前街4号',
            lat: 39.9163,
            lng: 116.3972
          },
          description: '中国古代皇家宫殿',
          cost: 60,
          duration: 180,
          tips: '建议提前预约'
        }
      ]
    }
  ],
  budgetBreakdown: {
    transport: 1000,
    accommodation: 2000,
    food: 1000,
    tickets: 300,
    shopping: 200,
    entertainment: 0,
    other: 0,
    total: 4500
  },
  tips: ['建议穿舒适的鞋子', '带好身份证'],
  emergencyContacts: {
    police: '110',
    hospital: '120',
    embassy: '010-12345678'
  }
})

const createMockRecommendations = () => ({
  recommendations: [
    {
      name: '故宫博物院',
      type: 'cultural',
      description: '中国古代皇家宫殿',
      address: '北京市东城区景山前街4号',
      latitude: 39.9163,
      longitude: 116.3972,
      openingHours: '08:30-17:00',
      ticketPrice: 60,
      recommendedDuration: 3,
      bestTimeToVisit: '上午',
      tips: ['建议提前预约', '周一闭馆'],
      matchScore: 0.95
    }
  ],
  itinerarySuggestions: [
    {
      day: 1,
      attractions: ['故宫博物院', '天安门广场', '景山公园'],
      route: '从天安门广场开始，游览故宫，最后登景山公园俯瞰故宫全景'
    }
  ]
})

const createMockBudgetAnalysis = () => ({
  summary: {
    totalBudget: 5000,
    participants: 2,
    days: 3,
    budgetPerDay: 1666.67,
    budgetPerPerson: 2500
  },
  breakdown: {
    transport: {
      amount: 1000,
      percentage: 20,
      details: [
        { item: '往返机票', cost: 800, description: '经济舱' },
        { item: '市内交通', cost: 200, description: '地铁和公交' }
      ]
    },
    accommodation: {
      amount: 2000,
      percentage: 40,
      details: [
        { item: '酒店住宿', cost: 2000, description: '三星级酒店2晚' }
      ]
    },
    food: {
      amount: 1000,
      percentage: 20,
      details: [
        { item: '餐饮', cost: 1000, description: '每日三餐' }
      ]
    },
    tickets: {
      amount: 300,
      percentage: 6,
      details: [
        { item: '景点门票', cost: 300, description: '主要景点门票' }
      ]
    },
    shopping: {
      amount: 200,
      percentage: 4,
      details: [
        { item: '纪念品', cost: 200, description: '特产和纪念品' }
      ]
    },
    other: {
      amount: 500,
      percentage: 10,
      details: [
        { item: '应急资金', cost: 500, description: '预留应急资金' }
      ]
    }
  },
  dailyBudget: [
    {
      date: '2026-04-01',
      dayOfWeek: '星期三',
      budget: 1500,
      breakdown: {
        transport: 100,
        food: 300,
        tickets: 200,
        other: 100
      }
    }
  ],
  suggestions: [
    '建议提前预订酒店可以节省费用',
    '使用公共交通工具更加经济实惠'
  ],
  riskAssessment: {
    level: 'low' as const,
    factors: ['预算充足'],
    mitigation: ['预留应急资金']
  }
})

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateItinerary', () => {
    const validParams: GenerateItineraryParams = {
      destination: '北京',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      budget: 5000,
      participants: 2,
      preferences: [TravelPreference.ATTRACTION, TravelPreference.FOOD],
      userId: 'test-user-id'
    }

    it('应该成功生成行程', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockItinerary = createMockItinerary()
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          itinerary: mockItinerary
        },
        error: null
      })

      const result = await generateItinerary(validParams)

      expect(result.success).toBe(true)
      expect(result.itinerary).toBeDefined()
      expect(result.itinerary?.id).toBe('test-itinerary-id')
      expect(result.itinerary?.destination).toBe('北京')
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'generate-itinerary',
        { body: validParams }
      )
    })

    it('应该正确传递所有参数', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const paramsWithSpecialRequirements: GenerateItineraryParams = {
        ...validParams,
        specialRequirements: '带老人出行'
      }

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          itinerary: createMockItinerary()
        },
        error: null
      })

      await generateItinerary(paramsWithSpecialRequirements)

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'generate-itinerary',
        { body: paramsWithSpecialRequirements }
      )
    })

    it('应该处理 Edge Function 返回的错误', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockError = new Error('Edge Function error')
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(generateItinerary(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理 FunctionsHttpError', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const mockHttpError = new MockFunctionsHttpError({
        message: 'HTTP error',
        error: '自定义错误消息'
      })

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockHttpError as unknown as Error
      })

      await expect(generateItinerary(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理 Edge Function 返回 success: false', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          error: '智谱AI API 错误'
        },
        error: null
      })

      await expect(generateItinerary(validParams)).rejects.toThrow('智谱AI API 错误')
    })

    it('应该处理缺少必填字段错误', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          error: '缺少必填字段'
        },
        error: null
      })

      await expect(generateItinerary(validParams)).rejects.toThrow('缺少必填字段')
    })

    it('应该处理网络错误', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      )

      await expect(generateItinerary(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理未知错误', async () => {
      const mockSession = createMockSession()
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      vi.mocked(supabase.functions.invoke).mockRejectedValue('Unknown error')

      await expect(generateItinerary(validParams)).rejects.toThrow(AIServiceError)
    })
  })

  describe('optimizeItinerary', () => {
    const validParams: OptimizeItineraryParams = {
      originalItinerary: createMockAIItineraryResponse(),
      userFeedback: '希望增加更多美食体验',
      optimizationGoals: ['增加美食体验', '控制预算']
    }

    it('应该成功优化行程', async () => {
      const optimizedItinerary = createMockAIItineraryResponse()

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          itinerary: optimizedItinerary
        },
        error: null
      })

      const result = await optimizeItinerary(validParams)

      expect(result.success).toBe(true)
      expect(result.itinerary).toBeDefined()
      expect(result.itinerary?.summary.destination).toBe('北京')
    })

    it('应该正确传递优化参数', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          itinerary: createMockAIItineraryResponse()
        },
        error: null
      })

      await optimizeItinerary(validParams)

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'optimize-itinerary',
        { body: validParams }
      )
    })

    it('应该处理优化错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('优化行程失败')
      })

      await expect(optimizeItinerary(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理缺少必填字段错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          error: '缺少必填字段'
        },
        error: null
      })

      const result = await optimizeItinerary(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('缺少必填字段')
    })

    it('应该处理网络错误', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      )

      await expect(optimizeItinerary(validParams)).rejects.toThrow(AIServiceError)
    })
  })

  describe('getRecommendations', () => {
    const validParams: GetRecommendationsParams = {
      destination: '北京',
      travelDates: '2026-04-01 至 2026-04-03',
      preferences: ['attraction', 'food'],
      budget: 5000,
      participants: 2
    }

    it('应该成功获取推荐', async () => {
      const mockRecommendations = createMockRecommendations()

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          recommendations: mockRecommendations
        },
        error: null
      })

      const result = await getRecommendations(validParams)

      expect(result.success).toBe(true)
      expect(result.recommendations).toBeDefined()
      expect(result.recommendations?.recommendations).toHaveLength(1)
      expect(result.recommendations?.recommendations[0].name).toBe('故宫博物院')
    })

    it('应该正确传递推荐参数', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          recommendations: createMockRecommendations()
        },
        error: null
      })

      await getRecommendations(validParams)

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'get-recommendations',
        { body: validParams }
      )
    })

    it('应该处理获取推荐错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('获取推荐失败')
      })

      await expect(getRecommendations(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理缺少必填字段错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          error: '缺少必填字段'
        },
        error: null
      })

      const result = await getRecommendations(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('缺少必填字段')
    })

    it('应该处理网络错误', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      )

      await expect(getRecommendations(validParams)).rejects.toThrow(AIServiceError)
    })
  })

  describe('analyzeBudget', () => {
    const validParams: AnalyzeBudgetParams = {
      destination: '北京',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      totalBudget: 5000,
      participants: 2,
      preferences: ['attraction', 'food']
    }

    it('应该成功分析预算', async () => {
      const mockBudgetAnalysis = createMockBudgetAnalysis()

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          budgetAnalysis: mockBudgetAnalysis
        },
        error: null
      })

      const result = await analyzeBudget(validParams)

      expect(result.success).toBe(true)
      expect(result.budgetAnalysis).toBeDefined()
      expect(result.budgetAnalysis?.summary.totalBudget).toBe(5000)
      expect(result.budgetAnalysis?.summary.participants).toBe(2)
      expect(result.budgetAnalysis?.riskAssessment.level).toBe('low')
    })

    it('应该正确传递预算分析参数', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          budgetAnalysis: createMockBudgetAnalysis()
        },
        error: null
      })

      await analyzeBudget(validParams)

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'analyze-budget',
        { body: validParams }
      )
    })

    it('应该处理预算分析错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('分析预算失败')
      })

      await expect(analyzeBudget(validParams)).rejects.toThrow(AIServiceError)
    })

    it('应该处理缺少必填字段错误', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          error: '缺少必填字段'
        },
        error: null
      })

      const result = await analyzeBudget(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('缺少必填字段')
    })

    it('应该处理网络错误', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      )

      await expect(analyzeBudget(validParams)).rejects.toThrow(AIServiceError)
    })
  })

  describe('AIServiceError', () => {
    it('应该正确创建 AIServiceError', () => {
      const error = new AIServiceError('测试错误', 'TEST_CODE')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('AIServiceError')
      expect(error.message).toBe('测试错误')
      expect(error.code).toBe('TEST_CODE')
    })

    it('应该允许不传递 code 参数', () => {
      const error = new AIServiceError('测试错误')

      expect(error.message).toBe('测试错误')
      expect(error.code).toBeUndefined()
    })
  })

  describe('isAIServiceError', () => {
    it('应该正确识别 AIServiceError', () => {
      const error = new AIServiceError('测试错误')

      expect(isAIServiceError(error)).toBe(true)
    })

    it('应该正确识别非 AIServiceError', () => {
      const error = new Error('普通错误')

      expect(isAIServiceError(error)).toBe(false)
    })

    it('应该正确识别 null', () => {
      expect(isAIServiceError(null)).toBe(false)
    })

    it('应该正确识别 undefined', () => {
      expect(isAIServiceError(undefined)).toBe(false)
    })

    it('应该正确识别字符串', () => {
      expect(isAIServiceError('错误')).toBe(false)
    })
  })

  describe('getAIErrorMessage', () => {
    it('应该从 AIServiceError 获取错误消息', () => {
      const error = new AIServiceError('AI 服务错误')

      expect(getAIErrorMessage(error)).toBe('AI 服务错误')
    })

    it('应该从普通 Error 获取错误消息', () => {
      const error = new Error('普通错误')

      expect(getAIErrorMessage(error)).toBe('普通错误')
    })

    it('应该处理 null', () => {
      expect(getAIErrorMessage(null)).toBe('未知错误')
    })

    it('应该处理 undefined', () => {
      expect(getAIErrorMessage(undefined)).toBe('未知错误')
    })

    it('应该处理字符串', () => {
      expect(getAIErrorMessage('错误')).toBe('未知错误')
    })

    it('应该处理对象', () => {
      expect(getAIErrorMessage({})).toBe('未知错误')
    })
  })
})
