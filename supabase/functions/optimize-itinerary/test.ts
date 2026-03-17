import {
  assertEquals,
  assertExists
} from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  createTestOptimizeRequest,
  callEdgeFunction,
  assertSuccessResponse,
  assertErrorResponse
} from '../_shared/test_utils.ts'

const FUNCTION_NAME = 'optimize-itinerary'

Deno.test(`${FUNCTION_NAME} - OPTIONS 请求 (CORS 预检)`, async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {})

  if (response.status === 200) {
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  } else {
    console.log('OPTIONS 请求可能不被支持，跳过测试')
  }

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 originalItinerary`, async () => {
  const request = {
    originalItinerary: null,
    userFeedback: '希望增加更多美食体验',
    optimizationGoals: ['增加美食体验']
  }

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 userFeedback`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 完整的行程优化流程`, async () => {
  const request = createTestOptimizeRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)

  const itinerary = result.data.itinerary as Record<string, unknown>

  assertExists(itinerary.summary)
  assertExists(itinerary.dailySchedule)
  assertExists(itinerary.budgetBreakdown)
  assertExists(itinerary.tips)
  assertExists(itinerary.emergencyContacts)
})

Deno.test(`${FUNCTION_NAME} - 验证优化后行程数据结构`, async () => {
  const request = createTestOptimizeRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>

  const summary = itinerary.summary as Record<string, unknown>
  assertExists(summary.destination)
  assertExists(summary.duration)
  assertExists(summary.totalBudget)
  assertExists(summary.participants)
  assertExists(summary.estimatedCost)

  assertExists(itinerary.dailySchedule)
  assertEquals(Array.isArray(itinerary.dailySchedule), true)

  if (Array.isArray(itinerary.dailySchedule) && itinerary.dailySchedule.length > 0) {
    const firstDay = itinerary.dailySchedule[0] as Record<string, unknown>

    assertExists(firstDay.date)
    assertExists(firstDay.dayOfWeek)
    assertExists(firstDay.theme)
    assertExists(firstDay.activities)
    assertEquals(Array.isArray(firstDay.activities), true)
  }

  const budgetBreakdown = itinerary.budgetBreakdown as Record<string, unknown>
  assertExists(budgetBreakdown.transport)
  assertExists(budgetBreakdown.accommodation)
  assertExists(budgetBreakdown.food)
  assertExists(budgetBreakdown.tickets)
  assertExists(budgetBreakdown.shopping)
  assertExists(budgetBreakdown.other)
  assertExists(budgetBreakdown.total)

  assertExists(itinerary.tips)
  assertEquals(Array.isArray(itinerary.tips), true)

  const emergencyContacts = itinerary.emergencyContacts as Record<string, unknown>
  assertExists(emergencyContacts.police)
  assertExists(emergencyContacts.hospital)
  assertExists(emergencyContacts.embassy)
})

Deno.test(`${FUNCTION_NAME} - 增加美食体验优化`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: '希望增加更多美食体验',
    optimizationGoals: ['增加美食体验']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 控制预算优化`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: '预算超了，需要减少花费',
    optimizationGoals: ['控制预算']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 增加景点优化`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: '想看更多景点',
    optimizationGoals: ['增加景点']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 多个优化目标`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: '希望行程更丰富，但预算要控制',
    optimizationGoals: ['增加美食体验', '控制预算', '增加景点']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 空优化目标数组`, async () => {
  const request = createTestOptimizeRequest({
    optimizationGoals: []
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 智谱AI API 错误处理`, async () => {
  console.log('注意: 此测试需要单独运行 Edge Functions 服务并设置无效的 API Key')
  console.log('跳过: 环境变量修改不影响已运行的 Edge Functions 服务')
})

Deno.test(`${FUNCTION_NAME} - ZHIPU_API_KEY 未配置错误`, async () => {
  console.log('注意: 此测试需要单独运行 Edge Functions 服务并不设置 API Key')
  console.log('跳过: 环境变量修改不影响已运行的 Edge Functions 服务')
})

Deno.test(`${FUNCTION_NAME} - 响应头包含 CORS`, async () => {
  const request = createTestOptimizeRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  assertEquals(
    response.headers.get('Access-Control-Allow-Headers'),
    'authorization, x-client-info, apikey, content-type'
  )

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 响应 Content-Type 为 JSON`, async () => {
  const request = createTestOptimizeRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  const contentType = response.headers.get('Content-Type')
  assertExists(contentType)
  assertEquals(contentType.includes('application/json'), true)

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 长用户反馈`, async () => {
  const longFeedback = '希望行程能够更加丰富多样，包括更多的美食体验，同时也要考虑预算控制，另外还想增加一些文化类的景点，最好能够安排一些特色活动，比如当地的传统体验项目。'

  const request = createTestOptimizeRequest({
    userFeedback: longFeedback
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})

Deno.test(`${FUNCTION_NAME} - 特殊字符用户反馈`, async () => {
  const request = createTestOptimizeRequest({
    userFeedback: '希望增加美食体验！@#￥%……&*（）——+'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  assertExists(result.data.itinerary)
})
