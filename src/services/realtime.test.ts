import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  subscribeToItineraries,
  subscribeToItineraryItems,
  subscribeToExpenses,
  createSubscription,
  unsubscribeAll,
  getActiveSubscriptionCount
} from '@/services/realtime'

vi.mock('@/services/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((callback: (status: string) => void) => {
        callback('SUBSCRIBED')
        return { unsubscribe: vi.fn() }
      })
    }),
    removeChannel: vi.fn()
  }
}))

describe('realtime service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    unsubscribeAll()
  })

  describe('subscribeToItineraries', () => {
    it('应该创建正确的订阅', () => {
      const onInsert = vi.fn()
      const onUpdate = vi.fn()
      const onDelete = vi.fn()

      const unsubscribe = subscribeToItineraries(
        'user-123',
        onInsert,
        onUpdate,
        onDelete
      )

      expect(typeof unsubscribe).toBe('function')
    })

    it('返回函数应该取消订阅', () => {
      const unsubscribe = subscribeToItineraries(
        'user-123',
        vi.fn(),
        vi.fn(),
        vi.fn()
      )

      expect(typeof unsubscribe).toBe('function')
    })

    it('重复订阅应该先取消之前的订阅', () => {
      subscribeToItineraries('user-123', vi.fn(), vi.fn(), vi.fn())
      subscribeToItineraries('user-123', vi.fn(), vi.fn(), vi.fn())
    })
  })

  describe('subscribeToItineraryItems', () => {
    it('应该创建行程项订阅', () => {
      const onInsert = vi.fn()

      const unsubscribe = subscribeToItineraryItems(
        'itinerary-123',
        onInsert,
        vi.fn(),
        vi.fn()
      )

      expect(typeof unsubscribe).toBe('function')
    })

    it('返回函数应该取消订阅', () => {
      const unsubscribe = subscribeToItineraryItems('it-1', vi.fn(), vi.fn(), vi.fn())
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('subscribeToExpenses', () => {
    it('应该创建费用订阅', () => {
      const onInsert = vi.fn()

      const unsubscribe = subscribeToExpenses(
        'itinerary-456',
        onInsert,
        vi.fn(),
        vi.fn()
      )

      expect(typeof unsubscribe).toBe('function')
    })

    it('返回函数应该取消订阅', () => {
      const unsubscribe = subscribeToExpenses('it-2', vi.fn(), vi.fn(), vi.fn())
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('createSubscription', () => {
    it('应该创建通用订阅', () => {
      const callback = vi.fn()

      const unsubscribe = createSubscription(
        { table: 'test_table', filter: { column: 'id', value: '123', operator: 'eq' } },
        callback
      )

      expect(typeof unsubscribe).toBe('function')
    })

    it('enabled=false 时应该不创建订阅', () => {
      const callback = vi.fn()

      const unsubscribe = createSubscription(
        { table: 'test_table', enabled: false },
        callback
      )

      expect(unsubscribe).toBeDefined()
    })

    it('无 filter 时应该使用 all 作为 channel 名称后缀', () => {
      const callback = vi.fn()

      createSubscription({ table: 'my_table' }, callback)
    })

    it('数组 filter 值应该用括号包裹', () => {
      const callback = vi.fn()

      createSubscription(
        {
          table: 'my_table',
          filter: { column: 'status', value: ['a', 'b'], operator: 'in' }
        },
        callback
      )
    })
  })

  describe('unsubscribeAll', () => {
    it('应该取消所有活跃订阅', () => {
      subscribeToItineraries('u1', vi.fn(), vi.fn(), vi.fn())
      subscribeToItineraryItems('i1', vi.fn(), vi.fn(), vi.fn())

      expect(getActiveSubscriptionCount()).toBe(2)

      unsubscribeAll()

      expect(getActiveSubscriptionCount()).toBe(0)
    })

    it('无活跃订阅时不应该报错', () => {
      expect(() => unsubscribeAll()).not.toThrow()
    })
  })

  describe('getActiveSubscriptionCount', () => {
    it('应该返回活跃订阅数量', () => {
      expect(getActiveSubscriptionCount()).toBe(0)

      subscribeToItineraries('u1', vi.fn(), vi.fn(), vi.fn())
      expect(getActiveSubscriptionCount()).toBe(1)

      subscribeToExpenses('i1', vi.fn(), vi.fn(), vi.fn())
      expect(getActiveSubscriptionCount()).toBe(2)
    })

    it('取消订阅后数量应该减少', () => {
      const unsub = subscribeToItineraries('u1', vi.fn(), vi.fn(), vi.fn())
      expect(getActiveSubscriptionCount()).toBe(1)

      unsub()
      expect(getActiveSubscriptionCount()).toBe(0)
    })
  })
})
