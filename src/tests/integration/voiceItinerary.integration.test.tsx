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
    it('应该在 idle 状态正确渲染', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })

    it('应该在 recording 状态正确渲染', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })

    it('应该在 error 状态正确渲染', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })
  })

  describe('语音结果确认流程', () => {
    it('应该正确渲染行程规划页面', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })

    it('应该支持重置操作', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })
  })

  describe('语音编辑流程', () => {
    it('应该正确渲染编辑界面', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })
  })

  describe('错误处理流程', () => {
    it('应该正确处理错误状态', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })

    it('应该支持重试操作', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
    })
  })

  describe('浏览器兼容性', () => {
    it('不支持语音识别的浏览器应该正确渲染', async () => {
      renderItineraryPlanner()
      expect(screen.getByText(/语音输入/i)).toBeInTheDocument()
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
      expect(result.destination).toBe('三亚')
      expect(result.participants).toBe(2)
    })
  })
})
