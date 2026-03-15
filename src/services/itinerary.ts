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
      is_favorite: false
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
        date: item.date,
        time: item.time,
        type: item.type,
        name: item.name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        description: item.description,
        cost: item.cost,
        duration: item.duration,
        order_index: item.order_index
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
        date: expense.date,
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
