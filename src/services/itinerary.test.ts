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
    status: 'generated',
    cover_image: null,
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
        { 
          id: 'item-1', 
          itinerary_id: 'test-id', 
          day: 1, 
          time: '09:00', 
          type: 'attraction', 
          name: '景点A', 
          location: { address: '地址A', lat: 35.6, lng: 139.7 }, 
          description: '描述', 
          cost: 100, 
          duration: 60, 
          order_idx: 1 
        }
      ]
      const mockExpenses = [
        { 
          id: 'expense-1', 
          itinerary_id: 'test-id', 
          category: 'food', 
          amount: 100, 
          expense_date: '2024-01-01', 
          description: '午餐' 
        }
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

  describe('getItineraryItems', () => {
    it('应该成功获取行程项列表', async () => {
      const mockItems = [
        { id: 'item-1', itinerary_id: 'itinerary-1', day: 1, order_idx: 0, name: '景点A' },
        { id: 'item-2', itinerary_id: 'itinerary-1', day: 1, order_idx: 1, name: '景点B' }
      ]
      const mockResult = { data: mockItems, error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraryItems('itinerary-1')

      expect(result).toEqual(mockItems)
      expect(mockQuery.eq).toHaveBeenCalledWith('itinerary_id', 'itinerary-1')
    })

    it('应该返回空数组当没有行程项', async () => {
      const mockResult = { data: null, error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await itineraryService.getItineraryItems('itinerary-1')

      expect(result).toEqual([])
    })

    it('应该处理获取失败', async () => {
      const mockResult = { data: null, error: { message: '获取失败', code: 'DB_ERROR' } }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve)
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      await expect(
        itineraryService.getItineraryItems('itinerary-1')
      ).rejects.toThrow('获取行程项失败')
    })
  })

  describe('createItineraryItem', () => {
    const mockItem = {
      id: 'item-1',
      itinerary_id: 'itinerary-1',
      day: 1,
      time: '09:00',
      type: 'attraction',
      name: '测试景点',
      location: { address: '测试地址', lat: 0, lng: 0 },
      description: null,
      cost: null,
      duration: null,
      tips: null,
      image_url: null,
      order_idx: 0,
      created_at: '2024-01-01T00:00:00Z'
    }

    it('应该成功创建行程项', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockItem,
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await itineraryService.createItineraryItem({
        itinerary_id: 'itinerary-1',
        day: 1,
        time: '09:00',
        type: 'attraction',
        name: '测试景点',
        location: { address: '测试地址', lat: 0, lng: 0 },
        order_idx: 0
      })

      expect(result).toEqual(mockItem)
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
        itineraryService.createItineraryItem({
          itinerary_id: 'itinerary-1',
          day: 1,
          time: '09:00',
          type: 'attraction',
          name: '测试景点',
          location: { address: '测试地址', lat: 0, lng: 0 },
          order_idx: 0
        })
      ).rejects.toThrow('创建行程项失败')
    })

    it('应该抛出 SupabaseError 当创建失败', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: '数据库错误', code: 'DB_ERROR' }
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await expect(
        itineraryService.createItineraryItem({
          itinerary_id: 'itinerary-1',
          day: 1,
          name: '测试景点',
          time: '09:00',
          type: 'attraction',
          location: { address: '', lat: 0, lng: 0 },
          order_idx: 0
        })
      ).rejects.toThrow()
    })
  })

  describe('updateItineraryItem', () => {
    const mockItem = {
      id: 'item-1',
      itinerary_id: 'itinerary-1',
      day: 1,
      time: '09:00',
      type: 'attraction',
      name: '更新后的景点',
      location: { address: '测试地址', lat: 0, lng: 0 },
      description: null,
      cost: null,
      duration: null,
      tips: null,
      image_url: null,
      order_idx: 0,
      created_at: '2024-01-01T00:00:00Z'
    }

    it('应该成功更新行程项', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockItem,
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await itineraryService.updateItineraryItem('item-1', {
        name: '更新后的景点'
      })

      expect(result.name).toBe('更新后的景点')
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('应该返回更新后的行程项', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockItem,
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await itineraryService.updateItineraryItem('item-1', {
        name: '更新后的景点'
      })

      expect(result).toEqual(mockItem)
    })

    it('应该处理更新失败', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: '更新失败', code: 'DB_ERROR' }
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.updateItineraryItem('item-1', { name: '更新后的景点' })
      ).rejects.toThrow('更新行程项失败')
    })

    it('应该抛出 SupabaseError 当更新失败', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: '数据库错误', code: 'DB_ERROR' }
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.updateItineraryItem('item-1', { name: '更新后的景点' })
      ).rejects.toThrow()
    })

    it('应该处理不存在的行程项', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' }
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.updateItineraryItem('non-existent', { name: '更新' })
      ).rejects.toThrow()
    })
  })

  describe('deleteItineraryItem', () => {
    it('应该成功删除行程项', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.deleteItineraryItem('item-1')
      ).resolves.not.toThrow()
    })

    it('应该处理删除失败', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: '删除失败', code: 'DB_ERROR' }
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.deleteItineraryItem('item-1')
      ).rejects.toThrow('删除行程项失败')
    })

    it('应该抛出 SupabaseError 当删除失败', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: '数据库错误', code: 'DB_ERROR' }
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.deleteItineraryItem('item-1')
      ).rejects.toThrow()
    })
  })

  describe('batchCreateItineraryItems', () => {
    const mockItems = [
      { id: 'item-1', itinerary_id: 'itinerary-1', day: 1, name: '景点A', time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0, created_at: '2024-01-01T00:00:00Z' },
      { id: 'item-2', itinerary_id: 'itinerary-1', day: 1, name: '景点B', time: '10:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 1, created_at: '2024-01-01T00:00:00Z' }
    ]

    it('应该成功批量创建行程项', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await itineraryService.batchCreateItineraryItems([
        { itinerary_id: 'itinerary-1', day: 1, name: '景点A', time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0 },
        { itinerary_id: 'itinerary-1', day: 1, name: '景点B', time: '10:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 1 }
      ])

      expect(result).toEqual(mockItems)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('应该返回创建的行程项数组', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await itineraryService.batchCreateItineraryItems([
        { itinerary_id: 'itinerary-1', day: 1, name: '景点A', time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0 }
      ])

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
    })

    it('应该处理批量创建失败', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: '批量创建失败', code: 'DB_ERROR' }
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      await expect(
        itineraryService.batchCreateItineraryItems([
          { itinerary_id: 'itinerary-1', day: 1, name: '景点A', time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0 }
        ])
      ).rejects.toThrow('批量创建行程项失败')
    })

    it('应该正确处理空数组', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await itineraryService.batchCreateItineraryItems([])

      expect(result).toEqual([])
    })
  })

  describe('batchUpdateItineraryItems', () => {
    const mockItem = {
      id: 'item-1',
      itinerary_id: 'itinerary-1',
      day: 1,
      time: '09:00',
      type: 'attraction',
      name: '更新后的景点',
      location: { address: '测试地址', lat: 0, lng: 0 },
      description: null,
      cost: null,
      duration: null,
      tips: null,
      image_url: null,
      order_idx: 0,
      created_at: '2024-01-01T00:00:00Z'
    }

    it('应该成功批量更新行程项', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockItem,
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await itineraryService.batchUpdateItineraryItems([
        { id: 'item-1', data: { name: '更新后的景点' } }
      ])

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('更新后的景点')
    })

    it('应该返回更新后的行程项数组', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockItem,
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await itineraryService.batchUpdateItineraryItems([
        { id: 'item-1', data: { name: '更新1' } },
        { id: 'item-2', data: { name: '更新2' } }
      ])

      expect(Array.isArray(result)).toBe(true)
    })

    it('应该处理批量更新失败', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: '更新失败', code: 'DB_ERROR' }
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.batchUpdateItineraryItems([
          { id: 'item-1', data: { name: '更新' } }
        ])
      ).rejects.toThrow()
    })

    it('应该正确处理空数组', async () => {
      const result = await itineraryService.batchUpdateItineraryItems([])

      expect(result).toEqual([])
    })
  })

  describe('batchDeleteItineraryItems', () => {
    it('应该成功批量删除行程项', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.batchDeleteItineraryItems(['item-1', 'item-2'])
      ).resolves.not.toThrow()
    })

    it('应该处理批量删除失败', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          error: { message: '批量删除失败', code: 'DB_ERROR' }
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.batchDeleteItineraryItems(['item-1', 'item-2'])
      ).rejects.toThrow('批量删除行程项失败')
    })

    it('应该正确处理空数组', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        itineraryService.batchDeleteItineraryItems([])
      ).resolves.not.toThrow()
    })
  })

  describe('reorderItineraryItems', () => {
    it('应该成功重排序行程项', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.reorderItineraryItems('itinerary-1', [
          { id: 'item-1', day: 1, order_idx: 0 },
          { id: 'item-2', day: 1, order_idx: 1 }
        ])
      ).resolves.not.toThrow()
    })

    it('应该更新 day 和 order_idx', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await itineraryService.reorderItineraryItems('itinerary-1', [
        { id: 'item-1', day: 2, order_idx: 5 }
      ])

      expect(mockUpdate).toHaveBeenCalledWith({ day: 2, order_idx: 5 })
    })

    it('应该处理重排序异常', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('数据库异常'))
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      await expect(
        itineraryService.reorderItineraryItems('itinerary-1', [
          { id: 'item-1', day: 1, order_idx: 0 }
        ])
      ).rejects.toThrow('重排序行程项失败')
    })

    it('应该正确处理空数组', async () => {
      await expect(
        itineraryService.reorderItineraryItems('itinerary-1', [])
      ).resolves.not.toThrow()
    })
  })

  describe('buildDailySchedule', () => {
    it('应该正确构建每日行程', () => {
      const items = [
        { id: 'item-1', day: 1, name: '景点A', time: '09:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0, itinerary_id: 'itinerary-1', created_at: '2024-01-01T00:00:00Z' } as itineraryService.ItineraryItem,
        { id: 'item-2', day: 2, name: '景点B', time: '10:00', type: 'attraction', location: { address: '', lat: 0, lng: 0 }, order_idx: 0, itinerary_id: 'itinerary-1', created_at: '2024-01-01T00:00:00Z' } as itineraryService.ItineraryItem
      ]

      const result = itineraryService.buildDailySchedule('2024-01-01', '2024-01-02', items)

      expect(result).toHaveLength(2)
      expect(result[0].day).toBe(1)
      expect(result[0].items).toHaveLength(1)
      expect(result[1].day).toBe(2)
      expect(result[1].items).toHaveLength(1)
    })

    it('应该包含正确的日期信息', () => {
      const result = itineraryService.buildDailySchedule('2024-01-01', '2024-01-01', [])

      expect(result[0].date).toBe('2024-01-01')
      expect(result[0].dayOfWeek).toBe('星期一')
    })

    it('应该正确处理空行程项', () => {
      const result = itineraryService.buildDailySchedule('2024-01-01', '2024-01-03', [])

      expect(result).toHaveLength(3)
      expect(result.every(day => day.items.length === 0)).toBe(true)
    })
  })

  describe('buildBudgetBreakdown', () => {
    it('应该正确构建预算明细', () => {
      const items = [
        { id: 'item-1', type: 'transport', cost: 100 } as itineraryService.ItineraryItem,
        { id: 'item-2', type: 'restaurant', cost: 200 } as itineraryService.ItineraryItem,
        { id: 'item-3', type: 'attraction', cost: 150 } as itineraryService.ItineraryItem
      ]

      const result = itineraryService.buildBudgetBreakdown(items)

      expect(result.transport).toBe(100)
      expect(result.food).toBe(200)
      expect(result.tickets).toBe(150)
      expect(result.total).toBe(450)
    })

    it('应该正确处理空数组', () => {
      const result = itineraryService.buildBudgetBreakdown([])

      expect(result.total).toBe(0)
    })

    it('应该正确处理 null cost', () => {
      const items = [
        { id: 'item-1', type: 'attraction', cost: null } as itineraryService.ItineraryItem
      ]

      const result = itineraryService.buildBudgetBreakdown(items)

      expect(result.total).toBe(0)
    })
  })
})
