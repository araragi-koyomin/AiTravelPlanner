import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  SyncStatus,
  SyncState,
  PendingOperation,
  OperationType,
  SyncableTable
} from '@/types/sync'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export interface SyncStore extends SyncState {
  setStatus: (status: SyncStatus) => void
  setLastSyncTime: (time: Date | null) => void
  setError: (error: string | null) => void

  addPendingOperation: (
    type: OperationType,
    table: SyncableTable,
    data: Record<string, unknown>
  ) => string

  removePendingOperation: (id: string) => void
  clearPendingOperations: () => void
  incrementRetryCount: (id: string) => void

  getPendingOperations: () => PendingOperation[]
  getPendingCount: () => number

  markSyncing: () => void
  markSynced: () => void
  markError: (error: string) => void

  reset: () => void
}

const initialState: SyncState = {
  status: 'synced',
  lastSyncTime: null,
  pendingOperations: [],
  error: null
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStatus: (status) => {
        set({ status })
      },

      setLastSyncTime: (time) => {
        set({ lastSyncTime: time })
      },

      setError: (error) => {
        set({ error })
      },

      addPendingOperation: (type, table, data) => {
        const id = generateId()
        const operation: PendingOperation = {
          id,
          type,
          table,
          data,
          timestamp: new Date(),
          retryCount: 0
        }

        set((state) => ({
          pendingOperations: [...state.pendingOperations, operation]
        }))

        return id
      },

      removePendingOperation: (id) => {
        set((state) => ({
          pendingOperations: state.pendingOperations.filter((op) => op.id !== id)
        }))
      },

      clearPendingOperations: () => {
        set({ pendingOperations: [] })
      },

      incrementRetryCount: (id) => {
        set((state) => ({
          pendingOperations: state.pendingOperations.map((op) =>
            op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op
          )
        }))
      },

      getPendingOperations: () => {
        return get().pendingOperations
      },

      getPendingCount: () => {
        return get().pendingOperations.length
      },

      markSyncing: () => {
        set({ status: 'syncing', error: null })
      },

      markSynced: () => {
        set({
          status: 'synced',
          lastSyncTime: new Date(),
          error: null
        })
      },

      markError: (error) => {
        set({ status: 'error', error })
      },

      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pendingOperations: state.pendingOperations.map((op) => ({
          ...op,
          timestamp: op.timestamp instanceof Date ? op.timestamp.toISOString() : op.timestamp
        })),
        lastSyncTime: state.lastSyncTime instanceof Date 
          ? state.lastSyncTime.toISOString() 
          : state.lastSyncTime
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof state.lastSyncTime === 'string') {
            state.lastSyncTime = new Date(state.lastSyncTime)
          }
          state.pendingOperations = state.pendingOperations.map((op) => ({
            ...op,
            timestamp: typeof op.timestamp === 'string' ? new Date(op.timestamp) : op.timestamp
          }))
        }
      }
    }
  )
)

export function useSyncStatus(): SyncStatus {
  return useSyncStore((state) => state.status)
}

export function usePendingCount(): number {
  return useSyncStore((state) => state.pendingOperations.length)
}

export function useLastSyncTime(): Date | null {
  return useSyncStore((state) => state.lastSyncTime)
}

export async function withSyncStatus<T>(operation: () => Promise<T>): Promise<T> {
  const { markSyncing, markSynced, markError } = useSyncStore.getState()
  markSyncing()
  try {
    const result = await operation()
    markSynced()
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败'
    markError(message)
    throw err
  }
}
