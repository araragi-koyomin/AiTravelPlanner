import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UnsavedChangesModal } from './UnsavedChangesModal'

describe('UnsavedChangesModal', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDiscard: vi.fn(),
    isSaving: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该在 isOpen 为 true 时渲染', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('应该在 isOpen 为 false 时不渲染', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('应该显示未保存更改提示', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />)

      expect(screen.getByText('有未保存的更改')).toBeInTheDocument()
    })

    it('应该显示放弃更改按钮', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('button', { name: '放弃更改' })).toBeInTheDocument()
    })

    it('应该显示继续编辑按钮', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('button', { name: '继续编辑' })).toBeInTheDocument()
    })

    it('应该显示保存并退出按钮', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />)

      expect(screen.getByRole('button', { name: '保存并退出' })).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击放弃更改应该调用 onDiscard', () => {
      const onDiscard = vi.fn()
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} onDiscard={onDiscard} />)

      fireEvent.click(screen.getByRole('button', { name: '放弃更改' }))

      expect(onDiscard).toHaveBeenCalledTimes(1)
    })

    it('点击继续编辑应该调用 onClose', () => {
      const onClose = vi.fn()
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: '继续编辑' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('点击保存并退出应该调用 onSave', () => {
      const onSave = vi.fn()
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} onSave={onSave} />)

      fireEvent.click(screen.getByRole('button', { name: '保存并退出' }))

      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('加载状态', () => {
    it('应该在 isSaving 时禁用按钮', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} isSaving={true} />)

      expect(screen.getByRole('button', { name: '放弃更改' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '继续编辑' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled()
    })

    it('应该在 isSaving 时显示保存中文本', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} isSaving={true} />)

      expect(screen.getByRole('button', { name: '保存中...' })).toBeInTheDocument()
    })

    it('应该在 isSaving 为 false 时显示保存并退出文本', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} isSaving={false} />)

      expect(screen.getByRole('button', { name: '保存并退出' })).toBeInTheDocument()
    })
  })
})
