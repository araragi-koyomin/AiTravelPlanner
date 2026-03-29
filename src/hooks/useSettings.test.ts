import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSettings } from './useSettings'
import * as settingsService from '@/services/settings'

vi.mock('@/services/settings', () => ({
  getOrCreateUserSettings: vi.fn(),
  updateApiKey: vi.fn(),
  updateXunfeiCredentials: vi.fn(),
  updateAmapCredentials: vi.fn(),
  deleteApiKey: vi.fn(),
  getApiKey: vi.fn(),
  getXunfeiCredentials: vi.fn(),
  getAmapCredentials: vi.fn(),
  updateTheme: vi.fn(),
  updateLanguage: vi.fn(),
  updateNotifications: vi.fn()
}))

const mockUserSettings = {
  id: 'settings-id',
  user_id: 'test-user-id',
  zhipu_api_key: 'encrypted-zhipu-key',
  xunfei_api_key: null,
  xunfei_app_id: null,
  xunfei_api_secret: null,
  amap_api_key: 'encrypted-amap-key',
  amap_security_js_code: null,
  theme: 'light' as const,
  language: 'zh' as const,
  notifications: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should have correct initial loading state', () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockImplementation(
        () => new Promise(() => {})
      )

      const { result } = renderHook(() => useSettings('test-user-id'))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.settings).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should not load when userId is undefined', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.settings).toBeNull()
      expect(settingsService.getOrCreateUserSettings).not.toHaveBeenCalled()
    })

    it('should successfully fetch user settings', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings).toEqual(mockUserSettings)
      expect(result.current.error).toBeNull()
      expect(settingsService.getOrCreateUserSettings).toHaveBeenCalledWith('test-user-id')
    })

    it('should auto-create settings when not found', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(settingsService.getOrCreateUserSettings).toHaveBeenCalledWith('test-user-id')
    })

    it('should handle fetch settings failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings).toBeNull()
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('updateApiKey', () => {
    it('should successfully update API Key', async () => {
      const updatedSettings = { ...mockUserSettings, zhipu_api_key: 'new-encrypted-key' }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateApiKey).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateApiKey('zhipu', 'new-api-key')
      })

      expect(settingsService.updateApiKey).toHaveBeenCalledWith('test-user-id', 'zhipu', 'new-api-key')
      expect(result.current.settings).toEqual(updatedSettings)
    })

    it('should throw error when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      await expect(
        result.current.updateApiKey('zhipu', 'new-api-key')
      ).rejects.toThrow('用户未登录')
    })

    it('should handle update failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateApiKey).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(
          result.current.updateApiKey('zhipu', 'new-api-key')
        ).rejects.toThrow('Update failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Update failed')
      })
    })

    it('should update local state after successful update', async () => {
      const updatedSettings = { ...mockUserSettings, amap_api_key: 'new-amap-key' }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateApiKey).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateApiKey('amap', 'new-amap-key')
      })

      expect(result.current.settings?.amap_api_key).toBe('new-amap-key')
    })
  })

  describe('updateXunfeiCredentials', () => {
    it('should successfully update Xunfei credentials', async () => {
      const updatedSettings = { 
        ...mockUserSettings, 
        xunfei_app_id: 'new-app-id',
        xunfei_api_key: 'new-api-key',
        xunfei_api_secret: 'new-secret'
      }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateXunfeiCredentials).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateXunfeiCredentials({
          appId: 'new-app-id',
          apiKey: 'new-api-key',
          apiSecret: 'new-secret'
        })
      })

      expect(settingsService.updateXunfeiCredentials).toHaveBeenCalledWith('test-user-id', {
        appId: 'new-app-id',
        apiKey: 'new-api-key',
        apiSecret: 'new-secret'
      })
      expect(result.current.settings).toEqual(updatedSettings)
    })

    it('should throw error when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      await expect(
        result.current.updateXunfeiCredentials({ appId: 'a', apiKey: 'b', apiSecret: 'c' })
      ).rejects.toThrow('用户未登录')
    })
  })

  describe('updateAmapCredentials', () => {
    it('should successfully update Amap credentials', async () => {
      const updatedSettings = { 
        ...mockUserSettings, 
        amap_api_key: 'new-key',
        amap_security_js_code: 'new-code'
      }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateAmapCredentials).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateAmapCredentials({
          key: 'new-key',
          securityJsCode: 'new-code'
        })
      })

      expect(settingsService.updateAmapCredentials).toHaveBeenCalledWith('test-user-id', {
        key: 'new-key',
        securityJsCode: 'new-code'
      })
      expect(result.current.settings).toEqual(updatedSettings)
    })

    it('should throw error when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      await expect(
        result.current.updateAmapCredentials({ key: 'key' })
      ).rejects.toThrow('用户未登录')
    })
  })

  describe('deleteApiKey', () => {
    it('should successfully delete API Key', async () => {
      const updatedSettings = { ...mockUserSettings, zhipu_api_key: null }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.deleteApiKey).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteApiKey('zhipu')
      })

      expect(settingsService.deleteApiKey).toHaveBeenCalledWith('test-user-id', 'zhipu')
      expect(result.current.settings?.zhipu_api_key).toBeNull()
    })

    it('should throw error when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      await expect(result.current.deleteApiKey('zhipu')).rejects.toThrow('用户未登录')
    })

    it('should handle delete failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.deleteApiKey).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.deleteApiKey('zhipu')).rejects.toThrow('Delete failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed')
      })
    })
  })

  describe('getDecryptedApiKey', () => {
    it('should successfully get decrypted API Key', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.getApiKey).mockResolvedValue('decrypted-key')

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const key = await result.current.getDecryptedApiKey('zhipu')

      expect(key).toBe('decrypted-key')
      expect(settingsService.getApiKey).toHaveBeenCalledWith('test-user-id', 'zhipu')
    })

    it('should return null when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      const key = await result.current.getDecryptedApiKey('zhipu')

      expect(key).toBeNull()
    })

    it('should return null on failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.getApiKey).mockRejectedValue(new Error('Get failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const key = await result.current.getDecryptedApiKey('zhipu')

      expect(key).toBeNull()
    })
  })

  describe('getDecryptedXunfeiCredentials', () => {
    it('should successfully get decrypted Xunfei credentials', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.getXunfeiCredentials).mockResolvedValue({
        appId: 'app-id',
        apiKey: 'api-key',
        apiSecret: 'api-secret'
      })

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const creds = await result.current.getDecryptedXunfeiCredentials()

      expect(creds).toEqual({
        appId: 'app-id',
        apiKey: 'api-key',
        apiSecret: 'api-secret'
      })
      expect(settingsService.getXunfeiCredentials).toHaveBeenCalledWith('test-user-id')
    })

    it('should return null when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      const creds = await result.current.getDecryptedXunfeiCredentials()

      expect(creds).toBeNull()
    })
  })

  describe('getDecryptedAmapCredentials', () => {
    it('should successfully get decrypted Amap credentials', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.getAmapCredentials).mockResolvedValue({
        key: 'amap-key',
        securityJsCode: 'security-code'
      })

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const creds = await result.current.getDecryptedAmapCredentials()

      expect(creds).toEqual({
        key: 'amap-key',
        securityJsCode: 'security-code'
      })
      expect(settingsService.getAmapCredentials).toHaveBeenCalledWith('test-user-id')
    })

    it('should return null when userId is empty', async () => {
      const { result } = renderHook(() => useSettings(undefined))

      const creds = await result.current.getDecryptedAmapCredentials()

      expect(creds).toBeNull()
    })
  })

  describe('updateTheme', () => {
    it('should successfully update theme to light', async () => {
      const updatedSettings = { ...mockUserSettings, theme: 'light' as const }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateTheme).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateTheme('light')
      })

      expect(settingsService.updateTheme).toHaveBeenCalledWith('test-user-id', 'light')
      expect(result.current.settings?.theme).toBe('light')
    })

    it('should successfully update theme to dark', async () => {
      const updatedSettings = { ...mockUserSettings, theme: 'dark' as const }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateTheme).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateTheme('dark')
      })

      expect(settingsService.updateTheme).toHaveBeenCalledWith('test-user-id', 'dark')
      expect(result.current.settings?.theme).toBe('dark')
    })

    it('should handle update failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateTheme).mockRejectedValue(new Error('Theme update failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.updateTheme('dark')).rejects.toThrow('Theme update failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Theme update failed')
      })
    })
  })

  describe('updateLanguage', () => {
    it('should successfully update language to zh', async () => {
      const updatedSettings = { ...mockUserSettings, language: 'zh' as const }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateLanguage).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateLanguage('zh')
      })

      expect(settingsService.updateLanguage).toHaveBeenCalledWith('test-user-id', 'zh')
      expect(result.current.settings?.language).toBe('zh')
    })

    it('should successfully update language to en', async () => {
      const updatedSettings = { ...mockUserSettings, language: 'en' as const }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateLanguage).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateLanguage('en')
      })

      expect(settingsService.updateLanguage).toHaveBeenCalledWith('test-user-id', 'en')
      expect(result.current.settings?.language).toBe('en')
    })

    it('should handle update failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateLanguage).mockRejectedValue(new Error('Language update failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.updateLanguage('en')).rejects.toThrow('Language update failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Language update failed')
      })
    })
  })

  describe('updateNotifications', () => {
    it('should successfully enable notifications', async () => {
      const updatedSettings = { ...mockUserSettings, notifications: true }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateNotifications).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateNotifications(true)
      })

      expect(settingsService.updateNotifications).toHaveBeenCalledWith('test-user-id', true)
      expect(result.current.settings?.notifications).toBe(true)
    })

    it('should successfully disable notifications', async () => {
      const updatedSettings = { ...mockUserSettings, notifications: false }
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateNotifications).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateNotifications(false)
      })

      expect(settingsService.updateNotifications).toHaveBeenCalledWith('test-user-id', false)
      expect(result.current.settings?.notifications).toBe(false)
    })

    it('should handle update failure', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)
      vi.mocked(settingsService.updateNotifications).mockRejectedValue(new Error('Notifications update failed'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.updateNotifications(false)).rejects.toThrow('Notifications update failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Notifications update failed')
      })
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockRejectedValue(new Error('Initial error'))

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error')
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('refreshSettings', () => {
    it('should re-fetch settings', async () => {
      vi.mocked(settingsService.getOrCreateUserSettings).mockResolvedValue(mockUserSettings)

      const { result } = renderHook(() => useSettings('test-user-id'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(settingsService.getOrCreateUserSettings).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refreshSettings()
      })

      expect(settingsService.getOrCreateUserSettings).toHaveBeenCalledTimes(2)
    })
  })
})
