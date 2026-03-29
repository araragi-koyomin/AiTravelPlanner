import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryCard } from './ItineraryCard'
import type { Itinerary } from '@/services/itinerary'

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="card-description" className={className}>
      {children}
    </p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    disabled,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode
    onClick?: (e?: React.MouseEvent) => void
    variant?: string
    size?: string
    className?: string
    disabled?: boolean
    'aria-label'?: string
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
    >
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

vi.mock('@/components/ui/Checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    onClick,
    'aria-label': ariaLabel
  }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    onClick?: (e: React.MouseEvent) => void
    'aria-label'?: string
  }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  )
}))

vi.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: { children: React.ReactNode; align?: string }) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
    className?: string
  }) => (
    <button data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </button>
  )
}))

const createMockItinerary = (overrides: Partial<Itinerary> = {}): Itinerary => ({
  id: 'test-id',
  user_id: 'user-1',
  title: '测试行程',
  destination: '北京',
  start_date: '2024-03-01',
  end_date: '2024-03-03',
  budget: 5000,
  participants: 2,
  preferences: null,
  special_requirements: null,
  travelers_type: null,
  accommodation_pref: null,
  pace: null,
  is_favorite: false,
  status: 'draft',
  cover_image: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

describe('ItineraryCard', () => {
  const mockOnView = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnCopy = vi.fn()
  const mockOnToggleFavorite = vi.fn()
  const mockOnSelect = vi.fn()
  const mockItinerary = createMockItinerary()

  beforeEach(() => {
    mockOnView.mockClear()
    mockOnDelete.mockClear()
    mockOnCopy.mockClear()
    mockOnToggleFavorite.mockClear()
    mockOnSelect.mockClear()
  })

  describe('网格视图渲染测试', () => {
    it('应该正常渲染网格视图卡片', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('应该显示行程标题', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('测试行程')).toBeInTheDocument()
    })

    it('应该显示目的地', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('北京')).toBeInTheDocument()
    })

    it('应该显示日期范围', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText(/2024年3月1日/)).toBeInTheDocument()
    })

    it('应该显示天数', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('(3天)')).toBeInTheDocument()
    })

    it('应该显示参与人数', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('2 人同行')).toBeInTheDocument()
    })

    it('应该显示预算', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
    })

    it('应该显示收藏按钮', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByLabelText('收藏')).toBeInTheDocument()
    })

    it('应该显示操作按钮', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('查看')).toBeInTheDocument()
    })
  })

  describe('列表视图渲染测试', () => {
    it('应该正常渲染列表视图卡片', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('测试行程')).toBeInTheDocument()
    })

    it('应该显示行程标题', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('测试行程')).toBeInTheDocument()
    })

    it('应该显示目的地', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText('北京')).toBeInTheDocument()
    })

    it('应该显示日期范围', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText(/2024年3月1日/)).toBeInTheDocument()
    })

    it('应该显示预算', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
    })

    it('应该显示状态徽章', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent?.includes('草稿'))).toBe(true)
    })

    it('应该显示天数徽章', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const badges = screen.getAllByTestId('badge')
      expect(badges.some((badge) => badge.textContent?.includes('3天'))).toBe(true)
    })

    it('应该显示收藏图标当已收藏时', () => {
      const favoriteItinerary = createMockItinerary({ is_favorite: true })
      render(
        <ItineraryCard
          itinerary={favoriteItinerary}
          viewMode="list"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const dropdownItems = screen.getAllByTestId('dropdown-item')
      expect(dropdownItems.some((item) => item.textContent?.includes('取消收藏'))).toBe(true)
    })
  })

  describe('收藏功能测试', () => {
    it('应该显示已收藏状态', () => {
      const favoriteItinerary = createMockItinerary({ is_favorite: true })
      render(
        <ItineraryCard
          itinerary={favoriteItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByLabelText('取消收藏')).toBeInTheDocument()
    })

    it('应该显示未收藏状态', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByLabelText('收藏')).toBeInTheDocument()
    })

    it('点击收藏按钮应该调用 onToggleFavorite', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const favoriteButton = screen.getByLabelText('收藏')
      fireEvent.click(favoriteButton)
      expect(mockOnToggleFavorite).toHaveBeenCalledWith('test-id', false)
    })

    it('应该传递正确的参数给 onToggleFavorite', () => {
      const favoriteItinerary = createMockItinerary({ id: 'fav-1', is_favorite: true })
      render(
        <ItineraryCard
          itinerary={favoriteItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const unfavoriteButton = screen.getByLabelText('取消收藏')
      fireEvent.click(unfavoriteButton)
      expect(mockOnToggleFavorite).toHaveBeenCalledWith('fav-1', true)
    })
  })

  describe('操作功能测试', () => {
    it('点击查看按钮应该调用 onView', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const viewButton = screen.getByText('查看').closest('button')
      if (viewButton) {
        fireEvent.click(viewButton)
        expect(mockOnView).toHaveBeenCalledWith('test-id')
      }
    })

    it('点击复制按钮应该调用 onCopy', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.querySelector('svg') && !btn.textContent?.includes('查看') && !btn.textContent?.includes('删除') && !btn.getAttribute('aria-label'))
      if (copyButton) {
        fireEvent.click(copyButton)
        expect(mockOnCopy).toHaveBeenCalledWith('test-id')
      }
    })

    it('点击删除按钮应该调用 onDelete', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.className?.includes('text-red-600'))
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(mockOnDelete).toHaveBeenCalledWith('test-id')
      }
    })
  })

  describe('批量模式测试', () => {
    it('应该在批量模式下显示复选框', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isBatchMode={true}
          onSelect={mockOnSelect}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })

    it('应该正确显示选中状态', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isBatchMode={true}
          isSelected={true}
          onSelect={mockOnSelect}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('点击复选框应该调用 onSelect', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isBatchMode={true}
          onSelect={mockOnSelect}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const checkbox = screen.getByTestId('checkbox')
      fireEvent.click(checkbox)
      expect(mockOnSelect).toHaveBeenCalledWith('test-id')
    })

    it('点击卡片应该调用 onSelect（批量模式下）', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isBatchMode={true}
          onSelect={mockOnSelect}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const card = screen.getByTestId('card')
      fireEvent.click(card)
      expect(mockOnSelect).toHaveBeenCalledWith('test-id')
    })

    it('点击卡片应该调用 onView（非批量模式下）', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const card = screen.getByTestId('card')
      fireEvent.click(card)
      expect(mockOnView).toHaveBeenCalledWith('test-id')
    })
  })

  describe('选中状态测试', () => {
    it('应该在选中时显示选中样式（网格视图）', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isSelected={true}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const card = screen.getByTestId('card')
      expect(card.className).toContain('ring-2')
    })

    it('应该在选中时显示选中样式（列表视图）', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="list"
          isSelected={true}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      const container = screen.getByText('测试行程').closest('div.cursor-pointer')
      expect(container?.className).toContain('bg-primary/5')
    })
  })

  describe('可访问性测试', () => {
    it('收藏按钮应该有 aria-label', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByLabelText('收藏')).toBeInTheDocument()
    })

    it('复选框应该有 aria-label', () => {
      render(
        <ItineraryCard
          itinerary={mockItinerary}
          viewMode="grid"
          isBatchMode={true}
          onSelect={mockOnSelect}
          onView={mockOnView}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          onToggleFavorite={mockOnToggleFavorite}
        />
      )
      expect(screen.getByLabelText('选择 测试行程')).toBeInTheDocument()
    })
  })
})
