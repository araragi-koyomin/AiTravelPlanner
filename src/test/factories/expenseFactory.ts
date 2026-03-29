import type {
  BudgetStatus,
  CategoryExpense,
  DailyExpense,
  ExpenseAnalysisReport
} from '@/types/expense'
import type { ExpenseCategory } from '@/services/supabase'

export function createMockBudgetStatus(overrides: Partial<BudgetStatus> = {}): BudgetStatus {
  return {
    budget: 10000,
    spent: 5000,
    remaining: 5000,
    percentage: 50,
    status: 'safe',
    ...overrides
  }
}

export function createMockCategoryExpense(
  category: ExpenseCategory = 'food',
  overrides: Partial<CategoryExpense> = {}
): CategoryExpense {
  return {
    category,
    amount: 1000,
    percentage: 20,
    ...overrides
  }
}

export function createMockCategoryExpenses(): CategoryExpense[] {
  return [
    createMockCategoryExpense('transport', { amount: 2000, percentage: 40 }),
    createMockCategoryExpense('food', { amount: 1500, percentage: 30 }),
    createMockCategoryExpense('accommodation', { amount: 1000, percentage: 20 }),
    createMockCategoryExpense('ticket', { amount: 500, percentage: 10 })
  ]
}

export function createMockDailyExpense(overrides: Partial<DailyExpense> = {}): DailyExpense {
  return {
    date: '2024-03-01',
    amount: 500,
    count: 3,
    ...overrides
  }
}

export function createMockDailyExpenses(): DailyExpense[] {
  return [
    createMockDailyExpense({ date: '2024-03-01', amount: 800, count: 4 }),
    createMockDailyExpense({ date: '2024-03-02', amount: 600, count: 3 }),
    createMockDailyExpense({ date: '2024-03-03', amount: 1200, count: 5 })
  ]
}

export function createMockExpenseAnalysisReport(
  overrides: Partial<ExpenseAnalysisReport> = {}
): ExpenseAnalysisReport {
  return {
    totalSpent: 5000,
    averageDaily: 1666.67,
    highestDay: {
      date: '2024-03-03',
      amount: 1200
    },
    highestCategory: {
      category: 'transport',
      amount: 2000
    },
    budgetStatus: createMockBudgetStatus(),
    categoryBreakdown: createMockCategoryExpenses(),
    dailyBreakdown: createMockDailyExpenses(),
    recommendations: ['支出情况良好，继续保持合理的消费习惯'],
    ...overrides
  }
}
