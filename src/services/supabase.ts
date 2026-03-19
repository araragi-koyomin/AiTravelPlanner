import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type ActivityType = 'transport' | 'accommodation' | 'attraction' | 'restaurant' | 'activity' | 'shopping'

export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'entertainment' | 'other'

export type ItineraryStatus = 'draft' | 'generated' | 'in_progress' | 'completed' | 'archived'

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'alipay' | 'wechat' | 'other'

export interface LocationData {
  address: string
  lat: number
  lng: number
  poi_id?: string
  city?: string
  district?: string
}

export interface UserPreferences {
  favorite_destinations?: string[]
  travel_style?: string[]
  budget_preference?: string
  accommodation_type?: string[]
  diet_restrictions?: string[]
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          preferences: UserPreferences | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          preferences?: UserPreferences | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          preferences?: UserPreferences | null
          created_at?: string
          updated_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          participants: number
          preferences: string[] | null
          special_requirements: string | null
          travelers_type: string | null
          accommodation_pref: string | null
          pace: string | null
          is_favorite: boolean
          status: ItineraryStatus
          cover_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          participants: number
          preferences?: string[] | null
          special_requirements?: string | null
          travelers_type?: string | null
          accommodation_pref?: string | null
          pace?: string | null
          is_favorite?: boolean
          status?: ItineraryStatus
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number
          participants?: number
          preferences?: string[] | null
          special_requirements?: string | null
          travelers_type?: string | null
          accommodation_pref?: string | null
          pace?: string | null
          is_favorite?: boolean
          status?: ItineraryStatus
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_items: {
        Row: {
          id: string
          itinerary_id: string
          day: number
          time: string
          type: ActivityType
          name: string
          location: LocationData
          description: string | null
          cost: number | null
          duration: number | null
          tips: string | null
          image_url: string | null
          order_idx: number
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          day: number
          time: string
          type: ActivityType
          name: string
          location: LocationData
          description?: string | null
          cost?: number | null
          duration?: number | null
          tips?: string | null
          image_url?: string | null
          order_idx: number
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          day?: number
          time?: string
          type?: ActivityType
          name?: string
          location?: LocationData
          description?: string | null
          cost?: number | null
          duration?: number | null
          tips?: string | null
          image_url?: string | null
          order_idx?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          itinerary_id: string
          category: ExpenseCategory
          amount: number
          expense_date: string
          payment_method: PaymentMethod | null
          receipt_url: string | null
          notes: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          category: ExpenseCategory
          amount: number
          expense_date: string
          payment_method?: PaymentMethod | null
          receipt_url?: string | null
          notes?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          category?: ExpenseCategory
          amount?: number
          expense_date?: string
          payment_method?: PaymentMethod | null
          receipt_url?: string | null
          notes?: string | null
          description?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          zhipu_api_key: string | null
          xunfei_api_key: string | null
          amap_api_key: string | null
          theme: 'light' | 'dark'
          language: 'zh' | 'en'
          notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          zhipu_api_key?: string | null
          xunfei_api_key?: string | null
          amap_api_key?: string | null
          theme?: 'light' | 'dark'
          language?: 'zh' | 'en'
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          zhipu_api_key?: string | null
          xunfei_api_key?: string | null
          amap_api_key?: string | null
          theme?: 'light' | 'dark'
          language?: 'zh' | 'en'
          notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables = Database['public']['Tables']
export type TablesInsert<T extends keyof Tables> = Tables[T]['Insert']
export type TablesUpdate<T extends keyof Tables> = Tables[T]['Update']
export type TablesRow<T extends keyof Tables> = Tables[T]['Row']

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

export interface QueryResult<T> {
  data: T | null
  error: SupabaseError | null
}

export interface BatchResult<T> {
  data: T[] | null
  error: SupabaseError | null
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata: Record<string, unknown>
  app_metadata: Record<string, unknown>
  aud: string
  created_at: string
  updated_at?: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

export class SupabaseErrorClass extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export function handleSupabaseError(error: unknown): SupabaseErrorClass {
  if (error instanceof SupabaseErrorClass) {
    return error
  }

  const message = (error as { message?: string })?.message || '未知错误'
  const code = (error as { code?: string })?.code
  const details = (error as { details?: string })?.details
  const hint = (error as { hint?: string })?.hint

  return new SupabaseErrorClass(message, code, details, hint)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      throw handleSupabaseError(error)
    }

    return user
  } catch (error) {
    console.error('获取当前用户失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error('检查认证状态失败:', error)
    return false
  }
}

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthSession> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data.session) {
      throw new SupabaseErrorClass('注册失败，请检查邮箱验证')
    }

    return data.session
  } catch (error) {
    console.error('注册失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthSession> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data.session) {
      throw new SupabaseErrorClass('登录失败，请检查邮箱和密码')
    }

    return data.session
  } catch (error) {
    console.error('登录失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('登出失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('更新密码失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function createRecord<T extends keyof Tables>(
  table: T,
  recordData: TablesInsert<T>
): Promise<TablesRow<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(recordData)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建记录失败')
    }

    return data
  } catch (error) {
    console.error(`创建 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function readRecord<T extends keyof Tables>(
  table: T,
  id: string
): Promise<TablesRow<T> | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select()
      .eq('id', id)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  } catch (error) {
    console.error(`读取 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function readRecords<T extends keyof Tables>(
  table: T,
  filters?: Record<string, unknown>,
  options?: {
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    offset?: number
  }
): Promise<TablesRow<T>[]> {
  try {
    let query = supabase.from(table).select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
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
      throw handleSupabaseError(error)
    }

    return data || []
  } catch (error) {
    console.error(`读取 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function updateRecord<T extends keyof Tables>(
  table: T,
  id: string,
  recordData: TablesUpdate<T>
): Promise<TablesRow<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(recordData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新记录失败')
    }

    return data
  } catch (error) {
    console.error(`更新 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function deleteRecord<T extends keyof Tables>(
  table: T,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error(`删除 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function createRecords<T extends keyof Tables>(
  table: T,
  records: TablesInsert<T>[]
): Promise<TablesRow<T>[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data || []
  } catch (error) {
    console.error(`批量创建 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export async function deleteRecords<T extends keyof Tables>(
  table: T,
  ids: string[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error(`批量删除 ${String(table)} 记录失败:`, error)
    throw handleSupabaseError(error)
  }
}

export function subscribeToTable<T extends keyof Tables>(
  table: T,
  callback: (payload: unknown) => void
): () => void {
  const channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table as string
    }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToUserChanges(
  userId: string,
  callback: (payload: unknown) => void
): () => void {
  const channel = supabase
    .channel(`user:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function getSupabaseClient(): SupabaseClient {
  return supabase
}

export function isSupabaseError(error: unknown): error is SupabaseErrorClass {
  return error instanceof SupabaseErrorClass
}

export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) {
    return error.message
  }

  if ((error as { message?: string })?.message) {
    return (error as { message: string }).message
  }

  return '未知错误'
}
