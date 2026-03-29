import type { ExpenseCategory } from '@/services/supabase'

export type { ExpenseCategory }

export type BudgetStatusType = 'safe' | 'warning' | 'danger'

export interface BudgetStatus {
  budget: number
  spent: number
  remaining: number
  percentage: number
  status: BudgetStatusType
}

export interface CategoryExpense {
  category: ExpenseCategory
  amount: number
  percentage: number
  budget?: number
  isOverBudget?: boolean
}

export interface DailyExpense {
  date: string
  amount: number
  count: number
}

export interface ExpenseAnalysisReport {
  totalSpent: number
  averageDaily: number
  highestDay: {
    date: string
    amount: number
  } | null
  highestCategory: {
    category: ExpenseCategory
    amount: number
  } | null
  budgetStatus: BudgetStatus
  categoryBreakdown: CategoryExpense[]
  dailyBreakdown: DailyExpense[]
  recommendations: string[]
}

export interface BudgetAnalysisOptions {
  budget: number
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>
}

export interface ChartClickData {
  category?: ExpenseCategory
  date?: string
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  transport: '#3B82F6',
  accommodation: '#8B5CF6',
  food: '#F59E0B',
  ticket: '#10B981',
  shopping: '#EC4899',
  entertainment: '#6366F1',
  other: '#6B7280'
}

export const STATUS_COLORS: Record<BudgetStatusType, string> = {
  safe: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444'
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: '交通',
  accommodation: '住宿',
  food: '餐饮',
  ticket: '门票',
  shopping: '购物',
  entertainment: '娱乐',
  other: '其他'
}

export const CHART_CONFIG = {
  pieChart: {
    innerRadius: 60,
    outerRadius: 100,
    paddingAngle: 2,
    animationDuration: 500
  },
  barChart: {
    barSize: 24,
    animationDuration: 500
  }
} as const
