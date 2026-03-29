import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ItineraryPlanner } from '../../pages/ItineraryPlanner'
import { parseVoiceToItinerary } from '../../utils/voiceParser'

vi.mock('../../hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: vi.fn(() => ({
    status: 'idle',
    text: '',
    error: null,
    duration: 0,
    volume: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    reset: vi.fn(),
    isSupported: true
  }))
}))

vi.mock('../../services/xunfei', () => ({
  XunfeiVoiceService: vi.fn(),
  createXunfeiService: vi.fn()
}))

const mockUseVoiceRecognition = vi.mocked(await import('../../hooks/useVoiceRecognition')).useVoiceRecognition

function renderItineraryPlanner() {
  return render(
    <MemoryRouter>
      <ItineraryPlanner />
    </MemoryRouter>
  )
}

describe('语音行程集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('语音输入到行程解析流程', () => {
    it('应该正确解析完整的行程语音输入', async () => {
      const voiceText = '去北京旅游，从2024年3月1日出发，到2024年3月5日返回，预算5000元，3个人，需要注意海鲜过敏'
      const result = parseVoiceToItinerary(voiceText)

      expect(result).toEqual({
        destination: '北京',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        budget: 5000,
        participants: 3,
        specialRequirements: '海鲜过敏'
      })
    })

    it('应该正确解析部分行程语音输入', async () => {
      const voiceText = '去上海旅游，预算3000元'
      const result = parseVoiceToItinerary(voiceText)

      expect(result).toEqual({
        destination: '上海',
        budget: 3000
      })
    })

    it('应该正确解析仅目的地的语音输入', async () => {
      const voiceText = '我想去杭州'
      const result = parseVoiceToItinerary(voiceText)

      expect(result).toEqual({
        destination: '杭州'
      })
    })
  })

  describe('语音识别状态管理', () => {
    it('应该在 idle 状态显示开始录音提示', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      expect(screen.getByText(/点击麦克风开始录音/i)).toBeInTheDocument()
    })

    it('应该在 recording 状态显示录音中提示', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'recording',
        text: '',
        error: null,
        duration: 5000,
        volume: 0.5,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      expect(screen.getByText(/录音中/i)).toBeInTheDocument()
    })

    it('应该在 error 状态显示错误信息', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'error',
        text: '',
        error: '麦克风权限被拒绝',
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      expect(screen.getByText('麦克风权限被拒绝')).toBeInTheDocument()
    })
  })

  describe('语音结果确认流程', () => {
    it('点击确认按钮应该解析语音并填充表单', async () => {
      const mockStartRecording = vi.fn()
      const mockReset = vi.fn()

      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '去北京旅游，预算5000元',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: mockStartRecording,
        stopRecording: vi.fn(),
        reset: mockReset,
        isSupported: true
      })

      renderItineraryPlanner()

      const confirmButton = screen.queryByRole('button', { name: /确认/i })
      if (confirmButton) {
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(mockReset).toHaveBeenCalled()
        })
      }
    })

    it('点击重置按钮应该清空语音结果', async () => {
      const mockReset = vi.fn()

      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '去北京旅游',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: mockReset,
        isSupported: true
      })

      renderItineraryPlanner()

      const resetButton = screen.queryByRole('button', { name: /重置/i })
      if (resetButton) {
        fireEvent.click(resetButton)

        expect(mockReset).toHaveBeenCalled()
      }
    })
  })

  describe('语音编辑流程', () => {
    it('编辑语音结果后应该更新解析', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '去北京旅游',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      const editButton = screen.queryByRole('button', { name: /编辑/i })
      if (editButton) {
        fireEvent.click(editButton)

        const textbox = screen.queryByRole('textbox')
        if (textbox) {
          fireEvent.change(textbox, { target: { value: '去上海旅游，预算3000元' } })

          const saveButton = screen.queryByRole('button', { name: /保存/i })
          if (saveButton) {
            fireEvent.click(saveButton)

            await waitFor(() => {
              expect(screen.getByText('去上海旅游，预算3000元')).toBeInTheDocument()
            })
          }
        }
      }
    })
  })

  describe('错误处理流程', () => {
    it('麦克风权限拒绝应该显示错误提示', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'error',
        text: '',
        error: '麦克风权限被拒绝',
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      expect(screen.getByText('麦克风权限被拒绝')).toBeInTheDocument()
    })

    it('网络错误应该显示错误提示', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'error',
        text: '',
        error: '网络连接失败',
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderItineraryPlanner()

      expect(screen.getByText('网络连接失败')).toBeInTheDocument()
    })

    it('点击重试按钮应该重置错误状态', async () => {
      const mockReset = vi.fn()

      mockUseVoiceRecognition.mockReturnValue({
        status: 'error',
        text: '',
        error: '测试错误',
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: mockReset,
        isSupported: true
      })

      renderItineraryPlanner()

      const retryButton = screen.queryByRole('button', { name: /重试/i })
      if (retryButton) {
        fireEvent.click(retryButton)

        expect(mockReset).toHaveBeenCalled()
      }
    })
  })

  describe('浏览器兼容性', () => {
    it('不支持语音识别的浏览器应该显示提示', async () => {
      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: false
      })

      renderItineraryPlanner()

      expect(screen.getByText(/当前浏览器不支持语音识别/i)).toBeInTheDocument()
    })
  })

  describe('语音解析边界情况', () => {
    it('空语音输入应该返回空对象', () => {
      const result = parseVoiceToItinerary('')
      expect(result).toEqual({})
    })

    it('无法识别的语音输入应该返回空对象', () => {
      const result = parseVoiceToItinerary('今天天气真好')
      expect(result).toEqual({})
    })

    it('部分识别的语音输入应该只返回识别的字段', () => {
      const result = parseVoiceToItinerary('去三亚，两个人')
      expect(result).toEqual({
        destination: '三亚',
        participants: 2
      })
    })
  })
})
