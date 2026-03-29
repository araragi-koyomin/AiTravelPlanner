import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoiceInput } from './VoiceInput'
import type { VoiceStatus } from '../../types/voice'

const mockUseVoiceRecognition = {
  status: 'idle' as VoiceStatus,
  text: '',
  error: null as string | null,
  duration: 0,
  volume: 0,
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  reset: vi.fn(),
  isSupported: true
}

vi.mock('../../hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: vi.fn(() => mockUseVoiceRecognition)
}))

describe('VoiceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseVoiceRecognition.status = 'idle'
    mockUseVoiceRecognition.text = ''
    mockUseVoiceRecognition.error = null
    mockUseVoiceRecognition.duration = 0
    mockUseVoiceRecognition.volume = 0
    mockUseVoiceRecognition.isSupported = true
  })

  describe('渲染测试', () => {
    it('应该渲染语音输入组件', () => {
      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该显示默认占位符文本', () => {
      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/点击麦克风开始录音/i)).toBeInTheDocument()
    })

    it('应该显示自定义占位符文本', () => {
      render(<VoiceInput onResult={vi.fn()} placeholder="点击开始录音" />)

      expect(screen.getByText('点击开始录音')).toBeInTheDocument()
    })

    it('禁用状态应该禁用按钮', () => {
      render(<VoiceInput onResult={vi.fn()} disabled={true} />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('不支持语音识别时应该显示提示', () => {
      mockUseVoiceRecognition.isSupported = false

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/当前浏览器不支持语音识别/i)).toBeInTheDocument()
    })
  })

  describe('状态显示测试', () => {
    it('idle 状态应该显示开始录音提示', () => {
      mockUseVoiceRecognition.status = 'idle'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/点击麦克风开始录音/i)).toBeInTheDocument()
    })

    it('recording 状态应该显示录音中提示', () => {
      mockUseVoiceRecognition.status = 'recording'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/正在录音/i)).toBeInTheDocument()
    })

    it('recognizing 状态应该显示识别中提示', () => {
      mockUseVoiceRecognition.status = 'recognizing'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/正在识别/i)).toBeInTheDocument()
    })

    it('error 状态应该显示错误信息', () => {
      mockUseVoiceRecognition.status = 'error'
      mockUseVoiceRecognition.error = '测试错误'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText('测试错误')).toBeInTheDocument()
    })

    it('recording 状态应该显示录音时长', () => {
      mockUseVoiceRecognition.status = 'recording'
      mockUseVoiceRecognition.duration = 5000

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText(/0:05/)).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击按钮应该开始录音', () => {
      render(<VoiceInput onResult={vi.fn()} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockUseVoiceRecognition.startRecording).toHaveBeenCalled()
    })

    it('录音中点击按钮应该停止录音', () => {
      mockUseVoiceRecognition.status = 'recording'

      render(<VoiceInput onResult={vi.fn()} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockUseVoiceRecognition.stopRecording).toHaveBeenCalled()
    })

    it('识别中点击按钮不应该触发任何操作', () => {
      mockUseVoiceRecognition.status = 'recognizing'

      render(<VoiceInput onResult={vi.fn()} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockUseVoiceRecognition.startRecording).not.toHaveBeenCalled()
      expect(mockUseVoiceRecognition.stopRecording).not.toHaveBeenCalled()
    })

    it('禁用状态点击按钮不应该触发任何操作', () => {
      render(<VoiceInput onResult={vi.fn()} disabled={true} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockUseVoiceRecognition.startRecording).not.toHaveBeenCalled()
    })
  })

  describe('结果处理测试', () => {
    it('有识别结果时应该显示结果', () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText('去北京旅游')).toBeInTheDocument()
    })

    it('点击使用按钮应该调用 onResult', async () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      const onResult = vi.fn()
      render(<VoiceInput onResult={onResult} />)

      const confirmButton = screen.getByRole('button', { name: /使用/i })
      fireEvent.click(confirmButton)

      expect(onResult).toHaveBeenCalledWith('去北京旅游')
    })

    it('点击使用按钮应该重置状态', async () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} />)

      const confirmButton = screen.getByRole('button', { name: /使用/i })
      fireEvent.click(confirmButton)

      expect(mockUseVoiceRecognition.reset).toHaveBeenCalled()
    })
  })

  describe('编辑模式测试', () => {
    it('点击编辑按钮应该进入编辑模式', () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} />)

      const editButton = screen.getByRole('button', { name: /编辑/i })
      fireEvent.click(editButton)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('编辑模式下应该可以修改文本', () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} />)

      const editButton = screen.getByRole('button', { name: /编辑/i })
      fireEvent.click(editButton)

      const textbox = screen.getByRole('textbox')
      fireEvent.change(textbox, { target: { value: '去上海旅游' } })

      expect((textbox as HTMLTextAreaElement).value).toBe('去上海旅游')
    })

    it('编辑模式下点击确认应该更新文本', async () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      const onResult = vi.fn()
      render(<VoiceInput onResult={onResult} />)

      const editButton = screen.getByRole('button', { name: /编辑/i })
      fireEvent.click(editButton)

      const textbox = screen.getByRole('textbox')
      fireEvent.change(textbox, { target: { value: '去上海旅游' } })

      const confirmButton = screen.getByRole('button', { name: /确认/i })
      fireEvent.click(confirmButton)

      expect(onResult).toHaveBeenCalledWith('去上海旅游')
    })

    it('编辑模式下点击取消应该恢复原文本', async () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} />)

      const editButton = screen.getByRole('button', { name: /编辑/i })
      fireEvent.click(editButton)

      const textbox = screen.getByRole('textbox')
      fireEvent.change(textbox, { target: { value: '去上海旅游' } })

      const cancelButton = screen.getByRole('button', { name: /取消/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.getByText('去北京旅游')).toBeInTheDocument()
      })
    })
  })

  describe('预览显示测试', () => {
    it('showPreview 为 true 时应该显示结果预览', () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} showPreview={true} />)

      expect(screen.getByText('去北京旅游')).toBeInTheDocument()
    })

    it('showPreview 为 false 时不应该显示结果预览', () => {
      mockUseVoiceRecognition.text = '去北京旅游'

      render(<VoiceInput onResult={vi.fn()} showPreview={false} />)

      expect(screen.queryByText('去北京旅游')).not.toBeInTheDocument()
    })
  })

  describe('样式测试', () => {
    it('应该支持自定义 className', () => {
      const { container } = render(
        <VoiceInput onResult={vi.fn()} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('错误处理测试', () => {
    it('应该显示错误信息', () => {
      mockUseVoiceRecognition.status = 'error'
      mockUseVoiceRecognition.error = '麦克风权限被拒绝'

      render(<VoiceInput onResult={vi.fn()} />)

      expect(screen.getByText('麦克风权限被拒绝')).toBeInTheDocument()
    })
  })

  describe('可访问性测试', () => {
    it('按钮应该有正确的 aria-label', () => {
      mockUseVoiceRecognition.isSupported = true

      render(<VoiceInput onResult={vi.fn()} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '开始录音')
    })

    it('录音状态按钮应该有正确的 aria-label', () => {
      mockUseVoiceRecognition.status = 'recording'
      mockUseVoiceRecognition.isSupported = true

      render(<VoiceInput onResult={vi.fn()} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '停止录音')
    })
  })
})
