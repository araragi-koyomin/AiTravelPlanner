import { supabase } from './supabase'
import type { Itinerary, ItineraryItem, Expense } from './types'
import type {
  RealtimeSubscriptionCallback,
  SubscriptionOptions
} from '@/types/sync'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

type RealtimeSubscribeStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | string

const activeChannels: Map<string, RealtimeChannel> = new Map()

function logSubscriptionStatus(channelName: string, status: RealtimeSubscribeStatus): void {
  const prefix = `[Realtime:${channelName}]`
  switch (status) {
    case 'SUBSCRIBED':
      console.log(`${prefix} ✅ 订阅成功`)
      break
    case 'CHANNEL_ERROR':
      console.error(`${prefix} ❌ 频道错误 - 请检查 Supabase Replication 配置，确认表已添加到 supabase_realtime Publication`)
      break
    case 'TIMED_OUT':
      console.warn(`${prefix} ⏰ 订阅超时`)
      break
    case 'CLOSED':
      console.log(`${prefix} 🔒 连接已关闭`)
      break
    default:
      console.log(`${prefix} 状态变更: ${status}`)
  }
}

function logEventReceived(channelName: string, eventType: string, table: string, recordId?: string): void {
  console.log(`[Realtime:${channelName}] 📨 收到 ${table}.${eventType} 事件${recordId ? ` (id=${recordId})` : ''}`)
}

