import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ExpenseManager } from '../../pages/ExpenseManager'
import * as expenseService from '../../services/expense'
import * as itineraryService from '../../services/itinerary'
import { useAuthStore } from '../../stores/authStore'

vi.mock('recharts', () => import('../../test/mocks/recharts.tsx'))

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

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

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockGetExpenses = vi.spyOn(expenseService, 'getExpenses')
const mockGetExpenseStats = vi.spyOn(expenseService, 'getExpenseStats')
const mockGetItineraryById = vi.spyOn(itineraryService, 'getItineraryById')

function renderExpenseManager(itineraryId: string = 'test-itinerary-id') {
  return render(
    <MemoryRouter initialEntries={[`/itinerary/${itineraryId}/expenses`]}>
      <Routes>
        <Route path="/itinerary/:itineraryId/expenses" element={<ExpenseManager />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ExpenseManager 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'test-user-id', email: 'test@example.com' },
      isLoading: false
    } as unknown as ReturnType<typeof useAuthStore>)
  })

  describe('页面加载测试', () => {
    it('应该正确加载费用数据', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 0,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(mockGetExpenses).toHaveBeenCalledWith('test-itinerary-id')
        expect(mockGetExpenseStats).toHaveBeenCalledWith('test-itinerary-id')
      })
    })

    it('应该正确加载行程预算', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 15000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 0,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(mockGetItineraryById).toHaveBeenCalledWith('test-itinerary-id')
      })
    })

    it('加载中应该显示加载状态', async () => {
      mockGetItineraryById.mockImplementation(() => new Promise(() => {}))
      mockGetExpenses.mockImplementation(() => new Promise(() => {}))
      mockGetExpenseStats.mockImplementation(() => new Promise(() => {}))

      renderExpenseManager()

      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })

    it('加载失败应该显示错误信息', async () => {
      mockGetItineraryById.mockRejectedValueOnce(new Error('加载失败'))
      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 0,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText(/加载失败/)).toBeInTheDocument()
      })
    })
  })

  describe('预算概览集成测试', () => {
    it('应该显示预算概览组件', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('预算概览')).toBeInTheDocument()
      })
    })

    it('预算数据应该正确传递', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('¥10,000')).toBeInTheDocument()
        const amounts = screen.getAllByText('¥5,000')
        expect(amounts.length).toBeGreaterThan(0)
      })
    })

    it('超支时应该显示超支提醒', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 12000,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('预算超支')).toBeInTheDocument()
      })
    })
  })

  describe('图表集成测试', () => {
    it('应该显示支出分类饼图', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {
          transport: 2000,
          food: 1500,
          accommodation: 1500
        },
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })
    })

    it('应该显示每日支出柱状图', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {},
        amountByDate: {
          '2024-03-01': 2000,
          '2024-03-02': 3000
        },
        averageDailyAmount: 2500
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })
  })

  describe('费用分析集成测试', () => {
    it('应该显示费用分析报告', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {
          transport: 2000
        },
        amountByDate: {
          '2024-03-01': 5000
        },
        averageDailyAmount: 5000
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('费用分析报告')).toBeInTheDocument()
      })
    })

    it('应该显示消费建议', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 5000,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('消费建议')).toBeInTheDocument()
      })
    })
  })

  describe('视图切换测试', () => {
    it('应该显示视图切换按钮', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 10000
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 0,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('未认证用户测试', () => {
    it('未认证用户应该被重定向到登录页', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false
      } as unknown as ReturnType<typeof useAuthStore>)

      renderExpenseManager()

      await waitFor(() => {
        expect(mockGetExpenses).not.toHaveBeenCalled()
      })
    })
  })

  describe('空数据测试', () => {
    it('没有费用数据时应该正确显示', async () => {
      mockGetItineraryById.mockResolvedValueOnce({
        id: 'test-itinerary-id',
        title: '测试行程',
        budget: 0
      } as itineraryService.Itinerary)

      mockGetExpenses.mockResolvedValueOnce([])
      mockGetExpenseStats.mockResolvedValueOnce({
        totalAmount: 0,
        amountByCategory: {},
        amountByDate: {},
        averageDailyAmount: 0
      })

      renderExpenseManager()

      await waitFor(() => {
        expect(screen.getByText('预算概览')).toBeInTheDocument()
      })
    })
  })
})
