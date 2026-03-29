import { describe, it, expect } from 'vitest'
import {
  calculateBudgetStatus,
  formatCurrency,
  getCategoryColor,
  getCategoryLabel,
  calculateCategoryExpenses,
  calculateDailyExpenses,
  generateRecommendations,
  generateExpenseAnalysisReport,
  getBudgetStatusText,
  getBudgetStatusBgColor,
  getBudgetStatusTextColor
} from '@/utils/expenseUtils'
import type { ExpenseCategory } from '@/services/supabase'

describe('calculateBudgetStatus', () => {
  it('应该正确计算预算状态', () => {
    const result = calculateBudgetStatus(10000, 5000)

    expect(result.budget).toBe(10000)
    expect(result.spent).toBe(5000)
    expect(result.remaining).toBe(5000)
    expect(result.percentage).toBe(50)
    expect(result.status).toBe('safe')
  })

  it('预算充足时应该返回 safe', () => {
    const result = calculateBudgetStatus(10000, 3000)
    expect(result.status).toBe('safe')
  })

  it('预算紧张时应该返回 warning', () => {
    const result = calculateBudgetStatus(10000, 7500)
    expect(result.status).toBe('warning')
  })

  it('预算超支时应该返回 danger', () => {
    const result = calculateBudgetStatus(10000, 11000)
    expect(result.status).toBe('danger')
  })

  it('预算为 0 时应该正确处理', () => {
    const result = calculateBudgetStatus(0, 1000)

    expect(result.percentage).toBe(0)
    expect(result.status).toBe('safe')
  })

  it('百分比应该限制在 100 以内', () => {
    const result = calculateBudgetStatus(10000, 15000)

    expect(result.percentage).toBe(100)
  })

  it('支出为 0 时应该正确处理', () => {
    const result = calculateBudgetStatus(10000, 0)

    expect(result.percentage).toBe(0)
    expect(result.remaining).toBe(10000)
    expect(result.status).toBe('safe')
  })

  it('刚好 70% 时应该返回 warning', () => {
    const result = calculateBudgetStatus(10000, 7000)
    expect(result.status).toBe('warning')
  })

  it('刚好 100% 时应该返回 danger', () => {
    const result = calculateBudgetStatus(10000, 10000)
    expect(result.status).toBe('danger')
  })
})

describe('formatCurrency', () => {
  it('应该正确格式化整数金额', () => {
    const result = formatCurrency(1000)
    expect(result).toBe('¥1,000')
  })

  it('应该正确格式化小数金额', () => {
    const result = formatCurrency(1234.56)
    expect(result).toBe('¥1,234.56')
  })

  it('应该正确格式化大金额', () => {
    const result = formatCurrency(1000000)
    expect(result).toBe('¥1,000,000')
  })

  it('应该支持自定义货币符号', () => {
    const result = formatCurrency(1000, '$')
    expect(result).toBe('$1,000')
  })

  it('0 金额应该正确格式化', () => {
    const result = formatCurrency(0)
    expect(result).toBe('¥0')
  })

  it('应该正确处理小数点后为 0 的情况', () => {
    const result = formatCurrency(1000.0)
    expect(result).toBe('¥1,000')
  })
})

describe('getCategoryColor', () => {
  it('应该返回正确的分类颜色', () => {
    expect(getCategoryColor('transport')).toBe('#3B82F6')
    expect(getCategoryColor('food')).toBe('#F59E0B')
    expect(getCategoryColor('accommodation')).toBe('#8B5CF6')
    expect(getCategoryColor('ticket')).toBe('#10B981')
    expect(getCategoryColor('shopping')).toBe('#EC4899')
    expect(getCategoryColor('entertainment')).toBe('#6366F1')
    expect(getCategoryColor('other')).toBe('#6B7280')
  })
})

describe('getCategoryLabel', () => {
  it('应该返回正确的分类标签', () => {
    expect(getCategoryLabel('transport')).toBe('交通')
    expect(getCategoryLabel('food')).toBe('餐饮')
    expect(getCategoryLabel('accommodation')).toBe('住宿')
    expect(getCategoryLabel('ticket')).toBe('门票')
    expect(getCategoryLabel('shopping')).toBe('购物')
    expect(getCategoryLabel('entertainment')).toBe('娱乐')
    expect(getCategoryLabel('other')).toBe('其他')
  })
})

