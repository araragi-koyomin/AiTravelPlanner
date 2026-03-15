/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabase'
import * as itineraryService from './itinerary'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          })),
          ilike: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    range: vi.fn()
                  }))
                }))
              }))
            }))
          })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  range: vi.fn()
                }))
              }))
            }))
          })),
          lte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                range: vi.fn()
              }))
            }))
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              range: vi.fn()
            }))
          })),
          limit: vi.fn(() => ({
            range: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn()
        })),
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    range: vi.fn()
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  },
  SupabaseErrorClass: class extends Error {
    constructor(message: string, public code?: string) {
      super(message)
      this.name = 'SupabaseError'
    }
  }
}))

describe('Itinerary Service', () => {
  const mockItinerary = {
    id: 'test-id',
    user_id: 'user-id',
    title: '测试行程',
    destination: '东京',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    budget: 10000,
    participants: 2,
    preferences: ['美食', '购物'],
    special_requirements: null,
    is_favorite: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createItinerary', () => {
    it('应该成功创建行程', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockItinerary,
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await itineraryService.createItinerary({
        user_id: 'user-id',
        title: '测试行程',
        destination: '东京',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        budget: 10000,
        participants: 2
      })

      expect(result).toEqual(mockItinerary)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('应该处理创建失败', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: '创建失败', code: 'DB_ERROR' }
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await expect(
        itineraryService.createItinerary({
          user_id: 'user-id',
          title: '测试行程',
          destination: '东京',
          start_date: '2024-01-01',
          end_date: '2024-01-05',
          budget: 10000,
          participants: 2
        })
      ).rejects.toThrow('创建行程失败')
    })
  })

  describe('getItineraries', () => {
    it('应该成功获取行程列表', async () => {
      const mockResult = { data: [mockItinerary], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockResult),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraries('user-id')

      expect(result).toEqual([mockItinerary])
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-id')
    })

    it('应该支持筛选条件', async () => {
      const mockResult = { data: [mockItinerary], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockResult),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraries('user-id', {
        isFavorite: true,
        destination: '东京',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        orderBy: 'start_date',
        orderDirection: 'desc',
        limit: 10,
        offset: 0
      })

      expect(result).toEqual([mockItinerary])
      expect(mockQuery.eq).toHaveBeenCalledWith('is_favorite', true)
      expect(mockQuery.ilike).toHaveBeenCalledWith('destination', '%东京%')
      expect(mockQuery.gte).toHaveBeenCalledWith('start_date', '2024-01-01')
      expect(mockQuery.lte).toHaveBeenCalledWith('end_date', '2024-01-31')
    })
  })

  describe('getItineraryById', () => {
    it('应该成功获取单个行程', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItinerary,
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraryById('test-id')

      expect(result).toEqual(mockItinerary)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
    })

    it('应该返回null当行程不存在', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraryById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('updateItinerary', () => {
    it('应该成功更新行程', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockItinerary, title: '更新后的行程' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await itineraryService.updateItinerary('test-id', {
        title: '更新后的行程'
      })

      expect(result.title).toBe('更新后的行程')
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe('deleteItinerary', () => {
    it('应该成功删除行程', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.deleteItinerary('test-id')
      ).resolves.not.toThrow()
    })
  })

  describe('toggleFavorite', () => {
    it('应该成功切换收藏状态', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItinerary,
          error: null
        })
      }

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockItinerary, is_favorite: true },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
        update: mockUpdate
      } as any)

      const result = await itineraryService.toggleFavorite('test-id')

      expect(result.is_favorite).toBe(true)
    })
  })

  describe('getItineraryStats', () => {
    it('应该成功获取行程统计', async () => {
      const mockItems = [
        { id: 'item-1', type: 'attraction', name: '景点A' },
        { id: 'item-2', type: 'restaurant', name: '餐厅B' }
      ]
      const mockExpenses = [
        { amount: 100 },
        { amount: 200 }
      ]

      const mockItineraryQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItinerary,
          error: null
        })
      }

      const mockItemsQuery = {
        eq: vi.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      }

      const mockExpensesQuery = {
        eq: vi.fn().mockResolvedValue({
          data: mockExpenses,
          error: null
        })
      }

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'itineraries') {
          return { select: vi.fn().mockReturnValue(mockItineraryQuery) } as any
        }
        if (table === 'itinerary_items') {
          return { select: vi.fn().mockReturnValue(mockItemsQuery) } as any
        }
        if (table === 'expenses') {
          return { select: vi.fn().mockReturnValue(mockExpensesQuery) } as any
        }
        return {} as any
      })

      const result = await itineraryService.getItineraryStats('test-id')

      expect(result).toHaveProperty('totalDays', 5)
      expect(result).toHaveProperty('totalCost', 300)
      expect(result).toHaveProperty('totalItems', 2)
      expect(result).toHaveProperty('itemsByType')
      expect(result.itemsByType).toEqual({ attraction: 1, restaurant: 1 })
    })

    it('应该处理行程不存在的情况', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      await expect(
        itineraryService.getItineraryStats('non-existent-id')
      ).rejects.toThrow('行程不存在')
    })
  })

  describe('duplicateItinerary', () => {
    it('应该成功复制行程', async () => {
      const mockItems = [
        { id: 'item-1', itinerary_id: 'test-id', date: '2024-01-01', time: '09:00', type: 'attraction', name: '景点A', address: '地址A', latitude: 35.6, longitude: 139.7, description: '描述', cost: 100, duration: 60, order_index: 1 }
      ]
      const mockExpenses = [
        { id: 'expense-1', itinerary_id: 'test-id', category: 'food', amount: 100, date: '2024-01-01', description: '午餐' }
      ]

      const mockItineraryQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItinerary,
          error: null
        })
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockItinerary, id: 'new-id', title: '测试行程 (副本)' },
            error: null
          })
        })
      })

      const mockItemsQuery = {
        eq: vi.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      }

      const mockExpensesQuery = {
        eq: vi.fn().mockResolvedValue({
          data: mockExpenses,
          error: null
        })
      }

      const mockItemsInsert = vi.fn().mockResolvedValue({ error: null })
      const mockExpensesInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'itineraries') {
          return {
            select: vi.fn().mockReturnValue(mockItineraryQuery),
            insert: mockInsert
          } as any
        }
        if (table === 'itinerary_items') {
          return {
            select: vi.fn().mockReturnValue(mockItemsQuery),
            insert: mockItemsInsert
          } as any
        }
        if (table === 'expenses') {
          return {
            select: vi.fn().mockReturnValue(mockExpensesQuery),
            insert: mockExpensesInsert
          } as any
        }
        return {} as any
      })

      const result = await itineraryService.duplicateItinerary('test-id')

      expect(result.title).toBe('测试行程 (副本)')
      expect(mockItemsInsert).toHaveBeenCalled()
      expect(mockExpensesInsert).toHaveBeenCalled()
    })

    it('应该处理原行程不存在的情况', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      await expect(
        itineraryService.duplicateItinerary('non-existent-id')
      ).rejects.toThrow('原行程不存在')
    })

    it('应该使用自定义标题复制行程', async () => {
      const mockItineraryQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItinerary,
          error: null
        })
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...mockItinerary, id: 'new-id', title: '自定义标题' },
            error: null
          })
        })
      })

      const mockItemsQuery = {
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }

      const mockExpensesQuery = {
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'itineraries') {
          return {
            select: vi.fn().mockReturnValue(mockItineraryQuery),
            insert: mockInsert
          } as any
        }
        if (table === 'itinerary_items') {
          return { select: vi.fn().mockReturnValue(mockItemsQuery) } as any
        }
        if (table === 'expenses') {
          return { select: vi.fn().mockReturnValue(mockExpensesQuery) } as any
        }
        return {} as any
      })

      const result = await itineraryService.duplicateItinerary('test-id', '自定义标题')

      expect(result.title).toBe('自定义标题')
    })
  })

  describe('searchItineraries', () => {
    it('应该成功搜索行程', async () => {
      const mockResult = { data: [mockItinerary], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockResult),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.searchItineraries('user-id', '东京')

      expect(result).toEqual([mockItinerary])
      expect(mockQuery.or).toHaveBeenCalled()
    })
  })
})
