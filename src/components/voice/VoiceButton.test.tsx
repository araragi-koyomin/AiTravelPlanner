import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VoiceButton } from './VoiceButton'

describe('VoiceButton', () => {
  describe('渲染测试', () => {
    it('应该渲染按钮', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该在非录音状态显示麦克风图标', () => {
      const { container } = render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('应该在录音状态显示停止图标', () => {
      const { container } = render(
        <VoiceButton
          isRecording={true}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('应该在禁用状态时按钮不可点击', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={true}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('应该在非禁用状态时按钮可点击', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('交互测试', () => {
    it('点击非录音状态按钮应该调用 onStart', () => {
      const onStart = vi.fn()
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={onStart}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('点击录音状态按钮应该调用 onStop', () => {
      const onStop = vi.fn()
      render(
        <VoiceButton
          isRecording={true}
          disabled={false}
          onStart={vi.fn()}
          onStop={onStop}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('禁用状态下点击不应该调用任何回调', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()
      render(
        <VoiceButton
          isRecording={false}
          disabled={true}
          onStart={onStart}
          onStop={onStop}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onStart).not.toHaveBeenCalled()
      expect(onStop).not.toHaveBeenCalled()
    })
  })

  describe('样式测试', () => {
    it('非录音状态应该有默认样式', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary')
    })

    it('录音状态应该有录音样式', () => {
      render(
        <VoiceButton
          isRecording={true}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-red-500')
    })

    it('禁用状态应该有禁用样式', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={true}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('opacity-50')
    })

    it('应该支持自定义 className', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
          className="custom-class"
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('动画测试', () => {
    it('录音状态应该有脉冲动画', () => {
      const { container } = render(
        <VoiceButton
          isRecording={true}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const pingElement = container.querySelector('.animate-ping')
      expect(pingElement).toBeInTheDocument()
    })

    it('非录音状态不应该有脉冲动画', () => {
      const { container } = render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const pingElement = container.querySelector('.animate-ping')
      expect(pingElement).not.toBeInTheDocument()
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的 aria-label', () => {
      render(
        <VoiceButton
          isRecording={false}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '开始录音')
    })

    it('录音状态应该有正确的 aria-label', () => {
      render(
        <VoiceButton
          isRecording={true}
          disabled={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
          volume={0}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '停止录音')
    })
  })
})