describe('calculateCategoryExpenses', () => {
  it('应该正确计算分类支出', () => {
    const amountByCategory: Record<string, number> = {
      transport: 2000,
      food: 1500,
      accommodation: 1000
    }

    const result = calculateCategoryExpenses(amountByCategory, 4500)

    expect(result).toHaveLength(3)
    expect(result[0].category).toBe('transport')
    expect(result[0].amount).toBe(2000)
    expect(result[0].percentage).toBeCloseTo(44.44, 1)
  })

  it('应该正确计算百分比', () => {
    const amountByCategory: Record<string, number> = {
      transport: 500,
      food: 500
    }

    const result = calculateCategoryExpenses(amountByCategory, 1000)

    expect(result[0].percentage).toBe(50)
    expect(result[1].percentage).toBe(50)
  })

  it('应该按金额降序排列', () => {
    const amountByCategory: Record<string, number> = {
      food: 1000,
      transport: 3000,
      accommodation: 2000
    }

    const result = calculateCategoryExpenses(amountByCategory, 6000)

    expect(result[0].amount).toBe(3000)
    expect(result[1].amount).toBe(2000)
    expect(result[2].amount).toBe(1000)
  })

  it('有分类预算时应该计算是否超支', () => {
    const amountByCategory: Record<string, number> = {
      transport: 3000,
      food: 500
    }

    const categoryBudgets: Partial<Record<ExpenseCategory, number>> = {
      transport: 2000,
      food: 1000
    }

    const result = calculateCategoryExpenses(amountByCategory, 3500, categoryBudgets)

    const transportCategory = result.find(c => c.category === 'transport')
    const foodCategory = result.find(c => c.category === 'food')

    expect(transportCategory?.isOverBudget).toBe(true)
    expect(foodCategory?.isOverBudget).toBe(false)
  })

  it('没有分类预算时不应该标记超支', () => {
    const amountByCategory: Record<string, number> = {
      transport: 3000
    }

    const result = calculateCategoryExpenses(amountByCategory, 3000)

    expect(result[0].isOverBudget).toBeFalsy()
  })

  it('总金额为 0 时应该正确处理', () => {
    const amountByCategory: Record<string, number> = {
      transport: 0
    }

    const result = calculateCategoryExpenses(amountByCategory, 0)

    expect(result[0].percentage).toBe(0)
  })
})

describe('calculateDailyExpenses', () => {
  it('应该正确计算每日支出', () => {
    const amountByDate: Record<string, number> = {
      '2024-03-01': 500,
      '2024-03-02': 600
    }

    const result = calculateDailyExpenses(amountByDate)

    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2024-03-01')
    expect(result[0].amount).toBe(500)
  })

  it('应该按日期排序', () => {
    const amountByDate: Record<string, number> = {
      '2024-03-03': 300,
      '2024-03-01': 500,
      '2024-03-02': 400
    }

    const result = calculateDailyExpenses(amountByDate)

    expect(result[0].date).toBe('2024-03-01')
    expect(result[1].date).toBe('2024-03-02')
    expect(result[2].date).toBe('2024-03-03')
  })

  it('应该正确处理消费笔数', () => {
    const amountByDate: Record<string, number> = {
      '2024-03-01': 500
    }
    const countByDate: Record<string, number> = {
      '2024-03-01': 3
    }

    const result = calculateDailyExpenses(amountByDate, countByDate)

    expect(result[0].count).toBe(3)
  })

  it('没有笔数数据时默认为 1', () => {
    const amountByDate: Record<string, number> = {
      '2024-03-01': 500
    }

    const result = calculateDailyExpenses(amountByDate)

    expect(result[0].count).toBe(1)
  })

  it('空数据时应该返回空数组', () => {
    const result = calculateDailyExpenses({})

    expect(result).toEqual([])
  })
})

describe('generateRecommendations', () => {
  it('预算超支时应该生成超支建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 12000)
    const result = generateRecommendations(budgetStatus, [], [])

    expect(result.some(r => r.includes('预算已超支'))).toBe(true)
  })

  it('预算紧张时应该生成警告建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 7500)
    const result = generateRecommendations(budgetStatus, [], [])

    expect(result.some(r => r.includes('预算使用已达'))).toBe(true)
  })

  it('分类超支时应该生成分类建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 5000)
    const categoryBreakdown = [
      { category: 'transport' as ExpenseCategory, amount: 3000, percentage: 60, budget: 2000, isOverBudget: true }
    ]

    const result = generateRecommendations(budgetStatus, categoryBreakdown, [])

    expect(result.some(r => r.includes('交通') && r.includes('超预算'))).toBe(true)
  })

  it('某分类占比过高时应该生成优化建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 5000)
    const categoryBreakdown = [
      { category: 'transport' as ExpenseCategory, amount: 4000, percentage: 80 }
    ]

    const result = generateRecommendations(budgetStatus, categoryBreakdown, [])

    expect(result.some(r => r.includes('交通') && r.includes('占比过高'))).toBe(true)
  })

  it('有高消费日时应该生成关注建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 5000)
    const dailyBreakdown = [
      { date: '2024-03-01', amount: 100, count: 1 },
      { date: '2024-03-02', amount: 2000, count: 5 },
      { date: '2024-03-03', amount: 100, count: 1 }
    ]

    const result = generateRecommendations(budgetStatus, [], dailyBreakdown)

    expect(result.some(r => r.includes('支出明显高于日均'))).toBe(true)
  })

  it('情况良好时应该生成正面建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 3000)
    const result = generateRecommendations(budgetStatus, [], [])

    expect(result).toContain('支出情况良好，继续保持合理的消费习惯')
  })

  it('只有一天数据时不生成高消费日建议', () => {
    const budgetStatus = calculateBudgetStatus(10000, 5000)
    const dailyBreakdown = [
      { date: '2024-03-01', amount: 5000, count: 10 }
    ]

    const result = generateRecommendations(budgetStatus, [], dailyBreakdown)

    expect(result.some(r => r.includes('支出明显高于日均'))).toBe(false)
  })
})

