import { describe, it, expect } from 'vitest'
import {
  validateDestination,
  validateDate,
  validateBudget,
  validateParticipants,
  validatePreferences,
  validateItineraryForm,
  isFormValid
} from './itineraryValidation'
import { TravelPreference, ItineraryFormData, ItineraryFormErrors, DEFAULT_FORM_DATA } from '@/types/itinerary'

describe('validateDestination', () => {
  it('应该验证有效的目的地', () => {
    const result = validateDestination('日本东京')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('应该拒绝空目的地', () => {
    const result = validateDestination('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入目的地')
  })

  it('应该拒绝只有空格的目的地', () => {
    const result = validateDestination('   ')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入目的地')
  })

  it('应该拒绝少于 2 个字符的目的地', () => {
    const result = validateDestination('东')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('目的地至少需要 2 个字符')
  })

  it('应该接受正好 2 个字符的目的地', () => {
    const result = validateDestination('东京')
    expect(result.isValid).toBe(true)
  })

  it('应该接受长目的地', () => {
    const result = validateDestination('美国加利福尼亚州洛杉矶')
    expect(result.isValid).toBe(true)
  })
})

describe('validateDate', () => {
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = getLocalDateString(today)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow)

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const dayAfterTomorrowStr = getLocalDateString(dayAfterTomorrow)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getLocalDateString(yesterday)

  it('应该验证有效的出发日期', () => {
    const result = validateDate(tomorrowStr, 'start')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('应该验证有效的返回日期（晚于出发日期）', () => {
    const result = validateDate(dayAfterTomorrowStr, 'end', tomorrowStr)
    expect(result.isValid).toBe(true)
  })

  it('应该拒绝空出发日期', () => {
    const result = validateDate('', 'start')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请选择出发日期')
  })

  it('应该拒绝空返回日期', () => {
    const result = validateDate('', 'end')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请选择返回日期')
  })

  it('应该拒绝无效的日期格式', () => {
    const result = validateDate('invalid-date', 'start')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入有效的日期')
  })

  it('应该拒绝早于今天的日期', () => {
    const result = validateDate(yesterdayStr, 'start')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('日期不能早于今天')
  })

  it('应该拒绝返回日期早于出发日期', () => {
    const result = validateDate(tomorrowStr, 'end', dayAfterTomorrowStr)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('返回日期必须晚于出发日期')
  })

  it('应该拒绝返回日期等于出发日期', () => {
    const result = validateDate(tomorrowStr, 'end', tomorrowStr)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('返回日期必须晚于出发日期')
  })

  it('应该接受今天的日期作为出发日期', () => {
    const result = validateDate(todayStr, 'start')
    expect(result.isValid).toBe(true)
  })
})

describe('validateBudget', () => {
  it('应该验证有效的预算', () => {
    const result = validateBudget('10000')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('应该拒绝空预算', () => {
    const result = validateBudget('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入预算')
  })

  it('应该拒绝只有空格的预算', () => {
    const result = validateBudget('   ')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入预算')
  })

  it('应该拒绝非数字的预算', () => {
    const result = validateBudget('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入有效的金额')
  })

  it('应该拒绝 0 预算', () => {
    const result = validateBudget('0')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('预算必须大于 0')
  })

  it('应该拒绝负数预算', () => {
    const result = validateBudget('-100')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('预算必须大于 0')
  })

  it('应该拒绝超过 1,000,000 的预算', () => {
    const result = validateBudget('1000001')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('预算不能超过 1,000,000 元')
  })

  it('应该接受边界值 1', () => {
    const result = validateBudget('1')
    expect(result.isValid).toBe(true)
  })

  it('应该接受边界值 1,000,000', () => {
    const result = validateBudget('1000000')
    expect(result.isValid).toBe(true)
  })

  it('应该接受小数预算', () => {
    const result = validateBudget('1000.50')
    expect(result.isValid).toBe(true)
  })
})

describe('validateParticipants', () => {
  it('应该验证有效的同行人数', () => {
    const result = validateParticipants('5')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('应该拒绝空同行人数', () => {
    const result = validateParticipants('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入同行人数')
  })

  it('应该拒绝只有空格的同行人数', () => {
    const result = validateParticipants('   ')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入同行人数')
  })

  it('应该拒绝非数字的同行人数', () => {
    const result = validateParticipants('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入有效的人数')
  })

  it('应该拒绝 0 同行人数', () => {
    const result = validateParticipants('0')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('同行人数至少为 1 人')
  })

  it('应该拒绝负数同行人数', () => {
    const result = validateParticipants('-5')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('同行人数至少为 1 人')
  })

  it('应该拒绝超过 20 的同行人数', () => {
    const result = validateParticipants('21')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('同行人数不能超过 20 人')
  })

  it('应该接受边界值 1', () => {
    const result = validateParticipants('1')
    expect(result.isValid).toBe(true)
  })

  it('应该接受边界值 20', () => {
    const result = validateParticipants('20')
    expect(result.isValid).toBe(true)
  })
})

describe('validatePreferences', () => {
  it('应该验证有效的旅行偏好', () => {
    const result = validatePreferences([
      TravelPreference.FOOD,
      TravelPreference.ATTRACTION
    ])
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('应该拒绝空的旅行偏好数组', () => {
    const result = validatePreferences([])
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请至少选择一个旅行偏好')
  })

  it('应该接受单个旅行偏好', () => {
    const result = validatePreferences([TravelPreference.FOOD])
    expect(result.isValid).toBe(true)
  })

  it('应该接受多个旅行偏好', () => {
    const result = validatePreferences([
      TravelPreference.FOOD,
      TravelPreference.ATTRACTION,
      TravelPreference.SHOPPING,
      TravelPreference.CULTURE
    ])
    expect(result.isValid).toBe(true)
  })
})

describe('validateItineraryForm', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

  it('应该验证完整的有效表单', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '日本东京',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD, TravelPreference.ATTRACTION]
    }

    const errors = validateItineraryForm(formData)
    expect(errors).toEqual({})
  })

  it('应该返回多个错误当表单有多个错误', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      participants: '',
      preferences: []
    }

    const errors = validateItineraryForm(formData)
    expect(errors.destination).toBe('请输入目的地')
    expect(errors.startDate).toBe('请选择出发日期')
    expect(errors.endDate).toBe('请选择返回日期')
    expect(errors.budget).toBe('请输入预算')
    expect(errors.participants).toBe('请输入同行人数')
    expect(errors.preferences).toBe('请至少选择一个旅行偏好')
  })

  it('应该返回单个错误当表单有单个错误', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '东',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD]
    }

    const errors = validateItineraryForm(formData)
    expect(errors.destination).toBe('目的地至少需要 2 个字符')
    expect(errors.startDate).toBeUndefined()
    expect(errors.endDate).toBeUndefined()
    expect(errors.budget).toBeUndefined()
    expect(errors.participants).toBeUndefined()
    expect(errors.preferences).toBeUndefined()
  })

  it('应该验证包含特殊需求的有效表单', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '日本东京',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD],
      specialRequirements: '带小孩和老人'
    }

    const errors = validateItineraryForm(formData)
    expect(errors).toEqual({})
  })
})

