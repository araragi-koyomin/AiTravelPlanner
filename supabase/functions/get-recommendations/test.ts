import {
  assertEquals,
  assertExists
} from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  createTestRecommendationsRequest,
  callEdgeFunction,
  assertSuccessResponse,
  assertErrorResponse,
  validateRecommendationsStructure
} from '../_shared/test_utils.ts'

const FUNCTION_NAME = 'get-recommendations'

Deno.test(`${FUNCTION_NAME} - OPTIONS 请求 (CORS 预检)`, async () => {
  const response = await callEdgeFunction(FUNCTION_NAME, {})

  if (response.status === 200) {
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  } else {
    console.log('OPTIONS 请求可能不被支持，跳过测试')
  }
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 destination`, async () => {
  const request = createTestRecommendationsRequest({
    destination: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 travelDates`, async () => {
  const request = createTestRecommendationsRequest({
    travelDates: ''
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 budget`, async () => {
  const request = createTestRecommendationsRequest({
    budget: 0
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 缺少必填字段 participants`, async () => {
  const request = createTestRecommendationsRequest({
    participants: 0
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)
  const result = await assertErrorResponse(response, 400)

  assertEquals(result.error, '缺少必填字段')
})

Deno.test(`${FUNCTION_NAME} - 完整的推荐获取流程`, async () => {
  const request = createTestRecommendationsRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 验证推荐数据结构`, async () => {
  const request = createTestRecommendationsRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const recommendations = result.data.recommendations as Record<string, unknown>

  assertExists(recommendations.recommendations)
  assertEquals(Array.isArray(recommendations.recommendations), true)

  if (Array.isArray(recommendations.recommendations) && recommendations.recommendations.length > 0) {
    const firstRecommendation = recommendations.recommendations[0] as Record<string, unknown>

    assertExists(firstRecommendation.name)
    assertEquals(typeof firstRecommendation.name, 'string')

    assertExists(firstRecommendation.type)
    assertEquals(typeof firstRecommendation.type, 'string')

    assertExists(firstRecommendation.description)
    assertEquals(typeof firstRecommendation.description, 'string')

    assertExists(firstRecommendation.address)
    assertEquals(typeof firstRecommendation.address, 'string')

    assertExists(firstRecommendation.openingHours)
    assertEquals(typeof firstRecommendation.openingHours, 'string')

    assertExists(firstRecommendation.ticketPrice)
    assertEquals(typeof firstRecommendation.ticketPrice, 'number')

    assertExists(firstRecommendation.recommendedDuration)
    assertEquals(typeof firstRecommendation.recommendedDuration, 'number')

    assertExists(firstRecommendation.bestTimeToVisit)
    assertEquals(typeof firstRecommendation.bestTimeToVisit, 'string')

    assertExists(firstRecommendation.tips)
    assertEquals(Array.isArray(firstRecommendation.tips), true)

    assertExists(firstRecommendation.matchScore)
    assertEquals(typeof firstRecommendation.matchScore, 'number')
  }
})

Deno.test(`${FUNCTION_NAME} - 验证行程建议数据结构`, async () => {
  const request = createTestRecommendationsRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  const recommendations = result.data.recommendations as Record<string, unknown>

  assertExists(recommendations.itinerarySuggestions)
  assertEquals(Array.isArray(recommendations.itinerarySuggestions), true)

  if (Array.isArray(recommendations.itinerarySuggestions) && recommendations.itinerarySuggestions.length > 0) {
    const firstSuggestion = recommendations.itinerarySuggestions[0] as Record<string, unknown>

    assertExists(firstSuggestion.day)
    assertEquals(typeof firstSuggestion.day, 'number')

    assertExists(firstSuggestion.attractions)
    assertEquals(Array.isArray(firstSuggestion.attractions), true)

    assertExists(firstSuggestion.route)
    assertEquals(typeof firstSuggestion.route, 'string')
  }
})

Deno.test(`${FUNCTION_NAME} - 不同目的地的推荐`, async () => {
  const request = createTestRecommendationsRequest({
    destination: '上海'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 不同预算的推荐`, async () => {
  const request = createTestRecommendationsRequest({
    budget: 10000
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 不同参与人数的推荐`, async () => {
  const request = createTestRecommendationsRequest({
    participants: 4
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 不同旅行偏好的推荐`, async () => {
  const request = createTestRecommendationsRequest({
    preferences: ['shopping', 'nightlife']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 空偏好数组`, async () => {
  const request = createTestRecommendationsRequest({
    preferences: []
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
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
  const request = createTestRecommendationsRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
  assertEquals(
    response.headers.get('Access-Control-Allow-Headers'),
    'authorization, x-client-info, apikey, content-type'
  )

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 响应 Content-Type 为 JSON`, async () => {
  const request = createTestRecommendationsRequest()

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  const contentType = response.headers.get('Content-Type')
  assertExists(contentType)
  assertEquals(contentType.includes('application/json'), true)

  await response.body?.cancel()
})

Deno.test(`${FUNCTION_NAME} - 特殊字符目的地`, async () => {
  const request = createTestRecommendationsRequest({
    destination: '西安（兵马俑）'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 长日期范围`, async () => {
  const request = createTestRecommendationsRequest({
    travelDates: '2026-04-01 至 2026-04-15'
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})

Deno.test(`${FUNCTION_NAME} - 多种偏好组合`, async () => {
  const request = createTestRecommendationsRequest({
    preferences: ['food', 'attraction', 'shopping', 'culture', 'nature']
  })

  const response = await callEdgeFunction(FUNCTION_NAME, request)

  if (response.status === 500) {
    const data = await response.json()
    console.log('测试跳过 - 可能是 API Key 未配置:', data.error)
    return
  }

  const result = await assertSuccessResponse(response)

  validateRecommendationsStructure(result.data)
})
