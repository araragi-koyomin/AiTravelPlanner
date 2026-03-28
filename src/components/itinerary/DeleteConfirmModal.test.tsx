import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteConfirmModal } from './DeleteConfirmModal'

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    itemName: '测试景点',
    isDeleting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该在 isOpen 为 true 时渲染', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('应该在 isOpen 为 false 时不渲染', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('应该显示删除确认标题', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} />)

      const titles = screen.getAllByText('确认删除')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('应该显示行程项名称', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} itemName="故宫博物院" />)

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })

    it('应该显示取消按钮', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    })

    it('应该显示确认删除按钮', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} />)

      const confirmButtons = screen.getAllByRole('button', { name: /确认删除/ })
      expect(confirmButtons.length).toBeGreaterThan(0)
    })
  })

  describe('交互测试', () => {
    it('点击取消按钮应该调用 onClose', () => {
      const onClose = vi.fn()
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('点击确认删除按钮应该调用 onConfirm', () => {
      const onConfirm = vi.fn()
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} onConfirm={onConfirm} />)

      const confirmButtons = screen.getAllByRole('button', { name: /确认删除/ })
      fireEvent.click(confirmButtons[confirmButtons.length - 1])

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('加载状态', () => {
    it('应该在 isDeleting 时禁用按钮', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} isDeleting={true} />)

      expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '删除中...' })).toBeDisabled()
    })

    it('应该在 isDeleting 时显示删除中文本', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} isDeleting={true} />)

      expect(screen.getByRole('button', { name: '删除中...' })).toBeInTheDocument()
    })

    it('应该在 isDeleting 为 false 时显示确认删除文本', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={true} isDeleting={false} />)

      const confirmButtons = screen.getAllByRole('button', { name: /确认删除/ })
      expect(confirmButtons.length).toBeGreaterThan(0)
    })
  })
})
