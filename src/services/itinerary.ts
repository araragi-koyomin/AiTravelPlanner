import { supabase, TablesInsert, TablesUpdate, TablesRow, SupabaseErrorClass } from './supabase'

export type Itinerary = TablesRow<'itineraries'>
export type ItineraryInsert = TablesInsert<'itineraries'>
export type ItineraryUpdate = TablesUpdate<'itineraries'>

export interface ItineraryQueryOptions {
  isFavorite?: boolean
  destination?: string
  startDate?: string
  endDate?: string
  orderBy?: 'created_at' | 'start_date'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ItineraryStats {
  totalDays: number
  totalCost: number
  totalItems: number
  itemsByType: Record<string, number>
}

export interface BudgetBreakdown {
  transport: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  entertainment: number
  other: number
  total: number
}

export async function createItinerary(
  itineraryData: ItineraryInsert
): Promise<Itinerary> {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .insert(itineraryData)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`创建行程失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建行程失败')
    }

    return data
  } catch (error) {
    console.error('创建行程失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('创建行程失败')
  }
}

export async function getItineraries(
  userId: string,
  options?: ItineraryQueryOptions
): Promise<Itinerary[]> {
  try {
    let query = supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)

    if (options?.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite)
    }

    if (options?.destination) {
      query = query.ilike('destination', `%${options.destination}%`)
    }

    if (options?.startDate) {
      query = query.gte('start_date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('end_date', options.endDate)
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
      throw new SupabaseErrorClass(`获取行程列表失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('获取行程列表失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取行程列表失败')
  }
}

export async function getItineraryById(id: string): Promise<Itinerary | null> {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new SupabaseErrorClass(`获取行程失败: ${error.message}`, error.code)
    }

    return data
  } catch (error) {
    console.error('获取行程失败:', error)
    if (error instanceof SupabaseErrorClass) {
      throw error
    }
    return null
  }
}

export async function updateItinerary(
  id: string,
  itineraryData: ItineraryUpdate
): Promise<Itinerary> {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .update({
        ...itineraryData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`更新行程失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新行程失败')
    }

    return data
  } catch (error) {
    console.error('更新行程失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新行程失败')
  }
}

export async function deleteItinerary(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (error) {
      throw new SupabaseErrorClass(`删除行程失败: ${error.message}`, error.code)
    }
  } catch (error) {
    console.error('删除行程失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('删除行程失败')
  }
}

export async function duplicateItinerary(
  id: string,
  newTitle?: string
): Promise<Itinerary> {
  try {
    const originalItinerary = await getItineraryById(id)

    if (!originalItinerary) {
      throw new SupabaseErrorClass('原行程不存在')
    }

    const newItineraryData: ItineraryInsert = {
      user_id: originalItinerary.user_id,
      title: newTitle || `${originalItinerary.title} (副本)`,
      destination: originalItinerary.destination,
      start_date: originalItinerary.start_date,
      end_date: originalItinerary.end_date,
      budget: originalItinerary.budget,
      participants: originalItinerary.participants,
      preferences: originalItinerary.preferences,
      special_requirements: originalItinerary.special_requirements,
      travelers_type: originalItinerary.travelers_type,
      accommodation_pref: originalItinerary.accommodation_pref,
      pace: originalItinerary.pace,
      is_favorite: false,
      status: 'draft'
    }

    const newItinerary = await createItinerary(newItineraryData)

    const { data: items, error: itemsError } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('itinerary_id', id)

    if (itemsError) {
      throw new SupabaseErrorClass(`获取行程项失败: ${itemsError.message}`, itemsError.code)
    }

    if (items && items.length > 0) {
      const newItems = items.map(item => ({
        itinerary_id: newItinerary.id,
        day: item.day,
        time: item.time,
        type: item.type,
        name: item.name,
        location: item.location,
        description: item.description,
        cost: item.cost,
        duration: item.duration,
        tips: item.tips,
        image_url: item.image_url,
        order_idx: item.order_idx
      }))

      await supabase.from('itinerary_items').insert(newItems)
    }

    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('itinerary_id', id)

    if (expensesError) {
      throw new SupabaseErrorClass(`获取费用记录失败: ${expensesError.message}`, expensesError.code)
    }

    if (expenses && expenses.length > 0) {
      const newExpenses = expenses.map(expense => ({
        itinerary_id: newItinerary.id,
        category: expense.category,
        amount: expense.amount,
        expense_date: expense.expense_date,
        payment_method: expense.payment_method,
        receipt_url: expense.receipt_url,
        notes: expense.notes,
        description: expense.description
      }))

      await supabase.from('expenses').insert(newExpenses)
    }

    return newItinerary
  } catch (error) {
    console.error('复制行程失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('复制行程失败')
  }
}

export async function toggleFavorite(id: string): Promise<Itinerary> {
  try {
    const itinerary = await getItineraryById(id)

    if (!itinerary) {
      throw new SupabaseErrorClass('行程不存在')
    }

    const { data, error } = await supabase
      .from('itineraries')
      .update({ is_favorite: !itinerary.is_favorite })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`更新收藏状态失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新收藏状态失败')
    }

    return data
  } catch (error) {
    console.error('更新收藏状态失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新收藏状态失败')
  }
}

