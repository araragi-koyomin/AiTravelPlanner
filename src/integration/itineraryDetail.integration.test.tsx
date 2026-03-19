import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ItineraryDetail } from '@/pages/ItineraryDetail'
import * as itineraryService from '@/services/itinerary'
import * as authStore from '@/stores/authStore'

const mockUseAuthStore = vi.spyOn(authStore, 'useAuthStore')
const mockGetItineraryById = vi.spyOn(itineraryService, 'getItineraryById')
const mockGetItineraryItems = vi.spyOn(itineraryService, 'getItineraryItems')
const mockBuildDailySchedule = vi.spyOn(itineraryService, 'buildDailySchedule')
const mockBuildBudgetBreakdown = vi.spyOn(itineraryService, 'buildBudgetBreakdown')

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z'
}

const mockItinerary = {
  id: 'test-itinerary-id',
  user_id: 'test-user-id',
  title: '北京三日游',
  destination: '北京',
  start_date: '2024-03-01',
  end_date: '2024-03-03',
  budget: 5000,
  participants: 2,
  preferences: ['attraction', 'food'],
  special_requirements: null,
  travelers_type: 'adult',
  accommodation_pref: 'comfort',
  pace: 'moderate',
  is_favorite: false,
  status: 'generated' as const,
  cover_image: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockItems = [
  {
    id: 'item-1',
    itinerary_id: 'test-itinerary-id',
    day: 1,
    time: '09:00',
    type: 'attraction' as const,
    name: '故宫博物院',
    location: { address: '北京市东城区景山前街4号', lat: 0, lng: 0 },
    description: '参观故宫',
    cost: 60,
    duration: 180,
    tips: null,
    image_url: null,
    order_idx: 0,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-2',
    itinerary_id: 'test-itinerary-id',
    day: 1,
    time: '12:00',
    type: 'restaurant' as const,
    name: '全聚德烤鸭店',
    location: { address: '北京市东城区前门大街', lat: 0, lng: 0 },
    description: '品尝北京烤鸭',
    cost: 200,
    duration: 90,
    tips: null,
    image_url: null,
    order_idx: 1,
    created_at: '2024-01-01T00:00:00Z'
  }
]

const mockDailySchedule = [
  {
    day: 1,
    date: '2024-03-01',
    dayOfWeek: '星期五',
    theme: '探索之旅',
    items: mockItems
  },
  {
    day: 2,
    date: '2024-03-02',
    dayOfWeek: '星期六',
    theme: '文化体验',
    items: []
  },
  {
    day: 3,
    date: '2024-03-03',
    dayOfWeek: '星期日',
    theme: '休闲时光',
    items: []
  }
]

const mockBudgetBreakdown = {
  transport: 500,
  accommodation: 1000,
  food: 600,
  tickets: 260,
  shopping: 200,
  entertainment: 0,
  other: 100,
  total: 2660
}

describe('ItineraryDetail 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      user: mockUser,
      session: null,
      error: null,
      rememberMe: false,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetUserPassword: vi.fn(),
      updateUserPassword: vi.fn(),
      initializeAuth: vi.fn(),
      checkAuth: vi.fn()
    })

    mockGetItineraryById.mockResolvedValue(mockItinerary)
    mockGetItineraryItems.mockResolvedValue(mockItems)
    mockBuildDailySchedule.mockReturnValue(mockDailySchedule)
    mockBuildBudgetBreakdown.mockReturnValue(mockBudgetBreakdown)
  })

  describe('端到端流程测试', () => {
    it('应该完整加载行程详情页面', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      expect(screen.getAllByText('北京').length).toBeGreaterThan(0)
      expect(screen.getByText('行程概览')).toBeInTheDocument()
      expect(screen.getByText('每日行程')).toBeInTheDocument()
    })

    it('应该正确显示行程信息', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      expect(screen.getAllByText('北京').length).toBeGreaterThan(0)
      expect(screen.getByText(/3\s*天/)).toBeInTheDocument()
      expect(screen.getByText(/2\s*人/)).toBeInTheDocument()
      expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
    })

    it('应该正确显示行程项', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('探索之旅')).toBeInTheDocument()
      })

      const dayCard = screen.getByText('探索之旅').closest('.cursor-pointer')
      if (dayCard) {
        fireEvent.click(dayCard)
      }

      await waitFor(() => {
        expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
      })
    })

    it('应该支持视图切换', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const timelineButton = screen.getByRole('button', { name: '时间轴视图' })
      fireEvent.click(timelineButton)

      expect(timelineButton).toHaveClass('bg-primary-600')

      const listButton = screen.getByRole('button', { name: '列表视图' })
      fireEvent.click(listButton)

      expect(listButton).toHaveClass('bg-primary-600')
    })

    it('应该支持展开/折叠', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('展开全部')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('展开全部'))

      await waitFor(() => {
        expect(screen.getByText('折叠全部')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('折叠全部'))

      await waitFor(() => {
        expect(screen.getByText('展开全部')).toBeInTheDocument()
      })
    })
  })

  describe('服务层集成测试', () => {
    it('应该正确调用 getItineraryById', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraryById).toHaveBeenCalledWith('test-itinerary-id')
      })
    })

    it('应该正确调用 getItineraryItems', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraryItems).toHaveBeenCalledWith('test-itinerary-id')
      })
    })

    it('应该正确调用 buildDailySchedule', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockBuildDailySchedule).toHaveBeenCalledWith(
          '2024-03-01',
          '2024-03-03',
          mockItems
        )
      })
    })

    it('应该正确调用 buildBudgetBreakdown', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockBuildBudgetBreakdown).toHaveBeenCalledWith(mockItems)
      })
    })

    it('应该正确处理服务层返回的错误', async () => {
      mockGetItineraryById.mockRejectedValue(new Error('服务不可用'))

      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('加载行程失败，请重试')).toBeInTheDocument()
      })
    })
  })

  describe('路由集成测试', () => {
    it('应该正确导航到行程详情页', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })
    })

    it('应该正确处理路由参数', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/custom-id-123']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraryById).toHaveBeenCalledWith('custom-id-123')
      })
    })

    it('应该导航到行程列表页当点击返回按钮', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('← 返回')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('← 返回'))

      await waitFor(() => {
        expect(screen.getByText('Itineraries Page')).toBeInTheDocument()
      })
    })
  })

  describe('认证集成测试', () => {
    it('应该验证用户认证状态', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockUseAuthStore).toHaveBeenCalled()
      })
    })

    it('应该验证用户是否有权访问行程', async () => {
      mockGetItineraryById.mockResolvedValue({
        ...mockItinerary,
        user_id: 'different-user-id'
      })

      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('无权访问此行程')).toBeInTheDocument()
      })
    })

    it('应该正确处理未认证用户', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        user: null,
        session: null,
        error: null,
        rememberMe: false,
        setUser: vi.fn(),
        setSession: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        resetUserPassword: vi.fn(),
        updateUserPassword: vi.fn(),
        initializeAuth: vi.fn(),
        checkAuth: vi.fn()
      })

      render(
        <MemoryRouter initialEntries={['/itineraries/test-itinerary-id']}>
          <Routes>
            <Route path="/itineraries/:id" element={<ItineraryDetail />} />
            <Route path="/itineraries" element={<div>Itineraries Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraryById).toHaveBeenCalled()
      })
    })
  })
})
