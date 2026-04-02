import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Itinerary, ItineraryItem, Expense } from '@/services/types'

export type SyncStatus = 'syncing' | 'synced' | 'error'

export type OperationType = 'create' | 'update' | 'delete'

export type SyncableTable = 'itineraries' | 'itinerary_items' | 'expenses'

export interface PendingOperation {
  id: string
  type: OperationType
  table: SyncableTable
  data: Record<string, unknown>
  timestamp: Date
  retryCount: number
}

export interface SyncState {
  status: SyncStatus
  lastSyncTime: Date | null
  pendingOperations: PendingOperation[]
  error: string | null
}

export interface RealtimeEvent<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: T
  oldRecord?: T
  commit_timestamp: string
}

export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T | null
  schema: string
  table: string
  commit_timestamp: string
  errors: string[] | null
}

export interface SyncConfig {
  autoSync: boolean
  syncInterval: number
  maxRetries: number
  retryDelay: number
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000,
  maxRetries: 3,
  retryDelay: 1000
}

export interface SyncStatusInfo {
  status: SyncStatus
  label: string
  description: string
  icon: 'sync' | 'check' | 'alert-circle'
  color: 'blue' | 'green' | 'red'
}

export const SYNC_STATUS_INFO: Record<SyncStatus, SyncStatusInfo> = {
  syncing: {
    status: 'syncing',
    label: '同步中',
    description: '正在同步数据...',
    icon: 'sync',
    color: 'blue'
  },
  synced: {
    status: 'synced',
    label: '已同步',
    description: '数据已同步到云端',
    icon: 'check',
    color: 'green'
  },
  error: {
    status: 'error',
    label: '同步失败',
    description: '同步过程中发生错误',
    icon: 'alert-circle',
    color: 'red'
  }
}

export interface SyncActionResult {
  success: boolean
  syncedCount: number
  failedCount: number
  errors: string[]
}

export type RealtimeSubscriptionCallback<T extends Record<string, unknown> = Record<string, unknown>> = (
  event: RealtimePostgresChangesPayload<T>
) => void

export interface SubscriptionOptions {
  table: SyncableTable
  filter?: {
    column: string
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in'
    value: string | number | string[] | number[]
  }
  enabled?: boolean
}

export interface ItineraryRealtimePayload extends RealtimePayload<Itinerary> {}

export interface ItineraryItemRealtimePayload extends RealtimePayload<ItineraryItem> {}

export interface ExpenseRealtimePayload extends RealtimePayload<Expense> {}
