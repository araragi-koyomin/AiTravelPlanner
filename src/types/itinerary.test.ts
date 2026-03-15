import { describe, it, expect } from 'vitest'
import {
  TravelPreference,
  TravelPreferenceLabels,
  getPreferenceLabel,
  getPreferenceLabels,
  DEFAULT_FORM_DATA
} from './itinerary'

describe('TravelPreference', () => {
  it('应该包含所有旅行偏好枚举值', () => {
    expect(TravelPreference.FOOD).toBe('food')
    expect(TravelPreference.ATTRACTION).toBe('attraction')
    expect(TravelPreference.SHOPPING).toBe('shopping')
    expect(TravelPreference.CULTURE).toBe('culture')
    expect(TravelPreference.NATURE).toBe('nature')
    expect(TravelPreference.ANIME).toBe('anime')
    expect(TravelPreference.HISTORY).toBe('history')
    expect(TravelPreference.NIGHTLIFE).toBe('nightlife')
  })

  it('应该包含 8 个旅行偏好', () => {
    const preferences = Object.values(TravelPreference)
    expect(preferences).toHaveLength(8)
  })
})

describe('TravelPreferenceLabels', () => {
  it('应该包含所有旅行偏好的中文标签', () => {
    expect(TravelPreferenceLabels[TravelPreference.FOOD]).toBe('美食')
    expect(TravelPreferenceLabels[TravelPreference.ATTRACTION]).toBe('景点')
    expect(TravelPreferenceLabels[TravelPreference.SHOPPING]).toBe('购物')
    expect(TravelPreferenceLabels[TravelPreference.CULTURE]).toBe('文化')
    expect(TravelPreferenceLabels[TravelPreference.NATURE]).toBe('自然')
    expect(TravelPreferenceLabels[TravelPreference.ANIME]).toBe('动漫')
    expect(TravelPreferenceLabels[TravelPreference.HISTORY]).toBe('历史')
    expect(TravelPreferenceLabels[TravelPreference.NIGHTLIFE]).toBe('夜生活')
  })

  it('应该包含 8 个标签映射', () => {
    const labels = Object.keys(TravelPreferenceLabels)
    expect(labels).toHaveLength(8)
  })
})

describe('getPreferenceLabel', () => {
  it('应该返回正确的中文标签', () => {
    expect(getPreferenceLabel(TravelPreference.FOOD)).toBe('美食')
    expect(getPreferenceLabel(TravelPreference.ATTRACTION)).toBe('景点')
    expect(getPreferenceLabel(TravelPreference.SHOPPING)).toBe('购物')
    expect(getPreferenceLabel(TravelPreference.CULTURE)).toBe('文化')
    expect(getPreferenceLabel(TravelPreference.NATURE)).toBe('自然')
    expect(getPreferenceLabel(TravelPreference.ANIME)).toBe('动漫')
    expect(getPreferenceLabel(TravelPreference.HISTORY)).toBe('历史')
    expect(getPreferenceLabel(TravelPreference.NIGHTLIFE)).toBe('夜生活')
  })
})

describe('getPreferenceLabels', () => {
  it('应该返回多个偏好的中文标签数组', () => {
    const labels = getPreferenceLabels([
      TravelPreference.FOOD,
      TravelPreference.ATTRACTION,
      TravelPreference.SHOPPING
    ])
    expect(labels).toEqual(['美食', '景点', '购物'])
  })

  it('应该返回空数组当输入为空数组', () => {
    const labels = getPreferenceLabels([])
    expect(labels).toEqual([])
  })

  it('应该返回单个偏好的标签数组', () => {
    const labels = getPreferenceLabels([TravelPreference.FOOD])
    expect(labels).toEqual(['美食'])
  })
})

describe('DEFAULT_FORM_DATA', () => {
  it('应该包含所有表单字段', () => {
    expect(DEFAULT_FORM_DATA).toHaveProperty('destination')
    expect(DEFAULT_FORM_DATA).toHaveProperty('startDate')
    expect(DEFAULT_FORM_DATA).toHaveProperty('endDate')
    expect(DEFAULT_FORM_DATA).toHaveProperty('budget')
    expect(DEFAULT_FORM_DATA).toHaveProperty('participants')
    expect(DEFAULT_FORM_DATA).toHaveProperty('preferences')
    expect(DEFAULT_FORM_DATA).toHaveProperty('specialRequirements')
  })

  it('应该有正确的默认值', () => {
    expect(DEFAULT_FORM_DATA.destination).toBe('')
    expect(DEFAULT_FORM_DATA.startDate).toBe('')
    expect(DEFAULT_FORM_DATA.endDate).toBe('')
    expect(DEFAULT_FORM_DATA.budget).toBe('')
    expect(DEFAULT_FORM_DATA.participants).toBe('')
    expect(DEFAULT_FORM_DATA.preferences).toEqual([])
    expect(DEFAULT_FORM_DATA.specialRequirements).toBe('')
  })
})
