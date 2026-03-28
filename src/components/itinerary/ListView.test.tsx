import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListView } from './ListView'
import type { DailyScheduleBuilt, ItineraryItem } from '@/services/itinerary'

const mockItems: ItineraryItem[] = [
  {
    id: 'item-1',
    itinerary_id: 'test-itinerary-id',
    day: 1,
    time: '09:00',
    type: 'attraction' as const,
    name: '故宫博物院',
    location: { address: '北京市东城区景山前街4号', lat: 0, lng: 0 },
    description: '参观故宫，感受明清皇家宫殿的宏伟',
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
    description: '品尝正宗北京烤鸭',
    cost: 200,
    duration: 90,
    tips: null,
    image_url: null,
    order_idx: 1,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-3',
    itinerary_id: 'test-itinerary-id',
    day: 1,
    time: '15:00',
    type: 'activity' as const,
    name: '什刹海游船',
    location: { address: '北京市西城区什刹海', lat: 0, lng: 0 },
    description: '乘坐游船欣赏什刹海风光',
    cost: 80,
    duration: 60,
    tips: null,
    image_url: null,
    order_idx: 2,
    created_at: '2024-01-01T00:00:00Z'
  }
]

const mockDailySchedule: DailyScheduleBuilt[] = [
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

describe('ListView', () => {
  let mockOnToggleDay: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnToggleDay = vi.fn()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('探索之旅')).toBeInTheDocument()
      expect(screen.getByText('文化体验')).toBeInTheDocument()
      expect(screen.getByText('休闲时光')).toBeInTheDocument()
    })

    it('应该显示每日日期和星期', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText(/2024-03-01/)).toBeInTheDocument()
      expect(screen.getByText(/星期五/)).toBeInTheDocument()
      expect(screen.getByText(/2024-03-02/)).toBeInTheDocument()
      expect(screen.getByText(/星期六/)).toBeInTheDocument()
    })
  })

  describe('展开/收起功能测试', () => {
    it('默认应该收起所有天', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
      expect(screen.queryByText('全聚德烤鸭店')).not.toBeInTheDocument()
    })

    it('点击日期标题应该触发展开/收起', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      const dayHeader = screen.getByText('探索之旅').closest('[class*="cursor-pointer"]')
      if (dayHeader) {
        fireEvent.click(dayHeader)
      }

      expect(mockOnToggleDay).toHaveBeenCalledWith(0)
    })

    it('展开后应该显示活动列表', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.getByText('全聚德烤鸭店')).toBeInTheDocument()
      expect(screen.getByText('什刹海游船')).toBeInTheDocument()
    })

    it('应该正确显示活动详情', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('09:00')).toBeInTheDocument()
      expect(screen.getByText('景点')).toBeInTheDocument()
      expect(screen.getByText(/¥60/)).toBeInTheDocument()
      expect(screen.getByText('参观故宫，感受明清皇家宫殿的宏伟')).toBeInTheDocument()
    })
  })

  describe('空状态测试', () => {
    it('应该正确处理空活动列表', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([1])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('暂无行程安排')).toBeInTheDocument()
    })
  })

  describe('编辑模式测试', () => {
    it('编辑模式下应该显示添加按钮', () => {
      const onAddItem = vi.fn()
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
          isEditMode={true}
          onAddItem={onAddItem}
        />
      )

      expect(screen.getByText('添加行程项')).toBeInTheDocument()
    })

    it('编辑模式下不应该显示空状态提示', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([1])}
          onToggleDay={mockOnToggleDay}
          isEditMode={true}
        />
      )

      expect(screen.queryByText('暂无行程安排')).not.toBeInTheDocument()
    })

    it('点击添加按钮应该调用 onAddItem', () => {
      const onAddItem = vi.fn()
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
          isEditMode={true}
          onAddItem={onAddItem}
        />
      )

      fireEvent.click(screen.getByText('添加行程项'))

      expect(onAddItem).toHaveBeenCalledWith(1)
    })

    it('编辑模式下点击日期标题不应该触发展开/收起', () => {
      render(
        <ListView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
          isEditMode={true}
        />
      )

      const dayHeader = screen.getByText('探索之旅').closest('div')
      if (dayHeader) {
        fireEvent.click(dayHeader)
      }

      expect(mockOnToggleDay).not.toHaveBeenCalled()
    })
  })
})
