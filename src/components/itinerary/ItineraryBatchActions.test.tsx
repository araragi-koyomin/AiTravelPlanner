import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryBatchActions } from './ItineraryBatchActions'

vi.mock('@/components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    disabled
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
    disabled?: boolean
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  )
}))

describe('ItineraryBatchActions', () => {
  const mockOnEnterBatchMode = vi.fn()
  const mockOnExitBatchMode = vi.fn()
  const mockOnSelectAll = vi.fn()
  const mockOnClearSelection = vi.fn()
  const mockOnBatchDelete = vi.fn()
  const mockOnBatchFavorite = vi.fn()

  beforeEach(() => {
    mockOnEnterBatchMode.mockClear()
    mockOnExitBatchMode.mockClear()
    mockOnSelectAll.mockClear()
    mockOnClearSelection.mockClear()
    mockOnBatchDelete.mockClear()
    mockOnBatchFavorite.mockClear()
  })

  describe('非批量模式渲染测试', () => {
    it('应该渲染批量管理按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={10}
          isBatchMode={false}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('批量管理')).toBeInTheDocument()
    })

    it('点击批量管理按钮应该调用 onEnterBatchMode', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={10}
          isBatchMode={false}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const batchButton = screen.getByText('批量管理')
      fireEvent.click(batchButton)
      expect(mockOnEnterBatchMode).toHaveBeenCalledTimes(1)
    })
  })

  describe('批量模式渲染测试', () => {
    it('应该渲染批量操作工具栏', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('应该显示已选数量', () => {
      render(
        <ItineraryBatchActions
          selectedCount={3}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('应该显示总数量', () => {
      render(
        <ItineraryBatchActions
          selectedCount={3}
          totalCount={15}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText(/15 项/)).toBeInTheDocument()
    })

    it('应该显示取消按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('应该显示全选按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('全选')).toBeInTheDocument()
    })

    it('应该显示取消选择按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('取消选择')).toBeInTheDocument()
    })

    it('应该显示收藏按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const favoriteButtons = screen.getAllByText('收藏')
      expect(favoriteButtons.length).toBeGreaterThan(0)
    })

    it('应该显示取消收藏按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('取消收藏')).toBeInTheDocument()
    })

    it('应该显示删除按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText(/删除/)).toBeInTheDocument()
    })
  })

  describe('按钮状态测试', () => {
    it('全选按钮应该在已全选时禁用', () => {
      render(
        <ItineraryBatchActions
          selectedCount={10}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const selectAllButton = screen.getByText('全选')
      expect(selectAllButton).toBeDisabled()
    })

    it('取消选择按钮应该在未选中时禁用', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const clearSelectionButton = screen.getByText('取消选择')
      expect(clearSelectionButton).toBeDisabled()
    })

    it('操作按钮应该在未选中时禁用', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const deleteButton = screen.getByText(/删除/)
      expect(deleteButton).toBeDisabled()
    })

    it('所有按钮应该在加载时禁用', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          isLoading={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const deleteButton = screen.getByText(/删除/)
      const favoriteButtons = screen.getAllByText('收藏')
      expect(deleteButton).toBeDisabled()
      favoriteButtons.forEach((btn) => {
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('交互测试', () => {
    it('点击取消按钮应该调用 onExitBatchMode', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const cancelButton = screen.getByText('取消')
      fireEvent.click(cancelButton)
      expect(mockOnExitBatchMode).toHaveBeenCalledTimes(1)
    })

    it('点击全选按钮应该调用 onSelectAll', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const selectAllButton = screen.getByText('全选')
      fireEvent.click(selectAllButton)
      expect(mockOnSelectAll).toHaveBeenCalledTimes(1)
    })

    it('点击取消选择按钮应该调用 onClearSelection', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const clearSelectionButton = screen.getByText('取消选择')
      fireEvent.click(clearSelectionButton)
      expect(mockOnClearSelection).toHaveBeenCalledTimes(1)
    })

    it('点击收藏按钮应该调用 onBatchFavorite(true)', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const favoriteButtons = screen.getAllByText('收藏')
      fireEvent.click(favoriteButtons[0])
      expect(mockOnBatchFavorite).toHaveBeenCalledWith(true)
    })

    it('点击取消收藏按钮应该调用 onBatchFavorite(false)', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const unfavoriteButton = screen.getByText('取消收藏')
      fireEvent.click(unfavoriteButton)
      expect(mockOnBatchFavorite).toHaveBeenCalledWith(false)
    })

    it('点击删除按钮应该调用 onBatchDelete', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const deleteButton = screen.getByText(/删除/)
      fireEvent.click(deleteButton)
      expect(mockOnBatchDelete).toHaveBeenCalledTimes(1)
    })

    it('删除按钮应该显示选中数量', () => {
      render(
        <ItineraryBatchActions
          selectedCount={5}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('删除 (5)')).toBeInTheDocument()
    })
  })

  describe('加载状态测试', () => {
    it('应该在加载时禁用所有操作按钮', () => {
      render(
        <ItineraryBatchActions
          selectedCount={2}
          totalCount={10}
          isBatchMode={true}
          isLoading={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      const deleteButton = screen.getByText(/删除/)
      const favoriteButtons = screen.getAllByText('收藏')
      expect(deleteButton).toBeDisabled()
      favoriteButtons.forEach((btn) => {
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理选中数量为 0', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={10}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('应该正确处理总数量为 0', () => {
      render(
        <ItineraryBatchActions
          selectedCount={0}
          totalCount={0}
          isBatchMode={true}
          onEnterBatchMode={mockOnEnterBatchMode}
          onExitBatchMode={mockOnExitBatchMode}
          onSelectAll={mockOnSelectAll}
          onClearSelection={mockOnClearSelection}
          onBatchDelete={mockOnBatchDelete}
          onBatchFavorite={mockOnBatchFavorite}
        />
      )
      expect(screen.getByText(/0 项/)).toBeInTheDocument()
    })
  })
})
