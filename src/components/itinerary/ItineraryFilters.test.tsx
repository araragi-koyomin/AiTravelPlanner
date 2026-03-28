import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryFilters } from './ItineraryFilters'
import type { ItineraryFilterOptions } from '@/stores/itineraryListStore'

vi.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; className?: string; disabled?: boolean }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className} disabled={disabled}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

vi.mock('@/components/ui/Input', () => ({
  Input: ({ value, onChange, type, placeholder, className }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string; className?: string }) => (
    <input
      data-testid="input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}))

describe('ItineraryFilters', () => {
  const mockOnChange = vi.fn()
  const mockOnReset = vi.fn()
  const defaultFilters: ItineraryFilterOptions = {
    dateRange: { type: 'all' },
    destinations: [],
    isFavorite: undefined,
    status: undefined
  }
  const defaultDestinations = ['北京', '上海', '广州']

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnReset.mockClear()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('日期')).toBeInTheDocument()
      expect(screen.getByText('目的地')).toBeInTheDocument()
      expect(screen.getByText('收藏')).toBeInTheDocument()
      expect(screen.getByText('状态')).toBeInTheDocument()
    })

    it('应该显示日期筛选按钮', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('日期')).toBeInTheDocument()
    })

    it('应该显示目的地筛选按钮当有目的地时', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('目的地')).toBeInTheDocument()
    })

    it('应该不显示目的地筛选按钮当没有目的地时', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={[]}
          onReset={mockOnReset}
        />
      )
      expect(screen.queryByText('目的地')).not.toBeInTheDocument()
    })

    it('应该显示收藏筛选按钮', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('收藏')).toBeInTheDocument()
    })

    it('应该显示状态筛选按钮', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('状态')).toBeInTheDocument()
    })

    it('应该不显示清除筛选按钮当没有激活筛选时', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.queryByText('清除筛选')).not.toBeInTheDocument()
    })
  })

  describe('日期筛选测试', () => {
    it('选择日期选项应该调用 onChange', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const dateButtons = screen.getAllByTestId('dropdown-item')
      const upcomingOption = dateButtons.find((btn) => btn.textContent?.includes('即将出发'))
      if (upcomingOption) {
        fireEvent.click(upcomingOption)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          dateRange: { type: 'upcoming', startDate: undefined, endDate: undefined }
        })
      }
    })

    it('应该显示当前选中的日期类型徽章', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        dateRange: { type: 'upcoming' }
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent?.includes('即将出发'))).toBe(true)
    })
  })

  describe('目的地筛选测试', () => {
    it('应该显示所有目的地选项', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText('北京')).toBeInTheDocument()
      expect(screen.getByText('上海')).toBeInTheDocument()
      expect(screen.getByText('广州')).toBeInTheDocument()
    })

    it('点击目的地应该切换选中状态', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const beijingButton = screen.getAllByTestId('dropdown-item').find((btn) => btn.textContent?.includes('北京'))
      if (beijingButton) {
        fireEvent.click(beijingButton)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          destinations: ['北京']
        })
      }
    })

    it('应该显示已选目的地数量徽章', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        destinations: ['北京', '上海']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent === '2')).toBe(true)
    })

    it('应该支持多选目的地', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        destinations: ['北京']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const shanghaiButton = screen.getAllByTestId('dropdown-item').find((btn) => btn.textContent?.includes('上海'))
      if (shanghaiButton) {
        fireEvent.click(shanghaiButton)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          destinations: ['北京', '上海']
        })
      }
    })

    it('应该取消已选目的地', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        destinations: ['北京', '上海']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const beijingButton = screen.getAllByTestId('dropdown-item').find((btn) => btn.textContent?.includes('北京'))
      if (beijingButton) {
        fireEvent.click(beijingButton)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          destinations: ['上海']
        })
      }
    })
  })

  describe('收藏筛选测试', () => {
    it('应该显示所有收藏选项', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const items = screen.getAllByTestId('dropdown-item')
      expect(items.some((item) => item.textContent?.includes('全部'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('已收藏'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('未收藏'))).toBe(true)
    })

    it('选择收藏状态应该调用 onChange', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const items = screen.getAllByTestId('dropdown-item')
      const favoriteOption = items.find((item) => item.textContent?.includes('已收藏'))
      if (favoriteOption) {
        fireEvent.click(favoriteOption)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          isFavorite: true
        })
      }
    })

    it('应该显示当前选中的收藏状态徽章', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        isFavorite: true
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent?.includes('已收藏'))).toBe(true)
    })
  })

  describe('状态筛选测试', () => {
    it('应该显示所有行程状态选项', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const items = screen.getAllByTestId('dropdown-item')
      expect(items.some((item) => item.textContent?.includes('草稿'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('已生成'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('进行中'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('已完成'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('已归档'))).toBe(true)
    })

    it('点击状态应该切换选中状态', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const items = screen.getAllByTestId('dropdown-item')
      const draftOption = items.find((item) => item.textContent?.includes('草稿'))
      if (draftOption) {
        fireEvent.click(draftOption)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          status: ['draft']
        })
      }
    })

    it('应该显示已选状态数量徽章', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        status: ['draft', 'completed']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent === '2')).toBe(true)
    })

    it('应该支持多选状态', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        status: ['draft']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const items = screen.getAllByTestId('dropdown-item')
      const completedOption = items.find((item) => item.textContent?.includes('已完成'))
      if (completedOption) {
        fireEvent.click(completedOption)
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultFilters,
          status: ['draft', 'completed']
        })
      }
    })
  })

  describe('清除筛选测试', () => {
    it('应该显示激活筛选数量', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        dateRange: { type: 'upcoming' },
        destinations: ['北京'],
        isFavorite: true
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText(/已应用 3 个筛选条件/)).toBeInTheDocument()
    })

    it('点击清除筛选按钮应该调用 onReset', () => {
      const filters: ItineraryFilterOptions = {
        ...defaultFilters,
        dateRange: { type: 'upcoming' }
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      const clearButton = screen.getByText('清除筛选')
      fireEvent.click(clearButton)
      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理空目的地列表', () => {
      render(
        <ItineraryFilters
          filters={defaultFilters}
          onChange={mockOnChange}
          destinations={[]}
          onReset={mockOnReset}
        />
      )
      expect(screen.queryByText('目的地')).not.toBeInTheDocument()
    })

    it('应该正确处理初始筛选条件', () => {
      const filters: ItineraryFilterOptions = {
        dateRange: { type: 'upcoming' },
        destinations: ['北京'],
        isFavorite: true,
        status: ['draft']
      }
      render(
        <ItineraryFilters
          filters={filters}
          onChange={mockOnChange}
          destinations={defaultDestinations}
          onReset={mockOnReset}
        />
      )
      expect(screen.getByText(/已应用 4 个筛选条件/)).toBeInTheDocument()
    })
  })
})
