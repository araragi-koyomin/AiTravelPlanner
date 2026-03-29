import { useState, useEffect, useCallback } from 'react'
import {
  getExpenses,
  getExpenseStats,
  getExpenseSummary,
  getDailyExpenses,
  getBudgetAnalysis,
  type Expense,
  type ExpenseStats,
  type ExpenseSummary,
  type DailyExpenseData,
  type BudgetAnalysisResult,
  type BudgetAnalysisOptions
} from '@/services/expense'

interface UseExpenseStatsResult {
  expenses: Expense[]
  stats: ExpenseStats | null
  summary: ExpenseSummary[]
  dailyExpenses: DailyExpenseData[]
  budgetAnalysis: BudgetAnalysisResult | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useExpenseStats(
  itineraryId: string | undefined,
  budgetOptions?: BudgetAnalysisOptions
): UseExpenseStatsResult {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [summary, setSummary] = useState<ExpenseSummary[]>([])
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpenseData[]>([])
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!itineraryId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [
        expensesData,
        statsData,
        summaryData,
        dailyData
      ] = await Promise.all([
        getExpenses(itineraryId),
        getExpenseStats(itineraryId),
        getExpenseSummary(itineraryId),
        getDailyExpenses(itineraryId)
      ])

      setExpenses(expensesData)
      setStats(statsData)
      setSummary(summaryData)
      setDailyExpenses(dailyData)

      if (budgetOptions && budgetOptions.budget > 0) {
        const analysis = await getBudgetAnalysis(itineraryId, budgetOptions)
        setBudgetAnalysis(analysis)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载费用数据失败')
    } finally {
      setIsLoading(false)
    }
  }, [itineraryId, budgetOptions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    expenses,
    stats,
    summary,
    dailyExpenses,
    budgetAnalysis,
    isLoading,
    error,
    refetch: fetchData
  }
}

interface UseBudgetAnalysisResult {
  analysis: BudgetAnalysisResult | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBudgetAnalysis(
  itineraryId: string | undefined,
  budget: number,
  categoryBudgets?: Partial<Record<string, number>>
): UseBudgetAnalysisResult {
  const [analysis, setAnalysis] = useState<BudgetAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    if (!itineraryId || budget <= 0) {
      setIsLoading(false)
      setAnalysis(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await getBudgetAnalysis(itineraryId, {
        budget,
        categoryBudgets
      })
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取预算分析失败')
    } finally {
      setIsLoading(false)
    }
  }, [itineraryId, budget, categoryBudgets])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchAnalysis
  }
}
