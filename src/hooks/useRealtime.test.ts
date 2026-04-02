import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useItinerariesRealtime,
  useItineraryItemsRealtime,
  useExpensesRealtime
} from '@/hooks/useRealtime'
import {
  subscribeToItineraries,
  subscribeToItineraryItems,
  subscribeToExpenses,
  unsubscribeAll
} from '@/services/realtime'

vi.mock('@/services/realtime', () => ({
  subscribeToItineraries: vi.fn(),
  subscribeToItineraryItems: vi.fn(),
  subscribeToExpenses: vi.fn(),
  unsubscribeAll: vi.fn()
}))

const mockSubscribeToItineraries = vi.mocked(subscribeToItineraries)
const mockSubscribeToItineraryItems = vi.mocked(subscribeToItineraryItems)
const mockSubscribeToExpenses = vi.mocked(subscribeToExpenses)

describe('useRealtime hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscribeToItineraries.mockReturnValue(vi.fn())
    mockSubscribeToItineraryItems.mockReturnValue(vi.fn())
    mockSubscribeToExpenses.mockReturnValue(vi.fn())
  })

  afterEach(() => {
    unsubscribeAll()
  })

  describe('useItinerariesRealtime', () => {
    it('应该返回订阅状态', () => {
      const { result } = renderHook(() =>
        useItinerariesRealtime({
          userId: 'user-123',
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('userId 为空时不应该订阅', () => {
      const { result } = renderHook(() =>
        useItinerariesRealtime({
          userId: undefined,
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToItineraries).not.toHaveBeenCalled()
    })

    it('enabled=false 时不应该订阅', () => {
      const { result } = renderHook(() =>
        useItinerariesRealtime({
          userId: 'user-123',
          enabled: false
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToItineraries).not.toHaveBeenCalled()
    })

    it('卸载时应该取消订阅', () => {
      const unsubscribe = vi.fn()
      mockSubscribeToItineraries.mockReturnValue(unsubscribe)

      const { unmount } = renderHook(() =>
        useItinerariesRealtime({
          userId: 'user-123',
          enabled: true
        })
      )

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('重新启用时应该重新订阅', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useItinerariesRealtime({
            userId: 'user-123',
            enabled
          }),
        { initialProps: { enabled: false } }
      )

      expect(mockSubscribeToItineraries).not.toHaveBeenCalled()

      rerender({ enabled: true })

      expect(mockSubscribeToItineraries).toHaveBeenCalled()
      expect(result.current.isSubscribed).toBe(true)
    })

    it('userId 变化时应该重新订阅', () => {
      const unsub1 = vi.fn()
      const unsub2 = vi.fn()
      mockSubscribeToItineraries
        .mockReturnValueOnce(unsub1)
        .mockReturnValueOnce(unsub2)

      const { rerender } = renderHook(
        ({ userId }) =>
          useItinerariesRealtime({
            userId,
            enabled: true
          }),
        { initialProps: { userId: 'user-1' } }
      )

      expect(mockSubscribeToItineraries).toHaveBeenCalledWith(
        'user-1',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      )

      rerender({ userId: 'user-2' })

      expect(unsub1).toHaveBeenCalled()
      expect(mockSubscribeToItineraries).toHaveBeenCalledTimes(2)
    })

    it('应该传递正确的回调参数', () => {
      renderHook(() =>
        useItinerariesRealtime({
          userId: 'user-123',
          enabled: true
        })
      )

      expect(mockSubscribeToItineraries).toHaveBeenCalledWith(
        'user-123',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('useItineraryItemsRealtime', () => {
    it('应该返回订阅状态', () => {
      const { result } = renderHook(() =>
        useItineraryItemsRealtime({
          itineraryId: 'it-123',
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('itineraryId 为空时不应该订阅', () => {
      const { result } = renderHook(() =>
        useItineraryItemsRealtime({
          itineraryId: undefined,
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToItineraryItems).not.toHaveBeenCalled()
    })

    it('enabled=false 时不应该订阅', () => {
      const { result } = renderHook(() =>
        useItineraryItemsRealtime({
          itineraryId: 'it-123',
          enabled: false
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToItineraryItems).not.toHaveBeenCalled()
    })

    it('卸载时应该取消订阅', () => {
      const unsubscribe = vi.fn()
      mockSubscribeToItineraryItems.mockReturnValue(unsubscribe)

      const { unmount } = renderHook(() =>
        useItineraryItemsRealtime({
          itineraryId: 'it-123',
          enabled: true
        })
      )

      unmount()
      expect(unsubscribe).toHaveBeenCalled()
    })

    it('应该传递正确的回调参数', () => {
      renderHook(() =>
        useItineraryItemsRealtime({
          itineraryId: 'it-456',
          enabled: true
        })
      )

      expect(mockSubscribeToItineraryItems).toHaveBeenCalledWith(
        'it-456',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('useExpensesRealtime', () => {
    it('应该返回订阅状态', () => {
      const { result } = renderHook(() =>
        useExpensesRealtime({
          itineraryId: 'it-789',
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('itineraryId 为空时不应该订阅', () => {
      const { result } = renderHook(() =>
        useExpensesRealtime({
          itineraryId: undefined,
          enabled: true
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToExpenses).not.toHaveBeenCalled()
    })

    it('enabled=false 时不应该订阅', () => {
      const { result } = renderHook(() =>
        useExpensesRealtime({
          itineraryId: 'it-789',
          enabled: false
        })
      )

      expect(result.current.isSubscribed).toBe(false)
      expect(mockSubscribeToExpenses).not.toHaveBeenCalled()
    })

    it('卸载时应该取消订阅', () => {
      const unsubscribe = vi.fn()
      mockSubscribeToExpenses.mockReturnValue(unsubscribe)

      const { unmount } = renderHook(() =>
        useExpensesRealtime({
          itineraryId: 'it-789',
          enabled: true
        })
      )

      unmount()
      expect(unsubscribe).toHaveBeenCalled()
    })

    it('应该传递正确的回调参数', () => {
      renderHook(() =>
        useExpensesRealtime({
          itineraryId: 'it-999',
          enabled: true
        })
      )

      expect(mockSubscribeToExpenses).toHaveBeenCalledWith(
        'it-999',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      )
    })
  })
})
