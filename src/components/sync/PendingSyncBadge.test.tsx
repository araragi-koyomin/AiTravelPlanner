import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PendingSyncBadge, SyncQueueStatus } from './PendingSyncBadge'
import { useSyncStore } from '@/stores/syncStore'

describe('PendingSyncBadge', () => {
  beforeEach(() => {
    useSyncStore.getState().reset()
  })

  describe('渲染测试', () => {
    it('无待同步操作时不应该渲染', () => {
      const { container } = render(<PendingSyncBadge />)
      expect(container.firstChild).toBeNull()
    })

    it('有待同步操作时应该渲染', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      render(<PendingSyncBadge />)

      expect(screen.getByText(/个操作待同步/)).toBeInTheDocument()
    })

    it('应该显示正确的待同步数量', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'expenses', {})
      render(<PendingSyncBadge />)

      expect(screen.getByText('2 个操作待同步')).toBeInTheDocument()
    })
  })

  describe('内容展示', () => {
    it('单个操作时应该显示单数', () => {
      useSyncStore.getState().addPendingOperation('delete', 'itinerary_items', {})
      render(<PendingSyncBadge />)

      expect(screen.getByText('1 个操作待同步')).toBeInTheDocument()
    })

    it('多个操作时应该显示总数', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'expenses', {})
      useSyncStore.getState().addPendingOperation('delete', 'itinerary_items', {})
      render(<PendingSyncBadge />)

      expect(screen.getByText('3 个操作待同步')).toBeInTheDocument()
    })

    it('清空操作后不应该渲染', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      render(<PendingSyncBadge />)

      expect(screen.queryByText(/个操作待同步/)).toBeInTheDocument()

      useSyncStore.getState().clearPendingOperations()

      const { container } = render(<PendingSyncBadge />)
      expect(container.firstChild).toBeNull()
    })

    it('className 应该正确应用', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      const { container } = render(<PendingSyncBadge className="custom-badge" />)

      expect(container.firstChild).toHaveClass('custom-badge')
    })
  })
})

describe('SyncQueueStatus', () => {
  beforeEach(() => {
    useSyncStore.getState().reset()
  })

  describe('渲染测试', () => {
    it('无待同步操作时不应该渲染', () => {
      const { container } = render(<SyncQueueStatus />)
      expect(container.firstChild).toBeNull()
    })

    it('有待同步操作时应该渲染队列状态', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      render(<SyncQueueStatus />)

      expect(screen.getByText(/待同步操作/)).toBeInTheDocument()
    })
  })

  describe('分组统计', () => {
    it('应该按表和操作类型分组显示', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'expenses', {})

      render(<SyncQueueStatus />)

      expect(screen.getByText('新建行程')).toBeInTheDocument()
      expect(screen.getByText('更新费用')).toBeInTheDocument()
    })

    it('同一类型多个操作应该显示数量', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})

      render(<SyncQueueStatus />)

      expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    })

    it('应该显示总操作数量', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      useSyncStore.getState().addPendingOperation('update', 'itinerary_items', {})
      useSyncStore.getState().addPendingOperation('delete', 'expenses', {})

      const { container } = render(<SyncQueueStatus />)

      expect(screen.getByText(/待同步操作/)).toBeInTheDocument()
      expect(container.textContent).toContain('(3)')
    })
  })

  describe('操作标签映射', () => {
    it('行程创建应该显示"新建行程"', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('新建行程')).toBeInTheDocument()
    })

    it('行程更新应该显示"更新行程"', () => {
      useSyncStore.getState().addPendingOperation('update', 'itineraries', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('更新行程')).toBeInTheDocument()
    })

    it('行程删除应该显示"删除行程"', () => {
      useSyncStore.getState().addPendingOperation('delete', 'itineraries', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('删除行程')).toBeInTheDocument()
    })

    it('行程项创建应该显示"新建行程项"', () => {
      useSyncStore.getState().addPendingOperation('create', 'itinerary_items', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('新建行程项')).toBeInTheDocument()
    })

    it('费用创建应该显示"新建费用"', () => {
      useSyncStore.getState().addPendingOperation('create', 'expenses', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('新建费用')).toBeInTheDocument()
    })

    it('费用删除应该显示"删除费用"', () => {
      useSyncStore.getState().addPendingOperation('delete', 'expenses', {})
      render(<SyncQueueStatus />)
      expect(screen.getByText('删除费用')).toBeInTheDocument()
    })
  })

  describe('样式和布局', () => {
    it('应该有蓝色边框样式', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      const { container } = render(<SyncQueueStatus />)
      expect(container.firstChild).toHaveClass('border-blue-200')
    })

    it('className 应该正确应用', () => {
      useSyncStore.getState().addPendingOperation('create', 'itineraries', {})
      const { container } = render(<SyncQueueStatus className="custom-status" />)
      expect(container.firstChild).toHaveClass('custom-status')
    })
  })
})
