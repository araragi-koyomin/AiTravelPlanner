import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditToolbar } from './EditToolbar'

describe('EditToolbar', () => {
  const defaultProps = {
    isEditMode: false,
    hasUnsavedChanges: false,
    canUndo: false,
    canRedo: false,
    isSaving: false,
    onEnterEdit: vi.fn(),
    onExitEdit: vi.fn(),
    onSave: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('非编辑模式渲染', () => {
    it('应该渲染编辑按钮', () => {
      render(<EditToolbar {...defaultProps} />)

      expect(screen.getByText('编辑行程')).toBeInTheDocument()
    })

    it('应该不显示编辑模式工具栏', () => {
      render(<EditToolbar {...defaultProps} />)

      expect(screen.queryByText('编辑模式')).not.toBeInTheDocument()
    })

    it('点击编辑按钮应该调用 onEnterEdit', () => {
      const onEnterEdit = vi.fn()
      render(<EditToolbar {...defaultProps} onEnterEdit={onEnterEdit} />)

      fireEvent.click(screen.getByText('编辑行程'))

      expect(onEnterEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('编辑模式渲染', () => {
    it('应该渲染编辑模式指示器', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} />)

      expect(screen.getByText('编辑模式')).toBeInTheDocument()
    })

    it('应该渲染撤销按钮', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} />)

      expect(screen.getByTitle('撤销 (Ctrl+Z)')).toBeInTheDocument()
    })

    it('应该渲染重做按钮', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} />)

      expect(screen.getByTitle('重做 (Ctrl+Y)')).toBeInTheDocument()
    })

    it('应该渲染保存按钮', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} />)

      expect(screen.getByText('保存')).toBeInTheDocument()
    })

    it('应该渲染取消按钮', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} />)

      expect(screen.getByText('取消')).toBeInTheDocument()
    })
  })

  describe('按钮状态', () => {
    it('撤销按钮应该在 canUndo 为 false 时禁用', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} canUndo={false} />)

      expect(screen.getByTitle('撤销 (Ctrl+Z)')).toBeDisabled()
    })

    it('撤销按钮应该在 canUndo 为 true 时启用', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} canUndo={true} />)

      expect(screen.getByTitle('撤销 (Ctrl+Z)')).not.toBeDisabled()
    })

    it('重做按钮应该在 canRedo 为 false 时禁用', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} canRedo={false} />)

      expect(screen.getByTitle('重做 (Ctrl+Y)')).toBeDisabled()
    })

    it('重做按钮应该在 canRedo 为 true 时启用', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} canRedo={true} />)

      expect(screen.getByTitle('重做 (Ctrl+Y)')).not.toBeDisabled()
    })

    it('保存按钮应该在 isSaving 时禁用', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={true}
          isSaving={true}
        />
      )

      expect(screen.getByText('保存中...')).toBeDisabled()
    })

    it('取消按钮应该在 isSaving 时禁用', () => {
      render(<EditToolbar {...defaultProps} isEditMode={true} isSaving={true} />)

      expect(screen.getByText('取消')).toBeDisabled()
    })

    it('保存按钮应该在 isSaving 时显示加载状态', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={true}
          isSaving={true}
        />
      )

      expect(screen.getByText('保存中...')).toBeInTheDocument()
    })

    it('保存按钮应该在 hasUnsavedChanges 为 false 时禁用', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={false}
        />
      )

      expect(screen.getByText('保存')).toBeDisabled()
    })

    it('撤销和重做按钮应该在 isSaving 时禁用', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          canUndo={true}
          canRedo={true}
          isSaving={true}
        />
      )

      expect(screen.getByTitle('撤销 (Ctrl+Z)')).toBeDisabled()
      expect(screen.getByTitle('重做 (Ctrl+Y)')).toBeDisabled()
    })
  })

  describe('未保存更改提示', () => {
    it('应该在有未保存更改时显示提示', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={true}
        />
      )

      expect(screen.getByText('有未保存的更改')).toBeInTheDocument()
    })

    it('应该在没有未保存更改时不显示提示', () => {
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={false}
        />
      )

      expect(screen.queryByText('有未保存的更改')).not.toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击撤销按钮应该调用 onUndo', () => {
      const onUndo = vi.fn()
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          canUndo={true}
          onUndo={onUndo}
        />
      )

      fireEvent.click(screen.getByTitle('撤销 (Ctrl+Z)'))

      expect(onUndo).toHaveBeenCalledTimes(1)
    })

    it('点击重做按钮应该调用 onRedo', () => {
      const onRedo = vi.fn()
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          canRedo={true}
          onRedo={onRedo}
        />
      )

      fireEvent.click(screen.getByTitle('重做 (Ctrl+Y)'))

      expect(onRedo).toHaveBeenCalledTimes(1)
    })

    it('点击保存按钮应该调用 onSave', () => {
      const onSave = vi.fn()
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          hasUnsavedChanges={true}
          onSave={onSave}
        />
      )

      fireEvent.click(screen.getByText('保存'))

      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('点击取消按钮应该调用 onExitEdit', () => {
      const onExitEdit = vi.fn()
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          onExitEdit={onExitEdit}
        />
      )

      fireEvent.click(screen.getByText('取消'))

      expect(onExitEdit).toHaveBeenCalledTimes(1)
    })

    it('禁用的按钮不应该响应点击', () => {
      const onUndo = vi.fn()
      render(
        <EditToolbar
          {...defaultProps}
          isEditMode={true}
          canUndo={false}
          onUndo={onUndo}
        />
      )

      fireEvent.click(screen.getByTitle('撤销 (Ctrl+Z)'))

      expect(onUndo).not.toHaveBeenCalled()
    })
  })
})
