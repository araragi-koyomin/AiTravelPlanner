import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSyncStore, useSyncStatus, usePendingCount, useLastSyncTime, withSyncStatus } from '@/stores/syncStore'
import type { SyncStatus } from '@/types/sync'

describe('syncStore', () => {
  beforeEach(() => {
    useSyncStore.getState().reset()
  })

  describe('初始状态', () => {
    it('status 应该为 synced', () => {
      const store = useSyncStore.getState()
      expect(store.status).toBe('synced')
    })

    it('lastSyncTime 应该为 null', () => {
      const store = useSyncStore.getState()
      expect(store.lastSyncTime).toBeNull()
    })

    it('pendingOperations 应该为空数组', () => {
      const store = useSyncStore.getState()
      expect(store.pendingOperations).toEqual([])
    })

    it('error 应该为 null', () => {
      const store = useSyncStore.getState()
      expect(store.error).toBeNull()
    })
  })

  describe('setStatus', () => {
    it('应该正确设置状态', () => {
      useSyncStore.getState().setStatus('syncing')
      expect(useSyncStore.getState().status).toBe('syncing')

      useSyncStore.getState().setStatus('error')
      expect(useSyncStore.getState().status).toBe('error')

      useSyncStore.getState().setStatus('synced')
      expect(useSyncStore.getState().status).toBe('synced')
    })
  })

  describe('setLastSyncTime', () => {
    it('应该正确设置最后同步时间', () => {
      const now = new Date()
      useSyncStore.getState().setLastSyncTime(now)
      expect(useSyncStore.getState().lastSyncTime).toEqual(now)
    })

    it('应该接受 null 值', () => {
      useSyncStore.getState().setLastSyncTime(new Date())
      useSyncStore.getState().setLastSyncTime(null)
      expect(useSyncStore.getState().lastSyncTime).toBeNull()
    })
  })

  describe('setError', () => {
    it('应该正确设置错误信息', () => {
      useSyncStore.getState().setError('网络连接失败')
      expect(useSyncStore.getState().error).toBe('网络连接失败')
    })

    it('应该接受 null 值', () => {
      useSyncStore.getState().setError('error')
      useSyncStore.getState().setError(null)
      expect(useSyncStore.getState().error).toBeNull()
    })
  })

  describe('addPendingOperation', () => {
    it('应该添加操作到队列', () => {
      useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        { title: 'Test' }
      )

      const ops = useSyncStore.getState().pendingOperations
      expect(ops.length).toBe(1)
      expect(ops[0].type).toBe('create')
      expect(ops[0].table).toBe('itineraries')
      expect(ops[0].data).toEqual({ title: 'Test' })
    })

    it('应该返回操作 ID', () => {
      const id = useSyncStore.getState().addPendingOperation(
        'update',
        'expenses',
        { amount: 100 }
      )

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('应该生成唯一 ID', () => {
      const id1 = useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )
      const id2 = useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )

      expect(id1).not.toBe(id2)
    })

    it('应该设置正确的 timestamp', () => {
      const before = new Date()
      useSyncStore.getState().addPendingOperation(
        'delete',
        'itinerary_items',
        { id: '1' }
      )
      const after = new Date()

      const op = useSyncStore.getState().pendingOperations[0]
      expect(op.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(op.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('retryCount 应该初始化为 0', () => {
      useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )

      const op = useSyncStore.getState().pendingOperations[0]
      expect(op.retryCount).toBe(0)
    })
  })

  describe('removePendingOperation', () => {
    it('应该从队列移除操作', () => {
      const id = useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )
      expect(useSyncStore.getState().pendingOperations.length).toBe(1)

      useSyncStore.getState().removePendingOperation(id)
      expect(useSyncStore.getState().pendingOperations.length).toBe(0)
    })

    it('操作不存在时应该不报错', () => {
      expect(() =>
        useSyncStore.getState().removePendingOperation('non-existent-id')
      ).not.toThrow()
    })
  })

  describe('clearPendingOperations', () => {
    it('应该清空操作队列', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'expenses', {})
      expect(useSyncStore.getState().pendingOperations.length).toBe(2)

      useSyncStore.getState().clearPendingOperations()
      expect(useSyncStore.getState().pendingOperations.length).toBe(0)
    })
  })

  describe('incrementRetryCount', () => {
    it('应该增加指定操作的重试次数', () => {
      const id = useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )

      expect(useSyncStore.getState().pendingOperations[0].retryCount).toBe(0)

      useSyncStore.getState().incrementRetryCount(id)
      expect(useSyncStore.getState().pendingOperations[0].retryCount).toBe(1)

      useSyncStore.getState().incrementRetryCount(id)
      expect(useSyncStore.getState().pendingOperations[0].retryCount).toBe(2)
    })

    it('不影响其他操作', () => {
      const id1 = useSyncStore.getState().addPendingOperation(
        'create',
        'itineraries',
        {}
      )
      const id2 = useSyncStore.getState().addPendingOperation(
        'update',
        'expenses',
        {}
      )

      useSyncStore.getState().incrementRetryCount(id1)

      const op1 = useSyncStore.getState().pendingOperations.find((op) => op.id === id1)
      const op2 = useSyncStore.getState().pendingOperations.find((op) => op.id === id2)
      expect(op1?.retryCount).toBe(1)
      expect(op2?.retryCount).toBe(0)
    })
  })

  describe('getPendingOperations', () => {
    it('应该返回所有待同步操作', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'expenses', {})

      const ops = useSyncStore.getState().getPendingOperations()
      expect(ops.length).toBe(2)
    })
  })

  describe('getPendingCount', () => {
    it('应该返回待同步操作数量', () => {
      expect(useSyncStore.getState().getPendingCount()).toBe(0)

      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      expect(useSyncStore.getState().getPendingCount()).toBe(1)

      useSyncStore.getState().addPendingOperation('update', 'expenses', {})
      expect(useSyncStore.getState().getPendingCount()).toBe(2)
    })
  })

  describe('markSyncing', () => {
    it('应该设置 status 为 syncing', () => {
      useSyncStore.getState().markSyncing()
      expect(useSyncStore.getState().status).toBe('syncing')
    })

    it('应该清除 error', () => {
      useSyncStore.getState().setError('some error')
      useSyncStore.getState().markSyncing()
      expect(useSyncStore.getState().error).toBeNull()
    })
  })

  describe('markSynced', () => {
    it('应该设置 status 为 synced', () => {
      useSyncStore.getState().markSynced()
      expect(useSyncStore.getState().status).toBe('synced')
    })

    it('应该设置 lastSyncTime', () => {
      const before = new Date()
      useSyncStore.getState().markSynced()
      const after = new Date()

      const syncTime = useSyncStore.getState().lastSyncTime
      expect(syncTime).not.toBeNull()
      if (syncTime) {
        expect(syncTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
        expect(syncTime.getTime()).toBeLessThanOrEqual(after.getTime())
      }
    })

    it('应该清除 error', () => {
      useSyncStore.getState().setError('error msg')
      useSyncStore.getState().markSynced()
      expect(useSyncStore.getState().error).toBeNull()
    })
  })

  describe('markError', () => {
    it('应该设置 status 为 error', () => {
      useSyncStore.getState().markError('同步失败')
      expect(useSyncStore.getState().status).toBe('error')
    })

    it('应该设置 error 信息', () => {
      useSyncStore.getState().markError('网络超时')
      expect(useSyncStore.getState().error).toBe('网络超时')
    })
  })

  describe('reset', () => {
    it('应该重置所有状态到初始值', () => {
      useSyncStore.getState().setStatus('syncing')
      useSyncStore.getState().setLastSyncTime(new Date())
      useSyncStore.getState().setError('error')
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})

      useSyncStore.getState().reset()

      const state = useSyncStore.getState()
      expect(state.status).toBe('synced')
      expect(state.lastSyncTime).toBeNull()
      expect(state.error).toBeNull()
      expect(state.pendingOperations).toEqual([])
    })
  })

  describe('selector hooks', () => {
    it('useSyncStatus 应该返回当前状态', () => {
      useSyncStore.getState().setStatus('syncing')

      const { result } = renderHook(() => useSyncStatus())
      expect(result.current).toBe('syncing')

      useSyncStore.setState({ status: 'synced' })

      const { result: result2 } = renderHook(() => useSyncStatus())
      expect(result2.current).toBe('synced')
    })

    it('usePendingCount 应该返回待同步数量', () => {
      const { result } = renderHook(() => usePendingCount())
      expect(result.current).toBe(0)

      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})

      const { result: result2 } = renderHook(() => usePendingCount())
      expect(result2.current).toBe(1)
    })

    it('useLastSyncTime 应该返回最后同步时间', () => {
      const { result } = renderHook(() => useLastSyncTime())
      expect(result.current).toBeNull()

      const now = new Date()
      useSyncStore.getState().setLastSyncTime(now)

      const { result: result2 } = renderHook(() => useLastSyncTime())
      expect(result2.current).toEqual(now)
    })
  })

  describe('withSyncStatus', () => {
    beforeEach(() => {
      useSyncStore.setState({ status: 'synced', error: null })
    })

    it('操作成功时应显示同步中然后已同步', async () => {
      const mockFn = vi.fn().mockResolvedValue('result')

      const result = await withSyncStatus(mockFn)

      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalledTimes(1)
      const statusHistory = useSyncStore.getState().status
      expect(statusHistory).toBe('synced')
    })

    it('操作失败时应显示错误状态', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('网络错误'))

      await expect(withSyncStatus(mockFn)).rejects.toThrow('网络错误')
      expect(useSyncStore.getState().status).toBe('error')
      expect(useSyncStore.getState().error).toBe('网络错误')
    })

    it('操作前应先设置为 syncing 状态', async () => {
      let statusDuringExecution: SyncStatus | null = null
      const mockFn = vi.fn().mockImplementation(async () => {
        statusDuringExecution = useSyncStore.getState().status
        return 'ok'
      })

      await withSyncStatus(mockFn)
      expect(statusDuringExecution).toBe('syncing')
    })
  })
})