export function subscribeToItineraries(
  userId: string,
  onInsert: (itinerary: Itinerary) => void,
  onUpdate: (itinerary: Itinerary) => void,
  onDelete: (id: string) => void
): () => void {
  const channelName = `itineraries:user:${userId}`

  console.log(`[Realtime] 正在创建行程订阅: ${channelName}, userId=${userId}`)

  if (activeChannels.has(channelName)) {
    const existingChannel = activeChannels.get(channelName)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }
  }

  const channel = supabase
    .channel(channelName)
    .on<Itinerary>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'itineraries',
        filter: `user_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<Itinerary>) => {
        logEventReceived(channelName, payload.eventType, 'itineraries', (payload.new as Itinerary)?.id)
        handleItineraryChange(payload, onInsert, onUpdate, onDelete)
      }
    )
    .subscribe((status) => {
      logSubscriptionStatus(channelName, status)
    })

  activeChannels.set(channelName, channel)

  return () => {
    console.log(`[Realtime] 取消订阅: ${channelName}`)
    const ch = activeChannels.get(channelName)
    if (ch) {
      supabase.removeChannel(ch)
      activeChannels.delete(channelName)
    }
  }
}

function handleItineraryChange(
  payload: RealtimePostgresChangesPayload<Itinerary>,
  onInsert: (itinerary: Itinerary) => void,
  onUpdate: (itinerary: Itinerary) => void,
  onDelete: (id: string) => void
): void {
  const { eventType, new: newRecord, old, errors } = payload

  if (errors && errors.length > 0) {
    console.error(`[Realtime] ❌ itineraries.${eventType} 错误:`, errors)
    return
  }

  switch (eventType) {
    case 'INSERT':
      if (newRecord) {
        onInsert(newRecord as Itinerary)
      }
      break
    case 'UPDATE':
      if (newRecord) {
        onUpdate(newRecord as Itinerary)
      }
      break
    case 'DELETE':
      if (old && 'id' in old) {
        onDelete((old as { id: string }).id)
      } else {
        console.warn(`[Realtime] ⚠️ itineraries.DELETE: old 记录缺失或无 id 字段`, { old })
      }
      break
  }
}

export function subscribeToItineraryItems(
  itineraryId: string,
  onInsert: (item: ItineraryItem) => void,
  onUpdate: (item: ItineraryItem) => void,
  onDelete: (id: string) => void
): () => void {
  const channelName = `itinerary_items:itinerary:${itineraryId}`

  console.log(`[Realtime] 正在创建行程项订阅: ${channelName}, itineraryId=${itineraryId}`)

  if (activeChannels.has(channelName)) {
    const existingChannel = activeChannels.get(channelName)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }
  }

  const channel = supabase
    .channel(channelName)
    .on<ItineraryItem>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'itinerary_items',
        filter: `itinerary_id=eq.${itineraryId}`
      },
      (payload: RealtimePostgresChangesPayload<ItineraryItem>) => {
        logEventReceived(channelName, payload.eventType, 'itinerary_items', (payload.new as ItineraryItem)?.id)
        handleItineraryItemChange(payload, onInsert, onUpdate, onDelete)
      }
    )
    .subscribe((status) => {
      logSubscriptionStatus(channelName, status)
    })

  activeChannels.set(channelName, channel)

  return () => {
    console.log(`[Realtime] 取消订阅: ${channelName}`)
    const ch = activeChannels.get(channelName)
    if (ch) {
      supabase.removeChannel(ch)
      activeChannels.delete(channelName)
    }
  }
}

function handleItineraryItemChange(
  payload: RealtimePostgresChangesPayload<ItineraryItem>,
  onInsert: (item: ItineraryItem) => void,
  onUpdate: (item: ItineraryItem) => void,
  onDelete: (id: string) => void
): void {
  const { eventType, new: newRecord, old, errors } = payload

  if (errors && errors.length > 0) {
    console.error(`[Realtime] ❌ itinerary_items.${eventType} 错误:`, errors)
    return
  }

  switch (eventType) {
    case 'INSERT':
      if (newRecord) {
        onInsert(newRecord as ItineraryItem)
      }
      break
    case 'UPDATE':
      if (newRecord) {
        onUpdate(newRecord as ItineraryItem)
      }
      break
    case 'DELETE':
      if (old && 'id' in old) {
        onDelete((old as { id: string }).id)
      } else {
        console.warn(`[Realtime] ⚠️ itinerary_items.DELETE: old 记录缺失或无 id 字段`, { old })
      }
      break
  }
}

export function subscribeToExpenses(
  itineraryId: string,
  onInsert: (expense: Expense) => void,
  onUpdate: (expense: Expense) => void,
  onDelete: (id: string) => void
): () => void {
  const channelName = `expenses:itinerary:${itineraryId}`

  console.log(`[Realtime] 正在创建费用订阅: ${channelName}, itineraryId=${itineraryId}`)

  if (activeChannels.has(channelName)) {
    const existingChannel = activeChannels.get(channelName)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }
  }

  const channel = supabase
    .channel(channelName)
    .on<Expense>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `itinerary_id=eq.${itineraryId}`
      },
      (payload: RealtimePostgresChangesPayload<Expense>) => {
        logEventReceived(channelName, payload.eventType, 'expenses', (payload.new as Expense)?.id)
        handleExpenseChange(payload, onInsert, onUpdate, onDelete)
      }
    )
    .subscribe((status) => {
      logSubscriptionStatus(channelName, status)
    })

  activeChannels.set(channelName, channel)

  return () => {
    console.log(`[Realtime] 取消订阅: ${channelName}`)
    const ch = activeChannels.get(channelName)
    if (ch) {
      supabase.removeChannel(ch)
      activeChannels.delete(channelName)
    }
  }
}

function handleExpenseChange(
  payload: RealtimePostgresChangesPayload<Expense>,
  onInsert: (expense: Expense) => void,
  onUpdate: (expense: Expense) => void,
  onDelete: (id: string) => void
): void {
  const { eventType, new: newRecord, old, errors } = payload

  if (errors && errors.length > 0) {
    console.error(`[Realtime] ❌ expenses.${eventType} 错误:`, errors)
    return
  }

  switch (eventType) {
    case 'INSERT':
      if (newRecord) {
        onInsert(newRecord as Expense)
      }
      break
    case 'UPDATE':
      if (newRecord) {
        onUpdate(newRecord as Expense)
      }
      break
    case 'DELETE':
      if (old && 'id' in old) {
        onDelete((old as { id: string }).id)
      } else {
        console.warn(`[Realtime] ⚠️ expenses.DELETE: old 记录缺失或无 id 字段`, { old })
      }
      break
  }
}

export function createSubscription<T extends Record<string, unknown>>(
  options: SubscriptionOptions,
  callback: RealtimeSubscriptionCallback<T>
): () => void {
  const { table, filter, enabled = true } = options

  if (!enabled) {
    return () => {}
  }

  const channelName = filter
    ? `${table}:${filter.column}:${filter.value}`
    : `${table}:all`

  console.log(`[Realtime] 正在创建通用订阅: ${channelName}`)

  if (activeChannels.has(channelName)) {
    const existingChannel = activeChannels.get(channelName)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }
  }

  const postgresChangesConfig: {
    event: string
    schema: string
    table: string
    filter?: string
  } = {
    event: '*',
    schema: 'public',
    table: table
  }

  if (filter) {
    const filterValue = Array.isArray(filter.value)
      ? `(${filter.value.join(',')})`
      : filter.value
    postgresChangesConfig.filter = `${filter.column}=${filter.operator}.${filterValue}`
  }

  const channel = supabase.channel(channelName)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(channel as any).on(
      'postgres_changes',
      postgresChangesConfig,
      (payload: unknown) => {
        logEventReceived(channelName, (payload as Record<string, unknown>).eventType as string, table)
        callback(payload as RealtimePostgresChangesPayload<T>)
      }
    )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(channel as any).subscribe((status: RealtimeSubscribeStatus) => {
      logSubscriptionStatus(channelName, status)
    })

  activeChannels.set(channelName, channel)

  return () => {
    console.log(`[Realtime] 取消订阅: ${channelName}`)
    const ch = activeChannels.get(channelName)
    if (ch) {
      supabase.removeChannel(ch)
      activeChannels.delete(channelName)
    }
  }
}

export function unsubscribeAll(): void {
  console.log(`[Realtime] 取消所有订阅 (共 ${activeChannels.size} 个)`)
  activeChannels.forEach((channel) => {
    supabase.removeChannel(channel)
  })
  activeChannels.clear()
}

export function getActiveSubscriptionCount(): number {
  return activeChannels.size
}
