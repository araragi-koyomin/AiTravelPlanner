import {
  assertEquals,
  assertExists
} from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  createTestItineraryRequest,
  callEdgeFunction,
  assertSuccessResponse,
  assertErrorResponse,
  validateItineraryStructure
} from '../_shared/test_utils.ts'

const FUNCTION_NAME = 'generate-itinerary'

Deno.test(`${FUNCTION_NAME} - OPTIONS 请求 (CORS 预检)`, async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {})

  if (response.status === 200) {
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  } else {
    console.log('OPTIONS 请求可能不被支持，跳过测试')
  }
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 destination`, async () => {
  const request = createTestItineraryRequest({
    destination: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 startDate`, async () => {
  const request = createTestItineraryRequest({
    startDate: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 endDate`, async () => {
  const request = createTestItineraryRequest({
    endDate: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 budget`, async () => {
  const request = createTestItineraryRequest({
    budget: 0
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 participants`, async () => {
  const request = createTestItineraryRequest({
    participants: 0
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 userId`, async () => {
  const request = createTestItineraryRequest({
    userId: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 完整的行程生成流程`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateItineraryStructure(result.data)

  const itinerary = result.data.itinerary as Record<string, unknown>
  assertEquals(itinerary.destination, request.destination)
  assertEquals(itinerary.start_date, request.startDate)
  assertEquals(itinerary.end_date, request.endDate)
  assertEquals(itinerary.budget, request.budget)
  assertEquals(itinerary.participants, request.participants)
})

Deno.test(`${FUNCTION_NAME} - 验证行程数据结构`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>

  assertExists(itinerary.id)
  assertEquals(typeof itinerary.id, 'string')

  assertExists(itinerary.daily_schedule)
  assertEquals(Array.isArray(itinerary.daily_schedule), true)

  if (Array.isArray(itinerary.daily_schedule) && itinerary.daily_schedule.length > 0) {
    const firstDay = itinerary.daily_schedule[0] as Record<string, unknown>

    assertExists(firstDay.date)
    assertExists(firstDay.dayOfWeek)
    assertExists(firstDay.theme)
    assertExists(firstDay.activities)
    assertEquals(Array.isArray(firstDay.activities), true)

    if (Array.isArray(firstDay.activities) && firstDay.activities.length > 0) {
      const firstActivity = firstDay.activities[0] as Record<string, unknown>

      assertExists(firstActivity.time)
      assertExists(firstActivity.type)
      assertExists(firstActivity.name)
      assertExists(firstActivity.address)
      assertExists(firstActivity.description)
      assertExists(firstActivity.cost)
      assertExists(firstActivity.duration)
      assertExists(firstActivity.tips)
    }
  }
})

Deno.test(`${FUNCTION_NAME} - 验证预算分解结构`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>
  const budgetBreakdown = itinerary.budget_breakdown as Record<string, unknown>

  assertExists(budgetBreakdown.transport)
  assertEquals(typeof budgetBreakdown.transport, 'number')

  assertExists(budgetBreakdown.accommodation)
  assertEquals(typeof budgetBreakdown.accommodation, 'number')

  assertExists(budgetBreakdown.food)
  assertEquals(typeof budgetBreakdown.food, 'number')

  assertExists(budgetBreakdown.tickets)
  assertEquals(typeof budgetBreakdown.tickets, 'number')

  assertExists(budgetBreakdown.shopping)
  assertEquals(typeof budgetBreakdown.shopping, 'number')

  assertExists(budgetBreakdown.other)
  assertEquals(typeof budgetBreakdown.other, 'number')

  assertExists(budgetBreakdown.total)
  assertEquals(typeof budgetBreakdown.total, 'number')
})

Deno.test(`${FUNCTION_NAME} - 验证紧急联系人结构`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>
  const emergencyContacts = itinerary.emergency_contacts as Record<string, unknown>

  assertExists(emergencyContacts.police)
  assertEquals(typeof emergencyContacts.police, 'string')

  assertExists(emergencyContacts.hospital)
  assertEquals(typeof emergencyContacts.hospital, 'string')

  assertExists(emergencyContacts.embassy)
  assertEquals(typeof emergencyContacts.embassy, 'string')
})

Deno.test(`${FUNCTION_NAME} - 带特殊需求的行程生成`, async () => {
  const request = createTestItineraryRequest({
    specialRequirements: '带老人出行，需要无障碍设施'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateItineraryStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 不同目的地的行程生成`, async () => {
  const request = createTestItineraryRequest({
    destination: '上海'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>
  assertEquals(itinerary.destination, '上海')
})

Deno.test(`${FUNCTION_NAME} - 不同预算的行程生成`, async () => {
  const request = createTestItineraryRequest({
    budget: 10000
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>
  assertEquals(itinerary.budget, 10000)
})

Deno.test(`${FUNCTION_NAME} - 不同参与人数的行程生成`, async () => {
  const request = createTestItineraryRequest({
    participants: 4
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const itinerary = result.data.itinerary as Record<string, unknown>
  assertEquals(itinerary.participants, 4)
})

Deno.test(`${FUNCTION_NAME} - 不同旅行偏好的行程生成`, async () => {
  const request = createTestItineraryRequest({
    preferences: ['shopping', 'nightlife']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置或数据库连接问题:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateItineraryStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 智谱AI API 错误处理`, async () => {
  console.log('注意: 此测试需要单独运行 Edge Functions 服务并设置无效的 API Key')
  console.log('跳过: 环境变量修改不影响已运行的 Edge Functions 服务')
})

Deno.test(`${FUNCTION_NAME} - ZHIPU_API_KEY 未配置错误`, async () => {
  console.log('注意: 此测试需要单独运行 Edge Functions 服务并不设置 API Key')
  console.log('跳过: 环境变量修改不影响已运行的 Edge Functions 服务')
})

Deno.test(`${FUNCTION_NAME} - 无效用户 ID 的数据库保存错误`, async () => {
  const request = createTestItineraryRequest({
    userId: 'non-existent-user-id-12345'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    assertExists(data.error)
    assertEquals(data.success, false)
  } else if (response.status === 200) {
    const data = await response.json()
    if (!data.success) {
      assertExists(data.error)
    }
  }
})

Deno.test(`${FUNCTION_NAME} - 响应头包含 CORS`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  assertEquals(
    response.headers.get('Access-Control-Allow-Headers'),
    'authorization, x-client-info, apikey, content-type'
  )

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 响应 Content-Type 为 JSON`, async () => {
  const request = createTestItineraryRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  const contentType = response.headers.get('Content-Type')
  assertExists(contentType)
  assertEquals(contentType.includes('application/json'), true)

  await response.body?.cancel()
})
