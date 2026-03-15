/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabase'
import * as settingsService from './settings'
import * as crypto from '@/utils/crypto'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
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

vi.mock('@/utils/crypto', () => ({
  encryptApiKey: vi.fn((key: string) => `encrypted-${key}`),
  decryptApiKey: vi.fn((key: string | null) => key ? key.replace('encrypted-', '') : null)
}))

describe('Settings Service', () => {
  const mockSettings = {
    id: 'settings-id',
    user_id: 'user-id',
    zhipu_api_key: 'encrypted-zhipu-key',
    xunfei_api_key: 'encrypted-xunfei-key',
    amap_api_key: 'encrypted-amap-key',
    theme: 'light' as const,
    language: 'zh' as const,
    notifications: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserSettings', () => {
    it('应该成功获取用户设置', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSettings,
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await settingsService.getUserSettings('user-id')

      expect(result).toEqual(mockSettings)
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-id')
    })

    it('应该返回null当用户设置不存在', async () => {
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

      const result = await settingsService.getUserSettings('user-id')

      expect(result).toBeNull()
    })
  })

  describe('createUserSettings', () => {
    it('应该成功创建用户设置', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockSettings,
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      const result = await settingsService.createUserSettings('user-id', {
        theme: 'dark'
      })

      expect(result).toEqual(mockSettings)
      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('updateUserSettings', () => {
    it('应该成功更新用户设置', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, theme: 'dark' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateUserSettings('user-id', {
        theme: 'dark'
      })

      expect(result.theme).toBe('dark')
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe('updateApiKey', () => {
    it('应该成功更新智谱AI API Key', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, zhipu_api_key: 'encrypted-new-key' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateApiKey('user-id', 'zhipu', 'new-key')

      expect(result.zhipu_api_key).toBe('encrypted-new-key')
      expect(crypto.encryptApiKey).toHaveBeenCalledWith('new-key')
    })

    it('应该成功更新科大讯飞 API Key', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, xunfei_api_key: 'encrypted-new-key' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateApiKey('user-id', 'xunfei', 'new-key')

      expect(result.xunfei_api_key).toBe('encrypted-new-key')
    })

    it('应该成功更新高德地图 API Key', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, amap_api_key: 'encrypted-new-key' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateApiKey('user-id', 'amap', 'new-key')

      expect(result.amap_api_key).toBe('encrypted-new-key')
    })

    it('应该拒绝空的 API Key', async () => {
      await expect(
        settingsService.updateApiKey('user-id', 'zhipu', '')
      ).rejects.toThrow('API Key 不能为空')
    })
  })

  describe('getApiKey', () => {
    it('应该成功获取并解密智谱AI API Key', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSettings,
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await settingsService.getApiKey('user-id', 'zhipu')

      expect(result).toBe('zhipu-key')
      expect(crypto.decryptApiKey).toHaveBeenCalledWith('encrypted-zhipu-key')
    })

    it('应该返回null当API Key不存在', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockSettings, zhipu_api_key: null },
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await settingsService.getApiKey('user-id', 'zhipu')

      expect(result).toBeNull()
    })
  })

  describe('deleteApiKey', () => {
    it('应该成功删除智谱AI API Key', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, zhipu_api_key: null },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.deleteApiKey('user-id', 'zhipu')

      expect(result.zhipu_api_key).toBeNull()
    })
  })

  describe('updateTheme', () => {
    it('应该成功更新主题设置', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, theme: 'dark' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateTheme('user-id', 'dark')

      expect(result.theme).toBe('dark')
    })
  })

  describe('updateLanguage', () => {
    it('应该成功更新语言设置', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, language: 'en' },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateLanguage('user-id', 'en')

      expect(result.language).toBe('en')
    })
  })

  describe('updateNotifications', () => {
    it('应该成功更新通知设置', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockSettings, notifications: false },
              error: null
            })
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      const result = await settingsService.updateNotifications('user-id', false)

      expect(result.notifications).toBe(false)
    })
  })

  describe('getOrCreateUserSettings', () => {
    it('应该返回现有设置当设置已存在', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSettings,
          error: null
        })
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any)

      const result = await settingsService.getOrCreateUserSettings('user-id')

      expect(result).toEqual(mockSettings)
    })

    it('应该创建新设置当设置不存在', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' }
        })
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockSettings,
            error: null
          })
        })
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
        insert: mockInsert
      } as any)

      const result = await settingsService.getOrCreateUserSettings('user-id')

      expect(result).toEqual(mockSettings)
      expect(mockInsert).toHaveBeenCalled()
    })
  })
})
