import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimelineView } from './TimelineView'
import type { DailyScheduleBuilt, ItineraryItem } from '@/services/itinerary'

const mockItems: ItineraryItem[] = [
  {
    id: 'item-1',
    itinerary_id: 'test-itinerary-id',
    date: '2024-03-01',
    time: '09:00',
    type: 'attraction',
    name: '故宫博物院',
    address: '北京市东城区景山前街4号',
    latitude: null,
    longitude: null,
    description: '参观故宫，感受明清皇家宫殿的宏伟',
    cost: 60,
    duration: 180,
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-2',
    itinerary_id: 'test-itinerary-id',
    date: '2024-03-01',
    time: '12:00',
    type: 'restaurant',
    name: '全聚德烤鸭店',
    address: '北京市东城区前门大街',
    latitude: null,
    longitude: null,
    description: '品尝正宗北京烤鸭',
    cost: 200,
    duration: 90,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-3',
    itinerary_id: 'test-itinerary-id',
    date: '2024-03-01',
    time: '15:00',
    type: 'activity',
    name: '什刹海游船',
    address: '北京市西城区什刹海',
    latitude: null,
    longitude: null,
    description: '乘坐游船欣赏什刹海风光',
    cost: 80,
    duration: 60,
    order_index: 2,
    created_at: '2024-01-01T00:00:00Z'
  }
]

const mockDailySchedule: DailyScheduleBuilt[] = [
  {
    date: '2024-03-01',
    dayOfWeek: '星期五',
    theme: '探索之旅',
    items: mockItems
  },
  {
    date: '2024-03-02',
    dayOfWeek: '星期六',
    theme: '文化体验',
    items: []
  },
  {
    date: '2024-03-03',
    dayOfWeek: '星期日',
    theme: '休闲时光',
    items: [mockItems[0]]
  }
]

