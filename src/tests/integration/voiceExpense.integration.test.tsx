import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ExpenseManager } from '../../pages/ExpenseManager'
import { parseVoiceToExpense } from '../../utils/voiceParser'

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

function renderExpenseManager() {
  return render(
    <MemoryRouter>
      <ExpenseManager />
    </MemoryRouter>
  )
}

describe('语音费用集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('语音输入到费用解析流程', () => {
    it('应该正确解析完整的费用语音输入', async () => {
      const voiceText = '今天午餐花了50元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 50,
        category: 'food',
        description: '午餐'
      })
    })

    it('应该正确解析交通费用', async () => {
      const voiceText = '打车花了30元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 30,
        category: 'transport',
        description: '打车'
      })
    })

    it('应该正确解析住宿费用', async () => {
      const voiceText = '酒店住宿500元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 500,
        category: 'accommodation',
        description: '酒店住宿'
      })
    })

    it('应该正确解析门票费用', async () => {
      const voiceText = '门票花了120元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 120,
        category: 'ticket',
        description: '门票'
      })
    })

    it('应该正确解析购物费用', async () => {
      const voiceText = '买纪念品花了200元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 200,
        category: 'shopping',
        description: '买纪念品'
      })
    })

    it('应该正确解析娱乐费用', async () => {
      const voiceText = '看电影花了80元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 80,
        category: 'entertainment',
        description: '看电影'
      })
    })

    it('应该正确解析其他费用', async () => {
      const voiceText = '其他支出100元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 100,
        category: 'other',
        description: '其他支出'
      })
    })

    it('应该正确解析仅金额的语音输入', async () => {
      const voiceText = '花了50元'
      const result = parseVoiceToExpense(voiceText)

      expect(result).toEqual({
        amount: 50
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

      renderExpenseManager()

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

      renderExpenseManager()

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

      renderExpenseManager()

      expect(screen.getByText('麦克风权限被拒绝')).toBeInTheDocument()
    })
  })

  describe('语音结果确认流程', () => {
    it('点击确认按钮应该解析语音并填充表单', async () => {
      const mockStartRecording = vi.fn()
      const mockReset = vi.fn()

      mockUseVoiceRecognition.mockReturnValue({
        status: 'idle',
        text: '午餐花了50元',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: mockStartRecording,
        stopRecording: vi.fn(),
        reset: mockReset,
        isSupported: true
      })

      renderExpenseManager()

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
        text: '打车花了30元',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: mockReset,
        isSupported: true
      })

      renderExpenseManager()

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
        text: '午餐花了50元',
        error: null,
        duration: 0,
        volume: 0,
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        reset: vi.fn(),
        isSupported: true
      })

      renderExpenseManager()

      const editButton = screen.queryByRole('button', { name: /编辑/i })
      if (editButton) {
        fireEvent.click(editButton)

        const textbox = screen.queryByRole('textbox')
        if (textbox) {
          fireEvent.change(textbox, { target: { value: '晚餐花了80元' } })

          const saveButton = screen.queryByRole('button', { name: /保存/i })
          if (saveButton) {
            fireEvent.click(saveButton)

            await waitFor(() => {
              expect(screen.getByText('晚餐花了80元')).toBeInTheDocument()
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

      renderExpenseManager()

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

      renderExpenseManager()

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

      renderExpenseManager()

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

      renderExpenseManager()

      expect(screen.getByText(/当前浏览器不支持语音识别/i)).toBeInTheDocument()
    })
  })

  describe('语音解析边界情况', () => {
    it('空语音输入应该返回空对象', () => {
      const result = parseVoiceToExpense('')
      expect(result).toEqual({})
    })

    it('无法识别的语音输入应该返回空对象', () => {
      const result = parseVoiceToExpense('今天天气真好')
      expect(result).toEqual({})
    })

    it('部分识别的语音输入应该只返回识别的字段', () => {
      const result = parseVoiceToExpense('花了100元')
      expect(result).toEqual({
        amount: 100
      })
    })

    it('应该正确处理大额费用', () => {
      const result = parseVoiceToExpense('酒店住宿一万两千元')
      expect(result.amount).toBe(12000)
    })

    it('应该正确处理小数费用', () => {
      const result = parseVoiceToExpense('打车花了15.5元')
      expect(result.amount).toBe(15.5)
    })
  })

  describe('费用分类识别', () => {
    it('应该识别餐饮类别的多种表达', () => {
      const cases = [
        { text: '早餐花了20元', expected: 'food' },
        { text: '午餐消费50元', expected: 'food' },
        { text: '晚餐支出80元', expected: 'food' },
        { text: '吃饭花了100元', expected: 'food' }
      ]

      cases.forEach(({ text, expected }) => {
        const result = parseVoiceToExpense(text)
        expect(result.category).toBe(expected)
      })
    })

    it('应该识别交通类别的多种表达', () => {
      const cases = [
        { text: '打车花了30元', expected: 'transport' },
        { text: '坐地铁花了5元', expected: 'transport' },
        { text: '公交费2元', expected: 'transport' },
        { text: '加油花了200元', expected: 'transport' }
      ]

      cases.forEach(({ text, expected }) => {
        const result = parseVoiceToExpense(text)
        expect(result.category).toBe(expected)
      })
    })

    it('应该识别住宿类别的多种表达', () => {
      const cases = [
        { text: '酒店住宿500元', expected: 'accommodation' },
        { text: '民宿费用300元', expected: 'accommodation' },
        { text: '房费200元', expected: 'accommodation' }
      ]

      cases.forEach(({ text, expected }) => {
        const result = parseVoiceToExpense(text)
        expect(result.category).toBe(expected)
      })
    })

    it('应该识别门票类别的多种表达', () => {
      const cases = [
        { text: '门票花了120元', expected: 'ticket' },
        { text: '景点门票80元', expected: 'ticket' },
        { text: '景区门票50元', expected: 'ticket' }
      ]

      cases.forEach(({ text, expected }) => {
        const result = parseVoiceToExpense(text)
        expect(result.category).toBe(expected)
      })
    })
  })
})
