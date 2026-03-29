import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VoiceResult } from './VoiceResult'

describe('VoiceResult', () => {
  describe('渲染测试', () => {
    it('应该显示识别的文本', () => {
      render(
        <VoiceResult
          text="去北京旅游"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByText('去北京旅游')).toBeInTheDocument()
    })

    it('应该显示编辑按钮', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /编辑/i })).toBeInTheDocument()
    })

    it('应该显示使用按钮', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /使用/i })).toBeInTheDocument()
    })

    it('文本为空时不应该渲染', () => {
      const { container } = render(
        <VoiceResult
          text=""
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('交互测试', () => {
    it('点击使用按钮应该调用 onConfirm', () => {
      const onConfirm = vi.fn()
      render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={onConfirm}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /使用/i })
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('点击编辑按钮应该调用 onEdit', () => {
      const onEdit = vi.fn()
      render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={onEdit}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      const editButton = screen.getByRole('button', { name: /编辑/i })
      fireEvent.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('编辑模式测试', () => {
    it('编辑模式应该显示文本输入框', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('编辑模式应该显示原始文本', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      const textbox = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textbox.value).toBe('测试文本')
    })

    it('编辑模式应该可以修改文本', () => {
      const onChangeText = vi.fn()
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={onChangeText}
        />
      )

      const textbox = screen.getByRole('textbox')
      fireEvent.change(textbox, { target: { value: '修改后的文本' } })

      expect(onChangeText).toHaveBeenCalledWith('修改后的文本')
    })

    it('编辑模式应该显示确认按钮', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /确认/i })).toBeInTheDocument()
    })

    it('编辑模式应该显示取消按钮', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument()
    })

    it('点击确认按钮应该调用 onConfirm', () => {
      const onConfirm = vi.fn()
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={onConfirm}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /确认/i })
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalled()
    })

    it('点击取消按钮应该调用 onCancel', () => {
      const onCancel = vi.fn()
      render(
        <VoiceResult
          text="测试文本"
          isEditing={true}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={onCancel}
          onChangeText={vi.fn()}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /取消/i })
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('样式测试', () => {
    it('应该支持自定义 className', () => {
      const { container } = render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('确认按钮应该有主要样式', () => {
      render(
        <VoiceResult
          text="测试文本"
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      const confirmButton = screen.getByRole('button', { name: /使用/i })
      expect(confirmButton.className).toContain('bg-primary')
    })
  })

  describe('边界情况测试', () => {
    it('长文本应该正确显示', () => {
      const longText = '这是一段很长的测试文本'.repeat(20)
      render(
        <VoiceResult
          text={longText}
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('特殊字符应该正确显示', () => {
      const specialText = '测试<script>alert("xss")</script>文本'
      render(
        <VoiceResult
          text={specialText}
          isEditing={false}
          onConfirm={vi.fn()}
          onEdit={vi.fn()}
          onCancel={vi.fn()}
          onChangeText={vi.fn()}
        />
      )

      expect(screen.getByText(specialText)).toBeInTheDocument()
    })
  })
})