export async function getItineraryStats(id: string): Promise<ItineraryStats> {
  try {
    const itinerary = await getItineraryById(id)

    if (!itinerary) {
      throw new SupabaseErrorClass('行程不存在')
    }

    const startDate = new Date(itinerary.start_date)
    const endDate = new Date(itinerary.end_date)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const { data: items, error: itemsError } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('itinerary_id', id)

    if (itemsError) {
      throw new SupabaseErrorClass(`获取行程项失败: ${itemsError.message}`, itemsError.code)
    }

    const totalItems = items?.length || 0
    const itemsByType: Record<string, number> = {}

    if (items) {
      items.forEach(item => {
        itemsByType[item.type] = (itemsByType[item.type] || 0) + 1
      })
    }

    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('itinerary_id', id)

    if (expensesError) {
      throw new SupabaseErrorClass(`获取费用记录失败: ${expensesError.message}`, expensesError.code)
    }

    const totalCost = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

    return {
      totalDays,
      totalCost,
      totalItems,
      itemsByType
    }
  } catch (error) {
    console.error('获取行程统计失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取行程统计失败')
  }
}

export async function searchItineraries(
  userId: string,
  keyword: string,
  options?: ItineraryQueryOptions
): Promise<Itinerary[]> {
  try {
    let query = supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${keyword}%,destination.ilike.%${keyword}%,special_requirements.ilike.%${keyword}%`)

    if (options?.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite)
    }

    if (options?.startDate) {
      query = query.gte('start_date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('end_date', options.endDate)
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
      throw new SupabaseErrorClass(`搜索行程失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('搜索行程失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('搜索行程失败')
  }
}

export type ItineraryItem = TablesRow<'itinerary_items'>

export async function getItineraryItems(itineraryId: string): Promise<ItineraryItem[]> {
  try {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('day', { ascending: true })
      .order('order_idx', { ascending: true })

    if (error) {
      throw new SupabaseErrorClass(`获取行程项失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('获取行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取行程项失败')
  }
}

export interface DailyScheduleBuilt {
  day: number
  date: string
  dayOfWeek: string
  theme: string
  items: ItineraryItem[]
}

export function buildDailySchedule(
  startDate: string,
  endDate: string,
  items: ItineraryItem[]
): DailyScheduleBuilt[] {
  const schedule: DailyScheduleBuilt[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dayThemes = ['探索之旅', '文化体验', '休闲时光', '美食之旅', '自然风光', '购物狂欢', '告别之旅']

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + dayIndex)
    const dateString = currentDate.toISOString().split('T')[0]
    const dayOfWeek = getDayOfWeekLabel(dateString)
    const dayNumber = dayIndex + 1
    const dayItems = items.filter(item => item.day === dayNumber)

    schedule.push({
      day: dayNumber,
      date: dateString,
      dayOfWeek,
      theme: dayThemes[dayIndex % dayThemes.length],
      items: dayItems
    })
  }

  return schedule
}

export function buildBudgetBreakdown(items: ItineraryItem[]): {
  transport: number
  accommodation: number
  food: number
  tickets: number
  shopping: number
  entertainment: number
  other: number
  total: number
} {
  const breakdown = {
    transport: 0,
    accommodation: 0,
    food: 0,
    tickets: 0,
    shopping: 0,
    entertainment: 0,
    other: 0,
    total: 0
  }

  const typeToCategory: Record<string, keyof typeof breakdown> = {
    transport: 'transport',
    accommodation: 'accommodation',
    restaurant: 'food',
    attraction: 'tickets',
    shopping: 'shopping',
    activity: 'entertainment'
  }

  for (const item of items) {
    const category = typeToCategory[item.type] || 'other'
    const itemCost = item.cost || 0
    breakdown[category] += itemCost
    breakdown.total += itemCost
  }

  return breakdown
}

function getDayOfWeekLabel(dateString: string): string {
  const DAY_OF_WEEK_LABELS: Record<number, string> = {
    0: '星期日',
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六'
  }
  const date = new Date(dateString)
  return DAY_OF_WEEK_LABELS[date.getDay()]
}

export type ItineraryItemInsert = TablesInsert<'itinerary_items'>
export type ItineraryItemUpdate = TablesUpdate<'itinerary_items'>

export async function createItineraryItem(
  itemData: ItineraryItemInsert
): Promise<ItineraryItem> {
  try {
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert(itemData)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`创建行程项失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建行程项失败')
    }

    return data
  } catch (error) {
    console.error('创建行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('创建行程项失败')
  }
}

export async function updateItineraryItem(
  id: string,
  itemData: ItineraryItemUpdate
): Promise<ItineraryItem> {
  try {
    const { data, error } = await supabase
      .from('itinerary_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`更新行程项失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新行程项失败')
    }

    return data
  } catch (error) {
    console.error('更新行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新行程项失败')
  }
}

export async function deleteItineraryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('id', id)

    if (error) {
      throw new SupabaseErrorClass(`删除行程项失败: ${error.message}`, error.code)
    }
  } catch (error) {
    console.error('删除行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('删除行程项失败')
  }
}

export async function batchCreateItineraryItems(
  items: ItineraryItemInsert[]
): Promise<ItineraryItem[]> {
  try {
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert(items)
      .select()

    if (error) {
      throw new SupabaseErrorClass(`批量创建行程项失败: ${error.message}`, error.code)
    }

    return data || []
  } catch (error) {
    console.error('批量创建行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('批量创建行程项失败')
  }
}

export async function batchUpdateItineraryItems(
  updates: Array<{ id: string; data: ItineraryItemUpdate }>
): Promise<ItineraryItem[]> {
  try {
    const results: ItineraryItem[] = []

    for (const { id, data } of updates) {
      const updated = await updateItineraryItem(id, data)
      results.push(updated)
    }

    return results
  } catch (error) {
    console.error('批量更新行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('批量更新行程项失败')
  }
}

export async function batchDeleteItineraryItems(ids: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .in('id', ids)

    if (error) {
      throw new SupabaseErrorClass(`批量删除行程项失败: ${error.message}`, error.code)
    }
  } catch (error) {
    console.error('批量删除行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('批量删除行程项失败')
  }
}

export async function reorderItineraryItems(
  itineraryId: string,
  orders: Array<{ id: string; day: number; order_idx: number }>
): Promise<void> {
  try {
    for (const { id, day, order_idx } of orders) {
      await supabase
        .from('itinerary_items')
        .update({ day, order_idx })
        .eq('id', id)
        .eq('itinerary_id', itineraryId)
    }
  } catch (error) {
    console.error('重排序行程项失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('重排序行程项失败')
  }
}
