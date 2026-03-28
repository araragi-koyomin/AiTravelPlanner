import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CopyItineraryModal } from './CopyItineraryModal'

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) =>
    open ? (
      <div role="dialog" data-open={open}>
        <button data-testid="dialog-backdrop" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    disabled
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    disabled?: boolean
  }) => (
    <button onClick={onClick} data-variant={variant} disabled={disabled}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/Input', () => ({
  Input: ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    disabled,
    autoFocus
  }: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown?: (e: React.KeyboardEvent) => void
    placeholder?: string
    disabled?: boolean
    autoFocus?: boolean
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  )
}))

describe('CopyItineraryModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()
  const originalTitle = '北京三日游'

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnConfirm.mockClear()
  })

  describe('组件渲染测试', () => {
    it('应该在 isOpen 为 true 时渲染', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('应该在 isOpen 为 false 时不渲染', () => {
      render(
        <CopyItineraryModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('应该显示对话框标题', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByText('复制行程')).toBeInTheDocument()
    })

    it('应该显示对话框描述', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByText('为复制的行程设置一个新标题')).toBeInTheDocument()
    })

    it('应该显示输入框', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByTestId('input')).toBeInTheDocument()
    })

    it('应该显示取消按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByText('取消')).toBeInTheDocument()
    })

    it('应该显示确认按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      expect(screen.getByText('确认复制')).toBeInTheDocument()
    })
  })

  describe('初始值测试', () => {
    it('输入框应该显示原标题 + (副本)', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('北京三日游 (副本)')
    })

    it('应该正确显示传入的 originalTitle', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle="上海五日游"
        />
      )
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('上海五日游 (副本)')
    })
  })

  describe('输入功能测试', () => {
    it('应该正确更新输入值', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '新标题' } })
      expect((input as HTMLInputElement).value).toBe('新标题')
    })

    it('应该在输入为空时禁用确认按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '' } })
      const confirmButton = screen.getByText('确认复制')
      expect(confirmButton).toBeDisabled()
    })

    it('应该在输入只有空格时禁用确认按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '   ' } })
      const confirmButton = screen.getByText('确认复制')
      expect(confirmButton).toBeDisabled()
    })

    it('应该在输入有效内容时启用确认按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '新标题' } })
      const confirmButton = screen.getByText('确认复制')
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('交互测试', () => {
    it('点击取消按钮应该调用 onClose', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const cancelButton = screen.getByText('取消')
      fireEvent.click(cancelButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('点击确认按钮应该调用 onConfirm', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const confirmButton = screen.getByText('确认复制')
      fireEvent.click(confirmButton)
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('应该传递新标题给 onConfirm', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '我的新行程' } })
      const confirmButton = screen.getByText('确认复制')
      fireEvent.click(confirmButton)
      expect(mockOnConfirm).toHaveBeenCalledWith('我的新行程')
    })

    it('按 Enter 键应该调用 onConfirm', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('按 Enter 键在加载时不应该调用 onConfirm', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
          isLoading={true}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('点击遮罩层应该调用 onClose', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const backdrop = screen.getByTestId('dialog-backdrop')
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('加载状态测试', () => {
    it('应该在加载时禁用所有按钮', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
          isLoading={true}
        />
      )
      const cancelButton = screen.getByText('取消')
      const confirmButton = screen.getByText('复制中...')
      expect(cancelButton).toBeDisabled()
      expect(confirmButton).toBeDisabled()
    })

    it('应该在加载时禁用输入框', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
          isLoading={true}
        />
      )
      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    it('应该在加载时显示加载文本', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
          isLoading={true}
        />
      )
      expect(screen.getByText('复制中...')).toBeInTheDocument()
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理空原标题', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle=""
        />
      )
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe(' (副本)')
    })

    it('应该正确处理包含空格的原标题', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle="  北京三日游  "
        />
      )
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('  北京三日游   (副本)')
    })

    it('应该正确处理特殊字符标题', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle="北京-上海@2024"
        />
      )
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('北京-上海@2024 (副本)')
    })

    it('应该去除新标题的前后空格', () => {
      render(
        <CopyItineraryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          originalTitle={originalTitle}
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: '  新标题  ' } })
      const confirmButton = screen.getByText('确认复制')
      fireEvent.click(confirmButton)
      expect(mockOnConfirm).toHaveBeenCalledWith('新标题')
    })
  })
})
