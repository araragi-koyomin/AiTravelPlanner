import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncStatusIndicator, SyncStatusBadge } from './SyncStatusIndicator'
import { useSyncStore } from '@/stores/syncStore'

describe('SyncStatusIndicator', () => {
  beforeEach(() => {
    useSyncStore.getState().reset()
  })

  describe('渲染测试', () => {
    it('应该正常渲染组件', () => {
      const { container } = render(<SyncStatusIndicator />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('syncing 状态应该显示同步中标签', () => {
      useSyncStore.setState({ status: 'syncing' })
      render(<SyncStatusIndicator />)

      expect(screen.getByText('同步中')).toBeInTheDocument()
    })

    it('synced 状态应该显示已同步标签', () => {
      useSyncStore.setState({ status: 'synced' })
      render(<SyncStatusIndicator />)

      expect(screen.getByText('已同步')).toBeInTheDocument()
    })

    it('error 状态应该显示同步失败标签', () => {
      useSyncStore.setState({ status: 'error' })
      render(<SyncStatusIndicator />)

      expect(screen.getByText('同步失败')).toBeInTheDocument()
    })
  })

  describe('状态展示测试', () => {
    it('syncing 状态应该显示旋转动画图标', () => {
      useSyncStore.setState({ status: 'syncing' })
      const { container } = render(<SyncStatusIndicator />)

      const icon = container.querySelector('.animate-spin')
      expect(icon).not.toBeNull()
    })

    it('synced 状态且 showLastSync 时应该显示上次同步时间', () => {
      useSyncStore.setState({
        status: 'synced',
        lastSyncTime: new Date()
      })
      render(<SyncStatusIndicator showLastSync={true} />)

      expect(screen.getByText(/上次同步/)).toBeInTheDocument()
    })

    it('synced 状态且无 lastSyncTime 时不应显示上次同步时间', () => {
      useSyncStore.setState({
        status: 'synced',
        lastSyncTime: null
      })
      render(<SyncStatusIndicator showLastSync={true} />)

      expect(screen.queryByText(/上次同步/)).not.toBeInTheDocument()
    })

    it('error 状态应该显示错误提示信息', () => {
      useSyncStore.setState({ status: 'error' })
      render(<SyncStatusIndicator />)

      expect(screen.getByText(/请检查网络连接/)).toBeInTheDocument()
    })
  })

  describe('props 测试', () => {
    it('showLabel=false 时应该隐藏标签文字', () => {
      useSyncStore.setState({ status: 'syncing' })
      render(<SyncStatusIndicator showLabel={false} />)

      expect(screen.queryByText('同步中')).not.toBeInTheDocument()
    })

    it('showLastSync=false 时应该隐藏同步时间', () => {
      useSyncStore.setState({
        status: 'synced',
        lastSyncTime: new Date()
      })
      render(<SyncStatusIndicator showLastSync={false} />)

      expect(screen.queryByText(/上次同步/)).not.toBeInTheDocument()
    })

    it('className 应该正确应用', () => {
      const { container } = render(
        <SyncStatusIndicator className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('不同状态应该有对应的颜色样式', () => {
      const { container: syncingContainer } = (() => {
        useSyncStore.setState({ status: 'syncing' })
        return render(<SyncStatusIndicator />)
      })()
      expect(syncingContainer.querySelector('.text-blue-500')).not.toBeNull()

      useSyncStore.setState({ status: 'synced' })
      const { container: syncedContainer } = render(<SyncStatusIndicator />)
      expect(syncedContainer.querySelector('.text-green-500')).not.toBeNull()

      useSyncStore.setState({ status: 'error' })
      const { container: errorContainer } = render(<SyncStatusIndicator />)
      expect(errorContainer.querySelector('.text-red-500')).not.toBeNull()
    })
  })
})

describe('SyncStatusBadge', () => {
  beforeEach(() => {
    useSyncStore.getState().reset()
  })

  describe('渲染测试', () => {
    it('应该正常渲染徽章组件', () => {
      const { container } = render(<SyncStatusBadge />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('syncing 状态应该显示蓝色样式', () => {
      useSyncStore.setState({ status: 'syncing' })
      const { container } = render(<SyncStatusBadge />)
      expect(container.firstChild).toHaveClass('text-blue-500')
    })

    it('synced 状态应该显示绿色样式', () => {
      useSyncStore.setState({ status: 'synced' })
      const { container } = render(<SyncStatusBadge />)
      expect(container.firstChild).toHaveClass('text-green-500')
    })

    it('error 状态应该显示红色样式', () => {
      useSyncStore.setState({ status: 'error' })
      const { container } = render(<SyncStatusBadge />)
      expect(container.firstChild).toHaveClass('text-red-500')
    })

    it('className 应该正确应用', () => {
      const { container } = render(
        <SyncStatusBadge className="extra-class" />
      )
      expect(container.firstChild).toHaveClass('extra-class')
    })
  })
})
