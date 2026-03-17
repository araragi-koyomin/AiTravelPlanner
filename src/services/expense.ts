import { supabase, TablesInsert, TablesUpdate, TablesRow, SupabaseErrorClass, ExpenseCategory } from './supabase'

export type Expense = TablesRow<'expenses'>
export type ExpenseInsert = TablesInsert<'expenses'>
export type ExpenseUpdate = TablesUpdate<'expenses'>

export interface ExpenseQueryOptions {
  category?: ExpenseCategory
  startDate?: string
  endDate?: string
  orderBy?: 'date' | 'amount'
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
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
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
      amountByDate[expense.date] = (amountByDate[expense.date] || 0) + expense.amount
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
