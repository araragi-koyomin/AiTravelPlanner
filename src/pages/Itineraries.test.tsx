import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Itineraries } from './Itineraries'
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
  },
  {
    id: 'itinerary-3',
    user_id: 'test-user-id',
    title: '杭州一日游',
    destination: '杭州',
    start_date: '2024-05-01',
    end_date: '2024-05-01',
    budget: 1000,
    participants: 3,
    preferences: ['nature'],
    special_requirements: null,
    travelers_type: 'friends',
    accommodation_pref: 'comfort',
    pace: 'intense',
    is_favorite: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

function renderItineraries() {
  return render(
    <MemoryRouter initialEntries={['/itineraries']}>
      <Routes>
        <Route path="/itineraries" element={<Itineraries />} />
        <Route path="/itineraries/:id" element={<div>Itinerary Detail</div>} />
        <Route path="/itineraries/new" element={<div>New Itinerary</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Itineraries', () => {
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

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('我的行程')).toBeInTheDocument()
      })
    })

    it('应该渲染加载骨架屏', () => {
      mockGetItineraries.mockImplementation(() => new Promise(() => { }))

      renderItineraries()

      expect(document.querySelector('.animate-pulse')).toBeTruthy()
    })

    it('应该渲染错误状态', async () => {
      mockGetItineraries.mockRejectedValue(new Error('加载失败'))

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument()
        expect(screen.getByText('加载行程列表失败，请重试')).toBeInTheDocument()
      })
    })

    it('应该渲染行程列表', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
        expect(screen.getByText('上海两日游')).toBeInTheDocument()
        expect(screen.getByText('杭州一日游')).toBeInTheDocument()
      })
    })

    it('应该渲染行程卡片', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
        expect(screen.getByText('上海两日游')).toBeInTheDocument()
      })
    })
  })

  describe('数据加载测试', () => {
    it('应该调用 getItineraries 加载行程列表', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(mockGetItineraries).toHaveBeenCalledWith('test-user-id')
      })
    })

    it('应该显示错误信息当加载失败', async () => {
      mockGetItineraries.mockRejectedValue(new Error('网络错误'))

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('加载行程列表失败，请重试')).toBeInTheDocument()
      })
    })

    it('应该显示重试按钮当加载失败', async () => {
      mockGetItineraries.mockRejectedValue(new Error('网络错误'))

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
      })
    })

    it('应该点击重试按钮重新加载', async () => {
      mockGetItineraries.mockRejectedValueOnce(new Error('网络错误'))
      mockGetItineraries.mockResolvedValueOnce(mockItineraries)

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: '重试' }))

      await waitFor(() => {
        expect(mockGetItineraries).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('行程列表渲染测试', () => {
    it('应该渲染所有行程', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
        expect(screen.getByText('上海两日游')).toBeInTheDocument()
        expect(screen.getByText('杭州一日游')).toBeInTheDocument()
      })
    })

    it('应该渲染目的地', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京')).toBeInTheDocument()
        expect(screen.getByText('上海')).toBeInTheDocument()
        expect(screen.getByText('杭州')).toBeInTheDocument()
      })
    })

    it('应该渲染预算', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText(/预算 ¥5,000/)).toBeInTheDocument()
        expect(screen.getByText(/预算 ¥3,000/)).toBeInTheDocument()
        expect(screen.getByText(/预算 ¥1,000/)).toBeInTheDocument()
      })
    })

    it('应该渲染同行人数', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('2 人同行')).toBeInTheDocument()
        expect(screen.getByText('1 人同行')).toBeInTheDocument()
        expect(screen.getByText('3 人同行')).toBeInTheDocument()
      })
    })

    it('应该渲染天数', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('(3天)')).toBeInTheDocument()
        expect(screen.getByText('(2天)')).toBeInTheDocument()
        expect(screen.getByText('(1天)')).toBeInTheDocument()
      })
    })
  })

  describe('空状态测试', () => {
    it('应该显示空状态当没有行程', async () => {
      mockGetItineraries.mockResolvedValue([])

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('还没有行程')).toBeInTheDocument()
      })
    })

    it('应该显示创建行程按钮当没有行程', async () => {
      mockGetItineraries.mockResolvedValue([])

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('创建行程')).toBeInTheDocument()
      })
    })

    it('应该点击创建行程按钮导航到新行程页面', async () => {
      mockGetItineraries.mockResolvedValue([])

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('创建行程')).toBeInTheDocument()
      })

      const createButtons = screen.getAllByText('创建行程')
      fireEvent.click(createButtons[0])

      await waitFor(() => {
        expect(screen.getByText('New Itinerary')).toBeInTheDocument()
      })
    })
  })

  describe('删除功能测试', () => {
    it('应该调用 deleteItinerary 当点击删除按钮', async () => {
      renderItineraries()

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

    it('应该显示确认对话框', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      )

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }

      expect(confirmSpy).toHaveBeenCalledWith('确定要删除这个行程吗？此操作不可撤销。')
    })

    it('应该不删除行程当用户取消确认', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      )

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }

      expect(mockDeleteItinerary).not.toHaveBeenCalled()
    })
  })

  describe('收藏功能测试', () => {
    it('应该调用 toggleFavorite 当点击收藏按钮', async () => {
      renderItineraries()

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

    it('应该显示收藏图标当行程已收藏', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('上海两日游')).toBeInTheDocument()
      })

      const hearts = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.fill-red-500')
      )

      expect(hearts.length).toBeGreaterThan(0)
    })
  })

  describe('跳转功能测试', () => {
    it('应该导航到行程详情页当点击查看按钮', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      const viewButtons = screen.getAllByRole('button', { name: /查看/ })

      if (viewButtons.length > 0) {
        fireEvent.click(viewButtons[0])
      }

      await waitFor(() => {
        expect(screen.getByText('Itinerary Detail')).toBeInTheDocument()
      })
    })

    it('应该导航到行程详情页当点击卡片标题', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('北京三日游')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('北京三日游'))

      await waitFor(() => {
        expect(screen.getByText('Itinerary Detail')).toBeInTheDocument()
      })
    })

    it('应该导航到行程规划页当点击创建新行程按钮', async () => {
      renderItineraries()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '创建新行程' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: '创建新行程' }))

      await waitFor(() => {
        expect(screen.getByText('New Itinerary')).toBeInTheDocument()
      })
    })
  })

  describe('错误处理测试', () => {
    it('应该处理 getItineraries 错误', async () => {
      mockGetItineraries.mockRejectedValue(new Error('获取行程列表失败'))

      renderItineraries()

      await waitFor(() => {
        expect(screen.getByText('加载行程列表失败，请重试')).toBeInTheDocument()
      })
    })

    it('应该处理 deleteItinerary 错误', async () => {
      mockDeleteItinerary.mockRejectedValue(new Error('删除失败'))

      renderItineraries()

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
        expect(window.alert).toHaveBeenCalledWith('删除行程失败，请重试')
      })
    })

    it('应该处理 toggleFavorite 错误', async () => {
      mockToggleFavorite.mockRejectedValue(new Error('更新收藏状态失败'))

      renderItineraries()

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
        expect(window.alert).toHaveBeenCalledWith('更新收藏状态失败，请重试')
      })
    })
  })

  describe('未认证用户测试', () => {
    it('应该不加载行程当用户未认证', async () => {
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

      renderItineraries()

      await waitFor(() => {
        expect(mockGetItineraries).not.toHaveBeenCalled()
      })
    })
  })
})
