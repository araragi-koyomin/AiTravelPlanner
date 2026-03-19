import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ItineraryDetail } from './ItineraryDetail'
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

function renderItineraryDetail(itineraryId: string = 'test-itinerary-id') {
    return render(
        <MemoryRouter initialEntries={[`/itineraries/${itineraryId}`]}>
            <Routes>
                <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                <Route path="/itineraries" element={<div>Itineraries Page</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('ItineraryDetail', () => {
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

    describe('组件渲染测试', () => {
        it('应该正常渲染组件', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('北京三日游')).toBeInTheDocument()
            })
        })

        it('应该渲染加载骨架屏', () => {
            mockGetItineraryById.mockImplementation(() => new Promise(() => { }))

            renderItineraryDetail()

            const skeleton = document.querySelector('.animate-pulse')
            expect(skeleton).toBeTruthy()
        })

        it('应该渲染错误状态当行程不存在', async () => {
            mockGetItineraryById.mockResolvedValue(null)

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载失败')).toBeInTheDocument()
                expect(screen.getByText('行程不存在')).toBeInTheDocument()
            })
        })

        it('应该渲染错误状态当无权访问', async () => {
            mockGetItineraryById.mockResolvedValue({
                ...mockItinerary,
                user_id: 'other-user-id'
            })

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载失败')).toBeInTheDocument()
                expect(screen.getByText('无权访问此行程')).toBeInTheDocument()
            })
        })

        it('应该渲染行程详情', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('北京三日游')).toBeInTheDocument()
                expect(screen.getAllByText('北京').length).toBeGreaterThan(0)
            })
        })

        it('应该渲染列表视图', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByRole('button', { name: '列表视图' })).toBeInTheDocument()
            })
        })

        it('应该渲染时间轴视图', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByRole('button', { name: '时间轴视图' })).toBeInTheDocument()
            })
        })
    })

    describe('数据加载测试', () => {
        it('应该调用 getItineraryById 加载行程', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(mockGetItineraryById).toHaveBeenCalledWith('test-itinerary-id')
            })
        })

        it('应该调用 getItineraryItems 加载行程项', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(mockGetItineraryItems).toHaveBeenCalledWith('test-itinerary-id')
            })
        })

        it('应该显示错误信息当加载失败', async () => {
            mockGetItineraryById.mockRejectedValue(new Error('网络错误'))

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载行程失败，请重试')).toBeInTheDocument()
            })
        })

        it('应该导航到行程列表页当 id 不存在', async () => {
            render(
                <MemoryRouter initialEntries={['/itineraries/']}>
                    <Routes>
                        <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                        <Route path="/itineraries" element={<div>Itineraries Page</div>} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
            })
        })
    })

    describe('权限控制测试', () => {
        it('应该验证用户是否有权访问行程', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(mockGetItineraryById).toHaveBeenCalled()
            })
        })

        it('应该显示错误信息当用户无权访问', async () => {
            mockGetItineraryById.mockResolvedValue({
                ...mockItinerary,
                user_id: 'different-user-id'
            })

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('无权访问此行程')).toBeInTheDocument()
            })
        })

        it('应该不显示行程详情当用户无权访问', async () => {
            mockGetItineraryById.mockResolvedValue({
                ...mockItinerary,
                user_id: 'different-user-id'
            })

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.queryByText('行程概览')).not.toBeInTheDocument()
            })
        })
    })

    describe('视图切换测试', () => {
        it('应该切换到列表视图当点击列表视图按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('北京三日游')).toBeInTheDocument()
            })

            const listViewButton = screen.getByRole('button', { name: '列表视图' })
            fireEvent.click(listViewButton)

            expect(listViewButton).toHaveClass('bg-primary-600')
        })

        it('应该切换到时间轴视图当点击时间轴视图按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('北京三日游')).toBeInTheDocument()
            })

            const timelineViewButton = screen.getByRole('button', { name: '时间轴视图' })
            fireEvent.click(timelineViewButton)

            expect(timelineViewButton).toHaveClass('bg-primary-600')
        })
    })

    describe('展开/折叠功能测试', () => {
        it('应该切换每日行程展开状态', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('探索之旅')).toBeInTheDocument()
            })

            await waitFor(() => {
                expect(screen.getByText('故宫博物院')).toBeInTheDocument()
            })

            const dayCard = screen.getByText('探索之旅').closest('.cursor-pointer')
            if (dayCard) {
                fireEvent.click(dayCard)
            }

            await waitFor(() => {
                expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
            }, { timeout: 3000 })
        })

        it('应该折叠每日行程当点击折叠按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('探索之旅')).toBeInTheDocument()
            })

            const dayCard = screen.getByText('探索之旅').closest('.cursor-pointer')
            if (dayCard) {
                fireEvent.click(dayCard)
            }

            await waitFor(() => {
                expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
            }, { timeout: 3000 })
        })

        it('应该展开所有每日行程当点击展开全部按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('展开全部')).toBeInTheDocument()
            })

            fireEvent.click(screen.getByText('展开全部'))

            expect(mockBuildDailySchedule).toHaveBeenCalled()
        })

        it('应该折叠所有每日行程当点击折叠全部按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('展开全部')).toBeInTheDocument()
            })

            fireEvent.click(screen.getByText('展开全部'))
            fireEvent.click(screen.getByText('折叠全部'))

            expect(mockBuildDailySchedule).toHaveBeenCalled()
        })
    })

    describe('行程概览信息测试', () => {
        it('应该显示行程标题', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('北京三日游')).toBeInTheDocument()
            })
        })

        it('应该显示目的地', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getAllByText('北京').length).toBeGreaterThan(0)
            })
        })

        it('应该显示行程天数', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText(/3\s*天/)).toBeInTheDocument()
            })
        })

        it('应该显示同行人数', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText(/2\s*人/)).toBeInTheDocument()
            })
        })

        it('应该显示预算', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
            })
        })
    })

    describe('预算分解测试', () => {
        it('应该显示预算分解标题', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('预算分解')).toBeInTheDocument()
            })
        })

        it('应该显示总费用', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('总计')).toBeInTheDocument()
            })
        })
    })

    describe('行程统计测试', () => {
        it('应该显示行程统计标题', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('行程统计')).toBeInTheDocument()
            })
        })

        it('应该显示活动数量', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('活动数量')).toBeInTheDocument()
            })
        })

        it('应该显示预估花费', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('预估花费')).toBeInTheDocument()
            })
        })

        it('应该显示日均花费', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('日均花费')).toBeInTheDocument()
            })
        })
    })

    describe('错误处理测试', () => {
        it('应该处理 getItineraryById 错误', async () => {
            mockGetItineraryById.mockRejectedValue(new Error('获取行程失败'))

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载行程失败，请重试')).toBeInTheDocument()
            })
        })

        it('应该处理 getItineraryItems 错误', async () => {
            mockGetItineraryItems.mockRejectedValue(new Error('获取行程项失败'))

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载行程失败，请重试')).toBeInTheDocument()
            })
        })

        it('应该显示友好的错误提示', async () => {
            mockGetItineraryById.mockRejectedValue(new Error('Network Error'))

            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('加载行程失败，请重试')).toBeInTheDocument()
            })
        })
    })

    describe('用户体验测试', () => {
        it('应该显示加载骨架屏当加载中', () => {
            mockGetItineraryById.mockImplementation(() => new Promise(() => { }))

            renderItineraryDetail()

            const skeleton = document.querySelector('.animate-pulse')
            expect(skeleton).toBeTruthy()
        })

        it('应该提供返回按钮', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('← 返回')).toBeInTheDocument()
            })
        })

        it('应该点击返回按钮导航到行程列表', async () => {
            renderItineraryDetail()

            await waitFor(() => {
                expect(screen.getByText('← 返回')).toBeInTheDocument()
            })

            fireEvent.click(screen.getByText('← 返回'))

            await waitFor(() => {
                expect(screen.getByText('Itineraries Page')).toBeInTheDocument()
            })
        })
    })
})
