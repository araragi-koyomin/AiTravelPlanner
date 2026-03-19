import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ItineraryPlanner } from './ItineraryPlanner'
import { TravelPreference } from '@/types/itinerary'
import { generateItinerary } from '@/services/ai'
import { supabase } from '@/services/supabase'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/services/ai', () => ({
  generateItinerary: vi.fn(),
  getAIErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error) return error.message
    return '未知错误'
  })
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn()
    }
  }
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true
  }))
}))

const mockItineraryResult = {
  success: true,
  itinerary: {
    id: 'test-itinerary-id',
    user_id: 'test-user-id',
    destination: '日本东京',
    start_date: '2024-05-01',
    end_date: '2024-05-05',
    budget: 10000,
    participants: 2,
    preferences: ['food'],
    special_requirements: null,
    daily_schedule: [],
    budget_breakdown: {
      transport: 2000,
      accommodation: 3000,
      food: 2000,
      tickets: 1500,
      shopping: 1000,
      entertainment: 0,
      other: 500,
      total: 10000
    },
    tips: [],
    emergency_contacts: {
      police: '110',
      hospital: '120',
      embassy: ''
    },
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
}

describe('ItineraryPlanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(generateItinerary).mockResolvedValue(mockItineraryResult)
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user-id', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2024-01-01T00:00:00Z' } } } as any,
      error: null
    })
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer', user: { id: 'test-user-id', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2024-01-01T00:00:00Z' } } } as any,
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正常渲染组件', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByText('创建旅行计划')).toBeInTheDocument()
      expect(screen.getByText('填写您的旅行需求，AI 将为您生成个性化的旅行计划')).toBeInTheDocument()
    })

    it('应该渲染所有表单字段', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/目的地/)).toBeInTheDocument()
      expect(screen.getByLabelText(/出发日期/)).toBeInTheDocument()
      expect(screen.getByLabelText(/返回日期/)).toBeInTheDocument()
      expect(screen.getByLabelText(/预算/)).toBeInTheDocument()
      expect(screen.getByLabelText(/同行人数/)).toBeInTheDocument()
      expect(screen.getByText('旅行偏好')).toBeInTheDocument()
      expect(screen.getByLabelText(/特殊需求/)).toBeInTheDocument()
    })

    it('应该渲染提交按钮', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByRole('button', { name: '生成行程' })).toBeInTheDocument()
    })

    it('应该渲染重置按钮', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument()
    })

    it('应该渲染所有旅行偏好选项', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByText('美食')).toBeInTheDocument()
      expect(screen.getByText('景点')).toBeInTheDocument()
      expect(screen.getByText('购物')).toBeInTheDocument()
      expect(screen.getByText('文化')).toBeInTheDocument()
      expect(screen.getByText('自然')).toBeInTheDocument()
      expect(screen.getByText('动漫')).toBeInTheDocument()
      expect(screen.getByText('历史')).toBeInTheDocument()
      expect(screen.getByText('夜生活')).toBeInTheDocument()
    })
  })

  describe('表单输入', () => {
    it('应该允许输入目的地', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const destinationInput = screen.getByLabelText(/目的地/)
      await user.type(destinationInput, '日本东京')

      expect(destinationInput).toHaveValue('日本东京')
    })

    it('应该允许选择出发日期', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const startDateInput = screen.getByLabelText(/出发日期/)
      await user.type(startDateInput, tomorrowStr)

      expect(startDateInput).toHaveValue(tomorrowStr)
    })

    it('应该允许输入预算', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const budgetInput = screen.getByLabelText(/预算/)
      await user.type(budgetInput, '10000')

      expect(budgetInput).toHaveValue(10000)
    })

    it('应该允许输入同行人数', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const participantsInput = screen.getByLabelText(/同行人数/)
      await user.type(participantsInput, '5')

      expect(participantsInput).toHaveValue(5)
    })

    it('应该允许选择旅行偏好', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const foodCheckbox = screen.getByText('美食').closest('label')
      if (foodCheckbox) {
        await user.click(foodCheckbox)
      }

      const attractionCheckbox = screen.getByText('景点').closest('label')
      if (attractionCheckbox) {
        await user.click(attractionCheckbox)
      }

      expect(screen.getByText('美食').closest('label')).toHaveClass('bg-primary-500')
      expect(screen.getByText('景点').closest('label')).toHaveClass('bg-primary-500')
    })

    it('应该允许输入特殊需求', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const specialRequirementsInput = screen.getByLabelText(/特殊需求/)
      await user.type(specialRequirementsInput, '带小孩和老人')

      expect(specialRequirementsInput).toHaveValue('带小孩和老人')
    })

    it('应该显示字符计数', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const specialRequirementsInput = screen.getByLabelText(/特殊需求/)
      await user.type(specialRequirementsInput, '带小孩和老人')

      expect(screen.getByText('6/500 字符')).toBeInTheDocument()
    })
  })

  describe('表单验证', () => {
    it('应该显示目的地错误提示', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const destinationInput = screen.getByLabelText(/目的地/)
      await user.type(destinationInput, '东')
      fireEvent.blur(destinationInput)

      await waitFor(() => {
        expect(screen.getByText('目的地至少需要 2 个字符')).toBeInTheDocument()
      })
    })

    it('应该显示预算错误提示', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const budgetInput = screen.getByLabelText(/预算/)
      await user.type(budgetInput, '0')
      fireEvent.blur(budgetInput)

      await waitFor(() => {
        expect(screen.getByText('预算必须大于 0')).toBeInTheDocument()
      })
    })

    it('应该显示同行人数错误提示', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const participantsInput = screen.getByLabelText(/同行人数/)
      await user.type(participantsInput, '21')
      fireEvent.blur(participantsInput)

      await waitFor(() => {
        expect(screen.getByText('同行人数不能超过 20 人')).toBeInTheDocument()
      })
    })

    it('应该禁用提交按钮当表单无效', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: '生成行程' })
      expect(submitButton).toBeDisabled()
    })

    it('应该启用提交按钮当表单有效', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

      await user.type(screen.getByLabelText(/目的地/), '日本东京')
      await user.type(screen.getByLabelText(/出发日期/), tomorrowStr)
      await user.type(screen.getByLabelText(/返回日期/), dayAfterTomorrowStr)
      await user.type(screen.getByLabelText(/预算/), '10000')
      await user.type(screen.getByLabelText(/同行人数/), '2')

      const foodCheckbox = screen.getByText('美食').closest('label')
      if (foodCheckbox) {
        await user.click(foodCheckbox)
      }

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '生成行程' })
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('表单提交', () => {
    it('应该调用 navigate 当表单提交成功', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

      await user.type(screen.getByLabelText(/目的地/), '日本东京')
      await user.type(screen.getByLabelText(/出发日期/), tomorrowStr)
      await user.type(screen.getByLabelText(/返回日期/), dayAfterTomorrowStr)
      await user.type(screen.getByLabelText(/预算/), '10000')
      await user.type(screen.getByLabelText(/同行人数/), '2')

      const foodCheckbox = screen.getByText('美食').closest('label')
      if (foodCheckbox) {
        await user.click(foodCheckbox)
      }

      const submitButton = screen.getByRole('button', { name: '生成行程' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/itineraries/test-itinerary-id')
      }, { timeout: 3000 })
    })

    it('应该显示加载状态当提交中', async () => {
      let resolvePromise: (value: typeof mockItineraryResult) => void
      const pendingPromise = new Promise<typeof mockItineraryResult>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(generateItinerary).mockReturnValue(pendingPromise as Promise<typeof mockItineraryResult>)

      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0]

      await user.type(screen.getByLabelText(/目的地/), '日本东京')
      await user.type(screen.getByLabelText(/出发日期/), tomorrowStr)
      await user.type(screen.getByLabelText(/返回日期/), dayAfterTomorrowStr)
      await user.type(screen.getByLabelText(/预算/), '10000')
      await user.type(screen.getByLabelText(/同行人数/), '2')

      const foodCheckbox = screen.getByText('美食').closest('label')
      if (foodCheckbox) {
        await user.click(foodCheckbox)
      }

      const submitButton = screen.getByRole('button', { name: '生成行程' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'AI 正在生成行程...' })).toBeInTheDocument()
      })

      resolvePromise!(mockItineraryResult)
    })
  })

  describe('表单重置', () => {
    it('应该清空表单当点击重置按钮', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      await user.type(screen.getByLabelText(/目的地/), '日本东京')
      await user.type(screen.getByLabelText(/预算/), '10000')

      const resetButton = screen.getByRole('button', { name: '重置' })
      await user.click(resetButton)

      expect(screen.getByLabelText(/目的地/)).toHaveValue('')
      expect(screen.getByLabelText(/预算/)).toHaveValue(null)
    })

    it('应该清除 localStorage 当点击重置按钮', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      await user.type(screen.getByLabelText(/目的地/), '日本东京')

      const resetButton = screen.getByRole('button', { name: '重置' })
      await user.click(resetButton)

      const savedData = JSON.parse(localStorage.getItem('itineraryFormData') || '{}')
      expect(savedData.destination).toBe('')
      expect(savedData.preferences).toEqual([])
    })
  })

  describe('localStorage 集成', () => {
    it('应该从 localStorage 恢复表单数据', () => {
      const savedData = {
        destination: '日本东京',
        startDate: '2024-05-01',
        endDate: '2024-05-05',
        budget: '10000',
        participants: '2',
        preferences: [TravelPreference.FOOD],
        specialRequirements: '带小孩'
      }
      localStorage.setItem('itineraryFormData', JSON.stringify(savedData))

      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/目的地/)).toHaveValue('日本东京')
      expect(screen.getByLabelText(/预算/)).toHaveValue(10000)
      expect(screen.getByLabelText(/同行人数/)).toHaveValue(2)
    })

    it('应该保存表单数据到 localStorage', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      await user.type(screen.getByLabelText(/目的地/), '日本东京')

      await waitFor(() => {
        const savedData = JSON.parse(localStorage.getItem('itineraryFormData') || '{}')
        expect(savedData.destination).toBe('日本东京')
      })
    })

    it('应该处理无效的 localStorage 数据', () => {
      localStorage.setItem('itineraryFormData', 'invalid-json')

      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      expect(screen.getByLabelText(/目的地/)).toHaveValue('')
    })
  })

  describe('日期限制', () => {
    it('应该设置出发日期最小值为今天', () => {
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const today = new Date().toISOString().split('T')[0]
      const startDateInput = screen.getByLabelText(/出发日期/)
      expect(startDateInput).toHaveAttribute('min', today)
    })

    it('应该设置返回日期最小值为出发日期', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <ItineraryPlanner />
        </MemoryRouter>
      )

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      await user.type(screen.getByLabelText(/出发日期/), tomorrowStr)

      const endDateInput = screen.getByLabelText(/返回日期/)
      expect(endDateInput).toHaveAttribute('min', tomorrowStr)
    })
  })
})
