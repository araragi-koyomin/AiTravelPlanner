import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './Pagination'

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
    onClick?: () => void
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

describe('Pagination', () => {
  const mockOnPageChange = vi.fn()

  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  describe('组件渲染测试', () => {
    it('应该在总页数 <= 1 时不渲染', () => {
      const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />)
      expect(container.firstChild).toBeNull()
    })

    it('应该在总页数 > 1 时渲染', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('第一页')).toBeInTheDocument()
    })

    it('应该显示首页按钮', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('第一页')).toBeInTheDocument()
    })

    it('应该显示上一页按钮', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('上一页')).toBeInTheDocument()
    })

    it('应该显示下一页按钮', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('下一页')).toBeInTheDocument()
    })

    it('应该显示末页按钮', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('最后一页')).toBeInTheDocument()
    })

    it('应该显示页码按钮（showQuickJumper = true）', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} showQuickJumper={true} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('应该显示页码文本（showQuickJumper = false）', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} showQuickJumper={false} />)
      expect(screen.getByText('3 / 5')).toBeInTheDocument()
    })
  })

  describe('页码显示测试', () => {
    it('应该正确显示所有页码（总页数 <= 7）', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('应该显示省略号（总页数 > 7）', () => {
      render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('应该高亮当前页码', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      const page3Button = screen.getByText('3')
      expect(page3Button).toHaveAttribute('data-variant', 'primary')
    })

    it('应该正确计算显示的页码范围', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('应该在第一页附近显示正确页码', () => {
      render(<Pagination currentPage={2} totalPages={10} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('应该在最后一页附近显示正确页码', () => {
      render(<Pagination currentPage={9} totalPages={10} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('导航功能测试', () => {
    it('点击首页按钮应该调用 onPageChange(1)', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />)
      const firstPageButton = screen.getByLabelText('第一页')
      fireEvent.click(firstPageButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(1)
    })

    it('点击上一页按钮应该调用 onPageChange(currentPage - 1)', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />)
      const prevPageButton = screen.getByLabelText('上一页')
      fireEvent.click(prevPageButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(4)
    })

    it('点击下一页按钮应该调用 onPageChange(currentPage + 1)', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />)
      const nextPageButton = screen.getByLabelText('下一页')
      fireEvent.click(nextPageButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(6)
    })

    it('点击末页按钮应该调用 onPageChange(totalPages)', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />)
      const lastPageButton = screen.getByLabelText('最后一页')
      fireEvent.click(lastPageButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(10)
    })

    it('点击页码按钮应该调用 onPageChange', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)
      const page3Button = screen.getByText('3')
      fireEvent.click(page3Button)
      expect(mockOnPageChange).toHaveBeenCalledWith(3)
    })
  })

  describe('按钮状态测试', () => {
    it('首页按钮应该在第一页时禁用', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)
      const firstPageButton = screen.getByLabelText('第一页')
      expect(firstPageButton).toBeDisabled()
    })

    it('上一页按钮应该在第一页时禁用', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />)
      const prevPageButton = screen.getByLabelText('上一页')
      expect(prevPageButton).toBeDisabled()
    })

    it('下一页按钮应该在最后一页时禁用', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />)
      const nextPageButton = screen.getByLabelText('下一页')
      expect(nextPageButton).toBeDisabled()
    })

    it('末页按钮应该在最后一页时禁用', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />)
      const lastPageButton = screen.getByLabelText('最后一页')
      expect(lastPageButton).toBeDisabled()
    })

    it('首页按钮应该在非第一页时启用', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      const firstPageButton = screen.getByLabelText('第一页')
      expect(firstPageButton).not.toBeDisabled()
    })

    it('末页按钮应该在非最后一页时启用', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      const lastPageButton = screen.getByLabelText('最后一页')
      expect(lastPageButton).not.toBeDisabled()
    })
  })

  describe('可访问性测试', () => {
    it('首页按钮应该有 aria-label', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('第一页')).toBeInTheDocument()
    })

    it('上一页按钮应该有 aria-label', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('上一页')).toBeInTheDocument()
    })

    it('下一页按钮应该有 aria-label', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('下一页')).toBeInTheDocument()
    })

    it('末页按钮应该有 aria-label', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />)
      expect(screen.getByLabelText('最后一页')).toBeInTheDocument()
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理总页数为 0', () => {
      const { container } = render(<Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />)
      expect(container.firstChild).toBeNull()
    })

    it('应该正确处理总页数为 2', () => {
      render(<Pagination currentPage={1} totalPages={2} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('应该正确处理大量页数', () => {
      render(<Pagination currentPage={50} totalPages={100} onPageChange={mockOnPageChange} />)
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })
})
