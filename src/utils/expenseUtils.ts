import type { ExpenseCategory } from '@/services/supabase'
import {
  type BudgetStatus,
  type BudgetStatusType,
  type CategoryExpense,
  type DailyExpense,
  type ExpenseAnalysisReport,
  type BudgetAnalysisOptions,
  CATEGORY_COLORS,
  CATEGORY_LABELS
} from '@/types/expense'

export function calculateBudgetStatus(budget: number, spent: number): BudgetStatus {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0
  const remaining = budget - spent

  let status: BudgetStatusType = 'safe'
  if (percentage >= 100) {
    status = 'danger'
  } else if (percentage >= 70) {
    status = 'warning'
  }

  return {
    budget,
    spent,
    remaining,
    percentage: Math.min(percentage, 100),
    status
  }
}

export function formatCurrency(amount: number, currency: string = '¥'): string {
  return `${currency}${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other
}

export function getCategoryLabel(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category] || category
}

export function calculateCategoryExpenses(
  amountByCategory: Record<string, number>,
  totalAmount: number,
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>
): CategoryExpense[] {
  const categories = Object.keys(CATEGORY_LABELS) as ExpenseCategory[]

  return categories
    .filter(category => amountByCategory[category] !== undefined || categoryBudgets?.[category] !== undefined)
    .map(category => {
      const amount = amountByCategory[category] || 0
      const budget = categoryBudgets?.[category]
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      const isOverBudget = budget !== undefined && amount > budget

      return {
        category,
        amount,
        percentage,
        budget,
        isOverBudget
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

export function calculateDailyExpenses(
  amountByDate: Record<string, number>,
  countByDate?: Record<string, number>
): DailyExpense[] {
  return Object.entries(amountByDate)
    .map(([date, amount]) => ({
      date,
      amount,
      count: countByDate?.[date] || 1
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function generateRecommendations(
  budgetStatus: BudgetStatus,
  categoryBreakdown: CategoryExpense[],
  dailyBreakdown: DailyExpense[]
): string[] {
  const recommendations: string[] = []

  if (budgetStatus.status === 'danger') {
    recommendations.push(`预算已超支 ${formatCurrency(Math.abs(budgetStatus.remaining))}，建议控制后续支出`)
  } else if (budgetStatus.status === 'warning') {
    recommendations.push(`预算使用已达 ${budgetStatus.percentage.toFixed(0)}%，请注意控制支出`)
  }

  const overBudgetCategories = categoryBreakdown.filter(c => c.isOverBudget)
  if (overBudgetCategories.length > 0) {
    overBudgetCategories.forEach(c => {
      recommendations.push(`${getCategoryLabel(c.category)}支出已超预算 ${formatCurrency(c.amount - (c.budget || 0))}`)
    })
  }

  if (categoryBreakdown.length > 0) {
    const highestCategory = categoryBreakdown[0]
    if (highestCategory.percentage > 50) {
      recommendations.push(`${getCategoryLabel(highestCategory.category)}支出占比过高(${highestCategory.percentage.toFixed(0)}%)，可考虑优化`)
    }
  }

  if (dailyBreakdown.length > 1) {
    const avgDaily = dailyBreakdown.reduce((sum, d) => sum + d.amount, 0) / dailyBreakdown.length
    const highSpendDays = dailyBreakdown.filter(d => d.amount > avgDaily * 1.5)
    if (highSpendDays.length > 0) {
      recommendations.push(`${highSpendDays.length} 天支出明显高于日均，可关注大额消费`)
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('支出情况良好，继续保持合理的消费习惯')
  }

  return recommendations
}

export function generateExpenseAnalysisReport(
  stats: {
    totalAmount: number
    amountByCategory: Record<string, number>
    amountByDate: Record<string, number>
    averageDailyAmount: number
  },
  options: BudgetAnalysisOptions
): ExpenseAnalysisReport {
  const budgetStatus = calculateBudgetStatus(options.budget, stats.totalAmount)

  const categoryBreakdown = calculateCategoryExpenses(
    stats.amountByCategory,
    stats.totalAmount,
    options.categoryBudgets
  )

  const dailyBreakdown = calculateDailyExpenses(stats.amountByDate)

  let highestDay: { date: string; amount: number } | null = null
  if (dailyBreakdown.length > 0) {
    let maxItem = dailyBreakdown[0]
    for (const item of dailyBreakdown) {
      if (item.amount > maxItem.amount) {
        maxItem = item
      }
    }
    highestDay = { date: maxItem.date, amount: maxItem.amount }
  }

  let highestCategory: { category: ExpenseCategory; amount: number } | null = null
  if (categoryBreakdown.length > 0) {
    highestCategory = {
      category: categoryBreakdown[0].category,
      amount: categoryBreakdown[0].amount
    }
  }

  const recommendations = generateRecommendations(budgetStatus, categoryBreakdown, dailyBreakdown)

  return {
    totalSpent: stats.totalAmount,
    averageDaily: stats.averageDailyAmount,
    highestDay,
    highestCategory,
    budgetStatus,
    categoryBreakdown,
    dailyBreakdown,
    recommendations
  }
}

export function getBudgetStatusText(status: BudgetStatusType): string {
  const statusTexts: Record<BudgetStatusType, string> = {
    safe: '预算充足',
    warning: '预算紧张',
    danger: '预算超支'
  }
  return statusTexts[status]
}

export function getBudgetStatusBgColor(status: BudgetStatusType): string {
  const colors: Record<BudgetStatusType, string> = {
    safe: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100'
  }
  return colors[status]
}

export function getBudgetStatusTextColor(status: BudgetStatusType): string {
  const colors: Record<BudgetStatusType, string> = {
    safe: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700'
  }
  return colors[status]
}
