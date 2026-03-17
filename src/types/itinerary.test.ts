import { describe, it, expect } from 'vitest'
import {
  TravelPreference,
  TravelPreferenceLabels,
  getPreferenceLabel,
  getPreferenceLabels,
  DEFAULT_FORM_DATA,
  TravelersTypeLabels,
  AccommodationPreferenceLabels,
  PaceTypeLabels,
  ActivityTypeLabels,
  DAY_OF_WEEK_LABELS,
  getDayOfWeekLabel
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

describe('TravelersTypeLabels', () => {
  it('应该包含所有人员构成类型的中文标签', () => {
    expect(TravelersTypeLabels['adult']).toBe('成人出行')
    expect(TravelersTypeLabels['family']).toBe('亲子游')
    expect(TravelersTypeLabels['couple']).toBe('情侣出游')
    expect(TravelersTypeLabels['friends']).toBe('朋友结伴')
    expect(TravelersTypeLabels['solo']).toBe('独自旅行')
    expect(TravelersTypeLabels['business']).toBe('商务出行')
  })

  it('应该包含 6 个标签映射', () => {
    const labels = Object.keys(TravelersTypeLabels)
    expect(labels).toHaveLength(6)
  })
})

describe('AccommodationPreferenceLabels', () => {
  it('应该包含所有住宿偏好类型的中文标签', () => {
    expect(AccommodationPreferenceLabels['budget']).toBe('经济型')
    expect(AccommodationPreferenceLabels['comfort']).toBe('舒适型')
    expect(AccommodationPreferenceLabels['luxury']).toBe('豪华型')
  })

  it('应该包含 3 个标签映射', () => {
    const labels = Object.keys(AccommodationPreferenceLabels)
    expect(labels).toHaveLength(3)
  })
})

describe('PaceTypeLabels', () => {
  it('应该包含所有行程节奏类型的中文标签', () => {
    expect(PaceTypeLabels['relaxed']).toBe('轻松')
    expect(PaceTypeLabels['moderate']).toBe('适中')
    expect(PaceTypeLabels['intense']).toBe('紧凑')
  })

  it('应该包含 3 个标签映射', () => {
    const labels = Object.keys(PaceTypeLabels)
    expect(labels).toHaveLength(3)
  })
})

describe('ActivityTypeLabels', () => {
  it('应该包含所有活动类型的中文标签', () => {
    expect(ActivityTypeLabels['transport']).toBe('交通')
    expect(ActivityTypeLabels['accommodation']).toBe('住宿')
    expect(ActivityTypeLabels['attraction']).toBe('景点')
    expect(ActivityTypeLabels['restaurant']).toBe('餐厅')
    expect(ActivityTypeLabels['activity']).toBe('活动')
    expect(ActivityTypeLabels['shopping']).toBe('购物')
  })

  it('应该包含 6 个标签映射', () => {
    const labels = Object.keys(ActivityTypeLabels)
    expect(labels).toHaveLength(6)
  })
})

describe('DAY_OF_WEEK_LABELS', () => {
  it('应该包含所有星期的中文标签', () => {
    expect(DAY_OF_WEEK_LABELS[0]).toBe('星期日')
    expect(DAY_OF_WEEK_LABELS[1]).toBe('星期一')
    expect(DAY_OF_WEEK_LABELS[2]).toBe('星期二')
    expect(DAY_OF_WEEK_LABELS[3]).toBe('星期三')
    expect(DAY_OF_WEEK_LABELS[4]).toBe('星期四')
    expect(DAY_OF_WEEK_LABELS[5]).toBe('星期五')
    expect(DAY_OF_WEEK_LABELS[6]).toBe('星期六')
  })

  it('应该包含 7 个标签映射', () => {
    const labels = Object.keys(DAY_OF_WEEK_LABELS)
    expect(labels).toHaveLength(7)
  })
})

describe('getDayOfWeekLabel', () => {
  it('应该返回正确的星期标签', () => {
    expect(getDayOfWeekLabel('2024-03-17')).toBe('星期日')
    expect(getDayOfWeekLabel('2024-03-18')).toBe('星期一')
    expect(getDayOfWeekLabel('2024-03-19')).toBe('星期二')
    expect(getDayOfWeekLabel('2024-03-20')).toBe('星期三')
    expect(getDayOfWeekLabel('2024-03-21')).toBe('星期四')
    expect(getDayOfWeekLabel('2024-03-22')).toBe('星期五')
    expect(getDayOfWeekLabel('2024-03-23')).toBe('星期六')
  })

  it('应该正确处理闰年日期', () => {
    expect(getDayOfWeekLabel('2024-02-29')).toBe('星期四')
    expect(getDayOfWeekLabel('2020-02-29')).toBe('星期六')
  })

  it('应该正确处理年初和年末日期', () => {
    expect(getDayOfWeekLabel('2024-01-01')).toBe('星期一')
    expect(getDayOfWeekLabel('2024-12-31')).toBe('星期二')
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
    expect(DEFAULT_FORM_DATA).toHaveProperty('travelersType')
    expect(DEFAULT_FORM_DATA).toHaveProperty('accommodation')
    expect(DEFAULT_FORM_DATA).toHaveProperty('pace')
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

  it('应该有正确的新字段默认值', () => {
    expect(DEFAULT_FORM_DATA.travelersType).toBe('adult')
    expect(DEFAULT_FORM_DATA.accommodation).toBe('comfort')
    expect(DEFAULT_FORM_DATA.pace).toBe('moderate')
  })
})
