import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

export interface TestItineraryRequest {
  destination: string
  startDate: string
  endDate: string
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
  userId: string
}

export interface TestOptimizeRequest {
  originalItinerary: {
    summary: {
      destination: string
      duration: string
      totalBudget: number
      participants: number
      estimatedCost: number
    }
    dailySchedule: Array<{
      date: string
      dayOfWeek: string
      theme: string
      activities: Array<{
        time: string
        type: string
        name: string
        address: string
        latitude?: number
        longitude?: number
        description: string
        cost: number
        duration: number
        tips: string
      }>
    }>
    budgetBreakdown: {
      transport: number
      accommodation: number
      food: number
      tickets: number
      shopping: number
      other: number
      total: number
    }
    tips: string[]
    emergencyContacts: {
      police: string
      hospital: string
      embassy: string
    }
  }
  userFeedback: string
  optimizationGoals: string[]
}

export interface TestRecommendationsRequest {
  destination: string
  travelDates: string
  preferences: string[]
  budget: number
  participants: number
}

export interface TestBudgetAnalysisRequest {
  destination: string
  startDate: string
  endDate: string
  totalBudget: number
  participants: number
  preferences: string[]
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('TEST_SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY') || ''

if (!SUPABASE_ANON_KEY) {
  console.warn('警告: 请设置以下环境变量之一: SUPABASE_ANON_KEY, TEST_SUPABASE_ANON_KEY, 或 VITE_SUPABASE_ANON_KEY')
}

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export function createTestItineraryRequest(
  overrides?: Partial<TestItineraryRequest>
): TestItineraryRequest {
  return {
    destination: '北京',
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    budget: 5000,
    participants: 2,
    preferences: ['attraction', 'food'],
    specialRequirements: '无',
    userId: TEST_USER_ID,
    ...overrides
  }
}

export function createTestOptimizeRequest(
  overrides?: Partial<TestOptimizeRequest>
): TestOptimizeRequest {
  return {
    originalItinerary: {
      summary: {
        destination: '北京',
        duration: '3天',
        totalBudget: 5000,
        participants: 2,
        estimatedCost: 4500
      },
      dailySchedule: [
        {
          date: '2026-04-01',
          dayOfWeek: '星期三',
          theme: '故宫一日游',
          activities: [
            {
              time: '09:00',
              type: 'attraction',
              name: '故宫博物院',
              address: '北京市东城区景山前街4号',
              latitude: 39.9163,
              longitude: 116.3972,
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
        other: 0,
        total: 4500
      },
      tips: ['建议穿舒适的鞋子', '带好身份证'],
      emergencyContacts: {
        police: '110',
        hospital: '120',
        embassy: '010-12345678'
      }
    },
    userFeedback: '希望增加更多美食体验',
    optimizationGoals: ['增加美食体验', '控制预算'],
    ...overrides
  }
}

export function createTestRecommendationsRequest(
  overrides?: Partial<TestRecommendationsRequest>
): TestRecommendationsRequest {
  return {
    destination: '北京',
    travelDates: '2026-04-01 至 2026-04-03',
    preferences: ['attraction', 'food'],
    budget: 5000,
    participants: 2,
    ...overrides
  }
}

export function createTestBudgetAnalysisRequest(
  overrides?: Partial<TestBudgetAnalysisRequest>
): TestBudgetAnalysisRequest {
  return {
    destination: '北京',
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    totalBudget: 5000,
    participants: 2,
    preferences: ['attraction', 'food'],
    ...overrides
  }
}

export async function callEdgeFunction(
  functionName: string,
  body: unknown
): Promise<Response> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    }
  )
  return response
}

export async function assertSuccessResponse(response: Response): Promise<{
  success: boolean
  data: Record<string, unknown>
}> {
  assertEquals(response.status, 200)
  const data = await response.json()
  assertEquals(data.success, true)
  return { success: true, data }
}

export async function assertErrorResponse(
  response: Response,
  expectedStatus?: number
): Promise<{
  success: boolean
  error: string
}> {
  if (expectedStatus) {
    assertEquals(response.status, expectedStatus)
  }
  const data = await response.json()
  assertEquals(data.success, false)
  assertExists(data.error)
  return { success: false, error: data.error }
}

export function validateItineraryStructure(data: Record<string, unknown>): void {
  assertExists(data.itinerary)

  const itinerary = data.itinerary as Record<string, unknown>

  assertExists(itinerary.id)
  assertExists(itinerary.destination)
  assertExists(itinerary.start_date)
  assertExists(itinerary.end_date)
  assertExists(itinerary.budget)
  assertExists(itinerary.participants)

  assertExists(itinerary.daily_schedule)
  assertEquals(Array.isArray(itinerary.daily_schedule), true)

  if (Array.isArray(itinerary.daily_schedule) && itinerary.daily_schedule.length > 0) {
    const firstDay = itinerary.daily_schedule[0] as Record<string, unknown>
    assertExists(firstDay.date)
    assertExists(firstDay.dayOfWeek)
    assertExists(firstDay.theme)
    assertExists(firstDay.activities)
  }

  assertExists(itinerary.budget_breakdown)
  const budgetBreakdown = itinerary.budget_breakdown as Record<string, unknown>
  assertExists(budgetBreakdown.transport)
  assertExists(budgetBreakdown.accommodation)
  assertExists(budgetBreakdown.food)
  assertExists(budgetBreakdown.tickets)
  assertExists(budgetBreakdown.shopping)
  assertExists(budgetBreakdown.other)
  assertExists(budgetBreakdown.total)

  assertExists(itinerary.tips)
  assertEquals(Array.isArray(itinerary.tips), true)

  assertExists(itinerary.emergency_contacts)
  const emergencyContacts = itinerary.emergency_contacts as Record<string, unknown>
  assertExists(emergencyContacts.police)
  assertExists(emergencyContacts.hospital)
  assertExists(emergencyContacts.embassy)
}

export function validateRecommendationsStructure(data: Record<string, unknown>): void {
  assertExists(data.recommendations)

  const recommendations = data.recommendations as Record<string, unknown>
  assertExists(recommendations.recommendations)
  assertEquals(Array.isArray(recommendations.recommendations), true)

  if (Array.isArray(recommendations.recommendations) && recommendations.recommendations.length > 0) {
    const firstRecommendation = recommendations.recommendations[0] as Record<string, unknown>
    assertExists(firstRecommendation.name)
    assertExists(firstRecommendation.type)
    assertExists(firstRecommendation.description)
    assertExists(firstRecommendation.address)
    assertExists(firstRecommendation.openingHours)
    assertExists(firstRecommendation.ticketPrice)
    assertExists(firstRecommendation.recommendedDuration)
    assertExists(firstRecommendation.bestTimeToVisit)
    assertExists(firstRecommendation.tips)
    assertExists(firstRecommendation.matchScore)
  }

  assertExists(recommendations.itinerarySuggestions)
  assertEquals(Array.isArray(recommendations.itinerarySuggestions), true)
}

export function validateBudgetAnalysisStructure(data: Record<string, unknown>): void {
  assertExists(data.budgetAnalysis)

  const budgetAnalysis = data.budgetAnalysis as Record<string, unknown>

  assertExists(budgetAnalysis.summary)
  const summary = budgetAnalysis.summary as Record<string, unknown>
  assertExists(summary.totalBudget)
  assertExists(summary.participants)
  assertExists(summary.days)
  assertExists(summary.budgetPerDay)
  assertExists(summary.budgetPerPerson)

  assertExists(budgetAnalysis.breakdown)
  const breakdown = budgetAnalysis.breakdown as Record<string, unknown>
  assertExists(breakdown.transport)
  assertExists(breakdown.accommodation)
  assertExists(breakdown.food)
  assertExists(breakdown.tickets)
  assertExists(breakdown.shopping)
  assertExists(breakdown.other)

  assertExists(budgetAnalysis.dailyBudget)
  assertEquals(Array.isArray(budgetAnalysis.dailyBudget), true)

  assertExists(budgetAnalysis.suggestions)
  assertEquals(Array.isArray(budgetAnalysis.suggestions), true)

  assertExists(budgetAnalysis.riskAssessment)
  const riskAssessment = budgetAnalysis.riskAssessment as Record<string, unknown>
  assertExists(riskAssessment.level)
  assertExists(riskAssessment.factors)
  assertExists(riskAssessment.mitigation)
}