describe('TimelineView', () => {
  let mockOnToggleDay: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnToggleDay = vi.fn()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('探索之旅')).toBeInTheDocument()
      expect(screen.getByText('文化体验')).toBeInTheDocument()
      expect(screen.getByText('休闲时光')).toBeInTheDocument()
    })

    it('应该渲染所有每日行程', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText(/2024-03-01/)).toBeInTheDocument()
      expect(screen.getByText(/2024-03-02/)).toBeInTheDocument()
      expect(screen.getByText(/2024-03-03/)).toBeInTheDocument()
    })

    it('应该渲染日期标记', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      const dateMarkers = screen.getAllByText('01')
      expect(dateMarkers.length).toBeGreaterThan(0)
    })

    it('应该渲染主题', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('探索之旅')).toBeInTheDocument()
      expect(screen.getByText('文化体验')).toBeInTheDocument()
      expect(screen.getByText('休闲时光')).toBeInTheDocument()
    })

    it('应该渲染星期', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText(/星期五/)).toBeInTheDocument()
      expect(screen.getByText(/星期六/)).toBeInTheDocument()
      expect(screen.getByText(/星期日/)).toBeInTheDocument()
    })
  })

  describe('时间轴渲染测试', () => {
    it('应该渲染时间轴当展开', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })

    it('应该渲染时间点标记', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('09')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('应该渲染活动卡片', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.getByText('全聚德烤鸭店')).toBeInTheDocument()
      expect(screen.getByText('什刹海游船')).toBeInTheDocument()
    })
  })

  describe('展开/折叠功能测试', () => {
    it('应该展开每日行程当点击展开按钮', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })

    it('应该折叠每日行程当未展开', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
    })

    it('应该调用 onToggleDay 当点击展开/折叠按钮', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      const toggleButtons = screen.getAllByRole('button')
      fireEvent.click(toggleButtons[0])

      expect(mockOnToggleDay).toHaveBeenCalledWith(0)
    })

    it('应该显示时间轴当展开', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })

    it('应该隐藏时间轴当折叠', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.queryByText('故宫博物院')).not.toBeInTheDocument()
    })
  })

  describe('活动项渲染测试', () => {
    it('应该渲染活动时间点', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('09')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('应该渲染活动时间', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('09:00')).toBeInTheDocument()
      expect(screen.getByText('12:00')).toBeInTheDocument()
      expect(screen.getByText('15:00')).toBeInTheDocument()
    })

    it('应该渲染活动类型标签', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('景点')).toBeInTheDocument()
      expect(screen.getByText('餐厅')).toBeInTheDocument()
      expect(screen.getByText('活动')).toBeInTheDocument()
    })

    it('应该渲染活动名称', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.getByText('全聚德烤鸭店')).toBeInTheDocument()
      expect(screen.getByText('什刹海游船')).toBeInTheDocument()
    })

    it('应该渲染活动地址', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('北京市东城区景山前街4号')).toBeInTheDocument()
      expect(screen.getByText('北京市东城区前门大街')).toBeInTheDocument()
    })

    it('应该渲染活动描述', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('参观故宫，感受明清皇家宫殿的宏伟')).toBeInTheDocument()
      expect(screen.getByText('品尝正宗北京烤鸭')).toBeInTheDocument()
    })

    it('应该渲染活动费用', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('¥60')).toBeInTheDocument()
      expect(screen.getByText('¥200')).toBeInTheDocument()
      expect(screen.getByText('¥80')).toBeInTheDocument()
    })

    it('应该渲染活动时长', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('180 分钟')).toBeInTheDocument()
      expect(screen.getByText('90 分钟')).toBeInTheDocument()
      expect(screen.getByText('60 分钟')).toBeInTheDocument()
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空活动列表', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([1])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('暂无行程安排')).toBeInTheDocument()
    })

    it('应该处理空日程数组', () => {
      render(
        <TimelineView
          dailySchedule={[]}
          expandedDays={new Set()}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.queryByText('探索之旅')).not.toBeInTheDocument()
    })

    it('应该处理单日活动', () => {
      const singleDaySchedule: DailyScheduleBuilt[] = [mockDailySchedule[0]]

      render(
        <TimelineView
          dailySchedule={singleDaySchedule}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('探索之旅')).toBeInTheDocument()
      expect(screen.queryByText('文化体验')).not.toBeInTheDocument()
    })

    it('应该处理多日活动', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([0, 1, 2])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('探索之旅')).toBeInTheDocument()
      expect(screen.getByText('文化体验')).toBeInTheDocument()
      expect(screen.getByText('休闲时光')).toBeInTheDocument()
    })

    it('应该处理没有活动的日期', () => {
      render(
        <TimelineView
          dailySchedule={mockDailySchedule}
          expandedDays={new Set([1])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('暂无行程安排')).toBeInTheDocument()
    })

    it('应该处理活动没有地址的情况', () => {
      const itemsWithoutAddress: ItineraryItem[] = [
        {
          ...mockItems[0],
          address: null
        }
      ]

      const scheduleWithoutAddress: DailyScheduleBuilt[] = [
        {
          ...mockDailySchedule[0],
          items: itemsWithoutAddress
        }
      ]

      render(
        <TimelineView
          dailySchedule={scheduleWithoutAddress}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.queryByText('北京市东城区景山前街4号')).not.toBeInTheDocument()
    })

    it('应该处理活动没有描述的情况', () => {
      const itemsWithoutDescription: ItineraryItem[] = [
        {
          ...mockItems[0],
          description: null
        }
      ]

      const scheduleWithoutDescription: DailyScheduleBuilt[] = [
        {
          ...mockDailySchedule[0],
          items: itemsWithoutDescription
        }
      ]

      render(
        <TimelineView
          dailySchedule={scheduleWithoutDescription}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.queryByText('参观故宫，感受明清皇家宫殿的宏伟')).not.toBeInTheDocument()
    })

    it('应该处理活动没有费用的情况', () => {
      const itemsWithoutCost: ItineraryItem[] = [
        {
          ...mockItems[0],
          cost: null
        }
      ]

      const scheduleWithoutCost: DailyScheduleBuilt[] = [
        {
          ...mockDailySchedule[0],
          items: itemsWithoutCost
        }
      ]

      render(
        <TimelineView
          dailySchedule={scheduleWithoutCost}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
      expect(screen.getByText('¥0')).toBeInTheDocument()
    })

    it('应该处理活动没有时长的情况', () => {
      const itemsWithoutDuration: ItineraryItem[] = [
        {
          ...mockItems[0],
          duration: null
        }
      ]

      const scheduleWithoutDuration: DailyScheduleBuilt[] = [
        {
          ...mockDailySchedule[0],
          items: itemsWithoutDuration
        }
      ]

      render(
        <TimelineView
          dailySchedule={scheduleWithoutDuration}
          expandedDays={new Set([0])}
          onToggleDay={mockOnToggleDay}
        />
      )

      expect(screen.getByText('故宫博物院')).toBeInTheDocument()
    })
  })
})
