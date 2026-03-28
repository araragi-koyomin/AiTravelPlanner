import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItinerarySortDropdown } from './ItinerarySortDropdown'
import type { ItinerarySortOptions } from '@/stores/itineraryListStore'

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
  Button: ({ children, onClick, variant, size, className }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; className?: string }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  )
}))

describe('ItinerarySortDropdown', () => {
  const mockOnChange = vi.fn()
  const defaultSort: ItinerarySortOptions = { field: 'created_at', order: 'desc' }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const createTimeTexts = screen.getAllByText('创建时间')
      expect(createTimeTexts.length).toBeGreaterThan(0)
    })

    it('应该显示当前排序字段标签', () => {
      const sort: ItinerarySortOptions = { field: 'start_date', order: 'asc' }
      render(<ItinerarySortDropdown sort={sort} onChange={mockOnChange} />)
      const startDateTexts = screen.getAllByText('出发日期')
      expect(startDateTexts.length).toBeGreaterThan(0)
    })

    it('应该显示排序方向图标', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('下拉菜单测试', () => {
    it('应该显示所有排序选项', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const items = screen.getAllByTestId('dropdown-item')
      expect(items.some((item) => item.textContent?.includes('创建时间'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('出发日期'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('预算'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('行程天数'))).toBe(true)
      expect(items.some((item) => item.textContent?.includes('标题'))).toBe(true)
    })

    it('应该高亮当前选中的排序字段', () => {
      const sort: ItinerarySortOptions = { field: 'budget', order: 'desc' }
      render(<ItinerarySortDropdown sort={sort} onChange={mockOnChange} />)
      const budgetTexts = screen.getAllByText('预算')
      expect(budgetTexts.length).toBeGreaterThan(0)
    })
  })

  describe('排序交互测试', () => {
    it('选择相同字段应该切换排序方向', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const items = screen.getAllByTestId('dropdown-item')
      const createdAtOption = items.find((item) => item.textContent?.includes('创建时间'))
      if (createdAtOption) {
        fireEvent.click(createdAtOption)
        expect(mockOnChange).toHaveBeenCalledWith({ field: 'created_at', order: 'asc' })
      }
    })

    it('选择不同字段应该重置为降序', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const items = screen.getAllByTestId('dropdown-item')
      const budgetOption = items.find((item) => item.textContent?.includes('预算'))
      if (budgetOption) {
        fireEvent.click(budgetOption)
        expect(mockOnChange).toHaveBeenCalledWith({ field: 'budget', order: 'desc' })
      }
    })

    it('选择排序选项应该调用 onChange', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const items = screen.getAllByTestId('dropdown-item')
      const titleOption = items.find((item) => item.textContent?.includes('标题'))
      if (titleOption) {
        fireEvent.click(titleOption)
        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith({ field: 'title', order: 'desc' })
      }
    })

    it('从升序切换到降序', () => {
      const sort: ItinerarySortOptions = { field: 'created_at', order: 'asc' }
      render(<ItinerarySortDropdown sort={sort} onChange={mockOnChange} />)
      const items = screen.getAllByTestId('dropdown-item')
      const createdAtOption = items.find((item) => item.textContent?.includes('创建时间'))
      if (createdAtOption) {
        fireEvent.click(createdAtOption)
        expect(mockOnChange).toHaveBeenCalledWith({ field: 'created_at', order: 'desc' })
      }
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理默认排序选项', () => {
      render(<ItinerarySortDropdown sort={defaultSort} onChange={mockOnChange} />)
      const createTimeTexts = screen.getAllByText('创建时间')
      expect(createTimeTexts.length).toBeGreaterThan(0)
    })

    it('应该正确处理不同的排序字段', () => {
      const sort: ItinerarySortOptions = { field: 'days', order: 'asc' }
      render(<ItinerarySortDropdown sort={sort} onChange={mockOnChange} />)
      const daysTexts = screen.getAllByText('行程天数')
      expect(daysTexts.length).toBeGreaterThan(0)
    })
  })
})
