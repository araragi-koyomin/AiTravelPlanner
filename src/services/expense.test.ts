import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabase'
import * as expenseService from './expense'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
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
        in: vi.fn()
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

describe('Expense Service', () => {
  const mockExpense = {
    id: 'test-id',
    itinerary_id: 'itinerary-id',
    category: 'food' as const,
    amount: 100,
    expense_date: '2024-01-01',
    description: '午餐',
    payment_method: null,
    receipt_url: null,
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createExpense', () => {
    it('应该成功创建费用记录', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockExpense,
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await expenseService.createExpense({
        itinerary_id: 'itinerary-id',
        category: 'food',
        amount: 100,
        expense_date: '2024-01-01',
        description: '午餐'
      })

      expect(result).toEqual(mockExpense)
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
        expenseService.createExpense({
          itinerary_id: 'itinerary-id',
          category: 'food',
          amount: 100,
          expense_date: '2024-01-01',
          description: '午餐'
        })
      ).rejects.toThrow('创建费用记录失败')
    })
  })

  describe('getExpenses', () => {
    it('应该成功获取费用列表', async () => {
      const mockResult = { data: [mockExpense], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
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

      const result = await expenseService.getExpenses('itinerary-id')

      expect(result).toEqual([mockExpense])
      expect(mockQuery.eq).toHaveBeenCalledWith('itinerary_id', 'itinerary-id')
    })

    it('应该支持筛选条件', async () => {
      const mockResult = { data: [mockExpense], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
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

      const result = await expenseService.getExpenses('itinerary-id', {
        category: 'food',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        orderBy: 'expense_date',
        orderDirection: 'desc',
        limit: 10,
        offset: 0
      })

      expect(result).toEqual([mockExpense])
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'food')
      expect(mockQuery.gte).toHaveBeenCalledWith('expense_date', '2024-01-01')
      expect(mockQuery.lte).toHaveBeenCalledWith('expense_date', '2024-01-31')
    })
  })

  describe('getExpenseById', () => {
    it('应该成功获取单个费用记录', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockExpense,
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await expenseService.getExpenseById('test-id')

      expect(result).toEqual(mockExpense)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
    })

    it('应该返回null当费用记录不存在', async () => {
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

      const result = await expenseService.getExpenseById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('updateExpense', () => {
    it('应该成功更新费用记录', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockExpense, amount: 200 },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await expenseService.updateExpense('test-id', {
        amount: 200
      })

      expect(result.amount).toBe(200)
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe('deleteExpense', () => {
    it('应该成功删除费用记录', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        expenseService.deleteExpense('test-id')
      ).resolves.not.toThrow()
    })
  })

  describe('createExpenses', () => {
    it('应该成功批量创建费用记录', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [mockExpense],
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await expenseService.createExpenses([
        {
          itinerary_id: 'itinerary-id',
          category: 'food',
          amount: 100,
          expense_date: '2024-01-01',
          description: '午餐'
        }
      ])

      expect(result).toEqual([mockExpense])
      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('deleteExpenses', () => {
    it('应该成功批量删除费用记录', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          error: null
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete
      } as any)

      await expect(
        expenseService.deleteExpenses(['id1', 'id2'])
      ).resolves.not.toThrow()
    })
  })

  describe('getExpenseStats', () => {
    it('应该成功获取费用统计', async () => {
      const mockResult = { data: [mockExpense], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
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

      const result = await expenseService.getExpenseStats('itinerary-id')

      expect(result).toHaveProperty('totalAmount')
      expect(result).toHaveProperty('amountByCategory')
      expect(result).toHaveProperty('amountByDate')
      expect(result).toHaveProperty('averageDailyAmount')
    })
  })

  describe('getExpenseSummary', () => {
    it('应该成功获取费用汇总', async () => {
      const mockResult = { data: [mockExpense], error: null }
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
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

      const result = await expenseService.getExpenseSummary('itinerary-id')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('category')
      expect(result[0]).toHaveProperty('amount')
      expect(result[0]).toHaveProperty('percentage')
    })
  })
})