describe('isFormValid', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

  it('应该返回 true 当表单有效', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '日本东京',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD]
    }

    const errors: ItineraryFormErrors = {}
    expect(isFormValid(errors, formData)).toBe(true)
  })

  it('应该返回 false 当表单有错误', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '日本东京',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD]
    }

    const errors: ItineraryFormErrors = {
      destination: '目的地至少需要 2 个字符'
    }
    expect(isFormValid(errors, formData)).toBe(false)
  })

  it('应该返回 false 当表单有未填写的必填字段', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      participants: '',
      preferences: []
    }

    const errors: ItineraryFormErrors = {}
    expect(isFormValid(errors, formData)).toBe(false)
  })

  it('应该返回 false 当目的地为空格', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '   ',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: [TravelPreference.FOOD]
    }

    const errors: ItineraryFormErrors = {}
    expect(isFormValid(errors, formData)).toBe(false)
  })

  it('应该返回 false 当偏好为空数组', () => {
    const formData: ItineraryFormData = {
      ...DEFAULT_FORM_DATA,
      destination: '日本东京',
      startDate: tomorrowStr,
      endDate: dayAfterTomorrowStr,
      budget: '10000',
      participants: '2',
      preferences: []
    }

    const errors: ItineraryFormErrors = {}
    expect(isFormValid(errors, formData)).toBe(false)
  })
})
