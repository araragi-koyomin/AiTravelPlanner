import { supabase, TablesInsert, TablesUpdate, TablesRow, SupabaseErrorClass, ExpenseCategory, PaymentMethod } from './supabase'

export type Expense = TablesRow<'expenses'>
export type ExpenseInsert = TablesInsert<'expenses'>
export type ExpenseUpdate = TablesUpdate<'expenses'>

export interface ExpenseQueryOptions {
  category?: ExpenseCategory
  startDate?: string
  endDate?: string
  paymentMethod?: PaymentMethod
  orderBy?: 'expense_date' | 'amount'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ExpenseStats {
  totalAmount: number
  amountByCategory: Record<string, number>
  amountByDate: Record<string, number>
  averageDailyAmount: number
}

export interface ExpenseSummary {
  category: string
  amount: number
  percentage: number
}

export async function createExpense(
  expenseData: ExpenseInsert
): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`创建费用记录失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建费用记录失败')
    }

    return data
  } catch (error) {
    console.error('创建费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('创建费用记录失败')
  }
}

export async function getExpenses(
  itineraryId: string,
  options?: ExpenseQueryOptions
): Promise<Expense[]> {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('itinerary_id', itineraryId)

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.startDate) {
      query = query.gte('expense_date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('expense_date', options.endDate)
    }

    if (options?.paymentMethod) {
      query = query.eq('payment_method', options.paymentMethod)
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection === 'asc'
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new SupabaseErrorClass(`获取费用记录失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('获取费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取费用记录失败')
  }
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new SupabaseErrorClass(`获取费用记录失败: ${error.message}`, error.code)
    }

    return data
  } catch (error) {
    console.error('获取费用记录失败:', error)
    if (error instanceof SupabaseErrorClass) {
      throw error
    }
    return null
  }
}

export async function updateExpense(
  id: string,
  expenseData: ExpenseUpdate
): Promise<Expense> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`更新费用记录失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新费用记录失败')
    }

    return data
  } catch (error) {
    console.error('更新费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新费用记录失败')
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      throw new SupabaseErrorClass(`删除费用记录失败: ${error.message}`, error.code)
    }
  } catch (error) {
    console.error('删除费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('删除费用记录失败')
  }
}

export async function createExpenses(
  expenses: ExpenseInsert[]
): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenses)
      .select()

    if (error) {
      throw new SupabaseErrorClass(`批量创建费用记录失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('批量创建费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('批量创建费用记录失败')
  }
}

export async function deleteExpenses(ids: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .in('id', ids)

    if (error) {
      throw new SupabaseErrorClass(`批量删除费用记录失败: ${error.message}`, error.code)
    }
  } catch (error) {
    console.error('批量删除费用记录失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('批量删除费用记录失败')
  }
}

export async function getExpenseStats(
  itineraryId: string
): Promise<ExpenseStats> {
  try {
    const expenses = await getExpenses(itineraryId)

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const amountByCategory: Record<string, number> = {}
    expenses.forEach(expense => {
      amountByCategory[expense.category] = (amountByCategory[expense.category] || 0) + expense.amount
    })

    const amountByDate: Record<string, number> = {}
    expenses.forEach(expense => {
      amountByDate[expense.expense_date] = (amountByDate[expense.expense_date] || 0) + expense.amount
    })

    const uniqueDates = Object.keys(amountByDate).length
    const averageDailyAmount = uniqueDates > 0 ? totalAmount / uniqueDates : 0

    return {
      totalAmount,
      amountByCategory,
      amountByDate,
      averageDailyAmount
    }
  } catch (error) {
    console.error('获取费用统计失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取费用统计失败')
  }
}

export function calculateStatsFromExpenses(expenses: Expense[]): ExpenseStats {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const amountByCategory: Record<string, number> = {}
  expenses.forEach(expense => {
    amountByCategory[expense.category] = (amountByCategory[expense.category] || 0) + expense.amount
  })

  const amountByDate: Record<string, number> = {}
  expenses.forEach(expense => {
    amountByDate[expense.expense_date] = (amountByDate[expense.expense_date] || 0) + expense.amount
  })

  const uniqueDates = Object.keys(amountByDate).length
  const averageDailyAmount = uniqueDates > 0 ? totalAmount / uniqueDates : 0

  return { totalAmount, amountByCategory, amountByDate, averageDailyAmount }
}

