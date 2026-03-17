import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Itineraries } from '@/pages/Itineraries'
import * as itineraryService from '@/services/itinerary'
import * as authStore from '@/stores/authStore'

const mockUseAuthStore = vi.spyOn(authStore, 'useAuthStore')
const mockGetItineraries = vi.spyOn(itineraryService, 'getItineraries')
const mockDeleteItinerary = vi.spyOn(itineraryService, 'deleteItinerary')
const mockToggleFavorite = vi.spyOn(itineraryService, 'toggleFavorite')

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z'
}

const mockItineraries = [
  {
    id: 'itinerary-1',
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
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'itinerary-2',
    user_id: 'test-user-id',
    title: '上海两日游',
    destination: '上海',
    start_date: '2024-04-01',
    end_date: '2024-04-02',
    budget: 3000,
    participants: 1,
    preferences: ['shopping'],
    special_requirements: null,
    travelers_type: 'solo',
    accommodation_pref: 'budget',
    pace: 'relaxed',
    is_favorite: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

describe('Itineraries 集成测试', () => {
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

    mockGetItineraries.mockResolvedValue(mockItineraries)
    mockDeleteItinerary.mockResolvedValue(undefined)
    mockToggleFavorite.mockResolvedValue(mockItineraries[0])

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'alert').mockImplementation(() => { })
  })

  describe('端到端流程测试', () => {
    it('应该完整加载行程列表页面', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('我的行程')).toBeInTheDocument()
      })

      expect(screen.getByText('管理您的旅行计划')).toBeInTheDocument()
    })

    it('应该正确显示所有行程', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
        expect(screen.getByText('上海两日游')).toBeInTheDocument()
      })
    })

    it('应该支持删除行程', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      )

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }

      await waitFor(() => {
        expect(mockDeleteItinerary).toHaveBeenCalled()
      })
    })

    it('应该支持收藏行程', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const favoriteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-heart')
      )

      if (favoriteButtons.length > 0) {
        fireEvent.click(favoriteButtons[0])
      }

      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalled()
      })
    })

    it('应该支持跳转到行程详情页', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('北京三日游'))

      await waitFor(() => {
        expect(screen.getByText('Itinerary Detail')).toBeInTheDocument()
      })
    })
  })

  describe('服务层集成测试', () => {
    it('应该正确调用 getItineraries', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraries).toHaveBeenCalledWith('test-user-id')
      })
    })

    it('应该正确调用 deleteItinerary', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      )

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }

      await waitFor(() => {
        expect(mockDeleteItinerary).toHaveBeenCalledWith('itinerary-1')
      })
    })

    it('应该正确调用 toggleFavorite', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const favoriteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-heart')
      )

      if (favoriteButtons.length > 0) {
        fireEvent.click(favoriteButtons[0])
      }

      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledWith('itinerary-1')
      })
    })

    it('应该正确处理服务层返回的错误', async () => {
      mockGetItineraries.mockRejectedValue(new Error('服务不可用'))

      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('加载行程列表失败，请重试')).toBeInTheDocument()
      })
    })
  })

  describe('路由集成测试', () => {
    it('应该正确导航到行程列表页', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('我的行程')).toBeInTheDocument()
      })
    })

    it('应该正确导航到行程详情页', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('北京三日游'))

      await waitFor(() => {
        expect(screen.getByText('Itinerary Detail')).toBeInTheDocument()
      })
    })

    it('应该正确导航到行程规划页', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '创建新行程' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: '创建新行程' }))

      await waitFor(() => {
        expect(screen.getByText('New Itinerary')).toBeInTheDocument()
      })
    })
  })

  describe('认证集成测试', () => {
    it('应该验证用户认证状态', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockUseAuthStore).toHaveBeenCalled()
      })
    })

    it('应该只显示当前用户的行程', async () => {
      render(
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraries).toHaveBeenCalledWith('test-user-id')
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
        <MemoryRouter initialEntries={['/itineraries']}>
          <Routes>
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
            <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockGetItineraries).not.toHaveBeenCalled()
      })
    })
  })
})