describe('generateExpenseAnalysisReport', () => {
  it('应该生成完整的分析报告', () => {
    const stats = {
      totalAmount: 5000,
      amountByCategory: {
        transport: 2000,
        food: 1500,
        accommodation: 1500
      },
      amountByDate: {
        '2024-03-01': 2000,
        '2024-03-02': 3000
      },
      averageDailyAmount: 2500
    }
    const options = { budget: 10000 }

    const result = generateExpenseAnalysisReport(stats, options)

    expect(result.totalSpent).toBe(5000)
    expect(result.averageDaily).toBe(2500)
    expect(result.budgetStatus.budget).toBe(10000)
    expect(result.categoryBreakdown).toHaveLength(3)
    expect(result.dailyBreakdown).toHaveLength(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('应该正确计算最高消费日', () => {
    const stats = {
      totalAmount: 5000,
      amountByCategory: { food: 5000 },
      amountByDate: {
        '2024-03-01': 2000,
        '2024-03-02': 3000
      },
      averageDailyAmount: 2500
    }
    const options = { budget: 10000 }

    const result = generateExpenseAnalysisReport(stats, options)

    expect(result.highestDay).toEqual({
      date: '2024-03-02',
      amount: 3000
    })
  })

  it('应该正确计算最高消费分类', () => {
    const stats = {
      totalAmount: 5000,
      amountByCategory: {
        transport: 3000,
        food: 2000
      },
      amountByDate: { '2024-03-01': 5000 },
      averageDailyAmount: 5000
    }
    const options = { budget: 10000 }

    const result = generateExpenseAnalysisReport(stats, options)

    expect(result.highestCategory).toEqual({
      category: 'transport',
      amount: 3000
    })
  })

  it('空数据时应该正确处理', () => {
    const stats = {
      totalAmount: 0,
      amountByCategory: {},
      amountByDate: {},
      averageDailyAmount: 0
    }
    const options = { budget: 10000 }

    const result = generateExpenseAnalysisReport(stats, options)

    expect(result.highestDay).toBeNull()
    expect(result.highestCategory).toBeNull()
    expect(result.categoryBreakdown).toEqual([])
    expect(result.dailyBreakdown).toEqual([])
  })

  it('应该使用分类预算', () => {
    const stats = {
      totalAmount: 5000,
      amountByCategory: {
        transport: 3000
      },
      amountByDate: { '2024-03-01': 5000 },
      averageDailyAmount: 5000
    }
    const options = {
      budget: 10000,
      categoryBudgets: {
        transport: 2000
      } as Partial<Record<ExpenseCategory, number>>
    }

    const result = generateExpenseAnalysisReport(stats, options)

    const transportCategory = result.categoryBreakdown.find(c => c.category === 'transport')
    expect(transportCategory?.budget).toBe(2000)
    expect(transportCategory?.isOverBudget).toBe(true)
  })
})

describe('getBudgetStatusText', () => {
  it('应该返回正确的状态文字', () => {
    expect(getBudgetStatusText('safe')).toBe('预算充足')
    expect(getBudgetStatusText('warning')).toBe('预算紧张')
    expect(getBudgetStatusText('danger')).toBe('预算超支')
  })
})

describe('getBudgetStatusBgColor', () => {
  it('应该返回正确的背景颜色类', () => {
    expect(getBudgetStatusBgColor('safe')).toBe('bg-green-100')
    expect(getBudgetStatusBgColor('warning')).toBe('bg-yellow-100')
    expect(getBudgetStatusBgColor('danger')).toBe('bg-red-100')
  })
})

describe('getBudgetStatusTextColor', () => {
  it('应该返回正确的文字颜色类', () => {
    expect(getBudgetStatusTextColor('safe')).toBe('text-green-700')
    expect(getBudgetStatusTextColor('warning')).toBe('text-yellow-700')
    expect(getBudgetStatusTextColor('danger')).toBe('text-red-700')
  })
})
