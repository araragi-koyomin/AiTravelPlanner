import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ViewToggle } from './ViewToggle'

vi.mock('@/components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
    'aria-label'?: string
    'aria-pressed'?: boolean
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {children}
    </button>
  )
}))

describe('ViewToggle', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })

    it('应该显示网格视图按钮', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      expect(screen.getByLabelText('网格视图')).toBeInTheDocument()
    })

    it('应该显示列表视图按钮', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      expect(screen.getByLabelText('列表视图')).toBeInTheDocument()
    })

    it('应该高亮当前视图模式 - 网格', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('data-variant', 'primary')
    })

    it('应该高亮当前视图模式 - 列表', () => {
      render(<ViewToggle viewMode="list" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      expect(listButton).toHaveAttribute('data-variant', 'primary')
    })

    it('非当前视图模式应该使用 ghost 变体', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      expect(listButton).toHaveAttribute('data-variant', 'ghost')
    })
  })

  describe('交互测试', () => {
    it('点击网格按钮应该调用 onChange(grid)', () => {
      render(<ViewToggle viewMode="list" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      fireEvent.click(gridButton)
      expect(mockOnChange).toHaveBeenCalledWith('grid')
    })

    it('点击列表按钮应该调用 onChange(list)', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      fireEvent.click(listButton)
      expect(mockOnChange).toHaveBeenCalledWith('list')
    })

    it('应该正确响应点击事件', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      fireEvent.click(listButton)
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('点击当前已选中的按钮也应该触发 onChange', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      fireEvent.click(gridButton)
      expect(mockOnChange).toHaveBeenCalledWith('grid')
    })
  })

  describe('可访问性测试', () => {
    it('网格按钮应该有 aria-label', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('aria-label', '网格视图')
    })

    it('列表按钮应该有 aria-label', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      expect(listButton).toHaveAttribute('aria-label', '列表视图')
    })

    it('网格按钮应该有 aria-pressed', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('列表按钮应该有 aria-pressed', () => {
      render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      expect(listButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('当视图模式为列表时，列表按钮 aria-pressed 应该为 true', () => {
      render(<ViewToggle viewMode="list" onChange={mockOnChange} />)
      const listButton = screen.getByLabelText('列表视图')
      expect(listButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('当视图模式为列表时，网格按钮 aria-pressed 应该为 false', () => {
      render(<ViewToggle viewMode="list" onChange={mockOnChange} />)
      const gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理 viewMode 变化', () => {
      const { rerender } = render(<ViewToggle viewMode="grid" onChange={mockOnChange} />)
      let gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('data-variant', 'primary')

      rerender(<ViewToggle viewMode="list" onChange={mockOnChange} />)
      gridButton = screen.getByLabelText('网格视图')
      expect(gridButton).toHaveAttribute('data-variant', 'ghost')
    })
  })
})