export async function getExpenseSummary(
  itineraryId: string
): Promise<ExpenseSummary[]> {
  try {
    const expenses = await getExpenses(itineraryId)

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const amountByCategory: Record<string, number> = {}
    expenses.forEach(expense => {
      amountByCategory[expense.category] = (amountByCategory[expense.category] || 0) + expense.amount
    })

    const summary: ExpenseSummary[] = Object.entries(amountByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }))

    summary.sort((a, b) => b.amount - a.amount)

    return summary
  } catch (error) {
    console.error('获取费用汇总失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取费用汇总失败')
  }
}

export interface DailyExpenseData {
  date: string
  amount: number
  count: number
  expenses: Expense[]
}

export async function getDailyExpenses(
  itineraryId: string
): Promise<DailyExpenseData[]> {
  try {
    const expenses = await getExpenses(itineraryId)

    const dailyMap = new Map<string, DailyExpenseData>()

    expenses.forEach(expense => {
      const existing = dailyMap.get(expense.expense_date)
      if (existing) {
        existing.amount += expense.amount
        existing.count += 1
        existing.expenses.push(expense)
      } else {
        dailyMap.set(expense.expense_date, {
          date: expense.expense_date,
          amount: expense.amount,
          count: 1,
          expenses: [expense]
        })
      }
    })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('获取每日支出失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取每日支出失败')
  }
}

export interface BudgetAnalysisOptions {
  budget: number
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>
}

export interface BudgetAnalysisResult {
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
  budgetStatus: {
    budget: number
    spent: number
    remaining: number
    percentage: number
    status: 'safe' | 'warning' | 'danger'
  }
  categoryBreakdown: Array<{
    category: ExpenseCategory
    amount: number
    percentage: number
    budget?: number
    isOverBudget?: boolean
  }>
  dailyBreakdown: Array<{
    date: string
    amount: number
    count: number
  }>
}

export async function getBudgetAnalysis(
  itineraryId: string,
  options: BudgetAnalysisOptions
): Promise<BudgetAnalysisResult> {
  try {
    const stats = await getExpenseStats(itineraryId)
    const dailyExpenses = await getDailyExpenses(itineraryId)

    const percentage = options.budget > 0 ? (stats.totalAmount / options.budget) * 100 : 0
    let status: 'safe' | 'warning' | 'danger' = 'safe'
    if (percentage >= 100) {
      status = 'danger'
    } else if (percentage >= 70) {
      status = 'warning'
    }

    const budgetStatus = {
      budget: options.budget,
      spent: stats.totalAmount,
      remaining: options.budget - stats.totalAmount,
      percentage: Math.min(percentage, 100),
      status
    }

    const categoryBreakdown: BudgetAnalysisResult['categoryBreakdown'] = Object.entries(stats.amountByCategory)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        percentage: stats.totalAmount > 0 ? (amount / stats.totalAmount) * 100 : 0,
        budget: options.categoryBudgets?.[category as ExpenseCategory],
        isOverBudget: options.categoryBudgets?.[category as ExpenseCategory] !== undefined
          ? amount > (options.categoryBudgets[category as ExpenseCategory] || 0)
          : false
      }))
      .sort((a, b) => b.amount - a.amount)

    const dailyBreakdown = dailyExpenses.map(d => ({
      date: d.date,
      amount: d.amount,
      count: d.count
    }))

    let highestDay: { date: string; amount: number } | null = null
    if (dailyBreakdown.length > 0) {
      highestDay = dailyBreakdown.reduce((max, current) =>
        current.amount > max.amount ? current : max
      )
    }

    let highestCategory: { category: ExpenseCategory; amount: number } | null = null
    if (categoryBreakdown.length > 0) {
      highestCategory = {
        category: categoryBreakdown[0].category,
        amount: categoryBreakdown[0].amount
      }
    }

    return {
      totalSpent: stats.totalAmount,
      averageDaily: stats.averageDailyAmount,
      highestDay,
      highestCategory,
      budgetStatus,
      categoryBreakdown,
      dailyBreakdown
    }
  } catch (error) {
    console.error('获取预算分析失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取预算分析失败')
  }
}
