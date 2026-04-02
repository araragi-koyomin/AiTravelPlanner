import { describe, it, expect } from 'vitest'
import {
  SYNC_STATUS_INFO,
  DEFAULT_SYNC_CONFIG,
  type SyncStatus,
  type OperationType,
  type SyncableTable
} from '@/types/sync'

describe('sync types', () => {
  describe('SYNC_STATUS_INFO', () => {
    it('应该包含所有同步状态', () => {
      const expectedStatuses: SyncStatus[] = ['syncing', 'synced', 'error']
      expectedStatuses.forEach((status) => {
        expect(SYNC_STATUS_INFO[status]).toBeDefined()
      })
    })

    it('每个状态应该有正确的 label、description、icon、color', () => {
      Object.entries(SYNC_STATUS_INFO).forEach(([status, info]) => {
        expect(info).toHaveProperty('status')
        expect(info).toHaveProperty('label')
        expect(info).toHaveProperty('description')
        expect(info).toHaveProperty('icon')
        expect(info).toHaveProperty('color')
        expect(info.status).toBe(status)
      })
    })

    it('syncing 状态应该有正确的信息', () => {
      const syncingInfo = SYNC_STATUS_INFO['syncing']
      expect(syncingInfo.label).toBe('同步中')
      expect(syncingInfo.description).toBe('正在同步数据...')
      expect(syncingInfo.icon).toBe('sync')
      expect(syncingInfo.color).toBe('blue')
    })

    it('synced 状态应该有正确的信息', () => {
      const syncedInfo = SYNC_STATUS_INFO['synced']
      expect(syncedInfo.label).toBe('已同步')
      expect(syncedInfo.description).toBe('数据已同步到云端')
      expect(syncedInfo.icon).toBe('check')
      expect(syncedInfo.color).toBe('green')
    })

    it('error 状态应该有正确的信息', () => {
      const errorInfo = SYNC_STATUS_INFO['error']
      expect(errorInfo.label).toBe('同步失败')
      expect(errorInfo.description).toBe('同步过程中发生错误')
      expect(errorInfo.icon).toBe('alert-circle')
      expect(errorInfo.color).toBe('red')
    })

    it('不应该包含 offline 状态', () => {
      expect(SYNC_STATUS_INFO['offline' as SyncStatus]).toBeUndefined()
    })
  })

  describe('DEFAULT_SYNC_CONFIG', () => {
    it('应该有正确的默认值', () => {
      expect(DEFAULT_SYNC_CONFIG.autoSync).toBe(true)
      expect(DEFAULT_SYNC_CONFIG.syncInterval).toBe(30000)
      expect(DEFAULT_SYNC_CONFIG.maxRetries).toBe(3)
      expect(DEFAULT_SYNC_CONFIG.retryDelay).toBe(1000)
    })

    it('autoSync 应该为 true', () => {
      expect(DEFAULT_SYNC_CONFIG.autoSync).toBe(true)
    })

    it('syncInterval 应该为 30000', () => {
      expect(DEFAULT_SYNC_CONFIG.syncInterval).toBe(30000)
    })

    it('maxRetries 应该为 3', () => {
      expect(DEFAULT_SYNC_CONFIG.maxRetries).toBe(3)
    })

    it('retryDelay 应该为 1000', () => {
      expect(DEFAULT_SYNC_CONFIG.retryDelay).toBe(1000)
    })
  })

  describe('类型定义', () => {
    it('SyncStatus 应该是有效的联合类型', () => {
      const validStatuses: SyncStatus[] = ['syncing', 'synced', 'error']
      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string')
      })
    })

    it('OperationType 应该是有效的联合类型', () => {
      const validTypes: OperationType[] = ['create', 'update', 'delete']
      validTypes.forEach((type) => {
        expect(typeof type).toBe('string')
      })
    })

    it('SyncableTable 应该是有效的联合类型', () => {
      const validTables: SyncableTable[] = [
        'itineraries',
        'itinerary_items',
        'expenses'
      ]
      validTables.forEach((table) => {
        expect(typeof table).toBe('string')
      })
    })
  })
})
